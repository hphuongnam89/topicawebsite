import type { DatabaseSync } from "node:sqlite";
import type { Migration } from "./types";

export const migration002: Migration = {
  version: 2,
  name: "002_cms_domain_models",
  up: (db: DatabaseSync) => {
    // 1. Organizations
    db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role_scope TEXT NOT NULL,
        phone TEXT NOT NULL,
        hotline TEXT NOT NULL,
        email TEXT NOT NULL,
        website_url TEXT NOT NULL,
        support_hours TEXT NOT NULL,
        locations TEXT NOT NULL,
        service_urls TEXT NOT NULL,
        source TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Programs
    db.exec(`
      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        aliases TEXT NOT NULL DEFAULT '[]',
        name TEXT NOT NULL,
        major TEXT NOT NULL,
        code TEXT NOT NULL,
        form TEXT NOT NULL,
        degree_name TEXT NOT NULL,
        awarding_institution TEXT NOT NULL,
        duration_credits TEXT NOT NULL,
        source TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 3. Admission Rounds
    db.exec(`
      CREATE TABLE IF NOT EXISTS admission_rounds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        program_ids TEXT NOT NULL,
        cohort TEXT NOT NULL,
        audience TEXT NOT NULL,
        open_at TEXT NOT NULL,
        deadline_at TEXT NOT NULL,
        start_at TEXT NOT NULL,
        application_url TEXT NOT NULL,
        documents TEXT NOT NULL DEFAULT '[]',
        source TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'planned',
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_admission_rounds_status ON admission_rounds(status);
    `);

    // 4. Tuition Policies
    db.exec(`
      CREATE TABLE IF NOT EXISTS tuition_policies (
        id TEXT PRIMARY KEY,
        program_id TEXT NOT NULL,
        cohort TEXT NOT NULL,
        audience TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'VND',
        unit_price_per_credit INTEGER NOT NULL,
        total_credits INTEGER NOT NULL,
        total_tuition INTEGER NOT NULL,
        other_fees TEXT NOT NULL DEFAULT '{}',
        assumptions TEXT NOT NULL DEFAULT '{}',
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        source TEXT NOT NULL,
        doc_ref TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tuition_policies_program ON tuition_policies(program_id);
    `);

    // 5. Scholarships
    db.exec(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        program_ids TEXT NOT NULL,
        scope TEXT NOT NULL,
        value_type TEXT NOT NULL,
        value REAL NOT NULL,
        conditions TEXT NOT NULL,
        deadline_at TEXT,
        evaluation_method TEXT NOT NULL,
        source TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 6. Documents
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        view_url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        byte_size INTEGER NOT NULL DEFAULT 0,
        checksum_sha256 TEXT NOT NULL,
        published_date TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0',
        source TEXT NOT NULL,
        rights TEXT NOT NULL,
        access TEXT NOT NULL DEFAULT 'public',
        alt TEXT,
        caption TEXT,
        focal TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_documents_access ON documents(access);
    `);

    // 7. Content Revisions
    db.exec(`
      CREATE TABLE IF NOT EXISTS content_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        title TEXT NOT NULL,
        payload TEXT NOT NULL,
        workflow_state TEXT NOT NULL DEFAULT 'draft',
        reviewer_notes TEXT,
        created_by TEXT NOT NULL,
        approved_by TEXT,
        published_at TEXT,
        expired_at TEXT,
        highlight_until TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(entity_type, entity_id, version)
      );
      CREATE INDEX IF NOT EXISTS idx_revisions_lookup ON content_revisions(entity_type, entity_id, workflow_state);
    `);

    // 8. Audit Logs
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        revision_id INTEGER,
        timestamp TEXT NOT NULL,
        changed_fields TEXT NOT NULL,
        reason TEXT,
        ip_address TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    `);

    // 9. Analytics Events
    db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        page_path TEXT NOT NULL,
        program_id TEXT,
        category TEXT,
        session_id TEXT,
        server_time TEXT NOT NULL,
        environment TEXT NOT NULL DEFAULT 'production',
        metadata TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_server_time ON analytics_events(server_time);
    `);
  },
  down: (db: DatabaseSync) => {
    db.exec(`
      DROP TABLE IF EXISTS analytics_events;
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS content_revisions;
      DROP TABLE IF EXISTS documents;
      DROP TABLE IF EXISTS scholarships;
      DROP TABLE IF EXISTS tuition_policies;
      DROP TABLE IF EXISTS admission_rounds;
      DROP TABLE IF EXISTS programs;
      DROP TABLE IF EXISTS organizations;
    `);
  },
};
