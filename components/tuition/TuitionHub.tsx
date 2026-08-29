import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdmissionBanner } from "@/components/cta/AdmissionBanner";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { Check } from "lucide-react";

export function TuitionHub() {
  return (
    <div>
      <Section variant="paper">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading>Học phí áp dụng năm 2026</SectionHeading>
              <div className="prose-editorial text-ink-800">
                <p>
                  Topica cam kết cung cấp các chương trình đào tạo chất lượng cao với mức học phí hợp lý, minh bạch và ổn định trong toàn khóa học.
                </p>
                <p>
                  Học phí được tính theo số tín chỉ đăng ký trong mỗi học kỳ. Sinh viên đóng học phí theo từng học kỳ (2 học kỳ chính/năm).
                </p>
                
                <h4 className="text-ink-950 font-semibold mt-8 mb-4">Các khoản phí khi nhập học:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                    <span>Lệ phí nhập học: 1.000.000 VNĐ (đóng 1 lần duy nhất)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                    <span>Phí khám sức khỏe & Bảo hiểm Y tế: Theo quy định của Nhà nước</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-canvas rounded-xl p-6 lg:p-8 border border-line-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
              
              <h3 className="text-h3 font-display font-bold text-ink-950 mb-6 relative z-10">
                Bảng giá học phí dự kiến
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end border-b border-line-200 pb-4">
                  <div>
                    <div className="font-semibold text-ink-950">Chương trình Tiêu chuẩn</div>
                    <div className="text-body-sm text-ink-600">Áp dụng cho khối ngành Kinh tế, Ngôn ngữ</div>
                  </div>
                  <div className="text-right">
                    <div className="text-h4 font-bold text-brand-700">750.000đ</div>
                    <div className="text-body-sm text-ink-600">/ tín chỉ</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-b border-line-200 pb-4">
                  <div>
                    <div className="font-semibold text-ink-950">Chương trình Tiêu chuẩn</div>
                    <div className="text-body-sm text-ink-600">Áp dụng cho khối ngành CNTT, Kỹ thuật</div>
                  </div>
                  <div className="text-right">
                    <div className="text-h4 font-bold text-brand-700">850.000đ</div>
                    <div className="text-body-sm text-ink-600">/ tín chỉ</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end pb-2">
                  <div>
                    <div className="font-semibold text-ink-950">Chương trình Chất lượng cao</div>
                    <div className="text-body-sm text-ink-600">Tiếng Anh toàn phần</div>
                  </div>
                  <div className="text-right">
                    <div className="text-h4 font-bold text-brand-700">1.250.000đ</div>
                    <div className="text-body-sm text-ink-600">/ tín chỉ</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-line-200 text-body-sm text-ink-600 italic">
                * Học phí trên chưa bao gồm lộ trình học Tiếng Anh đầu vào đối với sinh viên chưa đạt chuẩn. Học phí không tăng quá 10% mỗi năm.
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="default">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionHeading align="center">Chính sách Học bổng</SectionHeading>
            <p className="text-body-lg text-ink-600">
              Với quỹ học bổng trị giá hơn 20 tỷ đồng, Topica tự hào đồng hành cùng các tài năng trẻ, tạo điều kiện học tập tốt nhất cho sinh viên vượt khó.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-paper p-6 lg:p-8 rounded-xl border border-line-200 flex flex-col h-full">
              <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-700 font-bold text-lg">100%</span>
              </div>
              <h3 className="text-h4 font-bold text-ink-950 mb-3">Học bổng Tài năng</h3>
              <p className="text-ink-600 mb-6 flex-1">
                Miễn 100% học phí toàn khóa học dành cho học sinh đạt giải Nhất, Nhì, Ba trong các kỳ thi Học sinh giỏi cấp Quốc gia, Quốc tế.
              </p>
            </div>
            
            <div className="bg-paper p-6 lg:p-8 rounded-xl border border-line-200 flex flex-col h-full relative overflow-hidden border-brand-500/30">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Phổ biến
              </div>
              <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-700 font-bold text-lg">50%</span>
              </div>
              <h3 className="text-h4 font-bold text-ink-950 mb-3">Học bổng Khuyến học</h3>
              <p className="text-ink-600 mb-6 flex-1">
                Giảm 50% học phí năm đầu tiên cho tân sinh viên có điểm thi THPT từ 26 điểm trở lên hoặc IELTS từ 6.5 trở lên.
              </p>
            </div>

            <div className="bg-paper p-6 lg:p-8 rounded-xl border border-line-200 flex flex-col h-full">
              <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-700 font-bold text-lg">30%</span>
              </div>
              <h3 className="text-h4 font-bold text-ink-950 mb-3">Học bổng Hỗ trợ tài chính</h3>
              <p className="text-ink-600 mb-6 flex-1">
                Giảm 30% học phí toàn khóa cho sinh viên có hoàn cảnh khó khăn, vượt khó trong học tập (cần có giấy xác nhận của địa phương).
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="paper">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading align="center">Tài liệu tham khảo</SectionHeading>
            <div className="mt-8 space-y-4">
              <DocumentCard 
                title="Quy định Học phí và Thu phí sinh viên 2026"
                type="Quy định"
                date="Ban hành: 15/01/2026"
                fileSize="1.2 MB"
                downloadUrl="#"
              />
              <DocumentCard 
                title="Hướng dẫn thanh toán học phí trực tuyến"
                type="Hướng dẫn"
                date="Ban hành: 10/02/2026"
                fileSize="850 KB"
                viewUrl="#"
                downloadUrl="#"
              />
              <DocumentCard 
                title="Biểu mẫu xin cấp Học bổng Hỗ trợ tài chính"
                type="Biểu mẫu"
                date="Ban hành: 15/01/2026"
                fileSize="420 KB"
                downloadUrl="#"
              />
            </div>
          </div>
        </Container>
      </Section>

      <AdmissionBanner 
        heading="Sẵn sàng trở thành sinh viên Topica?"
        description="Đăng ký xét tuyển ngay hôm nay để nhận cơ hội học bổng giá trị."
        primaryHref="https://www.tuyensinh.topicauni.edu.vn/"
        primaryLabel="Đăng ký xét tuyển"
        secondaryHref="/lien-he/"
        secondaryLabel="Nhận tư vấn học phí"
      />
    </div>
  );
}
