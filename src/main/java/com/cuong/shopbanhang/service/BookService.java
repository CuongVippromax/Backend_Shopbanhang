package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.exception.FileStorageException;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.BookResponse;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.repository.BookRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "BookService")
public class BookService {
    private final BookRepository bookRepository;
    private final MinIOService minIOService;

    /**
     * Tạo sách mới với hình ảnh.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceAlreadyExistsException (1): Khi tên sách đã tồn tại
     * - FileStorageException (2): Khi upload hình ảnh thất bại
     * 
     * @param book Thông tin sách cần tạo
     * @param image Hình ảnh sách (có thể null)
     * @return BookResponse thông tin sách đã tạo
     */
    @Transactional
    public BookResponse createBook(Book book, MultipartFile image) {
        // EXCEPTION: ResourceAlreadyExistsException - Khi tên sách đã tồn tại
        if (bookRepository.existsByBookName(book.getBookName())) {
            throw new ResourceAlreadyExistsException("Book", "bookName", book.getBookName()); // EX-002
        }
        
        // Upload image nếu có
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = minIOService.uploadFile(image);
                book.setImage(imageUrl);
            } catch (Exception e) {
                // EXCEPTION: FileStorageException - Khi upload image thất bại
                throw new FileStorageException("Không thể upload hình ảnh sách: " + e.getMessage(), e); // EX-010
            }
        }
        
        bookRepository.save(book);

        return BookResponse.builder()
                .bookId(book.getBookId())
                .bookName(book.getBookName())
                .price(book.getPrice())
                .quantity(book.getQuantity())
                .image(book.getImage())
                .category(book.getCategory() != null ? book.getCategory().getCategoryName() : null)
                .description(book.getDescription())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .build();
    }

    /**
     * Lấy thông tin sách theo ID.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy sách với ID tương ứng
     * 
     * @param id ID của sách cần lấy
     * @return BookResponse thông tin sách
     */
    public BookResponse getBookById(Long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy sách
        Book book = bookRepository.findByBookId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id)); // EX-001
        
        return BookResponse.builder()
                .bookId(book.getBookId())
                .bookName(book.getBookName())
                .price(book.getPrice())
                .quantity(book.getQuantity())
                .image(book.getImage())
                .description(book.getDescription())
                .category(book.getCategory() != null ? book.getCategory().getCategoryName() : null)
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .averageRating(book.getAverageRating())
                .reviewCount(book.getReviewCount())
                .build();
    }

    /**
     * Cập nhật thông tin sách.
     * Nếu có hình ảnh mới, hình ảnh cũ sẽ bị xóa.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy sách (nếu tìm thấy thì tạo mới)
     * - FileStorageException (2): Khi upload/xóa hình ảnh thất bại
     * 
     * @param id ID của sách cần cập nhật
     * @param book Thông tin mới của sách
     * @param image Hình ảnh mới (có thể null)
     * @return BookResponse thông tin sách đã cập nhật
     */
    @Transactional
    public BookResponse updateBook(long id, Book book, MultipartFile image) {
        Optional<Book> gettedBook = bookRepository.findByBookId(id);
        if (gettedBook.isEmpty()) {
            return createBook(book, image);
        }
        Book existingBook = gettedBook.get();

        if (book.getBookName() != null && !book.getBookName().equals(existingBook.getBookName())) {
            if (bookRepository.existsByBookName(book.getBookName())) {
                throw new ResourceAlreadyExistsException("Book", "bookName", book.getBookName());
            }
            existingBook.setBookName(book.getBookName());
        }
        if (book.getPrice() != null) {
            existingBook.setPrice(book.getPrice());
        }
        if (book.getQuantity() != null) {
            existingBook.setQuantity(book.getQuantity());
        }
        if (book.getDescription() != null) {
            existingBook.setDescription(book.getDescription());
        }
        if (book.getAuthor() != null) {
            existingBook.setAuthor(book.getAuthor());
        }
        if (book.getPublisher() != null) {
            existingBook.setPublisher(book.getPublisher());
        }
        if (book.getPublicationYear() != null) {
            existingBook.setPublicationYear(book.getPublicationYear());
        }
        if (book.getCategory() != null) {
            existingBook.setCategory(book.getCategory());
        }

        // Xử lý hình ảnh
        if (image != null && !image.isEmpty()) {
            // Xóa hình ảnh cũ nếu có
            if (existingBook.getImage() != null && !existingBook.getImage().isEmpty()) {
                try {
                    String oldFileName = existingBook.getImage().substring(existingBook.getImage().lastIndexOf("/") + 1);
                    minIOService.deleteFile(oldFileName);
                } catch (Exception e) {
                    log.warn("Could not delete old image: {}", e.getMessage());
                }
            }
            // Upload hình ảnh mới
            try {
                String imageUrl = minIOService.uploadFile(image);
                existingBook.setImage(imageUrl);
            } catch (Exception e) {
                // EXCEPTION: FileStorageException - Khi upload image thất bại
                throw new FileStorageException("Không thể upload hình ảnh sách: " + e.getMessage(), e); // EX-010
            }
        }

        Book updatedBook = bookRepository.save(existingBook);

        return BookResponse.builder()
                .bookId(updatedBook.getBookId())
                .bookName(updatedBook.getBookName())
                .price(updatedBook.getPrice())
                .quantity(updatedBook.getQuantity())
                .image(updatedBook.getImage())
                .description(updatedBook.getDescription())
                .category(updatedBook.getCategory() != null ? updatedBook.getCategory().getCategoryName() : null)
                .author(updatedBook.getAuthor())
                .publisher(updatedBook.getPublisher())
                .publicationYear(updatedBook.getPublicationYear())
                .averageRating(updatedBook.getAverageRating())
                .reviewCount(updatedBook.getReviewCount())
                .build();
    }

    /**
     * Lấy danh sách tất cả sách với phân trang, tìm kiếm và lọc theo thể loại.
     * 
     * @param pageNo Số trang (bắt đầu từ 1)
     * @param pageSize Kích thước trang
     * @param sortBy Trường sắp xếp (VD: price:desc)
     * @param search Từ khóa tìm kiếm
     * @param category Tên thể loại để lọc
     * @return PageResponse chứa danh sách BookResponse
     */
    public PageResponse<?> getAllBook(int pageNo, int pageSize, String sortBy, String search, String category) {
        return getAllBook(pageNo, pageSize, sortBy, search, category, null);
    }

    /**
     * Lấy danh sách tất cả sách với phân trang, tìm kiếm và lọc theo thể loại (overload).
     * 
     * @param pageNo Số trang (bắt đầu từ 1)
     * @param pageSize Kích thước trang
     * @param sortBy Trường sắp xếp (VD: price:desc)
     * @param search Từ khóa tìm kiếm
     * @param category Tên thể loại để lọc
     * @param categoryId ID thể loại để lọc (ưu tiên hơn category)
     * @return PageResponse chứa danh sách BookResponse
     */
    public PageResponse<?> getAllBook(int pageNo, int pageSize, String sortBy, String search, String category,
            Long categoryId) {
        if (pageNo > 1) {
            pageNo = pageNo - 1;
        }

        String sortField = "bookId";
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

        Page<Book> books;
        if (categoryId != null) {
            books = bookRepository.findBooksWithSearchAndCategoryId(search, categoryId, pageable);
        } else if (StringUtils.hasLength(category)) {
            books = bookRepository.findBooksWithSearchAndCategory(search, category, pageable);
        } else {
            books = bookRepository.findBooksWithSearch(search, pageable);
        }

        List<BookResponse> bookResponses = books.stream()
                .map(book -> BookResponse.builder()
                        .bookId(book.getBookId())
                        .bookName(book.getBookName())
                        .price(book.getPrice())
                        .quantity(book.getQuantity())
                        .image(book.getImage())
                        .description(book.getDescription())
                        .category(book.getCategory() != null ? book.getCategory().getCategoryName() : null)
                        .categoryId(book.getCategory() != null ? book.getCategory().getCategoryId() : null)
                        .author(book.getAuthor())
                        .publisher(book.getPublisher())
                        .publicationYear(book.getPublicationYear())
                        .averageRating(book.getAverageRating())
                        .reviewCount(book.getReviewCount())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(books.getTotalElements())
                .totalPages(books.getTotalPages())
                .data(bookResponses)
                .build();
    }

    /**
     * Xóa sách và hình ảnh liên quan.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy sách với ID tương ứng
     * - FileStorageException (2): Khi xóa hình ảnh thất bại
     * 
     * @param id ID của sách cần xóa
     */
    @Transactional
    public void deleteBook(long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy sách
        Book book = bookRepository.findByBookId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id)); // EX-001

        // Xóa hình ảnh nếu có
        if (book.getImage() != null && !book.getImage().isEmpty()) {
            try {
                String fileName = book.getImage().substring(book.getImage().lastIndexOf("/") + 1);
                minIOService.deleteFile(fileName);
            } catch (Exception ignored) {
            }
        }

        bookRepository.deleteByBookId(id);
    }
}
