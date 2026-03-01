package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.dto.request.ChangePasswordRequest;
import com.cuong.shopbanhang.dto.request.LoginRequest;
import com.cuong.shopbanhang.dto.response.LoginResponse;
import com.cuong.shopbanhang.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j(topic = "AuthController")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok().body(response);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().body("Logout successfully");
}
@PostMapping("/refresh-token")
public ResponseEntity<String> refreshToken(@RequestBody String refreshToken) {
    String response = authService.refreshToken(refreshToken);
    return ResponseEntity.ok().body(response);
}
@PostMapping("/change-password")
public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
    authService.changePassword(request);
    return ResponseEntity.ok().body("Change password successfully");
}
}