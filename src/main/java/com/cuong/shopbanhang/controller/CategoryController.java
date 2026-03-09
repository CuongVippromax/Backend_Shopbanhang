package com.cuong.shopbanhang.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.CategoryResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.service.CategoryService;

@RestController
@RequestMapping({ "/api/v1/categories", "/api/categories" })
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody Category category) {
        CategoryResponse createdCategory = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    @GetMapping("/all")
    public ResponseEntity<PageResponse<?>> getAllCategories(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "categoryId:asc") String sortBy,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<?> categories = categoryService.getAllCategories(pageNo, pageSize, sortBy, search);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {
        CategoryResponse updatedCategory = categoryService.updateCategory(
                id,
                category.getCategoryName(),
                category.getDescription()
        );
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/books")
    public ResponseEntity<List<?>> getBooksByCategory(@PathVariable Long categoryId) {
        List<?> books = categoryService.loadBookWithCategory(String.valueOf(categoryId));
        return ResponseEntity.ok(books);
    }
}
