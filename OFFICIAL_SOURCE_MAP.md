# Official Source Map

**Phạm vi:** audit read-only cho homepage và 3 trang ngành hiện tại: Quản trị kinh doanh – Marketing số, Công nghệ thông tin – Đồ họa kỹ thuật số, Quản trị Dịch vụ Du lịch & Lữ hành.

**Ngày kiểm tra:** 03/09/2026 (Asia/Ho_Chi_Minh)

**Quy ước trạng thái:**

- `public-ready`: nguồn chính thức đang xác nhận và có thể dùng với đúng phạm vi.
- `public-with-caveat`: có nguồn nhưng phải giữ điều kiện/phạm vi/thời điểm.
- `needs-review`: cần chủ sở hữu nội dung hoặc văn bản hiện hành duyệt trước khi public.
- `remove-from-public`: chưa có nguồn đủ mạnh hoặc đang mâu thuẫn; không dùng claim như sự thật.

## 1. Bản đồ repository

| Khu vực | File/route | Vai trò audit |
|---|---|---|
| Homepage | `data/homepage-content.ts`, `components/sections/HeroSection.tsx`, `components/sections/TrustSection.tsx`, `components/sections/ProgramsSection.tsx` | Claim hero, trust, 5 ngành, FAQ, CTA |
| Trang ngành | `data/programs.ts`, `data/program-details.ts`, `data/supplemental-program-details.ts`, `data/program-page-content.ts` | Registry và dữ liệu marketing/học thuật hiện tại |
| Renderer | `app/(main)/[...slug]/page.tsx`, `components/cms/ProgramPageView.tsx`, `components/program/*` | Route dùng dữ liệu ngành để render trang |
| Tuyển sinh | `components/admission/AdmissionHub.tsx`, `data/admissions.ts` | FAQ, thời gian, phương thức, hồ sơ |
| Học phí | `components/tuition/TuitionHub.tsx` | Giá, kỳ đóng, học bổng, khoản phí |
| CMS/lead | `lib/cms/*`, `app/api/public/lead/route.ts`, `lib/services/leads.ts`, `lib/analytics.ts` | Nguồn nội dung/lead/analytics liên quan funnel |
| Claim phụ | `public/llms.txt`, `data/testimonials.ts`, `lib/db/index.ts` | Claim AI-facing, testimonial, seed/CMS fallback |

Trang ngành dùng renderer dùng chung; audit không sửa renderer hoặc dữ liệu production.

### Kiểm tra render local

| Route local | Kết quả quan sát |
|---|---|
| `/` | Render homepage với 5 card ngành, CTA lead, FAQ và trạng thái “cần xác minh” ở các thông tin chưa có source-of-truth |
| `/quan-tri-kinh-doanh-marketing` | Render 126 tín chỉ, 9 học kỳ, 59 học phần, mã 7340101, PLO/career chi tiết |
| `/cong-nghe-thong-tin` | Render 126 tín chỉ, 9 học kỳ, 53 học phần, mã 7480201, hướng Đồ họa kỹ thuật số; chuẩn đầu ra đang để trạng thái tư vấn |
| `/quan-tri-dich-vu-du-lich-va-lu-hanh` | Render 126 tín chỉ, 9 học kỳ, 57 học phần, mã 7810103, hai hướng Lữ hành/Khách sạn |

Đây là bằng chứng về trạng thái hiện tại của local app, không phải xác nhận nguồn chính thức. Các số liệu trên vì vậy vẫn nằm trong nhóm `needs-review`/`remove-from-public` ở ma trận claim.

## 2. Registry nguồn chính thức

