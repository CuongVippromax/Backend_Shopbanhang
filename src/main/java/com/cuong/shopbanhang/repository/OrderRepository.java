package com.cuong.shopbanhang.repository;

import java.time.LocalDateTime;

import com.cuong.shopbanhang.model.Order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUser_UserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "o.id LIKE %:search% OR " +
           "o.user.name LIKE %:search% OR " +
           "o.user.email LIKE %:search% OR " +
           "o.user.phone LIKE %:search% OR " +
           "o.shippingAddress LIKE %:search%) " +
           "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
           "AND (:endDate IS NULL OR o.orderDate <= :endDate)")
    Page<Order> searchOrders(@Param("search") String search,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate,
                              Pageable pageable);

}
