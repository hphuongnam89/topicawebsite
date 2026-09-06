import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { FAQHub, FAQCategory } from "@/components/faq/FAQHub";
import { ConsultationCTA } from "@/components/cta/ConsultationCTA";
import { Section } from "@/components/ui/Section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getPageByPath("nhung-cau-hoi-thuong-gap").catch(() => null);
  return {
    title: page?.seo?.title || page?.title || "Câu hỏi thường gặp",
    description:
      page?.seo?.description ||
      page?.excerpt ||
      "Giải đáp các thắc mắc thường gặp về tuyển sinh, học phí, học bổng tại Topica.",
    alternates: {
      canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/nhung-cau-hoi-thuong-gap`,
    },
  };
}

export default async function FAQPage() {
  const page = await cms.getPageByPath("nhung-cau-hoi-thuong-gap").catch(() => null);
  if (!page) notFound();

  // Structured answers are kept deliberately narrower than marketing copy and
  // follow the published 2026 admissions information.
  const faqCategories: FAQCategory[] = [
    {
      id: "tuyen-sinh",
      title: "Tuyển sinh & Nhập học",
      faqs: [
        {
          question: "Topica xét tuyển bằng những phương thức nào?",
          answer:
            "Thông báo tuyển sinh năm 2026 công bố 5 phương thức: xét tuyển thẳng; dựa trên kết quả thi tốt nghiệp THPT; dựa trên kết quả học tập THPT; dựa trên kết quả thi đánh giá năng lực, đánh giá tư duy; và xét tuyển theo đề án tuyển sinh của Trường Đại học Phú Xuân.",
        },
        {
          question: "Những đối tượng nào có thể đăng ký?",
          answer:
            "Người đã tốt nghiệp THPT hoặc trình độ tương đương; người đã có bằng Trung cấp, Cao đẳng hoặc Đại học có thể đăng ký theo điều kiện của thông báo tuyển sinh hiện hành. Một số hồ sơ Trung cấp cần bổ sung giấy chứng nhận hoàn thành khối lượng kiến thức văn hóa THPT.",
        },
        {
          question: "Thời gian nhận hồ sơ xét tuyển là khi nào?",
          answer:
            "Nhà trường tổ chức nhận hồ sơ theo từng thông báo và đợt tuyển sinh cho tới khi đủ chỉ tiêu. Thí sinh nên kiểm tra thông báo mới nhất hoặc liên hệ tư vấn để xác nhận hạn nộp hồ sơ và ngày nhập học đang áp dụng.",
        },
      ],
    },
    {
      id: "hoc-phi",
      title: "Học phí & Học bổng",
      faqs: [
        {
          question: "Học phí tại Topica được đóng như thế nào?",
          answer:
            "Thông tin tuyển sinh năm 2026 công bố học phí 600.000 đồng/tín chỉ, lệ phí xét tuyển 80.000 đồng/nguyện vọng và miễn lệ phí hồ sơ. Mức thực tế cần được xác nhận lại theo khóa và đợt nhập học.",
        },
        {
          question: "Học bổng Topica Talent áp dụng như thế nào?",
          answer:
            "Nguồn tuyển sinh năm 2026 công bố Topica Talent giảm 30% học phí toàn bộ chương trình, tương ứng mỗi học kỳ giảm 30% số tín chỉ tiêu chuẩn. Số suất, thời hạn và tình trạng còn áp dụng cần được xác nhận khi đăng ký.",
        },
      ],
    },
    {
      id: "dao-tao",
      title: "Chương trình Đào tạo",
      faqs: [
        {
          question: "Chương trình học theo hình thức nào?",
          answer:
            "Chương trình sử dụng phương thức E-learning qua LMS. Theo thông báo tuyển sinh năm 2026, lớp trực tuyến được tổ chức vào thứ Bảy, Chủ nhật hoặc các buổi tối trong tuần; lịch cụ thể được thông báo theo từng lớp.",
        },
        {
          question: "Đơn vị nào cấp bằng?",
          answer:
            "Văn bằng của chương trình do Trường Đại học Phú Xuân cấp. Các nội dung về sử dụng văn bằng cho từng mục đích cụ thể cần được đối chiếu với quy định hiện hành và cơ quan tiếp nhận hồ sơ.",
        },
        {
          question: "Thời gian đào tạo dự kiến bao lâu?",
          answer:
            "Thông báo năm 2026 nêu lộ trình tham khảo: người đã tốt nghiệp THPT học 2,5–3 năm; Trung cấp 2–2,5 năm; Cao đẳng 2 năm; và người đã có bằng Đại học thứ nhất học 1,5–2 năm. Thời gian thực tế phụ thuộc kết quả xét công nhận học phần và kế hoạch học tập.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <PageHeader
        title={page.title || "Câu hỏi thường gặp"}
        subtitle={
          page.excerpt ||
          "Tổng hợp các giải đáp chi tiết về quy trình tuyển sinh, học phí, học bổng và chương trình đào tạo tại Topica."
        }
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tuyển sinh", href: "/tuyen-sinh/" },
          { label: "Câu hỏi thường gặp" },
        ]}
      />

      <Container className="mt-12">
        <FAQHub categories={faqCategories} />

        <div className="mx-auto mt-20 max-w-2xl">
          <ConsultationCTA
            heading="Vẫn còn thắc mắc?"
            description="Hãy để lại thông tin, đội ngũ tư vấn tuyển sinh của Topica sẽ liên hệ và giải đáp trực tiếp cho bạn."
          />
        </div>
      </Container>
    </main>
  );
}
