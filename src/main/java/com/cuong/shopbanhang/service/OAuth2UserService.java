package com.cuong.shopbanhang.service;

import com.cuong.shopbanhang.common.AuthProvider;
import com.cuong.shopbanhang.common.Role;
import com.cuong.shopbanhang.dto.request.GoogleTokenRequest;
import com.cuong.shopbanhang.dto.response.GoogleTokenResponse;
import com.cuong.shopbanhang.dto.response.GoogleUserInfo;
import com.cuong.shopbanhang.dto.response.OAuth2Response;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "OAuth2UserService")
public class OAuth2UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${app.base-url}")
    private String appBaseUrl;

    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

    @Transactional
    public OAuth2Response processGoogleLogin(GoogleTokenRequest request) {
        String code = request.getCode();
        String redirectUri = request.getRedirectUri() != null 
                ? request.getRedirectUri() 
                : appBaseUrl + "/api/v1/auth/google/callback";

        String accessToken = exchangeCodeForAccessToken(code, redirectUri);
        
        if (accessToken == null) {
            throw new BadRequestException("Failed to exchange code for access token.");
        }

        GoogleUserInfo userInfo = getGoogleUserInfo(accessToken);
        
        if (userInfo == null) {
            throw new BadRequestException("Failed to get user info from Google.");
        }
        
        if (!userInfo.isVerifiedEmail()) {
            throw new BadRequestException("Google email is not verified.");
        }

        User user = findOrCreateGoogleUser(userInfo);
        return generateOAuth2Response(user);
    }

    private String exchangeCodeForAccessToken(String code, String redirectUri) {
        try {
            log.info("Exchanging code for access token with redirect_uri: {}", redirectUri);
            
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> httpRequest = new HttpEntity<>(params, headers);
            
            ResponseEntity<GoogleTokenResponse> response = restTemplate.exchange(
                    GOOGLE_TOKEN_URL,
                    HttpMethod.POST,
                    httpRequest,
                    GoogleTokenResponse.class
            );

            GoogleTokenResponse tokenResponse = response.getBody();
            if (tokenResponse != null && tokenResponse.getAccessToken() != null) {
                return tokenResponse.getAccessToken();
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to exchange code for access token: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            return null;
        }
    }

    private GoogleUserInfo getGoogleUserInfo(String accessToken) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                    GOOGLE_USER_INFO_URL,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    GoogleUserInfo.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to get Google user info: {}", e.getMessage());
            return null;
        }
    }

    private User findOrCreateGoogleUser(GoogleUserInfo userInfo) {
        User user = userRepository.findByEmail(userInfo.getEmail()).orElse(null);
        
        if (user != null) {
            // Nếu user đăng ký bằng phương thức khác, cập nhật provider về GOOGLE
            if (user.getProvider() != AuthProvider.GOOGLE) {
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(userInfo.getId());
            }
            
            // Cập nhật thông tin từ Google
            if (!userInfo.getId().equals(user.getProviderId())) {
                user.setProviderId(userInfo.getId());
            }
            if (userInfo.getPicture() != null && !userInfo.getPicture().equals(user.getImageUrl())) {
                user.setImageUrl(userInfo.getPicture());
            }
            if (userInfo.getName() != null && !userInfo.getName().equals(user.getFullName())) {
                user.setFullName(userInfo.getName());
            }
            return userRepository.save(user);
        }

        // Tạo user mới nếu chưa tồn tại
        String username = generateUniqueUsername(userInfo.getEmail());
        String randomPassword = generateRandomPassword();

        User newUser = User.builder()
                .username(username)
                .password(randomPassword)
                .fullName(userInfo.getName() != null ? userInfo.getName() : username)
                .email(userInfo.getEmail())
                .imageUrl(userInfo.getPicture())
                .provider(AuthProvider.GOOGLE)
                .providerId(userInfo.getId())
                .role(Role.USER)
                .deleted(false)
                .build();

        return userRepository.save(newUser);
    }

    private String generateUniqueUsername(String email) {
        String baseUsername = email.split("@")[0]
                .replaceAll("[^a-zA-Z0-9]", "")
                .toLowerCase();
        
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
            if (counter > 1000) {
                username = baseUsername + System.currentTimeMillis();
                break;
            }
        }
        
        return username;
    }

    private String generateRandomPassword() {
        return "GOOGLE_" + java.util.UUID.randomUUID().toString().replace("-", "");
    }

    private OAuth2Response generateOAuth2Response(User user) {
        String accessToken = tokenProvider.generateAccessTokenFromUserId(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
        
        String refreshToken = tokenProvider.generateRefreshTokenFromUserId(user.getUserId());

        boolean isNewUser = user.getProviderId() != null && 
                user.getPassword() != null && 
                user.getPassword().startsWith("GOOGLE_");

        return OAuth2Response.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .imageUrl(user.getImageUrl())
                .role(user.getRole())
                .provider(user.getProvider().name())
                .isNewUser(isNewUser)
                .build();
    }
}
