package com.cuong.shopbanhang.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

// DTO for user data
@Getter
@Setter
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String phoneNumber;
    private String address;
    private List<AddressResponse> addresses;
    private String role;
}
