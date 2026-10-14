"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
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
    <div className="min-h-screen bg-canvas pb-24 font-sans text-ink-800">
      {/* Hero Header */}
      <div className="border-b border-line-200 bg-surface-subtle py-12 lg:py-16">
        <Container>
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="navy">
                <LocalizedText>Topica Design System v3.0</LocalizedText>
              </Badge>
              <StatusBadge variant="verified">
                <LocalizedText>Chuẩn học thuật PXU</LocalizedText>
              </StatusBadge>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl lg:text-5xl">
              <LocalizedText>Quy chuẩn Thiết kế & Hệ thống Thành phần</LocalizedText>
            </h1>
            <p className="mt-4 text-body-lg leading-relaxed text-ink-600">
              <LocalizedText>
                Ngôn ngữ thiết kế học thuật, hiện đại, gần gũi và minh bạch. Đồng bộ nhận diện
                thương hiệu giữa Viện Đào tạo Quốc tế Topica và Trường Đại học Phú Xuân (PXU).
              </LocalizedText>
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
              <div className="flex h-20 w-full items-end rounded-md bg-navy-900 p-3 font-mono text-xs text-white">
                <LocalizedText>#00264D</LocalizedText>
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">
                <LocalizedText>Navy chính (Primary)</LocalizedText>
              </h4>
              <p className="text-body-sm text-ink-600">
                <LocalizedText>
                  Header/Footer, Tiêu đề chính, Nút chính trên nền sáng.
                </LocalizedText>
              </p>
            </div>

            {/* Secondary Blue Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="flex h-20 w-full items-end rounded-md bg-navy-secondary p-3 font-mono text-xs text-white">
                <LocalizedText>#16466B</LocalizedText>
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">
                <LocalizedText>Xanh bổ trợ (Secondary)</LocalizedText>
              </h4>
              <p className="text-body-sm text-ink-600">
                <LocalizedText>Mảng phụ, icon khối chuyên đề, chuyển sắc tinh tế.</LocalizedText>
              </p>
            </div>

            {/* Gold Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="flex h-20 w-full items-end rounded-md bg-gold-500 p-3 font-mono text-xs font-semibold text-navy-950">
                <LocalizedText>#B78744</LocalizedText>
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">
                <LocalizedText>Vàng Gold (Accent)</LocalizedText>
              </h4>
              <p className="text-body-sm text-ink-600">
                <LocalizedText>
                  Điểm nhấn nhận diện logo, CTA Đăng ký xét tuyển nổi bật.
                </LocalizedText>
              </p>
            </div>

            {/* Surface Paper Card */}
            <div className="rounded-lg border border-line-200 bg-canvas p-4 shadow-xs">
              <div className="flex h-20 w-full items-end rounded-md border border-line-200 bg-surface-subtle p-3 font-mono text-xs text-ink-800">
                <LocalizedText>#F3F6FA / #FFFFFF</LocalizedText>
              </div>
              <h4 className="mt-3 font-semibold text-ink-950">
                <LocalizedText>Nền phân đoạn (Surfaces)</LocalizedText>
              </h4>
              <p className="text-body-sm text-ink-600">
                <LocalizedText>
                  Canvas trắng và xám xanh nhạt tạo độ tương phản êm dịu.
                </LocalizedText>
              </p>
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

          <div className="space-y-6 rounded-xl border border-line-200 bg-surface-subtle p-6 sm:p-8">
            <div className="space-y-2 border-b border-line-200 pb-6">
              <span className="font-mono text-xs tracking-wider text-ink-400 uppercase">
                <LocalizedText>Display / H1 Serif — Font Lora</LocalizedText>
              </span>
              <h2 className="font-serif text-3xl font-bold text-ink-950 sm:text-4xl">
                <LocalizedText>Cử nhân Trực tuyến Trường Đại học Phú Xuân</LocalizedText>
              </h2>
              <p className="font-mono text-body-sm text-ink-600">
                <LocalizedText>Lora · Bold · Vùng đọc 60-75 ký tự/dòng</LocalizedText>
              </p>
            </div>

            <div className="space-y-2 border-b border-line-200 pb-6">
              <span className="font-mono text-xs tracking-wider text-ink-400 uppercase">
                <LocalizedText>Heading 2 / H2 Serif</LocalizedText>
              </span>
              <h3 className="font-serif text-2xl font-bold text-ink-950">
                <LocalizedText>
                  5 Ngành đào tạo đón đầu kỷ nguyên số & kinh tế tri thức
                </LocalizedText>
              </h3>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs tracking-wider text-ink-400 uppercase">
                <LocalizedText>Body Text — Be Vietnam Pro</LocalizedText>
              </span>
              <p className="max-w-3xl text-body leading-relaxed text-ink-body">
                <LocalizedText>
                  Chương trình đào tạo đại học từ xa theo phương thức E-Learning kết hợp công nghệ
                  hiện đại, lịch học linh hoạt dành cho người đi làm. Văn bằng cử nhân do Trường Đại
                  học Phú Xuân cấp, không ghi hình thức đào tạo theo Thông tư 27/2019/TT-BGDĐT.
                </LocalizedText>
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

          <div className="space-y-6 rounded-xl border border-line-200 bg-canvas p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">
                <LocalizedText>Nút Primary Navy</LocalizedText>
              </Button>
              <Button variant="accent">
                <LocalizedText>Nút Accent Gold</LocalizedText>
              </Button>
              <Button variant="secondary">
                <LocalizedText>Nút Secondary Viền</LocalizedText>
              </Button>
              <Button variant="outline">
                <LocalizedText>Nút Outline</LocalizedText>
              </Button>
              <Button variant="tertiary">
                <LocalizedText>Nút Tertiary Link</LocalizedText>
              </Button>
              <Button variant="ghost">
                <LocalizedText>Nút Ghost</LocalizedText>
              </Button>
              <Button variant="destructive">
                <LocalizedText>Nút Destructive</LocalizedText>
              </Button>
            </div>

            <div className="border-t border-line-200 pt-6">
              <h4 className="mb-3 text-body font-semibold text-ink-950">
                <LocalizedText>Các trạng thái tương tác (States):</LocalizedText>
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" loading>
                  <LocalizedText>Đang tải dữ liệu</LocalizedText>
                </Button>
                <Button variant="accent" disabled>
                  <LocalizedText>Vô hiệu hóa (Disabled)</LocalizedText>
                </Button>
                <Button variant="primary" size="sm">
                  <LocalizedText>Kích cỡ Nhỏ (SM)</LocalizedText>
                </Button>
                <Button variant="primary" size="default">
                  <LocalizedText>Kích cỡ Tiêu chuẩn</LocalizedText>
                </Button>
                <Button variant="primary" size="lg">
                  <LocalizedText>Kích cỡ Lớn (LG)</LocalizedText>
                </Button>
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

          <div className="space-y-6 rounded-xl border border-line-200 bg-canvas p-6 sm:p-8">
            <div className="space-y-3">
              <h4 className="text-body font-semibold text-ink-950">
                <LocalizedText>Status Badges (Trạng thái kỳ tuyển sinh & kiểm định):</LocalizedText>
              </h4>
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

            <div className="space-y-3 border-t border-line-200 pt-6">
              <h4 className="text-body font-semibold text-ink-950">
                <LocalizedText>Context Badges:</LocalizedText>
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">
                  <LocalizedText>132 Tín chỉ</LocalizedText>
                </Badge>
                <Badge variant="navy">
                  <LocalizedText>Trường Đại học Phú Xuân</LocalizedText>
                </Badge>
                <Badge variant="brand">
                  <LocalizedText>Topica Uni</LocalizedText>
                </Badge>
                <Badge variant="success">
                  <LocalizedText>Học bổng 30%</LocalizedText>
                </Badge>
                <Badge variant="warning">
                  <LocalizedText>Hạn nộp 30/10</LocalizedText>
                </Badge>
                <Badge variant="outline">
                  <LocalizedText>Bằng Cử nhân PXU</LocalizedText>
                </Badge>
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

          <div className="max-w-2xl rounded-xl border border-line-200 bg-canvas p-6 sm:p-8">
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
                  <LocalizedText>Gửi yêu cầu thử nghiệm</LocalizedText>
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

          <div className="max-w-3xl space-y-4">
            <Alert variant="info" title="Thông tin pháp lý văn bằng">
              <LocalizedText>
                Văn bằng do Trường Đại học Phú Xuân cấp, thuộc hệ thống văn bằng quốc gia, có giá
                trị pháp lý tương đương văn bằng chính quy và đủ điều kiện học tiếp lên Thạc sĩ.
              </LocalizedText>
            </Alert>

            <Alert variant="warning" title="Hạn nộp hồ sơ đợt 1/2026">
              <LocalizedText>
                Hạn nhận hồ sơ xét tuyển đến hết ngày 30/10/2026. Số lượng chỉ tiêu có hạn, ưu tiên
                hồ sơ nộp sớm.
              </LocalizedText>
            </Alert>

            <Alert variant="success" title="Đăng ký tư vấn thành công!">
              <LocalizedText>
                Cảm ơn bạn. Chuyên viên tuyển sinh sẽ liên hệ qua điện thoại trong vòng 24 giờ làm
                việc.
              </LocalizedText>
            </Alert>

            <Alert variant="error" title="Không thể kết nối đến máy chủ">
              <LocalizedText>
                Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ Hotline miễn cước 1800 646 857 để
                được hỗ trợ tức thì.
              </LocalizedText>
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
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="navy">
                    <LocalizedText>Cử nhân E-Learning</LocalizedText>
                  </Badge>
                  <StatusBadge variant="active" />
                </div>
                <CardTitle>
                  <LocalizedText>Công nghệ thông tin</LocalizedText>
                </CardTitle>
                <CardDescription>
                  <LocalizedText>Chuyên ngành Đồ hoạ kỹ thuật số</LocalizedText>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-body-sm text-ink-600">
                  <p>
                    <LocalizedText>
                      • Thời gian: 3.5 – 4.0 năm (Người có bằng có thể rút ngắn)
                    </LocalizedText>
                  </p>
                  <p>
                    <LocalizedText>• Tổng số tín chỉ: 132 tín chỉ</LocalizedText>
                  </p>
                  <p>
                    <LocalizedText>• Đơn vị cấp bằng: Trường Đại học Phú Xuân (PXU)</LocalizedText>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-line-100 pt-4">
                <span className="font-semibold text-navy-900">
                  <LocalizedText>600.000 đ / tín chỉ</LocalizedText>
                </span>
                <ButtonLink href="/nganh-dao-tao/cong-nghe-thong-tin/" variant="outline" size="sm">
                  <LocalizedText>Xem chi tiết</LocalizedText>
                </ButtonLink>
              </CardFooter>
            </Card>

            {/* Skeleton Loading Card */}
            <div className="space-y-2">
              <span className="font-mono text-xs tracking-wider text-ink-400 uppercase">
                <LocalizedText>Loading State (Skeleton Shimmer)</LocalizedText>
              </span>
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

          <div className="max-w-3xl rounded-xl border border-line-200 bg-canvas p-6 sm:p-8">
            <Accordion type="single" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <LocalizedText>Học đại học từ xa có được cấp bằng chính quy không?</LocalizedText>
                </AccordionTrigger>
                <AccordionContent>
                  <LocalizedText>
                    Theo Thông tư 27/2019/TT-BGDĐT của Bộ Giáo dục và Đào tạo, văn bằng đại học hiện
                    nay không còn ghi hình thức đào tạo (chính quy, vừa làm vừa học hay từ xa) trên
                    văn bằng cử nhân. Người tốt nghiệp được cấp bằng Cử nhân Trường Đại học Phú Xuân
                    có đầy đủ giá trị pháp lý để nâng ngạch, thi công chức và học cao học.
                  </LocalizedText>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <LocalizedText>Thời gian hoàn thành khóa học là bao lâu?</LocalizedText>
                </AccordionTrigger>
                <AccordionContent>
                  <LocalizedText>
                    Thời gian đào tạo tiêu chuẩn là 3.5 – 4 năm đối với học viên tốt nghiệp THPT.
                    Với học viên đã có bằng Trung cấp, Cao đẳng hoặc Đại học khác, thời gian có thể
                    rút ngắn xuống còn 1.5 – 2.5 năm nhờ cơ chế xét miễn giảm và công nhận tín chỉ
                    tương đương.
                  </LocalizedText>
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

          <div className="max-w-3xl space-y-3">
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

          <div className="flex max-w-3xl justify-center rounded-xl border border-line-200 bg-canvas p-6">
            <Pagination currentPage={2} totalPages={5} baseUrl="/tin-tuc" />
          </div>
        </section>
      </Container>
    </div>
  );
}
