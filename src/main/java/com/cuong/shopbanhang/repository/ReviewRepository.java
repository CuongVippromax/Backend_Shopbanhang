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

    // find review by book and user
    Optional<Review> findByBook_BookIdAndUser_UserId(Long bookId, Long userId);

    // find reviews by book id
    Page<Review> findByBook_BookId(Long bookId, Pageable pageable);

    // find reviews by user id
    List<Review> findByUser_UserId(Long userId);

    // search reviews by keyword
    @Query("SELECT r FROM Review r WHERE LOWER(r.book.bookName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.user.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Review> searchReviews(@Param("keyword") String keyword, Pageable pageable);

    // search reviews by keyword and book id
    @Query("SELECT r FROM Review r WHERE (:bookId IS NULL OR r.book.bookId = :bookId) AND (LOWER(r.book.bookName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Review> searchReviewsByBookId(@Param("keyword") String keyword, @Param("bookId") Long bookId, Pageable pageable);

    // get rating stats by book id
    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.book.bookId = :bookId")
    Object[] getRatingStatsByBookId(@Param("bookId") Long bookId);
    
    // get average rating for book
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.bookId = :bookId")
    Double getAverageRating(@Param("bookId") Long bookId);
    
    // get review count for book
    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.bookId = :bookId")
    Integer getReviewCount(@Param("bookId") Long bookId);
}
