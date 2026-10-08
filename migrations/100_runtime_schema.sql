-- Current application schema on PostgreSQL. Forward-only; preserve SQLite source for rollback.
CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      session_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content_html TEXT NOT NULL,
      featured_image TEXT,
      category_id INTEGER,
      tags TEXT,
      author_name TEXT,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      fullname TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      program TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL,
      consent_at TEXT,
      consent_policy_version TEXT,
      consent_source TEXT
    );

CREATE TABLE IF NOT EXISTS lead_deliveries (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      sent_at TEXT,
      next_attempt_at TEXT,
      created_at TEXT NOT NULL,
      UNIQUE (lead_id, channel),
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at BIGINT NOT NULL
    );

CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content_html TEXT NOT NULL,
      featured_image TEXT,
      status TEXT DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS page_views (
      path TEXT NOT NULL,
      date TEXT NOT NULL,
      views INTEGER DEFAULT 1,
      PRIMARY KEY (path, date)
    );

CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_id TEXT,
      session_id TEXT,
      name TEXT NOT NULL,
      properties_json TEXT NOT NULL,
      path TEXT,
      created_at TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      actor_id TEXT,
      action TEXT NOT NULL,
      target TEXT,
      ip TEXT,
      created_at TEXT NOT NULL
    );
ALTER TABLE lead_deliveries ADD COLUMN IF NOT EXISTS lease_token TEXT;
ALTER TABLE lead_deliveries ADD COLUMN IF NOT EXISTS lease_until TEXT;
ALTER TABLE lead_deliveries ADD COLUMN IF NOT EXISTS manual_retries INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_delivery_due ON lead_deliveries(status, next_attempt_at, lease_until);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(reset_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_event_id ON analytics_events(event_id) WHERE event_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS data_imports (
  source_fingerprint TEXT PRIMARY KEY,
  counts_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
