# Backlog thực thi R00–R29

Đọc `README.md`, `DESIGN_UX_SPEC.md` và `ACCEPTANCE_AND_EVIDENCE.md` trước khi nhận task. Mỗi task áp dụng Definition of Done chung; các tiêu chí dưới đây bổ sung cho từng phạm vi.

`Phụ thuộc` là task cần đầu ra trước khi tích hợp/nghiệm thu; có thể khảo sát độc lập sớm. Không nhận task bị chặn rồi tự tạo dữ liệu để vượt gate. Các file mới nêu dưới đây là đề xuất, phải đối chiếu kiến trúc trước khi tạo.

## R00 — Khôi phục baseline và sự thật của báo cáo

**Phase:** 0, 9. **Ưu tiên:** P1. **Phụ thuộc:** không. **Vai trò:** tích hợp/QA.

**Phạm vi:** `docs/phase-*.md`, inventory, tài liệu kiến trúc; không sửa UI/DB.

**Thực hiện:** ghi commit hoặc danh sách thay đổi chưa commit, runtime/Next/browser, môi trường chạy; inventory URL/template/source dữ liệu. Tạo thư mục evidence cho run, ảnh T01/T03/T05 desktop/mobile, log hiện tại và danh sách lỗi. Sửa trạng thái báo cáo cũ bằng ghi chú audit có ngày: phân biệt kết quả lịch sử, chưa xác minh và kết quả lần này; giữ dấu vết, không xóa lịch sử hoặc ghi như đã khắc phục.

**Nghiệm thu:** mỗi tuyên bố “đạt/100%” có phạm vi và đường dẫn bằng chứng hoặc được đánh dấu chưa xác minh; inventory phân biệt 200, redirect cuối, 404, lỗi mạng. Baseline không ghi điểm mô phỏng.

**Bàn giao:** baseline manifest, defect register P0/P1/P2/P3, bảng phase hiện tại, danh sách file có ownership.

## R01 — Cô lập DB, test, notification và môi trường build

**Phase:** 0, 9. **Ưu tiên:** P1, làm trước chạy lại CMS test. **Phụ thuộc:** R00. **Vai trò:** nền tảng.

**Phạm vi:** `lib/db/index.ts`, test config/setup, `__tests__/cms/`, `lib/services/leads.ts`, `playwright.config.ts`, `.gitignore`, scripts/config cần thiết.

**Thực hiện:** thêm cấu hình đường dẫn DB/storage phía server có default tương thích; test dùng thư mục tạm riêng mỗi run, fixture tối thiểu và dọn sau khi đóng connection. Từ chối chạy test integration nếu đường dẫn trùng DB thật. Notification trong test mặc định stub, không gọi mạng ngoài. E2E có baseURL/port/config theo môi trường và server riêng; production QA gắn build đã biết. Không build lên `.next` của dev đang chạy. Ghi cách xử lý EACCES/EPERM, không tự nâng quyền hoặc tắt bảo vệ để né lỗi.

**Nghiệm thu:** chạy test hai lần không đổi DB/backup/uploads thật; tạo lead fixture không gửi Telegram; test song song không tranh DB; lỗi kết nối được báo `blocked/error`, không biến thành HTTP status. Typecheck/lint/test cấu hình mới đạt.

**Bàn giao:** env contract không chứa secret, bằng chứng isolation, hướng dẫn một lệnh chạy kiểm tra trong môi trường riêng.

## R02 — Backup và restore có kiểm chứng

**Phase:** 8, 10. **Ưu tiên:** P1. **Phụ thuộc:** R01. **Vai trò:** nền tảng/vận hành.

**Phạm vi:** `scripts/backup-db.ts`, DB connection, script restore/verify mới, `DEPLOYMENT.md`.

**Thực hiện:** dùng phương thức snapshot nhất quán được SQLite/runtime hỗ trợ; không chỉ copy main DB khi WAL đang hoạt động. Kiểm tra phiên bản Node trước chọn API. Manifest ghi version/checksum/thời gian/schema; backup uploads tương ứng, quyền truy cập và vị trí ngoài Git. Backup chỉ được rotation sau khi bản mới xác minh thành công; giữ bản trước migration. Restore mặc định vào thư mục riêng, không overwrite DB đang dùng.

**Nghiệm thu:** trên fixture có ghi đồng thời, backup mở được, integrity check đạt, đối chiếu dữ liệu tại mốc snapshot; restore DB+media trên instance riêng và đọc được nội dung/asset. Thử file hỏng/thiếu quyền/thiếu disk; thất bại không xóa bản tốt.

**Bàn giao:** log restore rehearsal, runbook backup/retention, dữ liệu RPO/RTO đo được và mục tiêu chờ đầu mối vận hành chốt.

## R03 — Sổ nội dung chính thức và trách nhiệm xác nhận

