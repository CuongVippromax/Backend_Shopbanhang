package com.cuong.shopbanhang.exception;

/**
 * Exception liên quan đến thanh toán (VNPay, PayPal, COD).
 * HTTP Status: 402 Payment Required hoặc 400 Bad Request
 */
public class PaymentException extends RuntimeException {
    
    private final String paymentMethod;
    private final String errorCode;
    
    public PaymentException(String message) {
        super(message);
        this.paymentMethod = null;
        this.errorCode = null;
    }
    
    public PaymentException(String message, String paymentMethod) {
        super(message);
        this.paymentMethod = paymentMethod;
        this.errorCode = null;
    }
    
    public PaymentException(String message, String paymentMethod, String errorCode) {
        super(message);
        this.paymentMethod = paymentMethod;
        this.errorCode = errorCode;
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
        this.paymentMethod = null;
        this.errorCode = null;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
