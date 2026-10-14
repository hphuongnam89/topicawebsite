import "server-only";
import { getDb, getSetting } from "@/lib/db";
import { programs, PROGRAM_ID_MAP, type Program } from "@/data/programs";
import { getProgramDetail, type ProgramDetail } from "@/data/program-details";
import {
  OFFICIAL_TUITION_PROGRAMS,
  SCHOLARSHIPS,
  type ProgramTuition,
  type ScholarshipPolicy,
} from "@/data/tuition";
import { contactChannels, campuses, type ContactChannel } from "@/data/campuses";
import { entityTables, type EntityType } from "./content-entities";
import {
  getPublicPrograms,
  getPublicOrganization,
  getPublicTuitionPolicies,
  getPublicScholarships,
} from "./cms-models";

export function hasManagedContent(type: EntityType, id?: string): boolean {
  const db = getDb();
  // A draft/review revision is editorial state and must not hide an existing
  // public fallback. Only an effective publication or an explicit archive
  // suppresses the legacy/static consumer when no public row is available.
  const params = id ? [type, id] : [type];
  const where = id ? "entity_type=? AND entity_id=?" : "entity_type=?";
  const revision = db
    .prepare(
      `SELECT workflow_state, published_at, expired_at
       FROM content_revisions
       WHERE ${where}
       ORDER BY version DESC, id DESC LIMIT 1`,
    )
    .get(...params) as
    | { workflow_state: string; published_at: string | null; expired_at: string | null }
    | undefined;
  if (!revision) return false;
  if (revision.workflow_state === "archived" && revision.published_at) return true;
  if (revision.workflow_state !== "published" || !revision.published_at) return false;
  const now = Date.now();
  return Date.parse(revision.published_at) <= now &&
    (!revision.expired_at || Date.parse(revision.expired_at) > now);
}

export function getLivePrograms(): Program[] {
  const published = getPublicPrograms();
  return programs.flatMap((base) => {
    const current = published.find((row) => row.id === base.id);
    if (!current) return hasManagedContent("program", base.id) ? [] : [base];
    return [
      {
        ...base,
        name: current.name,
        officialMajorName: current.name,
        majorCode: current.code,
        slug: current.slug,
        href: `/${current.slug}/`,
        degreeAwarded: current.degreeName,
      },
    ];
  });
}

export function getLiveProgramDetail(path: string): ProgramDetail | null {
  const current = getPublicPrograms().find(
    (row) => row.slug === path || row.aliases.includes(path),
  );
  const base = programs.find(
    (row) =>
      row.id === (current?.id || PROGRAM_ID_MAP[path]) ||
      row.slug === path ||
      row.legacySlugs?.includes(path),
  );
  if (!base) return null;
  const detail = getProgramDetail(base.slug);
  if (!detail) return null;
  if (!current) return hasManagedContent("program", base.id) ? null : detail;
  const facts = {
    "Mã ngành": current.code,
    "Hình thức": current.form,
    "Văn bằng": current.degreeName,
    "Đơn vị cấp bằng": current.awardingInstitution,
    "Khối lượng": `${current.durationCredits.credits} tín chỉ`,
    "Thời gian": `${current.durationCredits.semesters} học kỳ`,
  };
  return {
    ...detail,
    slug: current.slug,
    officialName: current.name,
    code: current.code,
    facts: detail.facts.map((fact) => ({
      ...fact,
      value: facts[fact.label as keyof typeof facts] ?? fact.value,
    })),
  };
}

export function isKnownProgramPath(path: string): boolean {
  return (
    !!PROGRAM_ID_MAP[path] ||
    programs.some((row) => row.slug === path || row.legacySlugs?.includes(path)) ||
    getPublicPrograms().some((row) => row.slug === path || row.aliases.includes(path))
  );
}

export function getLiveTuitionPrograms(): readonly ProgramTuition[] {
  const live = getLivePrograms();
  if (!hasManagedContent("tuition_policy"))
    return OFFICIAL_TUITION_PROGRAMS.filter((row) => live.some((program) => program.id === row.id));
  const policies = getPublicTuitionPolicies();
  return OFFICIAL_TUITION_PROGRAMS.flatMap((base) => {
    const program = live.find((row) => row.id === base.id);
    const policy =
      policies.find((row) => row.programId === base.id && row.audience === "thpt") ??
      policies.find((row) => row.programId === base.id) ??
      policies.find((row) => row.programId === "all");
    if (!program || !policy) return [];
    const semesters =
      getPublicPrograms().find((row) => row.id === base.id)?.durationCredits.semesters ??
      base.semesters;
    return [
      {
        ...base,
        slug: program.slug,
        programName: program.name,
        credits: policy.totalCredits,
        pricePerCredit: policy.unitPricePerCredit,
        totalTuition: policy.totalTuition,
        semesters,
        tuitionPerSemester: policy.totalTuition / semesters,
        cohort: policy.cohort,
        note: `Đối tượng: ${policy.audience}. Các khoản khác theo chính sách áp dụng.`,
      },
    ];
  });
}

