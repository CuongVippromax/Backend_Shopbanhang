package com.cuong.shopbanhang.controller.admin;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.dto.response.BookResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.model.Category;
import com.cuong.shopbanhang.service.BookService;


@RestController
@RequestMapping("/api/v1/admin/books")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminBookController {

    private final BookService bookService;

    // Get all books with pagination
    @GetMapping("/all")
    public ResponseEntity<PageResponse<?>> getAllBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(bookService.getAllBook(page - 1, size, null, search, null));
    }

    // Create new book
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    // Update existing book (PUT — REST standard)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> updateBookPut(
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

    // Update existing book (POST — matches frontend apiPostForm which sends POST)
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> updateBookPost(
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

    // Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