**Phase:** 1. **Ưu tiên:** P1. **Phụ thuộc:** R00. **Vai trò:** nội dung/UX.

**Phạm vi:** tạo content register trong docs; đọc data/CMS ở chế độ an toàn, chưa công bố dữ liệu mới.

**Thực hiện:** mỗi record có ID, field, giá trị hiện tại, phạm vi chương trình/khóa/đối tượng, nguồn/văn bản, ngày hiệu lực/hết hạn, owner, reviewer, trạng thái, URL hiển thị và mâu thuẫn. Bao phủ tổ chức, bằng cấp, hình thức học/thi, 5 ngành, tín chỉ/thời gian, giá/phí/học bổng, contact, địa điểm, ảnh/đối tác, kỳ tuyển sinh và tài liệu. Gom câu hỏi thiếu thành một danh sách có lựa chọn cụ thể; tiếp tục phần độc lập.

**Nghiệm thu:** thông tin quyết định đều có nguồn hoặc blocker; không gán `verified` từ nội dung seed, tên biến `OFFICIAL` hoặc test pass. Ghi rõ ai có quyền xác nhận, không agent tự ký thay Topica.

**Bàn giao:** content register, source manifest, danh sách dữ liệu có thể dùng cho prototype và dữ liệu chưa được xuất bản mới.

## R04 — Danh tính, contact và cổng dịch vụ nhất quán

**Phase:** 1, 2. **Ưu tiên:** P1. **Phụ thuộc:** R03. **Vai trò:** full stack/nội dung.

**Phạm vi:** `Header.tsx`, `Footer.tsx`, `FloatingActions.tsx`, `CampusSection.tsx`, `data/campuses.ts`, navigation, settings, trang liên hệ/hệ thống.

**Thực hiện:** tạo nguồn contact dùng chung theo vai trò, không chỉ thay tất cả thành một số bất kỳ. Xác nhận tên/quan hệ Topica–PXU và tên đơn vị sở hữu nội dung. Phân biệt thư viện E-LIB, LMS, khảo thí, cổng xét tuyển và tra cứu. Xem đích cuối và chức năng; không giả định cùng URL là đủ. Đồng bộ icon/label/aria, `tel:`/`mailto:`, giờ/phạm vi hỗ trợ.

**Nghiệm thu:** một chỉnh sửa contact đã duyệt cập nhật header/footer/form/floating/liên hệ; vai trò rõ; không còn E-LIB gắn nhãn LMS. Link tra cứu không xuất hiện nếu chưa có chức năng thật được xác nhận.

**Bàn giao:** bảng dịch vụ và URL đã kiểm tra, screenshot các điểm chạm, test consumer nguồn chung.

## R05 — Hợp đồng chương trình, học phí, học bổng

**Phase:** 1. **Ưu tiên:** P1. **Phụ thuộc:** R03. **Vai trò:** dữ liệu/CMS, đầu mối đào tạo/tài chính.

**Phạm vi:** `data/programs.ts`, `program-details.ts`, `supplemental-program-details.ts`, `tuition.ts`, type/service dự kiến cho R16.

**Thực hiện:** lập một ID chương trình ổn định; tách tên chính thức/chuyên ngành, hình thức, văn bằng, đơn vị cấp, thời gian và tín chỉ theo đối tượng. Định nghĩa học phí theo khóa/đối tượng/hiệu lực, tiền bằng đơn vị nguyên VNĐ, cách làm tròn và tổng dự kiến. Xác nhận từng cam kết tài chính/học bổng và nguồn. Không mặc định giữ 600k/126 tín chỉ/30% chỉ vì tests cũ khẳng định.

**Nghiệm thu:** mọi nơi đọc cùng hợp đồng; phép tính có test theo fixture đã duyệt, khác đối tượng cho kết quả đúng; policy thiếu không tự fallback sang giá “chính thức” của khóa khác. Không tự diễn đạt “chính quy” cho chương trình từ xa khi chưa có xác nhận.

**Bàn giao:** data contract version, mapping legacy → ID, case tính toán và nội dung đã/chưa xác nhận.

## R06 — File tài liệu thật, HTML sạch và metadata

**Phase:** 1, 7. **Ưu tiên:** P1. **Phụ thuộc:** R02, R03. **Vai trò:** nội dung/frontend.

**Phạm vi:** `DocumentCard.tsx`, `TuitionHub.tsx`, `lib/cms/html.ts`, mapping SEO, CMS records qua migration có dry-run.

**Thực hiện:** inventory file có quyền sử dụng; xác định MIME, bytes, nguồn/ngày/phiên bản; phân biệt link xem trang và tải file. Chưa có file thì không in dung lượng/ngày giả hoặc gắn download vào HTML. Làm sạch entities/shortcodes/plain-text excerpt/title/description tại boundary phù hợp, tránh double decode và làm lỏng HTML sanitization. Thay dữ liệu qua script có preview, log record ID và rollback.

