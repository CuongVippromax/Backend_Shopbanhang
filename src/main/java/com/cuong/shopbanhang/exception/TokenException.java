package com.cuong.shopbanhang.exception;

/**
 * Exception liên quan đến Token (JWT, refresh token, token hết hạn).
 * HTTP Status: 401 Unauthorized
 */
public class TokenException extends RuntimeException {
    
    private final String tokenType;
    
    public TokenException(String message) {
        super(message);
        this.tokenType = null;
    }
    
    public TokenException(String message, String tokenType) {
        super(message);
        this.tokenType = tokenType;
    }
    
    public TokenException(String message, Throwable cause) {
        super(message, cause);
        this.tokenType = null;
    }
    
    public String getTokenType() {
        return tokenType;
    }
}
