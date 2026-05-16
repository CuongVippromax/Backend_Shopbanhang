-- Change address column from VARCHAR(255) to TEXT to support JSON addresses
ALTER TABLE users ALTER COLUMN address TYPE TEXT;
