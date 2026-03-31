package com.cuong.shopbanhang.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

// DTO for checkout request
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CheckoutRequest {
    @NotBlank(message = "Vui lòng nhập họ tên")
    private String fullName;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    @Pattern(regexp = "^(\\+84|0)[3-9]\\d{8}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
    private String shippingAddress;

    @NotBlank(message = "Vui lòng chọn phương thức thanh toán")
    private String paymentMethod;

    private String note;
}
