/**
 * Shared evidence registry for public content gates and content review.
 * Academic DOCX/PDF data stays in the repository but is only rendered when
 * the corresponding claim is approved for public use.
 */

export type VerificationStatus =
  "verified" | "needs_review" | "not_found" | "conflicting" | "expired";

export type PublicMode = "exact" | "cautious" | "hidden";

export type SourceReference = {
  url: string;
  title: string;
  sourceType:
    "canonical" | "official_notice" | "official_program" | "secondary_marketing" | "local_evidence";
  checkedAt: string;
  verificationStatus: VerificationStatus;
  approvedForPublic: boolean;
  note?: string;
};

export type ClaimAudit = {
  id: string;
  area:
    | "institution"
    | "delivery"
    | "admissions"
    | "tuition"
    | "scholarship"
    | "degree"
    | "program"
    | "academic"
    | "support";
  claim: string;
  currentRepoText?: string;
  sourceIds: readonly string[];
  verificationStatus: VerificationStatus;
  publicMode: PublicMode;
  approvedForPublic: boolean;
  note: string;
};

export const auditCheckedAt = "2026-09-03";

export const officialSources = {
  S01: {
    url: "https://topicauni.edu.vn/",
    title: "Trang chủ Topica",
    sourceType: "canonical",
    checkedAt: auditCheckedAt,
    verificationStatus: "verified",
    approvedForPublic: true,
  },
  S02: {
    url: "https://topicauni.edu.vn/hoc-phi/",
    title: "Học phí",
    sourceType: "canonical",
    checkedAt: auditCheckedAt,
    verificationStatus: "verified",
    approvedForPublic: true,
  },
  S03: {
    url: "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
    title:
      "Thông báo tuyển sinh đại học chính quy hình thức từ xa PXUni-Elearning năm 2026 – đợt 2",
    sourceType: "official_notice",
    checkedAt: auditCheckedAt,
    verificationStatus: "verified",
    approvedForPublic: true,
  },
  S04: {
    url: "https://topicauni.edu.vn/thong-tin-tuyen-sinh-nam-2026/",
    title: "Thông tin tuyển sinh năm 2026",
    sourceType: "official_notice",
    checkedAt: auditCheckedAt,
    verificationStatus: "verified",
    approvedForPublic: true,
  },
  S05: {
    url: "https://topicauni.edu.vn/he-thong/",
    title: "Hệ thống Topica",
    sourceType: "canonical",
    checkedAt: auditCheckedAt,
    verificationStatus: "verified",
    approvedForPublic: true,
  },
  S06: {
    url: "https://topicauni.edu.vn/dao-tao/ke-hoach-dao-tao/ke-hoach-nam-hoc/",
    title: "Kế hoạch năm học",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Có liên kết kế hoạch nhưng chưa dùng thay cho bảng chương trình đào tạo chi tiết.",
  },
  S07: {
    url: "https://topicauni.edu.vn/dao-tao/ke-hoach-dao-tao/ke-hoach-hoc-ky/",
    title: "Kế hoạch học kỳ",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Chưa xác minh toàn bộ bảng học phần, mã, STT và tín chỉ.",
  },
  S08: {
    url: "https://topicauni.edu.vn/quan-tri-kinh-doanh-marketing/",
    title: "Quản trị kinh doanh – Truyền thông & Marketing số",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Trang marketing không đủ để xác minh toàn bộ dữ liệu học thuật.",
  },
  S09: {
    url: "https://topicauni.edu.vn/cong-nghe-thong-tin/",
    title: "Công nghệ thông tin",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Cần xác nhận riêng chuyên ngành Đồ họa kỹ thuật số; trang chuẩn đầu ra công khai có nội dung CNTT rộng hơn.",
  },
  S10: {
    url: "https://topicauni.edu.vn/quan-tri-dich-vu-du-lich-va-lu-hanh/",
    title: "Quản trị Dịch vụ Du lịch & Lữ hành",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "conflicting",
    approvedForPublic: false,
    note: "Homepage có ngành; thông báo tuyển sinh 2026 – đợt 2 không liệt kê ngành này.",
  },
  S11: {
    url: "https://topicauni.edu.vn/chuong-trinh/chuong-trinh-dao-tao-tu-xa/muc-tieu-va-chuan-dau-ra/",
    title: "Mục tiêu và chuẩn đầu ra",
    sourceType: "official_program",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Có PO/PLO công khai nhưng chưa đủ để xác minh tất cả course data.",
  },
  S12: {
    url: "https://www.tuyensinh.topicauni.edu.vn/",
    title: "Đăng ký học bổng – Đại học từ xa",
    sourceType: "secondary_marketing",
    checkedAt: auditCheckedAt,
    verificationStatus: "needs_review",
    approvedForPublic: false,
    note: "Domain tuyển sinh phụ; chỉ dùng sau khi owner xác nhận là nguồn áp dụng.",
  },
} as const satisfies Record<string, SourceReference>;

