import type { CurriculumGroup, ProgramCourse, ProgramDetail } from "@/data/program-details";

type PlanCourse = {
  code: string;
  name: string;
  credits: number;
  requirement?: ProgramCourse["requirement"];
  detail?: string;
  note?: string;
  prerequisite?: string;
};

type PlanTerm = {
  credits: number;
  phase: string;
  selection?: string;
  courses: PlanCourse[];
};

const c = (
  code: string,
  name: string,
  credits: number,
  extra: Omit<PlanCourse, "code" | "name" | "credits"> = {},
): PlanCourse => ({ code, name, credits, ...extra });

const buildPlan = (prefix: string, terms: PlanTerm[]) => ({
  curriculum: terms.map<CurriculumGroup>((term, termIndex) => ({
    id: `${prefix}-term-${termIndex + 1}`,
    name: `Học kỳ ${termIndex + 1}`,
    credits: term.credits,
    selection: term.selection,
    courses: term.courses.map((item, itemIndex) => ({
      id: `${prefix}-${termIndex + 1}-${itemIndex + 1}-${item.code}`,
      code: item.code,
      name: item.name,
      credits: item.credits,
      requirement: item.requirement ?? "Bắt buộc",
      detail: item.detail,
      note: item.note,
      prerequisite: item.prerequisite,
    })),
  })),
  semesters: terms.map((term, index) => ({
    term: index + 1,
    credits: term.credits,
    phase: term.phase,
    highlights: [
      ...term.courses.slice(0, 3).map((item) => item.name),
      ...(term.selection ? [term.selection] : []),
    ],
  })),
});

const nonAccumulated = (prefix: string): CurriculumGroup => ({
  id: `${prefix}-non-accumulated`,
  name: "Khối kiến thức không tích lũy",
  credits: null,
  courses: [
    {
      id: `${prefix}-dse-701`,
      code: "DSE.7.01",
      name: "Giáo dục quốc phòng và an ninh",
      credits: null,
      requirement: "Không tích lũy",
    },
    ...[1, 2, 3].map<ProgramCourse>((level) => ({
      id: `${prefix}-phe-70${level}`,
      code: `PHE.7.0${level}`,
      name: `Giáo dục thể chất ${level}`,
      credits: 1,
      requirement: "Không tích lũy",
    })),
  ],
});

type StandardFactsInput = {
  code?: string | null;
  degree?: string;
  deliveryMode?: string;
  award?: string;
  duration?: string;
  credits?: string;
  creditsNote?: string;
  language?: string;
  courseCount?: string;
  courseCountNote?: string;
};

const standardProgramFacts = (input: StandardFactsInput = {}): ProgramDetail["facts"] => [
  {
    label: "Mã ngành",
    value: input.code ?? "Cần cập nhật",
    note: input.code ? undefined : "Chưa có mã ngành trong bộ dữ liệu đang dùng",
    status: input.code ? "verified" : "need_confirmation",
  },
  { label: "Trình độ", value: input.degree ?? "Đại học", status: "verified" },
  { label: "Hình thức", value: input.deliveryMode ?? "Chính quy", status: "verified" },
  { label: "Văn bằng", value: input.award ?? "Cử nhân", status: "verified" },
  { label: "Thời gian", value: input.duration ?? "3 năm · 9 học kỳ", status: "verified" },
  {
    label: "Khối lượng",
    value: input.credits ?? "126 tín chỉ",
    note: input.creditsNote ?? "Không gồm Giáo dục thể chất và Giáo dục quốc phòng và an ninh",
    status: "verified",
  },
  {
    label: "Ngôn ngữ",
    value: input.language ?? "Tiếng Việt",
    status: "verified",
  },
  {
    label: "Tổng học phần",
    value: input.courseCount ?? "Cần cập nhật",
    note: input.courseCountNote ?? "Sẽ cập nhật sau khi chốt bộ dữ liệu học phần cuối cùng",
    status: input.courseCount ? "verified" : "need_confirmation",
  },
];

