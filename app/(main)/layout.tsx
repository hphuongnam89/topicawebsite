import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { connection } from "next/server";
import { getLiveContact } from "@/lib/services/public-site";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await connection(); // SQLite publication/expiry is evaluated per request, without a stale ISR window.
  const contact = getLiveContact();
  return (
    <>
      <AnalyticsTracker />
      <Header channels={contact.channels} />
      <main id="main-content">{children}</main>
      <Footer channels={contact.channels} locations={contact.locations} />
      <FloatingActions channels={contact.channels} />
      <MobileStickyBar />
    </>
  );
}
