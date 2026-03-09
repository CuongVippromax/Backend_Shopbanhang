package com.cuong.shopbanhang.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long orderId;
    private Long userId;
    private String username;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private String shippingAddress;
    private String paymentMethod;
    private List<OrderItemResponse> items;
}
