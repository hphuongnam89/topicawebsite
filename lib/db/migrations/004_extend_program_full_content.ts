import type { Migration } from "./types";

export const migration004: Migration = {
  version: 4,
  name: "004_extend_program_full_content",
  up: (db) => {
    const columns = [
      "summary TEXT",
      "marketing_label TEXT",
      "hero_label TEXT",
      "group_id TEXT",
      "icon TEXT",
      "image TEXT",
      "language TEXT",
      "course_count TEXT",
      "careers TEXT DEFAULT '[]'",
      "curriculum TEXT DEFAULT '[]'",
      "semesters TEXT DEFAULT '[]'",
      "outcomes TEXT DEFAULT '[]'",
      "admissions TEXT",
      "graduation TEXT",
      "further_study TEXT",
      "confirmations TEXT DEFAULT '[]'",
      "faqs TEXT DEFAULT '[]'",
    ];

    for (const col of columns) {
      try {
        db.exec(`ALTER TABLE programs ADD COLUMN ${col};`);
      } catch {
        // column may already exist
      }
    }
  },
  down: () => {
    // SQLite does not support dropping columns cleanly across all environments
  },
};
