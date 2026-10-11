# Kế hoạch hoàn thiện website Topica — Thiết kế, UI/UX và vận hành

Ngày lập: 11/10/2026. Trạng thái: kế hoạch đề xuất, chưa triển khai thay đổi ứng dụng.

## 1. Mục tiêu và phạm vi

Hoàn thiện website hiện tại thành một website giáo dục có bản sắc, cung cấp thông tin chính xác và kịp thời, giúp người học chủ động tìm hiểu trước khi đăng ký tư vấn hoặc xét tuyển.

Thứ tự ưu tiên:

1. Thông tin đúng, thống nhất và có đơn vị chịu trách nhiệm.
2. Hành trình người học dễ hiểu, dễ hoàn thành trên điện thoại.
3. Giao diện navy hiện đại, có hình ảnh thật và phân cấp thị giác rõ.
4. CMS đủ khả năng duy trì chất lượng nội dung sau bàn giao.
5. Hiệu năng, khả năng tiếp cận, tìm kiếm và đo lường được kiểm chứng.

Phạm vi gồm website công khai, trải nghiệm quản trị nội dung có liên quan, tiếp nhận tư vấn, kết nối tới cổng xét tuyển và triển khai vận hành. Không mặc định xây lại LMS, thư viện, hệ thống thi hay cổng xét tuyển bên ngoài. Các hệ thống đó được liên kết đúng chức năng và có chỉ dẫn rõ.

Không thay nền tảng công nghệ chỉ vì đổi thiết kế. Tính năng so sánh ngành, tính học phí nâng cao, cá nhân hóa, chatbot và tích hợp CRM hai chiều là hạng mục bổ sung nếu nghiên cứu chứng minh cần thiết; không phải điều kiện để phát hành phiên bản hoàn chỉnh đầu tiên.

## 2. Cơ sở thực tế từ dự án

Các nhận định dưới đây đến từ khảo sát giao diện và đọc mã nguồn, không phải kết quả kiểm thử toàn bộ hệ thống:

| Hiện trạng | Ý nghĩa đối với kế hoạch |
|---|---|
| Next.js 16.3.3, React 19, Tailwind 4; nhiều section và UI component đã có | Nâng cấp theo từng lớp, tái sử dụng thành phần đạt yêu cầu |
| Trang chủ đã có chương trình, lý do lựa chọn, tin tức, chia sẻ, quy trình, đối tác, trung tâm | Cần sắp xếp lại mức ưu tiên và chất lượng nội dung, không chỉ thêm section |
| CMS hiện truy vấn cơ sở dữ liệu nội bộ SQLite qua `lib/cms/queries.ts` và `lib/db` | Dựa trên luồng đang chạy; tài liệu mô tả WordPress cần được cập nhật |
| Nội dung ngành nằm trong `data/programs.ts`, `data/program-details.ts`, `data/supplemental-program-details.ts`; form có danh sách ngành riêng | Chuẩn hóa một danh mục ngành dùng chung |
| `TuitionHub.tsx` chứa nội dung và giá trị học phí trực tiếp trong component | Chuyển học phí thành dữ liệu có phiên bản và phạm vi áp dụng |
| Admin và API trang chủ có nội dung mặc định gồm tên mẫu, số liệu mẫu | Ngăn nội dung minh họa trở thành nội dung xuất bản khi thiếu cấu hình |
| Màu và kích thước được khai báo trong `tokens.css`, `app/theme.css`, `app/design-tokens.css` | Hợp nhất nguồn định nghĩa, giữ lớp tương thích trong quá trình chuyển đổi |
| Analytics hiện ghi lượt xem trang | Bổ sung sự kiện hành trình và kết quả tiếp nhận tư vấn |
| Có unit test, E2E và axe dependency; script links/a11y/lighthouse hiện chỉ in thông báo | Chuyển các đầu kiểm tra này thành kiểm tra thực chất |
| Có nhiều thay đổi giao diện đang nằm trong working tree | Khi triển khai phải ghi nhận và bảo toàn thay đổi hiện có; không reset hàng loạt |

Các lỗi đã thấy ở giao diện cần đưa vào backlog: hotline/email không thống nhất; thông báo tuyển sinh hết hạn còn nổi bật; HTML entity và thẻ HTML lộ ra; liên kết tài liệu `#`; nhãn nút sai đích đến; khác biệt về hình thức đào tạo và lịch học chưa giải thích rõ.

## 3. Nhân sự, thời gian và nguyên tắc ước lượng

Khung đề xuất: 10–12 tuần đến phát hành, sau đó 30 ngày theo dõi và tối ưu. Đây là ước lượng ban đầu, không phải cam kết tiến độ.

Giả định nhân sự: 1 người phụ trách UX/UI, 1 lập trình viên frontend/full stack, 1 người phụ trách CMS/backend có thể làm bán thời gian, 1 đầu mối nội dung Topica, QA tham gia từ giai đoạn thiết kế và tập trung ở giai đoạn nghiệm thu. Một người có thể đảm nhiệm nhiều vai trò, nhưng tiến độ phải điều chỉnh theo năng lực thực tế.

Giả định vận hành: tài liệu chương trình và học phí được cung cấp trong tuần 1–2; người có thẩm quyền phản hồi các mốc thiết kế trong khoảng 2 ngày làm việc; có môi trường staging riêng; chụp ảnh được khởi động sớm.

Nếu chỉ có 1 lập trình viên kiêm thiết kế, cần lập lại ước lượng sau phase 0; không dùng nguyên lịch đội nhiều vai trò. Thời gian từng phase là cửa sổ thực hiện, có chồng lấp, không phải tổng số ngày công. Dự phòng tuần 11–12 dành cho nội dung, ảnh và sửa lỗi, không dùng để âm thầm mở rộng tính năng.

