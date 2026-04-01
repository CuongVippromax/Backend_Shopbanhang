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

    /**
     * Lấy danh sách FAQ đang hoạt động (cho người dùng).
     * 
     * @return List<FaqResponse> danh sách FAQ
     */
    public List<FaqResponse> getActiveFaqs() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách categories của FAQ.
     * 
     * @return List<String> danh sách categories
     */
    public List<String> getCategories() {
        return faqRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(Faq::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Tìm FAQ phù hợp nhất với câu hỏi của người dùng.
     * Sử dụng thuật toán tính điểm để khớp từ khóa.
     * 
     * @param userMessage Câu hỏi của người dùng
     * @return FaqResponse FAQ phù hợp nhất hoặc null nếu không tìm thấy
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

        if (bestScore >= 1) {
            return toResponse(best);
        }
        return null;
    }

    /**
     * Tính điểm khớp giữa FAQ và câu hỏi người dùng.
     * 
     * @param faq FAQ cần đánh giá
     * @param userWords Tập từ của người dùng (đã normalize)
     * @param normalizedMsg Câu hỏi đã normalize
     * @return int Điểm khớp (cao hơn = phù hợp hơn)
     */
    private int calculateMatchScore(Faq faq, Set<String> userWords, String normalizedMsg) {
        int score = 0;

        // Giảm điểm nếu user hỏi về profile nhưng FAQ lại về đơn hàng
        boolean profileIntent = normalizedMsg.contains("thong tin ca nhan")
                || normalizedMsg.contains("ho so ca nhan")
                || normalizedMsg.contains("thay doi thong tin")
                || normalizedMsg.contains("cap nhat thong tin")
                || normalizedMsg.contains("chinh sua ho so");
        if (profileIntent && "DON_HANG".equals(faq.getCategory())) {
            score -= 25;
        }

        // Khớp từ khóa (keywords) - 3 điểm mỗi từ khóa
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

        // Khớp từ trong câu hỏi FAQ - 2 điểm mỗi từ
        String normalizedQuestion = normalize(faq.getQuestion());
        Set<String> questionWords = new HashSet<>(Arrays.asList(normalizedQuestion.split("\\s+")));
        for (String word : questionWords) {
            if (word.length() > 2 && userWords.contains(word)) {
                score += 2;
            }
        }

        // Khớp từ dài trong câu hỏi - 1 điểm mỗi từ
        if (normalizedMsg.length() >= 5) {
            for (String word : userWords) {
                if (word.length() > 4 && normalizedQuestion.contains(word)) {
                    score += 1;
                }
            }
        }

        return score;
    }

    /**
     * Normalize text: chuyển thành chữ thường và loại bỏ dấu tiếng Việt.
     * 
     * @param text Text cần normalize
     * @return String đã normalize
     */
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

    /**
     * Lấy tất cả FAQ (cho admin).
     * 
     * @return List<FaqResponse> danh sách FAQ
     */
    public List<FaqResponse> getAllFaqs() {
        return faqRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy FAQ theo ID.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy FAQ
     * 
     * @param id ID của FAQ cần lấy
     * @return FaqResponse thông tin FAQ
     */
    public FaqResponse getFaqById(Long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy FAQ
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", id)); // EX-001
        return toResponse(faq);
    }

    /**
     * Tạo FAQ mới.
     * 
     * @param request FaqRequest chứa thông tin FAQ
     * @return FaqResponse thông tin FAQ đã tạo
     */
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
        
        Faq saved = faqRepository.save(faq);
        return toResponse(saved);
    }

    /**
     * Cập nhật FAQ.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy FAQ
     * 
     * @param id ID của FAQ cần cập nhật
     * @param request FaqRequest chứa thông tin mới
     * @return FaqResponse thông tin FAQ đã cập nhật
     */
    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest request) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy FAQ
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", id)); // EX-001

        if (request.getQuestion() != null) faq.setQuestion(request.getQuestion());
        if (request.getAnswer() != null) faq.setAnswer(request.getAnswer());
        if (request.getCategory() != null) faq.setCategory(request.getCategory());
        if (request.getKeywords() != null) faq.setKeywords(request.getKeywords());
        if (request.getActive() != null) faq.setActive(request.getActive());
        if (request.getSortOrder() != null) faq.setSortOrder(request.getSortOrder());

        return toResponse(faqRepository.save(faq));
    }

    /**
     * Xóa FAQ.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - ResourceNotFoundException (1): Khi không tìm thấy FAQ
     * 
     * @param id ID của FAQ cần xóa
     */
    @Transactional
    public void deleteFaq(Long id) {
        // EXCEPTION: ResourceNotFoundException - Khi không tìm thấy FAQ
        if (!faqRepository.existsById(id)) {
            throw new ResourceNotFoundException("FAQ", id); // EX-001
        }
        faqRepository.deleteById(id);
    }

    /**
     * Chuyển đổi Faq entity sang FaqResponse DTO.
     * 
     * @param faq Faq entity
     * @return FaqResponse
     */
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