**Nghiệm thu:** tải nhận đúng file/MIME/bytes; title tab và metadata không còn `&#038;`; nội dung có dấu/HTML hợp lệ không bị mất; payload XSS vẫn bị loại bỏ; file thiếu có hành vi thiết kế rõ.

**Bàn giao:** document manifest, dry-run/migration log, file checks và screenshot metadata/card.

## R07 — Route map, IA và hành trình quyết định

**Phase:** 2. **Ưu tiên:** P1. **Phụ thuộc:** R04, R05. **Vai trò:** UX/frontend.

**Phạm vi:** navigation data, `NavigationHub`, route catch-all, redirect/canonical, docs journey map.

**Thực hiện:** mỗi URL có template, owner, source và hành động keep/update/redirect/archive/404. Chốt 6 hành trình: chọn ngành, kiểm chứng cấp bằng/học–thi, chi phí, kỳ/hồ sơ, tư vấn, dịch vụ sinh viên. Quy định CTA và đích, breadcrumb, search entry. Canonical cho route ngành trực tiếp/phân cấp phải nhất quán, giữ URL cũ có giá trị bằng redirect đúng chủ đề.

**Nghiệm thu:** đi hết luồng không dead end; không redirect mọi trang thiếu về homepage; 404 thật; draft/archived không lộ qua catch-all/search/sitemap. Mỗi trang có mục tiêu và bước tiếp theo.

**Bàn giao:** route/redirect manifest, journey map, danh sách URL dùng cho QA.

## R08 — Concept, thiết kế mẫu và prototype

**Phase:** 3, 4, 5. **Ưu tiên:** P1. **Phụ thuộc:** R07 và dữ liệu/ảnh đã đủ phạm vi. **Vai trò:** UX/UI.

**Phạm vi:** artifact thiết kế có phiên bản, không thay toàn website trong task này.

**Thực hiện:** dùng cùng nội dung thật tạo 2 concept nhỏ cho hero + một section; chọn hướng học thuật/gần gũi phù hợp nhất và ghi lý do. Hoàn thiện T01/T03/T05 ở desktop 1440 và mobile 390 trước; thêm 320 để kiểm tra reflow. Tạo prototype click được 6 luồng, gồm form/error/empty/menu. Có thể dùng Figma hoặc prototype chạy trong staging; không bắt buộc nền tảng mới. Fixture phải ghi rõ nội bộ và không xuất bản như dữ liệu thật.

**Nghiệm thu:** phù hợp `DESIGN_UX_SPEC.md`, không form dài ở hero mặc định, ảnh rõ con người, hierarchy tốt, không dấu câu đứng riêng; mẫu có trạng thái và spec responsive. Lưu cả concept/decision, không chỉ đoạn văn “đã thiết kế”.

**Bàn giao:** link/file prototype, ảnh mẫu, design decisions, checklist review và kịch bản R20.

## R09 — Hợp nhất token và component states

**Phase:** 3, 6. **Ưu tiên:** P1. **Phụ thuộc:** R08. **Vai trò:** frontend/design system.

**Phạm vi:** `tokens.css`, `app/theme.css`, `app/design-tokens.css`, `globals.css`, `components/ui/`, `/design-system`.

**Thực hiện:** chọn một nguồn định nghĩa token và mapping semantic rõ; migration classes cũ có danh sách consumer. Giữ alias tạm nếu tránh hồi quy; xóa alias chỉ sau không còn dùng. Kiểm tra `ink-900`, brand cũ và biến thiếu. Hoàn thiện button/link/input/select/checkbox/alert/card/document/accordion/dialog/state, giữ admin ổn định. Không đổi mọi `brand-*` sang navy bằng replace mù.

**Nghiệm thu:** token không xung đột/không undefined; computed styles đúng trên nền sáng/tối, hover/focus/error/disabled; state có semantics; showcase có ảnh kiểm chứng. Chữ/tương phản đo từ UI thật.

**Bàn giao:** token map, migration notes, component state matrix, screenshot và test tương tác cần thiết.

## R10 — Header, mobile menu, footer và sticky

**Phase:** 6. **Ưu tiên:** P1. **Phụ thuộc:** R09, R04. **Vai trò:** frontend.

**Phạm vi:** `components/layout/`, main layout và globals liên quan.

**Thực hiện:** sửa CTA mobile khó đọc từ computed styles/variant; desktop menu click/keyboard/hover phù hợp, mobile drawer focus/escape/scroll lock. Đồng bộ contact/footer, giảm utility chật trên mobile. Thiết kế một policy sticky chung: ẩn/phối hợp khi menu/search/form focus/bàn phím, safe area, z-index, nội dung cuối trang có khoảng trống đủ. Anchor có offset.

