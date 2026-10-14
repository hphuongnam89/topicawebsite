"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlusCircle,
  Search,
  Filter,
  Edit,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  Code,
  Languages,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProgramItem {
  id: string;
  name: string;
  major: string;
  code: string;
  slug: string;
  degree_name: string | null;
  awarding_institution: string | null;
  group_id: string;
  group_name: string;
  credits: number | null;
  semesters: number | null;
  status: "published" | "draft";
  workflow_state: string;
  has_draft: boolean;
  version: number;
  careers_count: number;
  curriculum_count: number;
  faqs_count: number;
  summary: string;
  updated_at: string;
  source: "base" | "revision";
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedGroup !== "all") params.set("group", selectedGroup);

      const res = await fetch(`/api/admin/programs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
      } else {
        setError(`Không thể tải danh sách ngành học (HTTP ${res.status}). Vui lòng thử lại.`);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Lỗi kết nối khi tải danh sách ngành học. Vui lòng kiểm tra và thử lại.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedGroup]);

  useEffect(() => {
    let ignore = false;
    async function loadPrograms() {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (selectedGroup !== "all") params.set("group", selectedGroup);

        const res = await fetch(`/api/admin/programs?${params.toString()}`);
        if (ignore) return;
        if (res.ok) {
          const data = await res.json();
          setPrograms(data.programs || []);
        } else {
          setError(`Không thể tải danh sách ngành học (HTTP ${res.status}). Vui lòng thử lại.`);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching programs:", err);
          setError("Lỗi kết nối khi tải danh sách ngành học. Vui lòng kiểm tra và thử lại.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadPrograms();
    return () => {
      ignore = true;
    };
  }, [search, selectedGroup]);

  // Statistics
  const totalPrograms = programs.length;
  const techCount = programs.filter((p) => p.group_id === "technology").length;
  const businessCount = programs.filter((p) => p.group_id === "business").length;
  const languageCount = programs.filter((p) => p.group_id === "language").length;

  const getGroupBadge = (groupId: string) => {
    switch (groupId) {
      case "technology":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <Code className="h-3.5 w-3.5" />
            Công nghệ thông tin
          </span>
        );
      case "language":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            <Languages className="h-3.5 w-3.5" />
            Ngôn ngữ
          </span>
        );
      case "business":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <Briefcase className="h-3.5 w-3.5" />
            Kinh tế & Quản lý
          </span>
        );
    }
  };

  const getStatusBadge = (program: ProgramItem) => {
    if (program.has_draft && program.status === "published") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" />
          Đã xuất bản (Có bản nháp mới)
        </span>
      );
    }
    if (program.status === "published") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Đã xuất bản v{program.version}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock className="h-3 w-3" />
        Bản nháp ({program.workflow_state})
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
                Quản lý Ngành học
              </h1>
              <p className="mt-0.5 text-body-sm text-ink-500">
                Quản lý nội dung 5 ngành đào tạo đại học trực tuyến và sẵn sàng mở thêm ngành mới
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPrograms()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-200 bg-white px-3.5 py-2.5 text-body-sm font-medium text-ink-700 shadow-2xs hover:bg-paper"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/content?entityType=program"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Thêm ngành đào tạo mới</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-line-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-ink-500 uppercase">
              Tổng số ngành
            </span>
            <BookOpen className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink-950">{totalPrograms}</div>
          <p className="mt-1 text-xs text-ink-400">Đang đào tạo trực tuyến</p>
        </div>

        <div className="rounded-xl border border-line-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-blue-600 uppercase">
              Khối Công nghệ
            </span>
            <Code className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink-950">{techCount}</div>
          <p className="mt-1 text-xs text-ink-400">CNTT, Đồ họa kỹ thuật số</p>
        </div>

        <div className="rounded-xl border border-line-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-emerald-600 uppercase">
              Khối Kinh tế
            </span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink-950">{businessCount}</div>
          <p className="mt-1 text-xs text-ink-400">QTKD, Du lịch & Lữ hành</p>
        </div>

        <div className="rounded-xl border border-line-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-purple-600 uppercase">
              Khối Ngôn ngữ
            </span>
            <Languages className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink-950">{languageCount}</div>
          <p className="mt-1 text-xs text-ink-400">Tiếng Anh, Tiếng Trung Quốc</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-line-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Tìm theo tên ngành, mã ngành (7 số), slug, chuyên ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-line-200 bg-white pr-4 pl-9 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-10 rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-800 focus:border-brand-600 focus:outline-none"
          >
            <option value="all">Tất cả khối ngành</option>
            <option value="technology">Công nghệ thông tin</option>
            <option value="business">Kinh tế & Quản lý</option>
            <option value="language">Ngôn ngữ</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => fetchPrograms()}
            className="rounded-lg bg-red-100 px-3 py-1 font-semibold text-red-800 hover:bg-red-200"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Programs List / Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-2xs">
        {loading && programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-ink-500">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
            <p className="mt-3 text-body-sm font-medium">Đang tải danh sách ngành đào tạo...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-ink-500">
            <GraduationCap className="h-12 w-12 text-ink-300" />
            <p className="text-body-base mt-3 font-semibold text-ink-800">
              Không tìm thấy ngành đào tạo nào
            </p>
            <p className="mt-1 text-body-sm text-ink-500">
              {search || selectedGroup !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc khối ngành."
                : "Chưa có ngành đào tạo nào trong hệ thống."}
            </p>
            <Link
              href="/admin/content?entityType=program"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-800"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tạo ngành mới ngay</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-body-sm">
              <thead>
                <tr className="border-b border-line-200 bg-paper text-ink-600">
                  <th className="py-3.5 pr-4 pl-6 font-semibold">Tên ngành đào tạo & Mã ngành</th>
                  <th className="px-4 py-3.5 font-semibold">Khối ngành</th>
                  <th className="px-4 py-3.5 font-semibold">Thời lượng & Tín chỉ</th>
                  <th className="px-4 py-3.5 font-semibold">Dữ liệu chi tiết</th>
                  <th className="px-4 py-3.5 font-semibold">Trạng thái CMS</th>
                  <th className="py-3.5 pr-6 pl-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-100">
                {programs.map((program) => (
                  <tr key={program.id} className="group transition-colors hover:bg-paper/70">
                    {/* Tên ngành & Mã ngành */}
                    <td className="py-4 pr-4 pl-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink-950 transition-colors group-hover:text-brand-700">
                            {program.name}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-ink-700">
                            Mã: {program.code}
                          </span>
                          <span>•</span>
                          <span>ID: {program.id}</span>
                          <span>•</span>
                          <span className="italic">
                            {program.awarding_institution ?? "Chưa có dữ liệu đơn vị cấp bằng"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Khối ngành */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getGroupBadge(program.group_id)}
                    </td>

                    {/* Thời lượng & Tín chỉ */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-ink-900">
                        {program.credits === null
                          ? "Chưa có dữ liệu tín chỉ"
                          : `${program.credits} tín chỉ`}
                      </div>
                      <div className="text-xs text-ink-500">
                        {program.semesters === null
                          ? "Chưa có dữ liệu thời lượng"
                          : `${program.semesters} học kỳ chuẩn`}
                      </div>
                    </td>

                    {/* Dữ liệu chi tiết */}
                    <td className="px-4 py-4 text-xs whitespace-nowrap text-ink-600">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-brand-600" />
                          <span>{program.curriculum_count} học kỳ môn học</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{program.careers_count} vị trí việc làm</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                          <span>{program.faqs_count} câu hỏi FAQ</span>
                        </span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(program)}</td>

                    {/* Thao tác */}
                    <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/content?entityType=program&entityId=${program.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 hover:text-brand-800"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Chỉnh sửa nội dung</span>
                        </Link>
                        <Link
                          href={`/${program.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-line-200 bg-white p-1.5 text-ink-600 transition-colors hover:bg-paper hover:text-ink-900"
                          title="Xem trang công khai ngoài website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Helpful Guidance Banner */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50/80 to-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <div className="space-y-1 text-body-sm text-ink-800">
            <h2 className="font-semibold text-brand-900">
              Quy trình cập nhật & mở mới ngành học trong CMS
            </h2>
            <p className="leading-relaxed text-ink-600">
              Mỗi ngành đào tạo chứa toàn bộ dữ liệu học thuật độc lập: khung chương trình từng học
              kỳ, chuẩn đầu ra, cơ hội việc làm, học phí theo lộ trình và câu hỏi thường gặp.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-ink-600">
              <li>
                <strong>Chỉnh sửa ngành học:</strong> Nhấn <em>&quot;Chỉnh sửa nội dung&quot;</em>{" "}
                trên từng ngành để thay đổi môn học, học phí, vị trí nghề nghiệp và lưu thành bản
                nháp.
              </li>
              <li>
                <strong>Thêm ngành đào tạo mới:</strong> Nhấn nút{" "}
                <em>&quot;+ Thêm ngành đào tạo mới&quot;</em> ở góc trên. Nhập mã ngành, chuyên
                ngành, số tín chỉ và khung môn học; khi xuất bản, ngành mới sẽ tự động hiển thị đồng
                bộ tại menu & trang chủ.
              </li>
              <li>
                <strong>Bảo mật & Phê duyệt:</strong> Mọi thay đổi đều được ghi nhật ký (Audit Log)
                và có cơ chế xem trước (Preview) trước khi chính thức phát hành.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
