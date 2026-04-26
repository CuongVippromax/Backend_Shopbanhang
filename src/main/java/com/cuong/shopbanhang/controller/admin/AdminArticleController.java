package com.cuong.shopbanhang.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.dto.request.ArticleRequest;
import com.cuong.shopbanhang.dto.response.ArticleResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.service.ArticleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminArticleController {

    private final ArticleService articleService;

    @GetMapping("/all")
    public ResponseEntity<PageResponse<List<ArticleResponse>>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword) {
        PageResponse<List<ArticleResponse>> articles = articleService.getAllArticles(page, size, sortBy, sortDir, keyword);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable Long id) {
        ArticleResponse article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleResponse> createArticle(
            @RequestParam String title,
            @RequestParam(required = false) String summary,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String authorName,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false, defaultValue = "true") Boolean published,
            @RequestParam(required = false, defaultValue = "false") Boolean featured) {

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = articleService.uploadImage(image);
        }

        ArticleRequest request = ArticleRequest.builder()
                .title(title)
                .summary(summary)
                .category(category)
                .authorName(authorName)
                .content(content)
                .image(imageUrl)
                .published(published)
                .featured(featured)
                .build();

        ArticleResponse article = articleService.createArticle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(article);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleResponse> updateArticle(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String summary,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String authorName,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) Boolean published,
            @RequestParam(required = false) Boolean featured) {

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = articleService.uploadImage(image);
        }

        ArticleRequest request = ArticleRequest.builder()
                .title(title)
                .summary(summary)
                .category(category)
                .authorName(authorName)
                .content(content)
                .image(imageUrl)
                .published(published)
                .featured(featured)
                .build();

        ArticleResponse article = articleService.updateArticle(id, request);
        return ResponseEntity.ok(article);
    }

    @PutMapping("/{id}/featured")
    public ResponseEntity<ArticleResponse> setFeatured(@PathVariable Long id, @RequestParam Boolean featured) {
        ArticleResponse article = articleService.setFeatured(id, featured);
        return ResponseEntity.ok(article);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}
