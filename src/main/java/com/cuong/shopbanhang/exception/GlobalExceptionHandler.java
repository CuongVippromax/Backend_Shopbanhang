package com.cuong.shopbanhang.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.cuong.shopbanhang.dto.response.ErrorResponse;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Exception Handler - Xử lý tất cả exception trong ứng dụng.
 * 
 * Exception counts:
 * - ResourceNotFoundException: 1 handler
 * - ResourceAlreadyExistsException: 2 handler
 * - BadRequestException: 3 handler
 * - UnauthorizedException: 4 handler
 * - ForbiddenException: 5 handler
 * - TokenException: 6 handler
 * - PaymentException: 7 handler
 * - CartException: 8 handler
 * - OrderException: 9 handler
 * - FileStorageException: 10 handler
 * - MethodArgumentNotValidException: 11 handler
 * - AuthenticationException: 12 handler
 * - BadCredentialsException: 13 handler
 * - AccessDeniedException: 14 handler
 * - MaxUploadSizeExceededException: 15 handler
 * - HttpMessageNotWritableException: 16 handler
 * - HttpRequestMethodNotSupportedException: 17 handler
 * - IllegalArgumentException: 18 handler
 * - RuntimeException: 19 handler
 * - Exception: 20 handler (catch-all)
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ============================================================
    // 1. HANDLER: ResourceNotFoundException (404 NOT_FOUND)
    // Exception này ném ra khi không tìm thấy resource (User, Book, Order, etc.)
    // ============================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("NOT_FOUND")
                .message(ex.getMessage())
                .status(HttpStatus.NOT_FOUND.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // ============================================================
    // 2. HANDLER: ResourceAlreadyExistsException (409 CONFLICT)
    // Exception này ném ra khi resource đã tồn tại (email đã đăng ký, tên sách trùng, etc.)
    // ============================================================
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleResourceAlreadyExistsException(
            ResourceAlreadyExistsException ex, WebRequest request) {
        Map<String, String> fieldErrors = null;
        if (ex.getFieldName() != null && !ex.getFieldName().isBlank()) {
            fieldErrors = new HashMap<>();
            fieldErrors.put(ex.getFieldName(), ex.getMessage());
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("CONFLICT")
                .message(ex.getMessage())
                .status(HttpStatus.CONFLICT.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .fieldErrors(fieldErrors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // ============================================================
    // 3. HANDLER: BadRequestException (400 BAD_REQUEST)
    // Exception này ném ra khi dữ liệu request không hợp lệ
    // ============================================================
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(
            BadRequestException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("BAD_REQUEST")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 4. HANDLER: UnauthorizedException (401 UNAUTHORIZED)
    // Exception này ném ra khi người dùng chưa đăng nhập hoặc token không hợp lệ
    // ============================================================
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("UNAUTHORIZED")
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // ============================================================
    // 5. HANDLER: ForbiddenException (403 FORBIDDEN)
    // Exception này ném ra khi người dùng không có quyền truy cập tài nguyên
    // ============================================================
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbiddenException(
            ForbiddenException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("FORBIDDEN")
                .message(ex.getMessage())
                .status(HttpStatus.FORBIDDEN.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    // ============================================================
    // 6. HANDLER: TokenException (401 UNAUTHORIZED)
    // Exception này ném ra khi token không hợp lệ, hết hạn, hoặc bị thu hồi
    // ============================================================
    @ExceptionHandler(TokenException.class)
    public ResponseEntity<ErrorResponse> handleTokenException(
            TokenException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("TOKEN_ERROR")
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // ============================================================
    // 7. HANDLER: PaymentException (400 BAD_REQUEST hoặc 402 PAYMENT_REQUIRED)
    // Exception này ném ra khi thanh toán thất bại (VNPay, PayPal, COD)
    // ============================================================
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(
            PaymentException ex, WebRequest request) {
        log.error("[EX-007] Payment error: {} | Method: {} | Code: {} | Path: {}", 
                ex.getMessage(), ex.getPaymentMethod(), ex.getErrorCode(), request.getDescription(false));

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("PAYMENT_ERROR")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 8. HANDLER: CartException (400 BAD_REQUEST)
    // Exception này ném ra khi có lỗi liên quan đến giỏ hàng
    // ============================================================
    @ExceptionHandler(CartException.class)
    public ResponseEntity<ErrorResponse> handleCartException(
            CartException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("CART_ERROR")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 9. HANDLER: OrderException (400 BAD_REQUEST)
    // Exception này ném ra khi có lỗi liên quan đến đơn hàng
    // ============================================================
    @ExceptionHandler(OrderException.class)
    public ResponseEntity<ErrorResponse> handleOrderException(
            OrderException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("ORDER_ERROR")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 10. HANDLER: FileStorageException (400 hoặc 500)
    // Exception này ném ra khi upload/download file thất bại (MinIO)
    // ============================================================
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ErrorResponse> handleFileStorageException(
            FileStorageException ex, WebRequest request) {
        log.error("[EX-010] File storage error: {} | Path: {}", ex.getMessage(), request.getDescription(false), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("FILE_STORAGE_ERROR")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 11. HANDLER: MethodArgumentNotValidException (400 VALIDATION_ERROR)
    // Exception này ném ra khi validation annotation fail (@NotNull, @Size, etc.)
    // ============================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            if (error instanceof FieldError fieldError) {
                errors.put(fieldError.getField(), error.getDefaultMessage());
            } else {
                errors.put("_global", error.getDefaultMessage());
            }
        });

        String userMessage = errors.values().stream()
                .filter(msg -> msg != null && !msg.isBlank())
                .distinct()
                .collect(Collectors.joining(". "));
        if (userMessage.isBlank()) {
            userMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("VALIDATION_FAILED")
                .message(userMessage)
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .fieldErrors(errors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 12. HANDLER: AuthenticationException (401 UNAUTHORIZED)
    // Exception này ném ra khi Spring Security authentication fail
    // ============================================================
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("UNAUTHORIZED")
                .message("Xác thực thất bại. Vui lòng đăng nhập lại.")
                .status(HttpStatus.UNAUTHORIZED.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // ============================================================
    // 13. HANDLER: BadCredentialsException (401 UNAUTHORIZED)
    // Exception này ném ra khi username/password không đúng
    // ============================================================
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("UNAUTHORIZED")
                .message("Tên đăng nhập hoặc mật khẩu không đúng.")
                .status(HttpStatus.UNAUTHORIZED.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // ============================================================
    // 14. HANDLER: AccessDeniedException (403 FORBIDDEN)
    // Exception này ném ra khi người dùng không có quyền (@PreAuthorize fail)
    // ============================================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("FORBIDDEN")
                .message("Bạn không có quyền truy cập tài nguyên này.")
                .status(HttpStatus.FORBIDDEN.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    // ============================================================
    // 15. HANDLER: MaxUploadSizeExceededException (413 PAYLOAD_TOO_LARGE)
    // Exception này ném ra khi file upload vượt kích thước cho phép
    // ============================================================
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("FILE_TOO_LARGE")
                .message("Kích thước file vượt quá giới hạn cho phép. Vui lòng chọn file nhỏ hơn.")
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    // ============================================================
    // 16. HANDLER: HttpMessageNotWritableException (500 JSON_ERROR)
    // Exception này ném ra khi serialize JSON thất bại
    // ============================================================
    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotWritable(
            HttpMessageNotWritableException ex, WebRequest request) {
        log.error("[EX-016] JSON serialization error: {} | Path: {}", ex.getMessage(), request.getDescription(false), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("JSON_ERROR")
                .message("Lỗi xử lý dữ liệu. Vui lòng thử lại sau.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ============================================================
    // 17. HANDLER: HttpRequestMethodNotSupportedException (405 METHOD_NOT_ALLOWED)
    // Exception này ném ra khi dùng sai HTTP method (GET thay vì POST)
    // ============================================================
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException ex, WebRequest request) {
        log.warn("[EX-017] Method not allowed: {} - {} | Path: {}", 
                ex.getMethod(), ex.getMessage(), request.getDescription(false));

        String hint = "";
        String path = request.getDescription(false).replace("uri=", "");
        if (path.contains("/api/v1/cart/") && !path.contains("/add") && "POST".equals(ex.getMethod())) {
            hint = " Thêm sách vào giỏ: dùng POST /api/v1/cart/{userId}/add?bookId=...&quantity=...";
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("METHOD_NOT_ALLOWED")
                .message("Method " + ex.getMethod() + " không được hỗ trợ cho endpoint này." + hint)
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    // ============================================================
    // 18. HANDLER: IllegalArgumentException (400 BAD_REQUEST)
    // Exception này ném ra khi tham số không hợp lệ
    // ============================================================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("[EX-018] Invalid argument: {} | Path: {}", ex.getMessage(), request.getDescription(false));

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("INVALID_ARGUMENT")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 19. HANDLER: RuntimeException (400 BAD_REQUEST)
    // Exception này ném ra cho các RuntimeException chung
    // ============================================================
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        log.error("[EX-019] Runtime exception [{}]: {} | Path: {}", 
                ex.getClass().getSimpleName(), ex.getMessage(), request.getDescription(false), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("BAD_REQUEST")
                .message(ex.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ============================================================
    // 20. HANDLER: Exception (500 INTERNAL_SERVER_ERROR) - Catch-all
    // Exception này bắt tất cả exception còn lại
    // ============================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("[EX-020] Unexpected error [{}]: {} | Path: {}", 
                ex.getClass().getSimpleName(), ex.getMessage(), request.getDescription(false), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("INTERNAL_SERVER_ERROR")
                .message("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
