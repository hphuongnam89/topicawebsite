export interface Campus {
  city: string;
  address: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
}

/**
 * Campus addresses verified from https://topicauni.edu.vn/ footer (2026-08-28).
 * Campuses share unified contact points managed by role.
 */
export const campuses: readonly Campus[] = [
  {
    city: "TP. Hồ Chí Minh",
    address: "104–106–108 Nguyễn Văn Lượng, P. Gò Vấp, TP. Hồ Chí Minh",
  },
  {
    city: "Hà Nội",
    address: "27 Lê Văn Lương, Thanh Xuân, Hà Nội",
  },
  {
    city: "TP. Đà Nẵng",
    address: "Lô A2-15, Khu E mở rộng, Trần Nam Trung, P. Hòa Xuân, TP. Đà Nẵng",
  },
  {
    city: "TP. Huế",
    address: "28 Nguyễn Tri Phương, P. Thuận Hóa, TP. Huế",
  },
  {
    city: "TP. Hải Phòng",
    address:
      "Đường 4, số 99 Võ Nguyên Giáp, Khu đô thị ven sông Lạch Tray Waterfront, TP. Hải Phòng",
  },
  {
    city: "TP. Cần Thơ",
    address: "09 Nguyễn Thái Sơn, P. Hưng Phú, TP. Cần Thơ",
  },
] as const;

export interface ContactChannel {
  label: string;
  shortLabel?: string;
  value: string;
  rawPhone?: string;
  href: string;
  role: "admissions" | "general" | "support";
  note?: string;
}

export interface ServicePortal {
  id: string;
  name: string;
  role: string;
  url: string;
  isExternal: boolean;
  status: "verified" | "pending_verification";
}

/**
 * Verified contact channels by role.
 * - admissionsHotline: 1800 646 857 (Toll-free hotline for applicants)
 * - admissionsDirect: 0901 795 580 (Direct hotline for mobile / quick advisory)
 * - admissionsEmail: tuyensinh@topicauni.edu.vn (Admissions desk)
 * - generalEmail: info@topicauni.edu.vn (General institutional inquiries)
 */
export const contactChannels = {
  admissionsHotline: {
    label: "Hotline tuyển sinh (Miễn cước)",
    shortLabel: "1800 646 857",
    value: "1800 646 857",
    rawPhone: "1800646857",
    href: "tel:1800646857",
    role: "admissions",
    note: "Miễn cước cuộc gọi",
  },
  admissionsDirect: {
    label: "Hotline tư vấn nhanh",
    shortLabel: "0901 795 580",
    value: "0901 795 580",
    rawPhone: "0901795580",
    href: "tel:0901795580",
    role: "support",
  },
  admissionsEmail: {
    label: "Email tuyển sinh",
    value: "tuyensinh@topicauni.edu.vn",
    href: "mailto:tuyensinh@topicauni.edu.vn",
    role: "admissions",
  },
  generalEmail: {
    label: "Email thông tin chung",
    value: "info@topicauni.edu.vn",
    href: "mailto:info@topicauni.edu.vn",
    role: "general",
  },
} as const;

/**
 * Service portals with verified destinations and distinct operational roles.
 * E-LIB is Phu Xuan University's digital library, distinct from the Elearning LMS portal.
 */
export const servicePortals: readonly ServicePortal[] = [
  {
    id: "elearning",
    name: "Cổng học tập Elearning",
    role: "Hệ thống quản lý học tập trực tuyến (LMS)",
    url: "/he-thong/",
    isExternal: false,
    status: "verified",
  },
  {
    id: "elib",
    name: "Thư viện điện tử (E-LIB PXU)",
    role: "Thư viện số Trường Đại học Phú Xuân",
    url: "https://elib.pxu.edu.vn/",
    isExternal: true,
    status: "verified",
  },
  {
    id: "admissions_portal",
    name: "Cổng đăng ký xét tuyển",
    role: "Tiếp nhận hồ sơ xét tuyển trực tuyến",
    url: "https://www.tuyensinh.topicauni.edu.vn/",
    isExternal: true,
    status: "verified",
  },
] as const;

/** Shared contact info with explicit role support for legacy consumers */
export const contactInfo = {
  phone: contactChannels.admissionsDirect.rawPhone,
  phoneFormatted: contactChannels.admissionsDirect.value,
  hotline: contactChannels.admissionsHotline.value,
  hotlineHref: contactChannels.admissionsHotline.href,
  email: contactChannels.generalEmail.value,
  admissionsEmail: contactChannels.admissionsEmail.value,
  sourceUrl: "https://topicauni.edu.vn/",
} as const;
