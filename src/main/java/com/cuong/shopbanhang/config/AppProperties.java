package com.cuong.shopbanhang.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
@Component
public class AppProperties {
    private Security security;

    @Getter
    @Setter

    public static class Security {

        private List<String> allowedOrigins;
        private List<String> publicEndpoints;
    }

}
