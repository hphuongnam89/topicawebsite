"use client";

import * as React from "react";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  Input,
  Select,
  Textarea,
  Alert,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Container,
  Section,
  SectionHeading,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  DocumentCard,
  Pagination,
} from "@/components/ui";
import { CheckCircle2, Award, BookOpen, Clock, ShieldCheck, Mail, User } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-canvas pb-24 font-sans text-ink-800">
      {/* Hero Header */}
      <div className="border-b border-line-200 bg-surface-subtle py-12 lg:py-16">
        <Container>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="navy">Topica Design System v3.0</Badge>
              <StatusBadge variant="verified">Chuẩn học thuật PXU</StatusBadge>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl lg:text-5xl">
              Quy chuẩn Thiết kế & Hệ thống Thành phần
            </h1>
            <p className="mt-4 text-body-lg text-ink-600 leading-relaxed">
              Ngôn ngữ thiết kế học thuật, hiện đại, gần gũi và minh bạch. Đồng bộ nhận diện thương hiệu giữa Viện Đào tạo Quốc tế Topica và Trường Đại học Phú Xuân (PXU).
            </p>
          </div>
        </Container>
      </div>

      <Container className="mt-12 space-y-16">
        {/* 1. PALETTE & TOKENS */}
        <section aria-labelledby="tokens-heading" className="space-y-6">
          <SectionHeading
            id="tokens-heading"
            title="1. Bảng màu & Nhận diện Học thuật"
            subtitle="Phối màu chủ đạo gồm hai sắc Navy (#00264D, #16466B) tạo độ tin cậy học thuật, điểm nhấn Vàng Gold (#B78744) từ logo, trên nền sáng thoáng đạt."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Navy Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="h-20 w-full rounded-md bg-navy-900 flex items-end p-3 text-white font-mono text-xs">
                #00264D
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">Navy chính (Primary)</h4>
              <p className="text-body-sm text-ink-600">Header/Footer, Tiêu đề chính, Nút chính trên nền sáng.</p>
            </div>

            {/* Secondary Blue Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="h-20 w-full rounded-md bg-navy-secondary flex items-end p-3 text-white font-mono text-xs">
                #16466B
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">Xanh bổ trợ (Secondary)</h4>
              <p className="text-body-sm text-ink-600">Mảng phụ, icon khối chuyên đề, chuyển sắc tinh tế.</p>
            </div>

            {/* Gold Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="h-20 w-full rounded-md bg-gold-500 flex items-end p-3 text-navy-950 font-mono text-xs font-semibold">
                #B78744
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">Vàng Gold (Accent)</h4>
              <p className="text-body-sm text-ink-600">Điểm nhấn nhận diện logo, CTA Đăng ký xét tuyển nổi bật.</p>
            </div>

            {/* Surface Paper Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="h-20 w-full rounded-md bg-surface-subtle border border-line-200 flex items-end p-3 text-ink-800 font-mono text-xs">
                #F3F6FA / #FFFFFF
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">Nền phân đoạn (Surfaces)</h4>
              <p className="text-body-sm text-ink-600">Canvas trắng và xám xanh nhạt tạo độ tương phản êm dịu.</p>
            </div>
          </div>
        </section>

        {/* 2. TYPOGRAPHY */}
        <section aria-labelledby="typography-heading" className="space-y-6">
          <SectionHeading
            id="typography-heading"
            title="2. Quy chuẩn Typography"
            subtitle="Kết hợp Be Vietnam Pro cho nội dung đọc và Lora cho tiêu đề học thuật trang trọng."
          />

          <div className="rounded-xl border border-line-200 bg-surface-subtle p-6 space-y-6 sm:p-8">
            <div className="space-y-2 border-b border-line-200 pb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-400">Display / H1 Serif — Font Lora</span>
              <h2 className="font-serif text-3xl font-bold text-ink-950 sm:text-4xl">
                Cử nhân Trực tuyến Trường Đại học Phú Xuân
              </h2>
              <p className="text-body-sm text-ink-600 font-mono">Lora · Bold · Vùng đọc 60-75 ký tự/dòng</p>
            </div>

            <div className="space-y-2 border-b border-line-200 pb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-400">Heading 2 / H2 Serif</span>
              <h3 className="font-serif text-2xl font-bold text-ink-950">
                5 Ngành đào tạo đón đầu kỷ nguyên số & kinh tế tri thức
              </h3>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-400">Body Text — Be Vietnam Pro</span>
              <p className="text-body text-ink-body leading-relaxed max-w-3xl">
                Chương trình đào tạo đại học từ xa theo phương thức E-Learning kết hợp công nghệ hiện đại, lịch học linh hoạt dành cho người đi làm. Văn bằng cử nhân do Trường Đại học Phú Xuân cấp, không ghi hình thức đào tạo theo Thông tư 27/2019/TT-BGDĐT.
              </p>
            </div>
          </div>
        </section>

        {/* 3. BUTTONS & CTAS */}
        <section aria-labelledby="buttons-heading" className="space-y-6">
          <SectionHeading
            id="buttons-heading"
            title="3. Nút bấm & Hành động (Button Taxonomy)"
            subtitle="Phân cấp rõ ràng: Primary (Navy học thuật), Accent (Vàng Gold chuyển đổi), Secondary (Viền Navy), Outline và Ghost."
          />

          <div className="rounded-xl border border-line-200 bg-canvas p-6 space-y-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Nút Primary Navy</Button>
              <Button variant="accent">Nút Accent Gold</Button>
              <Button variant="secondary">Nút Secondary Viền</Button>
              <Button variant="outline">Nút Outline</Button>
              <Button variant="tertiary">Nút Tertiary Link</Button>
              <Button variant="ghost">Nút Ghost</Button>
              <Button variant="destructive">Nút Destructive</Button>
            </div>

            <div className="border-t border-line-200 pt-6">
              <h4 className="text-body font-semibold text-ink-950 mb-3">Các trạng thái tương tác (States):</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" loading>Đang tải dữ liệu</Button>
                <Button variant="accent" disabled>Vô hiệu hóa (Disabled)</Button>
                <Button variant="primary" size="sm">Kích cỡ Nhỏ (SM)</Button>
                <Button variant="primary" size="default">Kích cỡ Tiêu chuẩn</Button>
                <Button variant="primary" size="lg">Kích cỡ Lớn (LG)</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BADGES & STATUS INDICATORS */}
        <section aria-labelledby="badges-heading" className="space-y-6">
          <SectionHeading
            id="badges-heading"
            title="4. Huy hiệu & Trạng thái Tuyển sinh"
            subtitle="Tuân thủ tiêu chuẩn tiếp cận WCAG AA: màu sắc luôn đi kèm chỉ báo biểu tượng hoặc văn bản rõ nghĩa."
          />

          <div className="rounded-xl border border-line-200 bg-canvas p-6 space-y-6 sm:p-8">
            <div className="space-y-3">
              <h4 className="text-body font-semibold text-ink-950">Status Badges (Trạng thái kỳ tuyển sinh & kiểm định):</h4>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant="active" />
                <StatusBadge variant="upcoming" />
                <StatusBadge variant="new" />
                <StatusBadge variant="verified" />
                <StatusBadge variant="featured" />
                <StatusBadge variant="closed" />
                <StatusBadge variant="expired" />
              </div>
            </div>

            <div className="border-t border-line-200 pt-6 space-y-3">
              <h4 className="text-body font-semibold text-ink-950">Context Badges:</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">132 Tín chỉ</Badge>
                <Badge variant="navy">Trường Đại học Phú Xuân</Badge>
                <Badge variant="brand">Topica Uni</Badge>
                <Badge variant="success">Học bổng 30%</Badge>
                <Badge variant="warning">Hạn nộp 30/10</Badge>
                <Badge variant="outline">Bằng Cử nhân PXU</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FORM CONTROLS */}
        <section aria-labelledby="form-heading" className="space-y-6">
          <SectionHeading
            id="form-heading"
            title="5. Biểu mẫu & Trường nhập liệu"
            subtitle="Nhãn rõ ràng, focus ring sắc nét, thông báo lỗi ngay dưới trường với aria-invalid đầy đủ."
          />

          <div className="rounded-xl border border-line-200 bg-canvas p-6 sm:p-8 max-w-2xl">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input
                id="demo-name"
                label="Họ và tên người học"
                placeholder="Nguyễn Văn A"
                required
                leftIcon={<User className="h-4 w-4" />}
                helperText="Điền đầy đủ họ và tên theo giấy khai sinh hoặc CCCD."
              />

              <Input
                id="demo-phone-error"
                label="Số điện thoại liên hệ"
                placeholder="0912 345 678"
                required
                error="Số điện thoại chưa hợp lệ. Vui lòng nhập đúng 10 chữ số."
              />

              <Select
                id="demo-program"
                label="Ngành học quan tâm"
                required
                options={[
                  { value: "qtkd", label: "Quản trị kinh doanh" },
                  { value: "qtdllh", label: "Quản trị du lịch và lữ hành" },
                  { value: "cntt", label: "Công nghệ thông tin - Đồ hoạ kỹ thuật số" },
                  { value: "nna", label: "Ngôn ngữ Anh" },
                  { value: "nnt", label: "Ngôn ngữ Trung Quốc" },
                ]}
              />

              <Textarea
                id="demo-note"
                label="Nội dung câu hỏi hoặc ghi chú thêm"
                placeholder="Tôi muốn tìm hiểu về thời gian đào tạo và chính sách miễn giảm tín chỉ..."
                rows={3}
              />

              <div className="pt-2">
                <Button variant="primary" type="button">
                  Gửi yêu cầu thử nghiệm
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* 6. ALERTS & CALLOUTS */}
        <section aria-labelledby="alerts-heading" className="space-y-6">
          <SectionHeading
            id="alerts-heading"
            title="6. Hộp thông báo (Alerts & Callouts)"
            subtitle="Phục vụ các thông báo pháp lý, hạn tuyển sinh, lưu ý học phí và phản hồi kết quả."
          />

          <div className="space-y-4 max-w-3xl">
            <Alert variant="info" title="Thông tin pháp lý văn bằng">
              Văn bằng do Trường Đại học Phú Xuân cấp, thuộc hệ thống văn bằng quốc gia, có giá trị pháp lý tương đương văn bằng chính quy và đủ điều kiện học tiếp lên Thạc sĩ.
            </Alert>

            <Alert variant="warning" title="Hạn nộp hồ sơ đợt 1/2026">
              Hạn nhận hồ sơ xét tuyển đến hết ngày 30/10/2026. Số lượng chỉ tiêu có hạn, ưu tiên hồ sơ nộp sớm.
            </Alert>

            <Alert variant="success" title="Đăng ký tư vấn thành công!">
              Cảm ơn bạn. Chuyên viên tuyển sinh sẽ liên hệ qua điện thoại trong vòng 24 giờ làm việc.
            </Alert>

            <Alert variant="error" title="Không thể kết nối đến máy chủ">
              Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ Hotline miễn cước 1800 646 857 để được hỗ trợ tức thì.
            </Alert>
          </div>
        </section>

        {/* 7. CARDS & EMPTY STATE */}
        <section aria-labelledby="cards-heading" className="space-y-6">
          <SectionHeading
            id="cards-heading"
            title="7. Thẻ nội dung (Cards) & Trạng thái rỗng (Empty State)"
            subtitle="Hiển thị thông tin ngành học, tin tức và kịch bản người dùng không tìm thấy dữ liệu."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Academic Card */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="navy">Cử nhân E-Learning</Badge>
                  <StatusBadge variant="active" />
                </div>
                <CardTitle>Công nghệ thông tin</CardTitle>
                <CardDescription>Chuyên ngành Đồ hoạ kỹ thuật số</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-body-sm text-ink-600">
                  <p>• Thời gian: 3.5 – 4.0 năm (Người có bằng có thể rút ngắn)</p>
                  <p>• Tổng số tín chỉ: 132 tín chỉ</p>
                  <p>• Đơn vị cấp bằng: Trường Đại học Phú Xuân (PXU)</p>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-line-100 pt-4">
                <span className="font-semibold text-navy-900">600.000 đ / tín chỉ</span>
                <ButtonLink href="/nganh-dao-tao/cong-nghe-thong-tin/" variant="outline" size="sm">
                  Xem chi tiết
                </ButtonLink>
              </CardFooter>
            </Card>

            {/* Skeleton Loading Card */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-400">Loading State (Skeleton Shimmer)</span>
              <SkeletonCard />
            </div>
          </div>

          {/* Empty State */}
          <div className="pt-6">
            <EmptyState
              title="Không tìm thấy bài viết hoặc tài liệu phù hợp"
              description="Từ khóa tìm kiếm của bạn không khớp với tài liệu nào hiện có. Vui lòng kiểm tra lại chính tả hoặc quay lại danh mục ngành đào tạo."
              actionHref="/nganh-dao-tao/"
              actionLabel="Xem 5 ngành đào tạo"
              secondaryActionHref="/"
              secondaryActionLabel="Về trang chủ"
            />
          </div>
        </section>

        {/* 8. ACCORDION */}
        <section aria-labelledby="accordion-heading" className="space-y-6">
          <SectionHeading
            id="accordion-heading"
            title="8. Khối thu gọn (Accordion Disclosure)"
            subtitle="Tối ưu trải nghiệm đọc tài liệu dài, môn học và giải đáp thắc mắc."
          />

          <div className="rounded-xl border border-line-200 bg-canvas p-6 sm:p-8 max-w-3xl">
            <Accordion type="single" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Học đại học từ xa có được cấp bằng chính quy không?</AccordionTrigger>
                <AccordionContent>
                  Theo Thông tư 27/2019/TT-BGDĐT của Bộ Giáo dục và Đào tạo, văn bằng đại học hiện nay không còn ghi hình thức đào tạo (chính quy, vừa làm vừa học hay từ xa) trên văn bằng cử nhân. Người tốt nghiệp được cấp bằng Cử nhân Trường Đại học Phú Xuân có đầy đủ giá trị pháp lý để nâng ngạch, thi công chức và học cao học.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Thời gian hoàn thành khóa học là bao lâu?</AccordionTrigger>
                <AccordionContent>
                  Thời gian đào tạo tiêu chuẩn là 3.5 – 4 năm đối với học viên tốt nghiệp THPT. Với học viên đã có bằng Trung cấp, Cao đẳng hoặc Đại học khác, thời gian có thể rút ngắn xuống còn 1.5 – 2.5 năm nhờ cơ chế xét miễn giảm và công nhận tín chỉ tương đương.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* 9. DOCUMENT CARD */}
        <section aria-labelledby="document-heading" className="space-y-6">
          <SectionHeading
            id="document-heading"
            title="9. Thẻ tài liệu pháp lý & Quy chế (DocumentCard)"
            subtitle="Chuẩn hóa hiển thị văn bản công khai, quyết định mở ngành và đề án tuyển sinh."
          />

          <div className="space-y-3 max-w-3xl">
            <DocumentCard
              title="Thông tư 27/2019/TT-BGDĐT quy định về nội dung chính ghi trên văn bằng và phụ lục văn bằng"
              type="Quy định pháp lý"
              date="Ban hành: 30/12/2019"
              viewUrl="/chat-luong-dao-tao/"
            />
            <DocumentCard
              title="Quyết định ban hành Đề án tuyển sinh Đại học từ xa năm 2026 - Trường Đại học Phú Xuân"
              type="Đề án tuyển sinh"
              date="Ban hành: 15/01/2026"
              viewUrl="/tuyen-sinh/"
            />
          </div>
        </section>

        {/* 10. PAGINATION */}
        <section aria-labelledby="pagination-heading" className="space-y-6">
          <SectionHeading
            id="pagination-heading"
            title="10. Điều hướng phân trang (Pagination)"
            subtitle="Phân trang tối ưu khả năng tiếp cận và thân thiện với thao tác chạm di động."
          />

          <div className="rounded-xl border border-line-200 bg-canvas p-6 max-w-3xl flex justify-center">
            <Pagination
              currentPage={2}
              totalPages={5}
              baseUrl="/tin-tuc"
            />
          </div>
        </section>
      </Container>
    </main>
  );
}
