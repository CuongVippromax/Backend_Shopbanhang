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
import com.cuong.shopbanhang.exception.TokenException;
import com.cuong.shopbanhang.exception.UnauthorizedException;
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

    /**
     * Xác thực người dùng và tạo access token + refresh token.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - BadRequestException (1): Khi username/password không đúng
     * 
     * @param request LoginRequest chứa usernameOrEmail và password
     * @return LoginResponse chứa accessToken, refreshToken, userId, username, email, role
     */
    public LoginResponse login(LoginRequest request) {
        try {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
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
            User entity = userRepository.findByUserId(userPrincipal.getId()).orElse(null);
            var builder = LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(userPrincipal.getId())
                    .username(userPrincipal.getUsername())
                    .email(userPrincipal.getEmail())
                    .role(role);
            if (entity != null) {
                builder.fullName(entity.getFullName())
                        .phone(entity.getPhone())
                        .address(entity.getAddress());
            }
            return builder.build();
        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getUsernameOrEmail(), e.getMessage());
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không đúng."); // EX-001
        }
    }

    /**
     * Tạo access token mới từ refresh token.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - TokenException (1): Khi refresh token không hợp lệ hoặc user không tồn tại
     * 
     * @param refreshToken Token để tạo access token mới
     * @return LoginResponse chứa accessToken mới, refreshToken cũ
     */
    public LoginResponse createAccessTooken(String refreshToken) {
        // EXCEPTION: TokenException - Khi token không hợp lệ
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new TokenException("Refresh token không hợp lệ hoặc đã hết hạn.", "REFRESH_TOKEN"); // EX-006
        }
        
        long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new TokenException("Người dùng không tồn tại.", "USER_ID")); // EX-006
        
        Role role = user.getRole();
        String accessToken = tokenProvider.generateAccessTokenFromUserId(userId, user.getUsername(), user.getEmail(), role.name());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userId)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(role)
                .build();
    }

    /**
     * Thay đổi mật khẩu người dùng.
     * Yêu cầu người dùng phải đăng nhập.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - BadRequestException (2): Khi mật khẩu hiện tại sai, hoặc mật khẩu mới không khớp
     * 
     * @param request ChangePasswordRequest chứa currentPassword, newPassword, confirmPassword
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UnauthorizedException("Người dùng không tồn tại.")); // EX-004

        // EXCEPTION: BadRequestException - Khi mật khẩu hiện tại sai
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng."); // EX-003
        }

        // EXCEPTION: BadRequestException - Khi mật khẩu mới và xác nhận không khớp
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu mới và xác nhận mật khẩu không khớp."); // EX-003
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Đăng xuất và thêm token vào blacklist.
     * Token sẽ bị vô hiệu hóa và không thể sử dụng lại.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - TokenException (2): Khi token không hợp lệ, hoặc hết hạn
     * 
     * @param token JWT token cần blacklist
     */
    @Transactional
    public void logout(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // EXCEPTION: TokenException - Khi token không hợp lệ
        if (!tokenProvider.validateToken(token)) {
            throw new TokenException("Token không hợp lệ.", "ACCESS_TOKEN"); // EX-006
        }

        long now = System.currentTimeMillis();
        long expiryTime = tokenProvider.getExpirationDateFromToken(token).getTime();
        long ttlMillis = expiryTime - now;
        if (ttlMillis <= 0) {
            // Token đã hết hạn, không cần blacklist
            return;
        }

        String key = "blacklist:" + token;
        redisTemplate.opsForValue().set(key, "a", ttlMillis, TimeUnit.MILLISECONDS);
        log.info("Token has been blacklisted with key {}", key);

        Long userId = tokenProvider.getUserIdFromToken(token);
        redisTemplate.delete("refreshToken:" + userId);
    }

    /**
     * Làm mới refresh token.
     * Tạo refresh token mới và lưu vào Redis.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - TokenException (3): Khi token không hợp lệ, bị thu hồi, hoặc không tìm thấy
     * 
     * @param refreshToken Refresh token cũ
     * @return Refresh token mới
     */
    public String refreshToken(String refreshToken) {
        // EXCEPTION: TokenException - Khi token không hợp lệ
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new TokenException("Refresh token không hợp lệ hoặc đã hết hạn.", "REFRESH_TOKEN"); // EX-006
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);

        // EXCEPTION: TokenException - Khi refresh token bị thu hồi hoặc không tìm thấy
        String storedToken = redisTemplate.opsForValue().get("refreshToken:" + userId);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new TokenException("Refresh token đã bị thu hồi hoặc không hợp lệ.", "REFRESH_TOKEN"); // EX-006
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
