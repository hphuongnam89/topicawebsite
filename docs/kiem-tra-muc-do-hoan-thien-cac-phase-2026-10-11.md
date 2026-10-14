# Kiểm tra mức độ hoàn thiện các phase — 11/10/2026

## Kết luận

**Chưa hoàn thành toàn bộ kế hoạch.** Có triển khai thực tế đáng kể ở kiến trúc thông tin, component, các trang công khai và CMS cơ bản. Tuy nhiên, việc các tài liệu phase 0–9 ghi “hoàn thành 100%” chưa được hỗ trợ đầy đủ bằng kết quả hiện tại và bằng chứng nghiệm thu. Phase 5 và 9 đặc biệt cần kiểm chứng lại. Chưa tìm thấy bằng chứng hoàn thành phase 10–11 trong repository được kiểm tra.

Không nên dùng trạng thái hiện tại để xác nhận website đã sẵn sàng phát hành chính thức. Đây là đánh giá tại thời điểm kiểm tra, không kết luận rằng các hoạt động ngoài repository chưa từng diễn ra.

## Phương pháp và giới hạn

- Đối chiếu kế hoạch `docs/ke-hoach-hoan-thien-website-topica.md` với các báo cáo phase 0–9, mã nguồn và bộ test.
- Xem website đang chạy tại `http://localhost:3000/`, trang học phí, menu mobile; kiểm tra trực quan desktop và viewport mobile đặt 390 × 844. Đây là kiểm tra mẫu, không phải ma trận thiết bị đầy đủ.
- Chạy typecheck, lint, Vitest, format check; thử build, SEO và E2E.
- Không đăng nhập CMS hoặc gửi form tư vấn thật. Phần CMS được đánh giá qua source, schema, API và test hiện có, chưa thay thế nghiệm thu của nhân sự Topica.
- Chưa xác minh nội dung học thuật/học phí với hồ sơ chính thức của Topica/PXU. Test khớp một hằng số chỉ chứng minh tính nhất quán nội bộ, không chứng minh hằng số đó đúng chính sách.
- Không suy ra phiên bản localhost trùng tuyệt đối với commit đang kiểm tra; cần gắn phiên bản build/commit khi nghiệm thu staging.

Mức độ dưới đây phản ánh độ đầy đủ của đầu ra và bằng chứng: **phần lớn**, **một phần**, **chưa đủ bằng chứng**, **chưa xác nhận triển khai**. Không gán phần trăm vì chưa có danh sách công việc với trọng số và biên bản nghiệm thu để tính hợp lệ.

## Đánh giá từng phase

