package com.cuong.shopbanhang.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
     * Upload file lên MinIO, trả về URL truy cập trực tiếp.
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

            log.info("Uploaded file: {}", objectName);
            return buildPublicUrl(objectName);

        } catch (Exception e) {
            log.error("Error uploading file to MinIO", e);
            throw new RuntimeException("Không thể upload file: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa file khỏi MinIO theo tên object (phần cuối của URL).
     */
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
            log.info("Deleted file: {}", objectName);
        } catch (Exception e) {
            log.error("Error deleting file from MinIO", e);
            throw new RuntimeException("Không thể xóa file: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy presigned URL có thời hạn (giây) để truy cập private object.
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
            log.error("Error generating presigned URL", e);
            throw new RuntimeException("Không thể tạo presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Trích xuất tên object từ URL đầy đủ.
     */
    public String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        String prefix = minioUrl + "/" + bucket + "/";
        return fileUrl.startsWith(prefix) ? fileUrl.substring(prefix.length()) : fileUrl;
    }

    private String buildPublicUrl(String objectName) {
        return minioUrl + "/" + bucket + "/" + objectName;
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            log.info("Created bucket: {}", bucket);
        }
        // Set bucket policy to allow public read access
        setBucketPolicyToPublic();
    }

    /**
     * Set bucket policy to allow public read access for all objects.
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
            log.info("Set bucket policy to public for: {}", bucket);
        } catch (Exception e) {
            log.warn("Could not set bucket policy (may already be set): {}", e.getMessage());
        }
    }
}
