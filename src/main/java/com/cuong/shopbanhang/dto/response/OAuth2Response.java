package com.cuong.shopbanhang.dto.response;

import com.cuong.shopbanhang.common.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2Response {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String imageUrl;
    private Role role;
    private String provider;
    private boolean isNewUser;
}
