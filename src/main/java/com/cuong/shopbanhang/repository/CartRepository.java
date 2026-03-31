package com.cuong.shopbanhang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.model.Cart;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // find cart by user id
    Optional<Cart> findByUser_UserId(Long userId);
}
