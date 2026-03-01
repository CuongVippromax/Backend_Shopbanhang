package com.cuong.shopbanhang.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cuong.shopbanhang.model.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail,Long> {

}
