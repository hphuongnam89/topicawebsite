import {
  chineseLanguageProgram,
  englishLanguageProgram,
  informationTechnologyProgram,
  tourismProgram,
} from "@/data/supplemental-program-details";

export type EvidenceStatus = "verified" | "derived" | "need_confirmation";

export type ProgramCourse = {
  id: string;
  code: string;
  name: string;
  credits: number | null;
  requirement: "Bắt buộc" | "Tự chọn" | "Không tích lũy";
  prerequisite?: string;
  detail?: string;
  note?: string;
};

export type CurriculumGroup = {
  id: string;
  name: string;
  credits: number | null;
  selection?: string;
  courses: ProgramCourse[];
};

export type ProgramDetail = {
  slug: string;
  officialName: string;
  englishName: string | null;
  marketingLabel: string;
  code: string | null;
  summary: string;
  heroLabel: string;
  evidenceLevel: "academic_source" | "curriculum_source" | "cms_only";
  source: {
    label: string;
    reference: string;
    url?: string;
    reviewedAt: string;
  };
  facts: Array<{
    label: string;
    value: string;
    note?: string;
    status: EvidenceStatus;
  }>;
  curriculum: CurriculumGroup[];
  semesters: Array<{
    term: number;
    credits: number;
    phase: string;
    highlights: string[];
  }>;
  outcomes: Array<{ code: string; title: string; description: string }>;
  careers: string[];
  furtherStudy: string | null;
  admissions: string | null;
  graduation: string | null;
  confirmations: string[];
};

const course = (
  id: string,
  code: string,
  name: string,
  credits: number | null,
  requirement: ProgramCourse["requirement"] = "Bắt buộc",
  extra: Pick<ProgramCourse, "prerequisite" | "note"> = {},
): ProgramCourse => ({ id, code, name, credits, requirement, ...extra });

