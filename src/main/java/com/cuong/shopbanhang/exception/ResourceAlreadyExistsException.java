package com.cuong.shopbanhang.exception;

import lombok.Getter;

@Getter
public class ResourceAlreadyExistsException extends RuntimeException {
    private final String fieldName;

    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(messageForField(fieldName));
        this.fieldName = fieldName;
    }

    public ResourceAlreadyExistsException(String message) {
        super(message);
        this.fieldName = null;
    }

    private static String messageForField(String fieldName) {
        if (fieldName == null || fieldName.isBlank()) {
            return "Dữ liệu đã tồn tại";
        }
        return switch (fieldName) {
            case "email" -> "Email đã tồn tại";
            case "phone" -> "Số điện thoại đã tồn tại";
            case "username" -> "Tên đăng nhập đã tồn tại";
            case "bookName" -> "Tên sách đã tồn tại";
            case "categoryName" -> "Tên danh mục đã tồn tại";
            default -> "Dữ liệu đã tồn tại";
        };
    }
}
