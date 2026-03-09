package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.dto.response.CategoryResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Book;
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
                .categoryId(category.getCategoryId())
                .CategoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    public PageResponse<?> getAllCategories(int pageNo, int pageSize, String sortBy, String search) {
        if (pageNo > 1) {
            pageNo = pageNo - 1;
        }

        String sortField = "categoryId";
        Sort.Direction direction = Sort.Direction.ASC;

        if (StringUtils.hasLength(sortBy)) {
            String[] parts = sortBy.split(":");
            sortField = parts[0];
            if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
                direction = Sort.Direction.DESC;
            }
        }

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                Sort.by(direction, sortField));
        Page<Category> categories = categoryRepository.findCategoriesWithSearch(search, pageable);

        List<CategoryResponse> categoryResponses = categories.stream()
                .map(category -> CategoryResponse.builder()
                        .categoryId(category.getCategoryId())
                        .CategoryName(category.getCategoryName())
                        .description(category.getDescription())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(categories.getTotalElements())
                .totalPages(categories.getTotalPages())
                .data(categoryResponses)
                .build();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .CategoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    public CategoryResponse updateCategory(Long id, String categoryName, String description) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (categoryName != null && !categoryName.isEmpty()) {
            category.setCategoryName(categoryName);
        }
        if (description != null) {
            category.setDescription(description);
        }

        Category updatedCategory = categoryRepository.save(category);
        return CategoryResponse.builder()
                .categoryId(updatedCategory.getCategoryId())
                .CategoryName(updatedCategory.getCategoryName())
                .description(updatedCategory.getDescription())
                .build();
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(category);
    }

    public List<Book> loadBookWithCategory(String category) {
        return categoryRepository.findBooksByCategoryName(category);
    }
}
