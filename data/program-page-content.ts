import type { ProgramDetail } from "@/data/program-details";

export type ProgramCareerTier = {
  title: string;
  items: readonly string[];
  note?: string;
};

export type ProgramPublicContent = {
  audience: string;
  learningIntro: string;
  learningPoints: readonly string[];
  directions: readonly { label: string; description: string }[];
  careerTiers: readonly ProgramCareerTier[];
  admissionsNote: string;
  tuitionBullets: readonly string[];
  tuitionNote: string;
  faqs: readonly [string, string][];
};

const sharedFaqs = (program: ProgramDetail): readonly [string, string][] => [
  [
    "Đây là chương trình dành cho ai?",
    "Chương trình phù hợp với người đã tốt nghiệp THPT hoặc tương đương, người đã có bằng Trung cấp, Cao đẳng, Đại học và người đang đi làm muốn nâng cao chuyên môn.",
  ],
  [
    "Hình thức học như thế nào?",
    "Theo thông báo tuyển sinh hiện hành, chương trình thực hiện theo phương thức E-learning qua LMS; lịch học trực tuyến được tổ chức vào cuối tuần hoặc buổi tối.",
  ],
  [
    "Tôi xem chương trình đào tạo chi tiết ở đâu?",
    "Chi tiết học phần được cung cấp theo phiên bản chương trình áp dụng cho từng khóa. Bộ phận tuyển sinh sẽ gửi tài liệu phù hợp với đợt đăng ký của bạn.",
  ],
  [
    "Lộ trình học kéo dài bao lâu?",
    "Thời gian học phụ thuộc chương trình, văn bằng đầu vào và số học phần được xét miễn theo quy định. Lộ trình cụ thể được lập theo hồ sơ.",
  ],
  [
    "Điều kiện xét tuyển của ngành này là gì?",
    "Thí sinh cần đáp ứng điều kiện đầu vào, sức khỏe và hồ sơ theo thông báo tuyển sinh của Trường Đại học Phú Xuân tại thời điểm đăng ký.",
  ],
  [
    "Học phí hiện tại bao nhiêu?",
    "Thông báo tuyển sinh 2026 đang công bố mức 600.000 đồng mỗi tín chỉ. Hãy xác nhận lại mức áp dụng cho đợt nhập học bạn chọn.",
  ],
  [
    "Có học bổng hoặc miễn giảm học phần không?",
    "Website công bố các chính sách học bổng theo từng nhóm đối tượng và thời điểm, đồng thời có thể xét miễn học phần theo quy định.",
  ],
  [
    `Làm sao nhận lộ trình ${program.marketingLabel}?`,
    "Để lại số điện thoại trong biểu mẫu tư vấn. Bộ phận tuyển sinh sẽ kiểm tra ngành, hồ sơ đầu vào và thông tin học phí mới nhất cùng bạn.",
  ],
];

const sharedTuitionBullets = [
  "600.000 đồng/tín chỉ theo thông báo tuyển sinh đại học từ xa 2026 – đợt 2.",
  "Có thể xét miễn học phần theo quy định.",
  "Học bổng Topica Talent giảm 30% toàn khóa cho thí sinh đăng ký sớm, theo điều kiện của thông báo.",
] as const;

