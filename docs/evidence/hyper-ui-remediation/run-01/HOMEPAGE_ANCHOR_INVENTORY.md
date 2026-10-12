# Danh mục Anchor và Kế hoạch Tái cấu trúc Trang chủ (Homepage Anchor & IA Inventory)

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Finding: `HUI-04` / Task `HU-03` (R08/R11/R20)
- Người thực hiện: Antigravity Orchestrator

---

## 1. Kiểm kê Anchor & Fragment trên Toàn Trang chủ (Anchor Inventory)

| ID / Fragment | Thành phần sở hữu | Được trỏ từ đâu (Callers) | Trạng thái bảo vệ |
|---|---|---|---|
| `#main-content` | `app/(main)/layout.tsx:14` | Skip link tại `Header.tsx:90` | **Bắt buộc giữ nguyên** (Accessibility) |
| `#tu-van` | `app/(main)/page.tsx:61` | `AnalyticsTracker.tsx:32`, Hero CTA "Nhận tư vấn" | **Bắt buộc giữ nguyên** (Lead form anchor) |
| `#programs-title` | `components/sections/ProgramsSection.tsx:20` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |
| `#admission-timeline-title` | `components/sections/AdmissionTimeline.tsx:21` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |
| `#partners-title` | `components/sections/PartnersSection.tsx:28` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |
| `#why-topica-title` | `components/sections/WhyTopicaSection.tsx:20` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |
| `#campus-title` | `components/sections/CampusSection.tsx:26` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |
| `#testimonials-title` | `components/sections/TestimonialSection.tsx:22` | `aria-labelledby` của section | Giữ nguyên ID tiêu đề |

*Kết luận rà soát:* Không có liên kết nội trang hoặc từ menu nào trỏ thẳng vào các ID section tạm thời. Việc tái cấu trúc thứ tự hiển thị của các components trong `app/(main)/page.tsx` sẽ **không làm gãy bất kỳ đường link ngoài hay anchor nội bộ nào**.

---

## 2. Phân tích Nhịp Trang Hiện tại vs Nhịp Narrative Workflow (HUI-04)

### Trình tự hiện tại trong `app/(main)/page.tsx`:
1. `HeroSection`
2. `CurrentAdmissions` (Thông tin đợt tuyển sinh)
3. `AdmissionTimeline` ⚠️ *(Quy trình 5 bước dài 1481px trên mobile, đẩy người học phải scroll rất xa)*
4. `ProgramsSection` ⚠️ *(Danh mục ngành nằm ở y=2467px trên mobile)*
5. `TrustSection` (Chỉ số tin cậy)
6. `WhyTopicaSection` (Lý do chọn Topica - bento grid)
7. `section id="tu-van"` (Form tư vấn nằm ở y=9220px)
8. `TestimonialSection` (Cảm nhận học viên)
9. `NewsPreview` (Tin tức)
10. `PartnersSection` (Đối tác)
11. `CampusSection` (Cơ sở đào tạo)

### Trình tự đề xuất theo Narrative Workflow (Thực thi trong Đợt D):
1. **Hiểu chương trình:** `HeroSection` + `CurrentAdmissions`
2. **Khám phá & Chọn ngành (Ưu tiên số 1):** `ProgramsSection` *(đưa lên ngay sau Hero/Admissions)*
3. **Củng cố niềm tin & Bằng chứng học thuật:** `TrustSection` + `WhyTopicaSection`
4. **Hiểu cách thức đăng ký (Quy trình ngắn gọn):** `AdmissionTimeline` *(chuyển xuống dưới, đóng vai trò hướng dẫn sau khi đã chọn ngành)*
5. **Chuyển đổi:** `section id="tu-van"` (Form tư vấn với bối cảnh rõ ràng)
6. **Bằng chứng xã hội & Tin tức:** `TestimonialSection` + `NewsPreview` + `PartnersSection`
7. **Thông tin liên hệ & Cơ sở:** `CampusSection`
