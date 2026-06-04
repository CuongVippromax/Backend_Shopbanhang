# ==========================
# Build stage
# Cache gradle deps layer trước, copy src sau — rebuild khi chỉ đổi code
# sẽ tận dụng được Docker layer cache, không tải lại dependency.
# ==========================
FROM gradle:8.9-jdk21 AS builder

WORKDIR /app

# 1) Copy build config trước để cache layer download dependency
COPY build.gradle settings.gradle ./
RUN gradle --no-daemon dependencies > /dev/null 2>&1 || true

# 2) Copy source rồi build
COPY src ./src
RUN gradle --no-daemon bootJar -x test

# ==========================
# Runtime stage
# ==========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# wget cho HEALTHCHECK (alpine có sẵn busybox wget nhưng cần --spider)
RUN apk add --no-cache wget \
 && addgroup -S spring && adduser -S spring -G spring

# Copy jar đã build
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api/v1/categories/list || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
