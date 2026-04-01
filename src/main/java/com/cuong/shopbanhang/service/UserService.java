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
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
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

    /**
     * Tạo người dùng mới (đăng ký).
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceAlreadyExistsException (1): Khi email đã tồn tại trong hệ thống
     * - BadRequestException (2): Khi dữ liệu không hợp lệ
     * 
     * @param user Thông tin người dùng cần tạo
     * @return UserResponse thông tin người dùng đã tạo
     */
    @Transactional
    public UserResponse createUser(User user) {
        // EXCEPTION: ResourceAlreadyExistsException - Khi email đã tồn tại
        if (userRepository.findByEmail(user.getEmail().toString()).isPresent()) {
            throw new ResourceAlreadyExistsException("Email", "email", user.getEmail()); // EX-002
        }
        
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getUserId());
        
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

    /**
     * Lấy thông tin người dùng theo ID.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy người dùng với ID tương ứng
     * 
     * @param userId ID của người dùng cần lấy
     * @return UserResponse thông tin người dùng
     */
    public UserResponse getUserById(Long userId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001
        
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

    /**
     * Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và sắp xếp.
     * 
     * @param pageNo Số trang (bắt đầu từ 1)
     * @param pageSize Kích thước trang
     * @param sortBy Trường sắp xếp (VD: userId:desc)
     * @param search Từ khóa tìm kiếm
     * @return PageResponse chứa danh sách UserResponse
     */
    public PageResponse<List<UserResponse>> getAllUserswithSearchandSort(int pageNo, int pageSize, String sortBy, String search) {
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

    /**
     * Cập nhật thông tin người dùng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy người dùng với ID tương ứng
     * 
     * @param userId ID của người dùng cần cập nhật
     * @param user Thông tin mới của người dùng
     * @return UserResponse thông tin người dùng đã cập nhật
     */
    @Transactional
    public UserResponse updateUser(Long userId, User user) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001
        
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
        log.info("User updated: {}", userId);
        
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

    /**
     * Xóa người dùng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy người dùng với ID tương ứng
     * 
     * @param userId ID của người dùng cần xóa
     */
    @Transactional
    public void deleteUser(Long userId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001
        
        userRepository.delete(existingUser);
        log.info("User deleted: {}", userId);
    }

    /**
     * Cập nhật vai trò của người dùng (USER -> ADMIN hoặc ADMIN -> USER).
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy người dùng
     * - BadRequestException (2): Khi vai trò không hợp lệ
     * 
     * @param userId ID của người dùng cần cập nhật vai trò
     * @param role Tên vai trò mới (USER hoặc ADMIN)
     * @return UserResponse thông tin người dùng đã cập nhật
     */
    @Transactional
    public UserResponse updateUserRole(Long userId, String role) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001

        Role newRole;
        try {
            newRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            // EXCEPTION: BadRequestException - Khi vai trò không hợp lệ
            throw new BadRequestException("Vai trò không hợp lệ: " + role + ". Chỉ chấp nhận USER hoặc ADMIN."); // EX-003
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

    /**
     * Gửi email đặt lại mật khẩu.
     * Tạo token đặt lại mật khẩu có hiệu lực trong 24 giờ.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy người dùng với email tương ứng
     * - BadRequestException (2): Khi gửi email thất bại
     * 
     * @param email Địa chỉ email của người dùng
     */
    @Transactional
    public void forgotPassword(String email) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user với email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email)); // EX-001

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Gửi email - có thể ném BadRequestException nếu email không gửi được
        emailService.sendPasswordResetEmail(email, token);
        log.info("Password reset token sent to email: {}", email);
    }

    /**
     * Đặt lại mật khẩu với token.
     * Token phải còn hiệu lực (chưa hết hạn).
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - BadRequestException (3): Khi token không hợp lệ hoặc đã hết hạn
     * 
     * @param token Token đặt lại mật khẩu
     * @param newPassword Mật khẩu mới
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // EXCEPTION: BadRequestException - Khi token không tồn tại
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token đặt lại mật khẩu không hợp lệ.")); // EX-003

        // EXCEPTION: BadRequestException - Khi token đã hết hạn
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Token đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu gửi lại email."); // EX-003
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }
}
