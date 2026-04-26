package com.cuong.shopbanhang.controller.user;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.BookResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.service.BookService;

@RestController
@RequestMapping({ "/api/v1/books", "/api/books" })
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // Get all books with pagination
    @GetMapping("/all")
    public ResponseEntity<PageResponse<?>> getAllBooks(
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "categoryId", required = false) Long categoryId) {
        PageResponse<?> books = bookService.getAllBook(pageNo, pageSize, sortBy, search, category, categoryId);
        return ResponseEntity.ok(books);
    }

    // Get book by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    // Search books
    @GetMapping("/search")
    public ResponseEntity<PageResponse<?>> searchBooks(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "categoryId", required = false) Long categoryId) {
        PageResponse<?> books = bookService.getAllBook(pageNo, pageSize, sortBy, search, category, categoryId);
        return ResponseEntity.ok(books);
    }

    // Flash sale books - trả danh sách sách giảm giá (dùng cho homepage)
    @GetMapping("/flash-sale")
    public ResponseEntity<PageResponse<?>> getFlashSaleBooks(
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        PageResponse<?> books = bookService.getAllBook(0, limit, "bookId:desc", null, null, null);
        return ResponseEntity.ok(books);
    }
}
