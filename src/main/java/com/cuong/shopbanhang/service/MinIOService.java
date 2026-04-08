package com.cuong.shopbanhang.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cuong.shopbanhang.exception.FileStorageException;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MinIOService")
public class MinIOService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    /**
     * Upload file lên MinIO.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - FileStorageException (1): Khi không thể upload file
     * 
     * @param file MultipartFile cần upload
     * @return String URL công khai của file đã upload
     */
    public String uploadFile(MultipartFile file) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = UUID.randomUUID() + extension;

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(objectName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build());
            }

            return buildPublicUrl(objectName);

        } catch (Exception e) {
            log.error("Error uploading file to MinIO: {}", e.getMessage(), e);
            // EXCEPTION: FileStorageException - Khi upload file thất bại
            throw new FileStorageException("Không thể upload file: " + e.getMessage(), e); // EX-010
        }
    }

    /**
     * Xóa file khỏi MinIO.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - FileStorageException (1): Khi không thể xóa file
     * 
     * @param objectName Tên object cần xóa
     */
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new FileStorageException("Không thể xóa file: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo presigned URL để truy cập file private.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - FileStorageException (1): Khi không thể tạo presigned URL
     * 
     * @param objectName Tên object
     * @param expirySeconds Thời gian hết hạn (giây)
     * @return String presigned URL
     */
    public String getPresignedUrl(String objectName, int expirySeconds) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(objectName)
                            .expiry(expirySeconds)
                            .build());
        } catch (Exception e) {
            throw new FileStorageException("Không thể tạo presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Trích xuất tên object từ URL file.
     * 
     * @param fileUrl URL đầy đủ của file
     * @return String tên object hoặc null nếu không trích xuất được
     */
    public String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        String prefix = minioUrl + "/" + bucket + "/";
        return fileUrl.startsWith(prefix) ? fileUrl.substring(prefix.length()) : fileUrl;
    }

    /**
     * Xây dựng URL công khai cho object.
     * 
     * @param objectName Tên object
     * @return String URL đầy đủ
     */
    private String buildPublicUrl(String objectName) {
        return minioUrl + "/" + bucket + "/" + objectName;
    }

    /**
     * Đảm bảo bucket tồn tại, tạo mới nếu chưa có.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - FileStorageException (1): Khi không thể tạo bucket
     * 
     * @throws Exception khi có lỗi kết nối MinIO
     */
    private void ensureBucketExists() throws Exception {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
            setBucketPolicyToPublic();
        } catch (Exception e) {
            log.error("Error ensuring bucket exists: {}", e.getMessage(), e);
            // EXCEPTION: FileStorageException - Khi không thể tạo bucket
            throw new FileStorageException("Không thể tạo bucket: " + bucket, e); // EX-010
        }
    }

    /**
     * Thiết lập bucket policy thành public read.
     */
    private void setBucketPolicyToPublic() {
        try {
            String policyJson = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": "*",
                      "Action": "s3:GetObject",
                      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
                    }
                  ]
                }
                """.replace("BUCKET_NAME", bucket);

            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucket)
                            .config(policyJson)
                            .build());
        } catch (Exception ignored) {
        }
    }
}
