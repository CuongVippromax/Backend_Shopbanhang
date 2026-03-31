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

    // Create new book
    @Transactional
    public BookResponse createBook(Book book, MultipartFile image) {
        if (bookRepository.existsByBookName(book.getBookName())) {
            throw new ResourceAlreadyExistsException("Book", "name", book.getBookName());
        }
        if (image != null && !image.isEmpty()) {
            String imageUrl = minIOService.uploadFile(image);
            book.setImage(imageUrl);
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

    // Get book by ID
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findByBookId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
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

    // Update book
    @Transactional
    public BookResponse updateBook(long id, Book book, MultipartFile image) {
        Optional<Book> gettedBook = bookRepository.findByBookId(id);
        if (gettedBook.isEmpty()) {
            return createBook(book, image);
        }
        Book existingBook = gettedBook.get();

        if (book.getBookName() != null) {
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

        if (image != null && !image.isEmpty()) {
            if (existingBook.getImage() != null && !existingBook.getImage().isEmpty()) {
                try {
                    String oldFileName = existingBook.getImage().substring(existingBook.getImage().lastIndexOf("/") + 1);
                    minIOService.deleteFile(oldFileName);
                } catch (Exception e) {
                    log.warn("Could not delete old image: {}", e.getMessage());
                }
            }
            String imageUrl = minIOService.uploadFile(image);
            existingBook.setImage(imageUrl);
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

    // Get all books with pagination (overload)
    public PageResponse<?> getAllBook(int pageNo, int pageSize, String sortBy, String search, String category) {
        return getAllBook(pageNo, pageSize, sortBy, search, category, null);
    }

    // Get all books with pagination
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

    // Delete book
    @Transactional
    public void deleteBook(long id) {
        Book book = bookRepository.findByBookId(id)
                .orElseThrow(() -> new RuntimeException("Khong ton tai sach"));

        if (book.getImage() != null && !book.getImage().isEmpty()) {
            try {
                String fileName = book.getImage().substring(book.getImage().lastIndexOf("/") + 1);
                minIOService.deleteFile(fileName);
            } catch (Exception e) {
                log.warn("Could not delete book image: {}", e.getMessage());
            }
        }

        bookRepository.deleteByBookId(id);
    }
}
