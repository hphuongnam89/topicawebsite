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

  // Define structured FAQ categories with verified academic and admission sources
  const faqCategories: FAQCategory[] = [
    {
      id: "tuyen-sinh",
      title: "Tuyển sinh & Nhập học",
      faqs: [
        {
          question: "Điều kiện xét tuyển chương trình cử nhân trực tuyến là gì?",
          answer: "Thí sinh đã tốt nghiệp Trung học Phổ thông (THPT) hoặc tương đương theo quy định của Bộ Giáo dục và Đào tạo. Nhà trường xét tuyển dựa trên hồ sơ và văn bằng tốt nghiệp, không phải thi tuyển đầu vào."
        },
        {
          question: "Hồ sơ xét tuyển trực tuyến cần chuẩn bị những gì?",
          answer: "Hồ sơ xét tuyển bao gồm: Bản sao bằng tốt nghiệp THPT (hoặc giấy chứng nhận tốt nghiệp tạm thời), học bạ THPT, căn cước công dân và phiếu đăng ký xét tuyển trực tuyến theo mẫu."
        },
        {
          question: "Lệ phí xét tuyển là bao nhiêu và nộp như thế nào?",
          answer: "Lệ phí xét tuyển là 80.000 VNĐ / hồ sơ theo thông báo tuyển sinh chính thức. Thí sinh có thể nộp lệ phí qua chuyển khoản ngân hàng theo hướng dẫn khi hoàn tất đăng ký trực tuyến."
        }
      ]
    },
    {
      id: "hoc-phi",
      title: "Học phí & Học bổng",
      faqs: [
        {
          question: "Học phí được tính và thu như thế nào?",
          answer: "Học phí áp dụng đơn giá cố định 600.000 VNĐ / tín chỉ cho toàn bộ 5 ngành đào tạo. Học phí được thu theo số tín chỉ thực tế sinh viên đăng ký trong từng kỳ học (lộ trình tiêu chuẩn 14 tín chỉ/học kỳ, tương đương 8.400.000 VNĐ/kỳ; tổng chương trình 126 tín chỉ)."
        },
        {
          question: "Chính sách học bổng dành cho tân sinh viên?",
          answer: "Chương trình áp dụng Học bổng Talent giảm 30% học phí toàn khóa học dành cho thí sinh đăng ký và hoàn tất thủ tục nhập học sớm (áp dụng đến 31/12/2026 theo quy định của nhà trường)."
        }
      ]
    },
    {
      id: "dao-tao",
      title: "Văn bằng & Phương thức đào tạo",
      faqs: [
        {
          question: "Đơn vị cấp bằng và giá trị pháp lý của văn bằng cử nhân?",
          answer: "Văn bằng Cử nhân do Trường Đại học Phú Xuân (thành viên Tập đoàn Giáo dục EQuest) cấp. Theo Thông tư số 27/2019/TT-BGDĐT, văn bằng đại học không ghi hình thức đào tạo (chính quy hay từ xa), có giá trị pháp lý tương đương bằng đại học chính quy, được Bộ GD&ĐT công nhận toàn quốc và đủ điều kiện học lên cao học hoặc thi tuyển công chức."
        },
        {
          question: "Phương thức học tập trực tuyến diễn ra như thế nào?",
          answer: "Người học học tập 100% trực tuyến trên hệ sinh thái học tập số (LMS), chủ động theo dõi bài giảng đa phương tiện, tham gia thảo luận và làm bài tập mọi lúc mọi nơi trên máy tính hoặc thiết bị di động, được giảng viên và trợ giảng hỗ trợ giải đáp xuyên suốt khóa học."
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
