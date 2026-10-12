# Đặc tả thiết kế và UI/UX Topica

Áp dụng cho R08–R15, R19–R24. Đây là hợp đồng thiết kế khởi điểm. Agent có thể điều chỉnh thông số khi có screenshot/test chứng minh cải thiện, nhưng phải ghi decision; không đổi phong cách tùy ý giữa các trang.

## 1. Hướng thiết kế chủ đạo

**Học thuật, hiện đại, gần gũi, minh bạch.** Trang có nhịp điệu biên tập rõ, ảnh thật đủ lớn để thấy con người, vùng đọc thoáng và dữ liệu quyết định dễ tìm. Giữ cá tính Topica với hai navy; không dùng một tập hợp card và icon lặp lại thay cho câu chuyện giáo dục.

Ưu tiên người đi làm tìm chương trình phù hợp, người học/phụ huynh cần kiểm chứng và sinh viên đang học cần dịch vụ. Nội dung giải đáp lần lượt: học gì → cách học/thi → ai cấp bằng → chi phí/điều kiện → kỳ tuyển sinh → bước tiếp theo.

### Bảng màu và phân cấp

| Vai trò         | Giá trị khởi điểm                | Quy tắc                                                                             |
| --------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Navy chính      | `#00264D`                        | Header/footer, tiêu đề, nút chính trên nền sáng                                     |
| Navy phụ        | `#16466B`                        | Section phụ, icon, nhấn nội dung; không đặt chữ navy chính lên navy phụ nếu chưa đo |
| Nền chính       | `#FFFFFF`                        | Phần lớn vùng đọc                                                                   |
| Nền phụ         | `#F3F6FA`                        | Phân đoạn nhẹ, bảng/khối thông tin                                                  |
| Chữ chính       | `#243447`                        | Body trên nền sáng                                                                  |
| Chữ tiêu đề     | Navy chính hoặc ink đã chuẩn hóa | Không mỗi template một màu                                                          |
| Gold            | `#B78744`                        | Giữ nhận diện logo, chi tiết nhỏ; CTA chỉ dùng khi có lý do và tương phản đo thật   |
| Semantic states | Theo token được kiểm tra         | Luôn có chữ/icon, không chỉ dùng màu                                                |

Nền sáng chiếm phần lớn chiều dài trang, navy tạo cấu trúc. Không phủ cả website bằng navy tối; không dùng gold làm mặc định cho link, viền và toàn bộ heading. Đây là định hướng thị giác, không phải tỷ lệ diện tích bắt buộc.

Nút trên nền navy dùng nền trắng/chữ navy hoặc accent có tương phản phù hợp; đo cả default/hover/focus/disabled. Không đặt class override màu chữ khiến biến thể button mất tương phản.

### Typography và khoảng cách

- Giữ tối đa hai font chính đang có: Be Vietnam Pro cho UI/body; Lora chọn lọc cho H1/thông điệp học thuật. Tên ngành dài ưu tiên kiểu dễ đọc, không ép serif trên mọi card.
- Body 16–18px, line-height 1.6–1.75; metadata 13–14px khi đủ tương phản. Không dùng chữ 10–12px cho thông tin chi phí/điều kiện quyết định.
- H1 trang chủ desktop khởi điểm 48–64px, mobile 32–40px; trang con desktop 40–48px, mobile 30–36px. H2 28–36px desktop, 24–30px mobile. Kích thước linh hoạt theo nội dung, không cố đạt con số nếu gây gãy dòng.
- Tiêu đề tiếng Việt sentence case; không CSS uppercase toàn bộ tên ngành hoặc bài viết. Không để dấu gạch ngang/dấu câu thành dòng riêng; không chèn `<br>` cố định để sửa một viewport rồi làm hỏng viewport khác.
- Container 1200–1280px, lề 16px tại 320–390px và 24px từ tablet khi phù hợp; grid desktop 12 cột, tablet 8, mobile 4.
- Thang spacing theo bước 4/8px; section desktop khởi điểm 64–96px, mobile 40–56px; khoảng cách tiêu đề–mô tả–nội dung nhất quán.
- Vùng đọc bài dài khoảng 60–75 ký tự/dòng, không kéo đoạn văn qua toàn màn hình; số liệu và bảng cần layout riêng.
- Radius nhỏ/nhất quán: 4/8/12px; card lớn có thể 16px nếu nằm trong thang. Shadow nhẹ, không áp shadow dày cho mọi khối.

