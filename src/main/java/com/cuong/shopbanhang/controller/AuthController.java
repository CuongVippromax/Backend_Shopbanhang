package com.cuong.shopbanhang.controller;

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
    public ResposneEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().build();
}
@PostMapping("/refresh-token")
public ResponseEntity<LoginResponse> refreshToken(@RequestBody String refreshToken) {
    LoginResponse response = authService.refreshToken(refreshToken);
    return ResponseEntity.ok().body(response);
}
@PostMapping("/change-password")
public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
    authService.changePassword(request);
    return ResponseEntity.ok().build();
}
}