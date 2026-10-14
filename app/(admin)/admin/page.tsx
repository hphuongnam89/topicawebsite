import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getLeads, getCategories, getAnalyticsStats } from "@/lib/db";
import { getReviewQueueCount } from "@/lib/services/revisions";
import { getCmsOperationsHealth } from "@/lib/services/cms-models";
import { getAdminArticleStats } from "@/lib/services/admin-content";
import { redirect } from "next/navigation";
import {
  Users,
  FileText,
  FolderTree,
  Image as ImageIcon,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  BarChart,
  ClipboardCheck,
} from "lucide-react";

type DashboardSearchParams = { range?: string | string[] };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") redirect("/admin/content");
  const params = await searchParams;
  const requestedRange = Array.isArray(params.range) ? params.range[0] : params.range;
  const range = [7, 30, 90].includes(Number(requestedRange)) ? Number(requestedRange) : 7;
  const totalLeads = getLeads().total;
  const { items: recentLeads } = getLeads({ limit: 5 });
  const articleStats = getAdminArticleStats();
  const recentArticles = articleStats.recentArticles;
  const categories = getCategories();

  const newLeadsCount = getLeads({ status: "new" }).total;
  const reviewQueueCount = getReviewQueueCount();
  const analytics = getAnalyticsStats(range);
  const cmsHealth = getCmsOperationsHealth();

  const statCards = [
    {
      title: "Lượt truy cập",
      value: analytics.totalViews,
      total: `Trong ${range} ngày qua`,
      icon: BarChart,
      color: "bg-indigo-600 text-white",
      href: "/admin", // No specific page for analytics yet
    },
    {
      title: "Lead Tư vấn mới",
      value: newLeadsCount,
      total: `Tổng: ${totalLeads} lead`,
      icon: Users,
      color: "bg-amber-500 text-white",
      href: "/admin/leads",
    },
    {
      title: "Bài viết Tin tức",
      value: articleStats.publishedArticles,
      total: `Đã xuất bản (Tổng: ${articleStats.totalArticles} bài)`,
      icon: FileText,
      color: "bg-blue-600 text-white",
      href: "/admin/articles",
    },
    {
      title: "Chuyên mục",
      value: categories.length,
      total: "Danh mục tin",
      icon: FolderTree,
      color: "bg-emerald-600 text-white",
      href: "/admin/articles/categories",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Bảng điều khiển Quản trị
          </h1>
          <p className="mt-1 text-body-sm text-ink-500">
            Xin chào, <span className="font-semibold text-navy-900">{user.name}</span>. Chúc bạn một
            ngày làm việc hiệu quả!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-2 rounded-lg border border-line-200 bg-white px-4 py-2.5 text-body-sm font-semibold text-ink-800 shadow-xs transition-all hover:bg-paper"
          >
            <ImageIcon className="h-4 w-4 text-ink-500" />
            <span>Sửa Hero Banner</span>
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-800"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng bài mới</span>
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="admin-work-queue"
        className="rounded-xl border border-line-200 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-gold-700 uppercase">
              Điều phối hôm nay
            </p>
            <h2 id="admin-work-queue" className="mt-1 font-display text-xl font-bold text-navy-950">
              Việc cần xử lý
            </h2>
          </div>
          <p className="text-sm text-ink-500">
            Số liệu lấy trực tiếp từ nội dung và yêu cầu tư vấn hiện có.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/content"
            className="group flex min-h-20 items-center justify-between rounded-lg border border-line-200 bg-paper/70 px-4 py-3 transition-colors hover:border-gold-500 hover:bg-gold-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">Nội dung chờ duyệt</span>
                <span className="block text-xs text-ink-500">Mở quy trình phê duyệt</span>
              </span>
            </span>
            <span className="font-display text-2xl font-bold text-navy-950">
              {reviewQueueCount}
            </span>
          </Link>
          <Link
            href="/admin/leads"
            className="group flex min-h-20 items-center justify-between rounded-lg border border-line-200 bg-paper/70 px-4 py-3 transition-colors hover:border-gold-500 hover:bg-gold-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-800">
                <Users className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">Yêu cầu tư vấn mới</span>
                <span className="block text-xs text-ink-500">Mở danh sách lead</span>
              </span>
            </span>
            <span className="font-display text-2xl font-bold text-navy-950">{newLeadsCount}</span>
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="cms-health-title"
        className="rounded-xl border border-line-200 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-gold-700 uppercase">
              Chất lượng nội dung
            </p>
            <h2 id="cms-health-title" className="mt-1 font-display text-xl font-bold text-navy-950">
              Rà soát trước khi công bố
            </h2>
          </div>
          <Link href="/admin/content" className="text-sm font-semibold text-navy-900 underline">
            Mở CMS
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/content"
            className="rounded-lg border border-line-200 bg-paper/70 p-4 transition-colors hover:border-gold-500"
          >
            <span className="text-sm font-semibold text-ink-900">Thiếu nguồn xác minh</span>
            <span className="mt-1 block font-display text-2xl font-bold text-navy-950">
              {cmsHealth.missingSource}
            </span>
            <span className="text-xs text-ink-500">
              Trong dữ liệu ngành, tuyển sinh, học phí, học bổng, tài liệu
            </span>
          </Link>
          <Link
            href="/admin/content?entityType=document"
            className="rounded-lg border border-line-200 bg-paper/70 p-4 transition-colors hover:border-gold-500"
          >
            <span className="text-sm font-semibold text-ink-900">Tài liệu thiếu tệp</span>
            <span className="mt-1 block font-display text-2xl font-bold text-navy-950">
              {cmsHealth.missingDocumentFiles}
            </span>
            <span className="text-xs text-ink-500">Thiếu đường dẫn xem hoặc tải</span>
          </Link>
        </div>
        {(cmsHealth.sourceGaps.some((item) => item.count > 0) ||
          cmsHealth.missingDocumentItems.length > 0) && (
          <div className="mt-4 grid gap-4 border-t border-line-200 pt-4 md:grid-cols-2">
            {cmsHealth.sourceGaps.some((item) => item.count > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Thiếu nguồn theo nhóm</h3>
                <ul className="mt-2 space-y-1.5">
                  {cmsHealth.sourceGaps
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <li key={item.entityType}>
                        <Link
                          href={`/admin/content?entityType=${item.entityType}`}
                          className="flex justify-between gap-3 text-sm text-navy-900 underline underline-offset-2"
                        >
                          <span>{item.label}</span>
                          <span>{item.count}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {cmsHealth.missingDocumentItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Tài liệu cần gắn tệp</h3>
                <ul className="mt-2 space-y-1.5">
                  {cmsHealth.missingDocumentItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/admin/content?entityType=document&entityId=${encodeURIComponent(item.id)}`}
                        className="block truncate text-sm text-navy-900 underline underline-offset-2"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="mt-5 border-t border-line-200 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-ink-900">Hạn hồ sơ / hiệu lực trong 30 ngày</h3>
            <span className="text-sm text-ink-500">{cmsHealth.expiringCount} mục</span>
          </div>
          {cmsHealth.expiringItems.length ? (
            <ul className="mt-2 divide-y divide-line-100">
              {cmsHealth.expiringItems.map((item) => (
                <li key={item.revisionId}>
                  <Link
                    href={`/admin/content?entityType=${encodeURIComponent(item.entityType)}&entityId=${encodeURIComponent(item.entityId)}`}
                    className="flex flex-col gap-1 py-3 text-sm transition-colors hover:text-navy-700 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-ink-900">{item.title}</span>
                    <time dateTime={item.expiresAt} className="text-ink-600">
                      {new Intl.DateTimeFormat("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.expiresAt))}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-500">Không có mốc hạn nào trong 30 ngày tới.</p>
          )}
        </div>
      </section>

      <section
        aria-label="Khoảng thời gian thống kê"
        className="flex flex-col gap-3 rounded-xl border border-line-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Lọc thống kê truy cập</h2>
          <p className="text-xs text-ink-500">
            Áp dụng cho tổng lượt xem và danh sách trang được xem nhiều.
          </p>
        </div>
        <nav aria-label="Chọn khoảng thời gian" className="flex flex-wrap gap-2">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/admin?range=${days}`}
              aria-current={range === days ? "page" : undefined}
              className={`inline-flex min-h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors ${range === days ? "border-navy-900 bg-navy-900 text-white" : "border-line-200 bg-white text-navy-900 hover:border-gold-500 hover:bg-gold-50"}`}
            >
              {days} ngày
            </Link>
          ))}
        </nav>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-line-200 bg-white p-5 shadow-xs transition-all hover:border-gold-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink-500">{card.title}</span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} shadow-xs`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-ink-950">{card.value}</span>
                <span className="text-xs font-medium text-ink-500">{card.total}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Sections: Recent Leads & Recent Articles */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-xl border border-line-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <h2 className="font-display text-lg font-bold text-ink-950">Lead Đăng ký Mới</h2>
            </div>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-navy-900 hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-line-100">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-body-sm text-ink-400">
                Chưa có yêu cầu tư vấn nào được ghi nhận.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50/70"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-900">{lead.fullname}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          lead.status === "new"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "contacted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {lead.status === "new"
                          ? "Mới"
                          : lead.status === "contacted"
                            ? "Đã liên hệ"
                            : "Đã tư vấn"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500">
                      SĐT: <span className="font-medium text-ink-700">{lead.phone}</span> • Ngành:{" "}
                      {lead.program || "Chưa chọn"}
                    </p>
                  </div>
                  <span className="text-xs whitespace-nowrap text-ink-400">
                    {new Date(lead.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="rounded-xl border border-line-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="font-display text-lg font-bold text-ink-950">Tin tức Gần đây</h2>
            </div>
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-navy-900 hover:underline"
            >
              <span>Quản lý tin</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-line-100">
            {recentArticles.length === 0 ? (
              <div className="p-8 text-center text-body-sm text-ink-400">
                Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
              </div>
            ) : (
              recentArticles.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50/70"
                >
                  <div className="min-w-0 space-y-1 pr-4">
                    <Link
                      href={`/admin/content?entityType=article&entityId=${art.id}`}
                      className="block truncate font-semibold text-ink-900 transition-colors hover:text-navy-900"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-ink-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                        {art.category_name || "Chưa phân loại"}
                      </span>
                      <span>•</span>
                      <span>{new Date(art.published_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/content?entityType=article&entityId=${art.id}`}
                    className="shrink-0 text-xs font-semibold text-navy-900 hover:underline"
                  >
                    Chỉnh sửa
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section: Top Pages */}
      <div className="rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-indigo-600" />
            <h2 className="font-display text-lg font-bold text-ink-950">
              Trang được xem nhiều · {range} ngày qua
            </h2>
          </div>
        </div>

        <div className="divide-y divide-line-100">
          {analytics.topPages.length === 0 ? (
            <div className="p-8 text-center text-body-sm text-ink-400">
              Chưa có dữ liệu truy cập nào được ghi nhận.
            </div>
          ) : (
            analytics.topPages.map((page, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-4">
                  <span className="w-4 text-body-sm font-bold text-ink-400">{idx + 1}</span>
                  <a
                    href={page.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body-sm font-medium text-ink-900 transition-colors hover:text-navy-900"
                  >
                    {page.path}
                  </a>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {page.views} lượt
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
