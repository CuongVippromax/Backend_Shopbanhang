package com.cuong.shopbanhang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.cuong.shopbanhang.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class ShopbanhangApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopbanhangApplication.class, args);
    }

}
