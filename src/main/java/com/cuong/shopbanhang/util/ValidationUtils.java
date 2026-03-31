package com.cuong.shopbanhang.util;

import java.util.regex.Pattern;

public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[0-9]{10,11}$");

    private static final Pattern USERNAME_PATTERN = Pattern.compile(
            "^[A-Za-z0-9_-]{3,20}$");

    private ValidationUtils() {
    }

    // Validate email format
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    // Validate phone number format
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone.replaceAll("\\s", "")).matches();
    }

    // Validate username format
    public static boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return USERNAME_PATTERN.matcher(username).matches();
    }

    // Validate password length
    public static boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        return password.length() >= 6 && password.length() <= 50;
    }

    // Validate email and throw on invalid
    public static void validateEmail(String email) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    // Validate phone and throw on invalid
    public static void validatePhone(String phone) {
        if (!isValidPhone(phone)) {
            throw new IllegalArgumentException("Invalid phone number format");
        }
    }

    // Validate username and throw on invalid
    public static void validateUsername(String username) {
        if (!isValidUsername(username)) {
            throw new IllegalArgumentException("Invalid username format");
        }
    }

    // Validate password and throw on invalid
    public static void validatePassword(String password) {
        if (!isValidPassword(password)) {
            throw new IllegalArgumentException("Password must be between 6 and 50 characters");
        }
    }
}
