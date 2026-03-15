package com.cuong.shopbanhang.service;



import java.time.LocalDateTime;
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
import com.cuong.shopbanhang.repository.OrderRepository;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;




@Service
@RequiredArgsConstructor
@Slf4j(topic = "OrderService")
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final EmailService emailService;
    
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
            log.info("Đã trừ {} quyển sách '{}' trong kho. Còn lại: {}", 
                    item.getQuantity(), book.getBookName(), book.getQuantity());
        }
        
        Double totalPrice = cart.getCartItems().stream()
        .map(item -> item.getBook().getPrice().doubleValue() * item.getQuantity())
        .reduce(0.0, Double::sum);
        
        OrderDetail orderDetail = OrderDetail.builder()
        .items(cart.getCartItems().stream().toList())
        .totalPrice(totalPrice)
        .build();

        Order order =  Order.builder()
        .user(user)
        .orderDate(LocalDateTime.now())
        .totalAmount(totalPrice)
        .paymentStatus(PaymentStatus.PENDING)
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
        
        // GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
        try {
            String orderDetailsHtml = buildOrderDetailsHtml(savedOrder);
            emailService.sendOrderConfirmation(
                user.getEmail(),
                savedOrder.getOrderId().toString(),
                savedOrder.getTotalAmount(),
                orderDetailsHtml
            );
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
        }
        
        return savedOrder;

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
                log.info("Đã hoàn {} quyển sách '{}' vào kho khi hủy đơn", 
                        item.getQuantity(), book.getBookName());
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
        List<OrderItemResponse> items = order.getOrderDetails() != null 
            ? order.getOrderDetails().getItems().stream()
                .map(item -> OrderItemResponse.builder()
                    .cartItemId(item.getCartItemId())
                    .bookId(item.getBook().getBookId())
                    .bookName(item.getBook().getBookName())
                    .price(item.getBook().getPrice().doubleValue())
                    .quantity(item.getQuantity())
                    .totalPrice(item.getBook().getPrice().doubleValue() * item.getQuantity())
                    .image(item.getBook().getImage())
                    .build())
                .collect(Collectors.toList())
            : null;
        
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
    
    // Tạo HTML cho chi tiết đơn hàng trong email
    private String buildOrderDetailsHtml(Order order) {
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
