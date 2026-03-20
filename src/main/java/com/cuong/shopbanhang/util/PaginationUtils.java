package com.cuong.shopbanhang.util;

import com.cuong.shopbanhang.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

public class PaginationUtils {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NO = 0;

    private PaginationUtils() {
    }

    public static Pageable createPageable(int pageNo, int pageSize) {
        int validPageNo = pageNo > 0 ? pageNo - 1 : DEFAULT_PAGE_NO;
        int validPageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
        return PageRequest.of(validPageNo, validPageSize);
    }

    public static Pageable createPageable(int pageNo, int pageSize, String sortBy) {
        return createPageable(pageNo, pageSize, sortBy, Sort.Direction.ASC);
    }

    public static Pageable createPageable(int pageNo, int pageSize, String sortBy, Sort.Direction direction) {
        int validPageNo = pageNo > 0 ? pageNo - 1 : DEFAULT_PAGE_NO;
        int validPageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
        
        String sortField = StringUtils.hasText(sortBy) ? sortBy : "id";
        Sort.Direction sortDirection = direction != null ? direction : Sort.Direction.ASC;
        
        return PageRequest.of(validPageNo, validPageSize, Sort.by(sortDirection, sortField));
    }

    public static Pageable createPageable(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort.Direction direction = parseSortDirection(sortDir);
        return createPageable(pageNo, pageSize, sortBy, direction);
    }

    public static Sort.Direction parseSortDirection(String sortDir) {
        if (StringUtils.hasText(sortDir) && sortDir.equalsIgnoreCase("desc")) {
            return Sort.Direction.DESC;
        }
        return Sort.Direction.ASC;
    }

    public static <T> PageResponse<T> buildPageResponse(Page<?> page, T data) {
        return PageResponse.<T>builder()
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }

    public static <T> PageResponse<T> buildPageResponse(Page<?> page, T data, int originalPageNo, int originalPageSize) {
        return PageResponse.<T>builder()
                .pageNo(originalPageNo)
                .pageSize(originalPageSize)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }

    public static int calculateOffset(int pageNo, int pageSize) {
        return (pageNo > 0 ? pageNo - 1 : DEFAULT_PAGE_NO) * pageSize;
    }

    public static boolean hasNext(int currentPage, int totalPages) {
        return currentPage < totalPages;
    }

    public static boolean hasPrevious(int currentPage) {
        return currentPage > 1;
    }

    public static int getDisplayPageNo(int pageNo) {
        return pageNo > 0 ? pageNo : 1;
    }

    public static boolean isValidPageNo(int pageNo) {
        return pageNo > 0;
    }

    public static boolean isValidPageSize(int pageSize) {
        return pageSize > 0 && pageSize <= 100;
    }

    public static int normalizePageSize(int pageSize, int maxSize) {
        if (pageSize <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, maxSize);
    }
}