### Ảnh và chuyển động

- Hero, môi trường học, giảng viên và câu chuyện người học ưu tiên ảnh Topica/PXU có quyền sử dụng; lập manifest nguồn/quyền/alt/focal point.
- Chưa có ảnh: dùng bố cục không ảnh đã thiết kế, không đưa ảnh người do AI tạo thành sinh viên/giảng viên thật. Không tự lấy ảnh BUV/RMIT làm ảnh Topica.
- Logo đối tác phải có nguồn, phạm vi quan hệ và tên chính xác. Thiếu thông tin thì chưa xuất bản khối đó; không dùng “Đối tác 6” làm bằng chứng uy tín.
- Hero desktop có thể dùng crop 16:9, mobile crop 4:3 hoặc 3:4 theo chủ thể; lưu focal point thay vì để mặt bị cắt. Tỷ lệ minh họa không bắt buộc cho mọi asset.
- Kích thước ảnh được giữ trước tải; ảnh đầu trang tối ưu LCP theo guide Next hiện tại; ảnh dưới fold tải phù hợp. Không autoplay video có âm thanh hoặc slider chứa thông tin tuyển sinh thiết yếu.
- Motion 150–250ms cho phản hồi UI; nội dung đọc không phụ thuộc animation. Reduced motion tắt hiệu ứng không cần thiết. Không thêm parallax/3D để làm “bắt mắt”.

## 2. Khung chung và tương tác

### Header và menu

- Desktop: logo, 6 nhóm điều hướng hiện có sau khi R07 xác nhận và một CTA xét tuyển. Nhãn không chen chúc hoặc tự chia thành nhiều dòng bất hợp lý; đổi breakpoint trước khi desktop menu hết chỗ.
- Utility: tuyển sinh, sinh viên và thư viện được đặt nhãn đúng chức năng; mobile ưu tiên ít mục thiết yếu, không thu chữ quá nhỏ để nhét đủ.
- Sticky header gọn, không nhảy chiều cao gây dịch nội dung; `scroll-margin`/offset đảm bảo anchor không bị che.
- Mega menu mở bằng chuột, bàn phím và click; `Escape` đóng; link thật vẫn hoạt động. Không tự dùng ARIA application menu nếu đây chỉ là điều hướng site; semantics theo hành vi thật.
- Mobile drawer: tên rõ, nút đóng, khóa cuộn nền, focus vào vị trí hợp lý; giữ focus trong drawer nếu modal; đóng trả focus về nút mở; nội dung nền không nhận Tab khi bị che.
- Chỉ giữ một CTA nổi mobile ở một thời điểm. Drawer/search/form dialog ưu tiên cao hơn sticky CTA; không chồng `FloatingActions` lên nút submit.
- Bàn phím ảo: quan sát focus và viewport khi cần, đảm bảo submit nhìn/nhấn được; không chỉ dùng `scrollY > 300` để tuyên bố đã xử lý keyboard.

### CTA và form

| Nhãn              | Hành vi                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Xem ngành học     | Đi đến danh mục hoặc section ngành có anchor thật                                          |
| Nhận tư vấn       | Đến form ngắn/context phù hợp, không mở cổng xét tuyển                                     |
| Đăng ký xét tuyển | Đi tới cổng xét tuyển đã xác nhận, ghi rõ mở hệ thống ngoài nếu cần                        |
| Tra cứu hồ sơ     | Chỉ xuất hiện khi có đích tra cứu thật; không giả lập chức năng bằng link tới landing page |
| Xem/Tải tài liệu  | Nhận đúng trang/file được mô tả, không download HTML dưới nhãn PDF                         |

