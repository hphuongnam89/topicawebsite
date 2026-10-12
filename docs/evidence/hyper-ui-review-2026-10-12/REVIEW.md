# Đánh giá giao diện Topica theo Hyper UI — 12/10/2026

Status: review completed; findings open; không nghiệm thu R08/R23/release.

## Kết luận

Giao diện có nền tảng học thuật tốt, nhưng chưa đồng nhất và chưa tối ưu thứ tự thông tin để người học quyết định. Khối bento “Lý do chọn Topica” có nhịp tốt; màu navy, Lora và Be Vietnam Pro phù hợp. Ưu tiên tiếp theo là sửa nhãn/hành vi, thống nhất typography và rút ngắn hành trình mobile, trước khi bổ sung hiệu ứng.

## Phạm vi và bằng chứng

- Skill: `C:/Users/Hp/.gemini/config/skills/hyper-ui/SKILL.md`, v1.0.0; đã đọc cả bốn reference đi kèm.
- Đối chiếu README, DESIGN_UX_SPEC, ACCEPTANCE_AND_EVIDENCE, AGENT_HANDOFF và backlog R08–R11/R23. Dùng Hyper UI để đánh giá trong nhận diện Topica; không coi thiếu OKLCH/Shadcn/neon là lỗi người dùng.
- Build tái sử dụng: `completion-07`, ID `z-dfCLfZfOGKVHtq48mcX`, fingerprint `af766dbc76b773682110d1b05762c95c0b162a124e11a36c86c616543030c8ec`. 228 file đã có trong manifest khớp hash source hiện tại. Cây Git có nhiều thay đổi từ trước; không nhận những thay đổi đó là của lượt review.
- Server đánh giá riêng: localhost:3111, fresh migrated DB fixture, upload/backup riêng, notification stub; không copy DB thật. Node v24.19.0, Next 16.3.3. Manifest phiên đánh giá lưu cạnh báo cáo.
- Chrome desktop: trang chủ, danh mục ngành, chi tiết CNTT, học phí. Mobile mô phỏng 390×844: trang chủ, CNTT, học phí và menu. Trang chủ thêm 320, 375 và 768px. Desktop yêu cầu 1440×900; Chrome trả `innerWidth` 1441 trong một số mẫu, có scrollbar 15px. Dùng số đo thực trong JSON, không khẳng định viewport luôn chính xác 1440.
- Screenshot mới chỉ từng viewport, không phải full-page. Chụp full-page hai lần bị timeout CDP 5 giây; không dùng chúng làm evidence. Các ảnh PNG hiện hữu trong thư mục là ảnh đã lưu thành công.
- Tin tức/kỳ tuyển sinh của fixture trống; trang public dùng static fallback nơi được triển khai. Không suy diễn đây là toàn bộ dữ liệu production.

## Bốn lớp Hyper UI

| Lớp | Nhận xét | Hướng cải thiện |
| --- | --- | --- |
| 1. Structural blueprint | Hero chữ/ảnh chia đôi, bento có bất đối xứng; không phải toàn bộ site đều là ba card giống nhau. Tuy nhiên quy trình nhập học chiếm nhiều chỗ trước ngành học; nội dung tiếp tục lặp bằng các khối lớn. | Trang chủ theo nhịp Narrative Workflow: hiểu chương trình → chọn ngành → bằng chứng → chi phí/cách học → tư vấn. Trang ngành theo Long Document có mục lục. Danh mục theo Catalogue, học phí theo Tabular Spec Sheet. |
| 2. Core design system | Hai navy tạo nhận diện; body dễ đọc; mobile học phí chuyển thành thẻ. Nhưng trang ngành dùng chữ sans đen rất lớn và nền cream/gold, khác các trang Lora/navy; H1 mobile lệch thang. | Dùng cùng semantic tokens, thang heading và CTA xuyên template; giảm H1 trang con theo spec 30–36px khi phù hợp nội dung. |
| 3. Visual focus | Hero có ảnh lớn, bento có một cột navy tạo trọng tâm tốt. CTA nổi desktop dùng cyan/blue/red cạnh hệ navy/gold gây phân tán chú ý. Bằng chứng ảnh/đối tác chưa đủ ngữ cảnh. | Đầu tư ảnh có nguồn/quyền/caption, một điểm nhấn mỗi vùng; giảm màu phụ của CTA nổi. Không cần thêm aurora/beam/glass trên toàn site. |
| 4. Kinetic interactions | Menu mở/đóng, Escape trả focus và accordion hoạt động trong mẫu đã thử. Source có hover/active, stagger và AnimatePresence; chưa có trace chứng minh 60fps hay kiểm tra đầy đủ reduced motion. | Giữ motion nhẹ; kiểm tra reduced motion thực, nhất là marquee và animation JavaScript. Spring chỉ dùng nơi có lợi; không thay mọi transition chỉ để đúng công thức. |

