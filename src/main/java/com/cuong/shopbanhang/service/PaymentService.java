package com.cuong.shopbanhang.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.config.VNPayConfig;
import com.cuong.shopbanhang.dto.response.PaymentDTO;
import com.cuong.shopbanhang.exception.PaymentException;
import com.cuong.shopbanhang.util.VNPayUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PaymentService {
    private final VNPayConfig vnPayConfig;

    /**
     * Tạo URL thanh toán VNPay.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - PaymentException (1): Khi thiếu orderId hoặc amount, hoặc cấu hình VNPay không hợp lệ
     * - IllegalArgumentException (2): Khi định dạng tham số không hợp lệ
     * 
     * @param request HttpServletRequest chứa orderId, amount, bankCode
     * @return PaymentDTO.VNPayResponse chứa paymentUrl để chuyển hướng người dùng
     */
    public PaymentDTO.VNPayResponse createVnPayPayment(HttpServletRequest request) {
        String orderIdStr = request.getParameter("orderId");
        
        // EXCEPTION: PaymentException - Khi thiếu orderId
        if (orderIdStr == null || orderIdStr.isEmpty()) {
            throw new PaymentException("Thiếu tham số orderId.", "VNPay"); // EX-007
        }
        
        Long orderId = Long.parseLong(orderIdStr);
        
        String amountStr = request.getParameter("amount");
        // EXCEPTION: PaymentException - Khi thiếu amount
        if (amountStr == null || amountStr.isEmpty()) {
            throw new PaymentException("Thiếu tham số amount.", "VNPay"); // EX-007
        }
        
        long amount;
        try {
            amount = Integer.parseInt(amountStr) * 100L;
        } catch (NumberFormatException e) {
            // EXCEPTION: IllegalArgumentException - Khi amount không phải số
            throw new IllegalArgumentException("Tham số amount không hợp lệ: " + amountStr); // EX-018
        }
        
        String bankCode = request.getParameter("bankCode");

        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig();
        
        // EXCEPTION: PaymentException - Khi cấu hình VNPay không hợp lệ
        if (vnpParamsMap == null || vnpParamsMap.isEmpty()) {
            throw new PaymentException("Cấu hình VNPay không hợp lệ. Vui lòng kiểm tra cài đặt.", "VNPay", "CONFIG_ERROR"); // EX-007
        }
        
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        vnpParamsMap.put("vnp_TxnRef", orderIdStr);
        
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        
        vnpParamsMap.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        
        String queryUrl = VNPayUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = VNPayUtil.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        return PaymentDTO.VNPayResponse.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl)
                .orderId(orderId)
                .build();
    }
}
