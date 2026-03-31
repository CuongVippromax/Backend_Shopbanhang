package com.cuong.shopbanhang.repository;

import com.cuong.shopbanhang.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    // find active FAQs ordered by sort order
    List<Faq> findByActiveTrueOrderBySortOrderAsc();

    // find FAQs by category
    List<Faq> findByCategoryAndActiveTrueOrderBySortOrderAsc(String category);

    // find all FAQs ordered by sort order
    List<Faq> findAllByOrderBySortOrderAsc();
}
