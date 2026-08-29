import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getLeads, getArticles, getCategories, getAnalyticsStats } from "@/lib/db";
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
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const totalLeads = getLeads().total;
  const { items: recentLeads } = getLeads({ limit: 5 });
  const { items: recentArticles, total: totalArticles } = getArticles({ limit: 5 });
  const categories = getCategories();

  const newLeadsCount = getLeads({ status: "new" }).total;
  const analytics = getAnalyticsStats(7); // Last 7 days

  const statCards = [
    {
      title: "Lượt truy cập",
      value: analytics.totalViews,
      total: "Trong 7 ngày qua",
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
      value: totalArticles,
      total: "Đã xuất bản",
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Bảng điều khiển Quản trị
          </h1>
          <p className="mt-1 text-body-sm text-ink-500">
            Xin chào, <span className="font-semibold text-brand-700">{user.name}</span>. Chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-2 rounded-lg border border-line-200 bg-white px-4 py-2.5 text-body-sm font-semibold text-ink-800 shadow-xs hover:bg-paper transition-all"
          >
            <ImageIcon className="h-4 w-4 text-ink-500" />
            <span>Sửa Hero Banner</span>
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng bài mới</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-line-200 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink-500">{card.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} shadow-xs`}>
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
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-700 hover:underline"
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
                <div key={lead.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors">
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
                        {lead.status === "new" ? "Mới" : lead.status === "contacted" ? "Đã liên hệ" : "Đã tư vấn"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500">
                      SĐT: <span className="font-medium text-ink-700">{lead.phone}</span> • Ngành: {lead.program || "Chưa chọn"}
                    </p>
                  </div>
                  <span className="text-xs text-ink-400 whitespace-nowrap">
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
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-700 hover:underline"
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
                <div key={art.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="block truncate font-semibold text-ink-900 hover:text-brand-700 transition-colors"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-ink-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-medium">
                        {art.category_name || "Chưa phân loại"}
                      </span>
                      <span>•</span>
                      <span>{new Date(art.published_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/articles/${art.id}/edit`}
                    className="shrink-0 text-xs font-semibold text-brand-700 hover:underline"
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
            <h2 className="font-display text-lg font-bold text-ink-950">Top Trang Xem Nhiều (7 ngày qua)</h2>
          </div>
        </div>

        <div className="divide-y divide-line-100">
          {analytics.topPages.length === 0 ? (
            <div className="p-8 text-center text-body-sm text-ink-400">
              Chưa có dữ liệu truy cập nào được ghi nhận.
            </div>
          ) : (
            analytics.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-body-sm font-bold text-ink-400 w-4">{idx + 1}</span>
                  <a href={page.path} target="_blank" rel="noreferrer" className="text-body-sm font-medium text-ink-900 hover:text-brand-700 transition-colors">
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
