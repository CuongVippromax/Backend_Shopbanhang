package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.common.PaymentStatus;
import com.cuong.shopbanhang.dto.response.PaymentDTO;
import com.cuong.shopbanhang.dto.response.ResponseObject;
import com.cuong.shopbanhang.service.PaymentService;
import com.cuong.shopbanhang.service.OrderService;
import com.cuong.shopbanhang.service.EmailService;
import com.cuong.shopbanhang.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final EmailService emailService;

    @GetMapping("/vn-pay")
    public ResponseObject<PaymentDTO.VNPayResponse> pay(HttpServletRequest request) {
        return new ResponseObject<>(HttpStatus.OK, "Success", paymentService.createVnPayPayment(request));
    }

    @GetMapping("/vn-pay-callback")
    public ResponseObject<PaymentDTO.VNPayResponse> payCallbackHandler(HttpServletRequest request) {
        log.info("VNPay callback received");
        
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        
        log.info("ResponseCode: {}, TxnRef: {}", vnp_ResponseCode, vnp_TxnRef);
        
        if (vnp_TxnRef == null) {
            log.error("Missing order ID in callback");
            return new ResponseObject<>(HttpStatus.BAD_REQUEST, "Missing order ID", null);
        }
        
        Long orderId = Long.parseLong(vnp_TxnRef);
        
        if ("00".equals(vnp_ResponseCode)) {
            orderService.updatePaymentStatus(orderId, PaymentStatus.PAID);
            
            // GỬI EMAIL XÁC NHẬN SAU KHI THANH TOÁN THÀNH CÔNG
            try {
                var orderOpt = orderService.getOrderByIdForEmail(orderId);
                if (orderOpt.isPresent()) {
                    var order = orderOpt.get();
                    String orderDetailsHtml = orderService.buildOrderDetailsHtml(order);
                    emailService.sendOrderConfirmation(
                        order.getUser().getEmail(),
                        order.getOrderId().toString(),
                        order.getTotalAmount(),
                        orderDetailsHtml
                    );
                    log.info("Payment confirmation email sent for order: {}", orderId);
                }
            } catch (Exception e) {
                log.error("Failed to send payment confirmation email", e);
            }
            
            log.info("Payment successful for order: {}", orderId);
            return new ResponseObject<>(HttpStatus.OK, "Payment successful", 
                PaymentDTO.VNPayResponse.builder()
                    .code("00")
                    .message("Success")
                    .orderId(orderId)
                    .build());
        } else {
            // Thanh toán thất bại - xóa đơn hàng và hoàn lại tồn kho
            try {
                orderService.cancelAndDeleteOrder(orderId);
                log.info("Payment failed - order {} deleted and inventory restored", orderId);
            } catch (Exception e) {
                log.error("Failed to cancel order {} after payment failure", orderId, e);
            }
            log.info("Payment failed for order: {}, code: {}", orderId, vnp_ResponseCode);
            return new ResponseObject<>(HttpStatus.BAD_REQUEST, "Payment failed with code: " + vnp_ResponseCode, null);
        }
    }
}
