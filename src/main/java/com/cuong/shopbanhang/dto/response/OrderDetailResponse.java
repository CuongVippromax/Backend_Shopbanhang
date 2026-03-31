package com.cuong.shopbanhang.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for order detail data
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long orderDetailId;
    private Long orderId;
    private List<OrderItemResponse> items;
    private Double totalPrice;
}
