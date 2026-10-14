import { english } from "./english";
export type Locale = "vi" | "en";
const normalize = (text: string) => text.replace(/\s+/g, " ").trim().normalize("NFC");
const caseInsensitiveEnglish = Object.fromEntries(
  Object.entries(english).map(([key, value]) => [normalize(key).toLocaleLowerCase("vi"), value]),
);

const reverseEnglish: Record<string, string> = {};
for (const [key, value] of Object.entries(english)) {
  const normVal = normalize(value).toLocaleLowerCase("en");
  if (
    !reverseEnglish[normVal] ||
    (reverseEnglish[normVal] === reverseEnglish[normVal].toUpperCase() && key !== key.toUpperCase())
  ) {
    reverseEnglish[normVal] = key;
  }
}

export function translateText(text: string, locale: Locale): string {
  if (locale === "vi") return text;
  const key = normalize(text);
  let translated = english[key] ?? caseInsensitiveEnglish[key.toLocaleLowerCase("vi")];
  if (!translated) {
    const program = key.match(/^Tìm hiểu chương trình (.+)$/i);
    const illustration = key.match(/^Ảnh minh họa cho ngành (.+)$/i);
    const titleWithTopica = key.match(/^(.+?)\s*\|\s*Topica$/i);
    const pipeMatch = key.match(/^(.+?)\s*\|\s*(.+)$/);
    const dashMatch = key.match(/^(.+?)\s*[–—-]\s*(.+)$/);
    const banner = key.match(/^Hiển thị banner (\d+): (.+)$/i);
    const story = key.match(/^Xem chia sẻ (\d+)$/i);
    const course = key.match(
      /^(Ngoại ngữ|Giáo dục thể chất|Vẽ mỹ thuật|Biên dịch|Đọc|Viết|Giao tiếp|Nói|Tiếng Anh chuyên ngành|Tiếng Anh thương mại|Tiếng Anh du lịch) (\d+)$/i,
    );
    const credits = key.match(/^(\d+) (tín chỉ|học phần|học kỳ)$/i);
    const contact = key.match(
      /^(Gửi email tư vấn tuyển sinh|Gọi hotline tư vấn|Hotline tư vấn:|Email tuyển sinh:)\s*(.+)$/i,
    );
    if (titleWithTopica) {
      translated = `${translateText(titleWithTopica[1], locale)} | Topica`;
    } else if (pipeMatch) {
      const left = translateText(pipeMatch[1], locale);
      const right = translateText(pipeMatch[2], locale);
      if (left !== pipeMatch[1] || right !== pipeMatch[2]) {
        translated = `${left} | ${right}`;
      }
    } else if (dashMatch) {
      const left = translateText(dashMatch[1], locale);
      const right = translateText(dashMatch[2], locale);
      if (left !== dashMatch[1] || right !== dashMatch[2]) {
        translated = `${left} – ${right}`;
      }
    }
    if (!translated && illustration)
      translated = `Illustration for ${translateText(illustration[1], locale)}`;
    if (!translated && program) translated = `Explore ${translateText(program[1], locale)}`;
    if (!translated && banner)
      translated = `Show slide ${banner[1]}: ${translateText(banner[2], locale)}`;
    if (!translated && story) translated = `View story ${story[1]}`;
    if (!translated && course) translated = `${translateText(course[1], locale)} ${course[2]}`;
    if (!translated && credits) {
      translated = `${credits[1]} ${credits[2] === "tín chỉ" ? "credits" : credits[2] === "học phần" ? "courses" : "semesters"}`;
    }
    if (!translated && contact) {
      const labels: Record<string, string> = {
        "Gửi email tư vấn tuyển sinh": "Email admissions",
        "Gọi hotline tư vấn": "Call admissions",
        "Hotline tư vấn:": "Admissions hotline:",
        "Email tuyển sinh:": "Admissions email:",
      };
      translated = `${labels[contact[1]]} ${contact[2]}`;
    }
  }
  if (!translated) return text;
  return text.replace(/\S[\s\S]*\S|\S/, () => translated!);
}

export function reverseTranslateText(text: string): string | null {
  const key = normalize(text);
  const direct = reverseEnglish[key.toLocaleLowerCase("en")];
  if (direct) return direct;
  const titleWithTopica = key.match(/^(.+?)\s*\|\s*Topica$/i);
  if (titleWithTopica) {
    const rev = reverseTranslateText(titleWithTopica[1]);
    if (rev) return `${rev} | Topica`;
  }
  return null;
}

// CMS HTML is already sanitised; translate text without changing its tags or URLs.
export function translateHtml(html: string, locale: Locale): string {
  if (locale === "vi") return html;
  return html.replace(/(^|>)([^<]+)(?=<|$)/g, (_match, prefix: string, text: string) => {
    const decoded = text
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;|&#160;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'");
    const translated = translateText(decoded, locale);
    return (
      prefix +
      (translated === decoded
        ? text
        : translated.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    );
  });
}
