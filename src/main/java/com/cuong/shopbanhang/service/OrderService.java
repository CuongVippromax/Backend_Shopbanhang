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
import com.cuong.shopbanhang.exception.OrderException;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.exception.UnauthorizedException;
import com.cuong.shopbanhang.exception.ForbiddenException;
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

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Xử lý thanh toán (checkout).
     * Tạo đơn hàng từ giỏ hàng và trừ số lượng tồn kho.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - ResourceNotFoundException (2): Khi không tìm thấy user, cart
     * - OrderException (3): Khi giỏ hàng trống, hoặc không đủ hàng trong kho
     * 
     * @param request Thông tin checkout (địa chỉ giao hàng, phương thức thanh toán, etc.)
     * @return Order đơn hàng đã tạo
     */
    @Transactional
    public Order checkout(CheckoutRequest request) {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập để đặt hàng.")); // EX-004

        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001

        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy cart
        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId)); // EX-001

        // EXCEPTION: OrderException - Khi giỏ hàng trống
        if (cart.getCartItems().isEmpty()) {
            throw new OrderException("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng."); // EX-009
        }

        for (CartItem item : cart.getCartItems()) {
            Book book = item.getBook();
            Integer currentQty = book.getQuantity() != null ? book.getQuantity() : 0;
            Integer orderQty = item.getQuantity() != null ? item.getQuantity() : 0;
            if (currentQty < orderQty) {
                throw new OrderException("Sách '" + book.getBookName() + "' không đủ hàng trong kho. Còn lại: " + currentQty + " quyển");
            }
        }

        // Trừ số lượng tồn kho
        for (CartItem item : cart.getCartItems()) {
            Book book = item.getBook();
            Integer orderQty = item.getQuantity() != null ? item.getQuantity() : 0;
            book.setQuantity(book.getQuantity() - orderQty);
            bookRepository.save(book);
        }

        Double totalPrice = cart.getCartItems().stream()
        .map(item -> {
            Double price = item.getBook().getPrice();
            Integer qty = item.getQuantity();
            return (price != null ? price : 0.0) * (qty != null ? qty : 0);
        })
        .reduce(0.0, Double::sum);
        
        OrderDetail orderDetail = OrderDetail.builder()
        .items(cart.getCartItems().stream().toList())
        .totalPrice(totalPrice)
        .build();

        PaymentStatus paymentStatus = PaymentStatus.PENDING;

        Order order = Order.builder()
        .user(user)
        .orderDate(LocalDateTime.now())
        .totalAmount(totalPrice)
        .paymentStatus(paymentStatus)
        .recipientName(request.getFullName())
        .recipientPhone(request.getPhone())
        .shippingAddress(request.getShippingAddress())
        .paymentMethod(request.getPaymentMethod())
        .note(request.getNote())
        .orderDetails(orderDetail)
        .orderStatus(OrderStatus.PENDING)
        .build();
        orderDetail.setOrder(order);

        for (CartItem item : cart.getCartItems()) {
            item.setOrderDetail(orderDetail);
            item.setCart(null);
        }

        Order savedOrder = orderRepository.save(order);

        cart.getCartItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    /**
     * Hủy và xóa đơn hàng (dùng khi thanh toán thất bại).
     * Khôi phục số lượng tồn kho và các mặt hàng trong giỏ.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy đơn hàng
     * - OrderException (2): Khi đơn hàng đã thanh toán thành công
     * 
     * @param orderId ID của đơn hàng cần hủy và xóa
     */
    @Transactional
    public void cancelAndDeleteOrder(Long orderId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId)); // EX-001

        // EXCEPTION: OrderException - Khi đơn hàng đã thanh toán thành công
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new OrderException("Không thể xóa đơn hàng đã thanh toán thành công."); // EX-009
        }

        Long userId = order.getUser() != null ? order.getUser().getUserId() : null;

        List<CartItem> itemsToRestore = null;
        if (order.getOrderDetails() != null && order.getOrderDetails().getItems() != null) {
            itemsToRestore = new ArrayList<>(order.getOrderDetails().getItems());
        }

        if (itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                item.setOrderDetail(null);
            }

            cartItemRepository.saveAll(itemsToRestore);
            entityManager.flush();
        }

        // Khôi phục số lượng tồn kho
        if (itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                Book book = item.getBook();
                book.setQuantity(book.getQuantity() + item.getQuantity());
                bookRepository.save(book);
            }
            entityManager.flush();
        }

        Cart userCart = userId != null ? cartRepository.findByUser_UserId(userId).orElse(null) : null;

        // Khôi phục các mặt hàng vào giỏ hàng
        if (userCart != null && itemsToRestore != null) {
            for (CartItem item : itemsToRestore) {
                var existing = cartItemRepository.findByCart_CartIdAndBook_BookId(
                        userCart.getCartId(), item.getBook().getBookId());
                if (existing.isPresent()) {
                    CartItem existingItem = existing.get();
                    existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                    cartItemRepository.save(existingItem);
                } else {
                    item.setCart(userCart);
                    cartItemRepository.save(item);
                }
            }
            entityManager.flush();
        }

        order.setOrderDetails(null);
        orderRepository.save(order);
        orderRepository.delete(order);

        entityManager.clear();
    }

    /**
     * Hủy đơn hàng (bởi user hoặc admin).
     * Khôi phục số lượng tồn kho nếu đơn hàng chưa được giao.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - ResourceNotFoundException (2): Khi không tìm thấy đơn hàng
     * - ForbiddenException (3): Khi người dùng không có quyền hủy đơn hàng
     * - OrderException (4): Khi đơn hàng đã được giao hoặc không thể hủy
     * 
     * @param orderId ID của đơn hàng cần hủy
     * @return Order đơn hàng đã được hủy
     */
    @Transactional
    public Order cancelOrder(Long orderId) {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập.")); // EX-004
        
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId)); // EX-001

        boolean isOwner = order.getUser() != null && order.getUser().getUserId().equals(userId);
        
        // EXCEPTION: ForbiddenException - Khi người dùng không có quyền hủy
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn hàng này."); // EX-005
        }

        // EXCEPTION: OrderException - Khi đơn hàng đã được giao
        if (order.getOrderStatus() == OrderStatus.SHIPPED) {
            throw new OrderException("Không thể hủy đơn hàng đã được giao."); // EX-009
        }

        // Khôi phục số lượng tồn kho nếu đơn hàng chưa bị hủy
        if (order.getOrderStatus() != OrderStatus.CANCELLED && order.getOrderDetails() != null) {
            for (CartItem item : order.getOrderDetails().getItems()) {
                Book book = item.getBook();
                Integer qty = item.getQuantity() != null ? item.getQuantity() : 0;
                book.setQuantity((book.getQuantity() != null ? book.getQuantity() : 0) + qty);
                bookRepository.save(book);
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * 
     * @param page Số trang (bắt đầu từ 1)
     * @param size Kích thước trang
     * @return PageResponse chứa danh sách OrderResponse
     */
    @Transactional(readOnly = true)
    public PageResponse<List<OrderResponse>> getOrdersByUser(int page, int size) {
        if(page > 0) {
            page = page - 1;
        }
        
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập.")); // EX-004
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
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

    /**
     * Lấy danh sách tất cả đơn hàng (cho admin).
     * Hỗ trợ tìm kiếm và lọc theo ngày.
     * 
     * @param page Số trang (bắt đầu từ 1)
     * @param size Kích thước trang
     * @param sort Trường sắp xếp (VD: orderDate:desc)
     * @param search Từ khóa tìm kiếm
     * @param startDate Ngày bắt đầu lọc
     * @param endDate Ngày kết thúc lọc
     * @return PageResponse chứa danh sách OrderResponse
     */
    public PageResponse<List<OrderResponse>> getAllOrders(int page, int size, String sort, String search, String startDate, String endDate) {
       // Frontend sends 0-indexed page (0, 1, 2...), no adjustment needed

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

    /**
     * Cập nhật trạng thái đơn hàng (cho admin).
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy đơn hàng
     * 
     * @param orderId ID của đơn hàng cần cập nhật
     * @param status Trạng thái mới
     * @return Order đơn hàng đã cập nhật
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId)); // EX-001
        
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Cập nhật trạng thái thanh toán của đơn hàng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy đơn hàng
     * 
     * @param orderId ID của đơn hàng cần cập nhật
     * @param status Trạng thái thanh toán mới
     * @return Order đơn hàng đã cập nhật
     */
    @Transactional
    public Order updatePaymentStatus(Long orderId, PaymentStatus status) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId)); // EX-001
        
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Chuyển đổi Order entity sang OrderResponse DTO.
     * 
     * @param order Order entity
     * @return OrderResponse
     */
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

        log.info("toOrderResponse: orderId={}, recipientName='{}', user.fullName='{}', userId={}",
            order.getOrderId(), order.getRecipientName(),
            order.getUser() != null ? order.getUser().getFullName() : "NULL",
            order.getUser() != null ? order.getUser().getUserId() : "NULL");

        String displayName = order.getRecipientName() != null && !order.getRecipientName().isBlank()
                ? order.getRecipientName()
                : (order.getUser() != null ? order.getUser().getFullName() : null);
        log.info("toOrderResponse: displayName='{}'", displayName);

        Double subTotal = 0.0;
        if (order.getOrderDetails() != null && order.getOrderDetails().getItems() != null) {
            subTotal = order.getOrderDetails().getItems().stream()
                .filter(item -> item.getBook() != null && item.getBook().getPrice() != null)
                .mapToDouble(item -> item.getBook().getPrice().doubleValue() * (item.getQuantity() != null ? item.getQuantity() : 0))
                .sum();
        }

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser() != null ? order.getUser().getUserId() : null)
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .fullName(displayName)
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .note(order.getNote())
                .items(items)
                .subTotal(subTotal)
                .shippingFee(0.0)
                .discount(0.0)
                .build();
    }

    /**
     * Lấy thông tin đơn hàng theo ID.
     * User chỉ có thể xem đơn hàng của mình, admin có thể xem tất cả.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy đơn hàng
     * - ForbiddenException (2): Khi người dùng không có quyền xem đơn hàng
     * 
     * @param orderId ID của đơn hàng
     * @return OrderResponse thông tin đơn hàng
     */
    public OrderResponse getOrderById(Long orderId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy đơn hàng
        Order order = orderRepository.findWithDetailsByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId)); // EX-001
        
        Long userId = SecurityUtils.getCurrentUserId().orElse(null);
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        
        if (userId != null && (order.getUser() == null || (!order.getUser().getUserId().equals(userId) && !isAdmin))) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");
        }
        
        return toOrderResponse(order);
    }

    /**
     * Lấy Order entity để gửi email (không dùng cho API).
     * 
     * @param orderId ID của đơn hàng
     * @return Optional<Order>
     */
    @Transactional(readOnly = true)
    public java.util.Optional<Order> getOrderByIdForEmail(Long orderId) {
        return orderRepository.findById(orderId);
    }

    /**
     * Xây dựng HTML cho email chi tiết đơn hàng.
     * 
     * @param order Đơn hàng cần tạo HTML
     * @return String HTML content
     */
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
        if (order.getRecipientName() != null && !order.getRecipientName().isBlank()) {
            sb.append("<p style='margin: 0;'><strong>Người nhận:</strong> ").append(order.getRecipientName()).append("</p>");
        }
        if (order.getRecipientPhone() != null && !order.getRecipientPhone().isBlank()) {
            sb.append("<p style='margin: 5px 0 0 0;'><strong>Điện thoại:</strong> ").append(order.getRecipientPhone()).append("</p>");
        }
        if (order.getShippingAddress() != null && !order.getShippingAddress().isBlank()) {
            sb.append("<p style='margin: 5px 0 0 0;'><strong>Địa chỉ giao hàng:</strong> ").append(order.getShippingAddress()).append("</p>");
        }
        sb.append("<p style='margin: 5px 0 0 0;'><strong>Phương thức thanh toán:</strong> ").append(order.getPaymentMethod()).append("</p>");
        sb.append("</div>");

        return sb.toString();
    }
}