## Findings và ưu tiên

| ID | Mức | Quan sát / evidence | Đề xuất / task |
| --- | --- | --- | --- |
| HUI-01 | P1 UX | `/cong-nghe-thong-tin`: “Xem trạng thái hồ sơ” dẫn tới `#chuong-trinh`; đã click và thấy khung chương trình, không phải tra cứu hồ sơ. `T03-desktop-top.png`, `T03-mislabelled-cta-destination.png`, `T03-mobile-metrics.json`; `components/program/ProgramHero.tsx:87`. | Đổi thành “Xem chương trình”; chỉ dùng nhãn tra cứu khi có chức năng/đích thật. R12/R14. |
| HUI-02 | P1 nội dung/UX, cần xác nhận nguồn | Fixture không có kỳ tuyển sinh nên trang chủ hiển thị trung tính, nhưng danh mục vẫn có badge “Đang tuyển sinh” cho 5 ngành. Hai thông điệp không dùng chung trạng thái. Quan sát AX của T01/T02; chưa kết luận ngoài thực tế không tuyển sinh. | Badge lấy từ cùng kỳ đang hiệu lực hoặc dùng nhãn không hàm ý thời hạn. R05/R13/R21. |
| HUI-03 | P2 | Mobile390: H1 trang chủ 36px, CNTT44px, học phí48px. Trang CNTT sans đen/cream và CTA nâu, trang học phí Lora, trang chủ navy. `T01-mobile-top.png`, `T03-mobile-top.png`, `T05-mobile-top.png`, ba metrics JSON. | Hợp nhất heading/semantic CTA; sửa responsive typography trước. R09/R12/R13. |
| HUI-04 | P2 | Mobile390: section ngành bắt đầu khoảng y=2467px; form tư vấn khoảng y=9220px; trang dài khoảng15203px ở trạng thái đo. Quy trình 5 bước trước ngành cao1481px. `T01-mobile-metrics.json`. Đây là vị trí layout, không phải thời gian người dùng hay tỷ lệ chuyển đổi. | Đưa ngành lên trước quy trình, rút gọn phần lặp; dùng CTA dẫn thẳng form có context. R08/R11. |
| HUI-05 | P2 | Utility tablet768: email sát liền “Cổng Elearning”; không có khoảng thở đủ giữa hai nhóm. `T01-768-top.png`. | Đổi breakpoint, bớt utility hoặc chia nhóm phù hợp thay vì cố nhét đủ. R10. |
| HUI-06 | P2 | Public CNTT có “Những gì đã được xác minh”, ghi chú “Sẽ cập nhật sau khi chốt bộ dữ liệu học phần cuối cùng”, và source filename `chương trình đào tạo-02.jpg`. Đây là ngôn ngữ kiểm kê nội bộ. DOM đọc trực tiếp; `ProgramQuickFacts.tsx:23`, `StudyRoadmap.tsx:30`. | Public dùng “Thông tin chương trình”, nguồn đọc được và ghi chú hữu ích cho hồ sơ; chuyển trạng thái biên tập vào CMS. R12/R21. |
| HUI-07 | P2 | Logo có alt “Đối tác 6” tới “Đối tác 9”; chưa thể hiểu tên/quan hệ từ alt. Source `PartnersSection.tsx:12`, DOM trang chủ. Ảnh hero hiện là bố cục màn hình ghép khuôn mặt/mascot; không có bằng chứng trong lượt này về quyền hoặc tính xác thực của người trong ảnh. | Xác nhận manifest ảnh/logo và quan hệ; dùng tên chính xác/caption. Chưa xác minh thì tránh dùng như chứng thực con người/đối tác. Không khẳng định ảnh là AI chỉ qua vẻ ngoài. R03/R06/R11. |
| HUI-08 | P2 | Ba nút liên hệ nổi desktop cyan/blue/red cạnh navy/gold thu hút mắt mạnh; trang ngành còn có CTA sticky. `T01-1440-top.png`, `T03-desktop-top.png`. | Giảm trọng lượng/màu, cân nhắc gom vào một nút hỗ trợ; giữ một primary rõ ở mỗi vùng. R10. |
| HUI-09 | P2, source-derived; runtime not_run | `app/globals.css:476` đặt `.animate-marquee { animation: none !important; }` trong reduced motion, nhưng quy tắc `.animate-marquee` phía sau lại có shorthand `animation: marquee 25s linear infinite !important`. Cùng specificity và quy tắc sau có thể thắng. | Chuyển override reduced motion sau base rule và test chế độ reduce thực; không ghi runtime pass/fail từ screenshot. R09/R23. |

