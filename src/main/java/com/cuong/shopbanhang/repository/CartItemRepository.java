package com.cuong.shopbanhang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.model.CartItem;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // find cart items by cart id
    List<CartItem> findByCart_CartId(Long cartId);

    // find cart item by cart and book
    Optional<CartItem> findByCart_CartIdAndBook_BookId(Long cartId, Long bookId);
}
