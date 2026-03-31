package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cuong.shopbanhang.dto.request.ReviewRequest;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.ReviewResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.model.Review;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.ReviewRepository;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ReviewService")
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    // Add new review
    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Book book = bookRepository.findByBookId(request.getBookId()).orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        var existingReview = reviewRepository.findByBook_BookIdAndUser_UserId(request.getBookId(), userId);
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this book");
        }

        Review review = Review.builder()
                .book(book)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);

        return toReviewResponse(review);
    }

    // Update existing review
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);

        return toReviewResponse(review);
    }

    // Delete review
    @Transactional
    public void deleteReview(Long reviewId) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getUserId().equals(userId) && !isAdmin) {
            throw new RuntimeException("You can only delete your own review");
        }

        reviewRepository.delete(review);
    }

    // Get reviews by book
    public PageResponse<List<ReviewResponse>> getReviewsByBook(Long bookId, int page, int size) {
        if (page > 0) page = page - 1;
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByBook_BookId(bookId, pageable);

        List<ReviewResponse> reviewResponses = reviews.getContent().stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());

        return PageResponse.<List<ReviewResponse>>builder()
                .pageNo(page)
                .pageSize(size)
                .totalElements(reviews.getTotalElements())
                .totalPages(reviews.getTotalPages())
                .data(reviewResponses)
                .build();
    }

    // Get current user's reviews
    public List<ReviewResponse> getMyReviews() {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("User not login"));
        List<Review> reviews = reviewRepository.findByUser_UserId(userId);
        return reviews.stream().map(this::toReviewResponse).collect(Collectors.toList());
    }

    // Convert Review to ReviewResponse
    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .bookId(review.getBook().getBookId())
                .bookName(review.getBook().getBookName())
                .userId(review.getUser().getUserId())
                .username(review.getUser().getUsername())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
