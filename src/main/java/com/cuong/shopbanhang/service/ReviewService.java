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
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.exception.UnauthorizedException;
import com.cuong.shopbanhang.exception.ForbiddenException;
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

    /**
     * Thêm đánh giá mới cho sách.
     * Mỗi user chỉ được đánh giá một lần cho mỗi cuốn sách.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - ResourceNotFoundException (2): Khi không tìm thấy user hoặc book
     * - BadRequestException (3): Khi user đã đánh giá sách này
     * 
     * @param request ReviewRequest chứa bookId, rating, comment
     * @return ReviewResponse thông tin đánh giá đã tạo
     */
    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập để đánh giá.")); // EX-004
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId)); // EX-001
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy book
        Book book = bookRepository.findByBookId(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId())); // EX-001

        var existingReview = reviewRepository.findByBook_BookIdAndUser_UserId(request.getBookId(), userId);
        
        // EXCEPTION: BadRequestException - Khi user đã đánh giá sách này
        if (existingReview.isPresent()) {
            throw new BadRequestException("Bạn đã đánh giá cuốn sách này rồi. Không thể đánh giá lại."); // EX-003
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

    /**
     * Cập nhật đánh giá.
     * User chỉ được cập nhật đánh giá của chính mình.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - ResourceNotFoundException (2): Khi không tìm thấy review
     * - ForbiddenException (3): Khi user không phải người tạo review
     * 
     * @param reviewId ID của đánh giá cần cập nhật
     * @param request ReviewRequest chứa rating, comment mới
     * @return ReviewResponse thông tin đánh giá đã cập nhật
     */
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập.")); // EX-004
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId)); // EX-001

        // EXCEPTION: ForbiddenException - Khi user không phải người tạo review
        if (!review.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("Bạn chỉ có thể cập nhật đánh giá của chính mình."); // EX-005
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);

        return toReviewResponse(review);
    }

    /**
     * Xóa đánh giá.
     * User chỉ được xóa đánh giá của chính mình, admin có thể xóa tất cả.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * - ResourceNotFoundException (2): Khi không tìm thấy review
     * - ForbiddenException (3): Khi user không có quyền xóa
     * 
     * @param reviewId ID của đánh giá cần xóa
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập.")); // EX-004
        
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId)); // EX-001

        // EXCEPTION: ForbiddenException - Khi user không có quyền xóa
        if (!review.getUser().getUserId().equals(userId) && !isAdmin) {
            throw new ForbiddenException("Bạn chỉ có thể xóa đánh giá của chính mình."); // EX-005
        }

        reviewRepository.delete(review);
    }

    /**
     * Lấy danh sách đánh giá theo sách.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy book
     * 
     * @param bookId ID của sách
     * @param page Số trang (bắt đầu từ 1)
     * @param size Kích thước trang
     * @return PageResponse chứa danh sách ReviewResponse
     */
    public PageResponse<List<ReviewResponse>> getReviewsByBook(Long bookId, int page, int size) {
        if (page > 0) page = page - 1;
        
        // Kiểm tra sách có tồn tại không
        bookRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", bookId)); // EX-001
        
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

    /**
     * Lấy danh sách đánh giá của người dùng hiện tại.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - UnauthorizedException (1): Khi người dùng chưa đăng nhập
     * 
     * @return List<ReviewResponse> danh sách đánh giá
     */
    public List<ReviewResponse> getMyReviews() {
        // EXCEPTION: UnauthorizedException - Khi người dùng chưa đăng nhập
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập.")); // EX-004
        
        List<Review> reviews = reviewRepository.findByUser_UserId(userId);
        return reviews.stream().map(this::toReviewResponse).collect(Collectors.toList());
    }

    /**
     * Chuyển đổi Review entity sang ReviewResponse DTO.
     * 
     * @param review Review entity
     * @return ReviewResponse
     */
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
