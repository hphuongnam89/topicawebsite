import "server-only";
import { safePublicPath } from "@/lib/analytics-path";
import { getDb } from "@/lib/db";
import type {
  OrganizationRecord,
  ProgramRecord,
  AdmissionRoundRecord,
  TuitionPolicyRecord,
  ScholarshipRecord,
  DocumentRecord,
  AuditLogRecord,
} from "@/lib/db/types";
import { analyticsEventSchema, auditLogSchema, documentSchema } from "@/lib/validation/cms-schemas";

// ----------------------------------------------------------------------------
// PUBLIC DTO CONTRACTS (Sanitized, no secrets, no reviewer notes, no private docs)
// ----------------------------------------------------------------------------

export interface PublicOrganizationDto {
  id: string;
  name: string;
  roleScope: string;
  phone: string;
  hotline: string;
  email: string;
  websiteUrl: string;
  supportHours: string;
  locations: Array<{ name: string; address: string; city: string; hotline?: string }>;
  serviceUrls: {
    library: string;
    lms: string;
    assessment: string;
    application: string;
    status: string;
  };
  version: number;
}

export interface PublicProgramDto {
  id: string;
  slug: string;
  aliases: string[];
  name: string;
  major: string;
  code: string;
  form: string;
  degreeName: string;
  awardingInstitution: string;
  durationCredits: {
    credits: number;
    semesters: number;
    estimatedMonths?: number;
    tracks?: Array<{ audience: string; credits: number; duration: string }>;
  };
  version: number;
  summary?: string;
  marketingLabel?: string;
  heroLabel?: string;
  group?: string;
  icon?: string;
  image?: string;
  language?: string;
  courseCount?: string;
  careers?: string[];
  curriculum?: any[];
  semesters?: any[];
  outcomes?: any[];
  admissions?: string;
  graduation?: string;
  furtherStudy?: string;
  confirmations?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  source?: string;
}

export interface PublicAdmissionRoundDto {
  id: string;
  name: string;
  programIds: string[];
  cohort: string;
  audience: string;
  openAt: string;
  deadlineAt: string;
  startAt: string;
  applicationUrl: string;
  documents: Array<{ title: string; url: string }>;
  status: "planned" | "open" | "closed" | "archived";
}

