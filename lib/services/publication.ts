import "server-only";
import { getDb } from "@/lib/db";
import { getPublishedRevision, getRevisions } from "./revisions";
import type { ContentRevisionRecord } from "@/lib/db/types";

import { entityTables, type EntityType } from "./content-entities";
export { entityTables, type EntityType } from "./content-entities";
const jsonFields = new Set([
  "locations",
  "service_urls",
  "aliases",
  "duration_credits",
  "program_ids",
  "documents",
  "other_fees",
  "assumptions",
  "careers",
  "curriculum",
  "semesters",
  "outcomes",
  "confirmations",
  "faqs",
]);
export function publishedRow<T extends { id: string | number }>(
  type: EntityType,
  base: T,
): T | null {
  const revisions = getRevisions(type, String(base.id));
  // Existing unversioned content is a compatibility baseline, not a fresh publication.
  if (!revisions.some((revision) => revision.published_at)) return base;
  const revision = getPublishedRevision(type, String(base.id));
  if (!revision) {
    // A first future publication must not remove an already public legacy record early.
    const hasEffectivePublication = revisions.some(
      (row) => row.published_at && row.published_at <= new Date().toISOString(),
    );
    return !hasEffectivePublication ? base : null;
  }
  return mergePublished(base, revision);
}
function mergePublished<T>(base: T, revision: ContentRevisionRecord): T {
  const payload = JSON.parse(revision.payload);
  if (revision.entity_type === "article" || revision.entity_type === "page")
    payload.status = "published";
  if (revision.entity_type === "article") {
    payload.is_featured = Number(Boolean(payload.is_featured));
    if (revision.highlight_until && revision.highlight_until <= new Date().toISOString())
      payload.is_featured = 0;
  }
  for (const key of jsonFields)
    if (payload[key] !== undefined && typeof payload[key] !== "string")
      payload[key] = JSON.stringify(payload[key]);
  return {
    ...base,
    ...payload,
    version: revision.version,
    published_at: revision.published_at,
    updated_at: revision.updated_at,
  };
}
export function readPublicRows<T extends { id: string | number }>(type: EntityType): T[] {
  const rows = getDb().prepare(`SELECT * FROM ${entityTables[type]}`).all() as unknown as T[];
  const known = new Set(rows.map((row) => String(row.id)));
  const published = rows
    .map((row) => publishedRow(type, row))
    .filter((row): row is T => row !== null);
  const ids = getDb()
    .prepare("SELECT DISTINCT entity_id FROM content_revisions WHERE entity_type=?")
    .all(type) as { entity_id: string }[];
  for (const { entity_id } of ids) {
    if (known.has(entity_id)) continue;
    const revision = getPublishedRevision(type, entity_id);
    if (revision) published.push(mergePublished({ id: entity_id } as T, revision));
  }
  return published;
}
