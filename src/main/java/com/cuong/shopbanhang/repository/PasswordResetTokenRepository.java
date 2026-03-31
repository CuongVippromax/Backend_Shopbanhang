package com.cuong.shopbanhang.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.model.PasswordResetToken;
import com.cuong.shopbanhang.model.User;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    // find token by token string
    Optional<PasswordResetToken> findByToken(String token);
    
    // delete tokens by user
    void deleteByUser(User user);
}