| Phase | Nội dung | Thời lượng dự kiến | Lịch | Phụ thuộc chính |
|---|---|---|---|---|
| 0 | Kiểm kê và baseline | 2–3 ngày | Tuần 1 | Bắt đầu |
| 1 | Chuẩn hóa nội dung và dữ liệu | 4–6 ngày khởi tạo, hoàn thiện song song | Tuần 1–2 | 0 |
| 2 | Kiến trúc thông tin và user flow | 3–4 ngày | Tuần 2 | 0, bộ dữ liệu lõi của 1 |
| 3 | Hướng mỹ thuật và design system | 4–6 ngày | Tuần 3 | 2 |
| 4 | Thiết kế chi tiết các mẫu trang | 6–8 ngày | Tuần 4–5 | 2, 3, nội dung mẫu thật |
| 5 | Prototype và kiểm thử người dùng | 3–5 ngày | Tuần 5 | Các luồng lõi của 4 |
| 6 | Thành phần giao diện và khung website | 4–6 ngày | Tuần 5–6 | 3 đã chốt; cập nhật theo 5 |
| 7 | Triển khai toàn bộ nhóm trang | 10–15 ngày | Tuần 6–8 | 4, 5, 6; dữ liệu đã duyệt |
| 8 | CMS và quy trình cập nhật | 5–8 ngày | Tuần 6–8 | 1, mô hình dữ liệu đã chốt |
| 9 | QA tổng thể và nghiệm thu | 5–7 ngày | Tuần 9 | 7, 8 |
| 10 | Phát hành và bàn giao | 2–3 ngày | Tuần 10 | 9 đạt tiêu chí |
| 11 | Theo dõi và tối ưu | 30 ngày | Sau phát hành | 10 |

## 4. Phase 0 — Kiểm kê, xác định phạm vi và ghi nhận baseline

**Mục tiêu:** có danh sách chính xác những gì cần hoàn thiện, tránh bỏ sót các trang sâu và chức năng admin.

**Công việc**

- Lập danh mục URL từ route, navigation, sitemap, CMS và các liên kết trong nội dung. Với mỗi URL ghi loại trang, nguồn dữ liệu, người phụ trách, tình trạng, traffic nếu có và hành động giữ/sửa/gộp/ẩn/chuyển hướng.
- Kiểm tra nhóm trang: trang chủ; giới thiệu và trang con; danh mục ngành và 5 ngành đang được giới thiệu; tuyển sinh; học phí; chất lượng và văn bằng; trải nghiệm học; tin tức và bài viết; tìm kiếm; FAQ; liên hệ; các trang chính sách; 404; admin.
- Chụp baseline desktop/mobile của từng mẫu trang và các trạng thái menu/form quan trọng.
- Ghi nhận thời gian tải, lỗi tương tác, lỗi nội dung, tình trạng thiết bị thật và khả năng tiếp cận. Không lấy điểm localhost dev làm điểm nghiệm thu hiệu năng.
- Kiểm kê DB, ảnh, tài liệu, nguồn nội dung và thao tác quản trị hiện có.
- Xác định nguồn chính thức cho cổng xét tuyển và các dịch vụ sinh viên.
- Ghi nhận working tree hiện có; chuẩn bị điểm khôi phục phù hợp trước khi triển khai.
- Phân loại lỗi: P0 mất chức năng thiết yếu/lộ dữ liệu/sai thông tin tuyển sinh quan trọng; P1 cản trở luồng chính hoặc gây hiểu nhầm; P2 giảm tính rõ ràng/thẩm mỹ; P3 tinh chỉnh.

**Đầu ra:** danh mục URL, báo cáo baseline, backlog có mức ưu tiên và người xử lý, danh sách quyết định cần Topica xác nhận, phạm vi phát hành.

**Chủ trì:** đầu mối sản phẩm + UX; phối hợp kỹ thuật, nội dung, QA.

**Nghiệm thu:** mọi URL trong điều hướng và sitemap có trong danh mục; mọi nhóm trang có mẫu khảo sát; các vấn đề đã biết có ticket; có kế hoạch bảo toàn dữ liệu và thay đổi hiện có.

## 5. Phase 1 — Chuẩn hóa nội dung, thông tin học thuật và bằng chứng

**Mục tiêu:** giao diện mới sử dụng một bộ thông tin có thể kiểm chứng và duy trì.

**Công việc**

- Chốt tên đơn vị, quan hệ Topica/PXU/EQuest, đơn vị tổ chức đào tạo và cấp bằng, cách dùng logo, số liên hệ, email và địa chỉ.
- Đối chiếu từng ngành: tên chính thức và tên truyền thông, mã ngành, hình thức đào tạo, văn bằng, thời gian, tín chỉ, lịch học và thi, đầu vào, đầu ra, học phí, tuyển sinh hiện hành.
- Giải thích phạm vi các thông tin từ xa/chính quy, 100% online, 2 học kỳ/năm và 9 học kỳ/3 năm bằng tài liệu được đơn vị chuyên môn duyệt. Không tự chọn một giá trị để làm các trang trông thống nhất.
- Xác minh tuyên bố công nhận, số liệu thành tích, đối tác và chia sẻ sinh viên. Ghi nguồn, thời điểm, phạm vi, người duyệt; không tự tạo số liệu hay câu chuyện.
- Lập bảng học phí theo chương trình/khóa/đối tượng: đơn giá, số tín chỉ, khoản khác, chính sách thay đổi, ngày hiệu lực, văn bản, đơn vị quản lý.
- Rà lại nội dung mặc định ở admin/API, loại bỏ cơ chế xuất bản tên mẫu hoặc số liệu chưa duyệt khi thiếu dữ liệu thật.
- Xử lý HTML entity, trích đoạn còn thẻ HTML, tên chương trình viết hoa không thống nhất, nội dung ghi chú nội bộ, tài liệu chưa có file.
- Mỗi thông báo tuyển sinh có ngày mở, hạn hồ sơ, khai giảng, trạng thái và thời điểm ngừng nổi bật. Tất cả thời gian nghiệp vụ dùng Asia/Bangkok.
- Biên soạn microcopy cho nút, label, lỗi form, không có kết quả, gửi thành công và chuyển sang cổng ngoài.
- Lập danh sách ảnh cần chụp: banner, giảng viên, học trực tuyến, cố vấn, người học, tốt nghiệp, trung tâm; ghi quyền sử dụng và đồng ý xuất bản phù hợp.

**Đầu ra:** bảng thông tin chuẩn, bộ nội dung đã duyệt, thư viện tài liệu/ảnh, quy chuẩn biên tập, danh sách nội dung chờ xác nhận.

**Chủ trì:** đầu mối nội dung Topica; đào tạo và tuyển sinh xác nhận thông tin chuyên môn.

**Nghiệm thu:** dữ liệu lõi của 5 ngành hiện hành được xác nhận hoặc có quyết định xử lý rõ; liên hệ thống nhất; tuyên bố quan trọng có nguồn; thông tin chưa được duyệt không hiển thị như sự thật đã xác nhận. Các mục chưa có dữ liệu có cách trình bày trung thực và đầu mối hỗ trợ, không tự điền.

## 6. Phase 2 — Kiến trúc thông tin và hành trình người học

**Mục tiêu:** giúp từng nhóm người dùng tìm được câu trả lời và bước tiếp theo.

