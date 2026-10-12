/**
 * Dữ liệu hiện hữu theo khóa 2026; phép tính là dự toán theo giả định tín chỉ.
 * Đơn giá/phí/Talent/Leadership/Cooperation đối chiếu topicauni.edu.vn ngày 12/10/2026.
 * Điều kiện hồ sơ và thông báo mới hơn cần được xác nhận trước khi thanh toán.
 * Đơn vị cấp bằng: Trường Đại học Phú Xuân (PXU) - Thành viên Tập đoàn Giáo dục EQuest
 * Đơn vị triển khai: Viện Đào tạo Quốc tế Topica
 */

import {
  ProgramId,
  TargetAudienceId,
  PROGRAM_ID_MAP,
  getProgramById,
  TARGET_AUDIENCE_DEFAULTS,
} from "@/data/programs";

export interface ProgramTuition {
  id: ProgramId;
  programName: string;
  slug: string;
  majorCode: string;
  credits: number;
  pricePerCredit: number;
  totalTuition: number;
  semesters: number;
  tuitionPerSemester: number;
  degreeAwarded: string;
  awardingInstitution: string;
  group: "business" | "technology" | "language";
  cohort?: string;
  currency?: "VND";
  note?: string;
}

export interface ScholarshipPolicy {
  id: string;
  title: string;
  percentage: string;
  percentageValue: number;
  scope: "full_course" | "first_year";
  highlight?: boolean;
  tag?: string;
  description: string;
  criteria: string;
  source: string;
}

export interface TuitionRule {
  title: string;
  description: string;
}

export const OFFICIAL_TUITION_PROGRAMS: readonly ProgramTuition[] = [
  {
    id: "ba",
    programName: "Quản trị kinh doanh",
    slug: "quan-tri-kinh-doanh-marketing",
    majorCode: "7340101",
    credits: 126,
    pricePerCredit: 600000,
    totalTuition: 75600000,
    semesters: 9,
    tuitionPerSemester: 8400000,
    degreeAwarded: "Cử nhân Quản trị kinh doanh",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "business",
    cohort: "2026",
    currency: "VND",
    note: "Không bao gồm khối kiến thức GDTC và GDQP&AN",
  },
  {
    id: "tourism",
    programName: "Quản trị du lịch và lữ hành",
    slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
    majorCode: "7810103",
    credits: 126,
    pricePerCredit: 600000,
    totalTuition: 75600000,
    semesters: 9,
    tuitionPerSemester: 8400000,
    degreeAwarded: "Cử nhân Quản trị dịch vụ du lịch và lữ hành",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "business",
    cohort: "2026",
    currency: "VND",
    note: "Bao gồm định hướng Quản trị lữ hành và Quản trị khách sạn",
  },
  {
    id: "it",
    programName: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
    slug: "cong-nghe-thong-tin",
    majorCode: "7480201",
    credits: 126,
    pricePerCredit: 600000,
    totalTuition: 75600000,
    semesters: 9,
    tuitionPerSemester: 8400000,
    degreeAwarded: "Cử nhân Công nghệ thông tin",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "technology",
    cohort: "2026",
    currency: "VND",
    note: "Bao gồm phòng lab thực hành ảo và học liệu số chuyên sâu",
  },
  {
    id: "english",
    programName: "Ngôn ngữ Anh",
    slug: "ngon-ngu-anh",
    majorCode: "7220201",
    credits: 126,
    pricePerCredit: 600000,
    totalTuition: 75600000,
    semesters: 9,
    tuitionPerSemester: 8400000,
    degreeAwarded: "Cử nhân Ngôn ngữ Anh",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "language",
    cohort: "2026",
    currency: "VND",
    note: "Định hướng Tiếng Anh thương mại & Tiếng Anh du lịch - khách sạn",
  },
  {
    id: "chinese",
    programName: "Ngôn ngữ Trung Quốc",
    slug: "ngon-ngu-trung-quoc",
    majorCode: "7220204",
    credits: 126,
    pricePerCredit: 600000,
    totalTuition: 75600000,
    semesters: 9,
    tuitionPerSemester: 8400000,
    degreeAwarded: "Cử nhân Ngôn ngữ Trung Quốc",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "language",
    cohort: "2026",
    currency: "VND",
    note: "Định hướng Tiếng Trung thương mại & Tiếng Trung du lịch, chuẩn HSK",
  },
] as const;

