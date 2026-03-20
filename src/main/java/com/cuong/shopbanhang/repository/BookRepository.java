package com.cuong.shopbanhang.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import com.cuong.shopbanhang.model.Book;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByBookName(String name);

    Optional<Book> findByBookId(Long bookId);

    List<Book> findAll();

    boolean existsByBookId(long id);

    void deleteByBookId(long id);

    Long countByQuantityBetween(Integer from, Integer to);
    Long countByQuantity(Integer quantity);

    @Query("SELECT b FROM Book b WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(b.bookName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:category IS NULL OR :category = '' OR " +
            "LOWER(b.category.categoryName) LIKE LOWER(CONCAT('%', :category, '%')))"
        )
    Page<Book> findBooksWithSearchAndCategory(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(b.bookName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')))"
        )
    Page<Book> findBooksWithSearch(@Param("search") String search, Pageable pageable);
}