**Nhóm người dùng cần kiểm chứng:** người đi làm muốn học linh hoạt; người tốt nghiệp THPT; người muốn học tiếp từ nền tảng đã có; phụ huynh; sinh viên đang học. Nhóm ưu tiên được quyết định bằng tuyển sinh thực tế, không bằng giả định thiết kế.

**Các luồng bắt buộc**

1. Trang chủ → ngành học → hình thức/thời gian/học phí → tư vấn.
2. Tuyển sinh → kỳ đang mở → điều kiện/hồ sơ → cổng xét tuyển.
3. Học phí → chọn đúng chương trình/khóa → đọc chi phí và văn bản → hỏi tư vấn.
4. Tìm kiếm → kết quả đúng loại → trang chi tiết hoặc tài liệu.
5. Sinh viên đang học → học liệu/thư viện/hỗ trợ → hệ thống tương ứng.
6. Người cần xác minh → giới thiệu/chất lượng/văn bằng → tài liệu và đầu mối.

**Công việc**

- Tổ chức menu đề xuất: Về Topica; Ngành học; Tuyển sinh & Học phí; Trải nghiệm học tập; Tin tức & Sự kiện; Chất lượng & Công khai.
- Tách thanh tiện ích: Dành cho sinh viên, Thư viện, Tìm kiếm, Liên hệ. Chỉ đưa các dịch vụ có đích đến được xác nhận.
- Quy định CTA theo mức sẵn sàng: tìm hiểu → tư vấn → xét tuyển. Không dùng một nhãn cho nhiều kết quả khác nhau.
- Chốt sitemap, breadcrumb, đường dẫn chuẩn và bản đồ redirect nếu gộp/đổi URL.
- Thiết kế wireframe desktop/mobile cho các luồng lõi; ưu tiên việc đọc, không để popup chặn người xem ngay lần đầu.
- Định nghĩa tìm kiếm: cách xử lý tiếng Việt có/không dấu cần được thử; ưu tiên ngành, tuyển sinh và học phí; nội dung hết hạn được nhận diện rõ.
- Viết danh sách câu hỏi mà mỗi trang phải trả lời, vị trí câu trả lời và hành động kế tiếp.

**Đầu ra:** sitemap, sơ đồ user flow, wireframe, quy tắc điều hướng và CTA, danh sách URL giữ/chuyển hướng.

**Chủ trì:** UX/UI; tuyển sinh và nội dung phối hợp.

**Nghiệm thu:** mỗi luồng có điểm bắt đầu/kết thúc rõ, không có ngõ cụt; từ menu tìm được ngành/học phí/kỳ tuyển sinh trong tối đa 2–3 thao tác là mục tiêu nội bộ cần kiểm thử; không mặc định đây là tiêu chuẩn quốc tế.

## 7. Phase 3 — Hướng mỹ thuật và design system

**Mục tiêu:** chốt bản sắc và quy tắc chung trước khi triển khai nhiều trang.

**Hướng thiết kế:** học thuật, hiện đại, gần gũi, minh bạch. Hai sắc xanh navy tạo nhận diện; ảnh thật và nền sáng tạo cảm xúc và độ thoáng.

**Bộ màu đề xuất**

| Vai trò | Màu | Quy tắc |
|---|---|---|
| Navy chính | #00264D | Header/footer, tiêu đề, nút chính trên nền sáng |
| Xanh bổ trợ | #16466B | Mảng phụ, tương tác, chuyển sắc nhẹ; phải kiểm tra từng cặp tương phản |
| Nền chính | #FFFFFF | Nội dung đọc và khoảng thở |
| Nền phân đoạn | #F3F6FA | Nhóm nội dung phụ |
| Chữ nội dung | #243447 | Văn bản dài |

Các mã là đề xuất; có thể chọn sắc bổ trợ từ thang navy hiện có sau thử nghiệm thực tế. Vàng giữ ở logo nếu là nhận diện chuẩn; không dùng làm màu hành động mặc định toàn website. Màu trạng thái lỗi/thành công có chức năng riêng và luôn có chữ/icon hỗ trợ.

**Công việc thiết kế**

- Chuẩn bị 2 hướng trình bày nhỏ trên cùng nội dung thật: học thuật trang trọng và hiện đại gần gũi; chọn 1 hướng để hoàn thiện. Không làm 2 bộ website hoàn chỉnh.
- Quy định chữ: Be Vietnam Pro cho body/UI; Lora chọn lọc ở tiêu đề thương hiệu; tối đa 2 họ chữ chính. Tên ngành và tin tức dùng sentence case theo quy chuẩn tiếng Việt.
- Thông số khởi điểm: body 16–18px, line-height 1.6–1.75; H1 mobile 32–40px, desktop 48–64px tùy trang; vùng đọc khoảng 60–75 ký tự/dòng; phải thử với nội dung tiếng Việt dài.
- Grid: 12 cột desktop, 8 tablet, 4 mobile; container khoảng 1200–1280px; lề mobile 16–24px; hệ khoảng cách theo bước 4/8px.
- Bo góc, viền, shadow dùng một thang nhỏ; tránh mỗi section có một phong cách.
- Định nghĩa tỷ lệ và vị trí crop ảnh cho desktop/mobile, alt text, caption, fallback khi thiếu ảnh.
- Định nghĩa hiệu ứng 150–250ms cho tương tác thông thường; chuyển động có mục đích và tôn trọng reduced motion. Nội dung quan trọng vẫn hiển thị khi animation bị tắt.
- Thiết kế đủ trạng thái: default, hover, focus, active, disabled, loading, empty, success, error, expired.
- Component cần thiết: button, link, input/select/checkbox, form message, card ngành/tin/sự kiện/tài liệu, badge trạng thái, accordion, tabs nếu cần, breadcrumb, pagination, search, dialog, sticky CTA, menu, toast/status.
- Hợp nhất token màu/chữ/kích thước và lập kế hoạch chuyển những lớp cũ sang token chung, tránh thay CSS global làm hỏng admin.

**Đầu ra:** hướng mỹ thuật đã chọn, design tokens, thư viện component, hướng dẫn ảnh/chữ/chuyển động, màn hình kiểm chứng desktop/mobile.

**Chủ trì:** UX/UI; frontend kiểm tra khả năng triển khai.

**Nghiệm thu:** có mẫu trang chủ, trang ngành và form dùng cùng một hệ; không có chữ/nút khó đọc; màu không là dấu hiệu duy nhất; mọi thành phần tương tác có focus và trạng thái lỗi.

## 8. Phase 4 — Thiết kế chi tiết từng nhóm trang

