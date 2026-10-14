import type { DatabaseSync } from "node:sqlite";
import type { Migration } from "./types";

export const migration005: Migration = {
  version: 5,
  name: "005_lead_notification_outbox",
  up: (db: DatabaseSync) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS lead_notification_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
        attempts INTEGER NOT NULL DEFAULT 0,
        available_at TEXT NOT NULL,
        locked_until TEXT,
        created_at TEXT NOT NULL,
        sent_at TEXT,
        last_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_lead_notification_outbox_due
        ON lead_notification_outbox(status, available_at, locked_until);
    `);
  },
  // Keep queued notification state when rolling code back.
  down: (_db: DatabaseSync) => {},
};
