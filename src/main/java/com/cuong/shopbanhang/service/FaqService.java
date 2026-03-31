package com.cuong.shopbanhang.service;

import com.cuong.shopbanhang.dto.request.FaqRequest;
import com.cuong.shopbanhang.dto.response.FaqResponse;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.model.Faq;
import com.cuong.shopbanhang.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    // Get all active FAQs
    public List<FaqResponse> getActiveFaqs() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get FAQ categories
    public List<String> getCategories() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(Faq::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    // Find best matching FAQ for user message
    public FaqResponse findBestMatch(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return null;
        }

        String normalized = normalize(userMessage.trim());
        Set<String> userWords = new HashSet<>(Arrays.asList(normalized.split("\\s+")));

        List<Faq> faqs = faqRepository.findByActiveTrueOrderBySortOrderAsc();

        Faq best = null;
        int bestScore = 0;

        for (Faq faq : faqs) {
            int score = calculateMatchScore(faq, userWords, normalized);
            if (score > bestScore) {
                bestScore = score;
                best = faq;
            }
        }

        if (bestScore >= 1) {
            return toResponse(best);
        }
        return null;
    }

    // Calculate match score between FAQ and user message
    private int calculateMatchScore(Faq faq, Set<String> userWords, String normalizedMsg) {
        int score = 0;

        boolean profileIntent = normalizedMsg.contains("thong tin ca nhan")
                || normalizedMsg.contains("ho so ca nhan")
                || normalizedMsg.contains("thay doi thong tin")
                || normalizedMsg.contains("cap nhat thong tin")
                || normalizedMsg.contains("chinh sua ho so");
        if (profileIntent && "DON_HANG".equals(faq.getCategory())) {
            score -= 25;
        }

        // 关键词按逗号分段：整段多词用短语包含；单词必须与用户分词完全一致，避免 "phi" 误匹配 "phieu"
        if (faq.getKeywords() != null && !faq.getKeywords().isBlank()) {
            for (String rawPhrase : faq.getKeywords().split(",")) {
                String phrase = normalize(rawPhrase.trim());
                if (phrase.isEmpty()) {
                    continue;
                }
                String[] parts = phrase.split("\\s+");
                if (parts.length == 1) {
                    String kw = parts[0];
                    if (kw.length() < 2) {
                        continue;
                    }
                    if (userWords.contains(kw)) {
                        score += 3;
                    }
                } else {
                    if (normalizedMsg.contains(phrase)) {
                        score += 3;
                    }
                }
            }
        }

        String normalizedQuestion = normalize(faq.getQuestion());
        Set<String> questionWords = new HashSet<>(Arrays.asList(normalizedQuestion.split("\\s+")));
        for (String word : questionWords) {
            if (word.length() > 2 && userWords.contains(word)) {
                score += 2;
            }
        }

        if (normalizedMsg.length() >= 5) {
            for (String word : userWords) {
                if (word.length() > 4 && normalizedQuestion.contains(word)) {
                    score += 1;
                }
            }
        }

        return score;
    }

    // Normalize text (remove diacritics)
    private String normalize(String text) {
        return text.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // Get all FAQs (admin)
    public List<FaqResponse> getAllFaqs() {
        return faqRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get FAQ by ID
    public FaqResponse getFaqById(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ not found with id: " + id));
        return toResponse(faq);
    }

    // Create new FAQ
    @Transactional
    public FaqResponse createFaq(FaqRequest request) {
        Faq faq = Faq.builder()
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .category(request.getCategory())
                .keywords(request.getKeywords() != null ? request.getKeywords() : "")
                .active(request.getActive() != null ? request.getActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return toResponse(faqRepository.save(faq));
    }

    // Update FAQ
    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ not found with id: " + id));

        if (request.getQuestion() != null) faq.setQuestion(request.getQuestion());
        if (request.getAnswer() != null) faq.setAnswer(request.getAnswer());
        if (request.getCategory() != null) faq.setCategory(request.getCategory());
        if (request.getKeywords() != null) faq.setKeywords(request.getKeywords());
        if (request.getActive() != null) faq.setActive(request.getActive());
        if (request.getSortOrder() != null) faq.setSortOrder(request.getSortOrder());

        return toResponse(faqRepository.save(faq));
    }

    // Delete FAQ
    @Transactional
    public void deleteFaq(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new ResourceNotFoundException("FAQ not found with id: " + id);
        }
        faqRepository.deleteById(id);
    }

    // Convert Faq to FaqResponse
    private FaqResponse toResponse(Faq faq) {
        return FaqResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .keywords(faq.getKeywords())
                .active(faq.getActive())
                .sortOrder(faq.getSortOrder())
                .build();
    }
}