**Mục tiêu:** giải quyết toàn bộ mẫu trang và trạng thái, không chỉ thiết kế trang chủ.

### 8.1. Khung chung: header, menu, footer, liên hệ

- Header rõ logo, nhóm điều hướng và 1 CTA chính; sticky gọn, không chiếm nhiều chiều cao điện thoại.
- Mega menu mở được bằng chuột, bàn phím và thao tác chạm thích hợp; không phụ thuộc hover.
- Mobile menu theo từng nhóm, có quay lại/đóng, quản lý focus, khóa cuộn nền khi mở; khi đóng trả focus về nút mở.
- Footer có thông tin đơn vị, liên hệ thống nhất, trang công khai/chính sách và lối vào hệ thống sinh viên.
- Mobile chỉ có một thanh hành động cố định phù hợp ngữ cảnh; không chồng với CTA trang ngành, bàn phím hay nút liên hệ nổi.

### 8.2. Trang chủ

Thứ tự đề xuất:

1. Hero: ảnh thật rõ con người; thông điệp cụ thể; tối đa 2 CTA; không đặt form dài ở màn hình đầu theo mặc định.
2. Thông báo tuyển sinh hiện hành: ngày, trạng thái, chương trình áp dụng.
3. Danh mục 5 ngành hiện hành: tên đầy đủ, hình thức và thời gian đã xác nhận; nhóm ngành đơn giản.
4. Vì sao có thể tin tưởng: đơn vị, nguồn thông tin công khai, đội ngũ, bằng chứng liên kết.
5. Trải nghiệm một tuần học: học liệu, lớp trực tuyến, bài tập, hỗ trợ; ảnh/video thật có chú thích.
6. Học phí và lộ trình: tóm tắt đúng phạm vi, liên kết chi tiết.
7. Người học và cựu sinh viên: tên, ngành, khóa, câu chuyện có bối cảnh, ảnh được phép sử dụng.
8. Tin tức/sự kiện: phân biệt tuyển sinh, hoạt động học và sự kiện có thời hạn; hạn chế tin tuyển dụng nhân sự ở vị trí nổi bật.
9. Trung tâm, liên hệ và form tư vấn ngắn.

Mục tiêu hero desktop khoảng 560–680px chỉ là thông số thiết kế ban đầu; điều chỉnh theo nội dung và viewport. Không ép số dòng bằng ngắt dòng cứng làm hỏng mobile. Không dùng slider tự chạy để chứa thông tin tuyển sinh thiết yếu.

### 8.3. Danh mục ngành

- 5 ngành nên hiển thị đủ và có nhóm ngành; không cần bộ lọc phức tạp.
- Card có tên đầy đủ, chuyên ngành tách riêng, mô tả ngắn, hình thức, thời gian và một hành động rõ.
- Trang danh mục giúp chọn ngành, không chỉ là danh sách liên kết văn bản.
- So sánh ngành chỉ bổ sung nếu thử nghiệm cho thấy người dùng thực sự cần.

### 8.4. Trang ngành

Thứ tự: giới thiệu và phù hợp với ai → thông tin nhanh → học được gì → khung chương trình → lộ trình/hình thức học và thi → giảng viên và hỗ trợ → dự án/cơ hội nghề nghiệp → học phí → điều kiện/hồ sơ → FAQ → CTA.

- Hiển thị tên chính thức, mã, văn bằng, đơn vị cấp bằng, hình thức, thời gian, tín chỉ và ngày rà soát đúng nghĩa.
- Giữ curriculum explorer và roadmap khi dữ liệu chính xác; học phần chi tiết có thể thu gọn nhưng thông tin quyết định phải đọc được ngay.
- Có mục lục phù hợp; anchor không bị header che; mobile không tạo nhiều thanh cố định.
- Cơ hội nghề nghiệp mô tả thực tế, không biến vị trí cấp cao thành kết quả mặc định ngay sau tốt nghiệp.
- Thông tin xác minh nội bộ được xử lý trong CMS; người học thấy nội dung đã duyệt, nguồn cần thiết và giải thích dễ hiểu.

### 8.5. Tuyển sinh

- Kỳ đang mở là ưu tiên đầu; trạng thái mở/đóng rõ.
- Mỗi kỳ có phạm vi, điều kiện, ngày, hồ sơ, lệ phí nếu có, các bước và tài liệu.
- Phân biệt tư vấn, nộp hồ sơ, tra cứu hồ sơ. Chỉ xuất hiện tra cứu khi có đích đến thực tế.
- Trước khi chuyển sang cổng ngoài, ghi rõ tên hệ thống và mục đích; không thêm bước xác nhận không cần thiết.

### 8.6. Học phí và học bổng

- Chọn/nhận diện đúng chương trình, khóa, đối tượng, năm áp dụng.
- Trình bày đơn giá, chi phí theo kỳ, tổng dự kiến nếu đủ dữ liệu, khoản đã gồm/chưa gồm và điều kiện thay đổi.
- Ví dụ tính toán phải ghi giả định, không hiển thị một con số tổng cho mọi đối tượng.
- Học bổng ghi điều kiện, số lượng nếu có, hạn, giá trị, thời gian áp dụng và quy trình xét.
- Tài liệu thật có tên, ngày, định dạng, dung lượng nếu xác định được, xem/tải rõ ràng.

### 8.7. Về Topica, chất lượng, trải nghiệm học

- Trang giới thiệu giải thích đơn vị và quan hệ trong hệ thống; có đội ngũ, lịch sử và cơ sở thực tế.
- Chất lượng/công khai tập hợp tài liệu theo loại và thời kỳ; không dùng huy hiệu không có nguồn.
- Văn bằng mẫu có chú thích và che dữ liệu cá nhân khi cần; giải thích đơn vị cấp và phạm vi chương trình.
- Trải nghiệm học giải thích lịch một tuần, học liệu, lớp học, kiểm tra/thi, kỹ thuật cần chuẩn bị, cố vấn và kênh hỗ trợ.

### 8.8. Tin tức, sự kiện, bài viết

- Danh mục có phân loại, ngày, tìm kiếm/lọc đơn giản, phân trang.
- Bài viết có H1, ngày đăng/cập nhật đúng nghĩa, tác giả/đơn vị, ảnh/chú thích, nội dung đọc thoáng, liên quan theo chủ đề.
- Không đưa HTML thô vào excerpt; không cắt mất nội dung quyết định ở title.
- Sự kiện có ngày giờ, địa điểm/hình thức, trạng thái sắp diễn ra/đã diễn ra; archive khác thông báo đang mở.

