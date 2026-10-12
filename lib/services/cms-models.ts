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
    limit?: number;
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

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options.limit || 50;

  const rows = db
    .prepare(`SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT ?`)
    .all(...params, limit) as unknown as AuditLogRecord[];

  return rows;
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
}
