# Build stage - use Gradle official image to build
FROM gradle:8.9-jdk21 AS builder

WORKDIR /app

# Copy build configuration and source
COPY build.gradle settings.gradle ./
COPY src ./src

# Build the application (skip tests for faster Docker build)
RUN gradle bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built jar file from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Set ownership
RUN chown -R spring:spring /app

USER spring:spring

# Expose port
EXPOSE 8080

# Health check - use a public endpoint instead of actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api/v1/categories/list || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "-Xms512m", "-Xmx1024m", "app.jar"]
