package com.cuong.shopbanhang.config;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cuong.shopbanhang.util.VNPayUtil;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Getter
@Slf4j(topic = "VNPayConfig")
public class VNPayConfig {
    @Value("${payment.vnPay.url}")
    private String vnp_PayUrl;
    @Value("${payment.vnPay.returnUrl}")
    private String vnp_ReturnUrl;
    @Value("${payment.vnPay.tmnCode}")
    private String vnp_TmnCode ;
    @Getter
    @Value("${payment.vnPay.secretKey}")
    private String secretKey;
    @Value("${payment.vnPay.version}")
    private String vnp_Version;
    @Value("${payment.vnPay.command}")
    private String vnp_Command;
    @Value("${payment.vnPay.orderType}")
    private String orderType;

    // Get VNPay configuration map
    @Bean
    public Map<String, String> getVNPayConfig() {
        log.info("========== VNPayConfig.getVNPayConfig() ==========");
        log.info("VNPay URL: {}", vnp_PayUrl);
        log.info("VNPay ReturnURL: {}", vnp_ReturnUrl);
        log.info("VNPay TmnCode: {}", vnp_TmnCode);
        log.info("VNPay SecretKey length: {}", secretKey != null ? secretKey.length() : "NULL");
        log.info("VNPay Version: {}", vnp_Version);
        log.info("VNPay Command: {}", vnp_Command);
        log.info("VNPay OrderType: {}", orderType);
        
        // Validate required config
        if (vnp_PayUrl == null || vnp_PayUrl.isEmpty()) {
            log.error("VNPay URL is NULL or EMPTY!");
        }
        if (vnp_TmnCode == null || vnp_TmnCode.isEmpty()) {
            log.error("VNPay TmnCode is NULL or EMPTY!");
        }
        if (secretKey == null || secretKey.isEmpty()) {
            log.error("VNPay SecretKey is NULL or EMPTY!");
        }
        
        Map<String, String> vnpParamsMap = new HashMap<>();
        vnpParamsMap.put("vnp_Version", this.vnp_Version);
        vnpParamsMap.put("vnp_Command", this.vnp_Command);
        vnpParamsMap.put("vnp_TmnCode", this.vnp_TmnCode);
        vnpParamsMap.put("vnp_CurrCode", "VND");
        
        // Generate transaction reference
        String txnRef = VNPayUtil.getRandomNumber(8);
        vnpParamsMap.put("vnp_TxnRef", txnRef);
        log.debug("Generated TxnRef: {}", txnRef);
        
        String orderInfo = "Thanh toan don hang:" + VNPayUtil.getRandomNumber(8);
        vnpParamsMap.put("vnp_OrderInfo", orderInfo);
        log.debug("Generated OrderInfo: {}", orderInfo);
        
        vnpParamsMap.put("vnp_OrderType", this.orderType);
        vnpParamsMap.put("vnp_Locale", "vn");
        vnpParamsMap.put("vnp_ReturnUrl", this.vnp_ReturnUrl);
        
        // Generate timestamps (ICT - Indochina Time = UTC+7 for Vietnam)
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_CreateDate", vnpCreateDate);
        log.debug("Generated CreateDate: {}", vnpCreateDate);
        
        // Set expire date (15 minutes from now)
        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(calendar.getTime());
        vnpParamsMap.put("vnp_ExpireDate", vnp_ExpireDate);
        log.debug("Generated ExpireDate: {}", vnp_ExpireDate);
        log.info("Payment URL will expire in 15 minutes at: {}", vnp_ExpireDate);
        
        log.info("VNPay config map created with {} parameters", vnpParamsMap.size());
        log.info("========== VNPayConfig.getVNPayConfig() END ==========");
        
        return vnpParamsMap;
    }
}
