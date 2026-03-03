package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.common.Role;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.UserResponse;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "UserService")
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .username(savedUser.getUsername())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }

    public PageResponse<List<UserResponse>> getAllUserswithSearchandSort(int pageNo, int pageSize, String sortBy,
            String search) {
        if (pageNo > 1)
            pageNo = pageNo - 1;
        
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
        
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(direction, sortField));
        Page<User> users = userRepository.findUsersWithSearch(search, pageable);
        List<UserResponse> userResponses = users.stream().map(user -> UserResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build()).collect(Collectors.toList());
        return PageResponse.<List<UserResponse>>builder()
                .pageNo(pageNo)
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
                .username(updatedUser.getUsername())
                .fullName(updatedUser.getFullName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .build();
    }

    public void deleteUser(Long userId) {
        User existingUser = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(existingUser);
    }

}
