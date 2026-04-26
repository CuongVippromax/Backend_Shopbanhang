package com.cuong.shopbanhang.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.request.CheckoutRequest;
import com.cuong.shopbanhang.dto.response.OrderResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.service.EmailService;
import com.cuong.shopbanhang.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;
    private final EmailService emailService;

    // Process checkout
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        log.info("=== CHECKOUT START ===");
        log.info("Checkout request: fullName={}, phone={}, email={}, paymentMethod={}",
            request.getFullName(), request.getPhone(), request.getEmail(), request.getPaymentMethod());
        try {
            Order order = orderService.checkout(request);
            log.info("Order saved with ID: {}, recipientName: {}, userId: {}",
                order.getOrderId(), order.getRecipientName(),
                order.getUser() != null ? order.getUser().getUserId() : null);
            OrderResponse response = orderService.toOrderResponse(order);
            log.info("OrderResponse fullName: {}", response.getFullName());
            // Gửi email xác nhận đơn hàng
            // VNPay: email sẽ được gửi ở callback (PaymentController) sau khi thanh toán thành công
            // COD và các phương thức khác: gửi email ngay tại đây
            String pm = order.getPaymentMethod();
            boolean isVnPay = pm != null && (pm.equalsIgnoreCase("VNPAY") || pm.equalsIgnoreCase("vnpay"));
            if (!isVnPay) {
                try {
                    String orderDetailsHtml = orderService.buildOrderDetailsHtml(order);
                    log.info("Sending order confirmation email to {} for order #{}", request.getEmail(), order.getOrderId());
                    emailService.sendOrderConfirmation(
                        request.getEmail(),
                        order.getOrderId().toString(),
                        order.getTotalAmount(),
                        orderDetailsHtml
                    );
                    log.info("Order confirmation email sent successfully to {}", request.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send order confirmation email for order #{}: {}", order.getOrderId(), e.getMessage());
                }
            }
            log.info("=== CHECKOUT END ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Checkout failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Get current user's orders
    @GetMapping("/my-orders")
    public ResponseEntity<PageResponse<List<OrderResponse>>> getMyOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("=== GET MY ORDERS === page={}, size={}", page, size);
        try {
            PageResponse<List<OrderResponse>> result = orderService.getOrdersByUser(page, size);
            log.info("Orders returned: totalElements={}, totalPages={}, ordersCount={}",
                result.getTotalElements(), result.getTotalPages(),
                result.getData() != null ? result.getData().size() : 0);
            if (result.getData() != null && !result.getData().isEmpty()) {
                var first = result.getData().get(0);
                log.info("First order: orderId={}, fullName={}, userId={}",
                    first.getOrderId(), first.getFullName(), first.getUserId());
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get orders: {}", e.getMessage(), e);
            throw e;
        }
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
