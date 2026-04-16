-- =============================================================================
-- Sửa lỗi: violates check constraint "orders_payment_status_check"
-- Khi cập nhật trạng thái thanh toán "Đã hủy" (CANCELLED = ordinal 3 trong Java).
-- Ràng buộc cũ thường chỉ cho phép 0,1,2 (PENDING, PAID, FAILED).
-- =============================================================================
-- Chạy một lần trên PostgreSQL (psql, DBeaver, pgAdmin...):
--
--   \i src/main/resources/sql/fix-orders-payment-status-check.sql
--   hoặc copy-paste nội dung bên dưới.
-- =============================================================================

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN (0, 1, 2, 3));

-- Giải thích ordinal @Enumerated(EnumType.ORDINAL) trong PaymentStatus.java:
--   0 = PENDING, 1 = PAID, 2 = FAILED, 3 = CANCELLED