Một vùng hành động có tối đa 1 primary + 1 secondary. Không đổi cùng một hành động thành nhiều tên gây nhầm. Chiều cao thao tác mobile mục tiêu 44px trở lên, nút submit khởi điểm 48px; vùng chạm phải tách đủ để không nhấn nhầm.

Form tư vấn mặc định: họ tên, điện thoại, ngành quan tâm; consent bắt buộc. Email/trình độ tùy chọn hoặc hỏi khi thực sự cần. Có lựa chọn “Chưa xác định ngành” với giá trị hợp lệ riêng; không gán ngầm cho ngành đầu tiên.

Label luôn nhìn thấy; `autocomplete`, `inputmode`, loại input phù hợp; dấu bắt buộc có nghĩa rõ. Không ép số điện thoại thành number làm mất số 0. Validation client/server cùng hợp đồng; lỗi gắn trường và bản tóm tắt có thể tới trường. Không xóa dữ liệu khi lỗi/timeout.

Các trạng thái phải thiết kế: idle, đang gửi, thành công, lỗi trường, lỗi server, mạng chậm/mất mạng, gửi lặp. Thành công chỉ khi backend xác nhận lưu; diễn đạt đây là tiếp nhận tư vấn, không phải trúng tuyển. Cam kết thời gian phản hồi chỉ công bố nếu Topica xác nhận khả năng vận hành.

## 3. Đặc tả từng template

| ID  | Template                        | Nội dung bắt buộc và mục tiêu                                                  |
| --- | ------------------------------- | ------------------------------------------------------------------------------ |
| T01 | Trang chủ                       | Hiểu Topica, thấy ngành/kỳ hiện hành, tìm bằng chứng, bước tiếp theo rõ        |
| T02 | Danh mục ngành                  | Đủ 5 ngành hiện hành, tên/chuyên ngành tách rõ, chọn được ngành phù hợp        |
| T03 | Chi tiết ngành                  | Thông tin nhanh, học/thi, chương trình, bằng cấp, chi phí, điều kiện, FAQ, CTA |
| T04 | Tuyển sinh/kỳ tuyển sinh        | Phạm vi/đối tượng, ngày hiệu lực, trạng thái, hồ sơ, các bước, tài liệu        |
| T05 | Học phí/học bổng                | Chính sách đúng khóa/đối tượng, cách tính, phí khác, điều kiện và nguồn        |
| T06 | Giới thiệu/chất lượng/công khai | Quan hệ tổ chức, nguồn thông tin và tài liệu theo thời kỳ                      |
| T07 | Trải nghiệm học tập             | Một tuần học, cách học/thi, nền tảng, hỗ trợ, thiết bị cần chuẩn bị            |
| T08 | Tin tức/sự kiện                 | Loại nội dung, thời gian, phân trang/lọc, phân biệt còn hiệu lực và lịch sử    |
| T09 | Bài viết                        | Heading, ngày, đơn vị, ảnh/caption, prose thoáng, liên quan có chủ đề          |
| T10 | FAQ/tìm kiếm                    | Tìm câu trả lời, giữ truy vấn, empty/error có lối tiếp tục                     |
| T11 | Liên hệ/hệ thống sinh viên      | Đúng kênh/giờ/phạm vi, dịch vụ có URL thật, form theo ngữ cảnh                 |
| T12 | Chính sách/404/thiếu nội dung   | Văn bản có phiên bản, 404 đúng status, tìm kiếm/đường về hữu ích               |
| T13 | CMS                             | Tạo/sửa/xem trước/duyệt/lịch/đính kèm/lỗi/quyền/ngăn xung đột                  |

### T01 — Trang chủ

Thứ tự khởi điểm: hero → thông báo tuyển sinh còn hiệu lực → 5 ngành → căn cứ tin tưởng → trải nghiệm học → học phí/lộ trình → câu chuyện người học → tin/sự kiện → liên hệ/form.

