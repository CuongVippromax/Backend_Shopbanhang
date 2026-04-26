package com.cuong.shopbanhang.controller;

import com.cuong.shopbanhang.dto.request.ChatRequest;
import com.cuong.shopbanhang.dto.response.ChatResponse;
import com.cuong.shopbanhang.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/chatbot", "/api/chatbot"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            ChatResponse response = chatbotService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ChatResponse errorResponse = ChatResponse.builder()
                    .message("Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau. Chi tiết: " + e.getMessage())
                    .type("error")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "bookstore-support-chat",
                "message", "Tư vấn nhà sách — dịch vụ đang chạy"
        ));
    }

    @GetMapping("/test-gemini")
    public ResponseEntity<?> testGemini() {
        try {
            String testResponse = chatbotService.testGeminiConnection();
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "response", testResponse
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}