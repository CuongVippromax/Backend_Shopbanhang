package com.cuong.shopbanhang.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long reviewId;
    private Long bookId;
    private String bookName;
    private String bookTitle;
    private String bookAuthor;
    private String bookImage;
    private String thumbnailUrl;
    private Long userId;
    private String username;
    private String userName;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime reviewDate;
}
