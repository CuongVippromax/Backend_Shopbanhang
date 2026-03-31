package com.cuong.shopbanhang.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class FileUtils {

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp"
    );

    private static final List<String> ALLOWED_DOCUMENT_EXTENSIONS = Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    private FileUtils() {
    }

    // Check if file is an image
    public static boolean isImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        String extension = getFileExtension(file.getOriginalFilename());
        return ALLOWED_IMAGE_EXTENSIONS.contains(extension.toLowerCase());
    }

    // Check if file is a document
    public static boolean isDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        String extension = getFileExtension(file.getOriginalFilename());
        return ALLOWED_DOCUMENT_EXTENSIONS.contains(extension.toLowerCase());
    }

    // Validate image file size
    public static boolean isValidImageSize(MultipartFile file) {
        if (file == null) {
            return false;
        }
        return file.getSize() <= MAX_IMAGE_SIZE;
    }

    // Validate general file size
    public static boolean isValidFileSize(MultipartFile file) {
        if (file == null) {
            return false;
        }
        return file.getSize() <= MAX_FILE_SIZE;
    }

    // Check if file is valid image
    public static boolean isValidImage(MultipartFile file) {
        return isImage(file) && isValidImageSize(file);
    }

    // Get file extension
    public static String getFileExtension(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    // Get filename without extension
    public static String getFileNameWithoutExtension(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return filename;
        }
        return filename.substring(0, lastDotIndex);
    }

    // Generate unique filename with UUID
    public static String generateUniqueFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return uuid + (extension.isEmpty() ? "" : "." + extension);
    }

    // Generate unique image filename
    public static String generateUniqueImageName(String originalFilename) {
        String extension = getFileExtension(originalFilename).toLowerCase();
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + extension;
    }

    // Get content type of file
    public static String getContentType(MultipartFile file) {
        if (file == null) {
            return null;
        }
        return file.getContentType();
    }

    // Validate content type against allowed types
    public static boolean isValidContentType(MultipartFile file, List<String> allowedTypes) {
        if (file == null || file.getContentType() == null) {
            return false;
        }
        return allowedTypes.contains(file.getContentType().toLowerCase());
    }

    // Create directory if not exists
    public static void createDirectoryIfNotExists(String directoryPath) throws IOException {
        Path path = Paths.get(directoryPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
    }

    // Get file size in MB
    public static long getFileSizeInMB(MultipartFile file) {
        if (file == null) {
            return 0;
        }
        return file.getSize() / (1024 * 1024);
    }

    // Get file size in KB
    public static long getFileSizeInKB(MultipartFile file) {
        if (file == null) {
            return 0;
        }
        return file.getSize() / 1024;
    }

    // Get file as byte array
    public static byte[] getFileBytes(MultipartFile file) throws IOException {
        if (file == null) {
            return new byte[0];
        }
        return file.getBytes();
    }
}
