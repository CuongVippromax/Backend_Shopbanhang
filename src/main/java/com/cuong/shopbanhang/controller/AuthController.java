package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.dto.request.ChangePasswordRequest;
import com.cuong.shopbanhang.dto.request.GoogleTokenRequest;
import com.cuong.shopbanhang.dto.request.LoginRequest;
import com.cuong.shopbanhang.dto.response.LoginResponse;
import com.cuong.shopbanhang.dto.response.OAuth2Response;
import com.cuong.shopbanhang.dto.response.ResponseObject;
import com.cuong.shopbanhang.service.AuthService;
import com.cuong.shopbanhang.service.OAuth2UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j(topic = "AuthController")
public class AuthController {
    private final AuthService authService;
    private final OAuth2UserService oAuth2UserService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${app.base-url}")
    private String appBaseUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

    // Get Google OAuth URL for frontend to redirect
    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        String redirectUri = appBaseUrl + "/api/v1/auth/google/callback";
        String state = java.util.UUID.randomUUID().toString();
        
        String authUrl = GOOGLE_AUTH_URL 
                + "?client_id=" + googleClientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=email%20profile"
                + "&access_type=online"
                + "&state=" + state
                + "&prompt=select_account";

        Map<String, String> response = new HashMap<>();
        response.put("url", authUrl);
        response.put("state", state);
        
        return ResponseEntity.ok(response);
    }

    // Handle Google OAuth2 callback from Google - returns HTML page with tokens
    @GetMapping({"/google/callback", "/google/callback/"})
    public ResponseEntity<String> googleCallback(@RequestParam("code") String code) {
        log.info("Google callback received with code");
        
        try {
            String redirectUri = appBaseUrl + "/api/v1/auth/google/callback";
            
            GoogleTokenRequest request = new GoogleTokenRequest();
            request.setCode(code);
            request.setRedirectUri(redirectUri);
            
            OAuth2Response oauth2Response = oAuth2UserService.processGoogleLogin(request);
            log.info("Google login successful for user: {}", oauth2Response.getEmail());
            
            // Return HTML page that sends tokens back to opener window
            String html = buildCallbackHtml(oauth2Response, null);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .header("Access-Control-Allow-Origin", "*")
                    .body(html);
                    
        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            String html = buildCallbackHtml(null, e.getMessage());
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .header("Access-Control-Allow-Origin", "*")
                    .body(html);
        }
    }

    private String buildCallbackHtml(OAuth2Response data, String error) {
        if (error != null) {
            return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Login Failed</title></head><body>" +
                    "<script>" +
                    "if (window.opener) { window.opener.postMessage({type: 'GOOGLE_LOGIN_ERROR', message: '" + escapeJs(error) + "'}, '*'); }" +
                    "setTimeout(() => window.close(), 2000);" +
                    "</script>" +
                    "<p>Login failed. This window will close automatically.</p></body></html>";
        }
        
        String userData = String.format(
            "{accessToken: '%s', refreshToken: '%s', userId: %d, username: '%s', email: '%s', fullName: '%s', imageUrl: '%s', role: '%s', provider: '%s', isNewUser: %s}",
            data.getAccessToken(),
            data.getRefreshToken() != null ? data.getRefreshToken() : "",
            data.getUserId(),
            escapeJs(data.getUsername()),
            escapeJs(data.getEmail()),
            escapeJs(data.getFullName() != null ? data.getFullName() : ""),
            data.getImageUrl() != null ? escapeJs(data.getImageUrl()) : "",
            data.getRole() != null ? data.getRole().name() : "USER",
            data.getProvider() != null ? data.getProvider() : "GOOGLE",
            data.isNewUser()
        );
        
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Login Success</title></head><body>" +
                "<script>" +
                "if (window.opener) { window.opener.postMessage({type: 'GOOGLE_LOGIN_SUCCESS', data: " + userData + "}, '*'); }" +
                "setTimeout(() => window.close(), 2000);" +
                "</script>" +
                "<p>Login successful! This window will close automatically.</p></body></html>";
    }

    private String escapeJs(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "\\r");
    }

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
