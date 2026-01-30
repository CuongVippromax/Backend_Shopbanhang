package com.cuong.shopbanhang.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.dto.CartItemResponse;
import com.cuong.shopbanhang.dto.CartResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.model.Cart;
import com.cuong.shopbanhang.model.CartItem;
import com.cuong.shopbanhang.model.Product;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.CartRepository;
import com.cuong.shopbanhang.repository.CartItemRepository;
import com.cuong.shopbanhang.repository.ProductRepository;
import com.cuong.shopbanhang.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CartService")
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Lấy giỏ hàng của user
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    // Thêm sản phẩm vào giỏ hàng
    public CartResponse addToCart(Long userId, Long productId, Integer quantity) {
        // Validate quantity > 0
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        Cart cart = getOrCreateCart(userId);

        // Check if product already in cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCart_CartIdAndProduct_ProductId(cart.getCartId(), productId);

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Create new item
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCartByUserId(userId);
    }

    // Cập nhật số lượng sản phẩm
    public CartResponse updateQuantity(Long userId, Long productId, Integer quantity) {
        // Validate quantity > 0
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        CartItem item = cartItemRepository.findByCart_CartIdAndProduct_ProductId(cart.getCartId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "productId", productId));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCartByUserId(userId);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        Optional<CartItem> item = cartItemRepository.findByCart_CartIdAndProduct_ProductId(cart.getCartId(), productId);

        if (item.isPresent()) {
            cartItemRepository.delete(item.get());
        }

        return getCartByUserId(userId);
    }

    // Xóa toàn bộ giỏ hàng
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        cartItemRepository.deleteAll(cartItemRepository.findByCart_CartId(cart.getCartId()));
    }

    // Helper methods
    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findByUserId(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> {
                    BigDecimal unitPrice = BigDecimal.valueOf(item.getProduct().getPrice());
                    BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                    return CartItemResponse.builder()
                            .cartItemId(item.getCartItemId())
                            .productId(item.getProduct().getProductId())
                            .productName(item.getProduct().getProductName())
                            .price(unitPrice)
                            .quantity(item.getQuantity())
                            .image(item.getProduct().getImage())
                            .totalPrice(totalPrice)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal totalPrice = itemResponses.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUser() != null ? cart.getUser().getUserId() : null)
                .items(itemResponses)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}