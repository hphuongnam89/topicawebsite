import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { contactInfo } from "@/data/campuses";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Thông tin về việc thu thập, sử dụng và bảo vệ dữ liệu cá nhân trên website Topica.",
};

const sections = [
  {
    title: "1. Phạm vi áp dụng",
    content: [
      "Chính sách này áp dụng với dữ liệu cá nhân được cung cấp hoặc phát sinh khi bạn sử dụng website, gửi biểu mẫu đăng ký tư vấn hay liên hệ với Viện Đào tạo Quốc tế Topica.",
    ],
  },
  {
    title: "2. Dữ liệu được thu thập",
    content: [
      "Tùy thao tác của bạn, dữ liệu có thể gồm họ tên, số điện thoại, email, chương trình quan tâm, nội dung cần tư vấn và thông tin kỹ thuật cơ bản do trình duyệt gửi khi truy cập website.",
      "Bạn chỉ nên cung cấp dữ liệu cần thiết cho yêu cầu tư vấn và không gửi thông tin nhạy cảm qua biểu mẫu công khai.",
    ],
  },
  {
    title: "3. Mục đích sử dụng",
    content: [
      "Dữ liệu được sử dụng để tiếp nhận yêu cầu, kiểm tra điều kiện tuyển sinh, cung cấp thông tin chương trình, hỗ trợ hồ sơ, vận hành website, phòng chống lạm dụng và thực hiện nghĩa vụ theo quy định pháp luật.",
    ],
  },
  {
    title: "4. Chia sẻ và lưu trữ dữ liệu",
    content: [
      "Dữ liệu chỉ được truy cập bởi bộ phận phụ trách và nhà cung cấp dịch vụ cần thiết cho việc vận hành, với phạm vi phù hợp với mục đích nêu trên. Chúng tôi không bán dữ liệu cá nhân của bạn.",
      "Dữ liệu được lưu trong thời gian cần thiết để xử lý yêu cầu, thực hiện nghĩa vụ liên quan hoặc cho đến khi có yêu cầu hợp lệ về việc chấm dứt xử lý, trừ trường hợp pháp luật yêu cầu lưu lâu hơn.",
    ],
  },
  {
    title: "5. Quyền của bạn",
    content: [
      "Bạn có thể yêu cầu được biết, cập nhật, chỉnh sửa, hạn chế hoặc rút lại sự đồng ý xử lý dữ liệu; yêu cầu xóa dữ liệu trong trường hợp phù hợp; và phản ánh nếu cho rằng dữ liệu được xử lý không đúng mục đích.",
      "Một số yêu cầu có thể cần xác minh danh tính trước khi xử lý để bảo vệ dữ liệu của chính bạn.",
    ],
  },
  {
    title: "6. Cookies và đo lường truy cập",
    content: [
      "Website có thể sử dụng cookies hoặc công cụ đo lường để duy trì chức năng, ghi nhận hiệu quả nội dung và cải thiện trải nghiệm. Bạn có thể kiểm soát cookies trong phần cài đặt của trình duyệt; việc tắt cookies có thể ảnh hưởng một số chức năng.",
    ],
  },
  {
    title: "7. An toàn dữ liệu",
    content: [
      "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để hạn chế truy cập, sử dụng hoặc tiết lộ trái phép. Không có phương thức truyền hoặc lưu trữ điện tử nào an toàn tuyệt đối, vì vậy bạn nên bảo vệ thiết bị và thông tin liên hệ của mình.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <Container size="narrow">
        <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
          Bảo vệ dữ liệu cá nhân
        </p>
        <h1 className="mt-4 font-display text-h1 font-semibold text-ink-950">Chính sách bảo mật</h1>
        <p className="mt-6 text-body-lg text-ink-600">
          Chúng tôi tôn trọng quyền riêng tư và chỉ xử lý thông tin cần thiết để tư vấn tuyển sinh,
          hỗ trợ người học và vận hành website.
        </p>

        <div className="mt-12 space-y-10 border-t border-line-200 pt-10">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={section.title.replaceAll(" ", "-")}>
              <h2
                id={section.title.replaceAll(" ", "-")}
                className="font-display text-h3 font-semibold text-ink-950"
              >
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.content.map((paragraph) => (
                  <p key={paragraph} className="text-ink-700 text-body leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section aria-labelledby="privacy-contact" className="rounded-xl bg-brand-50 p-6 md:p-8">
            <h2 id="privacy-contact" className="font-display text-h3 font-semibold text-ink-950">
              8. Liên hệ về dữ liệu cá nhân
            </h2>
            <p className="text-ink-700 mt-4 text-body leading-7">
              Gửi yêu cầu qua email{" "}
              <a
                className="font-semibold text-brand-800 underline"
                href={`mailto:${contactInfo.email}`}
              >
                {contactInfo.email}
              </a>{" "}
              hoặc gọi{" "}
              <a
                className="font-semibold text-brand-800 underline"
                href={`tel:${contactInfo.phone}`}
              >
                {contactInfo.phone}
              </a>
              . Vui lòng nêu rõ thông tin liên hệ và nội dung cần xử lý.
            </p>
          </section>
        </div>

        <p className="text-ink-500 mt-10 text-body-sm">Cập nhật lần cuối: 04/09/2026.</p>
      </Container>
    </section>
  );
}
