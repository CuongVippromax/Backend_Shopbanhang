package com.cuong.shopbanhang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.PropertySource;


import com.cuong.shopbanhang.config.AppProperties;
import com.cuong.shopbanhang.config.JwtProperties;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableConfigurationProperties({JwtProperties.class, AppProperties.class})
@PropertySource(value = "classpath:local.env", ignoreResourceNotFound = true)
public class ShopbanhangApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopbanhangApplication.class, args);
    }

}
