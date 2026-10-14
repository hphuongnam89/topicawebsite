import Link from "next/link";
import { redirect } from "next/navigation";
import { History, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { countAuditLogs, getAuditLogActors, getAuditLogs } from "@/lib/services/cms-models";
import type { AuditLogRecord } from "@/lib/db/types";

const entityTypes = [
  "article",
  "page",
  "program",
  "organization",
  "admission_round",
  "tuition_policy",
  "scholarship",
  "document",
  "media",
  "lead",
  "user",
  "setting",
  "homepage",
  "category",
] as const;

const entityLabels: Record<(typeof entityTypes)[number], string> = {
  article: "Tin tức",
  page: "Trang",
  program: "Ngành học",
  organization: "Tổ chức",
  admission_round: "Đợt tuyển sinh",
  tuition_policy: "Chính sách học phí",
  scholarship: "Học bổng",
  document: "Tài liệu",
  media: "Tệp media",
  lead: "Yêu cầu tư vấn",
  user: "Tài khoản",
  setting: "Cấu hình",
  homepage: "Trang chủ",
  category: "Danh mục",
};

const actionLabels: Record<string, string> = {
  create: "Tạo bản nháp / tạo mới",
  update: "Cập nhật",
  delete: "Xóa",
  submit_review: "Gửi duyệt",
  approve: "Phê duyệt",
  reject: "Trả lại chỉnh sửa",
  publish: "Công bố",
  archive: "Lưu trữ",
};

type AuditSearchParams = {
  entityType?: string | string[];
  from?: string | string[];
  to?: string | string[];
  actorId?: string | string[];
  action?: string | string[];
  page?: string | string[];
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value?: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
}

function startOfVietnamDay(value: string, nextDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day + (nextDay ? 1 : 0)) - 7 * 60 * 60 * 1000,
  ).toISOString();
}

