package com.cuong.shopbanhang.security;

import java.util.Date;

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

    // Build signing key from secret
    private SecretKey signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate token from authentication
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

    // Generate token from user ID
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

    // Extract user ID from token
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    // Validate token signature
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

    // Extract username from token
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // Extract role from token
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    // Generate refresh token
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

    // Generate refresh token from user ID
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

    // Generate access token with user details
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

    // Get token expiration date
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }
}
