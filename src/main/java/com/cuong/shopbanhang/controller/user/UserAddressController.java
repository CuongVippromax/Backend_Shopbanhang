package com.cuong.shopbanhang.controller.user;

import com.cuong.shopbanhang.dto.request.AddressRequest;
import com.cuong.shopbanhang.dto.response.AddressResponse;
import com.cuong.shopbanhang.dto.response.DataResponse;
import com.cuong.shopbanhang.exception.UnauthorizedException;
import com.cuong.shopbanhang.security.SecurityUtils;
import com.cuong.shopbanhang.service.UserAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1/users/addresses")
@RequiredArgsConstructor
@Slf4j(topic = "UserAddressController")
public class UserAddressController {

    private final UserAddressService userAddressService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public DataResponse<List<AddressResponse>> getAddresses() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        List<AddressResponse> addresses = userAddressService.getAddresses(userId);
        return DataResponse.<List<AddressResponse>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("OK")
                .data(addresses)
                .build();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public DataResponse<AddressResponse> addAddress(@Valid @RequestBody AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        AddressResponse address = userAddressService.addAddress(userId, request);
        return DataResponse.<AddressResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Thêm địa chỉ thành công")
                .data(address)
                .build();
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public DataResponse<AddressResponse> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        AddressResponse address = userAddressService.updateAddress(userId, addressId, request);
        return DataResponse.<AddressResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Cập nhật địa chỉ thành công")
                .data(address)
                .build();
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public DataResponse<Void> deleteAddress(@PathVariable Long addressId) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        userAddressService.deleteAddress(userId, addressId);
        return DataResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Xóa địa chỉ thành công")
                .build();
    }

    @PutMapping("/{addressId}/default")
    @PreAuthorize("isAuthenticated()")
    public DataResponse<AddressResponse> setDefaultAddress(@PathVariable Long addressId) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Chưa đăng nhập."));
        AddressResponse address = userAddressService.setDefaultAddress(userId, addressId);
        return DataResponse.<AddressResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Đặt địa chỉ mặc định thành công")
                .data(address)
                .build();
    }
}
