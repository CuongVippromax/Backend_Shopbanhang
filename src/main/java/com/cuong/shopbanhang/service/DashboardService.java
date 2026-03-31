package com.cuong.shopbanhang.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CategoryRepository categoryRepository;

    // Get dashboard statistics
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        try {
            return doGetDashboardStats();
        } catch (Exception e) {
            log.error("getDashboardStats FAILED", e);
            throw e;
        }
    }

    // Calculate all dashboard statistics
    private DashboardStats doGetDashboardStats() {

        Long totalUsers = safeLong(userRepository.count());
        Long totalBooks = safeLong(bookRepository.count());
        Long totalOrders = safeLong(orderRepository.count());
        Long totalCategories = safeLong(categoryRepository.count());

        Double totalRevenue = objToDouble(orderRepository.getTotalRevenue());

        Long pendingOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.PENDING));
        Long shippedOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.SHIPPED));
        Long completedOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.COMPLETED));
        Long cancelledOrders = safeLong(orderRepository.countByOrderStatus(OrderStatus.CANCELLED));

        Long lowStockBooks = safeLong(bookRepository.countByQuantityBetween(1, 4));
        Long outOfStockBooks = safeLong(bookRepository.countByQuantity(0));
        List<TopBookStat> topBooks = loadTopSellingBooks(5);
        List<MonthlyRevenue> monthlyStats = loadMonthlyRevenue(6);
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

    // Safe null to Long conversion
    private Long safeLong(Long val) {
        return val != null ? val : 0L;
    }

    // Safe Object to Double conversion
    private Double objToDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); }
        catch (Exception e) { return 0.0; }
    }

    // Safe Object to Long conversion
    private Long objToLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); }
        catch (Exception e) { return 0L; }
    }

    // Load top selling books
    private List<TopBookStat> loadTopSellingBooks(int limit) {
        List<TopBookStat> result = new ArrayList<>();
        try {
            List<Object[]> rows = orderDetailRepository.findTopSellingBooks(limit);
            if (rows == null) return result;
            for (Object[] row : rows) {
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

    // Load monthly revenue statistics
    private List<MonthlyRevenue> loadMonthlyRevenue(int months) {
        List<MonthlyRevenue> result = new ArrayList<>();
        LocalDate todayVn = LocalDate.now(VIETNAM);
        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthFirst = todayVn.minusMonths(i).withDayOfMonth(1);
            LocalDateTime start = monthFirst.atStartOfDay(VIETNAM).toLocalDateTime();
            LocalDateTime end = monthFirst.plusMonths(1).atStartOfDay(VIETNAM).toLocalDateTime();
            try {
                List<Object[]> rows = orderRepository.getRevenueAndCountByDateRange(start, end);
                double revenue = 0.0;
                long count = 0L;
                if (rows != null && !rows.isEmpty() && rows.get(0) != null) {
                    Object[] r = rows.get(0);
                    if (r.length >= 2) {
                        revenue = objToDouble(r[0]);
                        count = objToLong(r[1]);
                    }
                }
                result.add(MonthlyRevenue.builder()
                        .month(monthFirst.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")))
                        .year(monthFirst.getYear())
                        .revenue(revenue)
                        .orderCount(count)
                        .build());
            } catch (Exception e) {
                result.add(MonthlyRevenue.builder()
                        .month(monthFirst.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")))
                        .year(monthFirst.getYear())
                        .revenue(0.0)
                        .orderCount(0L)
                        .build());
            }
        }
        return result;
    }

    // Load recent orders
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

    // Convert Order to OrderResponse (light version)
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
