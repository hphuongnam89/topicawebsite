import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = {
  title: "Topica Admin Portal - Quản trị hệ thống",
  description: "Trang quản trị nội dung website Topica Edu",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // We handle redirect here in Node.js runtime instead of Edge middleware
  // because Edge middleware on Render does not reliably receive runtime environment variables (like ADMIN_SESSION_SECRET),
  // causing signature verification mismatch.
  if (!user && pathname !== "/admin/login") {
    const from = pathname && pathname !== "/admin" ? `?from=${encodeURIComponent(pathname)}` : "";
    redirect(`/admin/login${from}`);
  }
  
  if (user && pathname === "/admin/login") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-ink-950 antialiased">
      {user && <AdminSidebar user={user} />}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
