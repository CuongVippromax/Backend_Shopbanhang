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

    @GetMapping("/all")
    public ResponseEntity<PageResponse<?>> getAllBooks(
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "category", required = false) String category) {
        PageResponse<?> books = bookService.getAllBook(pageNo, pageSize, sortBy, search, category);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<?>> searchBooks(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "category", required = false) String category) {
        PageResponse<?> books = bookService.getAllBook(pageNo, pageSize, sortBy, search, category);
        return ResponseEntity.ok(books);
    }
}
