package com.cuong.shopbanhang.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.dto.response.CategoryResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.repository.CategoryRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class CategoryService {
    private final CategoryRepository categoryRepository;

    // Create new category
    @Transactional
    public CategoryResponse createCategory(Category category) {
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new ResourceAlreadyExistsException("Category", "name", category.getCategoryName());
        }
        categoryRepository.save(category);
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    // Get all categories with pagination
    public PageResponse<?> getAllCategories(int pageNo, int pageSize, String sortBy, String search) {
        if (pageNo > 0) {
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
                        .categoryName(category.getCategoryName())
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

    // Get category by ID
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }

    // Update category
    @Transactional
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
                .categoryName(updatedCategory.getCategoryName())
                .description(updatedCategory.getDescription())
                .build();
    }

    // Delete category
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(category);
    }

    // Delete all categories
    @Transactional
    public void deleteAllCategories() {
        categoryRepository.deleteAll();
    }

    // Load books by category name
    public List<Book> loadBookWithCategory(String category) {
        return categoryRepository.findBooksByCategoryName(category);
    }

    // Get all categories as list
    public List<CategoryResponse> getAllCategoriesList() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> CategoryResponse.builder()
                        .categoryId(category.getCategoryId())
                        .categoryName(category.getCategoryName())
                        .description(category.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    // Seed default categories
    @Transactional
    public void seedDefaultCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }

        List<Category> categories = Arrays.asList(
            Category.builder().categoryName("Văn học").description("Sách văn học Việt Nam và nước ngoài").build(),
            Category.builder().categoryName("Tiểu thuyết").description("Tiểu thuyết hay nhất").build(),
            Category.builder().categoryName("Truyện tranh").description("Truyện tranh - Manga - Comic").build(),
            Category.builder().categoryName("Kinh tế").description("Sách kinh tế - Kinh doanh").build(),
            Category.builder().categoryName("Tâm lý").description("Sách tâm lý - Kỹ năng sống").build(),
            Category.builder().categoryName("Lịch sử").description("Sách lịch sử").build(),
            Category.builder().categoryName("Khoa học").description("Sách khoa học - Công nghệ").build(),
            Category.builder().categoryName("Ngoại ngữ").description("Sách học ngoại ngữ").build(),
            Category.builder().categoryName("Thiếu nhi").description("Sách cho bé").build(),
            Category.builder().categoryName("Giáo khoa").description("Sách giáo khoa - Tham khảo").build(),
            Category.builder().categoryName("Tôn giáo").description("Sách tôn giáo - Tâm linh").build(),
            Category.builder().categoryName("Nghệ thuật").description("Sách nghệ thuật - Cuộc sống").build()
        );

        categoryRepository.saveAll(categories);
    }
}
