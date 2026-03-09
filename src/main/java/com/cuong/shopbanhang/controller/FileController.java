package com.cuong.shopbanhang.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.service.MinIOService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({ "/api/v1/files", "/api/files" })
@RequiredArgsConstructor
public class FileController {

    private final MinIOService minIOService;

    /**
     * Upload một file (hình ảnh, tài liệu...) lên MinIO.
     * Chỉ ADMIN mới có quyền upload.
     * Trả về URL truy cập của file đã upload.
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File không được để trống"));
        }

        String fileUrl = minIOService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    /**
     * Xóa file khỏi MinIO theo tên object.
     * Chỉ ADMIN mới có quyền xóa.
     */
    @DeleteMapping("/delete")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFile(
            @RequestParam("objectName") String objectName) {

        minIOService.deleteFile(objectName);
        return ResponseEntity.ok(Map.of("message", "Xóa file thành công"));
    }
}
