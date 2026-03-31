package com.cuong.shopbanhang.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private String message;
    private String sessionId;
}
