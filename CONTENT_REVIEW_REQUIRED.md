# Content Review Required

Đây là danh sách chặn trước khi public. Không phải danh sách thay đổi UI.

## P0 – cần quyết định nguồn/câu chữ trước khi dùng quảng cáo

| Vấn đề | Bằng chứng | Rủi ro | Câu chữ tạm thời |
|---|---|---|---|
| Du lịch có tuyển trong đợt hiện hành không? | Homepage/S10 có ngành; thông báo 2026 – đợt 2/S03 không liệt kê | Có thể dẫn sai hồ sơ | “Ngành có trên danh mục chương trình; kiểm tra đợt tuyển sinh hiện hành.” |
| Học phí chuẩn nào? | S03: 600.000đ/tín chỉ; `TuitionHub`: 750.000/850.000/1.250.000đ | Sai giá trực tiếp | Chỉ dùng mức trong thông báo có ghi rõ năm/đợt; treo các bảng hard-code chưa có nguồn |
| “100% online” hay E-learning có lịch cuối tuần/tối? | S03/S05 dùng E-learning/LMS; S12 dùng 100% online/E-CLASS | Cam kết sai về hình thức học/hiện diện | “E-learning qua LMS; lịch học theo thông báo từng đợt.” |
| Bằng và giá trị pháp lý | S01 có claim mạnh; chưa có căn cứ pháp lý/case-specific trong bộ audit | Rủi ro pháp lý | “Bằng do Trường Đại học Phú Xuân cấp” và gửi căn cứ khi được duyệt |

## P1 – cần người phụ trách tuyển sinh/đào tạo duyệt

| Claim | Trạng thái | Việc cần xác nhận |
|---|---|---|
| Talent 30% | Có nguồn, có điều kiện | Còn áp dụng không, số suất, hạn 31/12/2026, cách tính theo khóa/kỳ |
| Các học bổng 20/40/5/50% | Có trong S03 | Đối tượng, bằng chứng, thứ tự ưu tiên, còn hiệu lực |
| Chia học phí theo đợt | Có ở S02; chi tiết 2 đợt/kỳ chỉ ở S12 | Số đợt, mốc thu, chính sách hoàn/đổi |
| Miễn học phần | S02/S12 | Danh mục, điều kiện, thời điểm xét, có áp dụng cho từng văn bằng không |
| Mentor | Không có canonical wording | Có dùng “mentor” hay “cán bộ học tập” |
| Phương thức tuyển sinh | `AdmissionHub` ghi 3; S03/S04 ghi 5 | Dùng bộ 5 phương thức 2026 nào trong FAQ/live content |
| Thời gian tuyển sinh | Homepage nói quanh năm; S03 có mốc đến 25/06/2026 | Thông báo mới thay thế và ngày khai giảng thực tế |
| 5 ngành | Homepage có 5; S03 có 4 | Danh mục mở tuyển theo từng đợt, đặc biệt Du lịch |
| PLO/career/course copy | Local data có nhiều chi tiết | Duyệt đúng DOCX/PDF và phạm vi được công khai |
| Học phí không tăng quá 10%/năm | Chỉ thấy trong `TuitionHub` | Tìm quyết định/quy định thu phí; nếu không có thì bỏ claim |
| Lệ phí nhập học 1.000.000đ | Code; S03 nêu 80.000đ/hồ sơ | Xác định đây là loại phí nào và nguồn hiện hành |

## P2 – khóa dữ liệu học thuật cho đến khi có evidence

- Tổng học phần của từng ngành.
- STT học phần, mã học phần, tên học phần, số tín chỉ, điều kiện tiên quyết.
- 52–53 là STT của thực tập/khóa luận theo DOCX; không đưa các câu chú giải “giữ số...” vào label public.
- Tổng 126 tín chỉ, 9 học kỳ, thời lượng 3 năm cho từng ngành; không nhân bản từ một ngành sang ngành khác.
- Phân bổ học kỳ, PLO/PI, chuẩn đầu ra, điều kiện tốt nghiệp, thực tập và khóa luận.
- Chuyên ngành CNTT – Đồ họa kỹ thuật số: nguồn chuẩn đầu ra CNTT rộng không đủ chứng minh toàn bộ nội dung đồ họa.

## Claim nên ẩn khỏi public cho đến khi duyệt

- “Hybrid”.
- “Mentor” nếu chưa có nguồn dùng đúng thuật ngữ.
- “Bằng được Bộ GD&ĐT công nhận” nếu không chỉ rõ văn bản/phạm vi.
- “Đủ điều kiện thi công chức”, “học lên Thạc sĩ/Tiến sĩ”, “không ghi hình thức đào tạo” nếu chưa có căn cứ pháp lý hiện hành.
- Giá 750.000/850.000/1.250.000đ/tín chỉ, phí nhập học 1.000.000đ, tăng không quá 10%/năm.
- Testimonial ngoài 3 cảm nhận đang công khai trên S01 nếu chưa có consent/provenance riêng.
- Mọi course count/PLO/career list không có nguồn đúng ngành, đúng phiên bản.

## Owner cần ký duyệt

1. Tuyển sinh: phạm vi 5 ngành, phương thức, deadline, Talent và học phí.
2. Đào tạo: CTĐT/DOCX/PDF đúng phiên bản, miễn học phần, học kỳ, STT 52–53.
3. Pháp chế/nhà trường: câu chữ về bằng, công nhận và quyền học tiếp/thi công chức.
4. Marketing/CRO: chỉ dùng claim đã có `approvedForPublic: true` trong `CONTENT_SOURCE_OF_TRUTH.ts`.
