package com.cuong.shopbanhang.model;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
/**
 * payment_status lưu ordinal {@link com.cuong.shopbanhang.common.PaymentStatus}:
 * 0=PENDING, 1=PAID, 2=FAILED, 3=CANCELLED.
 * Nếu PostgreSQL báo lỗi {@code orders_payment_status_check}, chạy
 * {@code src/main/resources/sql/fix-orders-payment-status-check.sql}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"cart", "password", "role"})
    private User user;

    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    private Double totalAmount;

    private PaymentStatus paymentStatus;

    private OrderStatus orderStatus;

    private String recipientName;

    private String recipientPhone;

    private String shippingAddress;

    private String paymentMethod;

    private String note;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"order", "items"})
    private OrderDetail orderDetails;
}
