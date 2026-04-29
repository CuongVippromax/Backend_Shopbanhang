# Nhà Sách Hoàng Kim - Website Bán Sách Online

Dự án website thương mại điện tử bán sách trực tuyến **Nhà Sách Hoàng Kim**.

---

## Tổng quan

- **Backend:** Spring Boot 3 + PostgreSQL + Redis + MinIO + Flyway
- **Frontend:** React 18 + React Router v6 + Recharts
- **Chatbot:** FAQ rule-based chatbot (tích hợp trên mọi trang người dùng)

---

## Tính năng chính

### Người dùng
- Đăng ký / Đăng nhập (JWT + Refresh Token)
- Xem danh sách sách, tìm kiếm, lọc theo danh mục
- Chi tiết sách, đánh giá sách
- Giỏ hàng (localStorage, đồng bộ khi đăng nhập)
- Đặt hàng, theo dõi trạng thái đơn hàng
- Thanh toán VNPay (COD / ATM / Visa)
- Đổi mật khẩu, quên mật khẩu (gửi email)
- Tin tức / Bài viết
- Chatbot FAQ hỗ trợ tự động

### Quản trị (Admin)
- Dashboard thống kê (doanh thu, đơn hàng, sách bán chạy)
- Quản lý đơn hàng (cập nhật trạng thái, thanh toán)
- Quản lý sách (CRUD, upload ảnh lên MinIO)
- Quản lý danh mục
- Quản lý tài khoản người dùng
- Quản lý kho hàng
- Quản lý bình luận / đánh giá
- Quản lý FAQ chatbot
- Quản lý tin tức / bài viết

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản |
|----------|-----------|
| Java | 21 |
| Node.js | 18+ |
| PostgreSQL | 16 |
| Redis | 7 |
| MinIO | (hoặc dùng MinIO playground) |

---

## Cài đặt

### 1. Backend

```bash
# Di chuyển vào thư mục gốc dự án
cd D:\Backend_Shopbanhang

# Build project
./gradlew build -x test

# Chạy ứng dụng
./gradlew bootRun
# Hoặc: java -jar build/libs/shopbanhang-0.0.1-SNAPSHOT.jar

# Backend chạy tại: http://localhost:8080
```

### 2. Frontend

```bash
# Di chuyển vào thư mục frontend
cd fe

# Cài đặt dependencies
npm install

# Chạy dev server
npm start

# Frontend chạy tại: http://localhost:3000
```

### 3. Cấu hình

Kiểm tra file `src/main/resources/application.yaml` để cấu hình:
- Kết nối PostgreSQL
- Kết nối Redis
- Kết nối MinIO
- Cấu hình email (SMTP)
- Cấu hình VNPay

---

## Database Migration (Flyway)

Dự án sử dụng **Flyway** để quản lý schema database.

### Cấu trúc migration files

```
src/main/resources/
└── db/
    └── migration/
        ├── V1__*.sql
        ├── V2__*.sql
        └── ...
```

### Thêm migration mới

Tạo file mới trong `src/main/resources/db/migration/` với format:
```
V{version}__{description}.sql
```

Ví dụ: `V9__add_new_column.sql`

---

## Cấu trúc dự án

```
Backend_Shopbanhang/
├── src/main/java/com/cuong/shopbanhang/
│   ├── ShopbanhangApplication.java
│   ├── config/          # AppConfig, Security, CORS, JWT...
│   ├── controller/       # REST Controllers
│   │   ├── user/         # API người dùng
│   │   ├── admin/        # API quản trị
│   │   └── PaymentController.java
│   ├── service/          # Business logic
│   ├── repository/       # JPA Repositories
│   ├── model/            # Entity classes
│   ├── dto/              # Request/Response DTOs
│   ├── security/         # JWT filter, token provider
│   ├── common/           # Enums, constants
│   ├── exception/        # Custom exceptions
│   └── util/             # Utilities (VNPay...)
├── src/main/resources/
│   ├── application.yaml  # Cấu hình Spring
│   └── db/
│       └── migration/    # Flyway migration files
├── fe/                   # Frontend React
│   ├── src/
│   │   ├── api/         # API clients
│   │   ├── components/  # Shared components
│   │   ├── pages/       # Page components
│   │   │   └── Admin/   # Admin pages
│   │   ├── context/     # React contexts
│   │   └── Router/      # Routing
│   └── package.json
└── README.md
```

---

## Tài khoản mặc định

| Loại | Email | Mật khẩu |
|------|-------|----------|
| **Admin** | test@gmail.com | 123 |
| **User** | cuongdayne1811@gmail.com | 123 |

---

## API Endpoints

### Public APIs

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/books/all` | Danh sách sách (phân trang) |
| GET | `/api/v1/books/{id}` | Chi tiết sách |
| GET | `/api/v1/categories/list` | Danh sách danh mục |
| GET | `/api/v1/faqs` | Danh sách FAQ |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/register` | Đăng ký |
| GET | `/api/v1/articles` | Danh sách bài viết |

### Protected APIs (cần JWT)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
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
|--------|----------|--------|
| GET | `/api/v1/admin/orders` | Danh sách đơn hàng |
| PUT | `/api/v1/admin/orders/{id}/status` | Cập nhật trạng thái đơn |
| GET | `/api/v1/admin/books/all` | Danh sách sách (admin) |
| POST | `/api/v1/admin/books` | Thêm sách mới |
| PUT | `/api/v1/admin/books/{id}` | Cập nhật sách |
| DELETE | `/api/v1/admin/books/{id}` | Xóa sách |
| GET | `/api/v1/admin/dashboard` | Thống kê dashboard |
| GET | `/api/v1/admin/users` | Danh sách người dùng |
| GET | `/api/v1/admin/faqs` | Danh sách FAQ |
| POST | `/api/v1/admin/faqs` | Tạo FAQ mới |
| PUT | `/api/v1/admin/faqs/{id}` | Cập nhật FAQ |
| DELETE | `/api/v1/admin/faqs/{id}` | Xóa FAQ |

---

## Công nghệ sử dụng

### Backend
| Công nghệ | Mục đích |
|-----------|-----------|
| Spring Boot 3 | Framework chính |
| Java 21 | Ngôn ngữ lập trình |
| Spring Security + JWT | Xác thực, phân quyền |
| Spring Data JPA | Truy vấn database |
| Flyway | Quản lý database migration |
| PostgreSQL 16 | Cơ sở dữ liệu |
| Redis 7 | Cache + token blacklist |
| MinIO | Lưu trữ hình ảnh |
| Spring Mail | Gửi email |
| Lombok | Giảm boilerplate |

### Frontend
| Công nghệ | Mục đích |
|-----------|-----------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| React Scripts | Build tool |
| Recharts | Biểu đồ thống kê |
| Axios | HTTP client |
| Styled Components | CSS-in-JS |

---

## Hỗ trợ

Nếu gặp lỗi:

1. Đảm bảo PostgreSQL, Redis đang chạy
2. Kiểm tra cấu hình trong `application.yaml`
3. Kiểm tra log backend
4. Kiểm tra port: `netstat -an | findstr "3000 8080 5432 6379"`

---

## License

Dự án phát triển bởi Cuong Nguyen
