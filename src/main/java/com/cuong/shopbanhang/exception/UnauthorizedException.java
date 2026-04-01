package com.cuong.shopbanhang.exception;

/**
 * Exception ném ra khi người dùng chưa đăng nhập hoặc token không hợp lệ.
 * HTTP Status: 401 Unauthorized
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
