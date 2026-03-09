package com.cuong.shopbanhang.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long cartItemId;
    private Long bookId;
    private String bookName;
    private Double price;
    private Integer quantity;
    private Double totalPrice;
    private String image;
}
