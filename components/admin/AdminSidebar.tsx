"use client";

import React, { useEffect, useRef, useState } from "react";
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
  History,
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileOpen) return;
    const aside = asideRef.current;
    const trigger = triggerRef.current;
    if (!aside) return;
    const main = aside.closest(".min-h-screen")?.querySelector("main");
    const previousInert = main?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (main) main.inert = true;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(aside.querySelectorAll<HTMLElement>("a[href],button:not(:disabled)")).filter(
        (element) => element.getClientRects().length > 0,
      );
    focusable()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileOpen(false);
      }
      if (event.key !== "Tab") return;
      const items = focusable(),
        first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      if (main) main.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const handleDirty = (event: Event) => {
      const dirty = (event as CustomEvent<{ dirty?: boolean }>).detail?.dirty;
      setHasUnsavedChanges(Boolean(dirty));
    };
    const handleNavigation = (event: MouseEvent) => {
      if (!hasUnsavedChanges || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href)
        return;
      if (!window.confirm("Bạn có thay đổi chưa lưu. Rời trang sẽ mất dữ liệu, tiếp tục?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("topica:unsaved-changes", handleDirty);
    document.addEventListener("click", handleNavigation, true);
    return () => {
      window.removeEventListener("topica:unsaved-changes", handleDirty);
      document.removeEventListener("click", handleNavigation, true);
    };
  }, [hasUnsavedChanges]);

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return null;
  }

  const navItems = [
    { title: "Nội dung & phê duyệt", href: "/admin/content", icon: ShieldCheck },
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
    ...(user.role === "admin"
      ? [{ title: "Nhật ký quản trị", href: "/admin/audit", icon: History }]
      : []),
  ].filter(
    (item) =>
      user.role === "admin" ||
      !["/admin/leads", "/admin/users", "/admin/homepage", "/admin/settings"].includes(item.href),
  );

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
      <div className="flex h-16 items-center justify-between border-b border-navy-800 bg-navy-950 px-4 lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-display text-lg font-bold text-white"
        >
          <GraduationCap className="h-6 w-6 text-gold-300" />
          <span>TOPICA ADMIN</span>
        </Link>
        <button
          ref={triggerRef}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-md p-2 text-white hover:bg-white/10"
          aria-label="Mở menu quản trị"
          aria-expanded={isMobileOpen}
          aria-controls="admin-navigation"
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
        ref={asideRef}
        id="admin-navigation"
        role={isMobileOpen ? "dialog" : undefined}
        aria-modal={isMobileOpen ? true : undefined}
        aria-label="Điều hướng quản trị"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-navy-800 bg-navy-950 text-white transition-transform duration-200 lg:visible lg:static lg:translate-x-0 ${
          isMobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-display text-xl font-bold text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-navy-950 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">TOPICA</span>
              <span className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Đóng menu quản trị"
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gold-300 uppercase">
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
                      ? "bg-gold-500 font-semibold text-navy-950 shadow-xs"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? "text-navy-950" : "text-gold-300"}`}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-wider text-gold-300 uppercase">
            Tiện ích
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Globe className="h-5 w-5 text-gold-300" />
              <span>Xem trang ngoài</span>
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-semibold text-navy-950">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/60">
                @{user.username} • {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-3 py-2 text-body-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
