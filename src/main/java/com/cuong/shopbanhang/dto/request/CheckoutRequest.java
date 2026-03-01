package com.cuong.shopbanhang.dto.request;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CheckoutRequest {
    private String fullName;
    private String email;
    private String shippingAddress;
    private String paymentMethod;
}
