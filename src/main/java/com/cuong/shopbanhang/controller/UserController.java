package com.cuong.shopbanhang.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cuong.shopbanhang.dto.DataResponse;
import com.cuong.shopbanhang.dto.PageResponse;
import com.cuong.shopbanhang.dto.UserResponse;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.service.UserService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Validated
@RequestMapping("/api/v1/users")
@AllArgsConstructor
@Slf4j(topic = "USER_CONTROLLER")
public class UserController {
        private final UserService userService;

        @PostMapping("/register")
        public DataResponse<UserResponse> createUser(@Valid @RequestBody User user) {
                UserResponse newUser = userService.createUser(user);
                return DataResponse.<UserResponse>builder()
                                .statusCode(HttpStatus.CREATED.value())
                                .message("User created successfully")
                                .data(newUser)
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

        @PutMapping("/update/{id}")
        public DataResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody User user) {
                UserResponse updatedUser = userService.updateUser(id, user);
                return DataResponse.<UserResponse>builder()
                                .statusCode(HttpStatus.OK.value())
                                .message("User updated successfully")
                                .data(updatedUser)
                                .build();
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public DataResponse<Void> deleteUser(@PathVariable Long id) {
                userService.deleteUser(id);
                return DataResponse.<Void>builder()
                                .statusCode(HttpStatus.OK.value())
                                .message("User deleted successfully")
                                .build();
        }

        @GetMapping("/search")
        @PreAuthorize("hasRole('ADMIN')")
        public DataResponse<PageResponse<List<UserResponse>>> searchUsers(
                        @RequestParam(name = "search", required = false) String search,
                        @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
                        @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
                        @RequestParam(name = "sortBy", required = false) String sortBy) {
                PageResponse<List<UserResponse>> users = userService.getAllUserswithSearchandSort(pageNo, pageSize,
                                sortBy,
                                search);
                return DataResponse.<PageResponse<List<UserResponse>>>builder()
                                .statusCode(HttpStatus.OK.value())
                                .message("Users found successfully")
                                .data(users)
                                .build();
        }
}
