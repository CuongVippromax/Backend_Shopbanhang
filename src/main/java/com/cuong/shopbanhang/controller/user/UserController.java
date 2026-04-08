package com.cuong.shopbanhang.controller.user;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.cuong.shopbanhang.dto.request.UserUpdateRequest;
import com.cuong.shopbanhang.dto.response.DataResponse;
import com.cuong.shopbanhang.dto.response.UserResponse;
import com.cuong.shopbanhang.exception.ForbiddenException;
import com.cuong.shopbanhang.exception.UnauthorizedException;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.security.SecurityUtils;
import com.cuong.shopbanhang.service.UserService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Validated
@RequestMapping("/api/v1/users")
@AllArgsConstructor
@Slf4j(topic = "UserController")
public class UserController {

    private final UserService userService;

    /** Hồ sơ người dùng hiện tại (đầy đủ: SĐT, địa chỉ...) */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public DataResponse<UserResponse> getCurrentProfile() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        UserResponse user = userService.getUserById(userId);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("OK")
                .data(user)
                .build();
    }

    /**
     * Cập nhật hồ sơ user đang đăng nhập (từng phần). Dùng cùng path với GET /me để tránh lỗi
     * NoResourceFoundException khi proxy/môi trường xử lý sai PUT /users/update/{id}.
     */
    @RequestMapping(value = "/me", method = { RequestMethod.PUT, RequestMethod.PATCH })
    @PreAuthorize("isAuthenticated()")
    public DataResponse<UserResponse> updateCurrentProfile(@Valid @RequestBody UserUpdateRequest user) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        UserResponse updatedUser = userService.updateUser(userId, user);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User updated successfully")
                .data(updatedUser)
                .build();
    }

    // Register new user
    @PostMapping("/register")
    public DataResponse<UserResponse> createUser(@Valid @RequestBody User user) {
        UserResponse newUser = userService.createUser(user);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("User created successfully")
                .data(newUser)
                .build();
    }

    // Update user profile (giữ tương thích; chỉ được sửa chính mình)
    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public DataResponse<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest user) {
        Long currentId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        if (!currentId.equals(id)) {
            throw new ForbiddenException("Bạn chỉ được cập nhật hồ sơ của chính mình.");
        }
        UserResponse updatedUser = userService.updateUser(id, user);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User updated successfully")
                .data(updatedUser)
                .build();
    }

    // Request password reset
    @PostMapping("/forgot-password")
    public DataResponse<Void> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        userService.forgotPassword(email);
        return DataResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Password reset link has been sent to your email")
                .build();
    }

    // Reset password with token
    @PostMapping("/reset-password")
    public DataResponse<Void> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        userService.resetPassword(token, newPassword);
        return DataResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Password reset successfully")
                .build();
    }
}
