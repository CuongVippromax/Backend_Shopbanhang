package com.cuong.shopbanhang.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cuong.shopbanhang.dto.response.CartItemResponse;
import com.cuong.shopbanhang.dto.response.CartResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.exception.CartException;
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

    /**
     * Lấy giỏ hàng của người dùng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy user
     * 
     * @param userId ID của người dùng
     * @return CartResponse thông tin giỏ hàng
     */
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        entityManager.flush();
        entityManager.clear();

        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    /**
     * Thêm sách vào giỏ hàng.
     * Nếu sách đã có trong giỏ, tăng số lượng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - CartException (1): Khi số lượng <= 0
     * - ResourceNotFoundException (2): Khi không tìm thấy sách hoặc user
     * 
     * @param userId ID của người dùng
     * @param bookId ID của sách cần thêm
     * @param quantity Số lượng cần thêm
     * @return CartResponse thông tin giỏ hàng sau khi thêm
     */
    @Transactional
    public CartResponse addToCart(Long userId, Long bookId, Integer quantity) {
        // EXCEPTION: CartException - Khi số lượng không hợp lệ
        if (quantity <= 0) {
            throw new CartException("Số lượng phải lớn hơn 0."); // EX-008
        }

        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy sách
        Book book = bookRepository.findByBookId(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId)); // EX-001
        
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
            log.info("Added new book {} to cart {}", bookId, userId);
        }

        return getCartByUserId(userId);
    }

    /**
     * Cập nhật số lượng sách trong giỏ hàng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - CartException (1): Khi số lượng <= 0
     * - ResourceNotFoundException (2): Khi không tìm thấy giỏ hàng, sách trong giỏ
     * 
     * @param userId ID của người dùng
     * @param bookId ID của sách cần cập nhật
     * @param quantity Số lượng mới
     * @return CartResponse thông tin giỏ hàng sau khi cập nhật
     */
    @Transactional
    public CartResponse updateQuantity(Long userId, Long bookId, Integer quantity) {
        // EXCEPTION: CartException - Khi số lượng không hợp lệ
        if (quantity <= 0) {
            throw new CartException("Số lượng phải lớn hơn 0."); // EX-008
        }

        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy giỏ hàng
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId)); // EX-001
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy sách trong giỏ
        CartItem item = cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "bookId", bookId)); // EX-001

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCartByUserId(userId);
    }

    /**
     * Xóa sách khỏi giỏ hàng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy giỏ hàng
     * 
     * @param userId ID của người dùng
     * @param bookId ID của sách cần xóa
     * @return CartResponse thông tin giỏ hàng sau khi xóa
     */
    @Transactional
    public CartResponse removeItem(Long userId, Long bookId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy giỏ hàng
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId)); // EX-001
        
        Optional<CartItem> item = cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId);

        if (item.isPresent()) {
            cartItemRepository.delete(item.get());
        }

        return getCartByUserId(userId);
    }

    /**
     * Xóa tất cả sách trong giỏ hàng.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy giỏ hàng
     * 
     * @param userId ID của người dùng
     */
    @Transactional
    public void clearCart(Long userId) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy giỏ hàng
        Cart cart = cartRepository.findByUser_UserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId)); // EX-001
        
        cartItemRepository.deleteAll(cartItemRepository.findByCart_CartId(cart.getCartId()));
    }

    
    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findByUserId(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Xây dựng CartResponse từ Cart entity.
     * 
     * @param cart Cart entity
     * @return CartResponse
     */
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
