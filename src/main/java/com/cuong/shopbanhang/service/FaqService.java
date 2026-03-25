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

    // ==================== Public API ====================

    /**
     * Lấy danh sách FAQ active cho chatbot (frontend)
     */
    public List<FaqResponse> getActiveFaqs() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách categories unique từ FAQ active
     */
    public List<String> getCategories() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(Faq::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Tìm FAQ phù hợp nhất dựa trên tin nhắn người dùng
     * Sử dụng keyword matching: so khớp từ khóa trong question + keywords với userMessage
     */
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

        // Ngưỡng: cần ít nhất 1 từ trùng khớp hoàn toàn hoặc 2 từ gần đúng
        if (bestScore >= 1) {
            return toResponse(best);
        }
        return null;
    }

    private int calculateMatchScore(Faq faq, Set<String> userWords, String normalizedMsg) {
        int score = 0;

        // 1. So khớp từ khóa (keywords) — trọng số cao nhất
        if (faq.getKeywords() != null && !faq.getKeywords().isBlank()) {
            Set<String> keywordWords = new HashSet<>(Arrays.asList(
                    normalize(faq.getKeywords()).split("\\s+")
            ));
            for (String kw : keywordWords) {
                if (normalizedMsg.contains(kw) || kw.length() > 3 && normalizedMsg.contains(kw)) {
                    score += 3;
                }
            }
        }

        // 2. So khớp trong câu hỏi (question)
        String normalizedQuestion = normalize(faq.getQuestion());
        Set<String> questionWords = new HashSet<>(Arrays.asList(normalizedQuestion.split("\\s+")));
        for (String word : questionWords) {
            if (word.length() > 2 && normalizedMsg.contains(word)) {
                score += 2;
            }
        }

        // 3. So khớp chính xác toàn bộ câu hỏi (partial)
        if (normalizedMsg.length() >= 5) {
            for (String word : userWords) {
                if (word.length() > 4 && normalizedQuestion.contains(word)) {
                    score += 1;
                }
            }
        }

        return score;
    }

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

    // ==================== Admin API ====================

    public List<FaqResponse> getAllFaqs() {
        return faqRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FaqResponse getFaqById(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ not found with id: " + id));
        return toResponse(faq);
    }

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

    @Transactional
    public void deleteFaq(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new ResourceNotFoundException("FAQ not found with id: " + id);
        }
        faqRepository.deleteById(id);
    }

    // ==================== Mapper ====================

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
