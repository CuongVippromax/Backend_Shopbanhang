package com.cuong.shopbanhang.controller.user;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.CartResponse;
import com.cuong.shopbanhang.service.CartService;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userId) {
        CartResponse cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CartResponse> addToCart(
            @PathVariable Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.addToCart(userId, bookId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.updateQuantity(userId, bookId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long userId,
            @RequestParam Long bookId) {
        CartResponse cart = cartService.removeItem(userId, bookId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}
