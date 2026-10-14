"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  BookOpen,
} from "lucide-react";

interface LeadItem {
  id: number;
  fullname: string;
  phone: string;
  email: string | null;
  program: string | null;
  notes: string | null;
  status: "new" | "contacted" | "consulted" | "cancelled";
  created_at: string;
}

import { escapeCsvCell } from "@/lib/utils";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLeads = async (searchQuery = search) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setError(null);
      } else {
        setError(
          `Không thể tải danh sách lead (mã phản hồi HTTP ${res.status}). Vui lòng thử lại.`,
        );
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối khi tải danh sách lead. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLeads();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads(search);
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "new" | "contacted" | "consulted" | "cancelled",
  ) => {
    setUpdatingId(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại.");

      setMessage({ type: "success", text: "Đã cập nhật trạng thái lead thành công." });
      // CMS-11: Refresh leads list and total count according to active filter
      await fetchLeads();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi cập nhật trạng thái." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number, fullname: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lead của "${fullname}" không?`)) return;

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa lead thất bại.");

      setMessage({ type: "success", text: `Đã xóa thông tin của "${fullname}".` });
      fetchLeads();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xóa lead." });
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = async (mode: "all" | "page" = "all") => {
    try {
      setExporting(true);
      let dataToExport = leads;

      if (mode === "all") {
        const params = new URLSearchParams();
        params.set("export", "true");
        if (search) params.set("search", search);
        if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);
        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        if (!res.ok) throw new Error("Không thể tải toàn bộ danh sách lead để xuất.");
        const data = await res.json();
        dataToExport = data.leads || [];
      }

      if (dataToExport.length === 0) {
        alert("Không có dữ liệu để xuất.");
        return;
      }

      const headers = [
        "ID",
        "Ho va Ten",
        "So Dien Thoai",
        "Email",
        "Nganh Quan Tam",
        "Ghi Chu",
        "Trang Thai",
        "Ngay Gui",
      ];
      const rows = dataToExport.map((l) => [
        l.id,
        escapeCsvCell(l.fullname),
        escapeCsvCell(l.phone),
        escapeCsvCell(l.email),
        escapeCsvCell(l.program),
        escapeCsvCell(l.notes),
        escapeCsvCell(l.status),
        escapeCsvCell(new Date(l.created_at).toLocaleString("vi-VN")),
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const suffix = selectedStatus !== "all" ? `_${selectedStatus}` : "";
      link.setAttribute(
        "download",
        `topica_leads${suffix}_${mode === "all" ? "toan_bo" : `trang_${page}`}_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi xuất file CSV");
    } finally {
      setExporting(false);
    }
  };

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "new", label: "Mới" },
    { key: "contacted", label: "Đã liên hệ" },
    { key: "consulted", label: "Đã tư vấn" },
    { key: "cancelled", label: "Hủy / Không liên lạc được" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-600" />
            <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
              Tiếp nhận Lead Tư vấn Tuyển sinh
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-ink-500">
            Tổng cộng <span className="font-semibold text-ink-900">{total}</span> hồ sơ / yêu cầu
            đăng ký tư vấn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportCSV("all")}
            disabled={exporting || total === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-body-sm font-semibold text-white shadow-xs transition-all hover:bg-navy-800 focus:outline-2 focus:outline-navy-900 disabled:opacity-50"
            title="Xuất toàn bộ kết quả phù hợp với bộ lọc hiện tại"
          >
            {exporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-white" />
            )}
            <span>Xuất toàn bộ CSV ({total})</span>
          </button>
          {totalPages > 1 && (
            <button
              onClick={() => exportCSV("page")}
              disabled={exporting || leads.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-200 bg-white px-3.5 py-2.5 text-body-sm font-semibold text-ink-800 shadow-xs transition-all hover:bg-paper focus:outline-2 focus:outline-navy-900 disabled:opacity-50"
              title="Chỉ xuất các dòng trên trang này"
            >
              <span>Xuất trang này ({leads.length})</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
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

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-line-200 pb-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedStatus(tab.key);
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-2 focus:outline-navy-900 ${
                selectedStatus === tab.key
                  ? "bg-brand-700 text-white"
                  : "border border-line-200 bg-white text-ink-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, SĐT hoặc email..."
            className="h-10 w-full rounded-lg border border-line-200 bg-white pr-3 pl-9 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </form>
      </div>

      {/* Error banner when background refresh fails */}
      {error && leads.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-body-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchLeads()}
            className="inline-flex items-center gap-1 text-xs font-semibold underline hover:text-amber-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-line-200 bg-slate-50 text-xs font-semibold text-ink-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Họ tên & Liên hệ</th>
                <th className="px-4 py-3.5">Ngành & Ghi chú</th>
                <th className="px-4 py-3.5">Trạng thái xử lý</th>
                <th className="px-4 py-3.5">Thời gian gửi</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                      <span>Đang tải danh sách lead...</span>
                    </div>
                  </td>
                </tr>
              ) : error && leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
                      <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                      <p className="font-semibold">{error}</p>
                      <button
                        type="button"
                        onClick={() => fetchLeads()}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 focus:outline-2 focus:outline-red-600"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Thử lại</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-500">
                    Chưa có dữ liệu tư vấn nào phù hợp.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink-950">{lead.fullname}</div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-ink-600">
                        <span className="flex items-center gap-1 font-medium text-brand-700">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${lead.phone}`} className="hover:underline">
                            {lead.phone}
                          </a>
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1 text-ink-500">
                            <Mail className="h-3 w-3" />
                            <span>{lead.email}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-ink-900">
                        <BookOpen className="h-3.5 w-3.5 text-ink-400" />
                        <span>{lead.program || "Chưa chọn ngành"}</span>
                      </div>
                      {lead.notes && (
                        <p className="mt-1 max-w-xs text-xs text-ink-500">{lead.notes}</p>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none ${
                          lead.status === "new"
                            ? "border-amber-300 bg-amber-50 text-amber-800"
                            : lead.status === "contacted"
                              ? "border-blue-300 bg-blue-50 text-blue-800"
                              : lead.status === "consulted"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : "border-slate-300 bg-slate-100 text-slate-600"
                        }`}
                      >
                        <option value="new">Mới</option>
                        <option value="contacted">Đã liên hệ</option>
                        <option value="consulted">Đã tư vấn</option>
                        <option value="cancelled">Hủy</option>
                      </select>
                    </td>

                    <td className="px-4 py-4 text-xs whitespace-nowrap text-ink-500">
                      {new Date(lead.created_at).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(lead.id, lead.fullname)}
                        disabled={deletingId === lead.id}
                        className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-red-50 hover:text-error"
                        title="Xóa lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
            <span className="text-xs text-ink-500">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-line-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border border-line-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 disabled:opacity-50"
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
