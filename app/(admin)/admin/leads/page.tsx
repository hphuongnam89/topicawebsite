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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLeads = async (searchQuery = search) => {
    try {
      setLoading(true);
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
      }
    } catch (err) {
      console.error(err);
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

  const handleStatusChange = async (id: number, newStatus: "new" | "contacted" | "consulted" | "cancelled") => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại.");

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
      );
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật.");
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

  const exportCSV = () => {
    if (leads.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const headers = ["ID", "Ho va Ten", "So Dien Thoai", "Email", "Nganh Quan Tam", "Ghi Chu", "Trang Thai", "Ngay Gui"];
    const rows = leads.map((l) => [
      l.id,
      `"${l.fullname}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${l.program || ""}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      l.status,
      `"${new Date(l.created_at).toLocaleString("vi-VN")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `topica_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "new", label: "Mới" },
    { key: "contacted", label: "Đã liên hệ" },
    { key: "consulted", label: "Đã tư vấn" },
    { key: "cancelled", label: "Hủy / Không liên lạc được" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
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
            Tổng cộng <span className="font-semibold text-ink-900">{total}</span> hồ sơ / yêu cầu đăng ký tư vấn.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-200 bg-white px-4 py-2.5 text-body-sm font-semibold text-ink-800 shadow-xs hover:bg-paper transition-all"
        >
          <Download className="h-4 w-4 text-ink-500" />
          <span>Xuất file Excel / CSV</span>
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 text-body-sm border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
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
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStatus === tab.key
                  ? "bg-brand-700 text-white"
                  : "bg-white text-ink-600 hover:bg-slate-100 border border-line-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, SĐT hoặc email..."
            className="h-10 w-full rounded-lg border border-line-200 bg-white pl-9 pr-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-line-200 bg-slate-50 text-xs font-semibold uppercase text-ink-500">
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
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-500">
                    Chưa có dữ liệu tư vấn nào.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink-950">{lead.fullname}</div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-ink-600">
                        <span className="flex items-center gap-1 font-medium text-brand-700">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
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
                        <p className="mt-1 text-xs text-ink-500 max-w-xs">{lead.notes}</p>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none transition-colors ${
                          lead.status === "new"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : lead.status === "contacted"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : lead.status === "consulted"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}
                      >
                        <option value="new">Mới</option>
                        <option value="contacted">Đã liên hệ</option>
                        <option value="consulted">Đã tư vấn</option>
                        <option value="cancelled">Hủy</option>
                      </select>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-xs text-ink-500">
                      {new Date(lead.created_at).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(lead.id, lead.fullname)}
                        disabled={deletingId === lead.id}
                        className="rounded-md p-1.5 text-ink-600 hover:bg-red-50 hover:text-error transition-colors"
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
          <div className="flex items-center justify-between border-t border-line-200 px-6 py-3 bg-slate-50">
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
