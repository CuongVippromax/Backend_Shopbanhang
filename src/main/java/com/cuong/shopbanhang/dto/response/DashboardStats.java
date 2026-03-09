package com.cuong.shopbanhang.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalUsers;
    private Long totalBooks;
    private Long totalOrders;
    private Double totalRevenue;
    private Long pendingOrders;
    private Long shippedOrders;
    private Long completedOrders;
    private Long cancelledOrders;
}
