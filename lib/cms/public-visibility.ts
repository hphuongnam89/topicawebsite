// Keep incomplete CMS pages in the database so they can be restored later.
// Remove a slug here once its content is ready to publish again.
export const temporarilyHiddenPublicPageSlugs = new Set([
  "bao-cao-thuong-nien",
  "cam-nhan-ve-dh-phu-xuan",
  "chuong-trinh",
  "chuong-trinh-dao-tao-ngan-han",
  "chuong-trinh-dao-tao-tu-xa",
  "ke-hoach-dao-tao",
  "khao-thi-dbcl",
  "nckh-htqt",
  "thong-tin-lien-thong",
]);

export function isPublicPageTemporarilyHidden(slug: string): boolean {
  return temporarilyHiddenPublicPageSlugs.has(slug);
}
