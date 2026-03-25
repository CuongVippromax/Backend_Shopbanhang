package com.cuong.shopbanhang.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faq")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Câu hỏi không được để trống")
    @Column(nullable = false, length = 500)
    private String question;

    @NotBlank(message = "Câu trả lời không được để trống")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    @NotBlank(message = "Phân loại không được để trống")
    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 500)
    private String keywords;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
