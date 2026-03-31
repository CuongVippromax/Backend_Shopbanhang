package com.cuong.shopbanhang.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.request.CheckoutRequest;
import com.cuong.shopbanhang.dto.response.OrderResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    // Process checkout
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        Order order = orderService.checkout(request);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }

    // Get current user's orders
    @GetMapping("/my-orders")
    public ResponseEntity<PageResponse<List<OrderResponse>>> getMyOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getOrdersByUser(page, size));
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // Cancel order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long orderId) {
        Order order = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(orderService.toOrderResponse(order));
    }
}
