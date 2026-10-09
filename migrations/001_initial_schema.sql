-- PostgreSQL Initial Schema Migration
-- Task 01.2: Schema cơ sở - Phase 01 DATABASE
-- Date: 2026-10-08
-- Forward-only migration; preserve SQLite source for rollback if needed
-- CONTRACT_VERSION: v1.0-custom-cms

-- Drop extension if exists (for serial to bigserial compatibility)
DROP TYPE IF EXISTS extended_timestamptz CASCADE;

--------------------------------------------------------
-- TABLE: users
-- Quản trị viên hệ thống CMS
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'contributor', 'reviewer', 'publisher')),
    session_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------
-- TABLE: categories
-- Danh mục nội dung (có thể phân cấp)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------
-- TABLE: content_items
-- Đối tượng nội dung chính (article/page/program)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('article', 'page', 'program', 'policy', 'admission')),
    locale VARCHAR(10) NOT NULL DEFAULT 'vi' CHECK (locale IN ('vi', 'en')),
    title TEXT NOT NULL,
    slug VARCHAR(255),
    excerpt TEXT,
    published_revision_id UUID REFERENCES content_revisions(id) ON DELETE SET NULL,
    draft_revision_id UUID REFERENCES content_revisions(id) ON DELETE CASCADE,
    archived_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for content retrieval by kind and locale
CREATE INDEX IF NOT EXISTS idx_content_items_kind_locale ON content_items(kind, locale);
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_published_revision ON content_items(published_revision_id) WHERE published_revision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_items_draft_revision ON content_items(draft_revision_id) WHERE draft_revision_id IS NOT NULL;

--------------------------------------------------------
-- TABLE: content_revisions
-- Lịch sử phiên bản nội dung
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    revision_no INTEGER NOT NULL,
    schema_version VARCHAR(50) NOT NULL DEFAULT 'v1',
    title TEXT NOT NULL,
    excerpt TEXT,
    template_key VARCHAR(100),
    blocks_json JSONB NOT NULL DEFAULT '{}',
    legacy_html TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient revision retrieval
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_revision_no ON content_revisions(content_id, revision_no);
CREATE INDEX IF NOT EXISTS idx_content_revisions_schema_version ON content_revisions(schema_version);

--------------------------------------------------------
-- TABLE: categories_flat (Mảng bảng phân cấp)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories_flat AS
SELECT 
    id, name, slug, parent_id, created_at,
    (SELECT COUNT(*) FROM recursive_categories(id, root.id)) - 1 as level,
    (SELECT GROUP_CONCAT('->', name) FROM recursive_categories(id, root.id)) as path_string
FROM categories root;

DROP TYPE IF EXISTS extended_timestamptz CASCADE;

--------------------------------------------------------
-- TABLE: content_categories
-- Quan hệ nhiều-nhiều giữa nội dung và danh mục
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_categories (
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);

--------------------------------------------------------
-- TABLE: site_routes
-- Registry đường dẫn website
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_routes (
    locale VARCHAR(10) NOT NULL DEFAULT 'vi',
    normalized_path VARCHAR(512) NOT NULL UNIQUE,
    content_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
    system_key VARCHAR(100) UNIQUE,
    route_kind VARCHAR(30) NOT NULL CHECK (route_kind IN ('page', 'redirect', 'dynamic', 'system', 'error')),
    target_path TEXT,
    status_code INTEGER CHECK (status_code >= 200 AND status_code < 600),
    PRIMARY KEY (locale, normalized_path)
);

-- Index for route lookup
CREATE INDEX IF NOT EXISTS idx_site_routes_normalized_path ON site_routes(normalized_path);

--------------------------------------------------------
-- TABLE: leads
-- Dữ liệu khách quan tâm (Lead form)
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    program_code VARCHAR(100),
    campus VARCHAR(100),
    note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'declined', 'excluded')),
    ip_hash CHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lead retrieval and filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_program_code ON leads(program_code);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

--------------------------------------------------------
-- TABLE: publication_events
-- Lịch sử phát hành nội dung
--------------------------------------------------------
CREATE TABLE IF NOT EXISTS publication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES content_revisions(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL CHECK (action IN ('draft', 'in_review', 'approved', 'published', 'unpublished', 'scheduled', 'expired', 'restored')),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for publication events query
CREATE INDEX IF NOT EXISTS idx_publication_events_content_id ON publication_events(content_id);
CREATE INDEX IF NOT EXISTS idx_publication_events_occurred_at ON publication_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_events_action ON publication_events(action);

--------------------------------------------------------
-- CONSTRAINTS & TRIGGERS for updated_at timestamps
--------------------------------------------------------

-- Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers to tables with updated_at
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users CASCADE;
CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_content_items_updated_at ON content_items CASCADE;
CREATE TRIGGER trigger_update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------
-- SUMMARY: 8 Core Tables with UUID Primary Keys
-- -------------------------------------------------
-- 1. users: User management system
-- 2. categories: Content taxonomy (hierarchical)
-- 3. content_items: Main content entities
-- 4. content_revisions: Version history for content
-- 5. content_categories: Many-to-many content-category mapping
-- 6. site_routes: URL routing registry
-- 7. leads: Lead/Inquiry management
-- 8. publication_events: Audit trail for publishing actions

--------------------------------------------------------
-- INDEXES SUMMARY (10 optimized indexes)
-- -------------------------------------------------
-- • idx_content_items_kind_locale - Filter content by type and language
-- • idx_content_items_slug - Fast lookup by slug
-- • idx_content_items_published_revision - Find published version
-- • idx_content_items_draft_revision - Track current draft
-- • idx_content_revisions_content_id - Revision retrieval by content
-- • idx_content_revisions_content_revision_no - Ordered revisions per content
-- • idx_content_revisions_schema_version - Schema version filtering
-- • idx_site_routes_normalized_path - Route matching by path
-- • idx_leads_status - Lead status filtering (frequent query)
-- • idx_leads_created_at - Recent lead retrieval
