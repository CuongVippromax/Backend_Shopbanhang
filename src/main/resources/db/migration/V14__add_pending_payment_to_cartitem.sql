-- Add pending_payment column to cartitem table
-- Used to track items that are pending VNPay payment
ALTER TABLE cartitem ADD COLUMN pending_payment BOOLEAN DEFAULT FALSE;
