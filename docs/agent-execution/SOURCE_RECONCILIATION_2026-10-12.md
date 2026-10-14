# Đối chiếu nguồn — 12/10/2026

Người dùng cho phép dữ liệu hiện tại hoặc topicauni.edu.vn. Codex đọc ngày 12/10; chưa có reviewer nghiệp vụ, các quyết định là `in_review`, không tự `confirmed`. CSV 192 field là snapshot trước sửa, không phải source hiện tại.

S01: [Thông báo tuyển sinh 2026 đợt 2](https://topicauni.edu.vn/thong-bao-tuyen-sinh-dai-hoc-chinh-quy-hinh-thuc-tu-xa-pxuni-elearning-nam-2026-dot-2/). Phạm vi là thông báo này, không suy ra kỳ đang mở ngày 12/10. S02: [Học phí](https://topicauni.edu.vn/hoc-phi/). Trang chủ và một số URL phụ timeout, không ghi thành HTTP 500.

| Decision | Field / xử lý                                                                                                                                                                      | Còn mở                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| D01      | S01 có 600.000 VNĐ/tín chỉ, giữ đơn giá hiện hữu                                                                                                                                   | 126 TC/tổng là kịch bản hiện có; số tín chỉ thực tế theo hồ sơ           |
| D02      | S01: lệ phí xét tuyển 80.000 VNĐ/hồ sơ, thay claim phí nhập học 1.000.000 chưa có nguồn. UI ghi phạm vi đợt 2                                                                      | Biểu phí kỳ hiện tại                                                     |
| D03      | S01: Talent 30% toàn chương trình trước 31/12/2026 tùy suất; Leadership 20% sau hết Talent trước 31/01/2027; Cooperation 40% theo đối tượng/chứng từ. Bỏ 50% năm đầu/30% hỗ trợ cũ | Suất, kết hợp ưu đãi; UI không liệt kê mọi chính sách                    |
| D04      | Bỏ cam kết tăng phí tối đa 10%/trả góp 0% vì S01/S02 không hỗ trợ                                                                                                                  | Văn bản tài chính nếu cần công bố cam kết                                |
| D05      | Không tạo kỳ đang mở: S01 có hạn 25/06/2026 đã qua. CMS trống hiển thị trung tính                                                                                                  | Kỳ mới/ngày hồ sơ/khai giảng                                             |
| D06      | S01: THPT 2,5–3 năm; trung cấp 2–2,5; cao đẳng 2; bằng hai 1,5–2; khác dữ liệu hiện tại 3,5 năm/9 kỳ                                                                               | Chưa thay curriculum theo suy đoán; cần ngành/đối tượng/miễn trừ, R05 mở |
| D07      | S01 có 0901795580/info@topicauni.edu.vn; hiện tại có kênh khác. Địa chỉ Đà Nẵng ở thân/footer nguồn khác nhau                                                                      | Chưa thay đồng loạt hotline/địa điểm; CMS dùng một nguồn khi duyệt       |
| D08      | Bỏ “tải” HTML và file/ngày dựng sẵn học phí; bỏ testimonial tên A/B/C/D/số SV chưa nguồn trong default admin                                                                       | File thật, quyền ảnh/chứng thực; không tạo thay thế                      |

Giá/học bổng ở `data/tuition.ts`, consumer ở `lib/services/public-site.ts`. Không sửa DB thật/seed/publish nghiệp vụ. URL nguồn không chứng minh còn suất hoặc mọi legacy fact đúng; owner/reviewer/ngày hiệu lực chưa có để trống.
