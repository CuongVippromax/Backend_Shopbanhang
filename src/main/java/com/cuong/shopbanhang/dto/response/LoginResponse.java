package com.cuong.shopbanhang.dto.response;

import com.cuong.shopbanhang.common.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for login response
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    /** SĐT & địa chỉ lưu trên server — dùng hiển thị hồ sơ sau đăng nhập */
    private String phone;
    private String address;
    private Role role;
}