**Nghiệm thu:** Tab/Shift+Tab/Enter/Space/Escape hoạt động, focus trả về đúng, không chạm/scroll nền qua drawer; 320–1440px không che CTA/nội dung, zoom 200% dùng được. Không dùng overflow clip để che lỗi. Admin login vẫn dùng được.

**Bàn giao:** shell screenshots, interaction video/log, keyboard checklist và regression tests phù hợp.

## R11 — Thiết kế và triển khai trang chủ

**Phase:** 4, 7. **Ưu tiên:** P1. **Phụ thuộc:** R10, R05, R06, contract R16. **Vai trò:** frontend/UX.

**Phạm vi:** `app/(main)/page.tsx`, `HeroSection`, `NewsPreview`, trust/program/experience/testimonial sections.

**Thực hiện:** triển khai thứ tự T01; hero thay overlay/layout để ảnh thật nhìn rõ, title responsive và tối đa 2 CTA; đưa form ngắn xuống vùng phù hợp. Thông báo hiện hành dùng model R16/R18, không thay quy trình 5 bước bằng lịch giả. Nội dung tin tưởng/ảnh/story chỉ từ bản đã duyệt. News ưu tiên đúng thời điểm; archive vẫn truy cập được.

**Nghiệm thu:** screenshot desktop/mobile đạt rubric; tin 20/07 không còn hiển thị như khẩn cấp hiện tại; không có kỳ mở vẫn có trải nghiệm trung tính hữu ích. Không biến ảnh thật thành nền gần đen; hero không nhảy layout khi font/ảnh tải.

**Bàn giao:** before/after, trạng thái có/không kỳ mở, không story/ảnh và đường đi CTA.

## R12 — Danh mục và 5 trang ngành

**Phase:** 4, 7. **Ưu tiên:** P1. **Phụ thuộc:** R10, R05, contract R16. **Vai trò:** frontend/nội dung.

**Phạm vi:** `/nganh-dao-tao`, `ProgramPageView`, curriculum/roadmap/outcomes và route ngành.

**Thực hiện:** dùng một template T02/T03 và nguồn facts; tách chuyên ngành; bố trí mục lục/accordion, chi phí/hồ sơ/FAQ theo ngữ cảnh. Giữ component curriculum hữu ích, sửa dữ liệu và layout thay vì viết lại không cần thiết. Canonical/breadcrumb/schema khớp nội dung thật.

**Nghiệm thu:** kiểm tra cả 5 ngành, ngành tên dài, chương trình thiếu ảnh và miễn trừ nếu có; không mâu thuẫn tín chỉ/hình thức/văn bằng/giá giữa facts, curriculum, học phí và FAQ. Anchor/sticky hoạt động trên mobile.

**Bàn giao:** 5 URL, facts diff, screenshots đại diện + case dài và kiểm tra links/metadata.

## R13 — Tuyển sinh và học phí mobile dễ đọc

**Phase:** 4, 7. **Ưu tiên:** P1. **Phụ thuộc:** R10, R05, R06, contract R16. **Vai trò:** frontend/CMS.

**Phạm vi:** `AdmissionHub`, `AdmissionAnnouncementCard`, `TuitionHub`, trang tuyển sinh/học phí.

**Thực hiện:** tách quy trình nhập học và từng kỳ; trạng thái từ ngày/hạn. Học phí theo chính sách/khóa/đối tượng, có giả định phép tính; mobile dùng card hoặc bảng giải quyết được điểm đọc/so sánh. Đính kèm file chính thức, học bổng có điều kiện/hạn. Không đưa calculator nếu dữ liệu chưa đủ để tính đúng.

**Nghiệm thu:** người dùng đọc được đơn giá/tổng/điều kiện trên 320–390px; case kỳ tương lai/đang mở/đã đóng và không kỳ; không link tải HTML. Thay policy có hiệu lực cập nhật mọi nơi theo contract/cache.

**Bàn giao:** state screenshots, cách tính đã đối chiếu, file/link checks và test biên thời gian.

## R14 — Các trang nội dung, tìm kiếm và hỗ trợ

**Phase:** 4, 7. **Ưu tiên:** P1/P2 theo lỗi. **Phụ thuộc:** R10, R06, R07. **Vai trò:** frontend/nội dung.

**Phạm vi:** T06–T12, `CmsPageView`, article components, FAQ/search/contact, 404/policies.

**Thực hiện:** hoàn thiện từng template theo spec; article plain-text excerpt/metadata, prose/ảnh/bảng; events có thời gian riêng; search phân loại và giữ query; contact đúng role; public quality có nguồn/file. Không chỉ tạo các page có vài đoạn chung để tránh 404. Cập nhật robots/sitemap theo công khai thực sự.

**Nghiệm thu:** template matrix đầy đủ populated/long/empty/error phù hợp; search/sitemap không lộ draft; title không entities, 404 status đúng, social/canonical production đúng; link dịch vụ đúng chức năng.