function changedFieldLabels(log: AuditLogRecord) {
  try {
    const fields: unknown = JSON.parse(log.changed_fields);
    if (!Array.isArray(fields)) return "Nội dung";
    return (
      fields
        .map((field) =>
          field === "workflow_state"
            ? "trạng thái"
            : field === "payload"
              ? "nội dung"
              : typeof field === "string"
                ? field.replaceAll("_", " ")
                : "",
        )
        .filter(Boolean)
        .join(", ") || "Nội dung"
    );
  } catch {
    return "Nội dung";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Thời điểm không hợp lệ"
    : new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<AuditSearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin/content");

  const params = await searchParams;
  const requestedEntity = first(params.entityType);
  const entityType = entityTypes.includes(requestedEntity as (typeof entityTypes)[number])
    ? (requestedEntity as (typeof entityTypes)[number])
    : "";
  const rawFrom = first(params.from) ?? "";
  const rawTo = first(params.to) ?? "";
  const actorId = first(params.actorId) ?? "";
  const requestedAction = first(params.action) ?? "";
  const action = Object.hasOwn(actionLabels, requestedAction) ? requestedAction : "";
  const requestedPage = Number(first(params.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = validDate(rawFrom) ? rawFrom : "";
  const to = validDate(rawTo) ? rawTo : "";
  const invalidDate = (rawFrom && !from) || (rawTo && !to);
  const invertedRange = from && to && from > to;
  const filters = {
    entityType: entityType || undefined,
    startDate: from && !invertedRange ? startOfVietnamDay(from) : undefined,
    endDate: to && !invertedRange ? startOfVietnamDay(to, true) : undefined,
    actorId: actorId || undefined,
    action: action || undefined,
  };
  const total = countAuditLogs(filters);
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const logs = getAuditLogs({ ...filters, limit: pageSize, offset: (currentPage - 1) * pageSize });
  const actors = getAuditLogActors();
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (entityType) query.set("entityType", entityType);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (actorId) query.set("actorId", actorId);
    if (action) query.set("action", action);
    query.set("page", String(nextPage));
    return `/admin/audit?${query}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-gold-700 uppercase">
            Vận hành & bảo mật
          </p>
          <h1 className="mt-1 flex items-center gap-3 font-display text-2xl font-bold text-navy-950 sm:text-3xl">
            <History className="h-7 w-7 text-gold-700" /> Nhật ký quản trị
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-600">
            Theo dõi thao tác quản trị trên nội dung, tài khoản, cấu hình và tệp media.
          </p>
        </div>
        <Link
          href="/admin/content"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Mở quy trình nội dung
        </Link>
      </header>

      <form
        action="/admin/audit"
        method="get"
        className="grid gap-3 rounded-xl border border-line-200 bg-white p-4 shadow-xs sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[repeat(5,minmax(0,1fr))_auto] 2xl:items-end"
      >
        <label className="grid gap-1.5 text-sm font-semibold text-ink-800">
          Loại nội dung
          <select
            name="entityType"
            defaultValue={entityType}
            className="h-11 rounded-lg border border-line-200 bg-white px-3 font-normal text-ink-900 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
          >
            <option value="">Tất cả nội dung</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {entityLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink-800">
          Từ ngày
          <input
            type="date"
            name="from"
            defaultValue={from || rawFrom}
            className="h-11 rounded-lg border border-line-200 bg-white px-3 font-normal text-ink-900 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink-800">
          Đến ngày
          <input
            type="date"
            name="to"
            defaultValue={to || rawTo}
            className="h-11 rounded-lg border border-line-200 bg-white px-3 font-normal text-ink-900 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink-800">
          Người thực hiện
          <select
            name="actorId"
            defaultValue={actorId}
            className="h-11 rounded-lg border border-line-200 bg-white px-3 font-normal text-ink-900"
          >
            <option value="">Tất cả người dùng</option>
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink-800">
          Hành động
          <select
            name="action"
            defaultValue={action}
            className="h-11 rounded-lg border border-line-200 bg-white px-3 font-normal text-ink-900"
          >
            <option value="">Tất cả hành động</option>
            {Object.entries(actionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 font-semibold text-white transition-colors hover:bg-navy-800"
        >
          <Search className="h-4 w-4" /> Lọc nhật ký
        </button>
        <p className="text-xs text-ink-500 sm:col-span-2 2xl:col-span-6">
          Ngày được lọc theo giờ Việt Nam (UTC+7). Nhật ký chỉ ghi tên các trường đã đổi, không lưu
          giá trị nội dung, mật khẩu hoặc địa chỉ IP.
        </p>
      </form>

      {(invalidDate || invertedRange) && (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {invertedRange
            ? "Khoảng ngày không hợp lệ: ngày bắt đầu phải trước hoặc bằng ngày kết thúc."
            : "Ngày lọc không hợp lệ. Vui lòng chọn lại ngày."}
        </p>
      )}

      <section
        aria-labelledby="audit-results-title"
        className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs"
      >
        <div className="flex flex-col gap-1 border-b border-line-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="audit-results-title" className="font-display text-lg font-bold text-navy-950">
            Hoạt động gần đây
          </h2>
          <span className="text-sm text-ink-500">
            {total} hoạt động · trang {currentPage}/{totalPages}
          </span>
        </div>
        {logs.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <History className="mx-auto h-8 w-8 text-gold-700" />
            <h3 className="mt-3 font-semibold text-navy-950">Chưa có hoạt động phù hợp</h3>
            <p className="mt-1 text-sm text-ink-500">
              Thử thay đổi bộ lọc hoặc quay lại khi có cập nhật nội dung.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-100">
            {logs.map((log) => {
              const type = entityTypes.includes(log.entity_type as (typeof entityTypes)[number])
                ? entityLabels[log.entity_type as (typeof entityTypes)[number]]
                : "Nội dung";
              return (
                <article
                  key={log.id}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-800">
                        {actionLabels[log.action] ?? log.action.replaceAll("_", " ")}
                      </span>
                      <span className="text-sm font-semibold text-navy-950">
                        {type} · {log.entity_id}
                      </span>
                      {log.revision_id !== null && (
                        <span className="text-xs text-ink-500">Bản sửa #{log.revision_id}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-600">
                      Thực hiện bởi{" "}
                      <span className="font-medium text-ink-900">{log.actor_name}</span> · Trường
                      ghi nhận: {changedFieldLabels(log)}
                    </p>
                  </div>
                  <time dateTime={log.timestamp} className="text-sm text-ink-500 sm:text-right">
                    {formatDate(log.timestamp)}
                  </time>
                </article>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <nav
            aria-label="Phân trang nhật ký"
            className="flex items-center justify-between border-t border-line-200 px-5 py-3"
          >
            <Link
              aria-disabled={currentPage <= 1}
              className={`rounded border px-3 py-2 text-sm ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
              href={pageHref(Math.max(1, currentPage - 1))}
            >
              Trước
            </Link>
            <span className="text-sm text-ink-600">
              {currentPage} / {totalPages}
            </span>
            <Link
              aria-disabled={currentPage >= totalPages}
              className={`rounded border px-3 py-2 text-sm ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
              href={pageHref(Math.min(totalPages, currentPage + 1))}
            >
              Sau
            </Link>
          </nav>
        )}
      </section>
    </div>
  );
}