const tourismTerms: PlanTerm[] = [
  {
    credits: 11,
    phase: "Nhập môn ngành",
    courses: [
      c("ORI.7.01", "Nhập môn nghề nghiệp", 2),
      c("IDT.7.01", "Nhập môn công nghệ số", 3),
      c("TTS.7.01", "Cơ sở văn hóa Việt Nam", 3),
      c("TTS.7.02", "Tổng quan du lịch", 3),
    ],
  },
  {
    credits: 12,
    phase: "Nền tảng quản trị",
    courses: [
      c("FOL.7.01", "Ngoại ngữ 1", 3),
      c("ETS.7.01", "Ứng dụng trí tuệ nhân tạo", 3),
      c("BUA.7.04", "Quản trị học", 3),
      c("BUA.7.07", "Hành vi người tiêu dùng", 3),
    ],
  },
  {
    credits: 11,
    phase: "Cơ sở ngành",
    selection: "Chọn 1 trong 3 học phần tự chọn (3 tín chỉ)",
    courses: [
      c("FOL.7.02", "Ngoại ngữ 2", 3, { prerequisite: "FOL.7.01" }),
      c("LAW.7.01", "Pháp luật đại cương", 2),
      c("TTS.7.03", "Kinh tế du lịch", 3),
      c("TTS.7.06", "Tôn giáo, tín ngưỡng, lễ hội Việt Nam", 3, {
        requirement: "Tự chọn",
      }),
      c("TTS.7.08", "Luật du lịch", 3, { requirement: "Tự chọn" }),
      c("TTS.7.09", "Lịch sử Việt Nam", 3, { requirement: "Tự chọn" }),
    ],
  },
  {
    credits: 15,
    phase: "Nghiệp vụ du lịch",
    selection: "Chọn 1 trong 3 học phần tự chọn (3 tín chỉ)",
    courses: [
      c("POL.7.01", "Triết học Mác-Lênin", 3),
      c("FOL.7.03", "Ngoại ngữ 3", 3, { prerequisite: "FOL.7.02" }),
      c("ESS.7.01", "Quản trị bản thân", 3),
      c("TTS.7.12", "Quản trị doanh thu trong du lịch", 3),
      c("TTS.7.16", "Kỹ năng hoạt náo và nghệ thuật xử lý tình huống trong du lịch", 3, {
        requirement: "Tự chọn",
      }),
      c("TTS.7.29", "Quy hoạch du lịch", 3, { requirement: "Tự chọn" }),
      c("TTS.7.19", "Văn hóa ẩm thực Việt Nam", 3, { requirement: "Tự chọn" }),
    ],
  },
  {
    credits: 14,
    phase: "Công nghệ và bền vững",
    courses: [
      c("POL.7.02", "Kinh tế chính trị Mác-Lênin", 2, { prerequisite: "POL.7.01" }),
      c("TTS.7.13", "Du lịch bền vững", 3),
      c("TTS.7.05", "Tiếng Anh chuyên ngành 1", 3),
      c("EBS.7.01", "Marketing ứng dụng", 3),
      c("TTS.7.14", "Ứng dụng công nghệ trong du lịch", 3),
    ],
  },
  {
    credits: 16,
    phase: "Định hướng chuyên sâu",
    selection: "Chọn định hướng Quản trị lữ hành hoặc Quản trị khách sạn",
    courses: [
      c("POL.7.03", "Chủ nghĩa xã hội khoa học", 2, { prerequisite: "POL.7.01" }),
      c("EBS.7.02", "Kỹ năng bán hàng và đàm phán trong kinh doanh", 3),
      c("TTS.7.15", "Tiếng Anh chuyên ngành 2", 3),
      c("TTS.7.20", "Địa lý du lịch", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("TTS.7.21", "Hệ thống tuyến điểm du lịch", 2, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("TTS.7.26", "Thực tế ngành", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("THM.7.04", "Quản trị kinh doanh lưu trú", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
      c("THM.7.05", "Quản trị dạ tiệc, hội nghị", 2, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
      c("THM.7.06", "Kiến tập doanh nghiệp", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
    ],
  },
  {
    credits: 16,
    phase: "Kinh doanh du lịch",
    selection: "Học phần chuyên ngành theo định hướng đã chọn",
    courses: [
      c("POL.7.04", "Tư tưởng Hồ Chí Minh", 2, { prerequisite: "POL.7.01" }),
      c("REM.7.01", "Phương pháp nghiên cứu khoa học", 2),
      c("EBS.7.03", "Khởi nghiệp đổi mới sáng tạo", 3),
      c("DMC.7.09", "Marketing kỹ thuật số", 3),
      c("DBA.7.05", "Thương mại điện tử", 3),
      c("TTS.7.24", "Nghiệp vụ hướng dẫn du lịch", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("THM.7.03", "Quản trị nhà hàng và bar", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
    ],
  },
  {
    credits: 13,
    phase: "Hoàn thiện chuyên ngành",
    selection: "Học phần chuyên ngành và tự chọn theo định hướng",
    courses: [
      c("POL.7.05", "Lịch sử Đảng Cộng sản Việt Nam", 2, { prerequisite: "POL.7.01" }),
      c("JSL.7.01", "Kỹ năng tìm việc và hội nhập doanh nghiệp", 2),
      c("TTS.7.22", "Thiết kế và điều hành tour", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("TTS.7.25", "Quản trị kinh doanh lữ hành", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị lữ hành",
      }),
      c("TTS.7.27", "Du lịch sinh thái và cộng đồng", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn định hướng Quản trị lữ hành",
      }),
      c("TTS.7.28", "Quản lý điểm đến", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn định hướng Quản trị lữ hành",
      }),
      c("TTS.7.11", "Quản trị chất lượng dịch vụ trong du lịch", 3, {
        requirement: "Tự chọn",
      }),
      c("DBA.7.03", "Trí tuệ nhân tạo trong kinh doanh số", 3, {
        requirement: "Tự chọn",
      }),
      c("THM.7.01", "Quản trị lễ tân", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
      c("THM.7.02", "Quản trị buồng phòng", 3, {
        requirement: "Tự chọn",
        detail: "Định hướng Quản trị khách sạn",
      }),
      c("THM.7.07", "Quản trị dự án khách sạn", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn định hướng Quản trị khách sạn",
      }),
    ],
  },
  {
    credits: 18,
    phase: "Thực tập và tốt nghiệp",
    courses: [c("AET.7.23", "Thực tập doanh nghiệp", 9), c("AET.7.24", "Khóa luận tốt nghiệp", 9)],
  },
];

const tourismPlan = buildPlan("tourism", tourismTerms);

export const tourismProgram: ProgramDetail = {
  slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
  officialName: "Quản trị dịch vụ du lịch và lữ hành",
  englishName: "Tourism and Travel Services Management",
  marketingLabel: "Quản trị lữ hành · Quản trị khách sạn",
  code: "7810103",
  summary:
    "Chương trình định hướng ứng dụng, đào tạo năng lực tổ chức, quản lý, phân tích và phát triển hoạt động kinh doanh du lịch trong bối cảnh số.",
  heroLabel: "Chương trình đào tạo đại học · Định hướng ứng dụng",
  evidenceLevel: "academic_source",
  source: {
    label: "CTĐT DL 2026-FINAL-XÁC NHẬN (24.8.2026).docx",
    reference: "Phần 1–5; Bảng 3, 5, 6 và 13",
    reviewedAt: "28/08/2026",
  },
  facts: standardProgramFacts({
    code: "7810103",
    language: "Tiếng Việt",
    courseCount: "57 học phần",
    courseCountNote: "Theo số học phần được đánh số trong bảng chương trình đào tạo 2026",
  }),
  curriculum: [...tourismPlan.curriculum, nonAccumulated("tourism")],
  semesters: tourismPlan.semesters,
  outcomes: [
    {
      code: "PLO1",
      title: "Kiến thức nền tảng",
      description:
        "Vận dụng kiến thức chính trị, pháp luật, thể chất, quốc phòng – an ninh, công nghệ thông tin và ngoại ngữ vào cuộc sống và công việc.",
    },
    {
      code: "PLO2",
      title: "Kiến thức liên ngành",
      description:
        "Áp dụng kiến thức về trí tuệ nhân tạo, kinh doanh, marketing, khởi nghiệp, đổi mới sáng tạo và quản trị bản thân để phát triển sự nghiệp.",
    },
    {
      code: "PLO3",
      title: "Nghiệp vụ du lịch – khách sạn",
      description:
        "Vận dụng kiến thức cơ sở ngành, ngành và chuyên ngành quản trị dịch vụ du lịch, lữ hành và khách sạn vào công việc thực tế.",
    },
    {
      code: "PLO4",
      title: "Thị trường và công nghệ",
      description:
        "Phân tích xu hướng thị trường du lịch và áp dụng công cụ, công nghệ để phát triển hoạt động kinh doanh.",
    },
    {
      code: "PLO5",
      title: "Đánh giá cơ hội",
      description: "Đánh giá vấn đề và cơ hội của lĩnh vực du lịch trong bối cảnh toàn cầu hóa.",
    },
    {
      code: "PLO6",
      title: "Sáng tạo phương án kinh doanh",
      description:
        "Thiết kế sản phẩm, dự án du lịch bền vững và đề án khởi nghiệp trong lĩnh vực du lịch.",
    },
    {
      code: "PLO7",
      title: "Kỹ năng nghề nghiệp",
      description:
        "Hoàn thiện kỹ năng công nghệ, ngoại ngữ, kinh doanh, tư duy phản biện và khởi nghiệp trong bối cảnh toàn cầu hóa.",
    },
    {
      code: "PLO8",
      title: "Quản trị dịch vụ du lịch",
      description:
        "Phân tích, lập kế hoạch, triển khai và đánh giá hiệu quả hoạt động quản trị dịch vụ du lịch theo nhu cầu thị trường lao động.",
    },
    {
      code: "PLO9",
      title: "Giao tiếp và học tập suốt đời",
      description: "Phát triển kỹ năng giao tiếp, làm việc nhóm, tự học và học tập suốt đời.",
    },
    {
      code: "PLO10",
      title: "Đạo đức và trách nhiệm",
      description:
        "Tuân thủ pháp luật và đạo đức nghề nghiệp; tự chủ và có trách nhiệm với bản thân, gia đình và xã hội.",
    },
  ],
  careers: [
    "Doanh nghiệp và tổ chức phi chính phủ hoạt động trong lĩnh vực du lịch.",
    "Cơ quan quản lý nhà nước phù hợp với ngành du lịch.",
    "Cơ sở đào tạo và viện nghiên cứu chuyên ngành du lịch.",
  ],
  furtherStudy:
    "Có thể học tiếp chương trình thạc sĩ, tiến sĩ trong nước hoặc tham gia chương trình sau đại học ở nước ngoài.",
  admissions:
    "Thí sinh đã tốt nghiệp THPT, đáp ứng quy định của Bộ Giáo dục và Đào tạo và điều kiện tuyển sinh của Trường Đại học Phú Xuân.",
  graduation: "Theo Điều 14, Thông tư số 08/2021/TT-BGDĐT.",
  confirmations: [
    "Bảng 6 dùng mã BUA.7.21/BUA.7.22 cho Thực tập doanh nghiệp và Khóa luận tốt nghiệp; Bảng 13 dùng AET.7.23/AET.7.24. Giao diện ưu tiên mã trong kế hoạch học kỳ (Bảng 13).",
  ],
};

const informationTechnologyTerms: PlanTerm[] = [
  {
    credits: 15,
    phase: "Nền tảng công nghệ",
    courses: [
      c("INT.7.01", "Cơ sở lập trình", 3),
      c("ORI.7.01", "Nhập môn nghề nghiệp", 2),
      c("INT.7.03", "Quản trị mạng", 4),
      c("BIT.7.01", "Ứng dụng công nghệ thông tin cơ bản", 3),
      c("DIG.7.01", "Cơ sở thiết kế đồ họa", 3),
    ],
  },
  {
    credits: 13,
    phase: "Lập trình và dữ liệu",
    courses: [
      c("FOL.7.01", "Ngoại ngữ 1", 3),
      c("ETS.7.01", "Ứng dụng trí tuệ nhân tạo", 3),
      c("INT.7.04", "Phân tích và thiết kế cơ sở dữ liệu", 4),
      c("INT.7.02", "Lập trình hướng đối tượng", 3),
    ],
  },
  {
    credits: 11,
    phase: "Mỹ thuật và thiết kế",
    courses: [
      c("LAW.7.01", "Pháp luật đại cương", 2),
      c("FOL.7.02", "Ngoại ngữ 2", 3),
      c("DIG.7.11", "Vẽ mỹ thuật 1", 3),
      c("DIG.7.08", "Lịch sử thiết kế", 3),
    ],
  },
  {
    credits: 15,
    phase: "Ngôn ngữ thị giác",
    courses: [
      c("POL.7.01", "Triết học Mác-Lênin", 3),
      c("FOL.7.03", "Ngoại ngữ 3", 3),
      c("DIG.7.12", "Nghệ thuật chữ", 3),
      c("DIG.7.15", "Đồ họa ảnh", 3),
      c("DIG.7.09", "Thiết kế và xử lý ảnh", 3),
    ],
  },
  {
    credits: 14,
    phase: "Thiết kế số",
    courses: [
      c("POL.7.02", "Kinh tế chính trị Mác-Lênin", 2),
      c("EBS.7.01", "Marketing ứng dụng", 3),
      c("DIG.7.16", "Thiết kế logo và catalogue", 3),
      c("DIG.7.17", "Thiết kế giao diện website", 3),
      c("DIG.7.10", "Vẽ mỹ thuật 2", 3),
    ],
  },
  {
    credits: 14,
    phase: "Thiết kế game",
    courses: [
      c("POL.7.03", "Chủ nghĩa xã hội khoa học", 2),
      c("EBS.7.02", "Kỹ năng bán hàng và đàm phán trong kinh doanh", 3),
      c("DIG.7.18", "Thiết kế đồ họa game 2D", 3),
      c("DIG.7.19", "Thiết kế mô hình game 3D", 3),
      c("DIG.7.20", "Thiết kế nhân vật", 3),
    ],
  },
  {
    credits: 13,
    phase: "Thiết kế ứng dụng",
    courses: [
      c("POL.7.04", "Tư tưởng Hồ Chí Minh", 2),
      c("REM.7.01", "Phương pháp nghiên cứu khoa học", 2),
      c("ESS.7.01", "Quản trị bản thân", 3),
      c("EBS.7.03", "Khởi nghiệp đổi mới sáng tạo", 3),
      c("DIG.7.23", "Thiết kế poster", 3),
    ],
  },
  {
    credits: 13,
    phase: "Đồ họa chuyển động",
    courses: [
      c("POL.7.05", "Lịch sử Đảng Cộng sản Việt Nam", 2),
      c("JSL.7.01", "Kỹ năng tìm việc và hội nhập doanh nghiệp", 2),
      c("DIG.7.21", "Xử lý phim", 3),
      c("DIG.7.25", "Thiết kế đồ họa động với 3D", 3),
      c("DIG.7.22", "Thiết kế hệ thống nhận diện thương hiệu", 3),
    ],
  },
  {
    credits: 18,
    phase: "Thực tập và tốt nghiệp",
    courses: [c("IND.7.30", "Thực tập doanh nghiệp", 9), c("IND.7.31", "Khóa luận tốt nghiệp", 9)],
  },
];

const englishLanguageTerms: PlanTerm[] = [
  {
    credits: 13,
    phase: "Nhập môn ngôn ngữ",
    selection: "Chọn 1 trong 3 học phần tự chọn (3 tín chỉ)",
    courses: [
      c("ORI.7.01", "Nhập môn nghề nghiệp", 2),
      c("BIT.7.01", "Ứng dụng công nghệ thông tin cơ bản", 3),
      c("FOL.7.01", "Ngoại ngữ 1", 3),
      c("ENL.7.07", "Ngữ âm thực hành", 2),
      c("ENL.7.08", "Ngữ pháp Tiếng Anh", 3, { requirement: "Tự chọn" }),
      c("ENL.7.09", "Biên dịch 1", 3, { requirement: "Tự chọn" }),
      c("ENL.7.10", "Dẫn luận ngôn ngữ", 3, { requirement: "Tự chọn" }),
    ],
  },
  {
    credits: 15,
    phase: "Bốn kỹ năng cơ bản",
    courses: [
      c("ETS.7.01", "Ứng dụng trí tuệ nhân tạo", 3),
      c("FOL.7.02", "Ngoại ngữ 2", 3),
      c("ENL.7.01", "Đọc 1", 3),
      c("ENL.7.02", "Viết 1", 3),
      c("ENL.7.03", "Giao tiếp 1", 3),
    ],
  },
  {
    credits: 11,
    phase: "Phát triển ngôn ngữ",
    courses: [
      c("LAW.7.01", "Pháp luật đại cương", 2),
      c("FOL.7.03", "Ngoại ngữ 3", 3),
      c("ENL.7.04", "Đọc 2", 3),
      c("ENL.7.06", "Giao tiếp 2", 3),
    ],
  },
  {
    credits: 15,
    phase: "Giao tiếp học thuật",
    courses: [
      c("POL.7.01", "Triết học Mác-Lênin", 3),
      c("ESS.7.01", "Quản trị bản thân", 3),
      c("ENL.7.11", "Đọc 3", 3),
      c("ENL.7.05", "Viết 2", 3),
      c("ENL.7.13", "Giao tiếp 3", 3),
    ],
  },
  {
    credits: 14,
    phase: "Nâng cao kỹ năng",
    courses: [
      c("POL.7.02", "Kinh tế chính trị Mác-Lênin", 2),
      c("EBS.7.01", "Marketing ứng dụng", 3),
      c("ENL.7.15", "Viết 4", 3),
      c("ENL.7.12", "Viết 3", 3),
      c("ENL.7.14", "Đọc 4", 3),
    ],
  },
  {
    credits: 14,
    phase: "Giao tiếp liên văn hóa",
    selection: "Chọn 1 trong 2 học phần tự chọn (3 tín chỉ)",
    courses: [
      c("EBS.7.02", "Kỹ năng bán hàng và đàm phán trong kinh doanh", 3),
      c("POL.7.03", "Chủ nghĩa xã hội khoa học", 2),
      c("ENL.7.16", "Giao tiếp 4", 3),
      c("ENL.7.17", "Văn hóa Anh – Mỹ", 3),
      c("ENL.7.18", "Giao thoa văn hóa", 3, { requirement: "Tự chọn" }),
      c("ENL.7.19", "Diễn thuyết trước công chúng", 3, { requirement: "Tự chọn" }),
    ],
  },
  {
    credits: 16,
    phase: "Định hướng chuyên ngành",
    selection: "Chọn 1 học phần ngôn ngữ và một định hướng chuyên ngành",
    courses: [
      c("POL.7.04", "Tư tưởng Hồ Chí Minh", 2),
      c("REM.7.01", "Phương pháp nghiên cứu khoa học", 2),
      c("EBS.7.03", "Khởi nghiệp đổi mới sáng tạo", 3),
      c("ENL.7.20", "Biên dịch 2", 3, { requirement: "Tự chọn" }),
      c("ENL.7.21", "Hình thái – Cú pháp", 3, { requirement: "Tự chọn" }),
      c("BUE.7.01", "Tiếng Anh thương mại 1", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh thương mại",
      }),
      c("BUE.7.02", "Tiếng Anh thương mại 2", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh thương mại",
      }),
      c("ETR.7.01", "Tiếng Anh du lịch 1", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
      c("ETR.7.02", "Tiếng Anh khách sạn", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
    ],
  },
  {
    credits: 13,
    phase: "Chuyên sâu nghề nghiệp",
    selection: "Học phần theo chuyên ngành và chọn 1 học phần tự chọn",
    courses: [
      c("POL.7.05", "Lịch sử Đảng Cộng sản Việt Nam", 2),
      c("JSL.7.01", "Kỹ năng tìm việc và hội nhập doanh nghiệp", 2),
      c("BUE.7.02", "Tiếng Anh thương mại 3", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh thương mại",
        note: "Mã BUE.7.02 cũng được dùng cho Tiếng Anh thương mại 2 ở học kỳ 7 trong ảnh nguồn",
      }),
      c("BUE.7.03", "Tiếng Anh chuyên ngành marketing", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh thương mại",
      }),
      c("BUE.7.04", "Tiếng Anh chuyên ngành kế toán", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh thương mại",
      }),
      c("BUE.7.05", "Tiếng Anh tài chính ngân hàng", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh thương mại",
      }),
      c("BUE.7.06", "Phiên dịch thương mại", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh thương mại",
      }),
      c("ETR.7.03", "Tiếng Anh nhà hàng", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
      c("ETR.7.04", "Tiếng Anh du lịch 2", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
      c("TTS.7.02", "Tổng quan du lịch", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
      c("ETR.7.04", "Tiếng Anh cảnh điểm du lịch Huế", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh du lịch, nhà hàng, khách sạn",
        note: "Mã ETR.7.04 cũng được dùng cho Tiếng Anh du lịch 2 trong ảnh nguồn",
      }),
      c("TTS.7.28", "Quản lý điểm đến", 3, {
        requirement: "Tự chọn",
        detail: "Tự chọn Tiếng Anh du lịch, nhà hàng, khách sạn",
      }),
    ],
  },
  {
    credits: 15,
    phase: "Thực tập và tốt nghiệp",
    courses: [c("ENL.7.22", "Thực tập doanh nghiệp", 9), c("ENL.7.23", "Khóa luận tốt nghiệp", 6)],
  },
];

const chineseLanguageTerms: PlanTerm[] = [
  {
    credits: 13,
    phase: "Nhập môn tiếng Trung",
    courses: [
      c("ORI.7.01", "Nhập môn nghề nghiệp", 2),
      c("BIT.7.01", "Ứng dụng công nghệ thông tin cơ bản", 3),
      c("CHL.7.01", "Ngữ âm – Văn tự", 2),
      c("CHL.7.04", "Đọc 1", 3),
      c("CHL.7.05", "Viết 1", 3),
    ],
  },
  {
    credits: 15,
    phase: "Bốn kỹ năng cơ bản",
    courses: [
      c("FOL.7.01", "Ngoại ngữ 1", 3),
      c("ETS.7.01", "Ứng dụng trí tuệ nhân tạo", 3),
      c("CHL.7.02", "Nghe 1", 3),
      c("CHL.7.03", "Nói 1", 3),
      c("CHL.7.08", "Đọc 2", 3),
    ],
  },
  {
    credits: 11,
    phase: "Phát triển ngôn ngữ",
    courses: [
      c("FOL.7.02", "Ngoại ngữ 2", 3),
      c("LAW.7.01", "Pháp luật đại cương", 2),
      c("CHL.7.09", "Viết 2", 3),
      c("CHL.7.06", "Nghe 2", 3),
    ],
  },
  {
    credits: 15,
    phase: "Kỹ năng nâng cao",
    courses: [
      c("POL.7.01", "Triết học Mác-Lênin", 3),
      c("FOL.7.03", "Ngoại ngữ 3", 3),
      c("ESS.7.01", "Quản trị bản thân", 3),
      c("CHL.7.13", "Viết nâng cao", 3),
      c("CHL.7.07", "Nói 2", 3),
    ],
  },
  {
    credits: 14,
    phase: "Ngôn ngữ nâng cao",
    courses: [
      c("POL.7.02", "Kinh tế chính trị Mác-Lênin", 2),
      c("EBS.7.01", "Marketing ứng dụng", 3),
      c("CHL.7.10", "Nghe nâng cao", 3),
      c("CHL.7.11", "Nói nâng cao", 3),
      c("CHL.7.12", "Đọc nâng cao", 3),
    ],
  },
  {
    credits: 14,
    phase: "Tiếng Trung tổng hợp",
    courses: [
      c("POL.7.03", "Chủ nghĩa xã hội khoa học", 2),
      c("EBS.7.02", "Kỹ năng bán hàng và đàm phán trong kinh doanh", 3),
      c("CHL.7.14", "Ngữ pháp tiếng Trung cơ bản", 2),
      c("CHL.7.15", "Ngữ pháp tiếng Trung nâng cao", 2),
      c("CHL.7.16", "Tiếng Trung tổng hợp", 3),
      c("CHL.7.17", "HSK trung cấp", 2),
    ],
  },
  {
    credits: 14,
    phase: "Định hướng chuyên ngành",
    selection: "Chọn 2 trong 5 học phần ngôn ngữ và một định hướng chuyên ngành",
    courses: [
      c("POL.7.04", "Tư tưởng Hồ Chí Minh", 2),
      c("REM.7.01", "Phương pháp nghiên cứu khoa học", 2),
      c("EBS.7.03", "Khởi nghiệp đổi mới sáng tạo", 3),
      c("CHL.7.18", "Văn hóa Trung Quốc", 2, { requirement: "Tự chọn" }),
      c("CHL.7.19", "HSK cao cấp", 2, { requirement: "Tự chọn" }),
      c("CHL.7.20", "Viết văn ứng dụng", 2, { requirement: "Tự chọn" }),
      c("CHL.7.21", "Nghệ thuật giao tiếp tiếng Trung", 2, { requirement: "Tự chọn" }),
      c("CHL.7.22", "HSKK trung cấp", 2, { requirement: "Tự chọn" }),
      c("BUC.7.01", "Tiếng Trung thương mại", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Trung thương mại",
      }),
      c("CHT.7.01", "Tiếng Trung du lịch cơ bản", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Trung du lịch",
      }),
    ],
  },
  {
    credits: 15,
    phase: "Chuyên sâu nghề nghiệp",
    selection: "Học phần theo chuyên ngành và chọn 2 trong 5 học phần tự chọn",
    courses: [
      c("POL.7.05", "Lịch sử Đảng Cộng sản Việt Nam", 2),
      c("JSL.7.01", "Kỹ năng tìm việc và hội nhập doanh nghiệp", 2),
      c("BUC.7.02", "Giao tiếp kinh doanh", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Trung thương mại",
      }),
      c("BUC.7.03", "Quảng cáo thương mại", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Trung thương mại",
      }),
      c("BUC.7.04", "Ngôn ngữ văn bản pháp luật", 3, { requirement: "Tự chọn" }),
      c("BUC.7.05", "Thư tín thương mại", 2, { requirement: "Tự chọn" }),
      c("BUC.7.06", "Dịch thuật kinh tế – xã hội", 2, { requirement: "Tự chọn" }),
      c("BUC.7.07", "Tiếng Trung văn phòng", 3, { requirement: "Tự chọn" }),
      c("CHT.7.02", "Tiếng Trung Lễ tân – Khách sạn – Nhà hàng", 3, {
        requirement: "Tự chọn",
        detail: "Chuyên ngành Tiếng Trung du lịch",
      }),
      c("CHT.7.03", "Tiếng Trung cảnh điểm du lịch", 2, { requirement: "Tự chọn" }),
      c("CHT.7.04", "Tiếng Trung du lịch nâng cao", 2, { requirement: "Tự chọn" }),
      c("TTS.7.02", "Tổng quan du lịch", 3, { requirement: "Tự chọn" }),
      c("TTS.7.24", "Nghiệp vụ hướng dẫn du lịch", 3, { requirement: "Tự chọn" }),
    ],
  },
  {
    credits: 15,
    phase: "Thực tập và tốt nghiệp",
    courses: [c("CHL.7.23", "Thực tập doanh nghiệp", 9), c("CHL.7.24", "Khóa luận tốt nghiệp", 6)],
  },
];