| Phase                                  | Mức độ hiện tại                        | Phần có bằng chứng                                                                                                                 | Phần còn thiếu trước khi đóng phase                                                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Kiểm kê và baseline                | Phần lớn                               | Có inventory URL, báo cáo dữ liệu, phân loại trang và danh sách tồn đọng.                                                          | Baseline UX/hiệu năng đo thật, ảnh trước/sau, người chịu trách nhiệm và tiêu chí nghiệm thu có xác nhận. HTTP thành công không chứng minh nội dung hoặc giao diện đạt.                                                               |
| 1 — Chuẩn hóa nội dung                 | Một phần                               | 5 ngành được tổ chức lại; có dữ liệu học phí có cấu trúc trong TypeScript, xử lý HTML và định dạng ngày.                           | Xác nhận nguồn học phí/học bổng; thống nhất liên hệ; xử lý thông báo hết hạn, tài liệu tải thật, diễn đạt hình thức học/văn bằng và metadata còn entity.                                                                             |
| 2 — Kiến trúc thông tin và hành trình  | Phần lớn                               | Menu 6 nhóm, danh mục ngành, học phí, tiện ích và sơ đồ 6 hành trình.                                                              | Kiểm chứng khả năng tìm thông tin với người học; xác nhận cổng dịch vụ theo đúng chức năng; hoàn thiện phân biệt tư vấn, xét tuyển, tra cứu ở mọi điểm chạm.                                                                         |
| 3 — Hướng mỹ thuật và design system    | Phần lớn                               | Có 2 navy `#00264D`/`#16466B`, token, typography, component, trang `/design-system`.                                               | Token còn phân tán ở `tokens.css`, `app/theme.css`, `app/design-tokens.css`; semantic brand vẫn gắn vàng ở nhiều nơi. Cần kiểm tra màu dùng thật, trạng thái và duyệt hướng hình ảnh thực tế.                                        |
| 4 — Thiết kế chi tiết các mẫu trang    | Một phần                               | Có triển khai mẫu trang chủ, ngành, học phí, tin tức, tìm kiếm, pháp lý, trạng thái rỗng/404.                                      | Chưa tìm thấy bộ thiết kế/prototype có phiên bản và ma trận toàn bộ mẫu/trạng thái. Hero, form, bảng học phí mobile và CTA menu mobile vẫn cần sửa thiết kế.                                                                         |
| 5 — Prototype và thử nghiệm người dùng | Chưa đủ bằng chứng nghiệm thu          | Có mô tả 6 hành trình và test dữ liệu/schema.                                                                                      | Báo cáo nói có 6 người tham gia, 48 giây, giảm 52%, tăng click; chưa thấy ghi nhận từng phiên, dữ liệu gốc, baseline hoặc prototype để đối chiếu. Unit test không chứng minh trải nghiệm người dùng.                                 |
| 6 — Component và khung website         | Phần lớn                               | Header, mega menu, mobile menu, footer, sticky CTA, form và component trạng thái đã có. Menu mobile mở được khi kiểm tra.          | Kiểm tra bàn phím/focus đầy đủ, đồng bộ token, màu CTA mobile, xung đột sticky/bàn phím. `MobileStickyBar` chỉ theo scroll, chưa thấy cơ chế ẩn khi nhập liệu như báo cáo mô tả.                                                     |
| 7 — Trang công khai và tích hợp        | Phần lớn                               | Có các trang chính, 5 ngành, học phí, tìm kiếm, tin tức, legal và kết nối CMS.                                                     | Nội dung/tài liệu thật, trạng thái kỳ tuyển sinh, tin hết hạn và metadata; kiểm tra đích cuối redirect, file và anchor. Không thể đóng phase chỉ vì route trả 200/3xx.                                                               |
| 8 — CMS và quy trình cập nhật          | Một phần                               | Quản lý bài/trang/media/lead/settings, tài khoản admin/editor; có guard phía server, bản nháp, cập nhật homepage và script backup. | Chưa thấy model/quản trị chuyên biệt cho kỳ tuyển sinh, học phí và tài liệu. Chưa đủ workflow review, lịch công bố/hết hạn có hiệu lực, audit history, preview toàn trang và nghiệm thu biên tập viên. Học phí còn sửa trong source. |
| 9 — QA và hiệu năng                    | Một phần; chưa đạt cổng nghiệm thu     | Typecheck, lint và 50 test đạt trong lần kiểm tra này. Có mã kiểm tra route, màu và CSS.                                           | Đo Lighthouse thật, audit accessibility theo trang và thao tác thật, E2E đủ luồng, ma trận thiết bị, production build tái lập và báo cáo lỗi. Điểm in cố định không được dùng nghiệm thu. Format check hiện không đạt.               |
| 10 — Phát hành và bàn giao             | Chưa đủ bằng chứng hoàn thành          | Có Docker/deployment hướng dẫn cơ bản và script sao lưu.                                                                           | Staging có phiên bản, quyết định release, production cấu hình/lưu trữ bền vững, restore và rollback thử thành công, giám sát, tài liệu vận hành/đào tạo bàn giao.                                                                    |
| 11 — Đo lường 30 ngày                  | Chưa xác nhận triển khai theo kế hoạch | Có tracker lượt xem trang và dữ liệu `page_views`.                                                                                 | Funnel CTA → tư vấn → xét tuyển, định nghĩa sự kiện/KPI, dữ liệu thực 30 ngày, phân tích lỗi/điểm rơi và vòng cải tiến. Page view không đủ thay thế đo hành trình.                                                                   |

## Tồn đọng có bằng chứng cụ thể

### A. Tài liệu nghiệm thu đang đánh giá quá mức bằng chứng

1. `scripts/test-lighthouse.ts:159–162` in cố định Performance 96, Accessibility 98, Best Practices 96, SEO 100. Script đo HTTP/TTFB/kích thước HTML/metadata, không chạy Lighthouse hoặc đo LCP/INP/CLS. Dù có nhãn “estimated”, đây không phải kết quả Lighthouse để sử dụng trong nghiệm thu.
2. `scripts/test-a11y.ts` tính tương phản một số cặp màu đặt sẵn, đọc chuỗi trong CSS và HTML trang chủ, rồi kết luận đáp ứng toàn diện WCAG. Chưa kiểm tra computed styles trên toàn site, focus, bàn phím, screen reader hay các tiêu chí áp dụng khác. Cảnh báo alt thiếu cũng không làm kiểm tra thất bại.
3. `__tests__/qa/a11y-responsive-quality.test.ts` kiểm tra một số màu literal khác bảng token hiện tại; tìm chuỗi CSS không chứng minh layout responsive hoặc tương tác hoạt động.
4. `docs/phase-5-prototype-va-thu-nghiem-nguoi-dung.md` nêu số người, tỷ lệ và thời gian, nhưng chưa thấy tài liệu nghiên cứu nguồn. `__tests__/journeys/learner-journeys.test.ts` kiểm tra mảng dữ liệu, schema, hằng số; có kiểm tra URL/hotline được khai báo ngay trong test. Không thay thế thử nghiệm người dùng hoặc browser journey.
5. `scripts/test-links.ts` chấp nhận 3xx mà chưa kiểm tra đích cuối, không crawl tất cả href/file/anchor thực tế. Kết luận “100% liên kết hoạt động hoàn hảo” vượt phạm vi script.

