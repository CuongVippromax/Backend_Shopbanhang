package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

// DTO for category data
@Getter
@Setter
@Builder
public class CategoryResponse {
    private Long categoryId;
    private String categoryName;
    private String description;
    private Long bookCount;
    private Boolean active;
}
