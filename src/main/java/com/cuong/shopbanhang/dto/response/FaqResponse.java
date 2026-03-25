package com.cuong.shopbanhang.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqResponse {

    private Long id;
    private String question;
    private String answer;
    private String category;
    private String keywords;
    private Boolean active;
    private Integer sortOrder;
}
