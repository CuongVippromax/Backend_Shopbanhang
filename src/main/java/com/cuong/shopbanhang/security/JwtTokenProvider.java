package com.cuong.shopbanhang.security;

import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.cuong.shopbanhang.config.JwtProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j(topic = "JwtTokenProvider")
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String role = authentication.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElseThrow(null);
        Date now = new Date();
        Date expriryDate = new Date(now.getTime() + jwtProperties.getAccessToken().getExpiration());
        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(now)
                .setExpiration(expriryDate)
                .claim("role", role)
                .claim("username", userPrincipal.getUsername())
                .claim("email", userPrincipal.getEmail())
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateTokenFromUserId(Long userId) {
        Date now = new Date();
        Date expriryDate = new Date(now.getTime() + jwtProperties.getAccessToken().getExpiration());
        return Jwts.builder()
                .setSubject(Long.toString(userId))
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(new Date())
                .setExpiration(expriryDate)
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshToken().getExpiration());
        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .claim("type", "refresh")
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshTokenFromUserId(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshToken().getExpiration());
        return Jwts.builder()
                .setSubject(Long.toString(userId))
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .claim("type", "refresh")
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateAccessTokenFromUserId(Long userId, String username, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getAccessToken().getExpiration());
        return Jwts.builder()
                .setSubject(Long.toString(userId))
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .claim("role", role)
                .claim("username", username)
                .claim("email", email)
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // dùng cho logout: lấy thời điểm hết hạn của token
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }
}