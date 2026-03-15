package com.cuong.shopbanhang.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class PaymentDTO {
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class VNPayResponse {
    public String code;
    public String message;
    public String paymentUrl;
    public Long orderId;
}
}

