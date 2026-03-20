package com.cuong.shopbanhang.util;

import com.cuong.shopbanhang.dto.response.ResponseObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseUtils {

    private ResponseUtils() {
    }

    public static <T> ResponseEntity<ResponseObject<T>> success(T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.OK, "Success", data),
                HttpStatus.OK
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> success(String message, T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.OK, message, data),
                HttpStatus.OK
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> created(T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CREATED, "Created successfully", data),
                HttpStatus.CREATED
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> created(String message, T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CREATED, message, data),
                HttpStatus.CREATED
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> noContent() {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.NO_CONTENT, "No content", null),
                HttpStatus.NO_CONTENT
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> badRequest(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.BAD_REQUEST, message, null),
                HttpStatus.BAD_REQUEST
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> unauthorized(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.UNAUTHORIZED, message, null),
                HttpStatus.UNAUTHORIZED
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> forbidden(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.FORBIDDEN, message, null),
                HttpStatus.FORBIDDEN
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> notFound(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.NOT_FOUND, message, null),
                HttpStatus.NOT_FOUND
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> conflict(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CONFLICT, message, null),
                HttpStatus.CONFLICT
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> internalError(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.INTERNAL_SERVER_ERROR, message, null),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    public static <T> ResponseEntity<ResponseObject<T>> serviceUnavailable(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.SERVICE_UNAVAILABLE, message, null),
                HttpStatus.SERVICE_UNAVAILABLE
        );
    }
}