Hero desktop khởi điểm 560–680px, dùng ảnh rõ con người và vùng chữ có tương phản; không form dài mặc định. Không ép chiều cao cố định ở màn hình thấp/zoom. Trên mobile, thông điệp + CTA xuất hiện trước nội dung phụ; ảnh bổ trợ không đẩy CTA quá xa.

Hero nói đúng lợi ích và phạm vi đã xác nhận. Badge tổ chức không dùng thuật ngữ “trực thuộc/hợp tác/cấp bằng” tùy tiện. Không tự thêm con số học viên/tỷ lệ thành công.

Thông báo hiện hành có ngày/hạn/đối tượng và trạng thái tính từ dữ liệu. Không có kỳ mở: hiển thị nội dung trung tính và link thông tin/nhận tư vấn; không tự tạo “đang nhận hồ sơ”. Tin cũ vẫn đọc trong archive, bỏ ưu tiên khẩn cấp sau hết hạn.

Khối tin tưởng dùng ít bằng chứng rõ: đơn vị cấp bằng, thông tin công khai, đội ngũ/địa điểm thật. Thống kê chỉ hiển thị nếu có nguồn và mốc thời gian. Story có ảnh/quyền/bối cảnh; thiếu dữ liệu thì bỏ khối thay vì tạo người giả.

### T02–T03 — Ngành học

- 5 ngành không cần bộ lọc phức tạp. Tách tên chính thức/chuyên ngành trong card và H1; cân chiều cao bằng layout, không cắt tên quan trọng bằng ellipsis.
- Trang ngành theo thứ tự trong bảng; fact panel phải cùng nguồn với học phí/tuyển sinh. Hình thức học/thi, thời gian và đơn vị cấp bằng nhìn thấy sớm.
- Mục lục có anchor thật, responsive và không che nội dung; chỉ một sticky mobile. Học phần dài dùng accordion có heading/keyboard rõ.
- Curriculum, tín chỉ, miễn trừ và tổng học phí không ép chung cho mọi đối tượng. Cơ hội nghề nghiệp không hứa chức vụ/thu nhập nếu thiếu nguồn.

### T04–T05 — Tuyển sinh, học phí

- Kỳ tuyển sinh lưu riêng ngày mở/hạn/khai giảng, không trộn với 5 bước nhập học. Tối đa ưu tiên các kỳ phù hợp, link archive rõ.
- Học phí có năm/khóa/đối tượng/hiệu lực/nguồn; tổng dự kiến ghi giả định và khoản chưa gồm. Không mặc định 126 tín chỉ cho mọi người nếu chưa xác nhận.
- Mobile mặc định dùng thẻ từng ngành với đơn giá, tổng dự kiến và chi tiết; nếu giữ bảng, cột đọc được, cuộn có chỉ dẫn, heading không mất nghĩa. Mục tiêu đọc các con số chính mà không phải dò ngang toàn bảng.
- Học bổng có đối tượng, điều kiện, giá trị, thời hạn và cách xét; bỏ tag “Phổ biến nhất” nếu không có căn cứ.
- Document card: tên, loại, ngày thật, định dạng/dung lượng lấy từ metadata xác định được; tên dài không đẩy nút khỏi khung. File thiếu thì không hiện nút tải giả; không ghi ngày/MB tự nghĩ.

### T06–T12 — Nội dung và hỗ trợ

