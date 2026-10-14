"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Phone,
  Globe,
  Share2,
  BellRing,
} from "lucide-react";

interface SiteSettingsData {
  hotline: string;
  email: string;
  address: string;
  facebook: string;
  youtube: string;
  zalo: string;
  siteTitle: string;
  siteDescription: string;
  telegramBotToken?: string;
  telegramChatId?: string;
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  hotline: "1800 646 857",
  email: "tuyensinh@topicauni.edu.vn",
  address: "27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội",
  facebook: "https://www.facebook.com/topica.edu.vn",
  youtube: "https://www.youtube.com/user/TopicaVietnam",
  zalo: "https://zalo.me/topica",
  siteTitle: "Viện Đào tạo Quốc tế Topica – Trường Đại học Phú Xuân",
  siteDescription: "Chương trình đào tạo cử nhân trực tuyến chuẩn quốc gia do Trường Đại học Phú Xuân cấp bằng, hợp tác cùng Viện Đào tạo Quốc tế Topica.",
  telegramBotToken: "",
  telegramChatId: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updateSettings = (patch: Partial<SiteSettingsData>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error(`Lỗi tải cài đặt: HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setDirty(false);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || "Không thể tải cài đặt website.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSettings();
    })();
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("topica:unsaved-changes", { detail: { dirty } }));
    return () => {
      window.dispatchEvent(new CustomEvent("topica:unsaved-changes", { detail: { dirty: false } }));
    };
  }, [dirty]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu cài đặt.");

      setDirty(false);
      setMessage({ type: "success", text: "Đã lưu cài đặt website thành công!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi lưu cài đặt." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-ink-500">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
          <span>Đang tải cài đặt...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Không thể tải cấu hình hệ thống</h2>
              <p className="text-sm text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={fetchSettings}
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Thử tải lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-700" />
            <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
              Cài đặt Hệ thống & Website
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-ink-500">
            Quản lý thông tin liên hệ, mạng xã hội, nhận diện thương hiệu và thông báo tự động.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dirty && (
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Có thay đổi chưa lưu
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-70 transition-all"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu cài đặt"}</span>
          </button>
        </div>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Contact Info Card */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-700" />
            <span>Thông tin Liên hệ Tuyển sinh</span>
          </h2>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Hotline Tư vấn
            </label>
            <input
              type="text"
              value={settings.hotline}
              onChange={(e) => updateSettings({ hotline: e.target.value })}
              placeholder="1800 646466"
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Email Tuyển sinh
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
              placeholder="tuyensinh@topica.edu.vn"
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Địa chỉ Trụ sở chính
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => updateSettings({ address: e.target.value })}
              placeholder="Tầng 5, Tòa nhà HITC..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-brand-700" />
            <span>Kênh Mạng Xã Hội</span>
          </h2>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Facebook Fanpage URL
            </label>
            <input
              type="url"
              value={settings.facebook}
              onChange={(e) => updateSettings({ facebook: e.target.value })}
              placeholder="https://www.facebook.com/..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Kênh YouTube URL
            </label>
            <input
              type="url"
              value={settings.youtube}
              onChange={(e) => updateSettings({ youtube: e.target.value })}
              placeholder="https://www.youtube.com/..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Zalo OA / Hotline Zalo
            </label>
            <input
              type="text"
              value={settings.zalo}
              onChange={(e) => updateSettings({ zalo: e.target.value })}
              placeholder="https://zalo.me/..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Global SEO Settings */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-700" />
            <span>Nhận diện Website & SEO Tổng quan</span>
          </h2>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Tiêu đề Website (Site Title)
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => updateSettings({ siteTitle: e.target.value })}
              placeholder="Viện Đào tạo Quốc tế Topica..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Mô tả Website (Site Description)
            </label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => updateSettings({ siteDescription: e.target.value })}
              placeholder="Mô tả tóm tắt thương hiệu Topica..."
              className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Telegram Notification Card */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-brand-700" />
            <span>Thông Báo Lead Về Telegram Tức Thì</span>
          </h2>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            Tự động gửi thông tin học viên vừa điền form vào nhóm Telegram của phòng tuyển sinh ngay lập tức.
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Telegram Bot Token
            </label>
            <input
              type="text"
              value={settings.telegramBotToken || ""}
              onChange={(e) => updateSettings({ telegramBotToken: e.target.value })}
              placeholder="VD: 7123456789:AAHKz..."
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 font-mono text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
              Telegram Chat ID / Group ID
            </label>
            <input
              type="text"
              value={settings.telegramChatId || ""}
              onChange={(e) => updateSettings({ telegramChatId: e.target.value })}
              placeholder="VD: -1001234567890 hoặc 12345678"
              className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 font-mono text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
