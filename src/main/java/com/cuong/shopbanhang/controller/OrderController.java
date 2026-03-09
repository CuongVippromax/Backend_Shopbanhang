package com.cuong.shopbanhang.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;
import com.cuong.shopbanhang.dto.request.CheckoutRequest;
import com.cuong.shopbanhang.dto.response.OrderDetailResponse;
import com.cuong.shopbanhang.dto.response.OrderResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Checkout - Tạo đơn hàng từ giỏ hàng
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestBody CheckoutRequest request) {
        Order order = orderService.checkout(request);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }

    // Lấy danh sách đơn hàng của user hiện tại
    @GetMapping("/my-orders")
    public ResponseEntity<PageResponse<?>> getMyOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getOrdersByUser(page, size));
    }

    // Lấy chi tiết đơn hàng
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetail(orderId));
    }

    // Hủy đơn hàng
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long orderId) {
        Order order = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }

    // Admin: Lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<PageResponse<?>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size, sort, search, startDate, endDate));
    }

    // Admin: Cập nhật trạng thái đơn hàng
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }

    // Admin: Cập nhật trạng thái thanh toán
    @PutMapping("/{orderId}/payment-status")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam PaymentStatus status) {
        Order order = orderService.updatePaymentStatus(orderId, status);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }
}
