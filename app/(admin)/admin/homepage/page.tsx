"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Link2,
  Award,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

interface HeroData {
  badge: string;
  title: string;
  description: string;
  bgImage: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  showLeadForm: boolean;
}

interface TrustItem {
  label: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  program: string;
  avatar?: string;
}

const DEFAULT_HERO: HeroData = {
  badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
  title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
  description: "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
  bgImage: "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
  ctaPrimaryText: "Đăng ký xét tuyển",
  ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
  ctaSecondaryText: "Xem ngành học",
  ctaSecondaryLink: "/nganh-dao-tao/",
  showLeadForm: true,
};

const DEFAULT_TRUST: TrustItem[] = [
  { label: "Trực thuộc ĐH Phú Xuân" },
  { label: "Bằng cấp được công nhận" },
  { label: "Đào tạo từ xa 100%" },
  { label: "15,000+ sinh viên" },
  { label: "9 ngành đào tạo" },
  { label: "Thành viên EQuest" },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    name: "Nguyễn Văn A",
    role: "Cựu sinh viên",
    quote: "Chương trình đào tạo tại Topica rất thực tiễn, giúp tôi tự tin áp dụng vào công việc ngay sau khi tốt nghiệp.",
    program: "Công nghệ thông tin",
  },
  {
    id: "t2",
    name: "Trần Thị B",
    role: "Sinh viên năm 3",
    quote: "Đội ngũ giảng viên nhiệt tình và luôn hỗ trợ sinh viên trong suốt quá trình học tập.",
    program: "Quản trị Kinh doanh - Marketing",
  },
  {
    id: "t3",
    name: "Lê Văn C",
    role: "Trưởng phòng Marketing",
    quote: "Môi trường học tập trực tuyến linh hoạt đã giúp tôi cân bằng giữa công việc và việc học.",
    program: "Ngôn ngữ Anh",
  },
  {
    id: "t4",
    name: "Phạm Thị D",
    role: "Chuyên viên Nhân sự",
    quote: "Kiến thức từ chương trình đã mở ra nhiều cơ hội phát triển nghề nghiệp cho tôi.",
    program: "Quản lý công nghiệp",
  },
];

