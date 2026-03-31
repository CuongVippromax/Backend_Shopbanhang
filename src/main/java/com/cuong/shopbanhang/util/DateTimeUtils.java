package com.cuong.shopbanhang.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {

    public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String TIME_FORMAT = "HH:mm:ss";
    public static final String VIETNAM_DATE_FORMAT = "dd/MM/yyyy HH:mm:ss";
    public static final String ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_FORMAT);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern(TIME_FORMAT);
    private static final DateTimeFormatter VIETNAM_FORMATTER = DateTimeFormatter.ofPattern(VIETNAM_DATE_FORMAT);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern(ISO_FORMAT);

    private DateTimeUtils() {
    }

    // Format datetime with default pattern
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DEFAULT_FORMATTER);
    }

    // Format datetime with custom pattern
    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null || pattern == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    // Format date only
    public static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_FORMATTER);
    }

    // Format time only
    public static String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(TIME_FORMATTER);
    }

    // Format in Vietnam date style
    public static String formatVietnam(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(VIETNAM_FORMATTER);
    }

    // Format in ISO style
    public static String formatIso(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(ISO_FORMATTER);
    }

    // Parse datetime string with default format
    public static LocalDateTime parse(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, DEFAULT_FORMATTER);
    }

    // Parse datetime string with custom format
    public static LocalDateTime parse(String dateTimeString, String pattern) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty() || pattern == null) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ofPattern(pattern));
    }

    // Check if date is expired
    public static boolean isExpired(LocalDateTime expiryDate) {
        if (expiryDate == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(expiryDate);
    }

    // Check if date is expired against current time
    public static boolean isExpired(LocalDateTime expiryDate, LocalDateTime currentTime) {
        if (expiryDate == null) {
            return true;
        }
        return currentTime.isAfter(expiryDate);
    }

    // Add hours to datetime
    public static LocalDateTime addHours(LocalDateTime dateTime, long hours) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusHours(hours);
    }

    // Add days to datetime
    public static LocalDateTime addDays(LocalDateTime dateTime, long days) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusDays(days);
    }

    // Add minutes to datetime
    public static LocalDateTime addMinutes(LocalDateTime dateTime, long minutes) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusMinutes(minutes);
    }

    // Get hours until future date
    public static long getHoursUntil(LocalDateTime futureDate) {
        if (futureDate == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), futureDate).toHours();
    }

    // Get minutes until future date
    public static long getMinutesUntil(LocalDateTime futureDate) {
        if (futureDate == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), futureDate).toMinutes();
    }
}
