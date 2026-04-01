package com.cuong.shopbanhang.exception;

/**
 * Exception liên quan đến giỏ hàng (thêm, xóa, cập nhật sản phẩm).
 * HTTP Status: 400 Bad Request
 */
public class CartException extends RuntimeException {
    
    public CartException(String message) {
        super(message);
    }
    
    public CartException(String message, Throwable cause) {
        super(message, cause);
    }
}