**Bàn giao:** template inventory và screenshot/checklist từng mẫu, danh sách nội dung còn chờ owner.

## R15 — Form tư vấn và hợp đồng API tin cậy

**Phase:** 4, 6, 7, 8. **Ưu tiên:** P1. **Phụ thuộc:** R01, R10, R16. **Vai trò:** full stack.

**Phạm vi:** `LeadForm.tsx`, `lib/form-schema.ts`, `/api/public/lead`, lead service/model/admin.

**Thực hiện:** rút form theo spec; schema client/server đồng bộ optional/consent/program IDs; lưu nguồn trang/chiến dịch đã làm sạch, timestamp consent server và phiên bản chính sách. Chống double click/retry bằng idempotency có TTL, không khóa vĩnh viễn người có cùng số điện thoại. Rate limit phù hợp deployment; timeout/error giữ dữ liệu. Notification chỉ sau lưu thành công, lỗi notification không đổi thành “lead chưa lưu” gây gửi lặp; không lộ secret/PII trong log.

**Nghiệm thu:** browser submit thật vào DB test, 1 request idempotent → 1 lead, retry/lỗi mạng/quá hạn/rate limit; thiếu consent server từ chối; email rỗng hợp lệ khi optional. Không gửi ra provider thật trong QA. Thông báo thành công đúng nghĩa và khả năng vận hành được xác nhận.

**Bàn giao:** API contract, integration/E2E evidence, mapping lead nguồn/consent và notification behavior.

## R16 — Model CMS và migration có thể khôi phục

**Phase:** 8. **Ưu tiên:** P1. **Phụ thuộc:** R01, R02, R03, R05, R07. **Vai trò:** backend/CMS.

**Phạm vi:** DB/types/services/validation/migrations, contract cho public/admin; chưa thay toàn bộ UI.

**Thực hiện:** định nghĩa model ở mục 2 tài liệu nghiệm thu: organization/contact, programs, admission rounds, tuition policies/scholarships, documents, content revisions/audit. Dùng ID/version ổn định, timestamps UTC và hiển thị GMT+7; constraints cho ngày/tiền/reference. Tách published revision khỏi draft để sửa không làm thay ngay public. Migration versioned/transaction/dry-run và report counts; import nguồn cũ giữ ID/slug/nguồn.

**Nghiệm thu:** migration lần đầu và chạy lại không nhân đôi/mất dữ liệu; fixture cũ đọc được hoặc được mapping có log; lỗi giữa chừng rollback transaction; bản backup restore được. Public DTO không chứa secret/lead/reviewer notes.

**Bàn giao:** schema/contract, migration plan+rollback, before/after counts, tests constraint/versioning.

## R17 — Workflow duyệt, quyền server và preview

**Phase:** 8. **Ưu tiên:** P1. **Phụ thuộc:** R16. **Vai trò:** backend/CMS.

**Phạm vi:** guards, admin/public APIs, revision services và preview; guide Next draft-mode trước code.

**Thực hiện:** mặc định editor tạo/sửa/gửi duyệt; admin có quyền duyệt/công bố, trừ khi Topica chốt matrix khác. Không thêm vai trò thừa khi hai vai trò đủ. Review gắn revision cụ thể; sửa sau duyệt cần duyệt lại. Kiểm quyền mọi endpoint, ownership nếu áp dụng, input/HTML/file validation. Preview chỉ người có quyền qua session/token ngắn hạn, không lọt cache/search/sitemap; thoát preview rõ.

**Nghiệm thu:** gọi thẳng API bằng editor không publish/sửa users hoặc xem lead ngoài quyền; người chưa đăng nhập không xem draft. Preview đúng revision và hết hạn; draft không thay bản published; audit ghi actor/action/version/time, không ghi secrets.

**Bàn giao:** RBAC matrix, workflow transitions, negative authorization tests và preview evidence.

## R18 — Lịch công bố, hết hạn và cache đúng thời điểm

**Phase:** 1, 7, 8. **Ưu tiên:** P1. **Phụ thuộc:** R17. **Vai trò:** backend/full stack.

**Phạm vi:** public queries, admission/news services, scheduler nếu cần, cache invalidation.

**Thực hiện:** định nghĩa rõ `publishAt`, `expireAt`, `highlightUntil`, ngày sự kiện và hạn hồ sơ; UTC lưu trữ, GMT+7 nhập/hiển thị. Quy tắc biên khởi điểm `[start, end)`; thời hạn theo ngày phải được chuyển thành timestamp với quy ước được Topica chốt. Public query và cache đều tuân thời điểm, không chỉ thêm field date. Có thể query tại request hoặc cache/scheduler theo tài liệu Next; chọn cách ít phức tạp nhất đạt mục tiêu.

