package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.dto.request.ArticleRequest;
import com.cuong.shopbanhang.dto.response.ArticleResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.model.Article;
import com.cuong.shopbanhang.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ArticleService")
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final MinIOService minIOService;

    private ArticleResponse toResponse(Article article) {
        return ArticleResponse.builder()
                .articleId(article.getArticleId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .category(article.getCategory())
                .authorName(article.getAuthorName())
                .content(article.getContent())
                .image(article.getImage())
                .published(article.getPublished())
                .featured(article.getFeatured())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    public ArticleResponse getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        return toResponse(article);
    }

    // ============ PUBLIC METHODS (User) ============

    public PageResponse<List<ArticleResponse>> getPublishedArticles(int pageNo, int pageSize) {
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Article> articlePage = articleRepository.findByPublishedTrue(pageable);

        List<ArticleResponse> content = articlePage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<List<ArticleResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(articlePage.getTotalElements())
                .totalPages(articlePage.getTotalPages())
                .data(content)
                .build();
    }

    public List<ArticleResponse> getFeaturedArticles() {
        // Lấy các bài viết vừa featured vừa published
        List<Article> articles = articleRepository.findByFeaturedTrueOrderByCreatedAtDesc();
        return articles.stream()
                .filter(Article::getPublished) // Chỉ lấy bài đã xuất bản
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ArticleResponse getPublishedArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .filter(Article::getPublished)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        return toResponse(article);
    }

    @Transactional
    public ArticleResponse setFeatured(Long id, Boolean featured) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        article.setFeatured(featured);
        Article updated = articleRepository.save(article);
        log.info("Set featured={} for article id: {}", featured, id);
        return toResponse(updated);
    }

    // ============ ADMIN METHODS ============

    public PageResponse<List<ArticleResponse>> getAllArticles(int pageNo, int pageSize, String sortBy, String sortDir, String keyword) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

        Page<Article> articlePage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            articlePage = articleRepository.searchArticles(keyword.trim(), pageable);
        } else {
            articlePage = articleRepository.findAll(pageable);
        }

        List<ArticleResponse> content = articlePage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<List<ArticleResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(articlePage.getTotalElements())
                .totalPages(articlePage.getTotalPages())
                .data(content)
                .build();
    }

    @Transactional
    public ArticleResponse createArticle(ArticleRequest request) {
        Article article = Article.builder()
                .title(request.getTitle())
                .summary(request.getSummary())
                .category(request.getCategory())
                .authorName(request.getAuthorName())
                .content(request.getContent())
                .image(request.getImage())
                .published(request.getPublished() != null ? request.getPublished() : true)
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .build();

        Article saved = articleRepository.save(article);
        log.info("Created article with id: {}", saved.getArticleId());
        return toResponse(saved);
    }

    @Transactional
    public ArticleResponse updateArticle(Long id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));

        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setCategory(request.getCategory());
        article.setAuthorName(request.getAuthorName());
        article.setContent(request.getContent());
        article.setPublished(request.getPublished() != null ? request.getPublished() : article.getPublished());
        article.setFeatured(request.getFeatured() != null ? request.getFeatured() : article.getFeatured());

        if (request.getImage() != null) {
            article.setImage(request.getImage());
        }

        Article updated = articleRepository.save(article);
        log.info("Updated article with id: {}", updated.getArticleId());
        return toResponse(updated);
    }

    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        articleRepository.delete(article);
        log.info("Deleted article with id: {}", id);
    }

    public String uploadImage(MultipartFile file) {
        return minIOService.uploadFile(file);
    }
}
