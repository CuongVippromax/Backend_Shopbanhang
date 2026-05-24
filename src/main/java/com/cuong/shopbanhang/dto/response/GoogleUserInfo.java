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
public class GoogleUserInfo {
    private String id;
    private String email;
    
    @JsonProperty("verified_email")
    private boolean verifiedEmail;
    
    private String name;
    
    @JsonProperty("given_name")
    private String givenName;
    
    @JsonProperty("family_name")
    private String familyName;
    
    private String picture;
    private String locale;
}
