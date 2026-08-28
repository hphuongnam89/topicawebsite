"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Card Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-900/50 mb-4 ring-8 ring-white/10">
            <GraduationCap className="h-9 w-9" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            TOPICA ADMIN PORTAL
          </h1>
          <p className="mt-2 text-body-sm text-slate-400">
            Đăng nhập để quản lý nội dung website Topica Edu
          </p>
        </div>

        {/* Login Card Form */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-body-sm text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-11 w-full rounded-lg border border-line-200 bg-white pl-10 pr-3.5 text-body text-ink-950 transition-all placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-line-200 bg-white pl-10 pr-3.5 text-body text-ink-950 transition-all placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Tài khoản mặc định:</span>
              <div className="mt-1 flex justify-between">
                <span>User: <code className="bg-white px-1.5 py-0.5 rounded border">admin</code></span>
                <span>Pass: <code className="bg-white px-1.5 py-0.5 rounded border">admin@topica2026</code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 font-semibold text-white transition-all hover:bg-brand-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 shadow-md shadow-brand-700/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Viện Đào tạo Quốc tế Topica. All rights reserved.
        </div>
      </div>
    </div>
  );
}
