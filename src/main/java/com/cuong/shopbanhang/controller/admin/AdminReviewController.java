package com.cuong.shopbanhang.controller.admin;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.ReviewResponse;
import com.cuong.shopbanhang.model.Review;
import com.cuong.shopbanhang.repository.ReviewRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    // Get all reviews with pagination
    @GetMapping
    public ResponseEntity<PageResponse<?>> getAllReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reviewId:desc") String sortBy,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Integer rating) {

        String[] sortParts = sortBy.split(":");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortField));

        Page<Review> reviewPage;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        if (hasSearch) {
            String keyword = search.trim();
            if (bookId != null) {
                reviewPage = reviewRepository.searchReviewsByBookId(keyword, bookId, pageable);
            } else {
                reviewPage = reviewRepository.searchReviews(keyword, pageable);
            }
        } else if (bookId != null) {
            reviewPage = reviewRepository.findByBook_BookId(bookId, pageable);
        } else {
            reviewPage = reviewRepository.findAll(pageable);
        }

        // Filter by rating if provided
        List<Review> filteredReviews = reviewPage.getContent();
        if (rating != null) {
            filteredReviews = filteredReviews.stream()
                    .filter(r -> r.getRating() != null && r.getRating().equals(rating))
                    .toList();
        }

        var reviews = filteredReviews.stream()
                .map(this::toResponse)
                .toList();

        PageResponse<?> response = PageResponse.<java.util.List<ReviewResponse>>builder()
                .pageNo(page)
                .pageSize(size)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .data(reviews)
                .build();

        return ResponseEntity.ok(response);
    }

    // Get review by ID
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Convert Review to ReviewResponse
    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .bookId(review.getBook() != null ? review.getBook().getBookId() : null)
                .bookName(review.getBook() != null ? review.getBook().getBookName() : null)
                .bookTitle(review.getBook() != null ? review.getBook().getBookName() : null)
                .bookAuthor(review.getBook() != null ? review.getBook().getAuthor() : null)
                .bookImage(review.getBook() != null ? review.getBook().getImage() : null)
                .thumbnailUrl(review.getBook() != null ? review.getBook().getImage() : null)
                .userId(review.getUser() != null ? review.getUser().getUserId() : null)
                .username(review.getUser() != null ? review.getUser().getUsername() : null)
                .userName(review.getUser() != null ? review.getUser().getUsername() : null)
                .reviewerName(review.getUser() != null ? review.getUser().getUsername() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .content(review.getComment())
                .createdAt(review.getCreatedAt())
                .reviewDate(review.getCreatedAt())
                .build();
    }
}
