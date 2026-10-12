# Đợt B — Bộ Phiếu Yêu cầu Xác nhận Đầu vào Nghiệp vụ (Stakeholder Dispatch Packets)

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Phạm vi: Khởi tạo và gom nhóm toàn bộ các yêu cầu xác minh nghiệp vụ theo Đợt B của [HYPER_UI_REMEDIATION_PLAN.md](../../agent-execution/HYPER_UI_REMEDIATION_PLAN.md).
- Trạng thái: **Dispatched / Pending Stakeholder Input**.
- Cơ chế an toàn: **"Im lặng không phải là đồng ý"**. Nếu quá ngày chốt, các tính năng áp dụng Fallback trung tính/ẩn để không chặn tiến độ kỹ thuật của Đợt C.

---

## 1. Gói Tuyển sinh (Admissions Packet) — Mã: `PKT-ADM`

**Đầu mối phụ trách:** Ban Tuyển sinh Topica / ĐH Phú Xuân  
**Ngày phát phiếu (`requested_at`):** 12/10/2026  
**Ngày đề xuất phản hồi (`requested_due_at`):** 16/10/2026 (Do coordinator thống nhất)

| Mã yêu cầu | Vấn đề / Câu hỏi | Tác động UI (Finding) | Fallback khi chưa có phản hồi |
|---|---|---|---|
| **REQ-ADM-01** | Có cổng/chức năng "Tra cứu trạng thái hồ sơ" trực tuyến không? Nếu có, cung cấp URL chính thức và format mã hồ sơ. | **HUI-01 / HU-01**: Quyết định nhãn CTA và link tra cứu | Giữ nhãn `"Xem chương trình"` trỏ `#chuong-trinh`; không dựng chức năng tra cứu giả lập. |
| **REQ-ADM-02** | Kỳ tuyển sinh nào đang hiệu lực trong Q4/2026 - Q1/2027 cho 5 ngành? Cung cấp: Tên kỳ, Ngày mở, Hạn hồ sơ, Số thông báo tuyển sinh. | **HUI-02 / HU-01**: Hiển thị badge "Đang tuyển sinh" và thông tin đợt tại `CurrentAdmissions` | Hiển thị thông điệp trung tính *"Bạn đang tìm kỳ tuyển sinh phù hợp? Nhận tư vấn về lịch và hồ sơ"*; ẩn badge "Đang tuyển sinh" trên thẻ ngành. |
| **REQ-ADM-03** | Quy trình tuyển sinh 5 bước có yêu cầu bắt buộc nộp lệ phí trước khi xét duyệt không? | **HUI-04 / HU-03**: Nội dung timeline 5 bước trên trang chủ | Giữ 5 bước cơ bản nhưng chuyển xuống dưới danh mục ngành theo Narrative Workflow. |

---

## 2. Gói Đào tạo (Academic Affairs Packet) — Mã: `PKT-ACA`

**Đầu mối phụ trách:** Phòng Đào tạo ĐH Phú Xuân / Viện Đào tạo Quốc tế Topica  
**Ngày phát phiếu (`requested_at`):** 12/10/2026  
**Ngày đề xuất phản hồi (`requested_due_at`):** 16/10/2026

| Mã yêu cầu | Vấn đề / Câu hỏi | Tác động UI (Finding) | Fallback khi chưa có phản hồi |
|---|---|---|---|
| **REQ-ACA-01** | Mâu thuẫn C01: `programs.ts` ghi đối tượng THPT là 3.5 năm / 9 kỳ, nhưng trang T03 ghi "3 năm / 9 kỳ". Thời lượng chuẩn theo quyết định mở ngành là bao nhiêu? | **C01 / HU-05**: Tính chuẩn xác thông tin học thuật trang ngành | Giữ text "3 năm · 9 học kỳ" kèm chú thích "Kế hoạch 9 học kỳ tiêu chuẩn cho người học chủ động". |
| **REQ-ACA-02** | Xác nhận mã ngành và tên chuyên ngành chính thức: CNTT (`7480201`), QTKD (`7340101`), Du lịch (`7810103`), Ngôn ngữ Anh (`7220201`), Ngôn ngữ Trung (`7220204`). | **C03 / HU-05**: Bảng thông tin nhanh `ProgramQuickFacts` | Dùng tên ngành và mã ngành hiện có, ghi nguồn trích dẫn là Khung chương trình ĐH Phú Xuân. |
| **REQ-ACA-03** | Chỉ định nhân sự phê duyệt public copy học thuật trên website. | **HUI-05 / HU-05**: Duyệt toàn bộ curriculum và chuẩn đầu ra | Đã gỡ bỏ toàn bộ filename JPG nội bộ và note draft "Sẽ cập nhật..."; dùng nhãn trung tính "Thông tin chương trình". |

---

## 3. Gói Tài chính (Finance & Tuition Packet) — Mã: `PKT-FIN`

**Đầu mối phụ trách:** Ban Tài chính & Học phí  
**Ngày phát phiếu (`requested_at`):** 12/10/2026  
**Ngày đề xuất phản hồi (`requested_due_at`):** 16/10/2026

