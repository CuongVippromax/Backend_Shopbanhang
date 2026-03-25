package com.cuong.shopbanhang.repository;

import com.cuong.shopbanhang.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByActiveTrueOrderBySortOrderAsc();

    List<Faq> findByCategoryAndActiveTrueOrderBySortOrderAsc(String category);

    List<Faq> findAllByOrderBySortOrderAsc();
}
