package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.dto.response.FaqResponse;
import com.cuong.shopbanhang.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/faqs", "/api/faqs"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaqController {

    private final FaqService faqService;

    /**
     * Lấy danh sách FAQ active (public — cho chatbot frontend)
     */
    @GetMapping
    public ResponseEntity<List<FaqResponse>> getActiveFaqs() {
        return ResponseEntity.ok(faqService.getActiveFaqs());
    }

    /**
     * Lấy danh sách categories (public)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(faqService.getCategories());
    }

    /**
     * Tìm câu trả lời phù hợp với tin nhắn người dùng
     */
    @GetMapping("/match")
    public ResponseEntity<FaqResponse> matchFaq(@RequestParam("q") String query) {
        FaqResponse result = faqService.findBestMatch(query);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
}
