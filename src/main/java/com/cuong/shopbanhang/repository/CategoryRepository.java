package com.cuong.shopbanhang.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Book;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // check if category exists by name
    boolean existsByCategoryName(String name);

    @Query("SELECT c FROM Category c WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))"
        )
    Page<Category> findCategoriesWithSearch(@Param("search") String search, Pageable pageable);

    // find books by category name
    @Query("SELECT b FROM Book b WHERE LOWER(b.category.categoryName) = LOWER(:categoryName)")
    List<Book> findBooksByCategoryName(String categoryName);
}
