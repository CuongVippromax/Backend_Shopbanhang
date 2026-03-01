package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryResponse {
    private String CategoryName;
    private String description;
}