### 8.9. FAQ, tìm kiếm, liên hệ và trang hệ thống

- FAQ nhóm theo câu hỏi thật; có liên kết sang trang chi tiết và hành động hỗ trợ.
- Search phân biệt ngành, bài viết, trang thông tin, tài liệu; có loading, empty, lỗi, tìm lại; giữ truy vấn khi quay lại.
- Liên hệ thể hiện đầu mối, giờ hỗ trợ nếu đã chốt, trung tâm và bản đồ mở theo nhu cầu; không tải nhiều bản đồ nặng ngay đầu.
- Form ngắn: tên, điện thoại, ngành; email/trình độ bổ sung khi thật sự cần. Có consent rõ, link chính sách dùng được, lỗi ngay trường, giữ dữ liệu khi lỗi, chống gửi lặp, thông báo kết quả đúng trạng thái hệ thống.
- 404 có tìm kiếm và lối về ngành/tuyển sinh; trang chính sách có bản đang áp dụng; trạng thái thiếu dữ liệu/lỗi không dẫn vào ngõ cụt.

**Đầu ra:** thiết kế desktop/mobile của tất cả mẫu, trạng thái tương tác, nội dung thật, hướng dẫn responsive.

**Chủ trì:** UX/UI; nội dung, frontend và QA cùng rà soát.

**Nghiệm thu:** không còn mẫu trang chưa thiết kế; 5 ngành dùng một hệ thống; có cả nội dung dài/thiếu ảnh/lỗi/không kết quả; mỗi trang có mục tiêu và bước tiếp theo rõ.

## 9. Phase 5 — Prototype, thử nghiệm và sửa thiết kế

**Mục tiêu:** phát hiện nhầm lẫn trước khi nhân rộng vào mã nguồn.

- Làm prototype luồng chọn ngành, xem học phí, kiểm tra hình thức/cấp bằng, tìm kỳ đang mở, tư vấn và chuyển sang xét tuyển; bản mobile là bắt buộc.
- Mời khoảng 6–8 người phù hợp các nhóm ưu tiên. Đây là nghiên cứu định tính, không dùng mẫu nhỏ để tuyên bố tỷ lệ thành công toàn bộ người học.
- Nhiệm vụ: tìm ngành phù hợp; xác định đơn vị cấp bằng và cách học/thi; tìm chi phí đúng đối tượng; tìm hạn hồ sơ; gửi tư vấn; tìm dịch vụ sinh viên nếu thuộc nhóm đang học.
- Ghi nhận hoàn thành độc lập, thời gian, đường đi sai, điểm do dự, thông tin còn thiếu và mức tự tin sau khi đọc.
- Mục tiêu nội bộ: ít nhất 80% lượt thực hiện nhiệm vụ lõi hoàn thành không cần trợ giúp; thông tin lõi tìm trong khoảng 60–90 giây. Báo cáo số lượt và bối cảnh, không chỉ phần trăm.
- Sửa các nhầm lẫn về hình thức học, học phí, văn bằng và CTA trước khi chốt triển khai; thử lại các luồng thay đổi đáng kể.
- Chốt thiết kế nền và quy trình yêu cầu thay đổi để tránh sửa phong cách liên tục trong khi lập trình.

**Đầu ra:** prototype, kịch bản, ghi nhận nghiên cứu, danh sách sửa, bản thiết kế đã điều chỉnh.

**Chủ trì:** UX; tuyển sinh hỗ trợ tuyển người tham gia.

**Nghiệm thu:** không còn nhầm lẫn nghiêm trọng trong luồng lõi; mọi vấn đề chưa xử lý có mức ưu tiên và quyết định rõ.

## 10. Phase 6 — Triển khai design system và khung website

- Đọc hướng dẫn Next.js đi kèm phiên bản trong `node_modules/next/dist/docs/` trước khi viết mã liên quan; không áp dụng máy móc API từ phiên bản khác.
- Hợp nhất token, chuyển semantic brand từ vàng sang navy theo hướng đã chốt; giữ màu logo và màu trạng thái theo vai trò.
- Xây component mẫu dùng chung, trang xem component nội bộ/staging và trạng thái; không bắt buộc thêm một nền tảng component mới nếu không cần.
- Triển khai header, mega menu, mobile nav, search entry, footer và chiến lược sticky CTA.
- Chuẩn hóa container, section, typography, card, image, form, accordion, document và navigation states.
- Rà server/client boundaries, tải font/ảnh và reduced motion; chỉ tải tương tác cần thiết.
- Đối chiếu thiết kế ở 360/390/768/1024/1440px, thêm 320px để kiểm tra reflow; thử các bề rộng trung gian.

**Đầu ra:** bộ component chạy được, khung toàn site, token thống nhất, mẫu trang kiểm chứng.

**Chủ trì:** frontend; UX kiểm tra hình ảnh và tương tác.

**Nghiệm thu:** các component có đầy đủ trạng thái; menu bàn phím/chạm hoạt động; không có xung đột sticky; chưa đưa CSS mới làm biến dạng admin ngoài phạm vi đã thống nhất.

## 11. Phase 7 — Triển khai các trang công khai và tích hợp

Thứ tự triển khai:

1. Trang chủ, danh mục ngành, một trang ngành hoàn chỉnh làm mẫu.
2. Nhân rộng sang các ngành còn lại sau khi mẫu đạt yêu cầu.
3. Tuyển sinh, học phí, FAQ, tư vấn và liên kết cổng xét tuyển.
4. Giới thiệu, trải nghiệm học, chất lượng/công khai, trung tâm.
5. Tin tức, sự kiện, bài chi tiết, tìm kiếm, chính sách và 404.

**Công việc kỹ thuật và nội dung**

- Kết nối dữ liệu chuẩn, loại bỏ danh sách ngành và liên hệ lặp rời rạc.
- Duy trì URL hiện hành khi phù hợp; triển khai redirect có bảng đối chiếu nếu đổi.
- Sửa các luồng: nút hồ sơ, nguồn văn bản, dữ liệu form, lỗi API, gửi trùng, trạng thái hết hạn.
- Ảnh thật có phiên bản desktop/mobile, kích thước và crop hợp lý; hình thức hiển thị dự phòng khi nguồn ảnh lỗi.
- Search chỉ tìm nội dung được công khai; không lẫn admin, bản nháp, lead hoặc dữ liệu nội bộ.
- Thiết lập metadata, canonical, sitemap, robots, social preview; schema theo dữ liệu thực, không tự gắn review/rating không có cơ sở.
- Giữ HTML nội dung được xử lý an toàn; làm sạch excerpt và entity theo ngữ cảnh, không giải quyết lỗi bằng cách render HTML không kiểm soát.
- Triển khai analytics từ đầu các luồng, kiểm tra trong staging; không chờ phát hành xong mới định nghĩa sự kiện.
- Chỉ hiển thị đăng ký thành công sau khi hệ thống nhận được dữ liệu; trạng thái này không đồng nghĩa đã trúng tuyển.

