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
    { workflow_state: string; published_at: string | null; expired_at: string | null } | undefined;
  if (!revision) return false;
  if (revision.workflow_state === "archived" && revision.published_at) return true;
  if (revision.workflow_state !== "published" || !revision.published_at) return false;
  const now = Date.now();
  return (
    Date.parse(revision.published_at) <= now &&
    (!revision.expired_at || Date.parse(revision.expired_at) > now)
  );
}

export function getLivePrograms(): Program[] {
  const published = getPublicPrograms();
  const knownBaseIds = new Set(programs.map((p) => p.id));

  const baseLive = programs.flatMap((base) => {
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
        group: (["business", "technology", "language"].includes(current.group as string)
          ? current.group
          : base.group) as Program["group"],
        image: current.image || base.image,
        icon: current.icon || base.icon,
        shortDescription: current.summary || base.shortDescription,
        specialization: current.major || base.specialization,
      },
    ];
  });

  const dynamicLive: Program[] = published
    .filter((row) => !knownBaseIds.has(row.id as any))
    .map((row) => ({
      id: row.id as any,
      name: row.name,
      officialMajorName: row.name,
      specialization: row.major,
      majorCode: row.code,
      slug: row.slug,
      legacySlugs: row.aliases,
      shortDescription: row.summary || `Chương trình đào tạo ${row.name}`,
      icon: row.icon || "GraduationCap",
      image: row.image || "/images/programs/program-business.webp",
      href: `/${row.slug}/`,
      group: (["business", "technology", "language"].includes(row.group as string)
        ? row.group
        : "technology") as Program["group"],
      trainingMode: "Đào tạo từ xa",
      degreeAwarded: row.degreeName,
      awardingInstitution: "Trường Đại học Phú Xuân",
      collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
      targetAudiences: [
        {
          audienceId: "thpt",
          audienceName: "Tốt nghiệp THPT / Tương đương",
          durationYears: 3.5,
          durationSemesters: row.durationCredits.semesters || 9,
          estimatedCredits: row.durationCredits.credits || 126,
          description: "Khối kiến thức đầy đủ theo khung chương trình chuẩn.",
        },
      ],
    }));

  return [...baseLive, ...dynamicLive];
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

  if (!base && !current) return null;
  const baseDetail = base ? getProgramDetail(base.slug) : null;

  if (!current) {
    if (!baseDetail) return null;
    return hasManagedContent("program", base!.id) ? null : baseDetail;
  }

  const factsMap: Record<string, string> = {
    "Mã ngành": current.code,
    "Trình độ": "Đại học",
    "Hình thức": current.form,
    "Văn bằng": current.degreeName,
    "Thời gian": `${current.durationCredits.semesters} học kỳ`,
    "Khối lượng": `${current.durationCredits.credits} tín chỉ`,
    "Đơn vị cấp bằng": current.awardingInstitution,
    ...(current.language ? { "Ngôn ngữ": current.language } : {}),
    ...(current.courseCount ? { "Số học phần": current.courseCount } : {}),
  };

  const defaultFacts: ProgramDetail["facts"] = [
    { label: "Mã ngành", value: current.code, status: "verified" },
    { label: "Trình độ", value: "Đại học", status: "verified" },
    { label: "Hình thức", value: current.form, status: "verified" },
    { label: "Văn bằng", value: current.degreeName, status: "verified" },
    {
      label: "Thời gian",
      value: `${current.durationCredits.semesters} học kỳ`,
      status: "verified",
    },
    {
      label: "Khối lượng",
      value: `${current.durationCredits.credits} tín chỉ`,
      note: "Không gồm Giáo dục thể chất và GDQP&AN",
      status: "verified",
    },
    { label: "Đơn vị cấp bằng", value: current.awardingInstitution, status: "verified" },
    ...(current.language
      ? [{ label: "Ngôn ngữ", value: current.language, status: "verified" as const }]
      : []),
    ...(current.courseCount
      ? [{ label: "Số học phần", value: current.courseCount, status: "verified" as const }]
      : []),
  ];

  const facts = baseDetail
    ? baseDetail.facts.map((fact) => ({
        ...fact,
        value: factsMap[fact.label] ?? fact.value,
      }))
    : defaultFacts;

  let semesters =
    current.semesters && current.semesters.length > 0
      ? current.semesters
      : (baseDetail?.semesters ?? []);
  if (
    (!semesters || semesters.length === 0) &&
    current.curriculum &&
    current.curriculum.length > 0
  ) {
    semesters = current.curriculum.map((term: any, index: number) => ({
      term: index + 1,
      credits: term.credits ?? 0,
      phase: term.name || `Học kỳ ${index + 1}`,
      highlights: Array.isArray(term.courses)
        ? term.courses.slice(0, 3).map((c: any) => c.name || c.title || "")
        : [],
    }));
  }

  return {
    slug: current.slug,
    officialName: current.name,
    englishName: baseDetail?.englishName ?? null,
    marketingLabel: current.marketingLabel || baseDetail?.marketingLabel || current.major,
    code: current.code,
    summary: current.summary || baseDetail?.summary || "",
    heroLabel:
      current.heroLabel || baseDetail?.heroLabel || "Chương trình đào tạo · Kế hoạch 9 học kỳ",
    evidenceLevel: baseDetail?.evidenceLevel || "academic_source",
    source: {
      label:
        current.source || baseDetail?.source.label || "Quyết định mở ngành & Kiểm định chất lượng",
      reference: baseDetail?.source.reference || "Hồ sơ chương trình đào tạo",
      reviewedAt: baseDetail?.source.reviewedAt || new Date().toISOString().slice(0, 10),
    },
    facts,
    curriculum:
      current.curriculum && current.curriculum.length > 0
        ? current.curriculum
        : (baseDetail?.curriculum ?? []),
    semesters,
    outcomes:
      current.outcomes && current.outcomes.length > 0
        ? current.outcomes
        : (baseDetail?.outcomes ?? []),
    careers:
      current.careers && current.careers.length > 0 ? current.careers : (baseDetail?.careers ?? []),
    furtherStudy:
      current.furtherStudy !== undefined
        ? current.furtherStudy
        : (baseDetail?.furtherStudy ?? null),
    admissions:
      current.admissions !== undefined ? current.admissions : (baseDetail?.admissions ?? null),
    graduation:
      current.graduation !== undefined ? current.graduation : (baseDetail?.graduation ?? null),
    confirmations: current.confirmations ?? baseDetail?.confirmations ?? [],
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
      percentage: isPercent ? `${value}%` : `${new Intl.NumberFormat("vi-VN").format(value)} đ`,
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
  const settings = getSetting<
    Partial<{
      hotline: string;
      email: string;
      address: string;
    }>
  >("site_settings", {});
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
      locations: locations.map((row) => ({
        city: row.city,
        address: row.address,
        phone: row.hotline,
      })),
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
