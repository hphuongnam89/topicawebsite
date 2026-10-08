import React from "react";
import styles from "./site.module.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <AnalyticsTracker />
      <AnalyticsConsent />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingActions />
      <MobileStickyBar />
    </div>
  );
}