export function getLiveScholarships(): readonly ScholarshipPolicy[] {
  const published = getPublicScholarships();
  if (!published.length) return SCHOLARSHIPS;
  return published.map((row) => {
    const isPercent = row.valueType === "percent";
    const value = Number(row.value);
    return {
      id: row.id,
      title: row.name,
      percentage: isPercent
        ? `${value}%`
        : `${new Intl.NumberFormat("vi-VN").format(value)} đ`,
      percentageValue: isPercent ? value / 100 : 0,
      scope: row.scope === "first_year" ? "first_year" : "full_course",
      tag: "Học bổng Topica",
      description: row.conditions,
      criteria: row.evaluationMethod,
      source: "CMS publication",
    } satisfies ScholarshipPolicy;
  });
}

export type ContactChannels = Record<keyof typeof contactChannels, ContactChannel>;
export function getLiveContact(): { channels: ContactChannels; locations: typeof campuses } {
  const org = getPublicOrganization();
  const settings = getSetting<Partial<{
    hotline: string;
    email: string;
    address: string;
  }>>("site_settings", {});
  const hasConfiguredSettings = Object.keys(settings).length > 0;
  if (!org && !hasManagedContent("organization")) {
    const phone = settings.hotline?.trim() || contactChannels.admissionsHotline.value;
    const email = settings.email?.trim() || contactChannels.admissionsEmail.value;
    const address = settings.address?.trim();
    return {
      channels: {
        ...contactChannels,
        admissionsHotline: {
          ...contactChannels.admissionsHotline,
          value: phone,
          href: `tel:${phone.replace(/[^+\d]/g, "")}`,
        },
        admissionsEmail: {
          ...contactChannels.admissionsEmail,
          value: email,
          href: `mailto:${email}`,
        },
      },
      locations: address
        ? [{ ...campuses[0], address, city: campuses[0]?.city ?? "" }, ...campuses.slice(1)]
        : campuses,
    };
  }
  const phone = (value: string, label: string): ContactChannel => ({
    label,
    value,
    href: `tel:${value.replace(/[^+\d]/g, "")}`,
    role: "admissions",
  });
  const mail = (value: string): ContactChannel => ({
    label: "Email liên hệ",
    value,
    href: `mailto:${value}`,
    role: "general",
  });
  if (!org) {
    const neutral: ContactChannel = {
      label: "Nhận tư vấn",
      value: "Liên hệ qua biểu mẫu",
      href: "/lien-he/",
      role: "admissions",
    };
    return {
      channels: {
        admissionsHotline: neutral,
        admissionsDirect: neutral,
        admissionsEmail: neutral,
        generalEmail: neutral,
      },
      locations: [],
    };
  }
  if (hasConfiguredSettings) {
    const hotline = settings.hotline?.trim() || org.hotline;
    const phone = settings.hotline?.trim() || org.phone;
    const email = settings.email?.trim() || org.email;
    const locations = settings.address?.trim()
      ? [{ ...org.locations[0], address: settings.address.trim() }, ...org.locations.slice(1)]
      : org.locations;
    return {
      channels: {
        admissionsHotline: {
          label: "Hotline tư vấn",
          value: hotline,
          href: `tel:${hotline.replace(/[^+\d]/g, "")}`,
          role: "admissions",
        },
        admissionsDirect: phoneChannel(phone, "Điện thoại liên hệ"),
        admissionsEmail: mailChannel(email),
        generalEmail: mailChannel(email),
      },
      locations: locations.map((row) => ({ city: row.city, address: row.address, phone: row.hotline })),
    };
  }
  return {
    channels: {
      admissionsHotline: phone(org.hotline, "Hotline tư vấn"),
      admissionsDirect: phone(org.phone, "Điện thoại liên hệ"),
      admissionsEmail: mail(org.email),
      generalEmail: mail(org.email),
    },
    locations: org.locations.map((row) => ({
      city: row.city,
      address: row.address,
      phone: row.hotline,
    })),
  };
}

function phoneChannel(value: string, label: string): ContactChannel {
  return { label, value, href: `tel:${value.replace(/[^+\d]/g, "")}`, role: "admissions" };
}

function mailChannel(value: string): ContactChannel {
  return { label: "Email liên hệ", value, href: `mailto:${value}`, role: "general" };
}
