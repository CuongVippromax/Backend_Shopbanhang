package com.cuong.shopbanhang.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for FAQ create/update request
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqRequest {
    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;

    @NotBlank(message = "Câu trả lời không được để trống")
    private String answer;

    @NotBlank(message = "Phân loại không được để trống")
    private String category;

    private String keywords;

    private Boolean active;

    private Integer sortOrder;
}
