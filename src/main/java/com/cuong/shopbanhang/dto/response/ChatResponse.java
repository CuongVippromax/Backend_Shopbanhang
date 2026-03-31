package com.cuong.shopbanhang.dto.response;

import lombok.*;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String message;
    private String type;
    private List<BookRecommendation> bookRecommendations;
    private String intent;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookRecommendation {
        private Long bookId;
        private String bookName;
        private Double price;
        private String author;
        private String category;
        private String image;
        private Double averageRating;
    }
}
