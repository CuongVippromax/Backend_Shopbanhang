package com.cuong.shopbanhang.controller.user;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.CartResponse;
import com.cuong.shopbanhang.exception.UnauthorizedException;
import com.cuong.shopbanhang.security.SecurityUtils;
import com.cuong.shopbanhang.service.CartService;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private Long requireUserId() {
        return SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập."));
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        Long userId = requireUserId();
        CartResponse cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @RequestParam Long bookId,
            @RequestParam Integer quantity) {
        Long userId = requireUserId();
        CartResponse cart = cartService.addToCart(userId, bookId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateQuantity(
            @RequestParam Long bookId,
            @RequestParam Integer quantity) {
        Long userId = requireUserId();
        CartResponse cart = cartService.updateQuantity(userId, bookId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<CartResponse> removeItem(@RequestParam Long bookId) {
        Long userId = requireUserId();
        CartResponse cart = cartService.removeItem(userId, bookId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        Long userId = requireUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}
