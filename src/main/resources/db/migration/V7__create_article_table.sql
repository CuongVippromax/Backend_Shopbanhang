-- Create article table
CREATE TABLE IF NOT EXISTS article (
    article_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    slug VARCHAR(500),
    image VARCHAR(500),
    author_name VARCHAR(200),
    published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_slug ON article(slug);

-- Create index on published and created_at for pagination
CREATE INDEX IF NOT EXISTS idx_article_published_created ON article(published, created_at DESC);
