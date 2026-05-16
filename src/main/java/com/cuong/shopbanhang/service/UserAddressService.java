package com.cuong.shopbanhang.service;

import com.cuong.shopbanhang.dto.request.AddressRequest;
import com.cuong.shopbanhang.dto.response.AddressResponse;
import com.cuong.shopbanhang.exception.BadRequestException;
import com.cuong.shopbanhang.exception.ResourceNotFoundException;
import com.cuong.shopbanhang.model.AddressItem;
import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "UserAddressService")
public class UserAddressService {
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public List<AddressResponse> getAddresses(Long userId) {
        User user = userRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<AddressItem> addresses = parseAddresses(user.getAddress());
        
        // Nếu user cũ chưa có addresses, tạo từ address cũ
        if (addresses.isEmpty() && hasLegacyAddress(user)) {
            AddressItem legacy = AddressItem.builder()
                    .id(System.currentTimeMillis())
                    .label("Địa chỉ mặc định")
                    .recipientName(user.getFullName())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .isDefault(true)
                    .build();
            addresses.add(legacy);
            user.setAddress(toJson(addresses));
            userRepository.save(user);
        }

        return addresses.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<AddressItem> addresses = parseAddresses(user.getAddress());

        // Nếu đây là địa chỉ đầu tiên hoặc được đánh dấu là mặc định
        if (addresses.isEmpty() || Boolean.TRUE.equals(request.getIsDefault())) {
            addresses.forEach(a -> a.setIsDefault(false));
            request.setIsDefault(true);
        }

        AddressItem newAddress = AddressItem.builder()
                .id(System.currentTimeMillis())
                .label(request.getLabel())
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        addresses.add(newAddress);
        user.setAddress(toJson(addresses));
        userRepository.save(user);

        log.info("Added new address for user {}", userId);
        return toResponse(newAddress);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        User user = userRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<AddressItem> addresses = parseAddresses(user.getAddress());
        AddressItem target = addresses.stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));

        // Nếu đánh dấu là mặc định, bỏ mặc định các địa chỉ khác
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addresses.forEach(a -> a.setIsDefault(false));
        }

        target.setLabel(request.getLabel());
        target.setRecipientName(request.getRecipientName());
        target.setPhone(request.getPhone());
        target.setAddress(request.getAddress());
        target.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        user.setAddress(toJson(addresses));
        userRepository.save(user);

        log.info("Updated address {} for user {}", addressId, userId);
        return toResponse(target);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        User user = userRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<AddressItem> addresses = parseAddresses(user.getAddress());
        boolean wasDefault = addresses.stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .map(AddressItem::getIsDefault)
                .orElse(false);

        boolean removed = addresses.removeIf(a -> a.getId().equals(addressId));
        if (!removed) {
            throw new ResourceNotFoundException("Address", addressId);
        }

        // Nếu xóa địa chỉ mặc định, đánh dấu địa chỉ đầu tiên là mặc định
        if (wasDefault && !addresses.isEmpty()) {
            addresses.get(0).setIsDefault(true);
        }

        user.setAddress(toJson(addresses));
        userRepository.save(user);

        log.info("Deleted address {} for user {}", addressId, userId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        User user = userRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<AddressItem> addresses = parseAddresses(user.getAddress());
        AddressItem target = addresses.stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));

        addresses.forEach(a -> a.setIsDefault(a.getId().equals(addressId)));

        user.setAddress(toJson(addresses));
        userRepository.save(user);

        log.info("Set default address {} for user {}", addressId, userId);
        return toResponse(target);
    }

    private List<AddressItem> parseAddresses(String addressJson) {
        if (addressJson == null || addressJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(addressJson, new TypeReference<List<AddressItem>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse addresses JSON, returning empty list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private String toJson(List<AddressItem> addresses) {
        try {
            return objectMapper.writeValueAsString(addresses);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Lỗi khi lưu địa chỉ");
        }
    }

    private boolean hasLegacyAddress(User user) {
        return user.getAddress() != null && !user.getAddress().isBlank() 
                && !user.getAddress().startsWith("[");
    }

    private AddressResponse toResponse(AddressItem item) {
        return AddressResponse.builder()
                .id(item.getId())
                .label(item.getLabel())
                .recipientName(item.getRecipientName())
                .phone(item.getPhone())
                .address(item.getAddress())
                .isDefault(item.getIsDefault())
                .build();
    }
}