export const businessAdministrationProgram = {
  slug: "quan-tri-kinh-doanh-marketing",
  officialName: "Quản trị kinh doanh",
  englishName: "Business Administration",
  marketingLabel: "Marketing số & Kinh doanh số",
  code: "7340101",
  summary:
    "Chương trình định hướng ứng dụng, kết hợp nền tảng quản trị kinh doanh với marketing số, kinh doanh số, trí tuệ nhân tạo và chuyển đổi số.",
  heroLabel: "Chương trình đào tạo đại học · Định hướng ứng dụng",
  evidenceLevel: "academic_source",
  source: {
    label: "4. CTĐT QTKD 2026 .docx",
    reference: "trang 6–40",
    reviewedAt: "28/08/2026",
  },
  facts: [
    { label: "Mã ngành", value: "7340101", status: "verified" },
    { label: "Trình độ", value: "Đại học", status: "verified" },
    { label: "Hình thức", value: "Chính quy", status: "verified" },
    { label: "Văn bằng", value: "Cử nhân", status: "verified" },
    { label: "Thời gian", value: "3 năm · 9 học kỳ", status: "verified" },
    {
      label: "Khối lượng",
      value: "126 tín chỉ",
      note: "Không gồm Giáo dục thể chất và GDQP&AN",
      status: "verified",
    },
    { label: "Ngôn ngữ", value: "Tiếng Việt", status: "verified" },
    {
      label: "Tổng học phần",
      value: "Cần xác nhận",
      note: "Bảng học phần và kế hoạch học tập còn một số mã trùng/khác nhau",
      status: "need_confirmation",
    },
  ],
  curriculum: [
    {
      id: "general",
      name: "Kiến thức giáo dục đại cương",
      credits: 46,
      courses: [
        course("pol-701", "POL.7.01", "Triết học Mác-Lênin", 3),
        course("pol-702", "POL.7.02", "Kinh tế chính trị Mác-Lênin", 2, "Bắt buộc", {
          prerequisite: "POL.7.01",
        }),
        course("pol-703", "POL.7.03", "Chủ nghĩa xã hội khoa học", 2, "Bắt buộc", {
          prerequisite: "POL.7.01",
        }),
        course("pol-704", "POL.7.04", "Tư tưởng Hồ Chí Minh", 2, "Bắt buộc", {
          prerequisite: "POL.7.01",
        }),
        course("pol-705", "POL.7.05", "Lịch sử Đảng Cộng sản Việt Nam", 2, "Bắt buộc", {
          prerequisite: "POL.7.01",
        }),
        course("law-701", "LAW.7.01", "Pháp luật đại cương", 2),
        course("fol-701", "FOL.7.01", "Ngoại ngữ 1", 3),
        course("fol-702", "FOL.7.02", "Ngoại ngữ 2", 3, "Bắt buộc", { prerequisite: "FOL.7.01" }),
        course("fol-703", "FOL.7.03", "Ngoại ngữ 3", 3, "Bắt buộc", { prerequisite: "FOL.7.02" }),
        course("idt-701", "IDT.7.01", "Nhập môn công nghệ số", 3),
        course("ori-701", "ORI.7.01", "Nhập môn nghề nghiệp", 2),
        course("jsl-701", "JSL.7.01", "Kỹ năng tìm việc và hội nhập doanh nghiệp", 2),
        course("rem-701", "REM.7.01", "Phương pháp nghiên cứu khoa học", 2),
        course("ebs-701", "EBS.7.01", "Marketing ứng dụng", 3),
        course("ets-701", "ETS.7.01", "Ứng dụng trí tuệ nhân tạo", 3),
        course("ebs-702", "EBS.7.02", "Kỹ năng bán hàng và đàm phán trong kinh doanh", 3),
        course("ess-701", "ESS.7.01", "Quản trị bản thân", 3),
        course("ebs-703", "EBS.7.03", "Khởi nghiệp đổi mới sáng tạo", 3),
      ],
    },
    {
      id: "foundation",
      name: "Kiến thức cơ sở ngành",
      credits: 14,
      courses: [
        course("bua-723-economics", "BUA.7.23", "Kinh tế học", 3),
        course("bua-703", "BUA.7.03", "Pháp luật kinh doanh", 2),
        course("bua-721-management", "BUA.7.21", "Quản trị học", 3, "Bắt buộc", {
          note: "Mã BUA.7.21 bị lặp ở học phần Thực tập doanh nghiệp trong cùng bảng nguồn",
        }),
        course("bua-705", "BUA.7.05", "Thống kê kinh tế và kinh doanh", 3),
        course("bua-706", "BUA.7.06", "Phân tích dữ liệu", 3),
      ],
    },
    {
      id: "major-required",
      name: "Kiến thức ngành bắt buộc",
      credits: 21,
      courses: [
        course("bua-725", "BUA.7.25", "Hành vi người tiêu dùng", 3),
        course("bua-726", "BUA.7.26", "Quản trị nguồn nhân lực", 3),
        course("bua-709", "BUA.7.09", "Quản trị marketing", 2),
        course("bua-710", "BUA.7.10", "Quản trị chiến lược", 3),
        course("bua-711", "BUA.7.11", "Quản trị tài chính", 2),
        course("bua-712", "BUA.7.12", "Quản trị quan hệ khách hàng", 2),
        course("bua-713", "BUA.7.13", "Tiếng Anh chuyên ngành", 3),
        course("bua-720", "BUA.7.20", "Quản trị thương hiệu", 3, "Bắt buộc", {
          prerequisite: "EBS.7.01",
        }),
      ],
    },
    {
      id: "major-elective",
      name: "Kiến thức ngành tự chọn",
      credits: 9,
      selection: "Chọn 3 học phần (9 tín chỉ)",
      courses: [
        course("bua-714", "BUA.7.14", "Doanh nghiệp và hoạt động doanh nghiệp", 3, "Tự chọn"),
        course("bua-716", "BUA.7.16", "Quản trị dự án", 3, "Tự chọn"),
        course("imt-702", "IMT.7.02", "Quản trị sản xuất", 3, "Tự chọn"),
        course("imt-703", "IMT.7.03", "Quản trị chất lượng", 3, "Tự chọn"),
        course("bua-719", "BUA.7.19", "Môi trường kinh doanh", 3, "Tự chọn"),
        course("bua-717", "BUA.7.17", "Quản trị công nghệ", 3, "Tự chọn"),
        course("bua-724", "BUA.7.24", "Quản trị logistics và chuỗi cung ứng", 3, "Tự chọn"),
      ],
    },
    {
      id: "specialization-required",
      name: "Kiến thức chuyên ngành bắt buộc",
      credits: 12,
      courses: [
        course("dmc-701", "DMC.7.01", "Nghiên cứu marketing", 3, "Bắt buộc", {
          prerequisite: "EBS.7.01",
        }),
        course("dmc-712", "DMC.7.12", "Quản trị nội dung marketing số", 3, "Bắt buộc", {
          prerequisite: "BUA.7.07",
          note: "Mã học phần tiên quyết BUA.7.07 chưa xuất hiện trong bảng chương trình",
        }),
        course("dba-701", "DBA.7.01", "Kinh doanh số", 3),
        course("dba-705", "DBA.7.05", "Thương mại điện tử", 3),
      ],
    },
    {
      id: "specialization-marketing",
      name: "Tự chọn định hướng Marketing số",
      credits: 6,
      selection: "Chọn 2 học phần thuộc một định hướng (6 tín chỉ)",
      courses: [
        course("dmc-704", "DMC.7.04", "Quản trị khủng hoảng truyền thông số", 3, "Tự chọn"),
        course("dmc-705", "DMC.7.05", "Truyền thông số trong kinh doanh", 3, "Tự chọn"),
        course("dmc-711", "DMC.7.11", "Quản trị tổ chức sự kiện", 3, "Tự chọn"),
        course("dmc-706", "DMC.7.06", "Quan hệ công chúng", 3, "Tự chọn"),
        course("dmc-709", "DMC.7.09", "Marketing kỹ thuật số", 3, "Tự chọn"),
        course("dmc-710", "DMC.7.10", "Truyền thông đa phương tiện", 3, "Tự chọn"),
        course("dmc-703", "DMC.7.03", "Truyền thông marketing tích hợp", 3, "Tự chọn", {
          prerequisite: "EBS.7.01, BUA.7.09",
        }),
        course("dmc-707", "DMC.7.07", "Phân tích marketing", 3, "Tự chọn", {
          prerequisite: "EBS.7.01, BUA.7.09",
        }),
        course("dba-707", "DBA.7.07", "Trí tuệ nhân tạo trong marketing số", 3, "Tự chọn"),
      ],
    },
    {
      id: "specialization-digital-business",
      name: "Tự chọn định hướng Kinh doanh số",
      credits: 6,
      selection: "Chọn 2 học phần thuộc một định hướng (6 tín chỉ)",
      courses: [
        course("dba-708", "DBA.7.08", "Thanh toán điện tử", 3, "Tự chọn"),
        course("dba-703", "DBA.7.03", "Trí tuệ nhân tạo trong kinh doanh số", 3, "Tự chọn"),
        course("dba-702", "DBA.7.02", "Quản trị web", 3, "Tự chọn"),
        course("dba-709", "DBA.7.09", "Quản trị sự thay đổi", 3, "Tự chọn"),
        course("dba-710", "DBA.7.10", "Quản trị chuỗi cung ứng trong môi trường số", 3, "Tự chọn"),
        course("dba-704", "DBA.7.04", "Quản trị cơ sở dữ liệu", 3, "Tự chọn"),
      ],
    },
    {
      id: "internship",
      name: "Thực tập và khóa luận tốt nghiệp",
      credits: 18,
      courses: [
        course("bua-721-internship", "BUA.7.21", "Thực tập doanh nghiệp", 9, "Bắt buộc", {
          note: "Kế hoạch học tập dùng mã AET.7.23; cần xác nhận mã chính thức",
        }),
        course("bua-722-thesis", "BUA.7.22", "Khóa luận tốt nghiệp", 9, "Bắt buộc", {
          note: "Kế hoạch học tập dùng mã AET.7.24; cần xác nhận mã chính thức",
        }),
      ],
    },
    {
      id: "non-credit",
      name: "Học phần không tích lũy vào 126 tín chỉ",
      credits: null,
      courses: [
        course("dse-701", "DSE.7.01", "Giáo dục quốc phòng và an ninh", null, "Không tích lũy", {
          note: "165 tiết",
        }),
        course("phe-701", "PHE.7.01", "Giáo dục thể chất 1", 1, "Không tích lũy"),
        course("phe-702", "PHE.7.02", "Giáo dục thể chất 2", 1, "Không tích lũy"),
        course("phe-703", "PHE.7.03", "Giáo dục thể chất 3", 1, "Không tích lũy"),
      ],
    },
  ],
  semesters: [
    {
      term: 1,
      credits: 11,
      phase: "Nhập môn",
      highlights: ["Nhập môn nghề nghiệp", "Nhập môn công nghệ số", "Marketing ứng dụng"],
    },
    {
      term: 2,
      credits: 12,
      phase: "Nền tảng",
      highlights: ["Ngoại ngữ 1", "Ứng dụng trí tuệ nhân tạo", "Quản trị học"],
    },
    {
      term: 3,
      credits: 11,
      phase: "Nền tảng",
      highlights: ["Ngoại ngữ 2", "Quản trị nguồn nhân lực", "Quản trị chiến lược"],
    },
    {
      term: 4,
      credits: 15,
      phase: "Cơ sở ngành",
      highlights: ["Triết học Mác-Lênin", "Ngoại ngữ 3", "Thống kê kinh tế và kinh doanh"],
    },
    {
      term: 5,
      credits: 15,
      phase: "Kiến thức ngành",
      highlights: ["Quản trị marketing", "Nghiên cứu marketing", "Quản trị nội dung marketing số"],
    },
    {
      term: 6,
      credits: 13,
      phase: "Kiến thức ngành",
      highlights: ["Kỹ năng bán hàng và đàm phán", "Quản trị tài chính", "Phân tích dữ liệu"],
    },
    {
      term: 7,
      credits: 16,
      phase: "Chuyên ngành",
      highlights: ["Kinh doanh số", "Thương mại điện tử", "Học phần tự chọn định hướng"],
    },
    {
      term: 8,
      credits: 15,
      phase: "Chuyên sâu",
      highlights: ["Quản trị quan hệ khách hàng", "Quản trị thương hiệu", "Học phần tự chọn"],
    },
    {
      term: 9,
      credits: 18,
      phase: "Hoàn thành",
      highlights: ["Thực tập doanh nghiệp", "Khóa luận tốt nghiệp"],
    },
  ],
  outcomes: [
    {
      code: "PLO1",
      title: "Nền tảng đại cương",
      description:
        "Vận dụng kiến thức chính trị, pháp luật, giáo dục thể chất, quốc phòng, công nghệ thông tin và ngoại ngữ.",
    },
    {
      code: "PLO2",
      title: "Năng lực liên ngành",
      description:
        "Kết hợp trí tuệ nhân tạo, kinh doanh, marketing, khởi nghiệp và quản trị bản thân trong học tập và công việc.",
    },
    {
      code: "PLO3",
      title: "Kiến thức quản trị",
      description: "Vận dụng kiến thức nền tảng về quản trị và quản trị kinh doanh.",
    },
    {
      code: "PLO4",
      title: "Bối cảnh thị trường số",
      description:
        "Phân tích xu hướng thị trường và tác động của chúng tới hoạt động marketing số.",
    },
    {
      code: "PLO5",
      title: "Công cụ marketing số",
      description: "Đánh giá và lựa chọn công cụ, công nghệ phù hợp cho hoạt động marketing số.",
    },
    {
      code: "PLO6",
      title: "Kinh doanh số và AI",
      description: "Vận dụng kiến thức kinh doanh số, trí tuệ nhân tạo và chuyển đổi số.",
    },
    {
      code: "PLO7",
      title: "Tư duy và công nghệ",
      description:
        "Thể hiện kỹ năng công nghệ, kinh doanh, tư duy phản biện, sáng tạo và tinh thần khởi nghiệp.",
    },
    {
      code: "PLO8",
      title: "Thực thi quản trị kinh doanh",
      description:
        "Phân tích, đánh giá, lập kế hoạch, triển khai và đo lường hoạt động quản trị kinh doanh.",
    },
    {
      code: "PLO9",
      title: "Năng lực cộng tác",
      description: "Giao tiếp, làm việc nhóm, thuyết trình, tự học và học tập suốt đời.",
    },
    {
      code: "PLO10",
      title: "Đạo đức và trách nhiệm",
      description: "Tuân thủ pháp luật, đạo đức nghề nghiệp; thể hiện tính tự chủ và trách nhiệm.",
    },
  ],
  careers: [
    "Doanh nghiệp và tổ chức phi chính phủ có hoạt động liên quan đến quản trị kinh doanh.",
    "Cơ quan quản lý nhà nước có chức năng liên quan đến quản trị kinh doanh.",
    "Cơ sở đào tạo và viện nghiên cứu trong lĩnh vực quản trị kinh doanh.",
  ],
  furtherStudy: "Có khả năng tiếp tục học tập ở trình độ thạc sĩ và tiến sĩ.",
  admissions:
    "Người đã tốt nghiệp trung học phổ thông hoặc tương đương, đáp ứng quy định tuyển sinh của Bộ Giáo dục và Đào tạo và Trường Đại học Phú Xuân.",
  graduation: "Thực hiện theo Điều 14, Thông tư số 08/2021/TT-BGDĐT và quy định của cơ sở đào tạo.",
  confirmations: [
    "Xác nhận tổng số học phần sau khi xử lý các mã bị trùng hoặc không thống nhất giữa Bảng 8 và Bảng 15.",
    "Xác nhận mã học phần Thực tập doanh nghiệp và Khóa luận tốt nghiệp: BUA.7.21/BUA.7.22 hay AET.7.23/AET.7.24.",
    "Xác nhận học phần tiên quyết BUA.7.07 của DMC.7.12 vì mã này chưa có trong bảng học phần.",
    "Xác nhận tín chỉ Kinh tế học, Quản trị bản thân và tổng tín chỉ học kỳ 4 do các bảng nguồn chưa hoàn toàn đồng nhất.",
    "Bổ sung ảnh hero chính thức, học phí, lịch khai giảng, phương thức tuyển sinh và đầu mối tư vấn trước khi công bố đầy đủ.",
  ],
} satisfies ProgramDetail;

export const programDetails: ProgramDetail[] = [
  businessAdministrationProgram,
  tourismProgram,
  informationTechnologyProgram,
  englishLanguageProgram,
  chineseLanguageProgram,
];

export function getProgramDetail(slug: string): ProgramDetail | undefined {
  return programDetails.find((program) => program.slug === slug);
}