export interface PublicTuitionPolicyDto {
  id: string;
  programId: string;
  cohort: string;
  audience: string;
  currency: string;
  unitPricePerCredit: number;
  totalCredits: number;
  totalTuition: number;
  otherFees: Record<string, number>;
  assumptions: Record<string, any>;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface PublicScholarshipDto {
  id: string;
  name: string;
  programIds: string[];
  scope: string;
  valueType: "percent" | "amount";
  value: number;
  conditions: string;
  deadlineAt: string | null;
  evaluationMethod: string;
}

export interface PublicDocumentDto {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  viewUrl: string;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
  publishedDate: string;
  version: string;
  rights: string;
  access: "public";
}

// ----------------------------------------------------------------------------
// REVISIONING & WORKFLOW STATE MACHINE
// ----------------------------------------------------------------------------

export {
  createDraftRevision,
  getRevisionById,
  getRevisions,
  getPublishedRevision,
  submitRevisionForReview,
  approveRevision,
  publishRevision,
  rejectRevision,
} from "./revisions";
import { publishedRow, readPublicRows } from "./publication";

export function getPublicOrganization(): PublicOrganizationDto | null {
  const db = getDb();
  const base = db.prepare("SELECT * FROM organizations WHERE id = 'pxu_topica'").get() as
    OrganizationRecord | undefined;
  const row = base
    ? publishedRow("organization", base)
    : readPublicRows<OrganizationRecord>("organization")[0];
  if (!row) return null;

  let locations: any[] = [];
  try {
    locations = JSON.parse(row.locations);
  } catch {}

  let serviceUrls: any = {};
  try {
    serviceUrls = JSON.parse(row.service_urls);
  } catch {}

  return {
    id: row.id,
    name: row.name,
    roleScope: row.role_scope,
    phone: row.phone,
    hotline: row.hotline,
    email: row.email,
    websiteUrl: row.website_url,
    supportHours: row.support_hours,
    locations,
    serviceUrls,
    version: row.version,
  };
}

export function getPublicPrograms(): PublicProgramDto[] {
  const rows = readPublicRows<ProgramRecord>("program");

  return rows.flatMap((r): PublicProgramDto[] => {
    let aliases: string[] = [];
    try {
      aliases = JSON.parse(r.aliases);
    } catch {}

    let durationCredits: PublicProgramDto["durationCredits"];
    try {
      durationCredits = JSON.parse(r.duration_credits);
    } catch {
      return [];
    }
    if (
      !Number.isInteger(durationCredits?.credits) ||
      durationCredits.credits <= 0 ||
      !Number.isInteger(durationCredits.semesters) ||
      durationCredits.semesters <= 0
    )
      return [];

    let careers: string[] | undefined;
    if (r.careers) {
      try {
        careers = typeof r.careers === "string" ? JSON.parse(r.careers) : r.careers;
      } catch {}
    }

    let curriculum: any[] | undefined;
    if (r.curriculum) {
      try {
        curriculum = typeof r.curriculum === "string" ? JSON.parse(r.curriculum) : r.curriculum;
      } catch {}
    }

    let semesters: any[] | undefined;
    if (r.semesters) {
      try {
        semesters = typeof r.semesters === "string" ? JSON.parse(r.semesters) : r.semesters;
      } catch {}
    }

    let outcomes: any[] | undefined;
    if (r.outcomes) {
      try {
        outcomes = typeof r.outcomes === "string" ? JSON.parse(r.outcomes) : r.outcomes;
      } catch {}
    }

    let confirmations: string[] | undefined;
    if (r.confirmations) {
      try {
        confirmations = typeof r.confirmations === "string" ? JSON.parse(r.confirmations) : r.confirmations;
      } catch {}
    }

    let faqs: any[] | undefined;
    if (r.faqs) {
      try {
        faqs = typeof r.faqs === "string" ? JSON.parse(r.faqs) : r.faqs;
      } catch {}
    }

    return [
      {
        id: r.id,
        slug: r.slug,
        aliases,
        name: r.name,
        major: r.major,
        code: r.code,
        form: r.form,
        degreeName: r.degree_name,
        awardingInstitution: r.awarding_institution,
        durationCredits,
        version: r.version,
        summary: r.summary || undefined,
        marketingLabel: r.marketing_label || undefined,
        heroLabel: r.hero_label || undefined,
        group: r.group_id || undefined,
        icon: r.icon || undefined,
        image: r.image || undefined,
        language: r.language || undefined,
        courseCount: r.course_count || undefined,
        careers,
        curriculum,
        semesters,
        outcomes,
        admissions: r.admissions || undefined,
        graduation: r.graduation || undefined,
        furtherStudy: r.further_study || undefined,
        confirmations,
        faqs,
        source: r.source || undefined,
      },
    ];
  });
}

export function getPublicProgramById(id: string): PublicProgramDto | null {
  return getPublicPrograms().find((row) => row.id === id) ?? null;
}

export function getPublicProgramBySlug(slug: string): PublicProgramDto | null {
  const row = readPublicRows<ProgramRecord>("program").find((row) => row.slug === slug);
  if (!row) return null;
  return getPublicProgramById(row.id);
}

export function getPublicAdmissionRounds(): PublicAdmissionRoundDto[] {
  const rows = readPublicRows<AdmissionRoundRecord>("admission_round").filter(
    (row) => row.status !== "archived",
  );

  return rows.map((r) => {
    let programIds: string[] = [];
    try {
      programIds = JSON.parse(r.program_ids);
    } catch {}

    let documents: any[] = [];
    try {
      documents = JSON.parse(r.documents);
    } catch {}

    return {
      id: r.id,
      name: r.name,
      programIds,
      cohort: r.cohort,
      audience: r.audience,
      openAt: r.open_at,
      deadlineAt: r.deadline_at,
      startAt: r.start_at,
      applicationUrl: r.application_url,
      documents,
      status:
        Date.now() < Date.parse(r.open_at)
          ? "planned"
          : Date.now() < Date.parse(r.deadline_at)
            ? "open"
            : "closed",
    };
  });
}

export function getPublicTuitionPolicies(): PublicTuitionPolicyDto[] {
  const rows = readPublicRows<TuitionPolicyRecord>("tuition_policy").filter(
    (row) =>
      Date.parse(row.effective_from) <= Date.now() &&
      (!row.effective_to || Date.now() < Date.parse(row.effective_to)),
  );

  return rows.map((r) => {
    let otherFees: any = {};
    try {
      otherFees = JSON.parse(r.other_fees);
    } catch {}

    let assumptions: any = {};
    try {
      assumptions = JSON.parse(r.assumptions);
    } catch {}

    return {
      id: r.id,
      programId: r.program_id,
      cohort: r.cohort,
      audience: r.audience,
      currency: r.currency,
      unitPricePerCredit: r.unit_price_per_credit,
      totalCredits: r.total_credits,
      totalTuition: r.total_tuition,
      otherFees,
      assumptions,
      effectiveFrom: r.effective_from,
      effectiveTo: r.effective_to,
    };
  });
}

export function getPublicScholarships(): PublicScholarshipDto[] {
  const rows = readPublicRows<ScholarshipRecord>("scholarship").filter(
    (row) => !row.deadline_at || Date.now() < Date.parse(row.deadline_at),
  );

  return rows.map((r) => {
    let programIds: string[] = [];
    try {
      programIds = JSON.parse(r.program_ids);
    } catch {}

    return {
      id: r.id,
      name: r.name,
      programIds,
      scope: r.scope,
      valueType: r.value_type,
      value: r.value,
      conditions: r.conditions,
      deadlineAt: r.deadline_at,
      evaluationMethod: r.evaluation_method,
    };
  });
}

export function getPublicDocuments(): PublicDocumentDto[] {
  const rows = readPublicRows<DocumentRecord>("document").filter(
    (row) => row.access === "public" && documentSchema.safeParse(row).success,
  );

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    fileUrl: r.file_url,
    viewUrl: r.view_url,
    mimeType: r.mime_type,
    byteSize: r.byte_size,
    checksumSha256: r.checksum_sha256,
    publishedDate: r.published_date,
    version: r.version,
    rights: r.rights,
    access: "public",
  }));
}

