package com.cuong.shopbanhang.dto.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO for aggregated order revenue by time period (JPQL constructor).
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRevenueCountRow {
    private Double revenueSum;
    private Long orderCount;
}
