package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.dto.request.ChangePasswordRequest;
import com.cuong.shopbanhang.dto.request.LoginRequest;
import com.cuong.shopbanhang.dto.response.LoginResponse;
import com.cuong.shopbanhang.dto.response.ResponseObject;
import com.cuong.shopbanhang.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j(topic = "AuthController")
public class AuthController {
    private final AuthService authService;

    // Handle user login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok().body(response);
    }

    // Handle user logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().body("Logout successfully");
    }

    // Refresh access token
    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken(@RequestBody String refreshToken) {
        String response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok().body(response);
    }

    // Create new access token from refresh token
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody String refreshToken) {
        LoginResponse response = authService.createAccessTooken(refreshToken);
        return ResponseEntity.ok().body(response);
    }

    // Change user password
    @PostMapping("/change-password")
    public ResponseObject<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return new ResponseObject<>(HttpStatus.OK, "Change password successfully", null);
    }
}
