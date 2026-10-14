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

/**
 * Chuyển đổi thời gian bất kỳ sang chuẩn chuỗi ISO UTC (kết thúc bằng Z)
 * Dùng để lưu trữ chuẩn mực trong SQLite/Database
 */
export function toUtcIso(input: string | Date | number): string {
  const date = parseDate(input);
  if (!date) {
    throw new Error(`Thời gian không hợp lệ: ${String(input)}`);
  }
  return date.toISOString();
}

/**
 * Kiểm tra xem thời điểm hiện tại có nằm trong khoảng hiệu lực [start, end) hay không
 * Quy tắc biên: start <= now < end (Nửa mở - Half-open interval)
 */
export function isWithinInterval(
  now: string | Date | number,
  start: string | Date | number,
  end?: string | Date | number | null,
): boolean {
  const nowDate = parseDate(now);
  const startDate = parseDate(start);
  if (!nowDate || !startDate) return false;

  const nowMs = nowDate.getTime();
  const startMs = startDate.getTime();

  if (nowMs < startMs) return false;

  if (end) {
    const endDate = parseDate(end);
    if (endDate && nowMs >= endDate.getTime()) {
      return false;
    }
  }

  return true;
}

export const formatDateGMT7 = formatDateVN;
export const formatDateTimeGMT7 = formatDateTimeVN;
export const formatDateLongGMT7 = formatDateLongVN;
