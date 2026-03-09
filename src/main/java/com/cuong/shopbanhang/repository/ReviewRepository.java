package com.cuong.shopbanhang.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.model.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBook_BookIdAndUser_UserId(Long bookId, Long userId);

    Page<Review> findByBook_BookId(Long bookId, Pageable pageable);

    List<Review> findByUser_UserId(Long userId);

    // Tính điểm trung bình và số lượng review của sản phẩm
    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.book.bookId = :bookId")
    Object[] getRatingStatsByBookId(@Param("bookId") Long bookId);
    
    // Lấy điểm trung bình
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.bookId = :bookId")
    Double getAverageRating(@Param("bookId") Long bookId);
    
    // Đếm số review
    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.bookId = :bookId")
    Integer getReviewCount(@Param("bookId") Long bookId);
}
