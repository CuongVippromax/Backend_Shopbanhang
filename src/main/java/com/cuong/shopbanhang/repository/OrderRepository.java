package com.cuong.shopbanhang.repository;

import java.time.LocalDateTime;

import com.cuong.shopbanhang.common.OrderStatus;
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
           "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
           "o.user.fullName LIKE CONCAT('%', :search, '%') OR " +
           "o.user.email LIKE CONCAT('%', :search, '%') OR " +
           "o.user.phone LIKE CONCAT('%', :search, '%') OR " +
           "o.shippingAddress LIKE CONCAT('%', :search, '%')) " +
           "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
           "AND (:endDate IS NULL OR o.orderDate <= :endDate)")
    Page<Order> searchOrders(@Param("search") String search,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate,
                              Pageable pageable);

    // Thống kê: Tổng doanh thu
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = com.cuong.shopbanhang.common.PaymentStatus.PAID")
    Double getTotalRevenue();

    // Thống kê: Đếm đơn hàng theo trạng thái
    Long countByOrderStatus(OrderStatus orderStatus);
}
