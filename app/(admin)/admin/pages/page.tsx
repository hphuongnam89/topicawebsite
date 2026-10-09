"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface PageItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  status: string;
  published_at: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPages();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa trang "${title}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Có lỗi xảy ra khi xóa trang.");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xóa trang.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Quản lý Trang (Pages)
          </h1>
          <p className="text-ink-500 mt-1 text-body-sm">{pages.length} trang tĩnh trên hệ thống</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Thêm trang mới</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-line-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên trang, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-line-200 bg-white pr-4 pl-10 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Pages Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="admin-data-table w-full text-left text-body-sm">
            <thead className="text-ink-500 border-b border-line-200 bg-slate-50 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3.5">Tiêu đề</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="hidden px-4 py-3.5 sm:table-cell">Ngày đăng</th>
                <th className="sticky right-0 z-10 bg-slate-50 px-6 py-3.5 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-ink-500 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-ink-500 py-12 text-center">
                    Không tìm thấy trang nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="max-w-md min-w-0">
                          <Link
                            href={`/admin/pages/${page.id}/edit`}
                            className="line-clamp-1 font-semibold text-ink-950 transition-colors hover:text-brand-700"
                          >
                            {page.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-ink-400">/{page.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          page.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {page.status === "published" ? "Xuất bản" : "Bản nháp"}
                      </span>
                    </td>

                    <td className="text-ink-500 hidden px-4 py-4 text-xs whitespace-nowrap sm:table-cell">
                      {new Date(page.published_at).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="sticky right-0 z-10 bg-white px-6 py-4 text-right whitespace-nowrap shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
                          title="Xem trên web"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/admin/pages/${page.id}/edit`}
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={deletingId === page.id}
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-red-50 hover:text-error"
                          title="Xóa trang"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
