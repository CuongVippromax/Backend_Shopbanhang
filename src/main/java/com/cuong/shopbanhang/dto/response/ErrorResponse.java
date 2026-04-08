package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

// DTO for error response
@Getter
@Setter
@Builder
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private LocalDateTime timestamp;
    private String path;
    /** Lỗi theo từng trường (validation, trùng email...) — key = tên field entity */
    private Map<String, String> fieldErrors;
}
