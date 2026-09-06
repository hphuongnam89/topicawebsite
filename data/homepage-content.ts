export type EvidenceStatus = "verified" | "needs_confirmation" | "omitted";

export type HomepageFact = {
  label: string;
  value: string;
  status: EvidenceStatus;
  sourceUrl?: string;
};

export const homepageContent = {
  hero: {
    eyebrow: "ĐẠI HỌC TỪ XA · E-LEARNING QUA LMS",
    title: "Hoàn thiện bằng đại học theo lịch học phù hợp với công việc của bạn",
    description:
      "Tìm hiểu ngành học, điều kiện xét tuyển, học phí và kỳ nhập học phù hợp trước khi đăng ký.",
    primaryCta: "Kiểm tra điều kiện & nhận lộ trình",
    secondaryCta: "Xem 5 ngành đào tạo",
    formTitle: "Nhận tư vấn theo hồ sơ của bạn",
    formDescription:
      "Điền họ tên và số điện thoại để đội ngũ tuyển sinh gửi thông tin phù hợp. Email và ngành học có thể bổ sung sau.",
    responseTime: "Đội ngũ tuyển sinh sẽ liên hệ để kiểm tra hồ sơ.",
  },
  facts: [
    {
      label: "Đối tượng",
      value: "THPT hoặc tương đương; người đã có văn bằng phù hợp",
      status: "verified",
      sourceUrl: "https://topicauni.edu.vn/thong-tin-tuyen-sinh-nam-2026/",
    },
    {
      label: "Hình thức",
      value: "Đào tạo từ xa · E-learning qua LMS",
      status: "verified",
      sourceUrl:
        "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
    },
    {
      label: "Học phí tham khảo",
      value: "600.000đ/tín chỉ · theo thông báo 2026 – đợt 2",
      status: "verified",
      sourceUrl:
        "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
    },
    {
      label: "Học bổng Talent",
      value: "Giảm 30% toàn khóa · áp dụng theo điều kiện thông báo",
      status: "verified",
      sourceUrl: "https://topicauni.edu.vn/hoc-phi/",
    },
    {
      label: "Văn bằng",
      value: "Do Trường Đại học Phú Xuân cấp",
      status: "verified",
      sourceUrl: "https://topicauni.edu.vn/",
    },
  ] satisfies readonly HomepageFact[],
  fitProfiles: [
    {
      title: "Người đã đi làm",
      description: "Muốn duy trì công việc và tìm một lộ trình học rõ ràng hơn.",
    },
    {
      title: "Người muốn hoàn thiện bằng cấp",
      description: "Cần được tư vấn điều kiện và hồ sơ theo trường hợp cụ thể.",
    },
    {
      title: "Người muốn chuyển hướng nghề nghiệp",
      description: "Muốn so sánh ngành học, kỹ năng và lựa chọn tiếp theo trước khi đăng ký.",
    },
  ],
  programs: [
    {
      name: "Quản trị kinh doanh – Truyền thông & Marketing",
      href: "/quan-tri-kinh-doanh-marketing/",
      group: "Kinh doanh & Marketing",
    },
    {
      name: "Quản trị Dịch vụ Du lịch & Lữ hành",
      href: "/quan-tri-dich-vu-du-lich-va-lu-hanh/",
      group: "Kinh doanh & Dịch vụ",
    },
    { name: "Công nghệ thông tin", href: "/cong-nghe-thong-tin/", group: "Công nghệ" },
    { name: "Ngôn ngữ Anh", href: "/ngon-ngu-anh/", group: "Ngôn ngữ" },
    { name: "Ngôn ngữ Trung", href: "/ngon-ngu-trung-quoc/", group: "Ngôn ngữ" },
  ],
  legal: {
    title: "Bằng do Trường Đại học Phú Xuân cấp",
    description:
      "Người học hoàn thành chương trình và đáp ứng điều kiện tốt nghiệp được Trường Đại học Phú Xuân cấp bằng. Việc sử dụng văn bằng được thực hiện theo quy định hiện hành và yêu cầu của từng cơ quan, đơn vị.",
    sourceUrl:
      "https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/",
  },
  learning: ["Học liệu số", "Lớp trực tuyến", "Bài tập & đánh giá", "Cố vấn và hỗ trợ kỹ thuật"],
  faqs: [
    [
      "Tôi cần điều kiện gì để xét tuyển?",
      "Thí sinh đã tốt nghiệp THPT hoặc tương đương, hoặc đã có bằng Trung cấp, Cao đẳng, Đại học, có thể đăng ký theo điều kiện của thông báo tuyển sinh hiện hành.",
    ],
    [
      "Học trực tuyến hoàn toàn hay có cần đến trường?",
      "Chương trình thực hiện theo hình thức đào tạo từ xa, phương thức E-learning qua LMS. Lịch học trực tuyến được tổ chức theo thông báo của từng đợt tuyển sinh.",
    ],
    [
      "Bằng do đơn vị nào cấp và giá trị như thế nào?",
      "Bằng do Trường Đại học Phú Xuân cấp. Các điều kiện sử dụng văn bằng thực hiện theo quy định hiện hành và yêu cầu của từng cơ quan, đơn vị.",
    ],
    [
      "Học bao lâu?",
      "Thời gian học phụ thuộc chương trình, văn bằng đầu vào và số học phần được xét miễn. Tư vấn viên sẽ lập lộ trình theo hồ sơ cụ thể.",
    ],
    [
      "Lịch học có phù hợp người đi làm?",
      "Thông báo tuyển sinh 2026 nêu lịch học trực tuyến vào cuối tuần hoặc buổi tối. Lịch cụ thể được thông báo theo lớp và từng đợt.",
    ],
    [
      "Học phí, học bổng và phương thức đóng?",
      "Thông báo tuyển sinh 2026 – đợt 2 công bố mức 600.000 đồng mỗi tín chỉ. Học bổng và mức phí áp dụng cần được đọc cùng điều kiện của thông báo tại thời điểm đăng ký.",
    ],
    [
      "Khi nào nhận hồ sơ và khi nào khai giảng?",
      "Hồ sơ được tiếp nhận theo từng thông báo tuyển sinh. Hãy kiểm tra thông báo đang áp dụng hoặc liên hệ tư vấn để biết mốc gần nhất.",
    ],
    [
      "Tôi có được xét miễn học phần không?",
      "Người học có thể được xét miễn học phần tương đương theo quy định; việc miễn không tự động và phụ thuộc hồ sơ đã học.",
    ],
  ] as const,
  privacyPolicyHref: "/chinh-sach-bao-mat/",
} as const;

export const verifiedHomepageFacts: readonly HomepageFact[] = homepageContent.facts.filter(
  (fact) => fact.status === "verified",
);
