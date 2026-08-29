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
    description: page?.seo?.description || page?.excerpt || "Giải đáp các thắc mắc thường gặp về tuyển sinh, học phí, học bổng tại Topica.",
    alternates: { canonical: page?.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/nhung-cau-hoi-thuong-gap` },
  };
}

export default async function FAQPage() {
  const page = await cms.getPageByPath("nhung-cau-hoi-thuong-gap").catch(() => null);
  if (!page) notFound();

  // Define structured FAQ categories (since the CMS just provides HTML for this page)
  const faqCategories: FAQCategory[] = [
    {
      id: "tuyen-sinh",
      title: "Tuyển sinh & Nhập học",
      faqs: [
        {
          question: "Topica xét tuyển bằng những phương thức nào?",
          answer: "Topica xét tuyển thông qua 3 phương thức chính:<br/>1. Xét tuyển thẳng<br/>2. Xét tuyển dựa trên kết quả thi THPT Quốc gia<br/>3. Xét tuyển học bạ THPT"
        },
        {
          question: "Hồ sơ xét tuyển trực tuyến cần chuẩn bị những gì?",
          answer: "Hồ sơ trực tuyến bao gồm: Ảnh chụp học bạ (nếu xét học bạ), ảnh chụp CMND/CCCD, và giấy chứng nhận tốt nghiệp tạm thời (có thể bổ sung sau)."
        },
        {
          question: "Thời gian nhận hồ sơ xét tuyển là khi nào?",
          answer: "Topica tổ chức nhiều đợt xét tuyển trong năm. Đợt 1 thường bắt đầu từ tháng 3 và kết thúc vào tháng 5. Bạn nên theo dõi thông báo trên website để cập nhật lịch chi tiết."
        }
      ]
    },
    {
      id: "hoc-phi",
      title: "Học phí & Học bổng",
      faqs: [
        {
          question: "Học phí tại Topica được đóng như thế nào?",
          answer: "Học phí được đóng theo từng kỳ học (2 kỳ/năm). Sinh viên có thể chọn đóng qua chuyển khoản ngân hàng hoặc qua cổng thanh toán trực tuyến của trường."
        },
        {
          question: "Topica có các chương trình học bổng nào cho tân sinh viên?",
          answer: "Topica có nhiều loại học bổng cho tân sinh viên, bao gồm Học bổng Tài năng, Học bổng Khuyến học, và Học bổng Hỗ trợ tài chính. Giá trị học bổng có thể lên tới 100% học phí toàn khóa."
        }
      ]
    },
    {
      id: "dao-tao",
      title: "Chương trình Đào tạo",
      faqs: [
        {
          question: "Bằng cấp của Topica có được công nhận quốc tế không?",
          answer: "Topica có các chương trình liên kết quốc tế, sinh viên tốt nghiệp có thể nhận bằng do đối tác nước ngoài cấp, được công nhận trên toàn cầu."
        },
        {
          question: "Sinh viên có được hỗ trợ thực tập và việc làm không?",
          answer: "Có. Topica có mạng lưới đối tác doanh nghiệp rộng lớn và trung tâm hỗ trợ việc làm luôn đồng hành cùng sinh viên từ năm 2 để tìm kiếm cơ hội thực tập và việc làm sau khi ra trường."
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <PageHeader
        title={page.title || "Câu hỏi thường gặp"}
        subtitle={page.excerpt || "Tổng hợp các giải đáp chi tiết về quy trình tuyển sinh, học phí, học bổng và chương trình đào tạo tại Topica."}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Tuyển sinh", href: "/tuyen-sinh/" },
          { label: "Câu hỏi thường gặp" }
        ]}
      />

      <Container className="mt-12">
        <FAQHub categories={faqCategories} />

        <div className="mt-20 max-w-2xl mx-auto">
          <ConsultationCTA
            heading="Vẫn còn thắc mắc?"
            description="Hãy để lại thông tin, đội ngũ tư vấn tuyển sinh của Topica sẽ liên hệ và giải đáp trực tiếp cho bạn."
          />
        </div>
      </Container>
    </main>
  );
}
