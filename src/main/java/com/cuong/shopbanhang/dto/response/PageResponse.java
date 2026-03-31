package com.cuong.shopbanhang.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

// DTO for paginated response
@Getter
@Setter
@Builder
public class PageResponse<T> {
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private T data;
}
