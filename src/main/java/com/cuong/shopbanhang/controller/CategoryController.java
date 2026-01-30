package com.cuong.shopbanhang.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.CategoryResponse;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.service.CategoryService;

@RestController
@RequestMapping({ "/api/v1/categories", "/api/categories" })
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // 1. Tạo danh mục mới
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody Category category) {
        CategoryResponse createdCategory = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    // 2. Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // 3. Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    // 4. Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(updatedCategory);
    }

    // 5. Xóa danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Lấy sản phẩm theo danh mục
    @GetMapping("/{categoryId}/products")
    public ResponseEntity<List<?>> getProductsByCategory(@PathVariable Long categoryId) {
        List<?> products = categoryService.loadProductWithCategory(String.valueOf(categoryId));
        return ResponseEntity.ok(products);
    }
}
