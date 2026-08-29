"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Image as ImageIcon,
  FileText,
  FolderTree,
  Users,
  Settings,
  ShieldCheck,
  Globe,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name: string;
    username: string;
    role: string;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return null;
  }

  const navItems = [
    {
      title: "Tổng quan",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Cấu hình Trang chủ",
      href: "/admin/homepage",
      icon: Home,
    },
    {
      title: "Quản lý Trang (Pages)",
      href: "/admin/pages",
      icon: FileText,
      exact: false,
    },
    {
      title: "Quản lý Tin tức",
      href: "/admin/articles",
      icon: FileText,
      exact: true,
    },
    {
      title: "Danh mục Tin tức",
      href: "/admin/articles/categories",
      icon: FolderTree,
    },
    {
      title: "Thư viện Media",
      href: "/admin/media",
      icon: ImageIcon,
    },
    {
      title: "Tiếp nhận Lead Tư vấn",
      href: "/admin/leads",
      icon: Users,
    },
    {
      title: "Quản trị viên (Users)",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Cấu hình Chung",
      href: "/admin/settings",
      icon: Settings,
      exact: true,
    },
    {
      title: "Tài khoản & Bảo mật",
      href: "/admin/settings/account",
      icon: ShieldCheck,
    },
  ];

  const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      setLoggingOut(true);
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        setLoggingOut(false);
      }
    }
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="flex h-16 items-center justify-between border-b border-line-200 bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
          <GraduationCap className="h-6 w-6 text-brand-700" />
          <span>TOPICA ADMIN</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-md p-2 text-ink-700 hover:bg-paper"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-line-200 px-6">
          <Link href="/admin" className="flex items-center gap-2.5 font-display text-xl font-bold text-brand-700">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">TOPICA</span>
              <span className="text-[10px] font-semibold tracking-wider text-ink-500 uppercase">Admin Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-paper lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">
            Quản trị nội dung
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700 shadow-xs"
                      : "text-ink-700 hover:bg-paper hover:text-ink-950"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-brand-700" : "text-ink-500"}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">
            Tiện ích
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-ink-700 transition-colors hover:bg-paper hover:text-ink-950"
            >
              <Globe className="h-5 w-5 text-ink-500" />
              <span>Xem trang ngoài</span>
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-line-200 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-ink-500">@{user.username} • {user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-200 bg-white px-3 py-2 text-body-sm font-medium text-error transition-colors hover:bg-error/5 hover:border-error/20"
          >
            <LogOut className="h-4 w-4" />
            <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