export const ADMISSION_FEES = {
  admissionFee: 80000, // Lệ phí xét tuyển/hồ sơ theo thông báo tuyển sinh 2026 đợt 2.
  healthInsurance: "Theo quy định hiện hành của Nhà nước",
  materialsFee: "Liên hệ để xác nhận các khoản áp dụng theo hồ sơ",
  retakeFee: "Theo đơn giá tín chỉ niêm yết tại thời điểm đăng ký học lại",
} as const;

export const SCHOLARSHIPS: readonly ScholarshipPolicy[] = [
  {
    id: "talent",
    title: "Học bổng Tài năng (Talent Scholarship)",
    percentage: "30%",
    percentageValue: 0.3,
    scope: "full_course",
    tag: "Đặc biệt",
    description: "Ưu đãi học phí toàn chương trình cho sinh viên mới.",
    criteria: "Nhập học trước 31/12/2026; phụ thuộc suất còn lại và thông báo điều chỉnh.",
    source:
      "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
  },
  {
    id: "leadership",
    title: "Học bổng Topica Leadership",
    percentage: "20%",
    percentageValue: 0.2,
    scope: "full_course",
    description: "Ưu đãi học phí toàn chương trình.",
    criteria: "Sau khi hết suất Talent và nhập học trước 31/01/2027; cần xác nhận suất áp dụng.",
    source:
      "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
  },
  {
    id: "cooperation",
    title: "Học bổng Topica Cooperation",
    percentage: "40%",
    percentageValue: 0.4,
    scope: "full_course",
    description: "Ưu đãi học phí toàn chương trình theo đối tượng.",
    criteria:
      "Người làm trong giáo dục hoặc quản lý doanh nghiệp từ cấp phó phòng; cần giấy xác nhận.",
    source:
      "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
  },
] as const;

export const TUITION_COMMITMENTS: readonly TuitionRule[] = [
  {
    title: "Đóng theo tín chỉ thực học",
    description:
      "Sinh viên đóng học phí theo từng học kỳ dựa trên số lượng tín chỉ thực tế đăng ký, giúp chủ động quản lý kế hoạch tài chính cá nhân.",
  },
  {
    title: "Xác nhận trước khi thanh toán",
    description:
      "Đề nghị nhận bảng dự toán theo khóa, ngành và hồ sơ công nhận tín chỉ của bạn trước khi thanh toán.",
  },
  {
    title: "Điều kiện học bổng rõ ràng",
    description:
      "Quyền lợi phụ thuộc hồ sơ, thời điểm và thông báo đang áp dụng. Liên hệ tuyển sinh để xác nhận suất và điều kiện kết hợp ưu đãi.",
  },
] as const;

/**
 * Chính sách học phí theo khóa tuyển sinh và đối tượng người học
 */
export interface AudiencePricing {
  credits: number;
  semesters: number;
  tuitionPerSemester: number;
  totalTuition: number;
}

export interface CohortTuitionPolicy {
  cohort: string;
  effectiveFrom: string;
  effectiveTo: string;
  pricePerCredit: number;
  currency: "VND";
  status: "active" | "archived" | "draft";
  sourceDocument: string;
}

export const COHORT_2026_POLICY: CohortTuitionPolicy = {
  cohort: "2026",
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  pricePerCredit: 600000,
  currency: "VND",
  status: "active",
  sourceDocument: "Đề án Tuyển sinh & Biểu mức thu học phí năm 2026 — ĐH Phú Xuân",
};

export const SUPPORTED_COHORTS: readonly string[] = ["2026"];

export interface TuitionCalculationParams {
  programId: string;
  audienceId?: TargetAudienceId;
  scholarshipId?: string;
  cohort?: string;
}

