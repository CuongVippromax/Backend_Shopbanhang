package com.cuong.shopbanhang.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.common.Role;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.UserResponse;
import com.cuong.shopbanhang.model.PasswordResetToken;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.PasswordResetTokenRepository;
import com.cuong.shopbanhang.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "UserService")
public class UserService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Create new user
    public UserResponse createUser(User user) {
        if(userRepository.findByEmail(user.getEmail().toString()).isPresent()){
            throw new RuntimeException("Email already exists");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        return UserResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .phoneNumber(savedUser.getPhone())
                .address(savedUser.getAddress())
                .role(savedUser.getRole() != null ? savedUser.getRole().name() : "USER")
                .build();
    }

    // Get user by ID
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .phoneNumber(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build();
    }

    // Get all users with pagination
    public PageResponse<List<UserResponse>> getAllUserswithSearchandSort(int pageNo, int pageSize, String sortBy,
            String search) {
        int zeroBasedPage = pageNo <= 0 ? 0 : pageNo - 1;

        String sortField = "userId";
        Sort.Direction direction = Sort.Direction.ASC;

        if (StringUtils.hasLength(sortBy)) {
            String[] parts = sortBy.split(":");
            sortField = parts[0];
            if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
                direction = Sort.Direction.DESC;
            }
        }

        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, Sort.by(direction, sortField));
        Page<User> users = userRepository.findUsersWithSearch(search, pageable);
        List<UserResponse> userResponses = users.stream().map(user -> UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .phoneNumber(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build()).collect(Collectors.toList());
        return PageResponse.<List<UserResponse>>builder()
                .pageNo(zeroBasedPage)
                .pageSize(pageSize)
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .data(userResponses)
                .build();
    }

    // Update user
    public UserResponse updateUser(Long userId, User user) {
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUsername() != null) {
            existingUser.setUsername(user.getUsername());
        }
        if (user.getFullName() != null) {
            existingUser.setFullName(user.getFullName());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        if (user.getAddress() != null) {
            existingUser.setAddress(user.getAddress());
        }
        User updatedUser = userRepository.save(existingUser);
        return UserResponse.builder()
                .userId(updatedUser.getUserId())
                .username(updatedUser.getUsername())
                .fullName(updatedUser.getFullName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .phoneNumber(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .role(updatedUser.getRole() != null ? updatedUser.getRole().name() : "USER")
                .build();
    }

    // Delete user
    public void deleteUser(Long userId) {
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(existingUser);
    }

    // Update user role
    @Transactional
    public UserResponse updateUserRole(Long userId, String role) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole;
        try {
            newRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Vai trò không hợp lệ: " + role);
        }

        user.setRole(newRole);
        User updated = userRepository.save(user);
        log.info("Updated user {} role to {}", userId, newRole);

        return UserResponse.builder()
                .userId(updated.getUserId())
                .username(updated.getUsername())
                .fullName(updated.getFullName())
                .email(updated.getEmail())
                .phone(updated.getPhone())
                .phoneNumber(updated.getPhone())
                .address(updated.getAddress())
                .role(updated.getRole() != null ? updated.getRole().name() : "USER")
                .build();
    }

    // Send password reset email
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .build();

        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(email, token);
        log.info("Password reset token sent to email: {}", email);
    }

    // Reset password with token
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

}
