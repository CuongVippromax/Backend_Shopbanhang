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

    public UserResponse createUser(User user) {
        if(userRepository.findByEmail(user.getEmail().toString()).isPresent()){
            throw new RuntimeException("Email already exists");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        
        // Gắn role USER mặc định
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

    public PageResponse<List<UserResponse>> getAllUserswithSearchandSort(int pageNo, int pageSize, String sortBy,
            String search) {
        // Frontend gửi pageNo 1-based (trang 1, 2, 3...) → chuyển sang 0-based cho Spring
        int zeroBasedPage = pageNo <= 0 ? 0 : pageNo - 1;
        log.info("getAllUserswithSearchandSort → raw pageNo={}, zeroBasedPage={}, pageSize={}, sortBy={}, search={}", pageNo, zeroBasedPage, pageSize, sortBy, search);

        String sortField = "userId";  // Default sort field
        Sort.Direction direction = Sort.Direction.ASC;  // Default direction

        if (StringUtils.hasLength(sortBy)) {
            // Support both "field:direction" and just "field"
            String[] parts = sortBy.split(":");
            sortField = parts[0];
            if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
                direction = Sort.Direction.DESC;
            }
        }

        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, Sort.by(direction, sortField));
        log.info("Querying repository with pageable: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
        Page<User> users = userRepository.findUsersWithSearch(search, pageable);
        log.info("Repository returned: totalElements={}, totalPages={}, content.size={}", users.getTotalElements(), users.getTotalPages(), users.getContent().size());
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

    public void deleteUser(Long userId) {
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(existingUser);
    }

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

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
        
        // Create new reset token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);
        
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .build();
        
        passwordResetTokenRepository.save(resetToken);
        
        // Send email
        emailService.sendPasswordResetEmail(email, token);
        log.info("Password reset token sent to email: {}", email);
    }

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
        
        // Delete the used token
        passwordResetTokenRepository.delete(resetToken);
        
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

}
