package com.cuong.shopbanhang.service;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.dto.request.ChangePasswordRequest;
import com.cuong.shopbanhang.dto.request.LoginRequest;
import com.cuong.shopbanhang.dto.response.LoginResponse;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.common.Role;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.JwtTokenProvider;
import com.cuong.shopbanhang.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AuthService")
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;

    // Authenticate user and generate tokens
    public LoginResponse login(LoginRequest request) {
        try {
        log.info("Login attempt for: {}", request.getUsernameOrEmail());
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        log.info("Authentication success for: {}", request.getUsernameOrEmail());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        redisTemplate.opsForValue().set(
                "refreshToken:" + userPrincipal.getId(),
                refreshToken,
                7, TimeUnit.DAYS
        );

        Role role = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(Role::valueOf)
                .findFirst()
                .orElse(Role.USER);
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .role(role)
                .build();
} catch (Exception e) {
    log.error("Login error for {}: {}", request.getUsernameOrEmail(), e.getMessage());
    throw new BadRequestException("Invalid username or password");

}
}

    // Create access token from refresh token
    public LoginResponse createAccessTooken(String refreshToken) {
        long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new BadRequestException("Invalid username or password"));
        Role role = user.getRole();
        String accessToken = tokenProvider.generateAccessTokenFromUserId(userId,user.getUsername(), user.getEmail(), role.name());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userId)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(role)
                .build();
    }

    // Change user password
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new BadRequestException("User not found"));


        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }


        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Logout and blacklist token
    @Transactional
    public void logout(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!tokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid token");
        }

        long now = System.currentTimeMillis();
        long expiryTime = tokenProvider.getExpirationDateFromToken(token).getTime();
        long ttlMillis = expiryTime - now;
        if (ttlMillis <= 0) {
            return;
        }

        String key = "blacklist:" + token;
       redisTemplate.opsForValue().set(key,"a",ttlMillis,TimeUnit.MILLISECONDS);
        log.info("Token has been blacklisted with key {}", key);

        Long userId = tokenProvider.getUserIdFromToken(token);
        redisTemplate.delete("refreshToken:" + userId);
        log.info("Refresh token has been removed for user {}", userId);
    }

    // Refresh token
    public String refreshToken(String refreshToken) {

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);


        String storedToken = redisTemplate.opsForValue().get("refreshToken:" + userId);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new BadRequestException("Refresh token has been revoked or not found");
        }


        String newRefreshToken = tokenProvider.generateRefreshTokenFromUserId(userId);

        redisTemplate.delete("refreshToken:" + userId);


        redisTemplate.opsForValue().set(
                "refreshToken:" + userId,
                newRefreshToken,
                7, TimeUnit.DAYS
        );

        return newRefreshToken;
    }
}
