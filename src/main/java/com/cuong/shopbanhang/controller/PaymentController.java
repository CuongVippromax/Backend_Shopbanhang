package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.common.PaymentStatus;
import com.cuong.shopbanhang.config.VNPayConfig;
import com.cuong.shopbanhang.dto.response.PaymentDTO;
import com.cuong.shopbanhang.dto.response.ResponseObject;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.service.OrderService;
import com.cuong.shopbanhang.service.PaymentService;
import com.cuong.shopbanhang.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j(topic = "PaymentController")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final EmailService emailService;
    private final VNPayConfig vnPayConfig;

    // Create VNPay payment
    @GetMapping("/vn-pay")
    public ResponseObject<PaymentDTO.VNPayResponse> pay(HttpServletRequest request) {
        log.info("========== [VNPay] /vn-pay endpoint called ==========");
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Request Method: {}", request.getMethod());
        log.info("Request Parameters: orderId={}, amount={}, bankCode={}", 
            request.getParameter("orderId"), 
            request.getParameter("amount"),
            request.getParameter("bankCode"));
        
        try {
            ResponseObject<PaymentDTO.VNPayResponse> response = new ResponseObject<>(
                HttpStatus.OK, 
                "Success", 
                paymentService.createVnPayPayment(request)
            );
            log.info("VNPay payment URL created successfully");
            
            // Access ResponseObject body
            var payload = response.getBody();
            if (payload != null) {
                log.info("Response status code: {}", payload.code);
                log.info("Response message: {}", payload.message);
                if (payload.data != null && payload.data.getPaymentUrl() != null) {
                    log.info("Payment URL length: {}", payload.data.getPaymentUrl().length());
                    log.debug("Payment URL: {}", payload.data.getPaymentUrl());
                }
            }
            
            return response;
        } catch (Exception e) {
            log.error("Error creating VNPay payment: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Handle VNPay callback - xử lý logic và redirect về frontend
    @GetMapping("/vn-pay-callback")
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        
        log.info("========== [VNPay] Callback received - OrderId: {}, ResponseCode: {} ==========", vnp_TxnRef, vnp_ResponseCode);
        
        if (vnp_TxnRef == null || vnp_TxnRef.isEmpty()) {
            log.error("Missing order ID in VNPay callback");
            redirectToFrontend(response, null, vnp_ResponseCode, "Missing order ID", request);
            return;
        }
        
        try {
            // vnp_TxnRef có format "{orderId}_{timestamp}" (set ở PaymentService để đảm bảo unique theo VNPay)
            String orderIdPart = vnp_TxnRef.contains("_") ? vnp_TxnRef.substring(0, vnp_TxnRef.indexOf('_')) : vnp_TxnRef;
            Long orderId = Long.parseLong(orderIdPart);

            if ("00".equals(vnp_ResponseCode)) {
                // Thanh toán thành công
                var orderOpt = orderService.getOrderByIdForEmail(orderId);
                if (orderOpt.isEmpty()) {
                    log.error("Order not found: {}", orderId);
                    redirectToFrontend(response, orderId, vnp_ResponseCode, "Order not found", request);
                    return;
                }
                
                Order order = orderOpt.get();
                
                // Chỉ xử lý nếu chưa thanh toán (tránh gọi 2 lần: server VNPay + frontend)
                if (order.getPaymentStatus() != PaymentStatus.PAID) {
                    log.info("Processing successful payment for order {}", orderId);

                    // Cập nhật trạng thái thanh toán
                    orderService.updatePaymentStatus(orderId, PaymentStatus.PAID);
                    log.info("Updated payment status to PAID for order {}", orderId);

                    // Capture thông tin email TRƯỚC khi clearCart (clearCart gọi entityManager.clear() làm detach entity)
                    String customerEmail = order.getUser() != null ? order.getUser().getEmail() : null;
                    Long customerUserId = order.getUser() != null ? order.getUser().getUserId() : null;
                    Double totalAmount = order.getTotalAmount();
                    String orderDetailsHtml = null;
                    try {
                        orderDetailsHtml = orderService.buildOrderDetailsHtml(order);
                    } catch (Exception e) {
                        log.error("Failed to build order details HTML for order {}: {}", orderId, e.getMessage(), e);
                    }

                    // Xóa cart items sau khi thanh toán VNPay thành công
                    if (customerUserId != null) {
                        try {
                            log.info("Attempting to clear cart for user {} after VNPay payment", customerUserId);
                            orderService.clearCartAfterVNPaySuccess(orderId, customerUserId);
                            log.info("Successfully cleared cart for user {} after successful VNPay payment", customerUserId);
                        } catch (Exception e) {
                            log.error("Failed to clear cart for user {} after VNPay payment: {}", customerUserId, e.getMessage(), e);
                        }
                    } else {
                        log.warn("Cannot clear cart: userId is null for order {}", orderId);
                    }

                    // Gửi email xác nhận (dùng dữ liệu đã capture ở trên)
                    try {
                        log.info("Attempting to send confirmation email for order {}", orderId);
                        if (customerEmail == null || customerEmail.isEmpty()) {
                            log.error("Cannot send email: order {} has no user email", orderId);
                        } else if (orderDetailsHtml == null) {
                            log.error("Cannot send email: order details HTML is null for order {}", orderId);
                        } else {
                            emailService.sendOrderConfirmation(
                                customerEmail,
                                String.valueOf(orderId),
                                totalAmount,
                                orderDetailsHtml
                            );
                            log.info("Dispatched order confirmation email to {} for order {} (async)", customerEmail, orderId);
                        }
                    } catch (Exception e) {
                        log.error("Failed to dispatch payment confirmation email for order {}: {}", orderId, e.getMessage(), e);
                    }
                } else {
                    log.info("Order {} already paid, skipping duplicate processing", orderId);
                }
                
                log.info("========== [VNPay] Payment SUCCESS for order {} ==========", orderId);
                redirectToFrontend(response, orderId, "00", "Success", request);
                
            } else {
                // Thanh toán thất bại
                log.warn("Payment failed for order {}, code: {}", orderId, vnp_ResponseCode);
                try {
                    orderService.cancelAndDeleteOrder(orderId);
                    log.info("Cancelled and deleted order {} after payment failure", orderId);
                } catch (Exception e) {
                    log.error("Failed to cancel order {} after payment failure", orderId, e);
                }
                redirectToFrontend(response, orderId, vnp_ResponseCode, "Payment failed", request);
            }
        } catch (NumberFormatException e) {
            log.error("Invalid order ID format in vnp_TxnRef: {}", vnp_TxnRef);
            redirectToFrontend(response, null, vnp_ResponseCode, "Invalid order ID", request);
        }
    }
    
    private void redirectToFrontend(HttpServletResponse response, Long orderId, String responseCode, 
                                    String message, HttpServletRequest request) throws IOException {
        // Lấy các tham số từ request để truyền sang frontend
        String vnp_Amount = request.getParameter("vnp_Amount");
        String vnp_BankCode = request.getParameter("vnp_BankCode");
        String vnp_CardType = request.getParameter("vnp_CardType");
        String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
        String vnp_PayDate = request.getParameter("vnp_PayDate");
        
        StringBuilder redirectUrl = new StringBuilder(vnPayConfig.getFrontendUrl());
        redirectUrl.append("/payment/vn-pay-result");
        redirectUrl.append("?code=").append(responseCode != null ? responseCode : "");
        
        if (orderId != null) {
            redirectUrl.append("&orderId=").append(orderId);
        }
        if (vnp_Amount != null && !vnp_Amount.isEmpty()) {
            redirectUrl.append("&vnp_Amount=").append(vnp_Amount);
        }
        if (vnp_BankCode != null && !vnp_BankCode.isEmpty()) {
            redirectUrl.append("&vnp_BankCode=").append(URLEncoder.encode(vnp_BankCode, StandardCharsets.UTF_8));
        }
        if (vnp_CardType != null && !vnp_CardType.isEmpty()) {
            redirectUrl.append("&vnp_CardType=").append(URLEncoder.encode(vnp_CardType, StandardCharsets.UTF_8));
        }
        if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
            redirectUrl.append("&vnp_TransactionNo=").append(vnp_TransactionNo);
        }
        if (vnp_PayDate != null && !vnp_PayDate.isEmpty()) {
            redirectUrl.append("&vnp_PayDate=").append(vnp_PayDate);
        }
        
        log.info("Redirecting to frontend: {}", redirectUrl);
        response.sendRedirect(redirectUrl.toString());
    }
}
