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

  // If user is not logged in and not on login page, we let individual pages or middleware handle redirect,
  // or we pass a fallback user if on login.
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-ink-950 antialiased">
      {user && <AdminSidebar user={user} />}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
