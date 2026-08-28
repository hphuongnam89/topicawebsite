export interface AdmissionStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export const admissionSteps: readonly AdmissionStep[] = [
  {
    step: 1,
    title: "Tìm hiểu ngành học",
    description: "Tham khảo thông tin các chương trình đào tạo để chọn ngành phù hợp.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Đăng ký tư vấn",
    description: "Điền thông tin trực tuyến để nhận tư vấn chi tiết từ cán bộ tuyển sinh.",
    icon: "PhoneCall",
  },
  {
    step: 3,
    title: "Chuẩn bị hồ sơ",
    description: "Hoàn thiện hồ sơ xét tuyển theo hướng dẫn của trường.",
    icon: "FileText",
  },
  {
    step: 4,
    title: "Xét tuyển",
    description: "Trường tiến hành xét duyệt hồ sơ và gửi thông báo kết quả.",
    icon: "CheckCircle",
  },
  {
    step: 5,
    title: "Nhập học",
    description: "Thí sinh trúng tuyển hoàn thành thủ tục nhập học và bắt đầu chương trình.",
    icon: "GraduationCap",
  },
] as const;

export const educationLevels: readonly string[] = [
  "Học sinh THPT",
  "Sinh viên Cao đẳng / Đại học",
  "Người đi làm",
  "Khác",
] as const;