**Nghiệm thu:** sai lệch hiển thị mục tiêu ≤60 giây trên staging có cache nóng, đo thực; trước/tại/sau biên, timezone, chỉnh lịch, scheduler lỗi/chạy lặp. Hết highlight giữ bài trong archive; expires không tự xóa dữ liệu. Tin cũ không hiện khẩn cấp.

**Bàn giao:** time/state contract, boundary tests với clock kiểm soát, cache timing log và fallback khi scheduler lỗi.

## R19 — CMS UX, media và dashboard nghiệp vụ

**Phase:** 8. **Ưu tiên:** P1. **Phụ thuộc:** R17, R09. **Vai trò:** CMS frontend.

**Phạm vi:** admin pages/forms/sidebar, upload/media/settings và public data adapters.

**Thực hiện:** UI tạo/sửa chương trình/kỳ/học phí/tài liệu theo contract; phân nhóm, nguồn/hiệu lực/reviewer, preview, lưu nháp/gửi duyệt. Cảnh báo chưa lưu và optimistic concurrency theo version để không ghi đè silently. Upload giới hạn MIME/size, tên an toàn, alt/caption/focal, quyền; tài liệu private không public nhầm. Dashboard mục sắp hết hạn/thiếu file/chờ duyệt và lead theo quyền.

**Nghiệm thu:** lỗi API không toast thành công; 2 tab sửa cùng record được cảnh báo; người biên tập hoàn thành 5 nhiệm vụ QA không sửa code/HTML. Mobile admin tối thiểu đọc và thao tác an toàn các việc được hỗ trợ.

**Bàn giao:** CMS task walkthrough, screenshots states, upload/concurrency tests và cập nhật `CMS.md` đúng SQLite thực tế.

## R20 — Nghiên cứu người dùng thật và thử lại

**Phase:** 2, 4, 5. **Ưu tiên:** P1. **Phụ thuộc:** R08; thử lại sau các task UI liên quan. **Vai trò:** UX, Topica hỗ trợ tuyển người.

**Phạm vi:** prototype/staging, research protocol và log ẩn danh; không tự tạo người tham gia.

**Thực hiện:** 6–8 người phù hợp các nhóm ưu tiên; xin đồng ý ghi nhận, dùng mã participant, không lưu dữ liệu riêng không cần thiết. Giao nhiệm vụ trung tính 6 luồng trong R07, không chỉ đường trước; ghi success độc lập/có trợ giúp/fail, thời gian, do dự/sai đường, câu hỏi và mức tự tin. Tổng hợp số lượt, không suy rộng mẫu nhỏ thành toàn bộ người học. Tạo findings với severity/task sửa và thử lại luồng đã đổi.

**Nghiệm thu:** có session log/ngày/build/kịch bản/dữ liệu gốc ẩn danh và finding→fix→retest. Mục tiêu nội bộ ≥80% lượt lõi độc lập, thông tin chính khoảng 60–90 giây; không dùng ngưỡng để bỏ qua hiểu sai bằng cấp/chi phí. Không đủ người thì task chờ dữ liệu, không bịa tỷ lệ/click uplift.

**Bàn giao:** nghiên cứu vòng đầu/vòng lại, giới hạn mẫu và thiết kế được điều chỉnh.

## R21 — Tích hợp dữ liệu, migration và hồi quy route

**Phase:** 1, 7, 8. **Ưu tiên:** P1. **Phụ thuộc:** R04–R07, R11–R19. **Vai trò:** tích hợp.

**Phạm vi:** public/admin adapters, catch-all/search/sitemap, seed/migration legacy và docs.

**Thực hiện:** nối UI vào published DTO, bỏ fallback static có thể làm sống lại thông tin sai/archived. Chỉ dùng fallback trung tính đã thiết kế khi thiếu dữ liệu. Dọn script seed cũ bằng quarantine/documentation, không để “chạy hướng dẫn” ghi đè DB thật. Validate nguồn/hiệu lực/cross-page facts, resolve route aliases/canonical, cache invalidation sau publish, media path/CSP.

**Nghiệm thu:** sửa giá/contact/kỳ/tài liệu qua CMS thay đúng mọi consumer; draft không lộ; archive không bị fallback phục hồi; route legacy tới đúng nội dung; migration dry-run+counts được review; không nhập fixture vào public.

**Bàn giao:** integration manifest, content source trace, route regression và migration evidence.

## R22 — Thay kiểm tra hình thức bằng automation có giá trị

**Phase:** 9. **Ưu tiên:** P1. **Phụ thuộc:** R01, R21. **Vai trò:** QA automation.

**Phạm vi:** scripts SEO/links/a11y/lighthouse, `__tests__`, `e2e`, package scripts/CI.

