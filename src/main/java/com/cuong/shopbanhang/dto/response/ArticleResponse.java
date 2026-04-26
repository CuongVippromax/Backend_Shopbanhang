package com.cuong.shopbanhang.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ArticleResponse {
    private Long articleId;
    private String title;
    private String summary;
    private String category;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String image;
    private Boolean published;
    private Boolean featured;
}
