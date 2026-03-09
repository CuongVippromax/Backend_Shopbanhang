package com.cuong.shopbanhang.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.BookResponse;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.service.BookService;

@RestController
@RequestMapping({ "/api/v1/books", "/api/books" })
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;


    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BookResponse> createBook(
            @RequestParam("bookName") String bookName,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Book book = Book.builder()
                .bookName(bookName)
                .price(price)
                .quantity(quantity)
                .description(description)
                .author(author)
                .publisher(publisher)
                .publicationYear(publicationYear)
                .build();
        if (categoryId != null) {
            Category category = new Category();
            category.setCategoryId(categoryId);
            book.setCategory(category);
        }

        BookResponse createdBook = bookService.createBook(book, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

 
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


    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @RequestParam(value = "bookName", required = false) String bookName,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Book bookUpdate = new Book();
        bookUpdate.setBookName(bookName);
        bookUpdate.setPrice(price);
        bookUpdate.setQuantity(quantity);
        bookUpdate.setDescription(description);
        bookUpdate.setAuthor(author);
        bookUpdate.setPublisher(publisher);
        bookUpdate.setPublicationYear(publicationYear);

        if (categoryId != null) {
            Category category = new Category();
            category.setCategoryId(categoryId);
            bookUpdate.setCategory(category);
        }

        BookResponse updatedBook = bookService.updateBook(id, bookUpdate, image);
        return ResponseEntity.ok(updatedBook);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
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
