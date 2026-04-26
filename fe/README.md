# Shop Bán Hàng - Frontend

## Cấu trúc dự án

```
Fe/
├── public/
│   ├── index.html
│   └── images/          # Hình ảnh tĩnh
├── src/
│   ├── api/
│   │   ├── client.js    # Axios client với interceptors
│   │   ├── endpoints.js  # Tất cả API endpoints
│   │   └── index.js      # Export tất cả APIs
│   ├── Components/       # Các component dùng chung
│   ├── Pages/            # Các trang của ứng dụng
│   ├── Router/           # Cấu hình routing
│   ├── public/           # Assets (images)
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── package.json
└── README.md
```

## Cách chạy

### 1. Cài đặt dependencies

```bash
cd Fe
npm install
```

### 2. Chạy Frontend (Development)

```bash
npm start
```

Frontend sẽ chạy ở: http://localhost:3000

### 3. Chạy Backend (Backend)

Backend cần chạy ở port 8080:

```bash
# Từ thư mục gốc dự án
./gradlew bootRun
# Hoặc
java -jar build/libs/shopbanhang.jar
```

## API Endpoints

### Public APIs
- `GET /api/v1/books` - Lấy danh sách sách
- `GET /api/v1/books/:id` - Lấy chi tiết sách
- `GET /api/v1/categories` - Lấy danh mục
- `GET /api/v1/articles` - Lấy bài viết
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `GET /api/v1/cart` - Lấy giỏ hàng
- `POST /api/v1/cart/items` - Thêm vào giỏ hàng

### Admin APIs
- `GET /api/v1/admin/dashboard` - Dashboard
- `GET /api/v1/admin/books/all` - Danh sách sách (admin)
- `POST /api/v1/admin/books` - Tạo sách mới
- `PUT /api/v1/admin/books/:id` - Cập nhật sách
- `DELETE /api/v1/admin/books/:id` - Xóa sách
- `GET /api/v1/admin/orders` - Danh sách đơn hàng
- `GET /api/v1/admin/users` - Danh sách người dùng
- `GET /api/v1/admin/articles/all` - Danh sách bài viết

## Routes

| Path | Trang |
|------|-------|
| / | Trang chủ |
| /cua-hang | Cửa hàng |
| /gio-hang | Giỏ hàng |
| /san-pham | Chi tiết sản phẩm |
| /lien-he | Liên hệ |
| /gioi-thieu | Giới thiệu |
| /tin-tuc | Tin tức |
| /admin | Trang quản trị |

## Cấu hình môi trường

Tạo file `.env` trong thư mục Fe:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

## Proxy

CRA được cấu hình proxy sang `http://localhost:8080`, nên các API calls trong code có thể dùng relative path:

```javascript
// Thay vì
axios.get('http://localhost:8080/api/v1/books')

// Có thể dùng
axios.get('/api/v1/books')
```
