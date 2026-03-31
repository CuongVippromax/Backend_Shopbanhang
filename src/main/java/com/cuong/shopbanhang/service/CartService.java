package com.cuong.shopbanhang.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cuong.shopbanhang.dto.response.CartItemResponse;
import com.cuong.shopbanhang.dto.response.CartResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.model.Cart;
import com.cuong.shopbanhang.model.CartItem;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.CartRepository;
import com.cuong.shopbanhang.repository.CartItemRepository;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Get cart by user ID
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        entityManager.flush();
        entityManager.clear();

        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    // Add item to cart
    @Transactional
    public CartResponse addToCart(Long userId, Long bookId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Book book = bookRepository.findByBookId(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cartItemRepository
                .findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCartByUserId(userId);
    }

    // Update item quantity
    @Transactional
    public CartResponse updateQuantity(Long userId, Long bookId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        CartItem item = cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "bookId", bookId));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCartByUserId(userId);
    }

    // Remove item from cart
    @Transactional
    public CartResponse removeItem(Long userId, Long bookId) {
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        Optional<CartItem> item = cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId);

        if (item.isPresent()) {
            cartItemRepository.delete(item.get());
        }

        return getCartByUserId(userId);
    }

    // Clear all items from cart
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        cartItemRepository.deleteAll(cartItemRepository.findByCart_CartId(cart.getCartId()));
    }

    // Get or create cart for user
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

    // Build cart response
    private CartResponse buildCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> {
                    BigDecimal unitPrice = BigDecimal.valueOf(item.getBook().getPrice());
                    BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                    return CartItemResponse.builder()
                            .cartItemId(item.getCartItemId())
                            .bookId(item.getBook().getBookId())
                            .bookName(item.getBook().getBookName())
                            .price(unitPrice)
                            .quantity(item.getQuantity())
                            .image(item.getBook().getImage())
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
