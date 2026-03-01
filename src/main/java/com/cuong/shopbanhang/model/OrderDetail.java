package com.cuong.shopbanhang.model;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orderdetail")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
  
   
    @OneToMany(mappedBy = "orderDetail", cascade = CascadeType.ALL)
    private List<CartItem> items;

    private Double totalPrice;
}
