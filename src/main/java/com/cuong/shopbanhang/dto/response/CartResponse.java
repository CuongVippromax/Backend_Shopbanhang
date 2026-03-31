package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

// DTO for cart data
@Getter
@Setter
@Builder
public class CartResponse {
    private Long cartId;
    private Long userId;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalPrice;
}