**Thực hiện:** xóa điểm Lighthouse cố định; runner Lighthouse thật lưu JSON/HTML, hoặc báo unavailable không xuất score. Axe chạy browser trên template/states, không gọi vài phép tính màu là WCAG toàn site. Crawl rendered links/file/anchor từ route manifest, follow redirects có giới hạn, final status/MIME/function hợp lý; external failure phân loại riêng. Sửa E2E selectors đã cũ, dùng tên/role có ý nghĩa. Loại test tự khai báo hằng số rồi khẳng định chính nó; thêm tests hành vi có thể bắt lỗi hồi quy.

**Nghiệm thu:** cố ý tạo lỗi trong fixture khiến test tương ứng fail; mọi script trả result thật, exit code rõ, mạng lỗi không giả HTTP. Unit/integration/E2E tách DB; report có build/config/tool version; pipeline không tắt assertion để xanh.

**Bàn giao:** reproducible commands, reports mẫu thật, coverage theo hành vi và CI config phù hợp repository.

## R23 — Kiểm tra UI, accessibility và hiệu năng thực

**Phase:** 9. **Ưu tiên:** P1. **Phụ thuộc:** R22 và milestone R25 `staging_ready`. **Vai trò:** QA/UX.

**Phạm vi:** toàn bộ template; sửa findings theo ownership, không chỉnh test che lỗi.

**Thực hiện:** chạy ma trận ở tài liệu nghiệm thu; keyboard/screen reader/zoom/reduced motion/virtual keyboard; ảnh và nội dung dài/lỗi. Lighthouse production staging 3 lượt cho T01/T03/T05, ghi máy/network/cache và trung vị; đo thêm template nặng. Tối ưu LCP/font/ảnh/JS/hydration và CLS bằng trace, không đoán. Browser WebKit không thay thế iPhone thật, phải ghi khác biệt.

**Nghiệm thu:** không serious/critical axe còn mở và manual core flows đạt; rubric UI đạt, không CTA/bảng khó đọc; báo cáo performance thật. Lab TBT không gọi là field INP; field chưa đủ dữ liệu ghi rõ.

**Bàn giao:** screenshot matrix, checklist tiêu chí áp dụng, Lighthouse/trace và defect→fix→retest.

## R24 — Nghiệm thu tổng thể và release candidate

**Phase:** 9. **Ưu tiên:** P1. **Phụ thuộc:** R20, R21, R23, R27 và milestone R25 `staging_ready`. **Vai trò:** tích hợp/QA/đầu mối Topica.

**Phạm vi:** branch/build release candidate, tài liệu nghiệm thu; format trong commit riêng nếu còn tồn đọng.

**Thực hiện:** chạy verify và kiểm tra mở rộng phù hợp trên candidate xác định; UAT nội dung/đào tạo/tài chính/tuyển sinh/CMS. Kiểm secrets/default credentials/config public, policy/document rights, notifications, logs, headers/CSP và DB persistence theo deployment. Tổng hợp defect register và chốt phạm vi release, không vá chức năng mới phút cuối không test.

**Nghiệm thu:** G0–G9 trong acceptance đều có evidence; không P0/P1; P2 có quyết định/hạn/owner. Chưa có nghiên cứu/người duyệt/môi trường thì chưa accepted, dù code xong.

**Bàn giao:** RC manifest, UAT sign-off thực, test logs, known issues và quyết định release.

## R25 — Staging, triển khai và rollback

**Phase:** 10, chuẩn bị staging trong 9. **Ưu tiên:** P1. **Phụ thuộc để dựng staging:** R02, R21, R27. **Phụ thuộc để release:** R24 đã accepted. **Vai trò:** vận hành/full stack.

**Phạm vi:** Docker/config/DEPLOYMENT, staging và production được phép thao tác.

**Hai milestone theo thứ tự:** `staging_ready` = môi trường production build cô lập, persistence/restore/rollback/monitoring rehearsal đạt và runbook sẵn sàng trước R23/R24. `release_complete` = chỉ sau R24/G9 và quyết định release; rollout production, smoke/monitoring/rollback readiness được xác nhận. Không đánh dấu cả R25 accepted khi mới xong staging.

**Thực hiện:** staging có build ID/commit/runtime, dữ liệu đã khử thông tin riêng và outbound test mode. Chốt runtime thực hỗ trợ `node:sqlite`, volume DB/uploads, quyền file, một/multi instance và cache. Không hứa deploy SQLite vào filesystem không bền vững. Kiểm robots/noindex staging, canonical production, HTTPS/CSP/media và env build/runtime. Backup trước migration; rollout nhỏ có health/smoke; rollback code tương thích schema, không restore DB mù làm mất lead mới.

**Nghiệm thu:** restart/redeploy không mất nội dung/upload/lead; restore/rollback trên staging đạt; smoke public/admin/form sau release; monitoring và người nhận lỗi có thật. Chỉ thực hiện production release trong phạm vi người dùng đã cho phép và sau quyết định từ đầu mối Topica.

