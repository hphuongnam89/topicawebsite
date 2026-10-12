# Kiểm tra tiến độ Topica — 12/10/2026

Thời điểm kiểm tra: khoảng 00:00–00:10, giờ Việt Nam. HEAD: `f5a6b34`, working tree có nhiều thay đổi chưa commit. Một số file được cập nhật ngay trong phiên kiểm tra; các kết quả dưới đây là ảnh chụp trạng thái trong khoảng thời gian này, không phải chứng nhận cho một release bất biến.

## 1. Kết luận

Dự án đã tiến triển rõ ở phần giao diện công khai, chuẩn hóa component, liên hệ, form và nền tảng kiểm thử. Nền tảng CMS nghiệp vụ mới cũng đã bắt đầu xuất hiện. Tuy nhiên, chưa đủ bằng chứng để đóng các phase hoặc phát hành chính thức. Các khoảng trống lớn nhất là nguồn nội dung được duyệt, thiết kế/prototype theo đặc tả, quản trị nội dung đúng thời hạn, tích hợp CMS vào giao diện, kiểm thử trình duyệt thực tế, UAT và vận hành release.

Sổ `docs/agent-execution/progress.json` hiện ghi:

| Trạng thái  | Số gói việc | Ghi chú                                                |
| ----------- | ----------: | ------------------------------------------------------ |
| verified    |       14/30 | R01, R02, R04–R07, R09–R16                             |
| in_progress |        1/30 | R22                                                    |
| planned     |       15/30 | R00, R03, R08, R17–R21, R23–R29                        |
| accepted    |        0/30 | Chưa có gói nào ghi người nghiệm thu và ngày chấp nhận |

14/30 tương đương 46,7% **số gói việc được ghi verified**, không phải 46,7% khối lượng dự án đã hoàn thành. Các gói có quy mô khác nhau; trạng thái ghi trong sổ cũng chưa hoàn toàn phản ánh tiêu chí nghiệm thu. R16 được cập nhật từ planned sang verified trong phiên kiểm tra.

## 2. Những cải thiện đã thấy trong mã nguồn

- DB và backup có đường dẫn cấu hình; có đóng kết nối DB, stub notification khi test và các bài kiểm tra cô lập dữ liệu.
- Có script restore và kiểm thử backup/restore. Chưa thay thế được diễn tập trên staging của bản release.
- Header/footer/campus dùng liên hệ theo vai trò; E-LIB được gọi đúng là thư viện điện tử.
- Bổ sung token màu, sửa một số tham chiếu màu, xử lý focus/đóng menu mobile và khoảng trống cho sticky bar.
- Có danh mục/chi tiết 5 ngành, tuyển sinh, học phí, nội dung và tìm kiếm; học phí bổ sung thẻ riêng cho mobile trong source.
- DocumentCard phân biệt xem nội dung với tải file; manifest ghi rõ tài liệu chưa có tệp vật lý.
- Form/API bổ sung consent, phiên bản consent, nguồn lead, trình độ học vấn và cơ chế chống gửi lặp.
- Script mang tên Lighthouse đã bỏ điểm số gán sẵn và nói rõ giới hạn. Hiện vẫn chưa tạo báo cáo Lighthouse thật.
- Có migration 001–003, bảng nghiệp vụ, schema validation, revision/audit/public DTO và test cho CMS mới. R16 vừa được ghi verified; vẫn còn các vấn đề dữ liệu và an toàn migration nêu dưới đây.

Các mục trên là tiến bộ triển khai; không tự xác nhận nội dung học thuật, học phí hoặc nguồn ảnh đã được Topica duyệt.

## 3. Trạng thái từng phase

| Phase                 | Đánh giá hiện tại                                  | Phần còn thiếu để đóng                                                                                |
| --------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 0 — Baseline          | Một phần                                           | R00 còn planned; baseline theo bản build, inventory và bằng chứng môi trường test/build cô lập đầy đủ |
| 1 — Nội dung          | Đã chuẩn hóa một phần, chưa nghiệm thu             | Sổ nguồn chính thức R03, người duyệt, tài liệu thật, thống nhất dữ liệu, ngày hiệu lực/hết hạn        |
| 2 — IA/hành trình     | Có route map và kiểm thử mã                        | Kiểm tra hành trình trên trình duyệt và nghiên cứu người dùng R20                                     |
| 3 — Design system     | Có token/component cải thiện                       | Concept/prototype R08, ma trận trạng thái/viewport và kiểm tra trực quan toàn hệ                      |
| 4 — Thiết kế trang    | Có triển khai nhiều template, chưa đạt đầy đủ spec | Trang chủ đúng T01, form ngắn, ảnh/typography/khoảng thở, desktop/mobile và mọi trạng thái            |
| 5 — UX research       | Chưa có bằng chứng hoàn thành                      | Phiên thử với người thật, log, findings, sửa và thử lại                                               |
| 6 — Khung/component   | Đã triển khai đáng kể                              | Kiểm chứng browser cho menu, keyboard, zoom, sticky, bàn phím mobile và form                          |
| 7 — Trang công khai   | Có phần lớn khung và nội dung                      | Tích hợp dữ liệu đã duyệt, lịch tuyển sinh hiện hành, tài liệu đúng đích, kiểm tra toàn bộ route      |
| 8 — CMS               | Nền tảng mới đang xây, chưa hoàn chỉnh             | API/UI nghiệp vụ, quyền server, preview, workflow, lịch/hết hạn/cache, UX biên tập và tích hợp R21    |
| 9 — QA                | Unit/component test tiến triển tốt                 | Format, build release cô lập, E2E, axe/manual accessibility, Lighthouse thật, visual QA và UAT        |
| 10 — Release/bàn giao | Chưa đủ bằng chứng                                 | Staging, persistence, restore/rollback rehearsal, monitoring, runbook và nghiệm thu                   |
| 11 — Đo lường 30 ngày | Chưa hoàn thành                                    | Analytics được xác minh trước release, dữ liệu vận hành thật và cải tiến sau phát hành                |

