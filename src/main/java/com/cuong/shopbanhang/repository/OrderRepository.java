package com.cuong.shopbanhang.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUser_UserId(Long userId, Pageable pageable);

    @Query(value = "SELECT o FROM Order o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "CAST(o.orderId AS string) LIKE CONCAT('%', :search, '%') OR " +
           "o.shippingAddress LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(o) FROM Order o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "CAST(o.orderId AS string) LIKE CONCAT('%', :search, '%') OR " +
           "o.shippingAddress LIKE CONCAT('%', :search, '%'))")
    Page<Order> searchOrders(@Param("search") String search, Pageable pageable);

    // Thống kê: Tổng doanh thu
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = com.cuong.shopbanhang.common.PaymentStatus.PAID")
    Double getTotalRevenue();

    // Thống kê: Đếm đơn hàng theo trạng thái
    Long countByOrderStatus(OrderStatus orderStatus);
}