**Bàn giao:** release log, commands/runbook, rollback trigger và measured downtime/data impact.

## R26 — Bàn giao CMS, vận hành và nội dung

**Phase:** 8, 10. **Ưu tiên:** P1. **Phụ thuộc:** R19, R25. **Vai trò:** CMS/nội dung/vận hành.

**Phạm vi:** `CMS.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `README.md`, migration và hướng dẫn nội bộ.

**Thực hiện:** tài liệu khớp SQLite hiện tại, bỏ mô tả WordPress runtime nếu đã sai; phân biệt lịch sử import. Hướng dẫn biên tập, approval, expiry, tài liệu/media, contact, lead, backup/restore, sự cố và escalation. Đào tạo trên staging; nhân sự Topica tự làm các nhiệm vụ, agent ghi vướng mắc. Bàn giao tài khoản/quyền qua kênh riêng, không đưa credentials vào docs.

**Nghiệm thu:** người vận hành tự cập nhật học phí/kỳ/tin/ảnh/tài liệu, hiểu tác động công bố; biết khôi phục/escalate; owner và lịch rà nội dung được xác nhận. Không tự ghi “đã đào tạo” khi chỉ viết hướng dẫn.

**Bàn giao:** handbook/version, session log, UAT biên tập viên và danh sách owner theo nội dung.

## R27 — Đo lường hành trình trước phát hành

**Phase:** 11, chuẩn bị trong 9–10. **Ưu tiên:** P1 cho baseline. **Phụ thuộc:** R15, R21. **Vai trò:** analytics/full stack.

**Phạm vi:** `AnalyticsTracker`, `/api/public/hit`, event API/storage/provider phù hợp và docs metric.

**Thực hiện:** event taxonomy page view, program view, tuition view, CTA click, form start/error/success, outbound application click, document download. Allowlist payload, không tên/điện thoại/email/nội dung form hoặc raw search/query có dữ liệu riêng. Xác định denominator, phiên/thời gian/bot/test exclusion; chống double fire. Đừng gọi outbound click là hồ sơ xét tuyển đã nộp khi không có tích hợp xác nhận. Không thêm vendor/marketing tracking mặc định.

**Nghiệm thu:** mỗi thao tác tạo đúng event trên staging, không PII trong payload/log; form success chỉ sau lưu, lỗi có mã nhóm; dashboard tính được funnel đúng nghĩa; collection theo chính sách đã duyệt.

**Bàn giao:** event/metric dictionary, data validation và dashboard/báo cáo mẫu có nhãn dữ liệu test.

## R28 — Vận hành và tối ưu 30 ngày thật

**Phase:** 11. **Ưu tiên:** P2 sau release. **Phụ thuộc:** R25, R26, R27 và thời gian/dữ liệu thực. **Vai trò:** analytics/UX/nội dung.

**Thực hiện:** kiểm tra ngày 1/3/7/14/30: uptime/lỗi/form/notification, nội dung hết hạn, funnel theo device/source/program, câu hỏi tuyển sinh và search không kết quả đã khử dữ liệu riêng. Thêm RUM nếu phù hợp, phân biệt field/lab và đủ mẫu. Ưu tiên findings theo tác động, sửa trong đợt nhỏ có test/screenshot. A/B test chỉ khi đủ traffic và có thiết kế thống kê, không hứa uplift từ vài click.

**Nghiệm thu:** có mốc phát hành và 30 ngày quan sát thật; mẫu nhỏ ghi giới hạn; finding→decision→change→validation; không đổi ngày máy hoặc seed sự kiện để giả kết quả.

**Bàn giao:** báo cáo 30 ngày, backlog cải tiến, thay đổi đã kiểm chứng và kế hoạch rà nội dung thường kỳ.

## R29 — Đóng phase, quyết toán bằng chứng và bàn giao cho agent sau

**Phase:** tất cả. **Ưu tiên:** P1 khi chốt dự án. **Phụ thuộc:** R00–R28 đạt trạng thái phù hợp; phase 11 chưa đủ 30 ngày thì giữ mở.

**Thực hiện:** đối chiếu checklist gốc, backlog và evidence hiện hành; trạng thái từng phase có reviewer/date/build và phạm vi. Tổng hợp task deferred/blocked, lý do/owner/hạn. Bỏ câu tuyên bố vượt bằng chứng trong báo cáo; archive artifact cũ có nhãn version thay vì xóa tùy tiện. Kiểm tra docs/link và source of truth.

**Nghiệm thu:** agent mới đọc handoff biết chính xác làm gì tiếp, không cần suy đoán lịch sử; không có “100%” nếu còn gate bắt buộc chưa đạt. Release thành công không tự đóng phase 11.

**Bàn giao:** final phase matrix, release manifest, evidence index, known issues, ownership và progress cập nhật thật.
