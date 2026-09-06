export interface Program {
  name: string;
  slug: string;
  shortDescription: string;
  icon: string;
  image: string;
  href: string;
  group: "business" | "technology" | "language";
}

export const programs: readonly Program[] = [
  {
    name: "Quản Trị Kinh Doanh – Truyền thông & marketing số",
    slug: "quan-tri-kinh-doanh-marketing",
    shortDescription:
      "Cung cấp kiến thức chuyên sâu về quản trị và chiến lược truyền thông, marketing số hiện đại.",
    icon: "Briefcase",
    image: "/images/programs/quan-tri-kinh-doanh.jpg",
    href: "/quan-tri-kinh-doanh-marketing/",
    group: "business",
  },
  {
    name: "Quản Trị Dịch Vụ Du Lịch Và Lữ Hành",
    slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
    shortDescription:
      "Đào tạo kỹ năng quản lý, điều hành các hoạt động du lịch và lữ hành chuyên nghiệp.",
    icon: "Plane",
    image: "/images/programs/du-lich-lu-hanh.jpg",
    href: "/quan-tri-dich-vu-du-lich-va-lu-hanh/",
    group: "business",
  },
  {
    name: "Công Nghệ Thông Tin – Chuyên ngành đồ hoạ kỹ thuật số",
    slug: "cong-nghe-thong-tin",
    shortDescription: "Đào tạo kỹ sư với kiến thức nền tảng và chuyên sâu về đồ hoạ kỹ thuật số.",
    icon: "Monitor",
    image: "/images/programs/cong-nghe-thong-tin.jpg",
    href: "/cong-nghe-thong-tin/",
    group: "technology",
  },
  {
    name: "Ngôn Ngữ Anh",
    slug: "ngon-ngu-anh",
    shortDescription: "Phát triển kỹ năng ngoại ngữ toàn diện, đáp ứng nhu cầu giao tiếp quốc tế.",
    icon: "BookOpen",
    image: "/images/programs/ngon-ngu-anh.jpg",
    href: "/ngon-ngu-anh/",
    group: "language",
  },
  {
    name: "Ngôn Ngữ Trung",
    slug: "ngon-ngu-trung-quoc",
    shortDescription:
      "Đào tạo ngôn ngữ và văn hóa Trung Quốc, mở rộng cơ hội nghề nghiệp toàn cầu.",
    icon: "Languages",
    image: "/images/programs/ngon-ngu-trung.jpg",
    href: "/ngon-ngu-trung-quoc/",
    group: "language",
  },
] as const;

export const programGroups = {
  business: "Kinh doanh & Dịch vụ",
  technology: "Công nghệ & Sáng tạo",
  language: "Ngôn ngữ",
} as const;