export default function AdminHomepageManager() {
  const [activeTab, setActiveTab] = useState<"hero" | "trust" | "testimonials">("hero");
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [trustItems, setTrustItems] = useState<TrustItem[]>(DEFAULT_TRUST);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/homepage");
      if (res.ok) {
        const data = await res.json();
        if (data.hero) setHero(data.hero);
        if (data.trustItems) setTrustItems(data.trustItems);
        if (data.testimonials) setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Fetch homepage error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchHomepageData();
    })();
  }, []);

  

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero,
          trustItems,
          testimonials,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu cấu hình.");

      setMessage({ type: "success", text: "Đã cập nhật trang chủ thành công và làm mới cache!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi lưu cấu hình." });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");

      setHero((prev) => ({ ...prev, bgImage: data.url }));
      setMessage({ type: "success", text: "Đã tải ảnh lên thành công!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi tải ảnh lên." });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-ink-500">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
          <span>Đang tải cấu hình trang chủ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-700" />
            <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
              Cấu hình Toàn diện Trang Chủ
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-ink-500">
            Tùy biến Hero Banner, các số liệu tin cậy và đánh giá sinh viên trên trang chủ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-70 transition-all"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}</span>
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

      {/* Section Tabs Switcher */}
      <div className="flex border-b border-line-200 gap-2">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-semibold border-b-2 transition-colors ${
            activeTab === "hero"
              ? "border-brand-700 text-brand-700"
              : "border-transparent text-ink-500 hover:text-ink-900"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Hero Banner Chính</span>
        </button>

        <button
          onClick={() => setActiveTab("trust")}
          className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-semibold border-b-2 transition-colors ${
            activeTab === "trust"
              ? "border-brand-700 text-brand-700"
              : "border-transparent text-ink-500 hover:text-ink-900"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Khối Tin Cậy ({trustItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-semibold border-b-2 transition-colors ${
            activeTab === "testimonials"
              ? "border-brand-700 text-brand-700"
              : "border-transparent text-ink-500 hover:text-ink-900"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Cảm Nhận Học Viên ({testimonials.length})</span>
        </button>
      </div>

      {/* TAB 1: HERO BANNER */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-700" />
                <h2 className="font-display text-lg font-bold text-ink-950">Xem trước Trực tiếp (Live Preview)</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                Tự động cập nhật khi gõ
              </span>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-white min-h-[340px] p-6 lg:p-10 flex items-center">
              <div className="absolute inset-0 z-0">
                {hero.bgImage ? (
                  <img
                    src={hero.bgImage}
                    alt="Banner preview"
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-900" />
                )}
                <div className="absolute inset-0 bg-slate-950/75 lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-950/80 lg:to-transparent" />
              </div>

              <div className="relative z-10 max-w-xl space-y-4">
                {hero.badge && (
                  <div className="inline-block rounded-full bg-white/10 border border-brand-300/30 px-3.5 py-1 text-xs font-medium text-brand-300 backdrop-blur-sm">
                    {hero.badge}
                  </div>
                )}
                <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl lg:text-4xl text-white whitespace-pre-line leading-tight">
                  {hero.title || "TIÊU ĐỀ BANNER"}
                </h2>
                <p className="text-body-sm text-white/80">
                  {hero.description || "Mô tả ngắn gọn về chương trình đào tạo..."}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {hero.ctaPrimaryText && (
                    <span className="rounded-md bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-sm">
                      {hero.ctaPrimaryText}
                    </span>
                  )}
                  {hero.ctaSecondaryText && (
                    <span className="rounded-md border border-white/40 px-4 py-2 text-xs font-semibold text-white">
                      {hero.ctaSecondaryText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-700" />
                  <span>Nội dung Tiêu đề & Thông điệp</span>
                </h3>

                <div>
                  <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                    Badge / Nhãn phụ
                  </label>
                  <input
                    type="text"
                    value={hero.badge}
                    onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                    className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                    Tiêu đề chính (H1) <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm font-semibold text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                    Đoạn văn mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-brand-700" />
                  <span>Các Nút Hành Động (CTA)</span>
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                      Nút chính: Tên nút
                    </label>
                    <input
                      type="text"
                      value={hero.ctaPrimaryText}
                      onChange={(e) => setHero({ ...hero, ctaPrimaryText: e.target.value })}
                      className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                      Nút chính: Đường dẫn link
                    </label>
                    <input
                      type="text"
                      value={hero.ctaPrimaryLink}
                      onChange={(e) => setHero({ ...hero, ctaPrimaryLink: e.target.value })}
                      className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                      Nút phụ: Tên nút
                    </label>
                    <input
                      type="text"
                      value={hero.ctaSecondaryText}
                      onChange={(e) => setHero({ ...hero, ctaSecondaryText: e.target.value })}
                      className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                      Nút phụ: Đường dẫn link
                    </label>
                    <input
                      type="text"
                      value={hero.ctaSecondaryLink}
                      onChange={(e) => setHero({ ...hero, ctaSecondaryLink: e.target.value })}
                      className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Upload Image */}
            <div className="space-y-6">
              <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-brand-700" />
                  <span>Ảnh Nền Banner</span>
                </h3>

                <div className="overflow-hidden rounded-lg border border-line-200 aspect-video relative bg-slate-100">
                  {hero.bgImage ? (
                    <img src={hero.bgImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-400">
                      Chưa có ảnh nền
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-200 bg-paper py-2.5 text-body-sm font-semibold text-ink-800 hover:bg-slate-100 transition-colors"
                >
                  {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{uploading ? "Đang tải lên..." : "Tải ảnh từ máy tính"}</span>
                </button>

                <div>
                  <label className="block text-xs font-semibold text-ink-900 mb-1">
                    Hoặc nhập URL ảnh
                  </label>
                  <input
                    type="url"
                    value={hero.bgImage}
                    onChange={(e) => setHero({ ...hero, bgImage: e.target.value })}
                    className="h-9 w-full rounded-lg border border-line-200 bg-white px-3 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Toggle */}
              <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hero.showLeadForm}
                    onChange={(e) => setHero({ ...hero, showLeadForm: e.target.checked })}
                    className="h-5 w-5 rounded border-line-200 text-brand-700 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-body-sm font-semibold text-ink-900">
                      Hiển thị Form Tư vấn
                    </span>
                    <p className="text-xs text-ink-500">
                      Form xuất hiện trực tiếp bên cạnh Hero Banner.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRUST HIGHLIGHTS */}
      {activeTab === "trust" && (
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-line-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-ink-950">
                Các Điểm Nhấn Tin Cậy (Trust Highlights)
              </h2>
              <p className="text-xs text-ink-500">
                Xuất hiện ngay dưới Hero Banner để tăng độ uy tín với người học.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTrustItems([...trustItems, { label: "Nội dung mới" }])}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm mục</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-line-200 p-3 bg-slate-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 text-xs">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...trustItems];
                    next[idx].label = e.target.value;
                    setTrustItems(next);
                  }}
                  className="h-9 flex-1 rounded border border-line-200 bg-white px-2.5 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTrustItems(trustItems.filter((_, i) => i !== idx))}
                  className="text-ink-400 hover:text-error p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TESTIMONIALS */}
      {activeTab === "testimonials" && (
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-line-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-ink-950">
                Cảm Nhận Học Viên & Cựu Sinh Viên
              </h2>
              <p className="text-xs text-ink-500">
                Đánh giá chân thực từ người học giúp gia tăng tỷ lệ đăng ký tư vấn.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTestimonials([
                  ...testimonials,
                  {
                    id: `t_${Date.now()}`,
                    name: "Họ tên học viên",
                    role: "Sinh viên / Vị trí",
                    quote: "Lời chia sẻ về trải nghiệm học tập...",
                    program: "Ngành học",
                  },
                ])
              }
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm đánh giá</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((t, idx) => (
              <div key={t.id} className="relative rounded-xl border border-line-200 p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                    Đánh giá #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTestimonials(testimonials.filter((item) => item.id !== t.id))}
                    className="text-ink-400 hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-900 mb-1">Họ tên</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const next = [...testimonials];
                        next[idx].name = e.target.value;
                        setTestimonials(next);
                      }}
                      className="h-9 w-full rounded border border-line-200 bg-white px-2.5 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-900 mb-1">Chức danh / Vai trò</label>
                    <input
                      type="text"
                      value={t.role}
                      onChange={(e) => {
                        const next = [...testimonials];
                        next[idx].role = e.target.value;
                        setTestimonials(next);
                      }}
                      className="h-9 w-full rounded border border-line-200 bg-white px-2.5 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-900 mb-1">Ngành học</label>
                  <input
                    type="text"
                    value={t.program}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx].program = e.target.value;
                      setTestimonials(next);
                    }}
                    className="h-9 w-full rounded border border-line-200 bg-white px-2.5 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-900 mb-1">Trích dẫn cảm nhận</label>
                  <textarea
                    rows={3}
                    value={t.quote}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx].quote = e.target.value;
                      setTestimonials(next);
                    }}
                    className="w-full rounded border border-line-200 bg-white p-2.5 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