// ----------------------------------------------------------------------------
// AUDIT LOG SERVICE
// ----------------------------------------------------------------------------

export function recordAuditLog(entry: {
  actor_id: string;
  actor_name: string;
  action: AuditLogRecord["action"];
  entity_type: string;
  entity_id: string;
  revision_id?: number | null;
  timestamp?: string;
  changed_fields: string;
  reason?: string | null;
  ip_address?: string | null;
}): void {
  const now = entry.timestamp || new Date().toISOString();
  const validated = auditLogSchema.parse({
    ...entry,
    timestamp: now,
  });

  const db = getDb();
  db.prepare(
    `
    INSERT INTO audit_logs (
      actor_id, actor_name, action, entity_type, entity_id, revision_id,
      timestamp, changed_fields, reason, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    validated.actor_id,
    validated.actor_name,
    validated.action,
    validated.entity_type,
    validated.entity_id,
    validated.revision_id ?? null,
    validated.timestamp,
    typeof validated.changed_fields === "string"
      ? validated.changed_fields
      : JSON.stringify(validated.changed_fields),
    validated.reason ?? null,
    validated.ip_address ?? null,
  );
}

export function getAuditLogs(
  options: {
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    actorId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  } = {},
): AuditLogRecord[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.entityType) {
    conditions.push("entity_type = ?");
    params.push(options.entityType);
  }
  if (options.entityId) {
    conditions.push("entity_id = ?");
    params.push(options.entityId);
  }
  if (options.startDate) {
    conditions.push("timestamp >= ?");
    params.push(options.startDate);
  }
  if (options.endDate) {
    conditions.push("timestamp < ?");
    params.push(options.endDate);
  }
  if (options.actorId) {
    conditions.push("actor_id = ?");
    params.push(options.actorId);
  }
  if (options.action) {
    conditions.push("action = ?");
    params.push(options.action);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(100, Math.max(1, Math.trunc(options.limit ?? 50) || 50));
  const offset = Math.max(0, Math.trunc(options.offset ?? 0) || 0);

  const rows = db
    .prepare(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC,id DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset) as unknown as AuditLogRecord[];

  return rows;
}

export function countAuditLogs(
  options: {
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    actorId?: string;
    action?: string;
  } = {},
): number {
  const conditions: string[] = [];
  const params: string[] = [];
  for (const [key, column] of [
    ["entityType", "entity_type"],
    ["entityId", "entity_id"],
    ["startDate", "timestamp >="],
    ["endDate", "timestamp <"],
    ["actorId", "actor_id"],
    ["action", "action"],
  ] as const) {
    const value = options[key];
    if (!value) continue;
    conditions.push(column.includes(" ") ? `${column} ?` : `${column} = ?`);
    params.push(value);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS total FROM audit_logs ${where}`)
    .get(...params) as { total: number };
  return Number(row.total);
}

