# Báo cáo dữ liệu trang ngành đào tạo

Ngày đối chiếu: 28/08/2026  
Nguồn học thuật hiện có:

- `4. CTĐT QTKD 2026 .docx`
- `CTĐT DL 2026-FINAL-XÁC NHẬN (24.8.2026).docx`
- `chương trình đào tạo-02.jpg` — Công nghệ thông tin, Đồ họa kỹ thuật số
- `chương trình đào tạo-03.jpg` — Ngôn ngữ Trung Quốc
- `chương trình đào tạo-04.jpg` — Ngôn ngữ Anh

Nguồn CMS chỉ tiếp tục được dùng cho phần giới thiệu và cơ hội nghề nghiệp khi ảnh chương trình
không cung cấp các nội dung này.

## Phạm vi triển khai

| Đường dẫn                               | Nguồn học thuật | Trạng thái ProgramPage                    |
| --------------------------------------- | ---------------- | ----------------------------------------- |
| `/quan-tri-kinh-doanh-marketing/`       | DOCX đầy đủ      | Dữ liệu học thuật đã đối chiếu            |
| `/quan-tri-dich-vu-du-lich-va-lu-hanh/` | DOCX đầy đủ      | Dữ liệu học thuật đã đối chiếu            |
| `/cong-nghe-thong-tin/`                 | Ảnh kế hoạch     | Đủ học phần, tín chỉ và 9 học kỳ          |
| `/ngon-ngu-anh/`                        | Ảnh kế hoạch     | Đủ học phần, tín chỉ, lựa chọn và 9 học kỳ |
| `/ngon-ngu-trung-quoc/`                 | Ảnh kế hoạch     | Đủ học phần, tín chỉ, lựa chọn và 9 học kỳ |

Không nhân bản dữ liệu giữa các ngành. Trường nào không xuất hiện trong nguồn tương ứng được bỏ
khỏi giao diện.

## Dữ liệu bổ sung từ nguồn mới

| Ngành                               | Dữ liệu đã bổ sung                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Quản trị dịch vụ du lịch và lữ hành | Mã 7810103; thông tin chung; 126 tín chỉ; 9 học kỳ; học phần; 10 PLO; tuyển sinh; tốt nghiệp; học tiếp |
| Công nghệ thông tin                 | 126 tín chỉ; 9 học kỳ; toàn bộ học phần trong ảnh; khối không tích lũy                                 |
| Ngôn ngữ Anh                        | 126 tín chỉ; 9 học kỳ; học phần bắt buộc/tự chọn; hai định hướng; khối không tích lũy                  |
| Ngôn ngữ Trung Quốc                 | 126 tín chỉ; 9 học kỳ; học phần bắt buộc/tự chọn; hai định hướng; khối không tích lũy                  |

Ba ảnh không cung cấp mã ngành, văn bằng, ngôn ngữ đào tạo, điều kiện tuyển sinh, điều kiện tốt
nghiệp hoặc chuẩn đầu ra; các trường này được bỏ khỏi giao diện thay vì suy diễn.

Ảnh Ngôn ngữ Anh lặp mã `BUE.7.02` cho Tiếng Anh thương mại 2/3 và `ETR.7.04` cho Tiếng Anh du
lịch 2/Tiếng Anh cảnh điểm du lịch Huế. Giao diện giữ nguyên mã nguồn và gắn cảnh báo tại đúng học
phần.

DOCX Du lịch dùng `BUA.7.21/BUA.7.22` ở khung chương trình nhưng dùng `AET.7.23/AET.7.24` ở kế
hoạch học kỳ cho Thực tập doanh nghiệp/Khóa luận tốt nghiệp. Giao diện ưu tiên mã trong kế hoạch
học kỳ và hiển thị điểm cần đối chiếu.

## Bản đồ trường dữ liệu QTKD

| Trường hiển thị                                                                        | Vị trí trong nguồn   | Trạng thái                                                        |
| -------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| Tên ngành, tên tiếng Anh, mã ngành, trình độ, hình thức, thời gian, ngôn ngữ, văn bằng | Trang 6              | Đã xác minh                                                       |
| 126 tín chỉ                                                                            | Trang 6; Bảng 7      | Đã xác minh                                                       |
| Đối tượng tuyển sinh, điều kiện tốt nghiệp, khả năng học tiếp                          | Trang 6              | Đã xác minh                                                       |
| 10 chuẩn đầu ra PLO                                                                    | Trang 9–10           | Đã xác minh và biên tập rút gọn                                   |
| Cơ cấu khối kiến thức                                                                  | Bảng 7, trang 12     | Đã xác minh                                                       |
| Danh mục học phần, tín chỉ, bắt buộc/tự chọn, học trước                                | Bảng 8, trang 13–30  | Đã xác minh; giữ cảnh báo tại dòng mâu thuẫn                      |
| 9 học kỳ và tổng tín chỉ từng kỳ                                                       | Bảng 15, trang 31–40 | Đã xác minh ở cấp tổng; nội dung tiêu biểu chỉ dùng để định hướng |
| Cơ hội nghề nghiệp                                                                     | Trang 6              | Đã xác minh ở cấp nhóm môi trường làm việc                        |
| Học phí, lịch khai giảng, phương thức tuyển sinh chi tiết, ảnh hero chính thức         | Không có             | Cần bổ sung                                                       |

## Mâu thuẫn cần xác nhận

1. Bảng 8 dùng `BUA.7.21` cho cả Quản trị học và Thực tập doanh nghiệp; Bảng 15 dùng `AET.7.23` cho thực tập.
2. Bảng 8 dùng `BUA.7.22` cho Khóa luận tốt nghiệp; Bảng 15 dùng `AET.7.24`.
3. DMC.7.12 ghi học phần học trước `BUA.7.07`, nhưng mã này không có trong danh mục học phần.
4. Một số bảng chưa đồng nhất về tín chỉ Kinh tế học và Quản trị bản thân; tổng tín chỉ học kỳ 4 cũng cần đối chiếu lại ở cấp dòng.
5. Vì các mâu thuẫn trên, giao diện không công bố tổng số học phần; trường này hiển thị “Cần xác nhận”.

## Quy tắc kiểm tra tự động

- Đủ 5 slug trong `programDetails`.
- Mỗi ngành có đủ 9 học kỳ và tổng tín chỉ 9 học kỳ bằng 126.
- QTKD và Du lịch có đủ 10 chuẩn đầu ra.
- Ba ngành từ ảnh mang trạng thái `curriculum_source`, không công bố trường hồ sơ mà ảnh không có.
- Tổng số học phần chưa được biến thành số liệu công bố.

Các quy tắc được kiểm tra tại `__tests__/data/program-details.test.ts`.
