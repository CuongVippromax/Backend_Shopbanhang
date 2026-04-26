-- Add featured column to article table
ALTER TABLE article ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