type ImageProgramInput = Pick<
  ProgramDetail,
  "slug" | "officialName" | "marketingLabel" | "summary" | "careers"
> & {
  englishName?: string;
  code?: string;
  language?: string;
  courseCount?: string;
  admissions?: string;
  graduation?: string;
  furtherStudy?: string;
  sourceLabel: string;
  planPrefix: string;
  terms: PlanTerm[];
};

const imageProgram = (input: ImageProgramInput): ProgramDetail => {
  const plan = buildPlan(input.planPrefix, input.terms);
  return {
    slug: input.slug,
    officialName: input.officialName,
    englishName: input.englishName ?? null,
    marketingLabel: input.marketingLabel,
    code: input.code ?? null,
    summary: input.summary,
    heroLabel: "Chương trình đào tạo · Kế hoạch 9 học kỳ",
    evidenceLevel: "curriculum_source",
    source: {
      label: input.sourceLabel,
      reference: "bảng chương trình đào tạo 9 học kỳ",
      reviewedAt: "28/08/2026",
    },
    facts: standardProgramFacts({
      code: input.code,
      language: input.language,
      courseCount: input.courseCount,
      creditsNote: "Không gồm Giáo dục thể chất và Giáo dục quốc phòng và an ninh",
    }),
    curriculum: [...plan.curriculum, nonAccumulated(input.planPrefix)],
    semesters: plan.semesters,
    outcomes: [],
    careers: input.careers,
    furtherStudy: input.furtherStudy ?? null,
    admissions: input.admissions ?? null,
    graduation: input.graduation ?? null,
    confirmations: [],
  };
};

