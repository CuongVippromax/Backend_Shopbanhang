# ==========================
# Build stage
# Cài deps trước, copy source sau — tận dụng layer cache cho rebuild nhanh.
# CRA bake biến môi trường REACT_APP_* vào bundle ngay tại build time,
# nên API URL phải được truyền vào qua --build-arg.
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arg cho API URL (mặc định localhost cho dev Docker trên máy)
ARG REACT_APP_API_BASE_URL=http://localhost:8080
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# 1) Cache deps layer
# Dùng `npm install` thay vì `npm ci` vì package-lock.json hiện đang lệch
# với package.json (thiếu một số transitive dep như yaml). Khi nào sync
# lại lockfile bằng `npm install` ở local và commit thì có thể chuyển về
# `npm ci --no-audit --no-fund` cho build reproducible hơn.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# 2) Copy source & build
COPY public ./public
COPY src ./src
RUN npm run build

# ==========================
# Runtime stage — Nginx
# ==========================
FROM nginx:1.27-alpine

# wget có sẵn trong busybox của alpine, dùng cho HEALTHCHECK
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
