package com.cuong.shopbanhang.dto.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Kết quả gom theo khoảng thời gian: tổng tiền + số đơn (JPQL constructor).
 * Tránh nhầm cột khi dùng {@code Object[]} với các driver/Hibernate khác nhau.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRevenueCountRow {
    private Double revenueSum;
    private Long orderCount;
}