## 4. Vấn đề cần xử lý ưu tiên

### P1 — An toàn migration và tính chính xác nội dung

1. `lib/db/index.ts` gọi `runMigrations(db, { skipBackup: true })` khi mở DB. Migration 003 bao gồm seed dữ liệu nghiệp vụ; vì vậy khởi động ứng dụng có thể áp dụng seed mà không có backup ở đường gọi này. Cần tách migration triển khai có kiểm soát với việc đọc DB thường ngày; bắt buộc backup có thể restore trước khi đổi dữ liệu đang sử dụng.
2. `lib/db/migrations/runner.ts` bắt lỗi backup, ghi cảnh báo rồi tiếp tục. Cần dừng migration khi backup bắt buộc thất bại; kiểm tra backup đúng DB đích. Không chạy thử migration/rollback trên DB thật để chứng minh việc này.
3. Migration 003 seed kỳ tuyển sinh hạn 20/07/2026 nhưng trạng thái `open`; ngày kiểm tra đã là 12/10/2026. `getPublicAdmissionRounds()` đang trả trạng thái lưu trong DB, chưa tính hạn. Cần xác nhận kỳ thật và triển khai trạng thái theo thời gian, có test biên múi giờ.
4. Seed học phí ghi `admissionFee: 0`, trong khi `data/tuition.ts` ghi 1.000.000 đồng. Seed còn ghi cam kết không tăng giá và tự tạo revision `published` do `system` duyệt. Cần đối chiếu chứng từ chính thức, thống nhất một nguồn dữ liệu, để dữ liệu chưa xác nhận ở draft và ghi rõ người duyệt. Tên migration có chữ “verified” không thay thế bằng chứng xác nhận.
5. R03 chưa hoàn thành. Manifest tài liệu có nhiều `hasPhysicalFile: false`, một số viewUrl dẫn trang tổng quát. Cần xác minh đúng văn bản, ngày ban hành, phiên bản, quyền sử dụng và đích xem/tải trước khi đóng R04–R06.

### P1 — Trang chủ và form chưa khớp thiết kế đã giao

Quan sát trực tiếp `http://localhost:3000/`: hero vẫn tối, tiêu đề in hoa lớn; form dài chiếm cột phải. Có 5 trường bắt buộc gồm họ tên, điện thoại, email, ngành và trình độ, cộng consent. Ở viewport desktop đang quan sát, cuối form nằm dưới màn hình đầu. Mục tin mới vẫn đưa thông báo nhập học ngày 20/07/2026 lên trang chủ; prefix đếm ngược đã bỏ nhưng cơ chế hết hạn chưa hoàn chỉnh.

`DESIGN_UX_SPEC.md` yêu cầu hero không form dài mặc định và thứ tự T01 có thông báo còn hiệu lực, trải nghiệm học, học phí/lộ trình, sau đó liên hệ/form. Trang chủ hiện vẫn dùng quy trình 5 bước ngay sau hero; quy trình này hữu ích nhưng không phải thông báo kỳ tuyển sinh hiện hành. Ghi chú R11 nói “full T01” chưa được source và giao diện chứng minh.

Hành động: hoàn thiện R08; sửa R11/R15 theo spec hoặc ghi quyết định thay đổi có căn cứ; rút gọn thông tin ban đầu, thống nhất client/API về trường tùy chọn; kiểm tra desktop/mobile, validation, loading, lỗi, thành công và gửi lặp. Tránh coi test render section là nghiệm thu thiết kế.

### P1 — CMS chưa được nối thành luồng nghiệp vụ sử dụng được

