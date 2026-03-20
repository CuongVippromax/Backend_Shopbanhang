package com.cuong.shopbanhang.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cuong.shopbanhang.model.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    List<OrderDetail> findByOrder_OrderId(Long orderId);

    @Query(value = "SELECT ci.book_id, b.book_name, b.image, " +
            "SUM(ci.quantity) as totalSold, SUM(b.price * ci.quantity) as totalRevenue " +
            "FROM orderdetail od " +
            "JOIN cartitem ci ON ci.order_detail_id = od.id " +
            "JOIN book b ON b.book_id = ci.book_id " +
            "JOIN orders o ON o.order_id = od.order_id " +
            "WHERE o.order_status = 3 OR o.payment_status = 1 " +
            "GROUP BY ci.book_id, b.book_name, b.image " +
            "ORDER BY totalSold DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopSellingBooks(@Param("limit") int limit);
}