export const informationTechnologyProgram = imageProgram({
  slug: "cong-nghe-thong-tin",
  officialName: "Công nghệ thông tin",
  marketingLabel: "Đồ họa kỹ thuật số",
  summary:
    "Chương trình kết hợp nền tảng công nghệ thông tin với thiết kế đồ họa, xử lý ảnh, thiết kế thương hiệu, giao diện website, game 2D/3D và đồ họa chuyển động.",
  careers: [
    "Chuyên viên thiết kế đồ họa.",
    "Chuyên gia tư vấn thiết kế thương hiệu.",
    "Trưởng nhóm thiết kế.",
    "Chuyên gia 2D/3D, VFX Artist hoặc Motion Designer.",
    "Giám đốc sáng tạo.",
    "Giảng viên hoặc khởi nghiệp trong lĩnh vực thiết kế đồ họa.",
  ],
  sourceLabel: "chương trình đào tạo-02.jpg",
  englishName: "Information Technology · Digital Graphics",
  code: "7480201",
  language: "Tiếng Việt và Tiếng Anh",
  courseCount: "53 học phần",
  admissions:
    "Thí sinh đã tốt nghiệp THPT, đáp ứng tiêu chuẩn học đại học theo Quy định của Bộ Giáo dục và Đào tạo và điều kiện tuyển sinh của Trường Đại học Phú Xuân.",
  graduation: "Theo quy định tại Điều 14, Thông tư số 08/2021/TT-BGDĐT.",
  furtherStudy:
    "Sau khi ra trường, Cử nhân chuyên ngành Đồ họa kỹ thuật số có thể học tiếp chương trình cao học, tiến sĩ trong nước hoặc tham gia các chương trình sau đại học ở nước ngoài.",
  planPrefix: "it-digital-graphics",
  terms: informationTechnologyTerms,
});

