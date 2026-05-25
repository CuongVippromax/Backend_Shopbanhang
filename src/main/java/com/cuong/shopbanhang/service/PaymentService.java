package com.cuong.shopbanhang.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.cuong.shopbanhang.config.VNPayConfig;
import com.cuong.shopbanhang.dto.response.PaymentDTO;
import com.cuong.shopbanhang.exception.PaymentException;
import com.cuong.shopbanhang.util.VNPayUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j(topic = "PaymentService")
public class PaymentService {
    private final VNPayConfig vnPayConfig;

    /**
     * Tạo URL thanh toán VNPay.
     *
     * @param request HttpServletRequest chứa orderId, amount, bankCode
     * @return PaymentDTO.VNPayResponse chứa paymentUrl để chuyển hướng người dùng
     */
    public PaymentDTO.VNPayResponse createVnPayPayment(HttpServletRequest request) {
        log.info("========== VNPAY PAYMENT START ==========");
        log.info("Request from IP: {}", VNPayUtil.getIpAddress(request));
        
        String orderIdStr = request.getParameter("orderId");
        log.debug("orderId parameter: {}", orderIdStr);
        
        if (orderIdStr == null || orderIdStr.isEmpty()) {
            log.error("Missing orderId parameter");
            throw new PaymentException("Thiếu tham số orderId.", "VNPay");
        }
        
        Long orderId = Long.parseLong(orderIdStr);
        log.info("Processing payment for orderId: {}", orderId);
        
        String amountStr = request.getParameter("amount");
        log.debug("amount parameter (raw): {}", amountStr);
        
        if (amountStr == null || amountStr.isEmpty()) {
            log.error("Missing amount parameter");
            throw new PaymentException("Thiếu tham số amount.", "VNPay");
        }
        
        long amount;
        try {
            amount = Integer.parseInt(amountStr) * 100L;
            log.debug("amount converted to VND (x100): {}", amount);
        } catch (NumberFormatException e) {
            log.error("Invalid amount format: {}", amountStr, e);
            throw new IllegalArgumentException("Tham số amount không hợp lệ: " + amountStr);
        }
        
        String bankCode = request.getParameter("bankCode");
        log.debug("bankCode parameter: {}", bankCode);

        log.info("Getting VNPay configuration...");
        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig();
        log.debug("VNPay config keys: {}", vnpParamsMap.keySet());
        
        if (vnpParamsMap == null || vnpParamsMap.isEmpty()) {
            log.error("VNPay configuration is null or empty!");
            throw new PaymentException("Cấu hình VNPay không hợp lệ. Vui lòng kiểm tra cài đặt.", "VNPay", "CONFIG_ERROR");
        }
        
        // Log VNPay config values (mask sensitive data)
        log.debug("VNPay URL: {}", vnPayConfig.getVnp_PayUrl());
        log.debug("VNPay TmnCode: {}", vnPayConfig.getVnp_TmnCode());
        log.debug("VNPay ReturnUrl: {}", vnpParamsMap.get("vnp_ReturnUrl"));
        log.debug("VNPay Version: {}", vnpParamsMap.get("vnp_Version"));
        log.debug("VNPay Command: {}", vnpParamsMap.get("vnp_Command"));
        log.debug("VNPay ExpireDate: {}", vnpParamsMap.get("vnp_ExpireDate"));
        
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        vnpParamsMap.put("vnp_TxnRef", orderIdStr);
        
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        
        vnpParamsMap.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        
        log.info("Building VNPay payment URL...");
        String queryUrl = VNPayUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = VNPayUtil.getPaymentURL(vnpParamsMap, false);
        
        log.debug("Hash data (for signature): {}", hashData);
        
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        log.debug("Generated SecureHash: {}", vnpSecureHash);
        
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
        
        log.info("VNPay payment URL generated successfully");
        log.debug("Full payment URL: {}", paymentUrl);
        
        // Validate VNPay URL
        try {
            UriComponentsBuilder.fromUriString(vnPayConfig.getVnp_PayUrl()).build().toUri();
            log.info("VNPay base URL is valid: {}", vnPayConfig.getVnp_PayUrl());
        } catch (Exception e) {
            log.error("VNPay base URL is INVALID: {}", vnPayConfig.getVnp_PayUrl(), e);
        }
        
        log.info("========== VNPAY PAYMENT END ==========");

        return PaymentDTO.VNPayResponse.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl)
                .orderId(orderId)
                .build();
    }
}
