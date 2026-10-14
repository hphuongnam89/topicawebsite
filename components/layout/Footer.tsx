import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  campuses as defaultCampuses,
  contactChannels as defaultChannels,
  type Campus,
} from "@/data/campuses";
import { primaryNav } from "@/data/navigation";
import type { ContactChannels } from "@/lib/services/public-site";

const utilityFooterLinks = [
  { label: "Cổng học tập Elearning", href: "/he-thong/" },
  { label: "Thư viện điện tử (E-LIB)", href: "https://elib.pxu.edu.vn/" },
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat/" },
  { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung/" },
] as const;

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/viendaotaoquocte.topica",
    icon: "fb",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@viendaotaoquoctetopica",
    icon: "yt",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@viendaotaoquoctetopica",
    icon: "tt",
  },
] as const;

export function Footer({
  channels: contactChannels = defaultChannels,
  locations: campuses = defaultCampuses,
}: { channels?: ContactChannels; locations?: readonly Campus[] } = {}) {
  return (
    <footer className="flex w-full flex-col border-t-4 border-gold-500" role="contentinfo">
      {/* Main footer */}
      <div className="bg-paper text-ink-800">
        <Container className="py-12 sm:py-16">
          <div className="grid min-w-0 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
            {primaryNav.map((group) => (
              <div key={group.id} className="min-w-0">
                <h2 className="mb-4 font-sans text-body-sm font-bold tracking-wide text-navy-900 uppercase">
                  {group.label}
                </h2>
                <ul className="space-y-2.5">
                  {group.columns.flatMap((column) => column.items).map((item) => (
                    <li key={item.href ?? item.label}>
                      <Link
                        href={item.href ?? group.href}
                        className="text-body-sm break-words text-ink-600 transition-colors duration-[var(--duration-base)] hover:text-gold-700"
                        {...(item.href?.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="min-w-0">
              <h2 className="mb-4 font-sans text-body-sm font-bold tracking-wide text-navy-900 uppercase">
                Tiện ích & Chính sách
              </h2>
              <ul className="space-y-2.5">
                {utilityFooterLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm break-words text-ink-600 transition-colors duration-[var(--duration-base)] hover:text-gold-700"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 border-t border-line-200 pt-8 sm:col-span-2 md:col-span-3 xl:col-span-7">
              <h2 className="mb-4 font-sans text-body-sm font-bold tracking-wide text-navy-900 uppercase">
                Liên hệ
              </h2>
              <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
                {campuses.map((campus) => (
                  <li key={`${campus.city}-${campus.address}`} className="flex gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    <p className="text-body-sm text-ink-600">
                      <span className="font-medium text-ink-950">{campus.city}: </span>
                      {campus.address}
                    </p>
                  </li>
                ))}

                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <div className="text-body-sm text-ink-600">
                    <span className="font-medium text-ink-950">Tuyển sinh: </span>
                    <a
                      href={contactChannels.admissionsHotline.href}
                      className="font-bold text-ink-900 transition-colors hover:text-gold-700"
                    >
                      {contactChannels.admissionsHotline.value}
                    </a>
                    <span className="text-xs text-ink-500"> (Miễn cước)</span>
                    <br />
                    <span className="font-medium text-ink-950">Tư vấn nhanh: </span>
                    <a
                      href={contactChannels.admissionsDirect.href}
                      className="font-bold text-ink-900 transition-colors hover:text-gold-700"
                    >
                      {contactChannels.admissionsDirect.value}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <div className="text-body-sm text-ink-600">
                    <div>
                      <span className="font-medium text-ink-950">Tuyển sinh: </span>
                      <a
                        href={contactChannels.admissionsEmail.href}
                        className="font-bold text-ink-900 transition-colors hover:text-gold-700"
                      >
                        {contactChannels.admissionsEmail.value}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-ink-950">Chung: </span>
                      <a
                        href={contactChannels.generalEmail.href}
                        className="font-bold text-ink-900 transition-colors hover:text-gold-700"
                      >
                        {contactChannels.generalEmail.value}
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-800 bg-navy-900 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] text-white lg:pb-0">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-center sm:flex-row sm:text-left">
          {/* Logo */}
          <div className="flex h-16 w-44 items-center justify-center">
            <Image
              src="/topica-logo-transparent.png"
              alt="Topica"
              width={768}
              height={358}
              className="max-h-16 w-full object-contain"
            />
          </div>

          {/* Copyright */}
          <p className="text-[12px] text-white/70">
            © {new Date().getFullYear()} Trường Đại học Phú Xuân. Tất cả quyền được bảo lưu.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 text-gold-400 transition-colors duration-[var(--duration-base)] hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
              >
                <SocialIcon type={social.icon} />
              </a>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}

// Simple social SVG icons (avoiding dependency on a full icon pack for brand icons)
function SocialIcon({ type }: { type: string }) {
  const iconClass = "h-5 w-5";
  switch (type) {
    case "fb":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "yt":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "tt":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    default:
      return null;
  }
}
