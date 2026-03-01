package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Long productId;
    private String productName;
    private Double price;
    private Integer quantity;
    private String image;
    private String description;
    private String category;
}
