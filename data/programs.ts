export type ProgramId = "ba" | "tourism" | "it" | "english" | "chinese";

export type TargetAudienceId = "thpt" | "trung_cap" | "cao_dang" | "van_bang_2";

export interface TargetAudienceTrack {
  audienceId: TargetAudienceId;
  audienceName: string;
  durationYears: number;
  durationSemesters: number;
  estimatedCredits: number;
  description: string;
  note?: string;
}

export interface Program {
  id: ProgramId;
  name: string;
  officialMajorName: string;
  specialization?: string;
  majorCode: string;
  slug: string;
  legacySlugs?: readonly string[];
  shortDescription: string;
  icon: string;
  image: string;
  href: string;
  group: "business" | "technology" | "language";
  trainingMode: "Đào tạo từ xa";
  degreeAwarded: string;
  awardingInstitution: "Trường Đại học Phú Xuân";
  collaboratingUnit: "Viện Đào tạo Quốc tế Topica";
  targetAudiences: readonly TargetAudienceTrack[];
}

export const TARGET_AUDIENCE_DEFAULTS: Record<TargetAudienceId, {
  name: string;
  durationYears: number;
  durationSemesters: number;
  credits: number;
  description: string;
}> = {
  thpt: {
    name: "Tốt nghiệp THPT / Tương đương",
    durationYears: 3.5,
    durationSemesters: 9,
    credits: 126,
    description: "Khối kiến thức đầy đủ theo khung chương trình chuẩn (chưa bao gồm GDTC và GDQP&AN).",
  },
  trung_cap: {
    name: "Tốt nghiệp Trung cấp",
    durationYears: 2.5,
    durationSemesters: 6,
    credits: 84,
    description: "Liên thông đại học, được xét công nhận chuyển đổi khối kiến thức cơ bản đã tích lũy.",
  },
  cao_dang: {
    name: "Tốt nghiệp Cao đẳng",
    durationYears: 1.5,
    durationSemesters: 4,
    credits: 56,
    description: "Liên thông đại học cùng ngành hoặc ngành gần, tối ưu thời lượng học tập.",
  },
  van_bang_2: {
    name: "Đã có bằng Đại học (Văn bằng 2)",
    durationYears: 1.5,
    durationSemesters: 4,
    credits: 56,
    description: "Được miễn toàn bộ khối kiến thức đại cương và các học phần tương đương đã hoàn thành.",
  },
};

const createAudienceTracks = (creditsBaseline = 126): readonly TargetAudienceTrack[] => [
  {
    audienceId: "thpt",
    audienceName: TARGET_AUDIENCE_DEFAULTS.thpt.name,
    durationYears: TARGET_AUDIENCE_DEFAULTS.thpt.durationYears,
    durationSemesters: TARGET_AUDIENCE_DEFAULTS.thpt.durationSemesters,
    estimatedCredits: creditsBaseline,
    description: TARGET_AUDIENCE_DEFAULTS.thpt.description,
  },
  {
    audienceId: "trung_cap",
    audienceName: TARGET_AUDIENCE_DEFAULTS.trung_cap.name,
    durationYears: TARGET_AUDIENCE_DEFAULTS.trung_cap.durationYears,
    durationSemesters: TARGET_AUDIENCE_DEFAULTS.trung_cap.durationSemesters,
    estimatedCredits: 84,
    description: TARGET_AUDIENCE_DEFAULTS.trung_cap.description,
  },
  {
    audienceId: "cao_dang",
    audienceName: TARGET_AUDIENCE_DEFAULTS.cao_dang.name,
    durationYears: TARGET_AUDIENCE_DEFAULTS.cao_dang.durationYears,
    durationSemesters: TARGET_AUDIENCE_DEFAULTS.cao_dang.durationSemesters,
    estimatedCredits: 56,
    description: TARGET_AUDIENCE_DEFAULTS.cao_dang.description,
  },
  {
    audienceId: "van_bang_2",
    audienceName: TARGET_AUDIENCE_DEFAULTS.van_bang_2.name,
    durationYears: TARGET_AUDIENCE_DEFAULTS.van_bang_2.durationYears,
    durationSemesters: TARGET_AUDIENCE_DEFAULTS.van_bang_2.durationSemesters,
    estimatedCredits: 56,
    description: TARGET_AUDIENCE_DEFAULTS.van_bang_2.description,
  },
];

