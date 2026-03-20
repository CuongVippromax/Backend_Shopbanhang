package com.cuong.shopbanhang.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
    private Security security;

    @Getter
    @Setter
    public static class Security {
        private List<String> allowedOrigins;
        private List<String> publicEndpoints;
    }
}
