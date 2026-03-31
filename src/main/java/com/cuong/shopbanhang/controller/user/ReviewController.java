package com.cuong.shopbanhang.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.request.ReviewRequest;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.ReviewResponse;
import com.cuong.shopbanhang.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Add new review
    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(request));
    }

    // Update existing review
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, request));
    }

    // Delete review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }

    // Get reviews by book
    @GetMapping("/book/{bookId}")
    public ResponseEntity<PageResponse<?>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getReviewsByBook(bookId, page, size));
    }

    // Get current user's reviews
    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
}
