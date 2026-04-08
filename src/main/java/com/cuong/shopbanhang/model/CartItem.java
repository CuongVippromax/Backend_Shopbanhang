package com.cuong.shopbanhang.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cartitem")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartItemId;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnoreProperties({"cartItems", "user"})
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties({"category"})
    private Book book;

    @Builder.Default
    private Integer quantity = 1;

    @ManyToOne
    @JoinColumn(name = "order_detail_id")
    @JsonIgnoreProperties({"order", "items"})
    private OrderDetail orderDetail;
}
