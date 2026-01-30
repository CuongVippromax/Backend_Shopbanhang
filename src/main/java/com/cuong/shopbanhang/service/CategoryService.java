package com.cuong.shopbanhang.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.dto.CategoryResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Product;
import com.cuong.shopbanhang.repository.CategoryRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryResponse createCategory(Category category) {
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new ResourceAlreadyExistsException("Category", "name", category.getCategoryName());
        }
        categoryRepository.save(category);
        return CategoryResponse.builder()
                .CategoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    public List<CategoryResponse> getAllCategories() {
        List<Category> list = categoryRepository.findAll();
        return list.stream().map(category -> CategoryResponse.builder()
                .CategoryName(category.getCategoryName())
                .description(category.getDescription())
                .build()).toList();
    }

    // Lấy danh mục theo ID
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return CategoryResponse.builder()
                .CategoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    // Cập nhật danh mục
    public CategoryResponse updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        category.setCategoryName(categoryDetails.getCategoryName());
        category.setDescription(categoryDetails.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return CategoryResponse.builder()
                .CategoryName(updatedCategory.getCategoryName())
                .description(updatedCategory.getDescription())
                .build();
    }

    // Xóa danh mục
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(category);
    }

    // Lấy sản phẩm theo danh mục
    public List<Product> loadProductWithCategory(String category) {
        return categoryRepository.findProductsByCategoryName(category);
    }

}
