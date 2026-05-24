package com.cuong.shopbanhang.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenResponse {
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("expires_in")
    private int expiresIn;
    
    @JsonProperty("token_type")
    private String tokenType;
    
    @JsonProperty("refresh_token")
    private String refreshToken;
    
    @JsonProperty("id_token")
    private String idToken;
    
    private String scope;
}
