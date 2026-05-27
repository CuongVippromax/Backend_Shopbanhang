package com.cuong.shopbanhang.service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

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

        // Tạo Map config mới cho mỗi lần gọi (tránh cache)
        Map<String, String> vnpParamsMap = new HashMap<>();
        vnpParamsMap.put("vnp_Version", vnPayConfig.getVnp_Version());
        vnpParamsMap.put("vnp_Command", vnPayConfig.getVnp_Command());
        vnpParamsMap.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnpParamsMap.put("vnp_CurrCode", "VND");
        
        String orderInfo = "Thanh toan don hang:" + VNPayUtil.getRandomNumber(8);
        vnpParamsMap.put("vnp_OrderInfo", orderInfo);
        log.debug("Generated OrderInfo: {}", orderInfo);
        
        vnpParamsMap.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParamsMap.put("vnp_Locale", "vn");
        vnpParamsMap.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        
        // Tạo timestamp mới cho mỗi lần gọi (tránh cache)
        Calendar calendar = Calendar.getInstance(TimeZone.getDefault());
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        
        String vnpCreateDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_CreateDate", vnpCreateDate);
        log.info("Generated CreateDate: {}", vnpCreateDate);
        
        // Set expire date (15 minutes from now)
        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_ExpireDate", vnp_ExpireDate);
        log.info("Payment URL will expire in 15 minutes at: {}", vnp_ExpireDate);
        
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        vnpParamsMap.put("vnp_TxnRef", orderIdStr + "_" + System.currentTimeMillis());
        
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
