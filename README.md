# Hoàng Kim Book — Shopbanhang

Hệ thống thương mại điện tử bán sách, gồm backend Spring Boot 3 và frontend React. Hỗ trợ thanh toán VNPay, đăng nhập Google, chatbot Gemini, lưu trữ ảnh trên MinIO, cache bằng Redis và cơ sở dữ liệu PostgreSQL.

## Tech stack

**Backend**
- Java 21, Spring Boot 3.2.5
- Spring Security + JWT + OAuth2 (Google)
- Spring Data JPA + Hibernate
- PostgreSQL 16 + Flyway migration
- Redis 7 (cache)
- MinIO (object storage cho ảnh sản phẩm)
- Spring Mail (SMTP Gmail) — gửi email xác thực, đặt lại mật khẩu
- VNPay Sandbox (cổng thanh toán)
- Google Gemini API (chatbot tư vấn)
- SpringDoc OpenAPI (Swagger UI)
- Gradle

**Frontend**
- React 18 (Create React App)
- React Router v6
- Axios

**DevOps**
- Docker / Docker Compose
- Nginx (phục vụ frontend build)

## Cấu trúc thư mục

```
Backend_Shopbanhang/
├── src/main/java/com/cuong/shopbanhang/
│   ├── common/           # Hằng số, enum dùng chung
│   ├── config/           # Cấu hình Security, Redis, MinIO, VNPay, OpenAPI...
│   ├── controller/
│   │   ├── admin/        # API quản trị (book, category, order, user, dashboard...)
│   │   └── user/         # API người dùng (cart, order, review, address...)
│   ├── dto/              # Request / Response DTO
│   ├── exception/        # Xử lý exception toàn cục
│   ├── model/            # Entity JPA (Book, User, Order, Cart...)
│   ├── repository/       # Spring Data repository
│   ├── security/         # JWT filter, OAuth2 handler
│   ├── service/          # Business logic
│   └── util/             # Tiện ích chung
├── src/main/resources/
│   ├── application.yaml      # Cấu hình mặc định (dev)
│   ├── application-prod.yaml # Cấu hình production
│   └── db/migration/         # Flyway migration scripts
├── fe/                   # Frontend React
├── docker-compose.yml    # Stack full: postgres, redis, minio, backend, frontend
├── Dockerfile            # Build image backend
└── build.gradle
```

## Tính năng chính

- Đăng ký / đăng nhập bằng email + JWT (access token + refresh token)
- Đăng nhập Google (OAuth2)
- Quên mật khẩu / đặt lại mật khẩu qua email
- Quản lý sách, danh mục, bài viết, FAQ
- Giỏ hàng, đặt hàng, lịch sử đơn hàng
- Đánh giá sản phẩm
- Quản lý địa chỉ giao hàng
- Thanh toán qua VNPay (sandbox)
- Upload ảnh sản phẩm lên MinIO
- Chatbot tư vấn sách dùng Google Gemini
- Trang quản trị: thống kê dashboard, quản lý người dùng / đơn hàng / sản phẩm / đánh giá
- API documentation qua Swagger UI

## Yêu cầu môi trường

- JDK 21
- Docker Desktop (khuyến nghị để chạy nhanh)
- Node.js 18+ (nếu chạy frontend ngoài Docker)
- Tài khoản Gmail bật App Password (để gửi mail)
- Tài khoản VNPay Sandbox
- Google Cloud OAuth Client ID
- Google AI Studio API key (Gemini)

## Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc dự án (cùng cấp với `docker-compose.yml`):

