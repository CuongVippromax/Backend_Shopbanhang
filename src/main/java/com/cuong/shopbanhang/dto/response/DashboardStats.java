package com.cuong.shopbanhang.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// DTO for dashboard statistics
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
    private Long lowStockBooks;
    private Long outOfStockBooks;
    private Long totalCategories;
    private List<TopBookStat> topSellingBooks;
    private List<MonthlyRevenue> revenueByMonth;
    private List<OrderResponse> recentOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopBookStat {
        private Long bookId;
        private String bookName;
        private String image;
        private Long totalSold;
        private Double totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private Integer year;
        private Double revenue;
        private Long orderCount;
    }
}
