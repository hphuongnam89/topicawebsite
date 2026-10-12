import "server-only";
import { getDb } from "@/lib/db";
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
  const base = id
    ? db.prepare(`SELECT 1 FROM ${entityTables[type]} WHERE id=?`).get(id)
    : db.prepare(`SELECT 1 FROM ${entityTables[type]} LIMIT 1`).get();
  const revision = id
    ? db
        .prepare("SELECT 1 FROM content_revisions WHERE entity_type=? AND entity_id=? LIMIT 1")
        .get(type, id)
    : db.prepare("SELECT 1 FROM content_revisions WHERE entity_type=? LIMIT 1").get(type);
  return Boolean(base || revision);
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
  if (!hasManagedContent("scholarship")) return SCHOLARSHIPS;
  return getPublicScholarships().map((row) => ({
    id: row.id,
    title: row.name,
    percentage:
      row.valueType === "percent"
        ? `${row.value}%`
        : new Intl.NumberFormat("vi-VN").format(row.value) + " đ",
    percentageValue: row.valueType === "percent" ? row.value / 100 : 0,
    scope: "full_course",
    description: row.scope,
    criteria: row.conditions,
    source: row.evaluationMethod,
  }));
}

export type ContactChannels = Record<keyof typeof contactChannels, ContactChannel>;
export function getLiveContact(): { channels: ContactChannels; locations: typeof campuses } {
  const org = getPublicOrganization();
  if (!org && !hasManagedContent("organization"))
    return { channels: contactChannels, locations: campuses };
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
