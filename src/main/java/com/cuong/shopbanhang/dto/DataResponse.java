package com.cuong.shopbanhang.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DataResponse<T> {
    private int statusCode;
    private String message;
    private T data;
}
