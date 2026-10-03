"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({
  className = "",
  tone = "header",
}: {
  className?: string;
  tone?: "header" | "surface";
}) {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const toneClassName =
    tone === "surface"
      ? "border-line-200 [&>a]:text-ink-600 [&>a:hover]:bg-brand-50 [&>a:hover]:text-brand-700 [&>span]:text-ink-900"
      : "border-white/25 [&>a]:text-white/75 [&>a:hover]:bg-white/10 [&>a:hover]:text-white [&>span]:text-white";

  return (
    <div
      className={`flex items-center gap-1 rounded-md border p-1 text-xs font-semibold ${toneClassName} ${className}`}
      aria-label="Ngôn ngữ"
    >
      {isEnglish ? (
        <Link href="/" className="rounded px-2 py-1 transition-colors" lang="vi">
          VI
        </Link>
      ) : (
        <span className="rounded px-2 py-1" aria-current="true">
          VI
        </span>
      )}
      <Link href="/en/" className="rounded px-2 py-1 transition-colors" lang="en">
        EN
      </Link>
    </div>
  );
}
