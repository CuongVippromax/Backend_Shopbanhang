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

    // find orders by user id
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

    // get total revenue
    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders " +
           "WHERE payment_status = 1 AND order_status = 3", nativeQuery = true)
    Double getTotalRevenue();

    // count orders by status
    Long countByOrderStatus(OrderStatus orderStatus);

    // get revenue and order count by date range
    @Query(value = "SELECT COALESCE(SUM(total_amount), 0), COUNT(*) FROM orders " +
           "WHERE order_date >= :startDate AND order_date < :endDate " +
           "AND payment_status = 1 AND order_status = 3", nativeQuery = true)
    List<Object[]> getRevenueAndCountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // find recent orders
    List<Order> findTop10ByOrderByOrderDateDesc();

    @EntityGraph(attributePaths = {"orderDetails", "orderDetails.items", "orderDetails.items.book", "user"})
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findTopOrdersWithDetails(Pageable pageable);
}
