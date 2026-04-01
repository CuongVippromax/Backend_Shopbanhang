package com.cuong.shopbanhang.exception;

/**
 * Exception liên quan đến file upload/download và MinIO.
 * HTTP Status: 400 Bad Request hoặc 500 Internal Server Error
 */
public class FileStorageException extends RuntimeException {
    
    public FileStorageException(String message) {
        super(message);
    }
    
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