| ID | URL | Nội dung dùng để đối chiếu | Phân loại | Kết quả truy cập |
|---|---|---|---|---|
| S01 | [Trang chủ Topica](https://topicauni.edu.vn/) | Đơn vị vận hành, đào tạo từ xa, 5 ngành, đối tượng, Talent, bằng cấp, tuyển sinh | canonical official | Đã đọc |
| S02 | [Học phí](https://topicauni.edu.vn/hoc-phi/) | Chia đợt đóng, miễn học phần theo quy định, Talent 30% | canonical official | Đã đọc |
| S03 | [Thông báo tuyển sinh PXUni-Elearning 2026 – đợt 2](https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/) | Điều kiện, 5 phương thức, học phí, học bổng, LMS, lịch học, thời hạn | canonical official notice | Đã đọc |
| S04 | [Thông tin tuyển sinh năm 2026](https://topicauni.edu.vn/thong-tin-tuyen-sinh-nam-2026/) | Hình thức đào tạo, điều kiện, chuẩn đầu vào, thực hành doanh nghiệp | canonical official notice | Đã đọc |
| S05 | [Hệ thống](https://topicauni.edu.vn/he-thong/) | MegaSchool LMS, AP, Google Classroom, Google Meet, 1Office | canonical official | Đã đọc |
| S06 | [Kế hoạch năm học](https://topicauni.edu.vn/dao-tao/ke-hoach-dao-tao/ke-hoach-nam-hoc/) | Quyết định/kế hoạch theo năm học | canonical official | Đã đọc; chưa thay thế bảng CTĐT |
| S07 | [Kế hoạch học kỳ](https://topicauni.edu.vn/dao-tao/ke-hoach-dao-tao/ke-hoach-hoc-ky/) | Liên kết kế hoạch học kỳ các ngành | canonical official | Đã đọc; chưa có bảng học phần đủ chi tiết |
| S08 | [QTKD – Truyền thông & Marketing số](https://topicauni.edu.vn/quan-tri-kinh-doanh-marketing/) | Mô tả marketing/career | official program page | Cần kiểm tra lại bản live đầy đủ |
| S09 | [CNTT](https://topicauni.edu.vn/cong-nghe-thong-tin/) | Mô tả CNTT/định hướng | official program page | Cần kiểm tra lại chuyên ngành |
| S10 | [Quản trị Dịch vụ Du lịch & Lữ hành](https://topicauni.edu.vn/quan-tri-dich-vu-du-lich-va-lu-hanh/) | Sự tồn tại và mô tả ngành | official program page | Cần kiểm tra lại phạm vi tuyển sinh |
| S11 | [Mục tiêu và chuẩn đầu ra](https://topicauni.edu.vn/chuong-trinh/chuong-trinh-dao-tao-tu-xa/muc-tieu-va-chuan-dau-ra/) | PO/PLO công khai | official academic page | Chưa đủ để xác minh toàn bộ học phần |
| S12 | [Domain tuyển sinh phụ](https://www.tuyensinh.topicauni.edu.vn/) | 100% online, E-CLASS, cán bộ học tập, chia 2 đợt, miễn tương đương | secondary/marketing domain | Không phải canonical source |
| S13 | [Liên hệ](https://topicauni.edu.vn/lien-he/) | Địa chỉ, hotline, email | canonical official | Cần xác minh lại bản live |
| S14 | [Chính sách bảo mật](https://topicauni.edu.vn/chinh-sach-bao-mat/) | Link/chính sách xử lý dữ liệu | canonical official | Cần xác minh lại bản live |

Các file DOCX trong workspace là **local evidence**, không tự động là nguồn chính thức trên web. Chi tiết học thuật chỉ được public sau khi đối chiếu đúng file/phiên bản và người phụ trách duyệt.

## 3. Đối chiếu claim hiện tại

| Claim/hiển thị hiện tại | Nguồn chính thức | Trạng thái | Cách xử lý được phép |
|---|---|---|---|
| Có 5 ngành: QTKD, CNTT – Đồ họa kỹ thuật số, Ngôn ngữ Trung, Ngôn ngữ Anh, Du lịch | S01 | `public-with-caveat` | Có thể nêu 5 ngành theo homepage; kiểm tra lại phạm vi tuyển sinh từng đợt |
| Du lịch vẫn tồn tại | S01, S10; nhưng S03 không liệt kê Du lịch | `needs-review` / `conflicting` | Không xóa ngành khỏi registry; phải xác nhận Du lịch có tuyển trong đợt hiện hành hay chỉ là chương trình đang tồn tại |
| Đào tạo từ xa / E-learning | S01, S03, S04 | `public-ready` | Dùng đúng “đào tạo từ xa”, “E-learning qua LMS” |
| Học trực tuyến cuối tuần hoặc buổi tối | S03 | `public-with-caveat` | Gắn với thông báo/đợt tuyển sinh, không biến thành cam kết bất biến |
| Hybrid | Không tìm thấy xác nhận trực tiếp | `remove-from-public` | Không dùng từ “hybrid” nếu chưa có văn bản định nghĩa |
| 100% online | S12; S01/S03 dùng E-learning và lịch online, không cùng wording | `needs-review` | Chỉ dùng khi owner xác nhận domain phụ là nguồn áp dụng; không coi là claim canonical |
| LMS/MegaSchool, Google Meet, Google Classroom | S05; E-learning qua LMS ở S03 | `public-with-caveat` | Nêu hệ thống hỗ trợ; không suy ra mọi hoạt động đều 100% qua một công cụ |
| Mentor | Không thấy “mentor” trong nguồn canonical; S12 dùng “Cán bộ học tập” | `needs-review` | Dùng “cán bộ học tập/hỗ trợ” nếu được duyệt; không đổi thành mentor |
| Đối tượng THPT hoặc tương đương | S01, S03, S04 | `public-ready` | Nêu kèm điều kiện hồ sơ/threshold của thông báo hiện hành |
| Người có Trung cấp/Cao đẳng/Đại học | S01, S03, S04 | `public-with-caveat` | Phải giữ điều kiện văn bằng và điều kiện bổ sung đối với Trung cấp chưa có THPT |
| Có 5 phương thức tuyển sinh 2026 | S03, S04 | `public-ready` | Thay claim cũ “3 phương thức” trong FAQ khi có quyền sửa nội dung |
| Tuyển sinh liên tục trong năm | S01, S03 | `public-with-caveat` | Ghi “nhận hồ sơ theo thông báo/đợt”; không dùng như lịch khai giảng cố định |
| Đợt 2 nhận hồ sơ đến 25/06/2026 | S03 | `expired` / `needs-review` | Không hiển thị như deadline hiện hành sau ngày này nếu chưa có thông báo mới |
| Talent giảm 30% toàn khóa | S01, S02, S03, S12 | `public-with-caveat` | Giữ điều kiện đăng ký sớm, số lượng/đến hạn theo S03; không gọi là áp dụng vô thời hạn |
| Talent 30% có 500 suất, trước 31/12/2026 | S03 | `public-with-caveat` | Phải ghi rõ đây là điều kiện của thông báo 2026 – đợt 2 |
| Leadership 20%, Cooperation 40%, Future 5%, tu sĩ 50% | S03 | `public-with-caveat` | Chỉ dùng cùng điều kiện/đối tượng trong thông báo; không rút gọn thành “ai cũng được” |
| Học phí 600.000đ/tín chỉ | S03 | `public-ready` cho phạm vi thông báo | Ghi năm/đợt áp dụng; không thay bằng giá khác nếu không có nguồn mới |
| Học phí chia theo từng đợt | S02; S12 nói rõ 2 đợt mỗi học kỳ | `public-with-caveat` | Canonical chỉ đủ xác nhận “chia theo đợt”; số đợt mỗi kỳ cần duyệt |
| Đóng theo học kỳ, 2 học kỳ chính/năm | Code `TuitionHub`; không thấy đủ trong S03 | `needs-review` | Không coi là official nếu chưa có quy định thu phí tương ứng |
| Miễn học phần | S02; S12 nêu miễn môn tương đương | `public-with-caveat` | Dùng “được xét miễn theo quy định”; không hứa miễn tự động |
| Bằng do Trường Đại học Phú Xuân cấp | S01 | `public-with-caveat` | Có thể nêu đơn vị cấp bằng; giữ nguyên tên trường và phạm vi chương trình |
| Bằng được Bộ GD&ĐT công nhận; thi công chức; học Thạc sĩ/Tiến sĩ; không ghi hình thức | S01/S12 là claim marketing/pháp lý mạnh | `needs-review` | Cần văn bản pháp lý/quy chế hiện hành; không dùng gộp thành cam kết chung |
| Trực thuộc PXU / thành viên EQuest | S01 và trang giới thiệu | `public-with-caveat` | Dùng đúng quan hệ pháp nhân/đơn vị vận hành đã được duyệt |
| 3 năm / 9 học kỳ / 126 tín chỉ | Local DOCX/code; không đủ nguồn web chung cho cả 3 ngành | `needs-review` | Không public đồng loạt cho 5 ngành khi chưa có nguồn từng ngành |
| Tổng số học phần 59/57/53 hoặc các con số trong code | Local DOCX/code | `remove-from-public` | Chưa có bảng CTĐT/phiên bản được duyệt cho từng ngành; không tự suy diễn |
| STT 52–53 là thực tập/khóa luận | Local DOCX/code | `needs-review` | Audit phải giữ số STT theo DOCX; không đưa các chữ ghi chú “giữ số...” vào public label |
| Nội dung PLO/career/course chi tiết của 3 trang | Local data + S11 một phần | `needs-review` | Chỉ public sau khi đối chiếu bản DOCX/PDF đúng ngành, đúng phiên bản |
| Học bổng 100%, 50%, 30% trong `TuitionHub` | Code; không khớp nguyên văn với S03 | `remove-from-public` | Không dùng các điều kiện 100%/50% hiện tại nếu chưa có nguồn 2026 tương ứng |
| Học phí 750k/850k/1.250k, lệ phí 1 triệu, tăng không quá 10% | `TuitionHub`; S03 nêu 600k/tín chỉ và 80k hồ sơ | `conflicting` | Khoanh vùng là dữ liệu stale/không có nguồn; không coi là bảng chính thức |
| 3 cảm nhận học viên: Phạm Duy Khánh, Nguyễn Trần Thanh Duy, Trần Thị Minh Nguyệt | S01 — trang chủ chính thức Topica | `public-with-caveat` | Chỉ dùng đúng nội dung đang công khai trên S01, gắn liên kết nguồn; nội dung khác vẫn cần consent/provenance riêng |
| “Bộ GD&ĐT công nhận” trong hero/trust/program subtitle | S01 có wording tương tự ở homepage | `needs-review` | Cần xác định claim áp dụng cho bằng/chương trình nào; tránh câu khẳng định bao trùm |

## 4. Phân loại bắt buộc

### Có nguồn, có thể dùng đúng phạm vi

- Topica/PXU vận hành chương trình đào tạo từ xa.
- Có 5 ngành trên homepage chính thức.
- Đối tượng gồm THPT/tương đương và một số nhóm đã có văn bằng trước đó, theo điều kiện thông báo.
- Thông báo 2026 nêu E-learning qua LMS, lịch trực tuyến cuối tuần/tối.
- Mức 600.000đ/tín chỉ trong thông báo 2026 – đợt 2.

### Có nguồn nhưng cần duyệt trước khi public

- Bằng do PXU cấp và mọi diễn giải về giá trị pháp lý.
- Talent 30% và toàn bộ điều kiện/số suất/thời hạn.
- Chia đợt đóng, miễn học phần, công cụ LMS, lịch học.
- 100% online, E-CLASS, 3–5 buổi Meet, cán bộ học tập từ domain phụ.
- 3 năm/9 học kỳ/126 tín chỉ cho từng ngành.

### Không có nguồn đủ mạnh

- Hybrid.
- Mentor theo đúng thuật ngữ.
- Bảng CTĐT đầy đủ, mã học phần, STT, tổng số học phần, phân bổ tín chỉ, PLO/career chi tiết cho mọi ngành.
- Các giá/điều kiện học bổng và phí đang hard-code nhưng không xuất hiện trong nguồn 2026 đã kiểm tra.

### Mâu thuẫn cần owner quyết định

- Homepage có Du lịch trong 5 ngành; thông báo tuyển sinh 2026 – đợt 2 không liệt kê Du lịch.
- Canonical notice: 600.000đ/tín chỉ; `TuitionHub`: 750.000/850.000/1.250.000đ/tín chỉ.
- Canonical dùng E-learning/LMS + lịch cuối tuần/tối; domain phụ dùng “100% online” và E-CLASS.
- `AdmissionHub` nói 3 phương thức và lịch đợt 1 tháng 3–5; thông báo 2026 nêu 5 phương thức và deadline riêng của đợt 2.

## 5. Giới hạn audit

- Đây là đối chiếu nguồn, không phải phê duyệt pháp lý hay kiểm toán triển khai production.
- Một số URL chương trình/liên hệ không trả toàn bộ nội dung ổn định trong lần kiểm tra; trạng thái vì thế được giữ ở `needs-review`, không suy diễn.
- Hai tài liệu Google Drive được liên kết từ thông báo tuyển sinh chưa được tải và kiểm tra toàn văn trong audit này.
- Không có thay đổi nào được thực hiện lên UI, route, data production, CMS, API hoặc database.