### B. UI/UX và nội dung đang chạy

1. **Hero desktop:** nền phủ rất tối khiến ảnh người học gần như mất vai trò; tiêu đề xuống dòng có dấu gạch ngang đứng riêng; form 5 trường bắt buộc chiếm phần lớn màn hình đầu. Chưa đạt mục tiêu bố cục thoáng và tăng tin tưởng từ hình ảnh/bằng chứng.
2. **Tính kịp thời:** trang chủ ngày 11/10/2026 vẫn ưu tiên tin “CHỈ CÒN 2 NGÀY … 20/07/2026”, đăng 18/07/2026. Không cần xóa tin lịch sử, nhưng cần bỏ tính khẩn cấp/nổi bật và tách thông báo còn hiệu lực.
3. **Thông tin liên hệ:** header dùng `1800 646 857` và `tuyensinh@topicauni.edu.vn`; footer/campus/floating dùng `0901795580` và `info@topicauni.edu.vn`. Có thể giữ nhiều kênh nếu Topica xác nhận vai trò, nhưng cần nhãn rõ và một nguồn dữ liệu dùng chung. Header hiện hardcode.
4. **Tài liệu:** `components/tuition/TuitionHub.tsx:200–219` hiển thị ngày ban hành và dung lượng 1.2 MB/850 KB/420 KB; các `downloadUrl` lại là trang đề án, hệ thống, biểu mẫu. Chưa chứng minh người học nhận được đúng file được mô tả.
5. **Diễn đạt văn bằng:** trang học phí hiển thị “Cử nhân chính quy Phú Xuân” trong khi trang chủ mô tả đào tạo từ xa. Cần đầu mối đào tạo xác nhận cách diễn đạt thống nhất, có nguồn; kiểm tra này không kết luận tính pháp lý.
6. **Metadata:** tiêu đề tab học phí còn `Học phí &#038; Học bổng | Topica`, dù H1 đã hiển thị đúng dấu `&`.
7. **Mobile học phí:** bảng có vùng cuộn riêng, nhưng cột tên ngành quá hẹp, chữ bị chia thành nhiều dòng; các cột tiền nằm ngoài vùng nhìn ban đầu, khó so sánh. Cần thẻ theo ngành hoặc bảng có cột cố định và chỉ dẫn cuộn rõ.
8. **Mobile menu:** menu mở được, song CTA “Đăng ký xét tuyển” ở chân menu có chữ tối trên nền navy, rất khó đọc trong màn hình kiểm tra. Cần xác minh style được tính trên build cụ thể và sửa trước nghiệm thu.
9. **Cổng dịch vụ:** footer gọi `https://elib.pxu.edu.vn/` là “Cổng học tập Elearning”; cần xác nhận đúng chức năng với Topica. Không dùng việc URL truy cập được để chứng minh nhãn và đích là đúng nghiệp vụ.

### C. CMS và vận hành

- `data/tuition.ts` chứa đơn giá, tín chỉ, học bổng và các cam kết tài chính. Có cấu trúc trong source nhưng chưa đồng nghĩa biên tập viên cập nhật được qua CMS, có ngày hiệu lực và người duyệt.
- Có `admin`/`editor` và `requireAdmin`; không kết luận hệ thống hoàn toàn thiếu phân quyền. Khoảng thiếu là workflow duyệt và nhật ký cho dữ liệu quan trọng, cần kiểm thử server theo từng quyền.
- `published_at` tồn tại, nhưng truy vấn công khai chủ yếu chỉ lọc `status === published`, chưa thấy điều kiện thời gian công bố/hết hạn. Nhập ngày tương lai không tự chứng minh có lịch xuất bản thực sự.
- DB dùng WAL (`lib/db/index.ts:23`); backup chỉ `copyFileSync` file `.db` (`scripts/backup-db.ts:22`), không thấy snapshot bằng SQLite hoặc checkpoint/khóa phù hợp. Chưa chứng minh bản sao đủ dữ liệu khi có ghi đồng thời và khôi phục được. Cần restore thử ở môi trường riêng trước release.
- Form có consent phía client, nhưng payload gửi lên và model lưu lead chưa chứa bằng chứng consent/nguồn trang; cần hoàn thiện theo nghiệp vụ đã thống nhất. Đây là nhận xét về triển khai, không phải kết luận tuân thủ pháp lý.
- `DEPLOYMENT.md` mới có hướng dẫn Docker rất ngắn, chưa thay thế runbook phát hành, restore, rollback, giám sát và bàn giao.

