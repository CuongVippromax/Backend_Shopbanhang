package com.cuong.shopbanhang.exception;

/**
 * Exception liên quan đến đơn hàng (tạo, hủy, cập nhật trạng thái).
 * HTTP Status: 400 Bad Request
 */
public class OrderException extends RuntimeException {
    
    public OrderException(String message) {
        super(message);
    }
    
    public OrderException(String message, Throwable cause) {
        super(message, cause);
    }
}
