import { english } from "./english";
export type Locale = "vi" | "en";
const normalize = (text: string) => text.replace(/\s+/g, " ").trim().normalize("NFC");
const caseInsensitiveEnglish = Object.fromEntries(Object.entries(english).map(([key, value]) => [normalize(key).toLocaleLowerCase("vi"), value]));

export function translateText(text: string, locale: Locale): string {
  if (locale === "vi") return text;
  const key = normalize(text);
  let translated = english[key] ?? caseInsensitiveEnglish[key.toLocaleLowerCase("vi")];
  if (!translated) {
    const program = key.match(/^Tìm hiểu chương trình (.+)$/);
    const illustration = key.match(/^Ảnh minh họa cho ngành (.+)$/);
    const titleWithTopica = key.match(/^(.+?)\s*\|\s*Topica$/i);
    const banner = key.match(/^Hiển thị banner (\d+): (.+)$/);
    const story = key.match(/^Xem chia sẻ (\d+)$/);
    const course = key.match(/^(Ngoại ngữ|Giáo dục thể chất|Vẽ mỹ thuật|Biên dịch|Đọc|Viết|Giao tiếp|Nói|Tiếng Anh chuyên ngành|Tiếng Anh thương mại|Tiếng Anh du lịch) (\d+)$/);
    const credits = key.match(/^(\d+) (tín chỉ|học phần|học kỳ)$/);
    const contact = key.match(/^(Gửi email tư vấn tuyển sinh|Gọi hotline tư vấn|Hotline tư vấn:|Email tuyển sinh:)\s*(.+)$/);
    if (titleWithTopica) translated = `${translateText(titleWithTopica[1], locale)} | Topica`;
    if (illustration) translated = `Illustration for ${translateText(illustration[1], locale)}`;
    if (program) translated = `Explore ${translateText(program[1], locale)}`;
    if (banner) translated = `Show slide ${banner[1]}: ${translateText(banner[2], locale)}`;
    if (story) translated = `View story ${story[1]}`;
    if (course) translated = `${translateText(course[1], locale)} ${course[2]}`;
    if (credits) translated = `${credits[1]} ${credits[2] === "tín chỉ" ? "credits" : credits[2] === "học phần" ? "courses" : "semesters"}`;
    if (contact) {
      const labels: Record<string, string> = { "Gửi email tư vấn tuyển sinh": "Email admissions", "Gọi hotline tư vấn": "Call admissions", "Hotline tư vấn:": "Admissions hotline:", "Email tuyển sinh:": "Admissions email:" };
      translated = `${labels[contact[1]]} ${contact[2]}`;
    }
  }
  if (!translated) return text;
  return text.replace(/\S[\s\S]*\S|\S/, () => translated!);
}

// CMS HTML is already sanitised; translate text without changing its tags or URLs.
export function translateHtml(html: string, locale: Locale): string {
  if (locale === "vi") return html;
  return html.replace(/(^|>)([^<]+)(?=<|$)/g, (_match, prefix: string, text: string) => {
    const decoded = text.replace(/&amp;/g, "&").replace(/&nbsp;|&#160;/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
    const translated = translateText(decoded, locale);
    return prefix + (translated === decoded ? text : translated.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  });
}
