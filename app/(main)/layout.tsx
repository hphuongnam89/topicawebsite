import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsTracker />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingActions />
      <MobileStickyBar />
    </>
  );
}
