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
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category_id: number | null;
  category_name: string | null;
  author_name: string | null;
  is_featured: number;
  status: string;
  published_at: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchArticles = async (searchQuery = search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCategories();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchArticles();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles(search);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return;

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xóa bài viết thất bại.");
      }

      setMessage({ type: "success", text: `Đã xóa bài viết "${title}".` });
      fetchArticles();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xóa bài viết." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-700" />
            <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
              Quản lý Tin tức & Bài viết
            </h1>
          </div>
          <p className="text-ink-500 mt-1 text-body-sm">
            Tổng cộng <span className="text-ink-900 font-semibold">{total}</span> bài viết trong hệ
            thống.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tạo bài viết mới</span>
        </Link>
      </div>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-lg border p-4 text-body-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-line-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search Box */}
          <div className="relative sm:col-span-6">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              aria-label="Tìm kiếm"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc tóm tắt..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white pr-3 pl-9 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              aria-label="Lọc theo danh mục"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
            </select>
          </div>
        </form>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="admin-data-table w-full text-left text-body-sm">
            <thead className="text-ink-500 border-b border-line-200 bg-slate-50 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3.5">Bài viết</th>
                <th className="px-4 py-3.5">Chuyên mục</th>
                <th className="px-4 py-3.5">Tác giả</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="hidden px-4 py-3.5 lg:table-cell">Ngày đăng</th>
                <th className="sticky right-0 z-10 bg-slate-50 px-6 py-3.5 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-ink-500 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                      <span>Đang tải danh sách bài viết...</span>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-ink-500 py-12 text-center">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-line-200 bg-slate-100">
                          {art.featured_image ? (
                            <img
                              src={art.featured_image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-ink-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="max-w-md min-w-0">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="line-clamp-1 font-semibold text-ink-950 transition-colors hover:text-brand-700"
                          >
                            {art.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-ink-400">/{art.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {art.category_name || "Chưa phân loại"}
                      </span>
                    </td>

                    <td className="text-ink-700 px-4 py-4 whitespace-nowrap">
                      {art.author_name || "Topica"}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          art.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {art.status === "published" ? "Xuất bản" : "Bản nháp"}
                      </span>
                      {art.is_featured === 1 && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Nổi bật
                        </span>
                      )}
                    </td>

                    <td className="text-ink-500 hidden px-4 py-4 text-xs whitespace-nowrap lg:table-cell">
                      {new Date(art.published_at).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="sticky right-0 z-10 bg-white px-6 py-4 text-right whitespace-nowrap shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          disabled={deletingId === art.id}
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-red-50 hover:text-error"
                          title="Xóa bài viết"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line-200 bg-slate-50 px-6 py-3">
            <span className="text-ink-500 text-xs">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-ink-700 rounded border border-line-200 bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-ink-700 rounded border border-line-200 bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
