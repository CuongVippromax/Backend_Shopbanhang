package com.cuong.shopbanhang.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "book")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    private String bookName;
    private Double price;
    private Integer quantity;
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Các trường mới cho sách
    private String author;
    private String publisher;
    private Integer publicationYear;
    // Trường tính toán - không lưu vào DB
    @Transient
    private Double averageRating;
    
    @Transient
    private Integer reviewCount;
}
