# Báo cáo Audit HUI-02 — Trạng thái Kỳ Tuyển sinh & Badge Consumers

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Finding: `HUI-02` (P1 - Tính nhất quán dữ liệu công khai)
- Người thực hiện: Antigravity Orchestrator

---

## 1. Vấn đề quan sát được (Problem Statement)

Tại baseline review 12/10/2026:
- Khi fixture hoặc database không có kỳ tuyển sinh hiệu lực (`rounds.length === 0`), khối `CurrentAdmissions.tsx` hiển thị thông điệp trung tính: *"Bạn đang tìm kỳ tuyển sinh phù hợp? Nhận tư vấn về lịch và hồ sơ"*.
- Tuy nhiên, tại `components/sections/ProgramsSection.tsx` (Trang chủ) và `app/(main)/nganh-dao-tao/page.tsx` (Danh mục ngành T02), mỗi thẻ ngành lại tự động render:
  ```tsx
  <StatusBadge variant="active" showIcon={false} />
  ```
  hiển thị badge màu xanh lá **"Đang tuyển sinh"** một cách cố định (hardcoded).
- **Hệ quả:** Người học nhìn thấy thông điệp mâu thuẫn trên cùng một trang hoặc giữa các trang: một nơi báo chưa có đợt/cần tư vấn lịch, một nơi khẳng định tất cả 5 ngành "Đang tuyển sinh".

---

## 2. Kiểm kê các điểm tiêu thụ (Consumers Inventory)

| File | Dòng code | Hiện trạng logic | Rủi ro |
|---|---|---|---|
| `components/admission/CurrentAdmissions.tsx` | 7–38 | Đọc từ `getPublicAdmissionRounds()`, lọc `status === "open"` | Tốt, có fallback trung tính khi rỗng |
| `components/sections/ProgramsSection.tsx` | 59 | Hardcoded `<StatusBadge variant="active" />` | Mâu thuẫn khi không có kỳ mở |
| `app/(main)/nganh-dao-tao/page.tsx` | 111 | Hardcoded `<StatusBadge variant="active" />` | Mâu thuẫn khi không có kỳ mở |
| `data/programs.ts` | 15–33 | Interface `Program` chưa có trường `admissionStatus` hay `isOpen` | Không phản ánh trạng thái thực |
| `components/program/ProgramHero.tsx` | 71–91 | Nút "Đăng ký xét tuyển" luôn hiển thị | Cần kiểm tra đợt mở |

---

## 3. Đề xuất hợp đồng dữ liệu chuẩn hóa (Data Contract Proposal)

1. **Nguyên tắc duy nhất một nguồn sự thật (Single Source of Truth):**
   - Trạng thái tuyển sinh của chương trình phải bắt nguồn từ dữ liệu đợt tuyển sinh thực tế (`AdmissionRound` trong CMS/DB), có ngày bắt đầu, ngày kết thúc và ngành áp dụng.
2. **Quy tắc hiển thị Badge:**
   - **Khi có đợt tuyển sinh đang mở và còn hạn:** Hiển thị `<StatusBadge variant="active" />` ("Đang tuyển sinh").
   - **Khi đợt tuyển sinh sắp mở trong 30 ngày:** Hiển thị `<StatusBadge variant="upcoming" />` ("Sắp mở").
   - **Khi không có đợt tuyển sinh hoặc dữ liệu chưa xác minh:** 
     - **Không hiển thị badge tuyển sinh** hoặc
     - Hiển thị badge phân loại học thuật trung tính (ví dụ: `Học trực tuyến`, `Cử nhân`).
3. **Kế hoạch triển khai (Đợt B/C):**
   - Viết helper chung `getProgramAdmissionStatus(programSlug: string): StatusBadgeVariant | null`.
   - Kết nối `ProgramsSection` và `nganh-dao-tao` qua helper này. Khi DB fixture rỗng $\rightarrow$ ẩn badge hoặc hiện trung tính, đồng bộ hoàn toàn với `CurrentAdmissions`.
