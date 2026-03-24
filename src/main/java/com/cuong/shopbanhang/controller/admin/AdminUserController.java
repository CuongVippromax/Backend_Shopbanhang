package com.cuong.shopbanhang.controller.admin;

import java.util.List;

import jakarta.validation.constraints.Min;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.response.DataResponse;
import com.cuong.shopbanhang.dto.response.PageResponse;
import com.cuong.shopbanhang.dto.response.UserResponse;
import com.cuong.shopbanhang.service.UserService;

import lombok.AllArgsConstructor;


@RestController
@Validated
@RequestMapping("/api/v1/admin/users")
@AllArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public DataResponse<PageResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "sortBy", required = false) String sortBy) {
        PageResponse<List<UserResponse>> users = userService.getAllUserswithSearchandSort(pageNo, pageSize, sortBy, search);
        return DataResponse.<PageResponse<List<UserResponse>>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Users found successfully")
                .data(users)
                .build();
    }

    @GetMapping("/{id}")
    public DataResponse<UserResponse> getUserById(@PathVariable @Min(1) Long id) {
        UserResponse user = userService.getUserById(id);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User found successfully")
                .data(user)
                .build();
    }

    @DeleteMapping("/{id}")
    public DataResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return DataResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User deleted successfully")
                .build();
    }

    @PutMapping("/{id}/role")
    public DataResponse<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        UserResponse user = userService.updateUserRole(id, role);
        return DataResponse.<UserResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("User role updated successfully")
                .data(user)
                .build();
    }
}
