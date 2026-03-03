package com.cuong.shopbanhang.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.ProductResponse;
import com.cuong.shopbanhang.exception.ResourceAlreadyExistsException;
import com.cuong.shopbanhang.model.Product;
import com.cuong.shopbanhang.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ProductService")
public class ProductService {
    private final ProductRepository productRepository;

    public ProductResponse createProduct(Product product) {
        if (productRepository.existsByProductName(product.getProductName())) {
            throw new ResourceAlreadyExistsException("Product", "name", product.getProductName());
        }
        productRepository.save(product);
        return ProductResponse.builder()
                .productName(product.getProductName())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .image(product.getImage())
                .category(product.getCategory().toString())
                .description(product.getDescription())
                .build();
    }

    // Lấy sản phẩm theo ID
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByProductId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .image(product.getImage())
                .description(product.getDescription())
                .category(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .build();
    }

    public ProductResponse updateProduct(long id, Product product) {
        Optional<Product> gettedProduct = productRepository.findByProductId(id);
        if (gettedProduct.isEmpty()) {
            return createProduct(product);
        }
        Product existingProduct = gettedProduct.get();

        // Update fields
        existingProduct.setProductName(product.getProductName());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setImage(product.getImage());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setCategory(product.getCategory());

        Product updatedProduct = productRepository.save(existingProduct);

        return ProductResponse.builder()
                .productName(updatedProduct.getProductName())
                .price(updatedProduct.getPrice())
                .quantity(updatedProduct.getQuantity())
                .image(updatedProduct.getImage())
                .category(updatedProduct.getCategory().toString())
                .description(updatedProduct.getDescription())
                .build();
    }

    public PageResponse<?> getAllProduct(int pageNo, int pageSize, String sortBy, String search) {
        if (pageNo > 1) {
            pageNo = pageNo - 1;
        }

        String sortField = "productId";
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
        Page<Product> products = productRepository.findProductsWithSearch(search, pageable);

        List<ProductResponse> productResponses = products.stream()
                .map(product -> ProductResponse.builder()
                        .productId(product.getProductId())
                        .productName(product.getProductName())
                        .price(product.getPrice())
                        .quantity(product.getQuantity())
                        .image(product.getImage())
                        .description(product.getDescription())
                        .category(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                        .build())
                .collect(Collectors.toList());

        return PageResponse.builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .data(productResponses)
                .build();
    }

    public void deleteProduct(long id) {
        if (!productRepository.existsByProductId(id)) {
            throw new RuntimeException("Khong ton tai san pham");
        }
        productRepository.deleteByProductId(id);
    }
}
