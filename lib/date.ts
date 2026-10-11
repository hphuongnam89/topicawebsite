/**
 * Tiện ích định dạng ngày giờ chuẩn Việt Nam (Múi giờ Asia/Bangkok - GMT+7)
 */

const VN_TIMEZONE = "Asia/Bangkok";

export function parseDate(input: string | Date | number | null | undefined): Date | null {
  if (!input) return null;
  const date = typeof input === "object" && input instanceof Date ? input : new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Định dạng ngày dạng DD/MM/YYYY
 * Ví dụ: 20/07/2026
 */
export function formatDateVN(input: string | Date | number | null | undefined): string {
  const date = parseDate(input);
  if (!date) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Định dạng ngày giờ dạng HH:mm, DD/MM/YYYY
 * Ví dụ: 14:30, 20/07/2026
 */
export function formatDateTimeVN(input: string | Date | number | null | undefined): string {
  const date = parseDate(input);
  if (!date) return "";

  const timePart = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const datePart = formatDateVN(date);
  return `${timePart}, ${datePart}`;
}

/**
 * Định dạng ngày đầy đủ dạng "ngày DD tháng MM năm YYYY"
 * Ví dụ: Ngày 20 tháng 07 năm 2026
 */
export function formatDateLongVN(input: string | Date | number | null | undefined): string {
  const date = parseDate(input);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";

  return `Ngày ${day} tháng ${month} năm ${year}`;
}
