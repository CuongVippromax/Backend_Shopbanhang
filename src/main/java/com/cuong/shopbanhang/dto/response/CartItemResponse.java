package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

// DTO for cart item data
@Getter
@Setter
@Builder
public class CartItemResponse {
    private Long cartItemId;
    private Long bookId;
    private String bookName;
    private BigDecimal price;
    private Integer quantity;
    private String image;
    private BigDecimal totalPrice;
}
