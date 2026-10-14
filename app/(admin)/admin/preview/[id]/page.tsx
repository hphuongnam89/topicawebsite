import { getCurrentUser } from "@/lib/auth/session";
import { verifyPreviewToken } from "@/lib/auth/preview";
import { getRevisionById } from "@/lib/services/revisions";
import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import Link from "next/link";
export const metadata = { title: "Xem trước nội dung", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "Chưa nhập";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  if (/^\/(?!\/)/.test(value) && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 border-t border-line-200 py-3">
      <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-6 break-words whitespace-pre-wrap text-ink-900">
        {display(value)}
      </dd>
    </div>
  );
}

function DomainPreview({
  type,
  payload,
  title,
}: {
  type: string;
  payload: Record<string, unknown>;
  title: string;
}) {
  const applicationHref = safeHref(payload.application_url);
  const fileHref = safeHref(payload.view_url) ?? safeHref(payload.file_url);
  const money = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${value.toLocaleString("vi-VN")} ₫`
      : display(value);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="overflow-hidden rounded-2xl border border-line-200 bg-white shadow-sm">
        <div className="bg-navy-950 px-6 py-8 text-white sm:px-10">
          <p className="text-xs font-bold tracking-[0.16em] text-gold-300 uppercase">
            {type === "program"
              ? "Chương trình đào tạo"
              : type === "admission_round"
                ? "Thông tin tuyển sinh"
                : type === "tuition_policy"
                  ? "Chính sách học phí"
                  : type === "scholarship"
                    ? "Chính sách học bổng"
                    : type === "document"
                      ? "Tài liệu chính thức"
                      : "Thông tin tổ chức"}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold sm:text-5xl">
            {display(payload.name ?? payload.title ?? title)}
          </h1>
          {typeof payload.major === "string" && (
            <p className="mt-3 text-lg text-gold-200">{payload.major}</p>
          )}
          {typeof payload.summary === "string" && (
            <p className="mt-4 max-w-3xl leading-7 text-white/80">{payload.summary}</p>
          )}
        </div>

        {type === "tuition_policy" ? (
          <div className="grid gap-6 p-6 sm:p-10">
            <div className="rounded-xl bg-paper p-6 sm:p-8">
              <p className="text-sm font-semibold text-ink-600">Tổng học phí theo bản xem trước</p>
              <p className="mt-2 font-display text-3xl font-bold text-navy-950 sm:text-5xl">
                {money(payload.total_tuition)}
              </p>
            </div>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Detail label="Đơn giá / tín chỉ" value={money(payload.unit_price_per_credit)} />
              <Detail label="Tổng số tín chỉ" value={payload.total_credits} />
              <Detail label="Đối tượng áp dụng" value={payload.audience} />
              <Detail label="Khóa tuyển sinh" value={payload.cohort} />
              <Detail label="Các khoản phí khác" value={payload.other_fees} />
              <Detail label="Điều kiện tính phí" value={payload.assumptions} />
              <Detail label="Hiệu lực từ" value={payload.effective_from} />
              <Detail label="Hiệu lực đến" value={payload.effective_to} />
            </dl>
          </div>
        ) : type === "scholarship" ? (
          <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)] sm:p-10">
            <div>
              <p className="font-display text-4xl font-bold text-gold-700">
                {display(payload.value)} {payload.value_type === "percent" ? "%" : "₫"}
              </p>
              <h2 className="mt-5 font-display text-2xl font-bold text-navy-950">
                Điều kiện và đối tượng
              </h2>
              <p className="mt-2 leading-7 text-ink-700">{display(payload.conditions)}</p>
            </div>
            <dl className="grid content-start">
              <Detail label="Phạm vi áp dụng" value={payload.scope} />
              <Detail label="Ngành áp dụng" value={payload.program_ids} />
              <Detail label="Hạn đăng ký" value={payload.deadline_at} />
              <Detail label="Cách xét" value={payload.evaluation_method} />
            </dl>
          </div>
        ) : type === "admission_round" ? (
          <div className="p-6 sm:p-10">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Detail label="Đối tượng" value={payload.audience} />
              <Detail label="Khóa tuyển sinh" value={payload.cohort} />
              <Detail label="Mở nhận hồ sơ" value={payload.open_at} />
              <Detail label="Hạn nhận hồ sơ" value={payload.deadline_at} />
              <Detail label="Khai giảng" value={payload.start_at} />
              <Detail label="Tài liệu hướng dẫn" value={payload.documents} />
            </dl>
            {applicationHref && (
              <a
                href={applicationHref}
                target={applicationHref.startsWith("/") ? undefined : "_blank"}
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-gold-600 px-5 font-semibold text-navy-950"
              >
                Mở liên kết xét tuyển
              </a>
            )}
          </div>
        ) : type === "document" ? (
          <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)] sm:p-10">
            <div>
              {typeof payload.mime_type === "string" &&
                payload.mime_type.startsWith("image/") &&
                fileHref && (
                  <img
                    src={fileHref}
                    alt={display(payload.alt)}
                    className="max-h-[32rem] w-full rounded-xl bg-paper object-contain"
                  />
                )}
              {typeof payload.caption === "string" && (
                <p className="mt-3 text-sm text-ink-600">{payload.caption}</p>
              )}
              {fileHref && (
                <a
                  href={fileHref}
                  target={fileHref.startsWith("/") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-navy-900 px-5 font-semibold text-white"
                >
                  Mở tệp xem trước
                </a>
              )}
            </div>
            <dl className="grid content-start">
              <Detail label="Loại tài liệu" value={payload.type} />
              <Detail label="Ngày ban hành" value={payload.published_date} />
              <Detail label="Phiên bản" value={payload.version} />
              <Detail label="Quyền truy cập" value={payload.access} />
              <Detail label="Nguồn" value={payload.source} />
              <Detail label="Quyền sử dụng" value={payload.rights} />
            </dl>
          </div>
        ) : type === "organization" ? (
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10">
            <dl>
              <Detail label="Phạm vi" value={payload.role_scope} />
              <Detail label="Điện thoại" value={payload.phone} />
              <Detail label="Hotline" value={payload.hotline} />
              <Detail label="Email" value={payload.email} />
              <Detail label="Giờ hỗ trợ" value={payload.support_hours} />
            </dl>
            <dl>
              <Detail label="Địa điểm" value={payload.locations} />
              <Detail label="Cổng dịch vụ" value={payload.service_urls} />
              <Detail label="Website" value={payload.website_url} />
              <Detail label="Nguồn" value={payload.source} />
            </dl>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            {typeof payload.summary === "string" && payload.summary && (
              <div className="mb-6 rounded-lg border border-line-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-ink-500 uppercase">Tóm tắt chương trình</p>
                <p className="mt-1 text-sm leading-6 text-ink-900">{payload.summary}</p>
              </div>
            )}
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Detail label="Mã ngành" value={payload.code} />
              <Detail label="Nhóm ngành" value={payload.group} />
              <Detail label="Hình thức" value={payload.form} />
              <Detail label="Văn bằng" value={payload.degree_name} />
              <Detail label="Đơn vị cấp bằng" value={payload.awarding_institution} />
              <Detail label="Tín chỉ & thời gian" value={payload.duration_credits} />
              <Detail label="Đường dẫn" value={payload.slug} />
              <Detail label="Cơ hội nghề nghiệp" value={payload.careers} />
              <Detail label="Khung chương trình" value={payload.curriculum} />
              <Detail label="Lộ trình học tập" value={payload.semesters} />
              <Detail label="Điều kiện tuyển sinh" value={payload.admissions} />
              <Detail label="Điều kiện tốt nghiệp" value={payload.graduation} />
              <Detail label="Học tập nâng cao" value={payload.further_study} />
              <Detail label="Nguồn" value={payload.source} />
            </dl>
          </div>
        )}
      </section>
    </main>
  );
}

export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();
  const id = Number((await params).id),
    revision = getRevisionById(id),
    token = (await searchParams).token;
  if (!revision || !token || !verifyPreviewToken(token, user.id, id, revision.updated_at))
    notFound();
  const payload = JSON.parse(revision.payload);
  return (
    <div className="min-w-0">
      <div role="status" className="border-b border-gold-600 bg-gold-100 p-4 text-navy-950">
        Xem trước bản {revision.version} — {revision.workflow_state}. Chưa thay đổi trang công khai.{" "}
        <Link className="underline" href="/admin/content">
          Thoát xem trước
        </Link>
      </div>
      {revision.entity_type === "article" || revision.entity_type === "page" ? (
        <CmsPageView
          showAdmissionCTA={false}
          page={{
            id,
            slug: payload.slug || "preview",
            title: payload.title || revision.title,
            sourceUrl: "",
            contentHtml: sanitizeWordPressHtml(payload.content_html || ""),
            publishedAt: revision.created_at,
            updatedAt: revision.updated_at,
            excerpt: payload.excerpt || "",
          }}
        />
      ) : (
        <DomainPreview type={revision.entity_type} payload={payload} title={revision.title} />
      )}
    </div>
  );
}
