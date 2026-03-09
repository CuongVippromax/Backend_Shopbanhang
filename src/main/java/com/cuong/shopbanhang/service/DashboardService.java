package com.cuong.shopbanhang.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.common.OrderStatus;
import com.cuong.shopbanhang.dto.response.DashboardStats;
import com.cuong.shopbanhang.repository.OrderRepository;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "DashboardService")
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private OrderRepository orderRepository;

    public DashboardStats getDashboardStats() {
        // Đếm tổng số users
        Long totalUsers = userRepository.count();
        
        // Đếm tổng số sách
        Long totalBooks = bookRepository.count();
        
        // Đếm tổng số orders
        Long totalOrders = orderRepository.count();
        
        // Tính tổng doanh thu (chỉ tính đơn hàng đã thanh toán)
        Double totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;
        
        // Đếm đơn hàng theo trạng thái
        Long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        Long shippedOrders = orderRepository.countByOrderStatus(OrderStatus.SHIPPED);
        Long completedOrders = orderRepository.countByOrderStatus(OrderStatus.COMPLETED);
        Long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);
        
        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalBooks(totalBooks)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders != null ? pendingOrders : 0L)
                .shippedOrders(shippedOrders != null ? shippedOrders : 0L)
                .completedOrders(completedOrders != null ? completedOrders : 0L)
                .cancelledOrders(cancelledOrders != null ? cancelledOrders : 0L)
                .build();
    }
}
