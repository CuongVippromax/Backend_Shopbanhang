package com.cuong.shopbanhang.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Random;

public class StringUtils {

    private static final String ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String NUMERIC_CHARS = "0123456789";
    private static final String ALPHABETIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    private StringUtils() {
    }

    // Check if string is empty
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    // Check if string is not empty
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    // Return default value if string is empty
    public static String defaultIfEmpty(String str, String defaultValue) {
        return isEmpty(str) ? defaultValue : str;
    }

    // Capitalize first letter
    public static String capitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    // Truncate string to max length
    public static String truncate(String str, int maxLength) {
        if (isEmpty(str) || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + "...";
    }

    // Generate random alphanumeric string
    public static String generateRandomString(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC_CHARS.charAt(random.nextInt(ALPHANUMERIC_CHARS.length())));
        }
        return sb.toString();
    }

    // Generate random numeric string
    public static String generateNumericString(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(NUMERIC_CHARS.charAt(random.nextInt(NUMERIC_CHARS.length())));
        }
        return sb.toString();
    }

    // Generate random alphabetic string
    public static String generateAlphabeticString(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABETIC_CHARS.charAt(random.nextInt(ALPHABETIC_CHARS.length())));
        }
        return sb.toString();
    }

    // Mask email address
    public static String maskEmail(String email) {
        if (isEmpty(email) || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String localPart = parts[0];
        if (localPart.length() <= 2) {
            return email;
        }
        return localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1) + "@" + parts[1];
    }

    // Mask phone number
    public static String maskPhone(String phone) {
        if (isEmpty(phone) || phone.length() < 4) {
            return phone;
        }
        int visibleDigits = 4;
        String masked = "*".repeat(phone.length() - visibleDigits);
        return masked + phone.substring(phone.length() - visibleDigits);
    }

    // Remove all whitespace
    public static String removeWhitespace(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.replaceAll("\\s+", "");
    }

    // Normalize whitespace (trim and collapse)
    public static String normalizeWhitespace(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.trim().replaceAll("\\s+", " ");
    }

    // Convert to camelCase
    public static String toCamelCase(String str) {
        if (isEmpty(str)) {
            return str;
        }
        String[] words = str.split("[\\s_-]+");
        StringBuilder result = new StringBuilder(words[0].toLowerCase());
        for (int i = 1; i < words.length; i++) {
            result.append(capitalize(words[i].toLowerCase()));
        }
        return result.toString();
    }

    // Convert to snake_case
    public static String toSnakeCase(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    // Convert to kebab-case
    public static String toKebabCase(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.replaceAll("([a-z])([A-Z])", "$1-$2").toLowerCase();
    }

    // Generate MD5 hash
    public static String md5Hash(String input) {
        if (isEmpty(input)) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    // Encode string to Base64
    public static String encodeBase64(String input) {
        if (isEmpty(input)) {
            return null;
        }
        return Base64.getEncoder().encodeToString(input.getBytes());
    }

    // Decode Base64 string
    public static String decodeBase64(String input) {
        if (isEmpty(input)) {
            return null;
        }
        return new String(Base64.getDecoder().decode(input));
    }

    // Check if string contains search string (case insensitive)
    public static boolean containsIgnoreCase(String str, String searchStr) {
        if (str == null || searchStr == null) {
            return false;
        }
        return str.toLowerCase().contains(searchStr.toLowerCase());
    }

    // Repeat string n times
    public static String repeat(String str, int count) {
        if (isEmpty(str) || count <= 0) {
            return "";
        }
        return str.repeat(count);
    }

    // Pad string on the left
    public static String leftPad(String str, int length, char padChar) {
        if (str == null) {
            str = "";
        }
        if (str.length() >= length) {
            return str;
        }
        return String.valueOf(padChar).repeat(length - str.length()) + str;
    }

    // Pad string on the right
    public static String rightPad(String str, int length, char padChar) {
        if (str == null) {
            str = "";
        }
        if (str.length() >= length) {
            return str;
        }
        return str + String.valueOf(padChar).repeat(length - str.length());
    }
}
