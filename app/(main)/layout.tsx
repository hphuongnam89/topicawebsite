import { LocalizedText } from "@/components/i18n/LocalizedText";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { connection } from "next/server";
import { getLiveContact } from "@/lib/services/public-site";
import { headers } from "next/headers";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await connection(); // SQLite publication/expiry is evaluated per request, without a stale ISR window.
  const contact = getLiveContact();
  const initialLocale = (await headers()).get("x-topica-locale") === "en" ? "en" : "vi";
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AnalyticsTracker />
      <Header channels={contact.channels} />
      <main id="main-content">
        <LocalizedText>{children}</LocalizedText>
      </main>
      <Footer channels={contact.channels} locations={contact.locations} />
      <FloatingActions channels={contact.channels} />
      <MobileStickyBar />
    </LanguageProvider>
  );
}
