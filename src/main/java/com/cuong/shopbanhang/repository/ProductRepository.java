package com.cuong.shopbanhang.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import com.cuong.shopbanhang.model.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductName(String name);

    Optional<Product> findByProductId(Long productId);

    List<Product> findAll();

    boolean existsByProductId(long id);

    void deleteByProductId(long id);

    @Query("SELECT p FROM Product p WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findProductsWithSearch(@Param("search") String search, Pageable pageable);
}
