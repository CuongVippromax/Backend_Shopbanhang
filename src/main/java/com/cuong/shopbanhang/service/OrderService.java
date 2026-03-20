package com.cuong.shopbanhang.service;



import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;
import com.cuong.shopbanhang.dto.request.CheckoutRequest;
import com.cuong.shopbanhang.dto.response.OrderItemResponse;
import com.cuong.shopbanhang.dto.response.OrderResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Cart;
import com.cuong.shopbanhang.model.CartItem;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.model.OrderDetail;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.CartRepository;
import com.cuong.shopbanhang.repository.CartItemRepository;
import com.cuong.shopbanhang.repository.OrderRepository;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.SecurityUtils;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;




@Service
@RequiredArgsConstructor
@Slf4j(topic = "OrderService")
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final EmailService emailService;

    @PersistenceContext
    private EntityManager entityManager;
    
    @Transactional
    public Order checkout(CheckoutRequest request) {
       
        
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
       
        
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        
        Cart cart = cartRepository.findByUser_UserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));

        
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // KIỂM TRA TỒN KHO TRƯỚC KHI CHECKOUT
        for (CartItem item : cart.getCartItems()) {
            Book book = item.getBook();
            if (book.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sách '" + book.getBookName() + "' không đủ hàng trong kho. Còn lại: " + book.getQuantity() + " quyển");
            }
        }
        
        // TRỪ TỒN KHO SAU KHI KIỂM TRA THÀNH CÔNG
        for (CartItem item : cart.getCartItems()) {
            Book book = item.getBook();
            book.setQuantity(book.getQuantity() - item.getQuantity());
            bookRepository.save(book);
        }
        
        Double totalPrice = cart.getCartItems().stream()
        .map(item -> item.getBook().getPrice().doubleValue() * item.getQuantity())
        .reduce(0.0, Double::sum);
        OrderDetail orderDetail = OrderDetail.builder()
        .items(cart.getCartItems().stream().toList())
        .totalPrice(totalPrice)
        .build();

        // Xác định paymentStatus dựa trên phương thức thanh toán
        // Tất cả đơn hàng đều bắt đầu với PENDING, sau đó:
        // - COD: thanh toán khi nhận hàng -> PAID khi giao hàng thành công
        // - VNPAY: chờ VNPay xác nhận thanh toán thành công -> PAID trong callback
        // KHÔNG gửi email xác nhận ở đây - chỉ gửi sau khi thanh toán thành công
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        
        Order order =  Order.builder()
        .user(user)
        .orderDate(LocalDateTime.now())
        .totalAmount(totalPrice)
        .paymentStatus(paymentStatus)
        .recipientName(request.getFullName())
        .recipientPhone(request.getPhone())
        .shippingAddress(request.getShippingAddress())
        .paymentMethod(request.getPaymentMethod())
        .orderDetails(orderDetail)
        .orderStatus(OrderStatus.PENDING)
        .build();   
        orderDetail.setOrder(order);
        
        // Link từng CartItem -> OrderDetail
        for (CartItem item : cart.getCartItems()) {
            item.setOrderDetail(orderDetail);
            item.setCart(null);
        }
        
        // Save (cascade sẽ lưu OrderDetail và CartItem)
        Order savedOrder = orderRepository.save(order);
        
        // Xóa giỏ hàng sau khi checkout
        cart.getCartItems().clear();
        cartRepository.save(cart);
        
        
        
        return savedOrder;

    }
    
    @Transactional
    public void cancelAndDeleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Chỉ hủy và xóa đơn nếu chưa thanh toán thành công
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            log.warn("Cannot delete order {} - already paid", orderId);
            throw new RuntimeException("Không thể xóa đơn hàng đã thanh toán thành công");
        }

        Long userId = order.getUser() != null ? order.getUser().getUserId() : null;

        List<CartItem> itemsToRestore = null;
        if (order.getOrderDetails() != null && order.getOrderDetails().getItems() != null) {
            itemsToRestore = new java.util.ArrayList<>(order.getOrderDetails().getItems());
        }

        // Bước 1: Null orderDetail reference trong mỗi CartItem TRƯỚC KHI xóa OrderDetail
        if (itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                item.setOrderDetail(null);
            }
            // Save tất cả CartItems để persist thay đổi order_detail_id = null
            cartItemRepository.saveAll(itemsToRestore);
            entityManager.flush();
            log.info("Updated {} CartItems to remove orderDetail reference", itemsToRestore.size());
        }

        // Bước 2: Hoàn lại tồn kho
        if (itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                Book book = item.getBook();
                book.setQuantity(book.getQuantity() + item.getQuantity());
                bookRepository.save(book);
            }
            entityManager.flush();
            log.info("Restored inventory for {} items", itemsToRestore.size());
        }

        // Bước 3: Fetch lại Cart từ DB sau khi đã flush
        Cart userCart = userId != null ? cartRepository.findByUser_UserId(userId).orElse(null) : null;

        // Bước 4: Khôi phục sản phẩm vào giỏ hàng
        if (userCart != null && itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                // Kiểm tra sách đã có trong giỏ chưa — nếu có thì cộng dồn số lượng
                var existing = cartItemRepository.findByCart_CartIdAndBook_BookId(
                        userCart.getCartId(), item.getBook().getBookId());
                if (existing.isPresent()) {
                    CartItem existingItem = existing.get();
                    existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                    cartItemRepository.save(existingItem);
                } else {
                    // Cập nhật cart_id cho CartItem đã được null order_detail_id
                    item.setCart(userCart);
                    cartItemRepository.save(item);
                }
            }
            entityManager.flush();
            log.info("Restored {} items to cart", itemsToRestore.size());
        }

        // Bước 5: Break bidirectional link và xóa Order
        order.setOrderDetails(null);
        orderRepository.save(order);
        orderRepository.delete(order);

        // Bước 6: Clear persistence context để đảm bảo các fetch tiếp theo lấy dữ liệu mới
        entityManager.clear();
    }
    
    @Transactional
    public Order cancelOrder(Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        boolean isAdmin = SecurityUtils.hasRole("ADMIN"); // Giả sử có method này
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Kiểm tra quyền: chủ order HOẶC admin
        boolean isOwner = order.getUser().getUserId().equals(userId);
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You don't have permission to cancel this order");
        }
        
        // Kiểm tra trạng thái có thể hủy không
        if (order.getOrderStatus() == OrderStatus.SHIPPED) {
            throw new RuntimeException("Cannot cancel order that is shipped");
        }
        
        // HOÀN LẠI TỒN KHO khi hủy đơn (chỉ khi đơn chưa bị hủy trước đó)
        if (order.getOrderStatus() != OrderStatus.CANCELLED && order.getOrderDetails() != null) {
            for (CartItem item : order.getOrderDetails().getItems()) {
                Book book = item.getBook();
                book.setQuantity(book.getQuantity() + item.getQuantity());
                bookRepository.save(book);
            }
        }
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<List<OrderResponse>> getOrdersByUser(int page, int size) {
        if(page > 0) {
            page = page - 1;
        }
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUser_UserId(userId, pageable);
        
        List<OrderResponse> orderResponses = orders.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
        return PageResponse.<List<OrderResponse>>builder()
        .pageNo(page)
        .pageSize(size)
        .totalElements(orders.getTotalElements())
        .totalPages(orders.getTotalPages())
        .data(orderResponses)
        .build();
    }
    
    public PageResponse<List<OrderResponse>> getAllOrders(int page, int size, String sort, String search, String startDate, String endDate) {
       if(page > 0) {
        page = page - 1;
       }
       
       // Parse sort
       String sortField = "orderDate";
       Sort.Direction direction = Sort.Direction.ASC;
       
       if (StringUtils.hasLength(sort)) {
           String[] parts = sort.split(":");
           sortField = parts[0];
           if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
               direction = Sort.Direction.DESC;
           }
       }
       
       Sort sortObj = Sort.by(direction, sortField);
       Pageable pageable = PageRequest.of(page, size, sortObj);
       
       Page<Order> orders = orderRepository.searchOrders(search, pageable);
       
       List<OrderResponse> orderResponses = orders.getContent().stream()
               .map(this::toOrderResponse)
               .collect(Collectors.toList());
       
       return PageResponse.<List<OrderResponse>>builder()
           .pageNo(page)
           .pageSize(size)
           .totalElements(orders.getTotalElements())
           .totalPages(orders.getTotalPages())
           .data(orderResponses)
           .build();
    }
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order updatePaymentStatus(Long orderId, PaymentStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }
    
    // Chuyển Order sang OrderResponse
    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = null;
        if (order.getOrderDetails() != null && order.getOrderDetails().getItems() != null) {
            items = order.getOrderDetails().getItems().stream()
                .filter(item -> item.getBook() != null)
                .map(item -> OrderItemResponse.builder()
                    .cartItemId(item.getCartItemId())
                    .bookId(item.getBook().getBookId())
                    .bookName(item.getBook().getBookName())
                    .price(item.getBook().getPrice() != null ? item.getBook().getPrice().doubleValue() : 0.0)
                    .quantity(item.getQuantity())
                    .totalPrice(item.getBook().getPrice() != null ? item.getBook().getPrice().doubleValue() * item.getQuantity() : 0.0)
                    .image(item.getBook().getImage())
                    .build())
                .collect(Collectors.toList());
        }
        
        String displayName = order.getRecipientName() != null && !order.getRecipientName().isBlank()
                ? order.getRecipientName()
                : (order.getUser() != null ? order.getUser().getFullName() : null);
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser() != null ? order.getUser().getUserId() : null)
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .fullName(displayName)
                .recipientPhone(order.getRecipientPhone())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .build();
    }
    
    // Lấy đơn hàng theo ID (full OrderResponse cho trang chi tiết)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Long userId = SecurityUtils.getCurrentUserId().orElse(null);
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        if (userId != null && !order.getUser().getUserId().equals(userId) && !isAdmin) {
            throw new RuntimeException("You don't have permission to view this order");
        }
        return toOrderResponse(order);
    }
    
    // Lấy order entity cho việc gửi email (không cần security check)
    @Transactional(readOnly = true)
    public java.util.Optional<Order> getOrderByIdForEmail(Long orderId) {
        return orderRepository.findById(orderId);
    }
    
    // Tạo HTML cho chi tiết đơn hàng trong email
    public String buildOrderDetailsHtml(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table style='width: 100%; border-collapse: collapse;'>");
        sb.append("<tr style='background-color: #f2f2f2;'>");
        sb.append("<th style='padding: 8px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th>");
        sb.append("<th style='padding: 8px; border: 1px solid #ddd; text-align: center;'>Số lượng</th>");
        sb.append("<th style='padding: 8px; border: 1px solid #ddd; text-align: right;'>Giá</th>");
        sb.append("<th style='padding: 8px; border: 1px solid #ddd; text-align: right;'>Thành tiền</th>");
        sb.append("</tr>");
        
        if (order.getOrderDetails() != null && order.getOrderDetails().getItems() != null) {
            for (CartItem item : order.getOrderDetails().getItems()) {
                Double itemTotal = item.getBook().getPrice().doubleValue() * item.getQuantity();
                sb.append("<tr>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd;'>").append(item.getBook().getBookName()).append("</td>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(item.getQuantity()).append("</td>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>").append(String.format("%,.0f VNĐ", item.getBook().getPrice().doubleValue())).append("</td>");
                sb.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>").append(String.format("%,.0f VNĐ", itemTotal)).append("</td>");
                sb.append("</tr>");
            }
        }
        
        sb.append("<tr style='background-color: #e8f5e9; font-weight: bold;'>");
        sb.append("<td colspan='3' style='padding: 8px; border: 1px solid #ddd; text-align: right;'>Tổng cộng:</td>");
        sb.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>").append(String.format("%,.0f VNĐ", order.getTotalAmount())).append("</td>");
        sb.append("</tr>");
        sb.append("</table>");
        
        sb.append("<div style='margin-top: 20px; padding: 15px; background-color: #fff3e0; border-radius: 5px;'>");
        sb.append("<p style='margin: 0;'><strong>Địa chỉ giao hàng:</strong> ").append(order.getShippingAddress()).append("</p>");
        sb.append("<p style='margin: 5px 0 0 0;'><strong>Phương thức thanh toán:</strong> ").append(order.getPaymentMethod()).append("</p>");
        sb.append("</div>");
        
        return sb.toString();
    }
}
