package com.cuong.shopbanhang.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.dto.response.DashboardStats;
import com.cuong.shopbanhang.dto.response.DashboardStats.MonthlyRevenue;
import com.cuong.shopbanhang.dto.response.DashboardStats.TopBookStat;
import com.cuong.shopbanhang.dto.response.OrderItemResponse;
import com.cuong.shopbanhang.dto.response.OrderResponse;
import com.cuong.shopbanhang.model.Order;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.CategoryRepository;
import com.cuong.shopbanhang.repository.OrderDetailRepository;
import com.cuong.shopbanhang.repository.OrderRepository;
import com.cuong.shopbanhang.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "DashboardService")
public class DashboardService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CategoryRepository categoryRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        try {
            return doGetDashboardStats();
        } catch (Exception e) {
            log.error("getDashboardStats FAILED", e);
            throw e;
        }
    }

    private DashboardStats doGetDashboardStats() {
        log.info("=== DashboardService.getDashboardStats() START ===");
        // ── Đếm tổng ──
        Long totalUsers = safeLong(userRepository.count());
        log.info("totalUsers={}", totalUsers);

        Long totalBooks = safeLong(bookRepository.count());
        Long totalOrders = safeLong(orderRepository.count());
        Long totalCategories = safeLong(categoryRepository.count());
        log.info("books={}, orders={}, categories={}", totalBooks, totalOrders, totalCategories);

        // ── Doanh thu ──
        log.info("Fetching getTotalRevenue...");
        Object revenueObj = orderRepository.getTotalRevenue();
        log.info("getTotalRevenue raw={} type={}", revenueObj, revenueObj != null ? revenueObj.getClass().getName() : "null");
        Double totalRevenue = objToDouble(revenueObj);
        log.info("totalRevenue={}", totalRevenue);

        // ── Đếm đơn hàng theo trạng thái ──
        Long pendingOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.PENDING));
        Long shippedOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.SHIPPED));
        Long completedOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.COMPLETED));
        Long cancelledOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.CANCELLED));

        // ── Tồn kho ──
        Long lowStockBooks = safeLong(bookRepository.countByQuantityBetween(1, 4));
        Long outOfStockBooks = safeLong(bookRepository.countByQuantity(0));

        // ── Top sách bán chạy ──
        List<TopBookStat> topBooks = loadTopSellingBooks(5);

        // ── Doanh thu 6 tháng gần nhất ──
        List<MonthlyRevenue> monthlyStats = loadMonthlyRevenue(6);

        // ── Đơn hàng gần đây (KHÔNG gọi toOrderResponse, tự build DTO) ──
        List<OrderResponse> recentOrders = loadRecentOrders(10);

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalBooks(totalBooks)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders)
                .shippedOrders(shippedOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .lowStockBooks(lowStockBooks)
                .outOfStockBooks(outOfStockBooks)
                .totalCategories(totalCategories)
                .topSellingBooks(topBooks)
                .revenueByMonth(monthlyStats)
                .recentOrders(recentOrders)
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Long safeLong(Long val) {
        return val != null ? val : 0L;
    }

    private Double objToDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); }
        catch (Exception e) { return 0.0; }
    }

    private Long objToLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); }
        catch (Exception e) { return 0L; }
    }

    private List<TopBookStat> loadTopSellingBooks(int limit) {
        log.info("Fetching top {} selling books...", limit);
        List<TopBookStat> result = new ArrayList<>();
        try {
            List<Object[]> rows = orderDetailRepository.findTopSellingBooks(limit);
            log.info("top books raw rows={} type={}", rows, rows != null ? rows.getClass().getName() : "null");
            if (rows == null) return result;
            for (int i = 0; i < rows.size(); i++) {
                Object[] row = rows.get(i);
                log.info("  row[{}]: size={}, types=[{}, {}, {}, {}, {}]",
                    i, row != null ? row.length : "null",
                    row != null && row.length > 0 ? row[0].getClass().getName() : "null",
                    row != null && row.length > 1 ? row[1].getClass().getName() : "null",
                    row != null && row.length > 2 ? row[2].getClass().getName() : "null",
                    row != null && row.length > 3 ? row[3].getClass().getName() : "null",
                    row != null && row.length > 4 ? row[4].getClass().getName() : "null"
                );
                if (row == null || row.length < 5) continue;
                result.add(TopBookStat.builder()
                        .bookId(objToLong(row[0]))
                        .bookName(row[1] != null ? row[1].toString() : "")
                        .image(row[2] != null ? row[2].toString() : null)
                        .totalSold(objToLong(row[3]))
                        .totalRevenue(objToDouble(row[4]))
                        .build());
            }
        } catch (Exception e) {
            log.error("loadTopSellingBooks FAILED", e);
        }
        return result;
    }

    private List<MonthlyRevenue> loadMonthlyRevenue(int months) {
        List<MonthlyRevenue> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = start.plusMonths(1);
            try {
                log.info("Fetching revenue for {} to {}", start, end);
                Object[] raw = orderRepository.getRevenueAndCountByDateRange(start, end);
                log.info("  raw={} type={}", raw, raw != null ? raw.getClass().getName() : "null");
                if (raw != null) {
                    log.info("  raw[0]={} type={}, raw[1]={} type={}",
                        raw[0], raw[0] != null ? raw[0].getClass().getName() : "null",
                        raw[1], raw[1] != null ? raw[1].getClass().getName() : "null");
                }
                Double revenue = raw != null ? objToDouble(raw[0]) : 0.0;
                Long count = raw != null ? objToLong(raw[1]) : 0L;
                result.add(MonthlyRevenue.builder()
                        .month(start.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")))
                        .year(start.getYear())
                        .revenue(revenue)
                        .orderCount(count)
                        .build());
            } catch (Exception e) {
                log.warn("Could not load monthly revenue for {}: {}", start, e.getMessage());
                result.add(MonthlyRevenue.builder()
                        .month(start.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")))
                        .year(start.getYear())
                        .revenue(0.0)
                        .orderCount(0L)
                        .build());
            }
        }
        return result;
    }

    private List<OrderResponse> loadRecentOrders(int limit) {
        List<OrderResponse> result = new ArrayList<>();
        try {
            List<Order> orders = orderRepository.findTopOrdersWithDetails(PageRequest.of(0, limit));
            if (orders == null) return result;
            for (Order order : orders) {
                if (order == null) continue;
                try {
                    result.add(toOrderResponseLight(order));
                } catch (Exception e) {
                    log.warn("Could not convert order {}: {}", order.getOrderId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Could not load recent orders: {}", e.getMessage(), e);
        }
        return result;
    }

    /**
     * Build OrderResponse trực tiếp, tránh toOrderResponse() vì có security check không cần.
     */
    private OrderResponse toOrderResponseLight(Order order) {
        List<OrderItemResponse> items = new ArrayList<>();
        try {
            var details = order.getOrderDetails();
            if (details != null && details.getItems() != null) {
                for (var item : details.getItems()) {
                    if (item == null || item.getBook() == null) continue;
                    var book = item.getBook();
                    Double price = book.getPrice() != null ? book.getPrice().doubleValue() : 0.0;
                    Integer qty = item.getQuantity() != null ? item.getQuantity() : 0;
                    items.add(OrderItemResponse.builder()
                            .cartItemId(item.getCartItemId())
                            .bookId(book.getBookId())
                            .bookName(book.getBookName())
                            .price(price)
                            .quantity(qty)
                            .totalPrice(price * qty)
                            .image(book.getImage())
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("Could not load order details for order {}: {}", order.getOrderId(), e.getMessage());
        }

        String displayName = null;
        try {
            displayName = (order.getRecipientName() != null && !order.getRecipientName().isBlank())
                    ? order.getRecipientName()
                    : (order.getUser() != null ? order.getUser().getFullName() : null);
        } catch (Exception ignored) {}

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser() != null ? order.getUser().getUserId() : null)
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .fullName(displayName)
                .recipientPhone(order.getRecipientPhone())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .build();
    }
}
