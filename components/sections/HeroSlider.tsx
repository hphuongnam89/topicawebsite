"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Award,
  Pause,
  Play,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LeadForm } from "@/components/forms/LeadForm";
import { homepageContent } from "@/data/homepage-content";
import { isPublicClaimApproved } from "@/CONTENT_SOURCE_OF_TRUTH";

const AUTO_SLIDE_INTERVAL = 2000; // 2 giây theo yêu cầu

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const handledFocusRequest = useRef(0);
  const isPaused = isHovered || isFocused || isTouching || isStopped || reducedMotion;
  const showTalentScholarship = isPublicClaimApproved("scholarship.talent-30");
  const totalSlides = showTalentScholarship ? 3 : 2;
  const touchStartX = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleRegisterFromBanner = useCallback(() => {
    setCurrentIndex(0);
    setFocusRequest((value) => value + 1);
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (handledFocusRequest.current === focusRequest || currentIndex !== 0) return;
    handledFocusRequest.current = focusRequest;
    const form = document.getElementById("consultation-form");
    form?.querySelector("input")?.focus({ preventScroll: true });
    form?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" });
  }, [currentIndex, focusRequest, reducedMotion]);

  useEffect(() => {
    const register = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href="#consultation-form"]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      handleRegisterFromBanner();
    };
    document.addEventListener("click", register);
    return () => document.removeEventListener("click", register);
  }, [handleRegisterFromBanner]);

  // Tự động chuyển slide sau mỗi 2 giây, tạm dừng khi hover hoặc thao tác form
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Hỗ trợ vuốt chạm trên thiết bị di động
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsTouching(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    setIsTouching(false);
  };

  return (
    <section
      className="relative w-full overflow-clip bg-ink-950 text-white"
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero banner carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hiệu ứng ánh sáng nền ambient */}
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden="true">
        <div className="absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[30rem] w-[30rem] rounded-full border border-brand-300/20" />
      </div>

      {/* Dải trượt ngang toàn bộ Hero Section */}
      <div
        className="flex w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {/* ========================================================= */}
        {/* SLIDE 1: Hero Section Đăng Ký Tư Vấn (Giao diện chuẩn)     */}
        {/* ========================================================= */}
        <div
          className="w-full min-w-full shrink-0"
          role="group"
          aria-roledescription="slide"
          inert={currentIndex !== 0}
          aria-hidden={currentIndex !== 0}
          aria-label="1 of 3: Đăng ký tư vấn"
        >
          <Container className="relative grid gap-10 py-14 min-[820px]:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.75fr)] min-[820px]:items-center min-[820px]:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.65fr)] lg:gap-16 lg:pt-14 lg:pb-20">
            <div className="max-w-3xl min-w-0">
              <p className="homepage-enter homepage-enter-delay-40 text-body-sm font-semibold tracking-[0.14em] text-brand-300 uppercase">
                {homepageContent.hero.eyebrow}
              </p>
              <h1
                id="homepage-title"
                className="homepage-enter homepage-enter-delay-100 mt-6 max-w-[14ch] font-display text-[clamp(2.45rem,6vw,5rem)] leading-[1.04] font-semibold text-white"
              >
                {homepageContent.hero.title}
              </h1>
              <p
                id="homepage-description"
                className="homepage-enter homepage-enter-delay-160 mt-6 max-w-[58ch] text-body-lg leading-relaxed text-white/75"
              >
                {homepageContent.hero.description}
              </p>
              <div className="homepage-enter homepage-enter-delay-220 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href="#consultation-form"
                  data-track="hero_primary_cta_click"
                  data-track-label="homepage_consultation"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sm:hidden">Kiểm tra hồ sơ & nhận tư vấn</span>
                  <span className="hidden sm:inline">{homepageContent.hero.primaryCta}</span>
                </ButtonLink>
                <ButtonLink
                  href="#programs"
                  data-track="hero_secondary_cta_click"
                  data-track-label="homepage_programs"
                  variant="secondary"
                  size="lg"
                  className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  {homepageContent.hero.secondaryCta}
                </ButtonLink>
              </div>
              <ul
                className="homepage-enter homepage-enter-delay-260 mt-8 flex flex-wrap gap-2"
                aria-label="Điểm nổi bật"
              >
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Học linh hoạt
                </li>
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Tư vấn theo hồ sơ
                </li>
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/75 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Nguồn chính thức rõ ràng
                </li>
              </ul>
            </div>

            <div
              id="consultation-form"
              className="homepage-enter homepage-enter-delay-260 min-w-0 scroll-mt-24"
            >
              <LeadForm
                heading={homepageContent.hero.formTitle}
                description={homepageContent.hero.formDescription}
                responseTime={homepageContent.hero.responseTime}
              />
            </div>
          </Container>
        </div>

        {/* ========================================================= */}
        {/* SLIDE 2: Thông Báo Tuyển Sinh Mới Nhất (Toàn Hero)       */}
        {/* ========================================================= */}
        <div
          className="w-full min-w-full shrink-0"
          role="group"
          aria-roledescription="slide"
          inert={currentIndex !== 1}
          aria-hidden={currentIndex !== 1}
          aria-label="2 of 3: Thông báo tuyển sinh mới nhất"
        >
          <Container className="relative grid gap-10 py-14 min-[820px]:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.75fr)] min-[820px]:items-center min-[820px]:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.65fr)] lg:gap-16 lg:pt-14 lg:pb-20">
            <div className="max-w-3xl min-w-0">
              <p className="border-brand-400/40 inline-flex items-center gap-2 rounded-full border bg-brand-500/20 px-3.5 py-1 text-body-sm font-semibold tracking-[0.14em] text-brand-300 uppercase backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Thông tin tuyển sinh theo từng đợt
              </p>
              <h2 className="mt-6 max-w-[14ch] font-display text-[clamp(2.45rem,6vw,4.8rem)] leading-[1.06] font-semibold text-white">
                Xét tuyển Đại học trực tuyến theo thông báo hiện hành
              </h2>
              <p className="mt-6 max-w-[58ch] text-body-lg leading-relaxed text-white/80">
                Danh mục chương trình gồm các ngành đào tạo trọng điểm. Ngành mở tuyển, điều kiện và
                thời hạn nhận hồ sơ được xác nhận theo từng thông báo hiện hành.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={handleRegisterFromBanner}
                  size="lg"
                  className="cursor-pointer bg-brand-500 hover:bg-brand-600"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Đăng ký xét tuyển ngay
                </Button>
                <ButtonLink
                  href="#programs"
                  variant="secondary"
                  size="lg"
                  className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  Xem các ngành đào tạo
                </ButtonLink>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Lợi thế tuyển sinh">
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/85 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Bằng do Trường Đại học Phú Xuân cấp
                </li>
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/85 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Xét tuyển theo hồ sơ
                </li>
                <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/85 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  Không thi tuyển áp lực
                </li>
              </ul>
            </div>

            {/* Cột phải: Poster tuyển sinh */}
            <div
              className="from-brand-950/80 to-ink-900/90 relative aspect-square w-full max-w-[420px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br shadow-2xl transition-transform hover:scale-[1.02]"
              onClick={handleRegisterFromBanner}
              title="Nhấp để đăng ký xét tuyển ngay"
            >
              <Image
                src="/images/banners/thong-bao-tuyen-sinh.jpg"
                alt="Thông báo tuyển sinh cử nhân trực tuyến Topica"
                fill
                sizes="(max-width: 820px) 100vw, 420px"
                className="bg-white object-contain object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-black/20" />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-xl bg-ink-950/85 p-3.5 backdrop-blur-md">
                <div>
                  <p className="text-xs font-semibold text-brand-300 uppercase">Topica Uni</p>
                  <p className="text-sm font-bold text-white">
                    Cần xác nhận theo thông báo hiện hành
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow">
                  Đăng ký ngay <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Container>
        </div>

        {/* ========================================================= */}
        {/* SLIDE 3: Học Bổng Ngành QTKD Giảm 30% (Toàn Hero)         */}
        {/* ========================================================= */}
        {showTalentScholarship && (
          <div
            className="w-full min-w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            inert={currentIndex !== 2}
            aria-hidden={currentIndex !== 2}
            aria-label="3 of 3: Học bổng ngành Quản trị kinh doanh"
          >
            <Container className="relative grid gap-10 py-14 min-[820px]:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.75fr)] min-[820px]:items-center min-[820px]:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.65fr)] lg:gap-16 lg:pt-14 lg:pb-20">
              <div className="max-w-3xl min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3.5 py-1 text-body-sm font-semibold tracking-[0.14em] text-amber-300 uppercase backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  Học bổng Talent theo thông báo hiện hành
                </p>
                <h2 className="mt-6 max-w-[14ch] font-display text-[clamp(2.45rem,6vw,4.8rem)] leading-[1.06] font-semibold text-white">
                  Tìm hiểu học bổng Talent cho ngành QTKD
                </h2>
                <p className="mt-6 max-w-[58ch] text-body-lg leading-relaxed text-white/80">
                  Mức hỗ trợ và điều kiện áp dụng được xác nhận theo thông báo học bổng hiện hành.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    onClick={handleRegisterFromBanner}
                    size="lg"
                    className="cursor-pointer bg-amber-500 font-bold text-ink-950 hover:bg-amber-400"
                    rightIcon={<ArrowRight className="h-4 w-4 text-ink-950" aria-hidden="true" />}
                  >
                    Nhận tư vấn học bổng
                  </Button>
                  <ButtonLink
                    href="/quan-tri-kinh-doanh-marketing/"
                    variant="secondary"
                    size="lg"
                    className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
                  >
                    Chi tiết ngành QTKD
                  </ButtonLink>
                </div>
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Chi tiết ưu đãi">
                  <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-body-sm text-amber-200 backdrop-blur-sm">
                    <Award className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    Talent giảm 30% theo điều kiện thông báo
                  </li>
                  <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/85 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                    Theo chính sách học bổng hiện hành
                  </li>
                  <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white/85 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                    Hotline: 0901 795 580
                  </li>
                </ul>
              </div>

              {/* Cột phải: Nội dung học bổng chờ xác nhận theo thông báo */}
              <div
                className="bg-ink-900 relative aspect-square w-full max-w-[420px] cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-400/30 shadow-2xl transition-transform hover:scale-[1.02]"
                onClick={handleRegisterFromBanner}
                title="Nhấp để đăng ký nhận học bổng 30% ngay"
              >
                <div className="via-ink-900 absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-950 to-ink-950 p-8 text-center">
                  <p className="max-w-[16ch] font-display text-3xl font-semibold text-amber-200">
                    Học bổng Talent theo thông báo hiện hành
                  </p>
                </div>
              </div>
            </Container>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* NÚT ĐIỀU HƯỚNG PREV / NEXT HAI BÊN TOÀN CHIỀU NGANG HERO   */}
      {/* ========================================================= */}
      <button
        type="button"
        onClick={prevSlide}
        className="hover:bg-ink-900 absolute bottom-4 left-3 z-20 min-h-11 min-w-11 cursor-pointer rounded-full border border-white/15 bg-ink-950/70 p-2.5 text-white/80 shadow-lg backdrop-blur-md transition-[color,background-color,border-color] hover:border-white/40 hover:text-white sm:top-1/2 sm:bottom-auto sm:left-6 sm:-translate-y-1/2"
        aria-label="Slide trước"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="hover:bg-ink-900 absolute right-3 bottom-4 z-20 min-h-11 min-w-11 cursor-pointer rounded-full border border-white/15 bg-ink-950/70 p-2.5 text-white/80 shadow-lg backdrop-blur-md transition-[color,background-color,border-color] hover:border-white/40 hover:text-white sm:top-1/2 sm:right-6 sm:bottom-auto sm:-translate-y-1/2"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      {/* ========================================================= */}
      {/* THANH CHỈ THỊ DOTS INDICATOR DƯỚI ĐÁY TOÀN HERO SECTION   */}
      {/* ========================================================= */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full border border-white/10 bg-ink-950/80 px-2 py-1 backdrop-blur-md">
        {[
          { label: "Đăng ký tư vấn", index: 0 },
          { label: "Tuyển sinh mới nhất", index: 1 },
          { label: "Học bổng QTKD 30%", index: 2 },
        ].map((item) => {
          const isActive = currentIndex === item.index;
          return (
            <button
              key={item.index}
              type="button"
              aria-pressed={isActive}
              aria-label={`Chuyển đến: ${item.label}`}
              onClick={() => goToSlide(item.index)}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
            >
              <span
                aria-hidden="true"
                className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${isActive ? "bg-brand-400 w-7" : "w-2.5 bg-white/30"}`}
              />
            </button>
          );
        })}
        <button
          type="button"
          aria-label={isStopped ? "Bật tự động chuyển slide" : "Dừng tự động chuyển slide"}
          aria-pressed={isStopped}
          onClick={() => setIsStopped((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-full text-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
        >
          {isStopped ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}
