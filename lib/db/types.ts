export interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  article_count?: number;
}

export interface ArticleRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  tags: string | null;
  author_name: string | null;
  is_featured: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadRecord {
  id: number;
  fullname: string;
  phone: string;
  email: string | null;
  program: string | null;
  notes: string | null;
  status: "new" | "contacted" | "consulted" | "cancelled";
  created_at: string;
  consent?: number;
  consent_at?: string | null;
  consent_version?: string | null;
  source?: string | null;
  idempotency_key?: string | null;
}

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  role_scope: string;
  phone: string;
  hotline: string;
  email: string;
  website_url: string;
  support_hours: string;
  locations: string;
  service_urls: string;
  source: string;
  version: number;
  updated_at: string;
}

export interface ProgramRecord {
  id: string;
  slug: string;
  aliases: string;
  name: string;
  major: string;
  code: string;
  form: string;
  degree_name: string;
  awarding_institution: string;
  duration_credits: string;
  source: string;
  version: number;
  created_at: string;
  updated_at: string;
  summary?: string | null;
  marketing_label?: string | null;
  hero_label?: string | null;
  group_id?: string | null;
  icon?: string | null;
  image?: string | null;
  language?: string | null;
  course_count?: string | null;
  careers?: string | null;
  curriculum?: string | null;
  semesters?: string | null;
  outcomes?: string | null;
  admissions?: string | null;
  graduation?: string | null;
  further_study?: string | null;
  confirmations?: string | null;
  faqs?: string | null;
}

export interface AdmissionRoundRecord {
  id: string;
  name: string;
  program_ids: string;
  cohort: string;
  audience: string;
  open_at: string;
  deadline_at: string;
  start_at: string;
  application_url: string;
  documents: string;
  source: string;
  status: "planned" | "open" | "closed" | "archived";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TuitionPolicyRecord {
  id: string;
  program_id: string;
  cohort: string;
  audience: string;
  currency: string;
  unit_price_per_credit: number;
  total_credits: number;
  total_tuition: number;
  other_fees: string;
  assumptions: string;
  effective_from: string;
  effective_to: string | null;
  source: string;
  doc_ref: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipRecord {
  id: string;
  name: string;
  program_ids: string;
  scope: string;
  value_type: "percent" | "amount";
  value: number;
  conditions: string;
  deadline_at: string | null;
  evaluation_method: string;
  source: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: "curriculum" | "admission_guide" | "policy" | "form" | "license" | "other";
  file_url: string;
  view_url: string;
  mime_type: string;
  byte_size: number;
  checksum_sha256: string;
  published_date: string;
  version: string;
  source: string;
  rights: string;
  access: "public" | "private";
  alt: string | null;
  caption: string | null;
  focal: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentRevisionRecord {
  id: number;
  entity_type:
    | "article"
    | "page"
    | "program"
    | "tuition_policy"
    | "admission_round"
    | "organization"
    | "scholarship"
    | "document";
  entity_id: string;
  version: number;
  title: string;
  payload: string;
  workflow_state: "draft" | "in_review" | "approved" | "published" | "archived";
  reviewer_notes: string | null;
  created_by: string;
  approved_by: string | null;
  published_at: string | null;
  expired_at: string | null;
  highlight_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: number;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  revision_id: number | null;
  timestamp: string;
  changed_fields: string;
  reason: string | null;
  ip_address: string | null;
}

export interface AnalyticsEventRecord {
  id: number;
  event_name: string;
  page_path: string;
  program_id: string | null;
  category: string | null;
  session_id: string | null;
  server_time: string;
  environment: string;
  metadata: string | null;
}

export interface SchemaMigrationRecord {
  version: number;
  name: string;
  applied_at: string;
  checksum: string;
  execution_time_ms: number;
}
