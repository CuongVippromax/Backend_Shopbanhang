package com.cuong.shopbanhang.service;

import com.cuong.shopbanhang.dto.request.ChatRequest;
import com.cuong.shopbanhang.dto.response.ChatResponse;
import com.cuong.shopbanhang.dto.response.FaqResponse;
import com.cuong.shopbanhang.model.Book;
import com.cuong.shopbanhang.repository.BookRepository;
import com.cuong.shopbanhang.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ChatbotService")
public class ChatbotService {

    /** Từ quá ngắn / phổ biến — khớp trong mô tả sách dễ gây dương tính giả (vd: "tin" trong "thông tin"). */
    private static final Set<String> TOPIC_STOPWORDS = Set.of(
            "tin", "va", "cac", "cho", "cua", "voi", "mot", "hai", "ba", "bon", "nam", "sau", "bay",
            "hay", "co", "la", "de", "duoc", "trong", "nay", "do", "se", "khong", "chi", "ban", "toi",
            "tui", "em", "anh", "nen", "rat", "qua", "ve", "nao", "gi", "the", "noi", "cung", "da",
            "sach", "cuon", "quyen", "mua", "tim", "xem", "doc", "hoi", "xin", "cam", "on","tim sach","tim quyen","tim cuon");

    private final BookRepository bookRepository;
    private final FaqRepository faqRepository;
    private final RestTemplate restTemplate;

    private static final String GEMINI_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Value("${spring.ai.google.genai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.google.genai.model:gemini-3.0-flash-lite}")
    private String geminiModel;

    private static final String SYSTEM_PROMPT = """
        Bạn đóng vai nhân viên tư vấn trực tuyến của "Nhà sách Hoàng Kim" (cửa hàng sách trực tuyến).
        Trò chuyện tự nhiên như người thật ở quầy hỗ trợ: xưng "mình/em" với khách, lịch sự, nhiệt tình.
        Không nhắc đến việc bạn là mô hình AI, chatbot hay máy tính.
        
        NHIỆM VỤ:
        1. Trả lời câu hỏi về sách, đơn hàng, thanh toán, vận chuyển
        2. Gợi ý sách phù hợp với sở thích khách
        3. Hỗ trợ khách trong giờ mô tả dưới đây (ngoài giờ có thể mời khách để lại câu hỏi hoặc gọi hotline)
        
        NGUYÊN TẮC:
        - Trả lời ngắn gọn, thân thiện bằng tiếng Việt
        - Nếu không biết: "Mình chưa có thông tin chính xác về phần này. Bạn gọi hotline 0123-456-789 hoặc nhắn lại sau giúp mình nhé."
        - Không bịa đặt giá, khuyến mãi nếu không được cung cấp
        - Khi khách cần sách, gợi ý cụ thể và thực tế
        
        Thông tin cửa hàng:
        - Tên: Nhà sách Hoàng Kim
        - Hotline: 0354-780-757
        - Giờ làm việc: 8:00 - 21:00
        - Thanh toán: COD, VNPay, PayPal
        - Miễn phí vận chuyển cho mọi đơn 
        """;

    public ChatResponse chat(ChatRequest request) {
        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ChatResponse.builder()
                    .message("Chào bạn! Mình có thể giúp gì cho bạn hôm nay?")
                    .type("text")
                    .build();
        }

        String intent = detectIntent(userMessage);
        log.info(">>> [CHATBOT] message=\"{}\" → intent={}", userMessage, intent);