P1/P2 là ưu tiên xử lý đề xuất theo tác động quan sát, không phải xác nhận business hoặc quyết định phát hành. Mọi finding còn open; lượt này chưa sửa source ứng dụng.

## Sáu gate của skill

| Gate | Kết quả review |
| --- | --- |
| Không rập khuôn | Một phần tốt: hero và bento có phân cấp; thứ tự nội dung/độ dài cần sửa. Không mặc định coi grid ba ngành là lỗi vì danh mục có nhu cầu so sánh thật. |
| Không số liệu bịa | Chưa đủ evidence để đóng: có link nguồn học phí nhưng chưa xác minh lại toàn bộ giá/bằng cấp/ảnh/đối tác. Badge tuyển sinh có inconsistency HUI-02. |
| Mobile320/375/768 | Trang chủ đã quan sát ba mẫu; không thấy tràn ngang toàn trang trong các số đo. Tablet utility còn HUI-05. Chưa phủ tất cả template/states; không dùng overflow clip làm bằng chứng đạt. |
| Phản hồi tương tác | Menu390 mở được, khóa cuộn body, Escape đóng và focus trở về nút mở. Accordion học kỳ2 mở hiện học phần. Chưa test mọi link/tab/hover/active. |
| 60fps | not_run: không có performance trace hoặc Lighthouse mới; không công bố FPS hay điểm giả. |
| Typography | Không thấy italic ở H1 đã xem; còn lệch thang/typeface HUI-03. |

## Kiểm tra và giới hạn

- Source hash check: pass cho228 file manifest; server khởi động thành công trên3111 sau khi chạy ngoài sandbox. Lần đầu sandbox chặn socket nên browser timeout; đây là hạn chế môi trường, không phải HTTP500 của ứng dụng.
- Browser read-only interactions: menu open/Escape/focus return, link trang chủ→ngành, CTA sai nhãn→anchor chương trình, accordion học kỳ2. Không gửi lead, không sửa CMS, không gọi notification thật.
- Không chạy unit/build mới vì không đổi code ứng dụng và bản build đã khớp source được so sánh. Không chạy axe/Lighthouse mới; bằng chứng QA cũ không được trình bày như kết quả mới.
- Chưa review CMS, bài viết dữ liệu thật, toàn bộ5 trang ngành, đầy đủ matrix320–1440, zoom200%, thiết bị thật, bàn phím ảo, screen reader, trạng thái lỗi mạng, reduced motion thực hoặc nghiên cứu người dùng.
- Không tự cho điểm ≥18/20 hoặc accepted khi các mục ảnh/quyền, accessibility, trạng thái và nguồn chưa đủ. Bốn lớp phía trên là nhận xét chuyên gia có evidence, không phải nghiên cứu người dùng.

## Bàn giao

Thứ tự đề xuất: HUI-01/HUI-02 → HUI-03/HUI-05 → HUI-04 → HUI-06/HUI-07/HUI-08/HUI-09. Sau sửa, chụp lại cùng route/state/viewport và cập nhật kết quả retest. Giữ các điểm tốt: navy, serif chọn lọc, thẻ học phí mobile, bố cục bento, form ngắn và menu Escape/focus return. Không đổi progress.json hay đóng task trong lượt đánh giá này.
