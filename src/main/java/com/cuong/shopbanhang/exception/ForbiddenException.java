package com.cuong.shopbanhang.exception;

/**
 * Exception ném ra khi người dùng không có quyền truy cập tài nguyên.
 * HTTP Status: 403 Forbidden
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }
    
    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