export const englishLanguageProgram = imageProgram({
  slug: "ngon-ngu-anh",
  officialName: "Ngôn ngữ Anh",
  marketingLabel: "Tiếng Anh thương mại · Tiếng Anh du lịch – nhà hàng – khách sạn",
  summary:
    "Chương trình phát triển năng lực nghe, nói, đọc, viết và giao tiếp liên văn hóa, với hai định hướng ứng dụng trong thương mại và du lịch – nhà hàng – khách sạn.",
  careers: [
    "Biên dịch, phiên dịch hoặc thông dịch viên kinh doanh.",
    "Nhân viên lễ tân hoặc văn phòng tại khách sạn và resort.",
    "Hướng dẫn viên du lịch trong nước hoặc quốc tế.",
    "Trợ lý, chăm sóc khách hàng, bán hàng hoặc điều hành tour.",
    "Nhân viên phòng vé, đặt chỗ hoặc tiếp tân.",
    "Giáo viên hoặc giảng viên tiếng Anh tại cơ sở giáo dục.",
  ],
  sourceLabel: "chương trình đào tạo-04.jpg",
  englishName: "English Language",
  code: "7220201",
  language: "Tiếng Việt và Tiếng Anh",
  courseCount: "62 học phần",
  admissions:
    "Thí sinh đã tốt nghiệp THPT, đáp ứng tiêu chuẩn học đại học theo Quy định của Bộ Giáo dục và Đào tạo và điều kiện tuyển sinh của Trường Đại học Phú Xuân.",
  graduation: "Theo quy định tại Điều 14, Thông tư số 08/2021/TT-BGDĐT.",
  furtherStudy:
    "Sau khi ra trường, Cử nhân ngành Ngôn ngữ Anh có thể học tiếp chương trình thạc sĩ, tiến sĩ trong nước hoặc tham gia các chương trình sau đại học ở nước ngoài.",
  planPrefix: "english-language",
  terms: englishLanguageTerms,
});

