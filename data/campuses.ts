export interface Campus {
  city: string;
  address: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
}

/**
 * Campus addresses verified from https://topicauni.edu.vn/ footer (2026-08-28).
 * Per-campus phone/email removed — official site only publishes shared contact:
 *   Phone: 0901795580
 *   Email: info@topicauni.edu.vn
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
    address: "Đường 4, số 99 Võ Nguyên Giáp, Khu đô thị ven sông Lạch Tray Waterfront, TP. Hải Phòng",
  },
  {
    city: "TP. Cần Thơ",
    address: "09 Nguyễn Thái Sơn, P. Hưng Phú, TP. Cần Thơ",
  },
] as const;

/** Shared contact info from the official website footer */
export const contactInfo = {
  phone: "0901795580",
  email: "info@topicauni.edu.vn",
  sourceUrl: "https://topicauni.edu.vn/",
} as const;
