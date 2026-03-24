package com.cuong.shopbanhang.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cuong.shopbanhang.common.OrderStatus;
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

    /**
     * Native SQL: khớp đúng cột số trong DB (ordinal PAID=1, COMPLETED=3).
     * Tránh JPQL + enum không khớp khiến điều kiện lọc sai → doanh thu / số đơn sai.
     */
    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders " +
           "WHERE payment_status = 1 AND order_status = 3", nativeQuery = true)
    Double getTotalRevenue();

    // Thống kê: Đếm đơn hàng theo trạng thái
    Long countByOrderStatus(OrderStatus orderStatus);

    /**
     * Doanh thu + số đơn theo tháng — cùng điều kiện {@link #getTotalRevenue()}.
     * Trả về 1 dòng: [0]=tổng tiền, [1]=số đơn.
     */
    @Query(value = "SELECT COALESCE(SUM(total_amount), 0), COUNT(*) FROM orders " +
           "WHERE order_date >= :startDate AND order_date < :endDate " +
           "AND payment_status = 1 AND order_status = 3", nativeQuery = true)
    List<Object[]> getRevenueAndCountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Đơn hàng gần đây
    List<Order> findTop10ByOrderByOrderDateDesc();

    @EntityGraph(attributePaths = {"orderDetails", "orderDetails.items", "orderDetails.items.book", "user"})
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findTopOrdersWithDetails(Pageable pageable);
}

