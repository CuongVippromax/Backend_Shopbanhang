package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

// DTO for book data response
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
    private Long categoryId;
    private Double averageRating;
    private Integer reviewCount;
    private String author;
    private String publisher;
    private Integer publicationYear;
}