const content: Record<string, Omit<ProgramPublicContent, "faqs">> = {
  "quan-tri-kinh-doanh-marketing": {
    audience:
      "Phù hợp với người muốn kết hợp nền tảng quản trị kinh doanh, tư duy marketing và năng lực triển khai trên các kênh số.",
    learningIntro:
      "Lộ trình đi từ nền tảng quản trị đến năng lực triển khai marketing và kinh doanh trong môi trường số.",
    learningPoints: [
      "Nền tảng quản trị kinh doanh, thị trường, người tiêu dùng và vận hành doanh nghiệp.",
      "Nghiên cứu marketing, nội dung marketing số, truyền thông tích hợp và phân tích marketing.",
      "Kinh doanh số, thương mại điện tử, trí tuệ nhân tạo và chuyển đổi số.",
      "Kỹ năng bán hàng, đàm phán, quản trị quan hệ khách hàng và thực tập doanh nghiệp.",
    ],
    directions: [
      {
        label: "Marketing số",
        description:
          "Tập trung vào nghiên cứu marketing, nội dung, truyền thông, công cụ số và đo lường hoạt động marketing.",
      },
      {
        label: "Kinh doanh số",
        description:
          "Tập trung vào kinh doanh số, thương mại điện tử, bán hàng và ứng dụng AI trong kinh doanh.",
      },
    ],
    careerTiers: [
      {
        title: "Vị trí khởi đầu tham khảo",
        items: [
          "Chuyên viên Marketing kỹ thuật số",
          "Nhà sáng tạo nội dung hoặc Copywriter",
          "Chuyên viên truyền thông mạng xã hội",
          "Chuyên viên PR – Quan hệ công chúng",
          "Chuyên viên tổ chức sự kiện",
        ],
      },
      {
        title: "Hướng phát triển theo kinh nghiệm",
        items: [
          "Chuyên viên quản lý thương hiệu",
          "Chuyên viên lập kế hoạch truyền thông",
          "Chuyên viên truyền thông nội bộ",
          "Giảng viên hoặc khởi nghiệp trong lĩnh vực truyền thông – marketing số",
        ],
      },
    ],
    admissionsNote:
      "Đối tượng và phương thức xét tuyển thực hiện theo thông báo tuyển sinh hiện hành của Trường Đại học Phú Xuân.",
    tuitionBullets: sharedTuitionBullets,
    tuitionNote: "Mức phí và ưu đãi cần được xác nhận lại trước khi hoàn tất hồ sơ.",
  },
  "cong-nghe-thong-tin": {
    audience:
      "Phù hợp với người yêu thích sáng tạo hình ảnh, công nghệ và muốn làm việc với sản phẩm đồ họa, video, thương hiệu hoặc giao diện số.",
    learningIntro:
      "Lộ trình kết hợp nền tảng CNTT với mỹ thuật, thiết kế hình ảnh, thiết kế số, game 2D/3D và đồ họa chuyển động.",
    learningPoints: [
      "Cơ sở CNTT, cơ sở thiết kế đồ họa, lập trình và dữ liệu.",
      "Vẽ mỹ thuật, nghệ thuật chữ, lịch sử thiết kế và xử lý ảnh.",
      "Logo, catalogue, giao diện website, poster và hệ thống nhận diện thương hiệu.",
      "Đồ họa game 2D/3D, xử lý phim, đồ họa động 3D và dự án tốt nghiệp.",
    ],
    directions: [
      {
        label: "Đồ họa kỹ thuật số",
        description:
          "Định hướng chính của chương trình, kết hợp tư duy thiết kế với công cụ số để tạo hình ảnh, video và sản phẩm truyền thông.",
      },
    ],
    careerTiers: [
      {
        title: "Vị trí khởi đầu tham khảo",
        items: [
          "Chuyên viên thiết kế đồ họa",
          "Illustrator hoặc Animator",
          "UI/UX Designer",
          "VFX Artist hoặc Motion Designer",
          "Chuyên gia tư vấn thiết kế thương hiệu",
        ],
      },
      {
        title: "Hướng phát triển theo kinh nghiệm",
        items: [
          "Trưởng nhóm thiết kế",
          "Giám đốc sáng tạo",
          "Giảng viên hoặc khởi nghiệp trong lĩnh vực thiết kế đồ họa",
        ],
      },
    ],
    admissionsNote:
      "Đối tượng và phương thức xét tuyển thực hiện theo thông báo tuyển sinh hiện hành của Trường Đại học Phú Xuân.",
    tuitionBullets: sharedTuitionBullets,
    tuitionNote: "Mức phí và ưu đãi cần được xác nhận lại trước khi hoàn tất hồ sơ.",
  },
  "quan-tri-dich-vu-du-lich-va-lu-hanh": {
    audience:
      "Phù hợp với người muốn làm việc trong du lịch, lữ hành, khách sạn, nhà hàng và các hoạt động kinh doanh dịch vụ.",
    learningIntro:
      "Lộ trình đi từ nền tảng du lịch và quản trị đến nghiệp vụ lữ hành hoặc quản trị khách sạn.",
    learningPoints: [
      "Tổng quan du lịch, văn hóa Việt Nam, kinh tế du lịch và luật du lịch.",
      "Quản trị doanh thu, marketing ứng dụng, công nghệ và du lịch bền vững.",
      "Định hướng lữ hành: tuyến điểm, hướng dẫn, thiết kế và điều hành tour, quản trị kinh doanh lữ hành.",
      "Định hướng khách sạn: lưu trú, lễ tân, buồng phòng, nhà hàng – bar và quản trị dự án khách sạn.",
    ],
    directions: [
      {
        label: "Quản trị lữ hành",
        description:
          "Tập trung vào hệ thống tuyến điểm, nghiệp vụ hướng dẫn, thiết kế – điều hành tour, kinh doanh lữ hành và quản lý điểm đến.",
      },
      {
        label: "Quản trị khách sạn",
        description:
          "Tập trung vào kinh doanh lưu trú, lễ tân, buồng phòng, nhà hàng – bar, hội nghị và dự án khách sạn.",
      },
    ],
    careerTiers: [
      {
        title: "Vị trí khởi đầu tham khảo",
        items: [
          "Hướng dẫn viên quốc tế hoặc nội địa",
          "Điều hành tour",
          "Chuyên viên tư vấn du lịch",
          "Nhân viên kinh doanh và marketing du lịch – khách sạn",
          "Nhân viên lễ tân hoặc bộ phận phòng",
        ],
      },
      {
        title: "Hướng phát triển theo kinh nghiệm",
        items: [
          "Quản lý điểm đến",
          "Quản lý lễ tân khách sạn",
          "Giám sát bộ phận phòng",
          "Quản lý ẩm thực, spa – giải trí",
          "Khởi nghiệp về du lịch và khách sạn",
        ],
      },
    ],
    admissionsNote:
      "Đối tượng và phương thức xét tuyển thực hiện theo thông báo tuyển sinh hiện hành của Trường Đại học Phú Xuân.",
    tuitionBullets: sharedTuitionBullets,
    tuitionNote: "Mức phí và ưu đãi cần được xác nhận lại trước khi hoàn tất hồ sơ.",
  },
};

export function getProgramPageContent(program: ProgramDetail): ProgramPublicContent {
  const pageContent = content[program.slug];
  if (!pageContent) {
    return {
      audience: "Nhận tư vấn để xác định mục tiêu học tập và lộ trình phù hợp.",
      learningIntro: "Nội dung chương trình được trình bày theo dữ liệu học phần hiện có.",
      learningPoints: [],
      directions: [],
      careerTiers: [],
      admissionsNote: "Vui lòng xác nhận điều kiện xét tuyển theo thông báo hiện hành.",
      tuitionBullets: [],
      tuitionNote: "Vui lòng xác nhận học phí và ưu đãi tại thời điểm đăng ký.",
      faqs: sharedFaqs(program),
    };
  }
  return { ...pageContent, faqs: sharedFaqs(program) };
}