        switch (intent) {
            case "recommendation" -> {
                log.info(">>> [CHATBOT] → handleBookRecommendation (gọi Gemini)");
                return handleBookRecommendation(userMessage.toLowerCase(Locale.ROOT));
            }
            case "faq" -> {
                log.info(">>> [CHATBOT] → handleFaqMatch (DB FAQ, không gọi Gemini)");
                return handleFaqMatch(userMessage);
            }
            case "search" -> {
                log.info(">>> [CHATBOT] → handleBookSearch (DB sách, không gọi Gemini)");
                return handleBookSearch(userMessage.toLowerCase(Locale.ROOT));
            }
            default -> {
                log.info(">>> [CHATBOT] → handleGeneralQuestion (gọi Gemini + FAQ context)");
                return handleGeneralQuestion(userMessage);
            }
        }
    }

    /**
     * So khớp trên chuỗi đã bỏ dấu — câu gõ không dấu vẫn vào đúng intent (vd: "tim sach kinh te").
     */
    private String detectIntent(String rawMessage) {
        String norm = normalizeVietnamese(rawMessage.toLowerCase(Locale.ROOT));
        /* Không dùng từ đơn "giá"/"gia" — "giải thích" chứa "gia" → nhầm sang search */
        String[] generalFirst = {"giai thich", "phan tich", "viet cho", "viet mot", "la gi",
                "tai sao", "dinh nghia", "so sanh", "may hoc", "machine learning", "giai thuat"};
        for (String phrase : generalFirst) {
            if (norm.contains(phrase)) {
                return "general";
            }
        }
        String[] recommendationKeywords = {"gợi ý", "recommend", "đề xuất", "nên đọc", "muốn đọc",
                "muốn tìm", "mua sách", "tìm sách", "tìm cuốn", "tìm quyển", "cho tôi xem", "hiển thị", "book"};
        String[] faqKeywords = {"cách", "làm sao", "như thế nào", "hướng dẫn", "chính sách",
                "đổi trả", "bảo hành", "thanh toán", "vận chuyển", "giao hàng", "liên hệ", "hotline"};
        /*
         * Search: cụm rõ ràng — tránh "gia" đơn (trùng tiền tố "giải").
         * "tìm" đứng sau "tìm sách" ở recommendation; "tim" ngắn có thể lệch → ưu tiên "tim sach", "tim kiem".
         */
        String[] searchKeywords = {"tìm kiếm", "search", "có bán", "còn hàng", "price",
                "giá sách", "giá bao nhiêu", "gia sach", "gia bao nhieu", "bao nhiêu tiền", "bao nhieu tien",
                "mua không", "mua khong", "còn không", "con khong"};

        for (String keyword : recommendationKeywords) {
            if (norm.contains(normalizeVietnamese(keyword.toLowerCase(Locale.ROOT)))) {
                return "recommendation";
            }
        }
        for (String keyword : searchKeywords) {
            if (norm.contains(normalizeVietnamese(keyword.toLowerCase(Locale.ROOT)))) {
                return "search";
            }
        }
        /* "tìm" / "tim" chỉ khi là từ tìm sách, không khớp trong "thích/thích nghi" */
        if (matchesWholeWord(norm, "tim") || matchesWholeWord(norm, "mua")) {
            return "search";
        }
        for (String keyword : faqKeywords) {
            if (norm.contains(normalizeVietnamese(keyword.toLowerCase(Locale.ROOT)))) {
                return "faq";
            }
        }
        return "general";
    }

    /** Khớp từ đầy đủ (token), tránh "tim" trong "thich". */
    private boolean matchesWholeWord(String normalizedSpaceSeparated, String word) {
        if (word == null || word.isBlank()) {
            return false;
        }
        String w = word.trim().toLowerCase();
        for (String token : normalizedSpaceSeparated.split("\\s+")) {
            if (token.equals(w)) {
                return true;
            }
        }
        return false;
    }

    private ChatResponse handleBookRecommendation(String message) {
        log.info(">>> [handleBookRecommendation] đang gọi Gemini với message=\"{}\"", message);
        List<Book> allBooks = bookRepository.findAll();
        if (allBooks.isEmpty()) {
            return ChatResponse.builder()
                    .message("Xin lỗi, hiện tại cửa hàng chưa có sách để gợi ý.")
                    .type("text")
                    .intent("recommendation")
                    .build();
        }

        String bookContext = buildBookContext(allBooks);
        String aiPrompt = String.format("""
            Dựa trên thông tin sách sau, hãy gợi ý 3-5 cuốn sách phù hợp với yêu cầu của khách hàng.
            Nếu khách hàng không nêu rõ sở thích, hãy gợi ý các sách nổi bật.
            QUAN TRỌNG: Nếu khách hàng nêu rõ thể loại/chủ đề (ví dụ: công nghệ thông tin, kinh tế, tiểu thuyết),
            CHỈ được chọn sách có tên/tác giả/mô tả/thể loại khớp chủ đề đó trong danh sách.
            Nếu trong danh sách không có sách phù hợp, trả về bookRecommendations là mảng rỗng và message giải thích ngắn.
            
            Thông tin các sách:
            %s
            
            Yêu cầu khách hàng: %s
            
            Trả lời theo format JSON:
            {
              "message": "Lời chào và giới thiệu ngắn gọn",
              "bookRecommendations": [
                {"bookId": id, "bookName": "Tên sách", "price": giá, "author": "Tác giả", "category": "Thể loại", "image": "URL ảnh", "averageRating": rating}
              ]
            }
            Chỉ trả lời JSON, không giải thích gì thêm.
            """, bookContext, message);

        try {
            log.info(">>> [handleBookRecommendation] 🤖 ĐANG GỌI GEMINI...");
            String response = callGeminiApi(SYSTEM_PROMPT, aiPrompt);
            log.info(">>> [handleBookRecommendation] ✅ GEMINI TRẢ LỜI: {} ký tự", response.length());
            return parseAiBookResponse(response);
        } catch (Exception e) {
            log.error(">>> [handleBookRecommendation] ❌ GEMINI THẤT BẠI → fallback. Lỗi: {}", e.getMessage());
            return getFallbackRecommendation(message);
        }
    }

    private ChatResponse handleBookSearch(String message) {
        log.info(">>> [handleBookSearch] tìm sách trong DB, message=\"{}\"", message);
        String searchQuery = extractSearchQuery(message);
        List<Book> books = bookRepository.findAll();

        String normalizedQuery = normalizeVietnamese(searchQuery.toLowerCase());
        List<Book> matchedBooks = books.stream()
                .filter(book -> matchesSearch(book, normalizedQuery, true))
                .limit(5)
                .collect(Collectors.toList());

        if (matchedBooks.isEmpty()) {
            return ChatResponse.builder()
                    .message("Không tìm thấy sách phù hợp với từ khóa: " + searchQuery)
                    .type("text")
                    .intent("search")
                    .build();
        }

        return ChatResponse.builder()
                .message("Tìm thấy " + matchedBooks.size() + " sách phù hợp:")
                .type("book_list")
                .bookRecommendations(matchedBooks.stream()
                        .map(this::toBookRecommendation)
                        .collect(Collectors.toList()))
                .intent("search")
                .build();
    }

    private boolean matchesSearch(Book book, String query) {
        return matchesSearch(book, query, true);
    }

    /**
     * @param includeDescription false khi gợi ý theo chủ đề (tránh khớp nhầm vì từ ngắn trong mô tả dài).
     */
    private boolean matchesSearch(Book book, String query, boolean includeDescription) {
        if (query == null || query.isBlank()) {
            return false;
        }
        if (book.getBookName() != null && normalizeVietnamese(book.getBookName().toLowerCase()).contains(query)) {
            return true;
        }
        if (book.getAuthor() != null && normalizeVietnamese(book.getAuthor().toLowerCase()).contains(query)) {
            return true;
        }
        if (book.getCategory() != null && book.getCategory().getCategoryName() != null
                && normalizeVietnamese(book.getCategory().getCategoryName().toLowerCase()).contains(query)) {
            return true;
        }
        if (includeDescription && book.getDescription() != null
                && normalizeVietnamese(book.getDescription().toLowerCase()).contains(query)) {
            return true;
        }
        return false;
    }

    private String extractSearchQuery(String message) {
        String norm = normalizeVietnamese(message.toLowerCase(Locale.ROOT));
        String[] prefixes = {"tim kiem", "search", "muon tim sach", "muon mua sach", "tim sach", "tim cuon",
                "tim quyen", "tim ", "co ban", "con hang", "gia sach", "gia ban", "gia bao nhieu", "price", "mua sach"};
        String queryNorm = norm;
        for (String prefix : prefixes) {
            int idx = norm.indexOf(prefix);
            if (idx >= 0) {
                queryNorm = norm.substring(idx + prefix.length()).trim();
                break;
            }
        }
        return queryNorm.replaceAll("^\\s+", "").replaceAll("\\s+$", "");
    }

    private ChatResponse handleFaqMatch(String message) {
        log.info(">>> [handleFaqMatch] tìm FAQ trong DB, message=\"{}\"", message);
        FaqResponse faqMatch = findBestFaqMatch(message);
        if (faqMatch != null) {
            log.info(">>> [handleFaqMatch] ✅ KHỚP FAQ id={} question=\"{}\"", faqMatch.getId(), faqMatch.getQuestion());
            return ChatResponse.builder()
                    .message(faqMatch.getAnswer())
                    .type("faq")
                    .intent("faq")
                    .build();
        }

        log.info(">>> [handleFaqMatch] ❌ Không khớp FAQ nào → chuyển sang handleGeneralQuestion");
        return handleGeneralQuestion(message);
    }

    private FaqResponse findBestFaqMatch(String userMessage) {
        String normalized = normalizeVietnamese(userMessage.trim());
        Set<String> userWords = new HashSet<>(Arrays.asList(normalized.split("\\s+")));

        var faqs = faqRepository.findByActiveTrueOrderBySortOrderAsc();
        FaqResponse best = null;
        int bestScore = 0;

        for (var faq : faqs) {
            int score = calculateMatchScore(faq.getQuestion(), faq.getKeywords(), userWords, normalized);
            if (score > bestScore) {
                bestScore = score;
                best = FaqResponse.builder()
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

        return bestScore >= 2 ? best : null;
    }

    private int calculateMatchScore(String question, String keywords, Set<String> userWords, String normalizedMsg) {
        int score = 0;

        if (keywords != null && !keywords.isBlank()) {
            for (String rawPhrase : keywords.split(",")) {
                String phrase = normalizeVietnamese(rawPhrase.trim());
                if (phrase.isEmpty()) continue;
                if (normalizedMsg.contains(phrase)) {
                    score += 3;
                }
            }
        }

        String normalizedQuestion = normalizeVietnamese(question);
        Set<String> questionWords = new HashSet<>(Arrays.asList(normalizedQuestion.split("\\s+")));
        for (String word : questionWords) {
            if (word.length() > 2 && userWords.contains(word)) {
                score += 2;
            }
        }

        return score;
    }

    private ChatResponse handleGeneralQuestion(String message) {
        log.info(">>> [handleGeneralQuestion] đang gọi Gemini + FAQ context, message=\"{}\"", message);
        String bookContext = buildBookContext(bookRepository.findAll());
        String faqContext = buildFaqContext();
        String userContext = String.format("""
            Khách hàng hỏi: %s
            
            Thông tin sách có sẵn:
            %s
            
            Câu hỏi thường gặp (FAQ):
            %s
            """, message, bookContext, faqContext);

        try {
            log.info(">>> [handleGeneralQuestion] 🤖 ĐANG GỌI GEMINI...");
            String response = callGeminiApi(SYSTEM_PROMPT, userContext);
            log.info(">>> [handleGeneralQuestion] ✅ GEMINI TRẢ LỜI: {} ký tự", response.length());

            return ChatResponse.builder()
                    .message(response)
                    .type("text")
                    .intent("general")
                    .build();
        } catch (Exception e) {
            log.error(">>> [handleGeneralQuestion] ❌ GEMINI THẤT BẠI → fallback. Lỗi: {}", e.getMessage());
            return getFallbackResponse(message);
        }
    }

    private void ensureGeminiApiKeyConfigured() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing Gemini API key (AI_API_KEY)");
        }
    }

    private List<String> geminiModelFallbackChain() {
        List<String> models = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            models.add(geminiModel.trim());
        }
        return models;
    }

    private String callGeminiApi(String systemPrompt, String userContent) {
        ensureGeminiApiKeyConfigured();
        String model = geminiModel != null && !geminiModel.isBlank()
                ? geminiModel.trim()
                : "gemini-3.1-flash-lite-preview";
        return callGeminiApiOnce(model, systemPrompt, userContent);
    }

    @SuppressWarnings("unchecked")
    private String callGeminiApiOnce(String model, String systemPrompt, String userContent) {
        String url = String.format(GEMINI_URL_TEMPLATE, model, apiKey.trim());

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        List<Map<String, Object>> sysParts = new ArrayList<>();
        Map<String, Object> sysPart = new HashMap<>();
        sysPart.put("text", systemPrompt);
        sysParts.add(sysPart);
        systemInstruction.put("parts", sysParts);
        requestBody.put("systemInstruction", systemInstruction);

        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", userContent);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) {
            throw new IllegalStateException("Empty Gemini response body");
        }
        if (responseBody.containsKey("error")) {
            throw new IllegalStateException("Gemini error: " + responseBody.get("error"));
        }
        if (responseBody.containsKey("promptFeedback")) {
        }
        if (responseBody.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                if (candidate.containsKey("finishReason") && "SAFETY".equals(String.valueOf(candidate.get("finishReason")))) {
                }
                Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
                if (contentResponse != null) {
                    List<Map<String, Object>> responseParts =
                            (List<Map<String, Object>>) contentResponse.get("parts");
                    if (responseParts != null && !responseParts.isEmpty()) {
                        Object text = responseParts.get(0).get("text");
                        if (text != null) {
                            return text.toString();
                        }
                    }
                }
            }
        }
        throw new IllegalStateException("Unexpected Gemini response shape");
    }

    private String buildBookContext(List<Book> books) {
        if (books.isEmpty()) {
            return "Hiện tại chưa có sách trong cửa hàng.";
        }

        return books.stream()
                .limit(50)
                .map(book -> String.format(
                        "- ID: %d | Tên: %s | Giá: %s | Tác giả: %s | Thể loại: %s | Mô tả: %s | Rating: %s",
                        book.getBookId(),
                        book.getBookName(),
                        book.getPrice() != null ? String.format("%.0fđ", book.getPrice()) : "Liên hệ",
                        book.getAuthor() != null ? book.getAuthor() : "Không rõ",
                        book.getCategory() != null ? book.getCategory().getCategoryName() : "Không rõ",
                        book.getDescription() != null ? book.getDescription().substring(0, Math.min(100, book.getDescription().length())) : "Không có",
                        book.getAverageRating() != null ? String.format("%.1f/5", book.getAverageRating()) : "Chưa có"
                ))
                .collect(Collectors.joining("\n"));
    }

    private String buildFaqContext() {
        var faqs = faqRepository.findByActiveTrueOrderBySortOrderAsc();
        if (faqs.isEmpty()) {
            return "Chưa có FAQ.";
        }

        return faqs.stream()
                .limit(20)
                .map(faq -> String.format("Q: %s\nA: %s", faq.getQuestion(), faq.getAnswer()))
                .collect(Collectors.joining("\n\n"));
    }

    private ChatResponse parseAiBookResponse(String response) {
        try {
            int jsonStart = response.indexOf("{");
            int jsonEnd = response.lastIndexOf("}");
            if (jsonStart == -1 || jsonEnd == -1) {
                return ChatResponse.builder()
                        .message(response)
                        .type("text")
                        .intent("recommendation")
                        .build();
            }

            String jsonStr = response.substring(jsonStart, jsonEnd + 1);
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(jsonStr);

            String message = node.has("message") ? node.get("message").asText() : "";
            List<ChatResponse.BookRecommendation> books = new ArrayList<>();

            if (node.has("bookRecommendations")) {
                for (var bookNode : node.get("bookRecommendations")) {
                    books.add(ChatResponse.BookRecommendation.builder()
                            .bookId(bookNode.has("bookId") ? bookNode.get("bookId").asLong() : null)
                            .bookName(getTextOrNull(bookNode, "bookName"))
                            .price(bookNode.has("price") ? bookNode.get("price").asDouble() : null)
                            .author(getTextOrNull(bookNode, "author"))
                            .category(getTextOrNull(bookNode, "category"))
                            .image(getTextOrNull(bookNode, "image"))
                            .averageRating(bookNode.has("averageRating") ? bookNode.get("averageRating").asDouble() : null)
                            .build());
                }
            }

            return ChatResponse.builder()
                    .message(message)
                    .type(books.isEmpty() ? "text" : "book_list")
                    .bookRecommendations(books)
                    .intent("recommendation")
                    .build();
        } catch (Exception e) {
            return ChatResponse.builder()
                    .message(response)
                    .type("text")
                    .intent("recommendation")
                    .build();
        }
    }

    private String getTextOrNull(com.fasterxml.jackson.databind.JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }

    private ChatResponse.BookRecommendation toBookRecommendation(Book book) {
        return ChatResponse.BookRecommendation.builder()
                .bookId(book.getBookId())
                .bookName(book.getBookName())
                .price(book.getPrice())
                .author(book.getAuthor())
                .category(book.getCategory() != null ? book.getCategory().getCategoryName() : null)
                .image(book.getImage())
                .averageRating(book.getAverageRating())
                .build();
    }

    private ChatResponse getFallbackResponse(String message) {
        String lowerMessage = message.toLowerCase();
        if (lowerMessage.contains("đơn hàng") || lowerMessage.contains("order")) {
            return ChatResponse.builder()
                    .message("Bạn có thể theo dõi đơn hàng tại mục 'Đơn hàng của tôi' trên website. Nếu cần hỗ trợ, gọi hotline: 0123-456-789")
                    .type("text")
                    .intent("faq")
                    .build();
        }
        if (lowerMessage.contains("thanh toán") || lowerMessage.contains("payment")) {
            return ChatResponse.builder()
                    .message("Chúng tôi hỗ trợ thanh toán qua: COD, VNPay, PayPal. Miễn phí vận chuyển cho đơn từ 200.000đ")
                    .type("text")
                    .intent("faq")
                    .build();
        }
        if (lowerMessage.contains("liên hệ") || lowerMessage.contains("hotline")) {
            return ChatResponse.builder()
                    .message("Hotline: 0123-456-789 (8:00 - 22:00) | Email: support@shopsachcuong.com")
                    .type("text")
                    .intent("faq")
                    .build();
        }
        return ChatResponse.builder()
                .message("Xin lỗi, tôi chưa hiểu ý của bạn. Bạn có thể hỏi về sách, đơn hàng, thanh toán hoặc liên hệ hotline: 0123-456-789")
                .type("text")
                .intent("general")
                .build();
    }

    private ChatResponse getFallbackRecommendation(String message) {
        List<Book> books = bookRepository.findAll();
        if (books.isEmpty()) {
            return ChatResponse.builder()
                    .message("Xin lỗi, hiện tại cửa hàng chưa có sách nào.")
                    .type("text")
                    .intent("recommendation")
                    .build();
        }

        String topic = extractTopicFromBookRequest(message);
        if (topic != null && !topic.isBlank()) {
            String normalizedTopic = normalizeVietnamese(topic.toLowerCase(Locale.ROOT));
            List<Book> matched = books.stream()
                    .filter(book -> matchesTopicInCoreFields(book, normalizedTopic))
                    .sorted((a, b) -> Double.compare(
                            b.getAverageRating() != null ? b.getAverageRating() : 0,
                            a.getAverageRating() != null ? a.getAverageRating() : 0))
                    .limit(5)
                    .collect(Collectors.toList());
            if (!matched.isEmpty()) {
                return ChatResponse.builder()
                        .message("Dưới đây là một số đầu sách trong kho phù hợp với bạn:")
                        .type("book_list")
                        .bookRecommendations(matched.stream()
                                .map(this::toBookRecommendation)
                                .collect(Collectors.toList()))
                        .intent("recommendation")
                        .build();
            }
            return ChatResponse.builder()
                    .message("Trong cửa hàng hiện không có sách khớp chủ đề \"" + topic.trim() + "\". Dưới đây là một số sách được đánh giá cao khác:")
                    .type("book_list")
                    .bookRecommendations(topRatedBooks(books, 5).stream()
                            .map(this::toBookRecommendation)
                            .collect(Collectors.toList()))
                    .intent("recommendation")
                    .build();
        }

        return ChatResponse.builder()
                .message("Đây là một số sách được đánh giá cao:")
                .type("book_list")
                .bookRecommendations(topRatedBooks(books, 5).stream()
                        .map(this::toBookRecommendation)
                        .collect(Collectors.toList()))
                .intent("recommendation")
                .build();
    }

    /**
     * Lấy phần chủ đề sau cụm như "mua sách", "tìm sách" (để lọc DB khi không gọi được AI).
     */
    private String extractTopicFromBookRequest(String message) {
        if (message == null) {
            return null;
        }
        String lower = message.toLowerCase(Locale.ROOT).trim();
        String[] markers = {"muốn mua sách", "mua sách", "tim sach", "tìm sách", "gợi ý sách", "goi y sach",
                "đề xuất sách", "de xuat sach", "muốn đọc", "muon doc"};
        for (String m : markers) {
            int idx = lower.indexOf(m);
            if (idx >= 0) {
                String rest = lower.substring(idx + m.length()).trim();
                if (!rest.isEmpty()) {
                    return rest;
                }
            }
        }
        return null;
    }

    /**
     * Gợi ý nội bộ: chỉ tên / tác giả / thể loại; cụm đầy đủ hoặc ≥2 từ khóa đủ dài (tránh "tin", "cong" lẻ).
     */
    private boolean matchesTopicInCoreFields(Book book, String normalizedTopic) {
        if (matchesSearch(book, normalizedTopic, false)) {
            return true;
        }
        List<String> tokens = extractSignificantTopicTokens(normalizedTopic);
        if (tokens.isEmpty()) {
            return false;
        }
        if (tokens.size() >= 2) {
            int hits = 0;
            for (String t : tokens) {
                if (matchesSearch(book, t, false)) {
                    hits++;
                }
            }
            return hits >= 2;
        }
        return matchesSearch(book, tokens.get(0), false);
    }

    private List<String> extractSignificantTopicTokens(String normalizedTopic) {
        List<String> out = new ArrayList<>();
        for (String raw : normalizedTopic.split("\\s+")) {
            if (raw.length() < 4 || TOPIC_STOPWORDS.contains(raw)) {
                continue;
            }
            out.add(raw);
        }
        return out;
    }

    private List<Book> topRatedBooks(List<Book> books, int limit) {
        return books.stream()
                .sorted((a, b) -> Double.compare(
                        b.getAverageRating() != null ? b.getAverageRating() : 0,
                        a.getAverageRating() != null ? a.getAverageRating() : 0))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private String normalizeVietnamese(String text) {
        if (text == null) return "";
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
}
