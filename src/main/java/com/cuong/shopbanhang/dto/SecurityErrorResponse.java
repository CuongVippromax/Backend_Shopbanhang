package com.cuong.shopbanhang.dto;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SecurityErrorResponse {
    private int statusCode;
    private String error;
    private String method;
    private String message;
    private String path;
    private Instant timestamp;
}
