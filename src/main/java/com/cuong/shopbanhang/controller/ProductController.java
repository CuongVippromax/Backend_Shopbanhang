package com.cuong.shopbanhang.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.ProductResponse;
import com.cuong.shopbanhang.model.Product;
import com.cuong.shopbanhang.service.ProductService;

@RestController
@RequestMapping({ "/api/v1/products", "/api/products" })
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody Product product) {
        ProductResponse createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

 
    @GetMapping
    public ResponseEntity<PageResponse<?>> getAllProducts(
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "search", required = false) String search) {

        PageResponse<?> products = productService.getAllProduct(pageNo, pageSize, sortBy, search);
        return ResponseEntity.ok(products);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        ProductResponse updatedProduct = productService.updateProduct(id, product);
        return ResponseEntity.ok(updatedProduct);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<?>> searchProducts(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy) {

        PageResponse<?> products = productService.getAllProduct(pageNo, pageSize, sortBy, search);
        return ResponseEntity.ok(products);
    }
}