export const programs: readonly Program[] = [
  {
    id: "ba",
    name: "Quản trị kinh doanh",
    officialMajorName: "Quản trị kinh doanh",
    specialization: "Quản trị kinh doanh và Marketing",
    majorCode: "7340101",
    slug: "quan-tri-kinh-doanh-marketing",
    legacySlugs: ["quan-tri-kinh-doanh"],
    shortDescription: "Cung cấp kiến thức chuyên sâu về quản trị và chiến lược truyền thông, kinh doanh số hiện đại.",
    icon: "Briefcase",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
    href: "/quan-tri-kinh-doanh-marketing/",
    group: "business",
    trainingMode: "Đào tạo từ xa",
    degreeAwarded: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
    awardingInstitution: "Trường Đại học Phú Xuân",
    collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
    targetAudiences: createAudienceTracks(126),
  },
  {
    id: "tourism",
    name: "Quản trị du lịch và lữ hành",
    officialMajorName: "Quản trị dịch vụ du lịch và lữ hành",
    specialization: "Quản trị lữ hành và Quản trị khách sạn",
    majorCode: "7810103",
    slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
    legacySlugs: ["quan-tri-du-lich", "du-lich-lu-hanh"],
    shortDescription:
      "Đào tạo kỹ năng quản lý, điều hành các hoạt động du lịch và lữ hành chuyên nghiệp trong thời đại số.",
    icon: "Plane",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
    href: "/quan-tri-dich-vu-du-lich-va-lu-hanh/",
    group: "business",
    trainingMode: "Đào tạo từ xa",
    degreeAwarded: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
    awardingInstitution: "Trường Đại học Phú Xuân",
    collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
    targetAudiences: createAudienceTracks(126),
  },
  {
    id: "it",
    name: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
    officialMajorName: "Công nghệ thông tin",
    specialization: "Đồ họa kỹ thuật số và Đa phương tiện",
    majorCode: "7480201",
    slug: "cong-nghe-thong-tin",
    legacySlugs: ["it", "cntt"],
    shortDescription: "Đào tạo kỹ sư CNTT với kiến thức nền tảng và chuyên sâu về đồ hoạ kỹ thuật số, đa phương tiện.",
    icon: "Monitor",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    href: "/cong-nghe-thong-tin/",
    group: "technology",
    trainingMode: "Đào tạo từ xa",
    degreeAwarded: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
    awardingInstitution: "Trường Đại học Phú Xuân",
    collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
    targetAudiences: createAudienceTracks(126),
  },
  {
    id: "english",
    name: "Ngôn ngữ Anh",
    officialMajorName: "Ngôn ngữ Anh",
    specialization: "Tiếng Anh thương mại & Tiếng Anh du lịch - khách sạn",
    majorCode: "7220201",
    slug: "ngon-ngu-anh",
    legacySlugs: ["tieng-anh"],
    shortDescription: "Phát triển kỹ năng ngoại ngữ toàn diện, đáp ứng nhu cầu giao tiếp quốc tế và thương mại.",
    icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    href: "/ngon-ngu-anh/",
    group: "language",
    trainingMode: "Đào tạo từ xa",
    degreeAwarded: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
    awardingInstitution: "Trường Đại học Phú Xuân",
    collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
    targetAudiences: createAudienceTracks(126),
  },
  {
    id: "chinese",
    name: "Ngôn ngữ Trung Quốc",
    officialMajorName: "Ngôn ngữ Trung Quốc",
    specialization: "Tiếng Trung thương mại & Tiếng Trung du lịch",
    majorCode: "7220204",
    slug: "ngon-ngu-trung-quoc",
    legacySlugs: ["tieng-trung"],
    shortDescription:
      "Đào tạo ngôn ngữ và văn hóa Trung Quốc ứng dụng thương mại và du lịch, mở rộng cơ hội nghề nghiệp toàn cầu.",
    icon: "Languages",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1200&auto=format&fit=crop",
    href: "/ngon-ngu-trung-quoc/",
    group: "language",
    trainingMode: "Đào tạo từ xa",
    degreeAwarded: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
    awardingInstitution: "Trường Đại học Phú Xuân",
    collaboratingUnit: "Viện Đào tạo Quốc tế Topica",
    targetAudiences: createAudienceTracks(126),
  },
] as const;

export const programGroups = {
  business: "Kinh doanh & Dịch vụ",
  technology: "Công nghệ & Sáng tạo",
  language: "Ngôn ngữ",
} as const;

export const PROGRAM_ID_MAP: Record<string, ProgramId> = {
  "ba": "ba",
  "quan-tri-kinh-doanh-marketing": "ba",
  "quan-tri-kinh-doanh": "ba",
  "tourism": "tourism",
  "quan-tri-dich-vu-du-lich-va-lu-hanh": "tourism",
  "quan-tri-du-lich": "tourism",
  "du-lich-lu-hanh": "tourism",
  "it": "it",
  "cong-nghe-thong-tin": "it",
  "cntt": "it",
  "english": "english",
  "ngon-ngu-anh": "english",
  "tieng-anh": "english",
  "chinese": "chinese",
  "ngon-ngu-trung-quoc": "chinese",
  "tieng-trung": "chinese",
};

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getProgramBySlug(slug: string): Program | undefined {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return programs.find(
    (p) => p.slug === normalized || p.legacySlugs?.includes(normalized)
  );
}

export function getProgramByMajorCode(code: string): Program | undefined {
  return programs.find((p) => p.majorCode === code);
}