export interface TuitionCalculationResult {
  programId: ProgramId;
  programName: string;
  officialMajorName: string;
  majorCode: string;
  cohort: string;
  audienceId: TargetAudienceId;
  audienceName: string;
  credits: number;
  pricePerCredit: number;
  baseTotalTuition: number;
  discountPercentText?: string;
  discountAmount: number;
  netTotalTuition: number;
  semesters: number;
  tuitionPerSemester: number;
  currency: "VND";
  degreeAwarded: string;
  awardingInstitution: string;
  scholarshipApplied?: ScholarshipPolicy;
  isOfficialPolicy: boolean;
  notes: string[];
}

/**
 * Tính toán học phí chi tiết theo chương trình, đối tượng đầu vào và chính sách học bổng.
 * QUY TẮC NGHIỆM THU R05: Nếu cohort hoặc policy không tồn tại, trả về null (KHÔNG fallback ngầm).
 */
export function calculateProgramTuition(
  params: TuitionCalculationParams,
): TuitionCalculationResult | null {
  const cohort = params.cohort ?? "2026";
  if (!SUPPORTED_COHORTS.includes(cohort)) {
    // Không tự fallback sang giá của khóa khác khi khóa yêu cầu không tồn tại
    return null;
  }

  const resolvedProgramId = PROGRAM_ID_MAP[params.programId];
  if (!resolvedProgramId) {
    return null;
  }

  const program = getProgramById(resolvedProgramId);
  if (!program) {
    return null;
  }

  const audienceId = params.audienceId ?? "thpt";
  const audienceTrack = program.targetAudiences.find((a) => a.audienceId === audienceId);
  if (!audienceTrack) {
    return null;
  }

  const pricePerCredit = COHORT_2026_POLICY.pricePerCredit;
  const credits = audienceTrack.estimatedCredits;
  const baseTotalTuition = credits * pricePerCredit;
  const semesters = audienceTrack.durationSemesters;

  let discountAmount = 0;
  let scholarshipApplied: ScholarshipPolicy | undefined = undefined;

  if (params.scholarshipId) {
    scholarshipApplied = SCHOLARSHIPS.find((s) => s.id === params.scholarshipId);
    if (!scholarshipApplied) {
      // Học bổng không tồn tại -> Không tính toán theo giả định sai
      return null;
    }

    if (scholarshipApplied.scope === "full_course") {
      discountAmount = Math.round(baseTotalTuition * scholarshipApplied.percentageValue);
    } else if (scholarshipApplied.scope === "first_year") {
      // 50% năm học đầu tiên: tương đương 2 học kỳ
      const firstYearTuition = Math.round((baseTotalTuition / semesters) * 2);
      discountAmount = Math.round(firstYearTuition * scholarshipApplied.percentageValue);
    }
  }

  const netTotalTuition = Math.max(0, baseTotalTuition - discountAmount);
  const tuitionPerSemester = Math.round(netTotalTuition / semesters);

  const notes: string[] = [
    `Đơn giá niêm yết: ${new Intl.NumberFormat("vi-VN").format(pricePerCredit)} đ/tín chỉ`,
    `Hình thức đào tạo: ${program.trainingMode}`,
    `Đơn vị cấp bằng: ${program.awardingInstitution}`,
  ];

  if (audienceId === "thpt") {
    notes.push("Không bao gồm học phí khối kiến thức GDTC và GDQP&AN");
  } else {
    notes.push(TARGET_AUDIENCE_DEFAULTS[audienceId].description);
  }

  return {
    programId: resolvedProgramId,
    programName: program.name,
    officialMajorName: program.officialMajorName,
    majorCode: program.majorCode,
    cohort,
    audienceId,
    audienceName: audienceTrack.audienceName,
    credits,
    pricePerCredit,
    baseTotalTuition,
    discountPercentText: scholarshipApplied?.percentage,
    discountAmount,
    netTotalTuition,
    semesters,
    tuitionPerSemester,
    currency: "VND",
    degreeAwarded: program.degreeAwarded,
    awardingInstitution: program.awardingInstitution,
    scholarshipApplied,
    isOfficialPolicy: true,
    notes,
  };
}