`lib/services/cms-models.ts` có logic revision/workflow và DTO, nhưng tìm kiếm import tại thời điểm kiểm tra chỉ thấy test sử dụng service mới. Chưa thấy admin page/API nghiệp vụ mới cho ngành, kỳ tuyển sinh, học phí và tài liệu trong route inventory hiện tại. Cần hoàn thành R16–R19 rồi R21: biên tập → gửi duyệt → duyệt → preview/xuất bản/lịch → hiển thị public → hết hạn/cache. Quyền phải kiểm tra ở server; kiểm thử tích hợp không chỉ gọi service trực tiếp.

### P1 — Kiểm chứng chất lượng và release

- `playwright.config.ts` vẫn dùng cổng 3000 và cho phép reuse server đang chạy; cần DB/uploads/notification/build/port cô lập trước khi chạy bộ browser test đầy đủ.
- `e2e/home.spec.ts` còn selector “Chương trình đào tạo”, “Ngành đào tạo”, khác nhãn hiển thị hiện tại “5 Ngành Đào tạo Cử nhân Trực tuyến”, “Ngành học”. Cần cập nhật theo hành vi/nhãn đúng và chạy thực tế.
- `scripts/test-a11y.ts` vẫn kết luận toàn diện WCAG 2.2 AA từ các kiểm tra hạn chế. Cần sửa cách báo cáo; dùng axe trên trình duyệt kết hợp kiểm tra keyboard, focus, zoom, screen reader và tương phản trạng thái thật.
- Chưa thấy `docs/evidence/` hoặc bằng chứng browser/Lighthouse/UAT gắn bản build theo cổng nghiệm thu đã quy định. Không suy ra các bằng chứng này từ file test tồn tại.
- Cần thực hiện R23/R24 trên milestone R25 `staging_ready`, sau đó mới xét phát hành. R27 cần xác minh event, consent và không chứa thông tin cá nhân trước release.

### P2 — Sổ tiến độ và quy trình bàn giao

R01 phụ thuộc R00; R04–R06 và R16 phụ thuộc R03; R09 phụ thuộc R08. Những phụ thuộc này còn planned trong sổ. R16 đã được cập nhật verified trong phiên, giải quyết tình trạng thiếu trạng thái của phụ thuộc R11–R13/R15 nhưng chưa chứng minh mọi tiêu chí của R16 đã đạt. Reviewer và accepted_at đều chưa có; source_version “head” không xác định nội dung working tree đã test. Cần phân biệt implemented/verified/accepted, rà soát lại các claim theo findings, ghi commit/build và log/bằng chứng phù hợp. Không tự sửa sổ thành accepted từ báo cáo này.

## 5. Kết quả kiểm tra trong phiên

| Kiểm tra                                 | Kết quả                                       | Giới hạn                                                                                   |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run typecheck`                      | Đạt ở lần chạy lại                            | Lần đầu lỗi biến year ở lib/date.ts; file được cập nhật trong phiên và lần sau đạt         |
| `npm run lint`                           | Đạt, exit 0                                   | Chạy lại sau các cập nhật mới                                                              |
| `npm run test -- --maxWorkers=1`         | 20 file, 156 test đạt; 38,65 giây             | DB/temp/backup trỏ thư mục audit riêng, notification stub; kết quả test không thay thế UAT |
| `npm run format:check`                   | Không đạt, 185 file ở thời điểm chạy          | Có cả file từ trước và file mới; cần xử lý format riêng, tránh trộn refactor               |
| Quan sát browser localhost               | Đã xem trang chủ desktop và cây accessibility | Chưa phải ma trận visual/mobile toàn site                                                  |
| Production build / E2E / Lighthouse thật | Chưa chạy trong phiên này                     | Chưa có môi trường production build cô lập; tránh tranh chấp .next và sử dụng DB thật      |

`npm run verify` chưa thể đạt vì format:check đang không đạt; không tuyên bố production build thất bại khi chưa chạy. Cảnh báo Vite về cách nạp config xuất hiện trong test nhưng không làm test thất bại.

## 6. Thứ tự hoàn thiện đề nghị

1. Chốt snapshot/commit và baseline R00; bảo vệ migration/backup, xử lý mâu thuẫn dữ liệu; hoàn thiện sổ nội dung R03 với đầu mối Topica.
2. Hoàn thiện concept/prototype R08; sửa trang chủ và form, kiểm tra 3 mẫu trọng điểm trang chủ/ngành/học phí trước khi nhân rộng. Tổ chức R20 với người dùng thật.
3. Hoàn thiện CMS R16–R19, nối public R21 và kiểm tra trạng thái theo thời gian. Xác nhận lại các task verified có phụ thuộc chưa xong.
4. Hoàn thiện automation R22, sửa format, tạo build và staging cô lập; thực hiện visual/a11y/performance R23, analytics R27 và UAT R24.
5. Diễn tập restore/rollback, nghiệm thu phát hành/bàn giao R25–R26; đo thật 30 ngày R28 rồi đóng R29.

Chi tiết thao tác, phạm vi file, acceptance và handoff tiếp tục theo `docs/agent-execution/IMPLEMENTATION_BACKLOG.md`. Không bỏ qua các gate chỉ để tăng số task đã đóng.