**Đầu ra:** toàn bộ mẫu trang và nội dung phát hành chạy trên staging.

**Chủ trì:** kỹ thuật; UX kiểm tra sau từng nhóm, nội dung đối chiếu dữ liệu.

**Nghiệm thu:** tất cả URL thuộc phạm vi có nội dung và đích đến thật; 5 ngành dùng mẫu chung; toàn bộ hành trình lõi hoạt động; desktop/mobile khớp quy tắc đã chốt.

## 12. Phase 8 — Hoàn thiện CMS và quy trình cập nhật

**Mục tiêu:** đội Topica cập nhật được website mà không phá bố cục hoặc công bố thông tin thiếu căn cứ.

**Mô hình nội dung đề xuất**

| Loại dữ liệu | Trường quan trọng |
|---|---|
| Thông tin đơn vị | Tên, quan hệ tổ chức, hotline/email theo vai trò, địa chỉ, mạng xã hội đã xác nhận |
| Chương trình | ID, slug, tên chính thức/chuyên ngành, mã, hình thức, văn bằng, đơn vị cấp, thời gian, tín chỉ, nội dung, nguồn và người rà soát |
| Kỳ tuyển sinh | Chương trình áp dụng, bắt đầu, hạn, khai giảng, trạng thái, link xét tuyển, tài liệu |
| Học phí | Chương trình/khóa/đối tượng, đơn giá, khoản khác, hiệu lực, chính sách, tài liệu nguồn |
| Tài liệu | Tên, file, loại, ngày ban hành/hiệu lực, phiên bản, đơn vị quản lý, liên kết thay thế |
| Tin/sự kiện | Loại nội dung, ngày đăng, ngày sự kiện, thời hạn nổi bật, tác giả/đơn vị, trạng thái |
| Người học/đối tác | Nội dung đã duyệt, ảnh/logo, phạm vi quan hệ hoặc bối cảnh, quyền sử dụng |

- Bổ sung draft/preview/review/publish/archive theo vai trò thực tế; phân quyền phải có hiệu lực ở server, không chỉ ẩn nút.
- Có lịch xuất bản và hết hạn khi nghiệp vụ cần; quy định cache và đồng bộ để thay đổi xuất hiện đúng hạn.
- Nội dung học phí/tuyển sinh có nhật ký thay đổi và người duyệt. Nhân sự hỗ trợ không phải tự sửa mã nguồn.
- Media có alt, crop/focal point, caption, loại và dung lượng phù hợp; kiểm tra file và quyền truy cập.
- Bảng quản trị báo mục sắp hết hạn, thiếu tài liệu, cần rà soát; không yêu cầu biên tập viên tự nhớ.
- UI admin có trạng thái lưu/đang lưu/lỗi, cảnh báo rời trang khi chưa lưu, preview; không báo lưu thành công nếu API thất bại.
- Lead có nguồn trang, chương trình và trạng thái xử lý; chỉ thu thập dữ liệu cần thiết, phân quyền đúng người.
- Cập nhật tài liệu CMS/kiến trúc theo luồng đang chạy; có hướng dẫn khôi phục DB và ảnh.
- Không mặc định đổi SQLite nếu mô hình triển khai hiện tại đáp ứng. Nếu cần nhiều instance hoặc hạ tầng không có ổ đĩa bền vững, đánh giá lưu trữ/DB trước phát hành bằng yêu cầu vận hành thực tế.

**Đầu ra:** CMS cấu hình được nội dung cần duy trì, hướng dẫn biên tập và ma trận người chịu trách nhiệm.

**Chủ trì:** kỹ thuật CMS; nội dung thực hiện nghiệm thu nghiệp vụ.

**Nghiệm thu:** biên tập viên tự tạo một kỳ tuyển sinh, cập nhật học phí, thay ảnh, đăng tin và hết hạn thông báo trong staging; thay đổi đã duyệt xuất hiện đúng nơi và thời điểm; dữ liệu mẫu không tự trở thành nội dung công khai.

## 13. Phase 9 — QA tổng thể, hiệu năng và nghiệm thu

### 13.1. Giao diện và responsive

- Kiểm tra tất cả mẫu ở 320/360/390/768/1024/1440px và bề rộng trung gian; Chrome/Edge, Safari trên iPhone và Chrome trên Android theo thiết bị sẵn có.
- Nội dung dài, tiêu đề nhiều dòng, danh mục trống, ảnh lỗi, tài liệu thiếu, API lỗi, mạng chậm.
- Không cuộn ngang toàn trang; bảng rộng có giải pháp đọc riêng; không dùng overflow hidden chỉ để che lỗi layout.
- Header, mục lục, sticky CTA và bàn phím không che nội dung hay nút; zoom 200% vẫn dùng được; kiểm tra reflow ở điều kiện phù hợp.
- So sánh ảnh thiết kế với màn hình thật theo component, khoảng cách, chữ, crop ảnh và trạng thái.

### 13.2. Khả năng tiếp cận

- Mục tiêu WCAG 2.2 AA cho các tiêu chí áp dụng; kiểm tra tự động kết hợp thủ công, không xem axe pass là chứng nhận toàn website.
- Chữ thường tương phản tối thiểu 4.5:1, chữ lớn 3:1; điều khiển và focus đáp ứng yêu cầu áp dụng.
- Mục tiêu vùng chạm nội bộ 44×44px cho nút chính và thao tác mobile; đây là mục tiêu tiện dụng cao hơn mức tối thiểu 24×24px của WCAG 2.2 AA trong các trường hợp áp dụng.
- Kiểm tra Tab/Shift+Tab/Enter/Space/Escape, focus khi mở/đóng menu/dialog, skip link, label/error, tên liên kết, screen reader cho luồng chính, reduced motion, caption video.

Tham chiếu: https://www.w3.org/WAI/WCAG22/quickref/

### 13.3. Chức năng, dữ liệu, bảo vệ thông tin