## Kết quả chạy kiểm tra lần này

| Kiểm tra                                                      | Kết quả quan sát                                                                                    | Cách hiểu đúng                                                                                                                                                              |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                           | Đạt, exit 0                                                                                         | Source vượt kiểm tra kiểu tại thời điểm chạy.                                                                                                                               |
| `npm run lint`                                                | Đạt, exit 0                                                                                         | Không có lỗi lint theo cấu hình hiện tại.                                                                                                                                   |
| `npm run test -- --maxWorkers=1` với TEMP/TMP trong workspace | 8 suites, 50 tests đạt                                                                              | Lần đầu bị EPERM ở thư mục temp; đổi temp và chạy lại thành công. Phạm vi test vẫn có các giới hạn nêu trên.                                                                |
| `npm run format:check`                                        | Không đạt, 159 file được báo                                                                        | Pipeline `verify` hiện chưa thể được coi là xanh vì bắt đầu bằng format check. Chưa tự sửa format trong lượt audit.                                                         |
| `npm run build`                                               | Chưa tạo build thành công; thử lại với temp workspace vẫn gặp Turbopack/process failure ở xử lý CSS | Chưa đủ cơ sở quy lỗi cho source; cần chạy trên môi trường build có quyền phù hợp và lưu log. Có cảnh báo middleware convention deprecated.                                 |
| `npm run test:e2e -- --workers=1 --reporter=line`             | Chưa chạy được test: webServer báo port 3000 đã dùng                                                | Môi trường terminal không truy cập được server hiện hữu để tái sử dụng; không được ghi là browser test pass hoặc assertion fail.                                            |
| `npm run test:seo`                                            | Không kết nối được localhost từ terminal                                                            | Script ánh xạ lỗi mạng thành 500. Kiểm tra HTTP trực tiếp xác nhận `EACCES` ở cả `::1` và `127.0.0.1`; không kết luận website thật trả HTTP 500. Browser vẫn mở được trang. |
| Quan sát browser                                              | Trang chủ và học phí hiển thị; menu mobile mở được; có các lỗi UX/nội dung mô tả trên               | Không thay thế test toàn bộ route, mọi thiết bị và release build.                                                                                                           |

Lưu ý về isolation: CMS test hiện mở DB tại `data/topica.db`, tạo/xóa lead thử và tạo backup trong quá trình chạy. Nên tách test DB/backup khỏi dữ liệu vận hành trước khi đưa bộ test vào CI hoặc chạy lặp tự động. Trong lượt này không chủ động sửa nội dung website.

## Thứ tự hoàn thiện đề xuất

1. **Sửa độ tin cậy của báo cáo và dữ liệu (phase 1, 5, 9):** đánh dấu lại hạng mục chưa kiểm chứng; bỏ điểm mô phỏng khỏi nghiệm thu; xác nhận hồ sơ học phí/học bổng/văn bằng/liên hệ; nối đúng file; xử lý tin hết hạn.
2. **Hoàn thiện trải nghiệm nhìn và đọc (phase 3, 4, 6, 7):** hero sáng/thoáng hơn, tiêu đề không gãy dòng bất hợp lý, form tư vấn ngắn theo nhu cầu, CTA mobile đọc rõ, bảng học phí mobile dễ so sánh, đồng bộ token và các trạng thái.
3. **Thực hiện nghiên cứu UX có ghi nhận (phase 5):** prototype mobile/desktop, 6–8 người phù hợp, log theo nhiệm vụ, số lượt hoàn thành, vướng mắc, sửa và thử lại. Không thay bằng unit tests.
4. **Hoàn thiện CMS vận hành (phase 8):** quản trị kỳ tuyển sinh/học phí/tài liệu, nguồn và hiệu lực, review/publish/archive, lịch hết hạn, nhật ký và cảnh báo; để nhân sự Topica thực hiện các tình huống nghiệm thu.
5. **QA trên staging có phiên bản (phase 9):** build thành công, test có DB riêng, E2E luồng thật, audit keyboard/screen reader và responsive theo ma trận, Lighthouse báo cáo JSON/HTML thật, kiểm tra link/file/redirect cuối, đóng P0/P1.
6. **Release và vận hành (phase 10–11):** restore/rollback thử, bàn giao, theo dõi ổn định; cấu hình funnel/sự kiện và đo dữ liệu thực sau phát hành 30 ngày.

Điều kiện đóng mỗi phase: đầu ra hiện hữu + kiểm tra phù hợp + bằng chứng lưu lại + đầu mối nghiệp vụ xác nhận. Không đóng phase chỉ bằng tài liệu tự tuyên bố “100%”.
