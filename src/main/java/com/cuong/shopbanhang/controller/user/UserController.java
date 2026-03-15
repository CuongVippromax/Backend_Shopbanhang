package com.cuong.shopbanhang.controller.user;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.DataResponse;
import com.cuong.shopbanhang.dto.response.UserResponse;
import com.cuong.shopbanhang.model.User;
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

    @PostMapping("/register")
    public DataResponse<UserResponse> createUser(@Valid @RequestBody User user) {
        UserResponse newUser = userService.createUser(user);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("User created successfully")
                .data(newUser)
                .build();
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('USER')")
    public DataResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody User user) {
        UserResponse updatedUser = userService.updateUser(id, user);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User updated successfully")
                .data(updatedUser)
                .build();
    }

    @PostMapping("/forgot-password")
    public DataResponse<Void> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        userService.forgotPassword(email);
        return DataResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Password reset link has been sent to your email")
                .build();
    }

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
