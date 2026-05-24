-- Add OAuth2 fields to users table for Google login support
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Set existing users to LOCAL provider
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;

-- Add constraint to ensure provider_id is unique when not null (for Google users)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id) WHERE provider_id IS NOT NULL;