```env
# PostgreSQL
DB_PASSWORD=postgres

# JWT (Base64-encoded secret, tối thiểu 256-bit)
JWT_SECRET=your_base64_secret_here

# Email SMTP
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret

# Google Gemini
AI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=12345678

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> Khi chạy local (không qua Docker), có thể đặt các biến này vào `src/main/resources/local.env` rồi export trước khi chạy, hoặc cấu hình trong IDE.

## Chạy bằng Docker Compose (khuyến nghị)

Build và khởi động toàn bộ stack:

```bash
docker compose up -d --build
```

Sau khi container khởi động xong:

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost                 |
| Backend API    | http://localhost:8080/api/v1     |
| Swagger UI     | http://localhost:8080/swagger-ui.html |
| MinIO Console  | http://localhost:9001            |
| PostgreSQL     | localhost:5432                   |
| Redis          | localhost:6379                   |

Dừng stack:

```bash
docker compose down
```

Xoá luôn dữ liệu (volume):

```bash
docker compose down -v
```

## Chạy backend ở chế độ dev (không Docker)

1. Khởi động các dependency:

   ```bash
   docker compose up -d postgres redis minio
   ```

2. Export biến môi trường (Linux/macOS):

   ```bash
   export $(cat src/main/resources/local.env | xargs)
   ```

   Trên Windows PowerShell:

   ```powershell
   Get-Content src/main/resources/local.env | ForEach-Object {
     if ($_ -match '^\s*([^#=]+)=(.*)$') { $env:($matches[1].Trim()) = $matches[2].Trim() }
   }
   ```

3. Chạy ứng dụng:

   ```bash
   ./gradlew bootRun
   ```

   Backend lắng nghe ở `http://localhost:8080`.

## Chạy frontend ở chế độ dev

```bash
cd fe
npm install
npm start
```

Frontend chạy ở `http://localhost:3000` và proxy request `/api/...` sang backend `8080`.

## Database migration

Flyway tự chạy migration khi backend khởi động. Các script SQL nằm trong `src/main/resources/db/migration/`, đặt tên theo quy ước `V{version}__{description}.sql`.

Thêm migration mới: tạo file `V{N}__{mô_tả}.sql` với `N` lớn hơn version hiện tại — Flyway sẽ áp dụng ở lần khởi động kế tiếp.

## API documentation

Sau khi backend chạy, truy cập:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

API được nhóm theo hai phân vùng chính:

- `POST/GET /api/v1/auth/**` — đăng nhập, đăng ký, refresh token, OAuth2 callback
- `GET /api/v1/books/**`, `/categories/**`, `/articles/**`, `/reviews/**` — public read
- `/api/v1/cart/**`, `/orders/**`, `/users/**`, `/addresses/**` — yêu cầu JWT user
- `/api/v1/admin/**` — yêu cầu JWT có role admin
- `/api/v1/payment/**` — callback / khởi tạo thanh toán VNPay
- `/api/v1/chatbot/**` — chat với Gemini

## Tài khoản mặc định

Sau lần chạy đầu tiên, cần tạo tài khoản admin trực tiếp qua DB hoặc thông qua flow đăng ký rồi nâng role trong bảng `users`.

## Build production

Build jar độc lập:

```bash
./gradlew clean bootJar
```

File jar nằm trong `build/libs/`. Chạy:

```bash
java -jar build/libs/shopbanhang-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Build frontend:

```bash
cd fe
npm run build
```

## Logs

Log file được ghi tại `logs/application.log` với rotation 10MB / 7 ngày. Level mặc định: `WARN` cho framework, `INFO` cho code ứng dụng (xem chi tiết trong `application.yaml`).

## Troubleshooting

- **Backend không kết nối được DB**: kiểm tra `DB_PASSWORD` và container `shopbanhang-postgres` đã healthy chưa (`docker compose ps`).
- **Login Google lỗi `redirect_uri_mismatch`**: thêm `http://localhost:8080/api/v1/auth/google/callback` vào Authorized redirect URIs trong Google Cloud Console.
- **Upload ảnh lỗi**: vào MinIO Console (`http://localhost:9001`) đăng nhập bằng `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` và tạo bucket `shopbanhang` nếu chưa có.
- **VNPay callback không về**: VNPay sandbox cần `returnUrl` truy cập được từ internet. Khi test local có thể dùng ngrok hoặc cloudflare tunnel.

## License

Dự án phục vụ mục đích học tập.
