package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class BookResponse {
    private Long bookId;
    private String bookName;
    private Double price;
    private Integer quantity;
    private String image;
    private String description;
    private String category;
    private Double averageRating;
    private Integer reviewCount;
    // Các trường mới cho sách
    private String author;
    private String publisher;
    private Integer publicationYear;
}