- Form validation ở client/server; submit hợp lệ, timeout, lỗi mạng, gửi lặp, consent và trạng thái lưu; dữ liệu thử có thể nhận diện trong staging.
- Kiểm tra toàn bộ liên kết nội bộ, tài liệu, hotline, mail, external CTA; không còn `#` giả chức năng.
- Kiểm tra thời điểm bắt đầu/hết hạn, timezone, publish/unpublish và cache invalidation; thông báo đóng không còn được đề xuất như đang mở.
- Nội dung nháp/tài khoản admin/lead không xuất hiện qua search, sitemap hoặc API công khai không phù hợp.
- Kiểm tra phân quyền, upload, sanitization và những luồng quản trị bị thay đổi; không mở rộng thành một dự án pentest riêng nếu phạm vi không yêu cầu.

### 13.4. Hiệu năng và tìm kiếm

- Đo trên production build/staging với cấu hình thiết bị và mạng ghi rõ; xem từng mẫu trang, không chỉ trang chủ.
- Mục tiêu Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 tại percentile 75 khi có dữ liệu thực đủ tin cậy. Trước phát hành dùng đo lab và kiểm tra tương tác làm chỉ báo; không tuyên bố đã đạt INP thực từ một điểm Lighthouse.
- Rà ảnh đầu trang, font, JS tương tác, video, bản đồ, layout shift, cache và tài nguyên ngoài.
- Lighthouse mobile ≥90 là mục tiêu lab tham khảo cho các mẫu chính trong cấu hình thống nhất; không thay thế Core Web Vitals hoặc trải nghiệm thiết bị thật.
- Kiểm tra canonical/redirect/indexing/sitemap/metadata/social image; staging không bị index, production được cấu hình đúng.

Tham chiếu: https://web.dev/articles/vitals

### 13.5. Cách chạy kiểm tra

- Dùng các kiểm tra hiện có: format, typecheck, lint, unit test phù hợp, production build, E2E và SEO.
- Thay script `test:links`, `test:a11y`, `test:lighthouse` đang là placeholder bằng kiểm tra có kết quả và lỗi thực.
- Bổ sung kiểm thử giá trị cao: hết hạn thông báo; thông tin ngành thống nhất; form lưu thật trong môi trường test; phân quyền xuất bản; tài liệu và URL; sticky/menu/focus; ảnh chụp các mẫu quan trọng.
- Không viết test chỉ để kiểm tra lại các class CSS hay tên khẩu hiệu đã chốt; cập nhật test cũ để xác minh hành vi mới.

**Đầu ra:** báo cáo QA, lỗi đã xử lý, ma trận thiết bị, kết quả UX/hiệu năng/khả năng tiếp cận, biên bản nghiệm thu nghiệp vụ.

**Chủ trì:** QA; UX và kỹ thuật sửa lỗi; Topica xác nhận nội dung.

**Điều kiện qua phase:** không còn P0/P1 chưa giải quyết; dữ liệu quan trọng và luồng lõi đã nghiệm thu; P2 còn lại có người xử lý, thời hạn và chấp thuận rõ.

## 14. Phase 10 — Phát hành, bàn giao và ổn định

- Chốt bản release, nội dung, danh sách URL và những thay đổi DB; đóng băng các thay đổi ngoài kế hoạch phát hành.
- Sao lưu DB, ảnh, tài liệu và cấu hình cần thiết; kiểm chứng khả năng khôi phục trên môi trường phù hợp, không chỉ tạo file backup.
- Chuẩn bị rollback gồm ứng dụng và dữ liệu; migration phải có phương án tương thích hoặc phục hồi rõ.
- Kiểm tra domain, TLS, mail/link liên hệ, persistent storage, giới hạn upload và cấu hình production.
- Có quyết định phát hành từ đầu mối Topica sau khi bản staging và bằng chứng nghiệm thu đã sẵn sàng.
- Triển khai, smoke test trang chủ → ngành → học phí → tư vấn → xét tuyển; xác nhận lead thử có kiểm soát đến đúng nơi.
- Xác nhận lịch hết hạn, cache, redirect, sitemap, robots và analytics trên production.
- Bàn giao hướng dẫn cập nhật, trách nhiệm vận hành, xử lý sự cố, backup/restore và danh sách hạng mục còn lại.
- Theo dõi sát 48–72 giờ đầu: form, lỗi server/client, tài liệu, tốc độ, nội dung và hoạt động của admin.

**Nghiệm thu:** site production đúng bản đã duyệt; luồng lõi thông suốt; đội Topica thực hiện được thao tác quản trị; có đầu mối hỗ trợ và rollback đã chuẩn bị.

## 15. Phase 11 — Đo lường và tối ưu 30 ngày sau phát hành

**Sự kiện cần đo**

| Sự kiện | Mục đích |
|---|---|
| view_program | Người dùng thực sự xem trang ngành nào |
| view_tuition | Nhu cầu thông tin học phí |
| click_consultation | Ý định hỏi tư vấn theo trang/vị trí |
| lead_form_start | Bắt đầu điền form |
| lead_submit_success | Hệ thống nhận thành công; không đo chỉ theo click nút |
| lead_submit_error | Phát hiện bước thất bại |
| outbound_apply_click | Chuyển sang cổng xét tuyển; không coi là hoàn tất hồ sơ |
| document_open | Mức sử dụng tài liệu |
| search_zero_results | Khoảng trống tìm kiếm/nội dung |

Không đưa tên, điện thoại, email hoặc nội dung nhập tự do vào analytics. Tham số URL không được ghi nguyên trạng nếu có thể chứa thông tin cá nhân; thiết kế whitelist trường đo. Việc theo dõi kết quả nộp hồ sơ ở cổng ngoài cần cơ chế chia sẻ dữ liệu được thống nhất; nếu chưa có chỉ báo cáo outbound click.

**Lịch theo dõi**

- Ngày 1–3: xử lý lỗi và ổn định form, nội dung, cache.
- Tuần 1: xem hành trình mobile, lỗi form, tìm kiếm rỗng và phản hồi tư vấn viên.
- Tuần 2: sửa điểm cản trở đọc/tìm hiểu đã có bằng chứng.
- Tuần 3–4: đánh giá chất lượng lead, khả năng tìm thông tin, hiệu năng thực và khả năng vận hành CMS.
- Ngày 30: báo cáo kết quả, backlog quý tiếp theo, quyết định tính năng bổ sung.

So sánh trước/sau có xét nguồn traffic, mùa tuyển sinh và thiết bị. Không cam kết tăng chuyển đổi một tỷ lệ cụ thể khi chưa có baseline. Chỉ A/B test khi lượng truy cập và cách đo đủ; nếu chưa đủ, dùng nghiên cứu định tính và sửa vấn đề có bằng chứng.