export const chineseLanguageProgram = imageProgram({
  slug: "ngon-ngu-trung-quoc",
  officialName: "Ngôn ngữ Trung Quốc",
  marketingLabel: "Tiếng Trung thương mại · Tiếng Trung du lịch",
  summary:
    "Chương trình phát triển toàn diện năng lực tiếng Trung từ nền tảng đến nâng cao, kết hợp HSK/HSKK và hai định hướng ứng dụng trong thương mại và du lịch.",
  careers: [
    "Biên dịch hoặc phiên dịch tiếng Trung.",
    "Trợ lý hoặc thư ký cho lãnh đạo, đối tác Trung Quốc và Đài Loan.",
    "Giảng viên hoặc giáo viên tiếng Trung.",
    "Hướng dẫn viên du lịch hoặc điều hành tour Trung Quốc.",
    "Chuyên viên chăm sóc khách hàng, nội dung, truyền thông hoặc marketing tiếng Trung.",
    "Nhân viên văn phòng tại công ty Trung Quốc hoặc Đài Loan.",
  ],
  sourceLabel: "chương trình đào tạo-03.jpg",
  englishName: "Chinese Language",
  code: "7220204",
  language: "Tiếng Việt và Tiếng Trung Quốc",
  courseCount: "54 học phần",
  admissions:
    "Thí sinh đã tốt nghiệp THPT, đáp ứng đủ tiêu chuẩn học đại học theo Quy định của Bộ Giáo dục và Đào tạo và điều kiện tuyển sinh của Trường Đại học Phú Xuân.",
  graduation: "Theo quy định tại Điều 14, Thông tư số 08/2021/TT-BGDĐT.",
  furtherStudy:
    "Sau khi tốt nghiệp, người học có thể học tiếp chương trình cao học trong nước hoặc tham gia các chương trình sau đại học ở nước ngoài.",
  planPrefix: "chinese-language",
  terms: chineseLanguageTerms,
});