- Phân biệt trang tổng quan và bài chuyên sâu; không nhân bản cùng đoạn dài trên mọi trang.
- Chất lượng/công khai: nhóm tài liệu theo loại/năm, link đúng văn bản và kỳ; badge kiểm định có nguồn và phạm vi, không suy rộng.
- Trải nghiệm học: dùng ảnh/caption và lịch ví dụ có nhãn minh họa được duyệt; diễn đạt học online và thi/thực hành đúng chính sách.
- Tin/sự kiện có category, ngày đăng/ngày sự kiện và trạng thái riêng; không đổi ngày đăng thành “hôm nay” để trông mới. Excerpt là plain text đã xử lý entities, không lộ tag/shortcode.
- Article prose có H2/H3, ảnh/bảng tràn được xử lý, heading anchors có offset; nội dung liên quan theo chủ đề, không chỉ bài mới nhất.
- Search chỉ tìm public, không đưa draft/private/lead vào index; kết quả có loại/ngày nếu phù hợp; empty gợi ý ngắn, link ngành hoặc hỗ trợ; giữ query khi quay lại.
- FAQ theo câu hỏi thực; không nhét nội dung quyết định vào accordion đóng mặc định trên mọi trang.
- Liên hệ có vai trò từng hotline/email, giờ hỗ trợ đã xác nhận, địa điểm và nút mở bản đồ theo nhu cầu. E-LIB là thư viện; LMS/assessment là dịch vụ riêng, chỉ nối URL đã xác nhận.
- 404 là 404 thật; tài liệu thiếu có lối hỗ trợ; trang chính sách có phiên bản áp dụng. Không lộ nhãn nội bộ “chưa verified” hay stack trace cho người học.

### T13 — CMS

- Tổ chức theo nghiệp vụ: chương trình, kỳ tuyển sinh, học phí/học bổng, tài liệu, tin, media, contact, lead. Không bắt biên tập viên sửa HTML để đổi đơn giá hoặc hạn hồ sơ.
- Trạng thái bản nháp/đang duyệt/được duyệt/đặt lịch/đã công bố/lưu trữ nhìn rõ; thông tin chưa lưu khác thông tin đã công bố.
- Có xem trước đúng template mobile/desktop, nguồn và người duyệt; nút vượt quyền không hoạt động ở API.
- Form dài nhóm theo ý nghĩa; lỗi tới đúng tab/field; loading/save/error rõ; không toast “đã lưu” khi API lỗi. Cảnh báo rời trang chưa lưu và xung đột bản sửa.
- Dashboard ưu tiên sắp hết hạn, thiếu nguồn/tài liệu, cần duyệt; không chỉ tổng lượt xem.
- Media có preview, alt, caption, crop/focal point phù hợp; file lỗi/không đủ quyền hiện thông báo xử lý được.

## 4. Trạng thái và responsive bắt buộc

Mỗi template ghi rõ: populated, nội dung dài, thiếu ảnh/file, loading nếu có async, empty, server/network error, quyền không đủ nếu có, expired nếu có thời hạn. Trường hợp không áp dụng ghi lý do, không tạo màn hình giả chỉ để đủ checklist.

Kiểm tra 320/360/390/768/1024/1280/1440px; thêm kích thước giữa các breakpoint vừa sửa. Zoom 200%, reflow tương đương 320 CSS px, landscape và bàn phím ảo cho form. Không dùng `overflow-x: clip` để che phần bị tràn rồi tuyên bố không lỗi.

## 5. Điểm đánh giá thiết kế nội bộ

Chấm 0–2 cho từng mục: 0 = lỗi/chưa làm; 1 = dùng được còn vướng; 2 = rõ, nhất quán, được kiểm tra. Đây là rubric review, không phải nghiên cứu người dùng hay phần trăm hoàn thành.

1. Nhận diện hai navy và nhịp nền sáng.
2. Hierarchy: biết nội dung chính và bước tiếp theo.
3. Typography tiếng Việt, nội dung dài và xuống dòng.
4. Ảnh thật/crop/bối cảnh/quyền.
5. Minh bạch thông tin quyết định và nguồn.
6. CTA/form phân biệt đúng, ít cản trở.
7. Mobile đọc/nhấn được, không che/chồng.
8. Accessibility và đủ trạng thái.
9. Nhất quán giữa template và design system.
10. Chất lượng hoàn thiện: khoảng cách, align, icon, ảnh lỗi, border/shadow.

Mục tiêu nội bộ ≥18/20 trên T01/T03/T05 và ≥16/20 ở template còn lại, không mục nào 0. Lỗi nghiêm trọng không được bù bằng tổng điểm cao. Review kèm screenshot và nhận xét cụ thể; không tự chấm bằng việc có class CSS.
