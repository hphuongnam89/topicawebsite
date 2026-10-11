/**
 * Dữ liệu học phí và chính sách học bổng chính thức áp dụng cho khóa tuyển sinh 2026
 * Đơn vị cấp bằng: Trường Đại học Phú Xuân (PXU) - Thành viên Tập đoàn Giáo dục EQuest
 * Đơn vị triển khai: Viện Đào tạo Quốc tế Topica
 */

export interface ProgramTuition {
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
  note?: string;
}

export interface ScholarshipPolicy {
  id: string;
  title: string;
  percentage: string;
  highlight?: boolean;
  tag?: string;
  description: string;
  criteria: string;
}

export interface TuitionRule {
  title: string;
  description: string;
}

export const OFFICIAL_TUITION_PROGRAMS: readonly ProgramTuition[] = [
  {
    programName: "Quản trị kinh doanh",
    slug: "quan-tri-kinh-doanh-marketing",
    majorCode: "7340101",
    credits: 126,
    pricePerCredit: 750000,
    totalTuition: 94500000,
    semesters: 9,
    tuitionPerSemester: 10500000,
    degreeAwarded: "Cử nhân Quản trị kinh doanh",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "business",
    note: "Không bao gồm khối kiến thức GDTC và GDQP&AN",
  },
  {
    programName: "Quản trị du lịch và lữ hành",
    slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
    majorCode: "7810103",
    credits: 126,
    pricePerCredit: 750000,
    totalTuition: 94500000,
    semesters: 9,
    tuitionPerSemester: 10500000,
    degreeAwarded: "Cử nhân Quản trị dịch vụ du lịch và lữ hành",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "business",
    note: "Bao gồm định hướng Quản trị lữ hành và Quản trị khách sạn",
  },
  {
    programName: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
    slug: "cong-nghe-thong-tin",
    majorCode: "7480201",
    credits: 126,
    pricePerCredit: 850000,
    totalTuition: 107100000,
    semesters: 9,
    tuitionPerSemester: 11900000,
    degreeAwarded: "Cử nhân Công nghệ thông tin",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "technology",
    note: "Bao gồm phòng lab thực hành ảo và học liệu số chuyên sâu",
  },
  {
    programName: "Ngôn ngữ Anh",
    slug: "ngon-ngu-anh",
    majorCode: "7220201",
    credits: 126,
    pricePerCredit: 750000,
    totalTuition: 94500000,
    semesters: 9,
    tuitionPerSemester: 10500000,
    degreeAwarded: "Cử nhân Ngôn ngữ Anh",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "language",
    note: "Định hướng Tiếng Anh thương mại & Tiếng Anh du lịch - khách sạn",
  },
  {
    programName: "Ngôn ngữ Trung Quốc",
    slug: "ngon-ngu-trung-quoc",
    majorCode: "7220204",
    credits: 126,
    pricePerCredit: 750000,
    totalTuition: 94500000,
    semesters: 9,
    tuitionPerSemester: 10500000,
    degreeAwarded: "Cử nhân Ngôn ngữ Trung Quốc",
    awardingInstitution: "Trường Đại học Phú Xuân",
    group: "language",
    note: "Định hướng Tiếng Trung thương mại & Tiếng Trung du lịch, chuẩn HSK",
  },
] as const;

export const ADMISSION_FEES = {
  admissionFee: 1000000, // Lệ phí nhập học 1 lần duy nhất
  healthInsurance: "Theo quy định hiện hành của Nhà nước",
  materialsFee: "Miễn phí 100% tài nguyên học liệu số trực tuyến",
  retakeFee: "Theo đơn giá tín chỉ niêm yết tại thời điểm đăng ký học lại",
} as const;

export const SCHOLARSHIPS: readonly ScholarshipPolicy[] = [
  {
    id: "talent",
    title: "Học bổng Tài năng Topica",
    percentage: "100%",
    tag: "Đặc biệt",
    description: "Miễn 100% học phí toàn khóa học dành cho những cá nhân xuất sắc có thành tích nổi bật.",
    criteria: "Dành cho học sinh đạt giải Nhất, Nhì, Ba trong kỳ thi Học sinh giỏi cấp Quốc gia, Quốc tế hoặc thủ khoa đầu vào các khối thi.",
  },
  {
    id: "encouragement",
    title: "Học bổng Khuyến học",
    percentage: "50%",
    highlight: true,
    tag: "Phổ biến nhất",
    description: "Giảm 50% học phí năm học đầu tiên cho tân sinh viên nhập học sớm và có thành tích học tập tốt.",
    criteria: "Điểm thi THPT đạt từ 24 điểm trở lên hoặc chứng chỉ tiếng Anh IELTS 6.5+ (HSK 5+ đối với tiếng Trung).",
  },
  {
    id: "financial-aid",
    title: "Học bổng Tiếp bước Tương lai",
    percentage: "30%",
    tag: "Hỗ trợ tài chính",
    description: "Giảm 30% học phí toàn khóa dành cho sinh viên vượt khó vươn lên trong học tập.",
    criteria: "Dành cho sinh viên có hoàn cảnh khó khăn, gia đình chính sách hoặc học sinh vùng sâu vùng xa có xác nhận địa phương.",
  },
] as const;

export const TUITION_COMMITMENTS: readonly TuitionRule[] = [
  {
    title: "Đóng theo tín chỉ thực học",
    description: "Sinh viên đóng học phí theo từng học kỳ dựa trên số lượng tín chỉ thực tế đăng ký, giúp chủ động quản lý kế hoạch tài chính cá nhân.",
  },
  {
    title: "Minh bạch và ổn định",
    description: "Biểu phí được công khai minh bạch. Nhà trường cam kết mức điều chỉnh học phí (nếu có) không vượt quá 10%/năm theo đúng quy định của Nhà nước.",
  },
  {
    title: "Chính sách hỗ trợ trả góp 0%",
    description: "Hợp tác với các đối tác tài chính uy tín hỗ trợ sinh viên đóng học phí theo từng tháng với lãi suất 0%, giảm áp lực tài chính một lần.",
  },
] as const;
