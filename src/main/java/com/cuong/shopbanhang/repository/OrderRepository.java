package com.cuong.shopbanhang.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;
import com.cuong.shopbanhang.model.Order;

import java.time.LocalDateTime;
import java.util.List;

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

    // Thống kê: Tổng doanh thu (PAID=1 OR COMPLETED=3)
    @Query("SELECT CAST(COALESCE(SUM(o.totalAmount), 0) AS DOUBLE) FROM Order o WHERE o.paymentStatus = com.cuong.shopbanhang.common.PaymentStatus.PAID OR o.orderStatus = com.cuong.shopbanhang.common.OrderStatus.COMPLETED")
    Double getTotalRevenue();

    // Thống kê: Đếm đơn hàng theo trạng thái
    Long countByOrderStatus(OrderStatus orderStatus);

    // Thống kê: Doanh thu theo tháng (PAID=1 OR COMPLETED=3)
    @Query("SELECT CAST(COALESCE(SUM(o.totalAmount), 0) AS DOUBLE), COUNT(o) FROM Order o " +
           "WHERE o.orderDate >= :startDate AND o.orderDate < :endDate " +
           "AND (o.paymentStatus = com.cuong.shopbanhang.common.PaymentStatus.PAID " +
           "OR o.orderStatus = com.cuong.shopbanhang.common.OrderStatus.COMPLETED)")
    Object[] getRevenueAndCountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Đơn hàng gần đây
    List<Order> findTop10ByOrderByOrderDateDesc();

    @EntityGraph(attributePaths = {"orderDetails", "orderDetails.items", "orderDetails.items.book", "user"})
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findTopOrdersWithDetails(Pageable pageable);
}

