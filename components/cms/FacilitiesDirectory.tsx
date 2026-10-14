import { LocalizedText } from "@/components/i18n/LocalizedText";
import { MapPin } from "lucide-react";

const facilities = [
  ["TP. Hồ Chí Minh", "104–106–108 Nguyễn Văn Lượng, Phường Gò Vấp, TP. Hồ Chí Minh"],
  ["Hà Nội", "27 Lê Văn Lương, Thanh Xuân, Hà Nội"],
  ["TP. Đà Nẵng", "Lô A2-15, Khu E mở rộng, Trần Nam Trung, Phường Hòa Xuân, TP. Đà Nẵng"],
  ["TP. Huế", "28 Nguyễn Tri Phương, Phường Thuận Hóa, TP. Huế"],
  [
    "TP. Hải Phòng",
    "Đường 4, số 99 Võ Nguyên Giáp, Khu đô thị ven sông Lạch Tray Waterfront, TP. Hải Phòng",
  ],
  ["TP. Cần Thơ", "09 Nguyễn Thái Sơn, Phường Hưng Phú, TP. Cần Thơ"],
] as const;

export function FacilitiesDirectory() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-sans text-body-lg text-ink-700">
          <LocalizedText>
            Mạng lưới cơ sở hỗ trợ học tập và tư vấn tuyển sinh trên toàn quốc.
          </LocalizedText>
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map(([city, address]) => (
          <article
            key={city}
            className="rounded-xl border border-line-200 bg-white p-6 shadow-sm transition-all hover:border-gold-400 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-navy-100 bg-navy-50 text-navy-800">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink-950">
              <LocalizedText>{city}</LocalizedText>
            </h2>
            <p className="mt-3 font-sans text-body text-ink-700">
              <LocalizedText>{address}</LocalizedText>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
