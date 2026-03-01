package com.cuong.shopbanhang.model;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.common.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
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
    private User user;

    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    private Double totalAmount;

    private PaymentStatus paymentStatus;

    private OrderStatus orderStatus;

    private String shippingAddress;

    private String paymentMethod;

   
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderDetail orderDetails;
}
