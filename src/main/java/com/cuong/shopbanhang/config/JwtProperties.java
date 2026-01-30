package com.cuong.shopbanhang.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secretKey;
    private String issuer;
    private Token accessToken;
    private Token refreshToken;

    @Getter
    @Setter
    public static class Token {
        private long expiration;
    }
}