export function getAuditLogActors(): Array<{ id: string; name: string }> {
  return getDb()
    .prepare(
      "SELECT actor_id AS id, MAX(actor_name) AS name FROM audit_logs GROUP BY actor_id ORDER BY name COLLATE NOCASE",
    )
    .all() as Array<{ id: string; name: string }>;
}

export interface CmsExpiringItem {
  revisionId: number;
  entityType: string;
  entityId: string;
  title: string;
  expiresAt: string;
}

export function getCmsOperationsHealth(asOf = new Date()) {
  const db = getDb();
  const sourceTables = [
    { table: "organizations", type: "organization", label: "Liên hệ & tổ chức" },
    { table: "programs", type: "program", label: "Ngành học" },
    { table: "admission_rounds", type: "admission_round", label: "Tuyển sinh" },
    { table: "tuition_policies", type: "tuition_policy", label: "Học phí" },
    { table: "scholarships", type: "scholarship", label: "Học bổng" },
    { table: "documents", type: "document", label: "Tài liệu" },
  ];
  const sourceGaps = sourceTables.map(({ table, type, label }) => {
    const row = db
      .prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE trim(coalesce(source,'')) = ''`)
      .get() as { count: number };
    return { entityType: type, label, count: Number(row.count) };
  });
  const missingSource = sourceGaps.reduce((total, item) => total + item.count, 0);
  const missingDocumentFiles = Number(
    (
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM documents WHERE trim(coalesce(file_url,'')) = '' OR trim(coalesce(view_url,'')) = ''",
        )
        .get() as { count: number }
    ).count,
  );
  const missingDocumentItems = db
    .prepare(
      "SELECT id, title FROM documents WHERE trim(coalesce(file_url,'')) = '' OR trim(coalesce(view_url,'')) = '' ORDER BY title COLLATE NOCASE LIMIT 8",
    )
    .all() as Array<{ id: string; title: string }>;

  const now = asOf.toISOString();
  const through = new Date(asOf.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const revisions = db
    .prepare(
      `WITH ranked AS (
         SELECT *, ROW_NUMBER() OVER (
           PARTITION BY entity_type, entity_id ORDER BY published_at DESC, version DESC
         ) AS row_number
         FROM content_revisions
         WHERE workflow_state IN ('published','archived') AND published_at IS NOT NULL
       )
       SELECT id, entity_type, entity_id, title, payload, expired_at
       FROM ranked
       WHERE row_number=1 AND workflow_state='published' AND published_at<=?
         AND (expired_at IS NULL OR expired_at>?)`,
    )
    .all(now, now) as Array<{
    id: number;
    entity_type: string;
    entity_id: string;
    title: string;
    payload: string;
    expired_at: string | null;
  }>;

  const expiringItems: CmsExpiringItem[] = [];
  for (const revision of revisions) {
    if (!["admission_round", "tuition_policy", "scholarship"].includes(revision.entity_type))
      continue;
    try {
      const payload = JSON.parse(revision.payload) as Record<string, unknown>;
      const candidates = [revision.expired_at, payload.deadline_at, payload.effective_to]
        .filter((value): value is string => typeof value === "string" && Boolean(value))
        .filter((value) => !Number.isNaN(Date.parse(value)))
        .sort((left, right) => Date.parse(left) - Date.parse(right));
      const expiresAt = candidates[0];
      if (
        expiresAt &&
        Date.parse(expiresAt) >= Date.parse(now) &&
        Date.parse(expiresAt) <= Date.parse(through)
      ) {
        expiringItems.push({
          revisionId: revision.id,
          entityType: revision.entity_type,
          entityId: revision.entity_id,
          title: revision.title,
          expiresAt,
        });
      }
    } catch {
      // Invalid legacy revision payloads are surfaced by editorial validation, not guessed here.
    }
  }
  expiringItems.sort((left, right) => Date.parse(left.expiresAt) - Date.parse(right.expiresAt));

  return {
    missingSource,
    sourceGaps,
    missingDocumentFiles,
    missingDocumentItems,
    expiringItems: expiringItems.slice(0, 8),
    expiringCount: expiringItems.length,
  };
}

// ----------------------------------------------------------------------------
// ANALYTICS EVENTS SERVICE (Allowlist, anonymous, strictly no PII)
// ----------------------------------------------------------------------------

export function recordAnalyticsEvent(event: {
  eventName: "cta_click" | "form_submit" | "file_download" | "page_view" | "search";
  pagePath: string;
  programId?: string | null;
  category?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, any>;
  environment?: string;
}): void {
  const now = new Date().toISOString();
  const validated = analyticsEventSchema.parse({
    event_name: event.eventName,
    page_path: safePublicPath(event.pagePath),
    program_id: event.programId ?? null,
    category: event.category ?? null,
    session_id: null,
    server_time: now,
    environment:
      process.env.TOPICA_QA_MODE === "true"
        ? "qa"
        : event.environment || process.env.NODE_ENV || "production",
    metadata: event.metadata,
  });

  const db = getDb();
  db.prepare(
    `
    INSERT INTO analytics_events (
      event_name, page_path, program_id, category, session_id,
      server_time, environment, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    validated.event_name,
    validated.page_path,
    validated.program_id ?? null,
    validated.category ?? null,
    validated.session_id ?? null,
    validated.server_time,
    validated.environment,
    validated.metadata ? JSON.stringify(validated.metadata) : null,
  );

  // Opportunistic retention pruning (throttle check)
  if (Math.random() < 0.01) {
    try {
      pruneAnalyticsEvents(90);
    } catch {
      // Best-effort cleanup
    }
  }
}

/**
 * Prunes analytics events older than retentionDays (default 90 days).
 * Protects SQLite volume against unbounded growth.
 */
export function pruneAnalyticsEvents(retentionDays = 90): number {
  const db = getDb();
  const safeDays = Math.max(1, Math.min(365, retentionDays));
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare("DELETE FROM analytics_events WHERE server_time < ?").run(cutoff);
  return Number(result.changes);
}
