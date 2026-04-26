package com.cuong.shopbanhang.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.ArticleResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.service.ArticleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({ "/api/v1/articles", "/api/articles" })
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<PageResponse<List<ArticleResponse>>> getArticles(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize) {
        // User chỉ xem được các bài viết đã xuất bản
        int pageToUse = page > 0 ? page - 1 : (pageNo > 0 ? pageNo - 1 : 0);
        int sizeToUse = size > 0 ? size : (pageSize > 0 ? pageSize : 10);
        PageResponse<List<ArticleResponse>> articles = articleService.getPublishedArticles(pageToUse, sizeToUse);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ArticleResponse>> getFeaturedArticles() {
        List<ArticleResponse> articles = articleService.getFeaturedArticles();
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
        ArticleResponse article = articleService.getPublishedArticleById(id);
        return ResponseEntity.ok(article);
    }
}
