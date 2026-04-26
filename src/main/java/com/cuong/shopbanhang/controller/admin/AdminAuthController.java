package com.cuong.shopbanhang.controller.admin;

import com.cuong.shopbanhang.dto.request.LoginRequest;
import com.cuong.shopbanhang.dto.response.LoginResponse;
import com.cuong.shopbanhang.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j(topic = "AdminAuthController")
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        log.info("Admin login attempt for user: {}", request.getUsernameOrEmail());
        LoginResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(response);
    }
}
