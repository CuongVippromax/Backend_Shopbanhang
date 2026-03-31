package com.cuong.shopbanhang.util;

import com.cuong.shopbanhang.dto.response.ResponseObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseUtils {

    private ResponseUtils() {
    }

    // Return success response with data
    public static <T> ResponseEntity<ResponseObject<T>> success(T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.OK, "Success", data),
                HttpStatus.OK
        );
    }

    // Return success response with message and data
    public static <T> ResponseEntity<ResponseObject<T>> success(String message, T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.OK, message, data),
                HttpStatus.OK
        );
    }

    // Return created response
    public static <T> ResponseEntity<ResponseObject<T>> created(T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CREATED, "Created successfully", data),
                HttpStatus.CREATED
        );
    }

    // Return created response with message
    public static <T> ResponseEntity<ResponseObject<T>> created(String message, T data) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CREATED, message, data),
                HttpStatus.CREATED
        );
    }

    // Return no content response
    public static <T> ResponseEntity<ResponseObject<T>> noContent() {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.NO_CONTENT, "No content", null),
                HttpStatus.NO_CONTENT
        );
    }

    // Return bad request response
    public static <T> ResponseEntity<ResponseObject<T>> badRequest(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.BAD_REQUEST, message, null),
                HttpStatus.BAD_REQUEST
        );
    }

    // Return unauthorized response
    public static <T> ResponseEntity<ResponseObject<T>> unauthorized(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.UNAUTHORIZED, message, null),
                HttpStatus.UNAUTHORIZED
        );
    }

    // Return forbidden response
    public static <T> ResponseEntity<ResponseObject<T>> forbidden(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.FORBIDDEN, message, null),
                HttpStatus.FORBIDDEN
        );
    }

    // Return not found response
    public static <T> ResponseEntity<ResponseObject<T>> notFound(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.NOT_FOUND, message, null),
                HttpStatus.NOT_FOUND
        );
    }

    // Return conflict response
    public static <T> ResponseEntity<ResponseObject<T>> conflict(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.CONFLICT, message, null),
                HttpStatus.CONFLICT
        );
    }

    // Return internal server error response
    public static <T> ResponseEntity<ResponseObject<T>> internalError(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.INTERNAL_SERVER_ERROR, message, null),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    // Return service unavailable response
    public static <T> ResponseEntity<ResponseObject<T>> serviceUnavailable(String message) {
        return new ResponseEntity<>(
                new ResponseObject<>(HttpStatus.SERVICE_UNAVAILABLE, message, null),
                HttpStatus.SERVICE_UNAVAILABLE
        );
    }
}
