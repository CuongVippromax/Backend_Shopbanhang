package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.dto.ChangePasswordRequest;
import com.cuong.shopbanhang.dto.LoginRequest;
import com.cuong.shopbanhang.dto.LoginResponse;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.model.Role;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.JwtTokenProvider;
import com.cuong.shopbanhang.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AuthService")
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    public LoginResponse login(LoginRequest request) {
        try {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .roles(roles)
                .build();
} catch (Exception e) {
    throw new BadRequestException("Invalid username or password");
    log.error("Error in login: {}", e.getMessage());
}
}

    public LoginResponse createAccessTooken(String refreshToken) {
        long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new BadRequestException("Invalid username or password"));
        Set<Role> roles = user.getRoles();
        String accessToken = tokenProvider.generateAccessTokenFromUserId(userId,user.getUsername(), user.getEmail(), roles.toString());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userId)
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles.stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }
    public void changePassword(ChangePasswordRequest request) {
        Long userId = SecurityContextHolder.getContext().getAuthentication().getPrincipal().getId();
        User user = userRepository.findByUserId(userId).orElseThrow(
            () -> new BadRequestException("User not found"));
            if(!passwordEncoder.matcher(passwordEncoder.encode(request.getCurrentPassword())).matches(user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
                if(!request.getNewPassword().equals(request.getConfirmPassword())) {
                    throw new BadRequestException("New password and confirm password do not match");
                }
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
            }
    }
    public void logout(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        // Bỏ prefix Bearer nếu có
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
            // Token đã hết hạn hoặc sắp hết hạn, không cần blacklist
            return;
        }

        String key = "blacklist:" + token; 
       redisTemplate.opsForValue().set(key,"a",ttlMillis,TimeUnit.MILLISECONDS);
        log.info("Token has been blacklisted with key {}", key);
    }
    }
