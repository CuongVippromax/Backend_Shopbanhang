package com.cuong.shopbanhang.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Product;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByCategoryName(String name);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.categoryName) = LOWER(:categoryName)")
    List<Product> findProductsByCategoryName(String categoryName);
}
