package com.cuong.shopbanhang.model;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"orderDetails", "user"})
    private Order order;
  
   
    @OneToMany(mappedBy = "orderDetail", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"orderDetail", "cart", "book"})
    private List<CartItem> items;

    private Double totalPrice;
}
