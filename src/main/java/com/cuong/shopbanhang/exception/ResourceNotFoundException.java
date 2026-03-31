package com.cuong.shopbanhang.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s not found with id : %s", resourceName, id));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
