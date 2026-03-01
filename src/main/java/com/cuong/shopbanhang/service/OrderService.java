package com.cuong.shopbanhang.service;



import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Cart;
import com.cuong.shopbanhang.model.CartItem;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.model.OrderDetail;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.CartRepository;
import com.cuong.shopbanhang.repository.OrderRepository;
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
    
    @Transactional
    public Order checkout(CheckoutRequest request) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUser_UserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        Double totalPrice = cart.getCartItems().stream()
        .map(item -> item.getProduct().getPrice().doubleValue() * item.getQuantity())
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
    public void cancelOrder(Long orderId) {
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
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
    
    public PageResponse<List<Order>> getOrdersByUser(int page, int size) {
        if(page > 0) {
            page = page - 1;
        }
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUser_UserId(userId, pageable);
        return PageResponse.<List<Order>>builder()
        .pageNo(page)
        .pageSize(size)
        .totalElements(orders.getTotalElements())
        .totalPages(orders.getTotalPages())
        .data(orders.getContent())
        .build();
    }
    
    public PageResponse<List<Order>> getAllOrders(int page, int size, String sort, String search, String startDate, String endDate) {
       if(page > 0) {
        page = page - 1;
       }
       
       // Parse sort
       String sortField = "orderDate";
       String sortDirection = "asc";
       if(StringUtils.hasLength(sort)) {
        Pattern pattern = Pattern.compile("(\\w+?)(:)(.*)");
        Matcher matcher = pattern.matcher(sort);
        if(matcher.find()) {
            sortField = matcher.group(1);
            sortDirection = matcher.group(3);
        }
       }
       
       Sort sortObj = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
       Pageable pageable = PageRequest.of(page, size, sortObj);
       
       // Parse dates
       DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
       LocalDateTime start = StringUtils.hasLength(startDate) ? LocalDateTime.parse(startDate + " 00:00:00", formatter) : null;
       LocalDateTime end = StringUtils.hasLength(endDate) ? LocalDateTime.parse(endDate + " 23:59:59", formatter) : null;
       
       Page<Order> orders = orderRepository.searchOrders(search, start, end, pageable);
       
       return PageResponse.<List<Order>>builder()
           .pageNo(page)
           .pageSize(size)
           .totalElements(orders.getTotalElements())
           .totalPages(orders.getTotalPages())
           .data(orders.getContent())
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
}