## 16. Backlog ưu tiên có thể chuyển thành ticket

| ID | Công việc | Ưu tiên | Phase | Hoàn thành khi |
|---|---|---|---|---|
| DATA-01 | Thống nhất danh bạ và liên kết chính thức | P1 | 1, 7, 8 | Header/footer/form/schema dùng cùng dữ liệu đã duyệt |
| DATA-02 | Xác minh hình thức, văn bằng, lịch học từng ngành | P0/P1 theo ảnh hưởng | 1 | Có nguồn và cách trình bày nhất quán đúng phạm vi |
| DATA-03 | Học phí có phiên bản, hiệu lực và đối tượng | P1 | 1, 8 | Không còn giá trị quan trọng hard-code rời rạc |
| DATA-04 | Loại bỏ dữ liệu minh họa trong fallback xuất bản | P1 | 1, 8 | Thiếu dữ liệu không sinh tên/số liệu mẫu công khai |
| UX-01 | Sitemap/menu/CTA theo nhu cầu | P1 | 2, 4, 6 | Luồng tìm ngành, học phí, xét tuyển không nhầm |
| UX-02 | Hero sáng, ảnh thật, tiêu đề responsive | P1 | 3, 4, 7 | Không ngắt dòng bất hợp lý; CTA và thông điệp rõ |
| UX-03 | Mẫu trang ngành dùng chung | P1 | 4, 7 | 5 ngành đủ dữ liệu lõi và cấu trúc thống nhất |
| UX-04 | Form ngắn và đầy đủ trạng thái | P1 | 4, 7 | Lỗi dễ sửa, gửi thành công lưu thật, không gửi lặp |
| UX-05 | Một chiến lược sticky trên mobile | P1 | 4, 6 | Nội dung, bàn phím và focus không bị che |
| UI-01 | Hợp nhất design tokens navy | P1 | 3, 6 | Một nguồn định nghĩa có semantic rõ |
| UI-02 | Chuẩn hóa ảnh, chữ, khoảng cách và card | P2 | 3, 6, 7 | Các mẫu có cùng ngôn ngữ thị giác |
| CMS-01 | Lịch thông báo và hết hạn | P1 | 8 | Đúng ngày/trạng thái/cache ở Asia/Bangkok |
| CMS-02 | Preview, duyệt, phân quyền, nhật ký | P1 | 8 | Luồng biên tập có hiệu lực server và nghiệm thu |
| CONTENT-01 | Sửa entity, excerpt và tài liệu `#` | P1 | 1, 7 | Đọc sạch, xem/tải được tài liệu thật |
| CONTENT-02 | Bộ ảnh và câu chuyện người học thật | P2 | 1, 4, 7 | Có nguồn/quyền dùng/bối cảnh |
| QA-01 | Links/a11y/performance thực chất | P1 | 9 | Lệnh kiểm tra có báo cáo và phát hiện lỗi |
| QA-02 | Nghiệm thu 6 luồng chính trên thiết bị | P1 | 5, 9 | Hoàn thành tác vụ và sửa nhầm lẫn quan trọng |
| OPS-01 | Backup/restore/release/rollback | P1 | 10 | Thử khôi phục và có người chịu trách nhiệm |
| MEASURE-01 | Sự kiện hành trình và chất lượng lead | P2 | 7, 11 | Đo đúng kết quả và không gửi PII |

Ưu tiên trong bảng là phân loại ban đầu; phase 0 quyết định mức nghiêm trọng dựa trên chương trình và thông tin chính thức.

## 17. Những điểm cần quyết định ở các mốc

1. Cuối phase 1: nguồn thông tin chương trình, học phí, đơn vị cấp bằng và dữ liệu có thể công bố.
2. Cuối phase 2: nhóm người học ưu tiên, sitemap và hành trình.
3. Cuối phase 3: một hướng thiết kế và hệ navy.
4. Cuối phase 5: prototype đã sửa sau thử nghiệm, mẫu trang chuẩn để triển khai.
5. Cuối phase 9: nội dung và hành vi đạt nghiệm thu, bản release sẵn sàng.
6. Phase 10: thời điểm phát hành và người vận hành.

Các mốc là cách quản lý dự án đề xuất. Không cần ban lãnh đạo duyệt từng margin, màu hover hoặc thao tác triển khai có thể đảo ngược; người phụ trách được chủ động trong phạm vi đã chốt.

## 18. Định nghĩa website đã hoàn thiện

- [ ] Mọi URL trong phạm vi được giữ, sửa, gộp hoặc chuyển hướng có chủ đích.
- [ ] Mọi ngành hiện hành có thông tin lõi được xác nhận, không còn mâu thuẫn chưa giải thích.
- [ ] Học phí, lịch tuyển sinh, liên hệ và tài liệu có nguồn quản lý thống nhất.
- [ ] Tất cả nhóm trang dùng chung hệ navy, chữ, ảnh và component.
- [ ] Người học hoàn thành các luồng lõi trên điện thoại và desktop.
- [ ] Không có CTA sai chức năng, tài liệu giả, thông báo hết hạn vẫn mang trạng thái đang mở.
- [ ] Form và cổng ngoài được phân biệt đúng; dữ liệu tư vấn đến đúng hệ thống.
- [ ] CMS cho phép đội Topica cập nhật các nội dung thay đổi thường xuyên.
- [ ] Kiểm tra kỹ thuật, responsive, khả năng tiếp cận và hiệu năng có bằng chứng.
- [ ] Không còn lỗi P0/P1 chưa giải quyết; phần còn lại có chủ sở hữu và lịch xử lý.
- [ ] Production, backup, rollback, analytics và hướng dẫn vận hành đã bàn giao.
- [ ] Sau 30 ngày có đánh giá dựa trên hành vi, chất lượng thông tin và phản hồi người học.

## 19. Nguồn tham khảo

- Khảo sát website hiện tại: http://localhost:3000/ và các nhóm trang được đọc trong dự án.
- BUV: https://buv.edu.vn/vi
- RMIT: https://www.rmit.edu.vn/
- PXU E-LIB: https://elib.pxu.edu.vn/
- PXU Assessment: https://assessment.pxu.edu.vn/
- W3C WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Google Web Vitals: https://web.dev/articles/vitals

Các kích thước, lịch, KPI nghiên cứu và mục tiêu lab trong tài liệu là đề xuất của dự án; các tiêu chí WCAG/Core Web Vitals được dẫn nguồn riêng. Kế hoạch cần được cập nhật sau phase 0 dựa trên nguồn lực, dữ liệu và phạm vi thực tế.
