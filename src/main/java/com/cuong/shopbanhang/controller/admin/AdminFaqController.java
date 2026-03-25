package com.cuong.shopbanhang.controller.admin;

import com.cuong.shopbanhang.dto.request.FaqRequest;
import com.cuong.shopbanhang.dto.response.FaqResponse;
import com.cuong.shopbanhang.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/faqs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminFaqController {

    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<List<FaqResponse>> getAllFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqResponse> getFaqById(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getFaqById(id));
    }

    @PostMapping
    public ResponseEntity<FaqResponse> createFaq(@Valid @RequestBody FaqRequest request) {
        FaqResponse created = faqService.createFaq(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqResponse> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest request) {
        return ResponseEntity.ok(faqService.updateFaq(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
        return ResponseEntity.noContent().build();
    }
}