export const contentSourceOfTruth = [
  {
    id: "delivery.distance",
    area: "delivery",
    claim: "Chương trình đào tạo từ xa, E-learning qua LMS.",
    sourceIds: ["S01", "S03", "S04"],
    verificationStatus: "verified",
    publicMode: "exact",
    approvedForPublic: true,
    note: "Dùng đúng phạm vi chương trình/thông báo.",
  },
  {
    id: "delivery.weekend-evening",
    area: "delivery",
    claim: "Lớp trực tuyến vào cuối tuần hoặc buổi tối theo thông báo 2026.",
    currentRepoText: "lịch học trực tuyến cuối tuần hoặc buổi tối",
    sourceIds: ["S03"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Không biến thành cam kết lịch cố định cho mọi khóa.",
  },
  {
    id: "delivery.hybrid",
    area: "delivery",
    claim: "Hybrid.",
    sourceIds: [],
    verificationStatus: "not_found",
    publicMode: "hidden",
    approvedForPublic: false,
    note: "Không tìm thấy xác nhận trực tiếp trong nguồn canonical.",
  },
  {
    id: "delivery.online-100",
    area: "delivery",
    claim: "100% online.",
    currentRepoText: "100% online learning environment",
    sourceIds: ["S12"],
    verificationStatus: "needs_review",
    publicMode: "hidden",
    approvedForPublic: false,
    note: "Chỉ có ở domain phụ; cần xác nhận phạm vi và ngoại lệ.",
  },
  {
    id: "admissions.audience",
    area: "admissions",
    claim: "THPT/tương đương và người đã có Trung cấp, Cao đẳng, Đại học theo điều kiện thông báo.",
    sourceIds: ["S01", "S03", "S04"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Trung cấp chưa có THPT có điều kiện bổ sung; không rút gọn thành tuyển thẳng mọi hồ sơ.",
  },
  {
    id: "admissions.methods-2026",
    area: "admissions",
    claim: "Thông báo 2026 nêu 5 phương thức tuyển sinh.",
    currentRepoText: "3 phương thức chính",
    sourceIds: ["S03", "S04"],
    verificationStatus: "conflicting",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "FAQ trong AdmissionHub đang stale so với thông báo 2026.",
  },
  {
    id: "admissions.timing",
    area: "admissions",
    claim: "Nhận hồ sơ theo thông báo/đợt; đợt 2 có mốc 25/06/2026 trong thông báo đã kiểm tra.",
    sourceIds: ["S01", "S03"],
    verificationStatus: "expired",
    publicMode: "cautious",
    approvedForPublic: false,
    note: "Ngày đã qua tại thời điểm audit; cần thông báo mới trước khi hiển thị.",
  },
  {
    id: "scholarship.talent-30",
    area: "scholarship",
    claim: "Talent giảm 30% học phí toàn khóa cho thí sinh đăng ký sớm, theo điều kiện thông báo.",
    sourceIds: ["S01", "S02", "S03"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Thông báo 2026 nêu thêm số suất và thời hạn; cần giữ các điều kiện đó.",
  },
  {
    id: "tuition.per-credit",
    area: "tuition",
    claim: "600.000 đồng/tín chỉ theo thông báo tuyển sinh 2026 – đợt 2.",
    currentRepoText: "600.000 đồng/tín chỉ",
    sourceIds: ["S03"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Phải ghi năm/đợt; không coi là giá vĩnh viễn.",
  },
  {
    id: "tuition.installments",
    area: "tuition",
    claim: "Học phí được chia theo đợt; số đợt mỗi học kỳ cần xác minh.",
    currentRepoText: "2 học kỳ chính/năm",
    sourceIds: ["S02", "S12"],
    verificationStatus: "needs_review",
    publicMode: "cautious",
    approvedForPublic: false,
    note: "S12 nói 2 đợt mỗi kỳ nhưng là domain phụ; S02 chỉ xác nhận chia đợt.",
  },
  {
    id: "tuition.exemption",
    area: "tuition",
    claim: "Được xét miễn học phần theo quy định; không phải miễn tự động.",
    sourceIds: ["S02", "S12"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Điều kiện và danh mục miễn chưa được xác minh đầy đủ.",
  },
  {
    id: "degree.issuer",
    area: "degree",
    claim: "Bằng do Trường Đại học Phú Xuân cấp.",
    sourceIds: ["S01"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Không tự mở rộng sang các kết luận pháp lý về công chức hoặc học tiếp.",
  },
  {
    id: "support.lms-tools",
    area: "support",
    claim:
      "MegaSchool LMS, AP, Google Classroom và Google Meet là các hệ thống được website liệt kê.",
    sourceIds: ["S03", "S05"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Không suy ra toàn bộ hoạt động học dùng một công cụ duy nhất.",
  },
  {
    id: "support.mentor",
    area: "support",
    claim: "Mentor.",
    sourceIds: ["S12"],
    verificationStatus: "needs_review",
    publicMode: "hidden",
    approvedForPublic: false,
    note: "Nguồn phụ dùng “Cán bộ học tập”; chưa có nguồn canonical dùng thuật ngữ mentor.",
  },
  {
    id: "support.student-testimonials",
    area: "support",
    claim: "Trang chủ chính thức công khai cảm nhận có tên của ba sinh viên.",
    sourceIds: ["S01"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Chỉ dùng đúng tên và nội dung trên nguồn chính thức; luôn gắn liên kết nguồn.",
  },
  {
    id: "program.five-programs",
    area: "program",
    claim: "Homepage chính thức liệt kê 5 ngành, gồm cả Du lịch.",
    sourceIds: ["S01"],
    verificationStatus: "verified",
    publicMode: "cautious",
    approvedForPublic: true,
    note: "Phạm vi mở tuyển từng đợt phải đọc theo notice; S03 đang thiếu Du lịch.",
  },
  {
    id: "program.academic-tables",
    area: "academic",
    claim: "Mã học phần, STT, tổng học phần, tín chỉ, học kỳ, PLO và điều kiện tốt nghiệp.",
    sourceIds: ["S06", "S07", "S11"],
    verificationStatus: "not_found",
    publicMode: "hidden",
    approvedForPublic: false,
    note: "Cần DOCX/PDF đúng ngành và phiên bản được duyệt; không suy diễn từ code hoặc tên ngành.",
  },
] as const satisfies readonly ClaimAudit[];

export function isPublicClaimApproved(id: string): boolean {
  return contentSourceOfTruth.some((item) => item.id === id && item.approvedForPublic);
}