| Mã yêu cầu | Vấn đề / Câu hỏi | Tác động UI (Finding) | Fallback khi chưa có phản hồi |
|---|---|---|---|
| **REQ-FIN-01** | Xác nhận Quyết định ban hành biểu phí: Đơn giá 600.000đ/tín chỉ, tổng 75.600.000đ/khóa (126 tín chỉ), lệ phí xét tuyển 1.000.000đ. Cung cấp số QĐ và ngày ký. | **C04 / HU-01 / HU-02**: Bảng biểu phí và tính minh bạch tài chính | Giữ mức giá hiện hành nhưng bổ sung ghi chú "Mức học phí tham khảo theo khung chương trình 2026; liên hệ để nhận biểu phí chi tiết theo diện miễn giảm". |
| **REQ-FIN-02** | Mâu thuẫn C02: Chính sách học bổng các mức 100%, 50%, 30%. Có quyết định áp dụng cho đợt tuyển sinh hiện hành không? Điều kiện cụ thể là gì? | **C02 / HU-05**: Trang Học phí - Học bổng T05 | Hiển thị bảng mô tả điều kiện tổng quát, không cam kết cấp tự động nếu chưa có quyết định số. |

---

## 4. Gói Marketing & Đối ngoại (Marketing & Partnerships Packet) — Mã: `PKT-MKT`

**Đầu mối phụ trách:** Ban Marketing & Quan hệ Doanh nghiệp  
**Ngày phát phiếu (`requested_at`):** 12/10/2026  
**Ngày đề xuất phản hồi (`requested_due_at`):** 16/10/2026

| Mã yêu cầu | Vấn đề / Câu hỏi | Tác động UI (Finding) | Fallback khi chưa có phản hồi |
|---|---|---|---|
| **REQ-MKT-01** | Tên doanh nghiệp và thỏa thuận sử dụng logo của 4 file: `6.png`, `7.png`, `8.png`, `9.png` là gì? Có hợp đồng/văn bản đồng ý xuất bản không? | **HUI-07 / HU-06**: Logo đối tác trên marquee trang chủ | **Đã thực thi:** Tạm ẩn 4 logo này khỏi `PartnersSection.tsx`, chỉ chạy 5 đối tác đã có tên và văn bản (Deakin, OBC, Thaco Agri, Deha Digital, Deha Software). |
| **REQ-MKT-02** | Xác nhận quyền sử dụng ảnh Hero (`gen-h-z79...jpg`) và ảnh học viên tại Testimonials. Có biên bản consent không? | **HUI-07 / HU-06**: Quyền hình ảnh cá nhân và minh họa | Dùng ảnh như minh họa không gian chung, không gán danh xưng giảng viên/sinh viên cụ thể khi chưa có consent. |
| **REQ-MKT-03** | Thống nhất hướng thiết kế (Visual Direction R08): Xác nhận phong cách nền sáng, Navy `#00264D`/`#16466B` chủ đạo, Gold `#B78744` điểm xuyết, Lora cho tiêu đề học thuật, Be Vietnam Pro cho UI. | **HUI-03 / HU-02**: Đồng bộ toàn bộ design tokens và typography | Tiến hành chuẩn hóa theo `DESIGN_UX_SPEC.md` trong Đợt C. |

---

## 5. Gói Vận hành & Hệ thống (Operations Packet) — Mã: `PKT-OPS`

**Đầu mối phụ trách:** Ban Vận hành Hệ thống  
**Ngày phát phiếu (`requested_at`):** 12/10/2026  
**Ngày đề xuất phản hồi (`requested_due_at`):** 16/10/2026

| Mã yêu cầu | Vấn đề / Câu hỏi | Tác động UI (Finding) | Fallback khi chưa có phản hồi |
|---|---|---|---|
| **REQ-OPS-01** | Xác nhận các số hotline, email tuyển sinh và địa chỉ các cơ sở đào tạo (Huế, Hà Nội, TP.HCM) đang hoạt động chính thức. | **C05 / HU-04**: Header utility, Footer, Floating Actions | Sử dụng các kênh liên hệ đã cấu hình trong `campuses.ts`. |
| **REQ-OPS-02** | Xác nhận URL đích của "Cổng Elearning" (`/he-thong/` hoặc URL ngoài) và "Thư viện số" (`https://elib.pxu.edu.vn/`). | **HUI-05 / HU-04**: Header utility links | Giữ link hiện hành, bảo đảm `target="_blank"` và `rel="noopener noreferrer"` cho liên kết ngoài. |

---

## 6. Quy tắc Phối hợp và Kế hoạch Tiếp nối

1. **Phiếu câu hỏi được lưu giữ tập trung:** Tài liệu này là cơ sở duy nhất để đối chiếu khi nhận được phản hồi từ các bên liên quan.
2. **Không chặn kỹ thuật:** Toàn bộ công việc kỹ thuật của **Đợt C (Design Tokens, Typography, Tablet Header, Floating Actions)** và chuẩn bị **Đợt D (Homepage Layout Reordering)** được tiếp tục tiến hành độc lập nhờ cơ chế Fallback đã thiết lập.
