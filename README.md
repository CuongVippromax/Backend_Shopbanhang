# Hoàng Kim Book — Shop Bán Sách Online

Dự án **Hoàng Kim Book** là website thương mại điện tử bán sách trực tuyến, được xây dựng với:

- **Backend:** Spring Boot 3 (Java 21) + PostgreSQL + Redis + MinIO
- **Frontend:** React 19 + Vite + React Router v6
- **Chatbot:** FAQ rule-based chatbot (tích hợp trên mọi trang người dùng)

---

## Mục lục

- [Tổng quan tính năng](#tổng-quan-tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh với Docker](#cài-đặt-nhanh-với-docker)
- [Cài đặt thủ công (không dùng Docker)](#cài-đặt-thủ-công-không-dùng-docker)
- [Cấu trúc dự án](#cấu-trúc-dự án)
- [Tài khoản mặc định](#tài-khoản-mặc-định)
- [API Documentation](#api-documentation)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)

---

## Tổng quan tính năng

### Người dùng
- Đăng ký / Đăng nhập (JWT + Refresh Token)
- Xem danh sách sách, tìm kiếm, lọc theo danh mục
- Chi tiết sách, đánh giá sách
- Giỏ hàng (localStorage, đồng bộ khi đăng nhập)
- Đặt hàng, theo dõi trạng thái đơn hàng
- Thanh toán VNPay (COD / ATM / Visa)
- Đổi mật khẩu, quên mật khẩu (gửi email)
- **Chatbot FAQ** — hỗ trợ trả lời tự động các câu hỏi thường gặp

### Quản trị (Admin)
- Dashboard thống kê (doanh thu, đơn hàng, sách bán chạy)
- Quản lý đơn hàng (cập nhật trạng thái, thanh toán)
- Quản lý sách (CRUD, upload ảnh lên MinIO)
- Quản lý danh mục
- Quản lý tài khoản người dùng
- Quản lý kho hàng
- Quản lý bình luận / đánh giá
- **Quản lý FAQ chatbot** (thêm/sửa/xóa câu hỏi — câu trả lời)

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản | Ghi chú |
|----------|-----------|---------|
| Docker Desktop | >= 4.x | Windows/macOS |
| Docker Compose | >= 2.x | Tích hợp sẵn trong Docker Desktop |
| Git | >= 2.x | (tùy chọn) |

**Hoặc cài đặt thủ công:**
- Java 21
- Node.js 20
- PostgreSQL 16
- Redis 7
- MinIO (hoặc dùng MinIO playground)

---

## Cài đặt nhanh với Docker

### Bước 1 — Clone vào thư mục gốc

```bash
cd D:\BESpringBoot
# Nếu chưa clone, clone repository
git clone <repo-url> shopbanhang
cd shopbanhang
```

### Bước 2 — Chạy Docker Compose

```bash
# Build image và chạy tất cả services (chạy nền)
docker-compose up -d --build

# Xem log để biết trạng thái khởi động
docker-compose logs -f backend
```

### Bước 3 — Đợi services khởi động

Backend cần khoảng **60-90 giây** để khởi động lần đầu (Spring Boot + Hibernate auto-create schema).

```bash
# Kiểm tra backend đã sẵn sàng chưa
docker-compose logs backend | grep "Started ShopbanhangApplication"

# Kiểm tra tất cả containers đang chạy
docker-compose ps
```

### Bước 4 — Truy cập ứng dụng

| Dịch vụ | URL | Tài khoản mặc định |
|---------|-----|-------------------|
| Frontend (người dùng) | http://localhost:5173 | — |
| Backend API | http://localhost:8080 | — |
| Swagger API Docs | http://localhost:8080/swagger-ui.html | — |
| MinIO Console | http://localhost:9001 | `admin` / `minio123` |

### Các lệnh Docker hữu ích

```bash
# Dừng tất cả
docker-compose down

# Dừng + xóa dữ liệu (reset database)
docker-compose down -v

# Xem log một service cụ thể
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart một service
docker-compose restart backend

# Rebuild không xóa data
docker-compose up -d --build backend
```

---

## Cài đặt thủ công (không dùng Docker)

### 1. Chuẩn bị Database

```sql
-- Tạo database PostgreSQL
CREATE DATABASE shopbanhang;
```

### 2. Chạy Backend

```bash
cd D:\BESpringBoot\shopbanhang

# Build
mvn clean package -DskipTests

# Chạy (hoặc import vào IntelliJ IDEA và chạy)
java -jar target/*.jar

# Backend chạy tại: http://localhost:8080
```

> **Lưu ý:** Cần có PostgreSQL, Redis, MinIO đang chạy trên localhost.
> Kiểm tra `src/main/resources/application.yaml` để xem cấu hình kết nối.

### 3. Chạy Frontend

```bash
cd D:\BESpringBoot\shopbanhang\frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Frontend chạy tại: http://localhost:5173
```

### 4. Cấu hình API URL (nếu cần)

Frontend mặc định gọi API qua proxy Vite tại `/api/v1`.
Kiểm tra `frontend/vite.config.js` để đảm bảo proxy đúng.

---

## Cấu trúc dự án

```
shopbanhang/
├── docker-compose.yml          # Docker Compose (toàn bộ stack)
├── Dockerfile.backend           # Dockerfile cho Spring Boot
├── src/
│   └── main/
│       ├── java/com/cuong/shopbanhang/
│       │   ├── ShopbanhangApplication.java
│       │   ├── config/          # AppConfig, Security, CORS, JWT...
│       │   ├── controller/       # REST Controllers
│       │   │   ├── user/         # API người dùng (Book, Cart, Order...)
│       │   │   └── admin/        # API quản trị
│       │   ├── service/          # Business logic
│       │   ├── repository/       # JPA Repositories
│       │   ├── model/            # Entity classes
│       │   ├── dto/              # Request/Response DTOs
│       │   ├── security/         # JWT filter, token provider
│       │   └── common/           # Role enum, constants
│       └── resources/
│           └── application.yaml  # Cấu hình Spring
└── frontend/
    ├── Dockerfile.frontend      # Dockerfile cho React
    ├── vite.config.js
    ├── src/
    │   ├── api/                 # API clients (client.js, books.js, faq.js...)
    │   ├── components/          # Shared components (Layout, Chatbot, ProductCard...)
    │   ├── pages/               # Page components
    │   │   └── admin/           # Admin pages (Dashboard, Products, Orders, FAQ...)
    │   ├── utils/               # Cart utilities
    │   ├── App.jsx              # Router chính
    │   └── index.css            # Global styles
    └── package.json
```

---

## Tài khoản mặc định

> **Lưu ý:** Các tài khoản này chỉ tồn tại khi database được seed. Chạy lần đầu backend sẽ tự động tạo.

| Loại | Email | Mật khẩu | Ghi chú |
|------|-------|----------|---------|
| **Admin** | test@gmail.vncom | 123 | Full quyền quản trị |
| **User** | cuongdayne1811@gmail.com | 123 | Người dùng thông thường |

---

## API Documentation

### Public APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/books/all` | Danh sách sách (phân trang) |
| GET | `/api/v1/books/{id}` | Chi tiết sách |
| GET | `/api/v1/categories/list` | Danh sách danh mục |
| GET | `/api/v1/faqs` | Danh sách FAQ (cho chatbot) |
| GET | `/api/v1/faqs/categories` | Danh sách phân loại FAQ |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/register` | Đăng ký |

### Protected APIs (cần JWT token)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/cart/{userId}` | Lấy giỏ hàng |
| POST | `/api/v1/cart/{userId}/add` | Thêm vào giỏ |
| PUT | `/api/v1/cart/{userId}/update` | Cập nhật số lượng |
| DELETE | `/api/v1/cart/{userId}/remove` | Xóa khỏi giỏ |
| POST | `/api/v1/orders/checkout` | Đặt hàng |
| GET | `/api/v1/orders/my-orders` | Danh sách đơn hàng |
| GET | `/api/v1/reviews/book/{bookId}` | Đánh giá sách |
| POST | `/api/v1/reviews` | Thêm đánh giá |

### Admin APIs (cần JWT + role ADMIN)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/admin/faqs` | Danh sách FAQ (kể cả ẩn) |
| POST | `/api/v1/admin/faqs` | Tạo FAQ mới |
| PUT | `/api/v1/admin/faqs/{id}` | Cập nhật FAQ |
| DELETE | `/api/v1/admin/faqs/{id}` | Xóa FAQ |
| GET | `/api/v1/admin/orders` | Danh sách đơn hàng |
| PUT | `/api/v1/admin/books/{id}` | Cập nhật sách |
| GET | `/api/v1/admin/dashboard` | Thống kê dashboard |

---

## Công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|---------|
| Spring Boot | 3.x | Framework chính |
| Java | 21 | Ngôn ngữ lập trình |
| Spring Security | — | Xác thực, phân quyền |
| JWT | — | Xác thực không trạng thái |
| Spring Data JPA | — | Truy vấn database |
| PostgreSQL | 16 | Cơ sở dữ liệu chính |
| Redis | 7 | Cache + token blacklist |
| MinIO | — | Lưu trữ hình ảnh sách |
| Lombok | — | Giảm boilerplate code |
| Spring Mail | — | Gửi email (quên mật khẩu) |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool, dev server |
| React Router | 7 | Client-side routing |
| Recharts | 3 | Biểu đồ thống kê admin |
| Pure CSS | — | Styling (CSS custom properties) |

### Infrastructure

| Công nghệ | Mục đích |
|-----------|---------|
| Docker | Container hóa |
| Docker Compose | Điều phối multi-container |
| Alpine Linux | Base image nhẹ |

---

## Hỗ trợ

Nếu gặp lỗi trong quá trình cài đặt:

1. Đảm bảo **Docker Desktop** đang chạy
2. Kiểm tra log: `docker-compose logs -f backend`
3. Kiểm tra port đã bị chiếm: `netstat -an | findstr "5173 8080 5432 6379 9000"`
4. Reset hoàn toàn: `docker-compose down -v && docker-compose up -d --build`
