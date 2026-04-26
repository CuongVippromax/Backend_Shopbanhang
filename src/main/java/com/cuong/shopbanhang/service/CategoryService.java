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
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.dto.response.CategoryResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.repository.CategoryRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j(topic = "CategoryService")
public class CategoryService {
    private final CategoryRepository categoryRepository;

    /**
     * Tạo danh mục mới.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceAlreadyExistsException (1): Khi tên danh mục đã tồn tại
     * 
     * @param category Thông tin danh mục cần tạo
     * @return CategoryResponse thông tin danh mục đã tạo
     */
    @Transactional
    public CategoryResponse createCategory(Category category) {
        // EXCEPTION: ResourceAlreadyExistsException - Khi tên danh mục đã tồn tại
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new ResourceAlreadyExistsException("Category", "categoryName", category.getCategoryName()); // EX-002
        }
        
        categoryRepository.save(category);

        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .bookCount(0L)
                .active(category.getActive())
                .build();
    }

    /**
     * Lấy danh sách tất cả danh mục với phân trang, tìm kiếm và sắp xếp.
     * 
     * @param pageNo Số trang (bắt đầu từ 1)
     * @param pageSize Kích thước trang
     * @param sortBy Trường sắp xếp (VD: categoryName:desc)
     * @param search Từ khóa tìm kiếm
     * @return PageResponse chứa danh sách CategoryResponse
     */
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
                .map(category -> {
                    Long bookCount = categoryRepository.countBooksByCategoryId(category.getCategoryId());
                    return CategoryResponse.builder()
                            .categoryId(category.getCategoryId())
                            .categoryName(category.getCategoryName())
                            .description(category.getDescription())
                            .bookCount(bookCount)
                            .active(category.getActive())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(categories.getTotalElements())
                .totalPages(categories.getTotalPages())
                .data(categoryResponses)
                .build();
    }

    /**
     * Lấy thông tin danh mục theo ID.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy danh mục
     * 
     * @param id ID của danh mục cần lấy
     * @return CategoryResponse thông tin danh mục
     */
    public CategoryResponse getCategoryById(Long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy danh mục
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)); // EX-001
        
        Long bookCount = categoryRepository.countBooksByCategoryId(id);
        
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .bookCount(bookCount)
                .active(category.getActive())
                .build();
    }

    /**
     * Cập nhật thông tin danh mục.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy danh mục
     * 
     * @param id ID của danh mục cần cập nhật
     * @param categoryName Tên mới
     * @param description Mô tả mới
     * @param active Trạng thái hoạt động
     * @return CategoryResponse thông tin danh mục đã cập nhật
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, String categoryName, String description, Boolean active) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy danh mục
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)); // EX-001

        if (categoryName != null && !categoryName.isEmpty()) {
            category.setCategoryName(categoryName);
        }
        if (description != null) {
            category.setDescription(description);
        }
        if (active != null) {
            category.setActive(active);
        }

        Category updatedCategory = categoryRepository.save(category);
        Long bookCount = categoryRepository.countBooksByCategoryId(id);

        return CategoryResponse.builder()
                .categoryId(updatedCategory.getCategoryId())
                .categoryName(updatedCategory.getCategoryName())
                .description(updatedCategory.getDescription())
                .bookCount(bookCount)
                .active(updatedCategory.getActive())
                .build();
    }

    /**
     * Xóa danh mục.
     *
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy danh mục
     * - IllegalStateException (2): Khi danh mục đang chứa sách
     *
     * @param id ID của danh mục cần xóa
     */
    @Transactional
    public void deleteCategory(Long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy danh mục
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)); // EX-001

        // Kiểm tra nếu danh mục có sách
        Long bookCount = categoryRepository.countBooksByCategoryId(id);
        if (bookCount > 0) {
            throw new IllegalStateException("Không thể xóa danh mục đang chứa sách. Vui lòng chuyển sách sang danh mục khác trước.");
        }

        categoryRepository.delete(category);
    }

    /**
     * Xóa tất cả danh mục.
     * Cẩn thận: Có thể ảnh hưởng đến các sách đang sử dụng danh mục này.
     */
    @Transactional
    public void deleteAllCategories() {
        categoryRepository.deleteAll();
    }

    /**
     * Lấy danh sách sách theo tên danh mục.
     * 
     * @param category Tên danh mục
     * @return List<Book> danh sách sách trong danh mục
     */
    public List<Book> loadBookWithCategory(String category) {
        return categoryRepository.findBooksByCategoryName(category);
    }

    /**
     * Lấy danh sách tất cả danh mục (không phân trang).
     * 
     * @return List<CategoryResponse> danh sách danh mục
     */
    public List<CategoryResponse> getAllCategoriesList() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {
                    Long bookCount = categoryRepository.countBooksByCategoryId(category.getCategoryId());
                    return CategoryResponse.builder()
                            .categoryId(category.getCategoryId())
                            .categoryName(category.getCategoryName())
                            .description(category.getDescription())
                            .bookCount(bookCount)
                            .active(category.getActive())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Tạo danh mục mặc định (seed data).
     * Chỉ tạo khi chưa có danh mục nào trong hệ thống.
     */
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
        log.info("Seeded {} default categories", categories.size());
    }
}
