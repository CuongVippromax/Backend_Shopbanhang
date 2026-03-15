package com.cuong.shopbanhang.controller.user;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.CategoryResponse;
import com.cuong.shopbanhang.service.CategoryService;

@RestController
@RequestMapping({ "/api/v1/categories", "/api/categories" })
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/list")
    public ResponseEntity<List<CategoryResponse>> getAllCategoriesList() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/{categoryId}/books")
    public ResponseEntity<List<?>> getBooksByCategory(@PathVariable Long categoryId) {
        List<?> books = categoryService.loadBookWithCategory(String.valueOf(categoryId));
        return ResponseEntity.ok(books);
    }
}
