-- Add deleted column to users table for soft delete functionality
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted);

-- Update existing users to have deleted = false
UPDATE users SET deleted = FALSE WHERE deleted IS NULL;
