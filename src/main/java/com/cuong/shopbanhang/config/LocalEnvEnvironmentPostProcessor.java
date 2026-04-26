package com.cuong.shopbanhang.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class LocalEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "localEnv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String workingDir = System.getProperty("user.dir");
        Resource resource = new FileSystemResource(workingDir + "/local.env");
        if (!resource.exists()) {
            return;
        }

        Properties properties = new Properties();
        try (InputStream inputStream = resource.getInputStream()) {
            properties.load(inputStream);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load local.env", e);
        }

        Map<String, Object> envVars = new HashMap<>();
        properties.forEach((key, value) -> envVars.put(key.toString(), value));

        PropertySource<?> propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, envVars);
        environment.getPropertySources().addLast(propertySource);
    }
}
