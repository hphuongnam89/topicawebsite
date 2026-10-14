# Báo cáo audit backend — Topica Edu

**Ngày rà soát:** 2026-10-14  
**Phạm vi:** API routes, auth/session, input validation, CMS/data access, analytics/lead, media, SQLite migrations/backup/restore, container/dependencies và test hiện có.  
**Loại audit:** Rà soát source tĩnh + chạy kiểm tra tự động cục bộ; không truy cập môi trường production hoặc nội dung DB.

## Kết luận điều hành

**Có vấn đề nghiêm trọng cần xử lý trước khi coi backend sẵn sàng phát hành.** Phát hiện lớn nhất là Next.js `16.3.3` đang nằm trong advisory critical và nhiều advisory high theo `npm audit --omit=dev`; ngoài ra Docker build phụ thuộc một seed file bị Git ignore/không tracked, public analytics event có thể làm SQLite tăng không giới hạn, và biện pháp chống dò mật khẩu còn dễ né/bị gây áp lực bộ nhớ.

Các điểm tốt: `typecheck` đạt; **291/291 test ở 47 test files đạt**; lint riêng `app/api` và `lib` đạt. Những kết quả này không chứng minh cấu hình production, Docker build từ clean checkout, Node 22, hoặc quy trình backup/restore production đã an toàn.

## Phát hiện ưu tiên cao

### F-01 — P1 / Critical: Next.js production dependency có advisory critical và high

- `package.json:37` pin `next` đúng `16.3.3`; `package-lock.json` và package cài tại chỗ cũng là `16.3.3`.
- `npm audit --omit=dev --json` ngày 2026-10-14 báo **1 critical + 8 high** trong cây dependency mà npm xem là production. Advisory critical của Next là [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), “Remote Code Execution in next/og ImageResponse”, dải ảnh hưởng `>=16.2.0 <16.3.6`; audit còn nêu SSRF trong Image Optimization và các vấn đề cache/info disclosure ảnh hưởng dải bao gồm phiên bản hiện tại. npm audit chỉ ra bản sửa đề xuất `next 16.4.0`.
- Không tìm thấy route/import `next/og`, `ImageResponse`, `opengraph-image` hoặc `twitter-image` trong `app/` và `lib/`; điều này làm giảm khả năng khai thác trực tiếp **riêng** nhánh `ImageResponse`, nhưng không loại trừ các advisory khác của framework hoặc thành phần phụ thuộc.
- Cùng kết quả audit có 8 advisory high, bao gồm `sharp`, `source-map-js` và các dependency của ESLint. `eslint`, `eslint-config-next`, `typescript` và các type packages đang nằm trong `dependencies` (`package.json:27–52`), nên bị kéo vào cây production và làm tăng bề mặt supply-chain/runtime không cần thiết.

**Khuyến nghị:** nâng Next lên bản đã vá phù hợp (npm audit hiện đề xuất tối thiểu `16.4.0`), cập nhật lockfile, chạy lại test/build trên Node 22; chuyển tooling/type packages sang `devDependencies`; thiết kế Docker runner chỉ chứa runtime dependencies cần thiết. Không dùng `npm audit fix --force` trước khi review thay đổi major.

### F-02 — P1 / Cao: public analytics event ghi một row mỗi request, không có rate limit/retention

- `app/api/public/events/route.ts:8–15` chấp nhận sự kiện không cần đăng nhập; có giới hạn body và schema allowlist, nhưng không có rate limit phía server.
- Mỗi request hợp lệ gọi `recordAnalyticsEvent`, chèn một row mới (`lib/services/cms-models.ts:582–624`). Bảng `analytics_events` là `AUTOINCREMENT`, không có unique/dedupe hay retention (`lib/db/migrations/002_cms_domain_models.ts:178–192`); không tìm thấy cleanup job cho bảng này.
- Kiểm tra `Origin` hữu ích chống CSRF trình duyệt, nhưng không phải xác thực hay giới hạn tốc độ đối với client/bot có thể tự đặt header. Vì vậy có thể tăng vô hạn số row và làm đầy volume SQLite. Service có canonicalize `page_path` bằng `safePublicPath`, nên audit **không** kết luận rằng path PII thô được lưu; rủi ro chính là khả dụng/tăng trưởng dữ liệu.

**Khuyến nghị:** áp rate limit ở edge và server theo IP đã được proxy tin cậy xác thực; đặt ngân sách event/session; dùng hàng đợi hoặc store phù hợp nếu lưu lượng tăng; thêm retention/prune có kiểm soát và metric cảnh báo dung lượng DB.

### F-03 — P1 / Cao: login throttling có thể bị né và map failure có thể tăng không giới hạn

- `app/api/admin/auth/login/route.ts:6–33` giới hạn 5 lần/15 phút theo khóa `{IP, username}` nhưng IP lấy trực tiếp từ `x-real-ip`/`x-forwarded-for` (`:10–13`). Nếu ingress không xóa header do client cung cấp và ghi đè bằng IP thật, có thể giả IP để né giới hạn.
- Bộ đếm chỉ nằm trong `Map` tiến trình: không chia sẻ giữa nhiều instance/restart; entry hết hạn chỉ bị xóa khi cùng key được kiểm tra lại (`:16–32`), vì vậy nhiều username/IP duy nhất có thể giữ lại entry lâu dài. Username không có giới hạn độ dài.
- Login dùng `request.json()` trực tiếp (`:35–48`), không dùng bounded parser; body có thể lớn trước khi schema/validation loại bỏ.

**Khuyến nghị:** rate-limit tại reverse proxy/WAF hoặc store dùng chung; chỉ tin forwarded IP từ proxy đã cấu hình; giới hạn username/password/body; dọn entry hết hạn theo chu kỳ hoặc dùng store bounded; bổ sung test cho spoof header, nhiều instance và flood key duy nhất.

### F-04 — P1 / Release blocker: Docker build phụ thuộc seed bị ignore và không thể tái lập từ clean checkout

- `Dockerfile:38` bắt buộc `COPY --from=builder /app/railway-seed/topica.seed ...`.
- `.gitignore:78–80` bỏ qua toàn bộ `railway-seed/`; `git ls-files` xác nhận `railway-seed/topica.seed` không được theo dõi. Artifact có ở máy hiện tại nhưng không có trong Git checkout; `.dockerignore` không giải quyết thiếu file này. Vì vậy build Docker từ CI/clone sạch nhiều khả năng dừng ở bước `COPY`.
- Container còn tự copy seed vào DB khi DB chưa tồn tại (`Dockerfile:57`); nguồn seed không được version-control/review cùng code. Nội dung DB seed không được mở/kiểm tra trong audit này.

**Khuyến nghị:** loại bỏ seed ngầm khỏi image và dùng quy trình provisioning/migration rõ ràng; hoặc quản lý artifact seed có nguồn gốc, checksum, quyền truy cập và cách phân phối rõ ràng. Thêm Docker build test từ clean checkout, không dựa vào ignored local files.

### F-05 — P1 / Rủi ro vận hành: chưa có bằng chứng backup/restore production và mục tiêu phục hồi đo được

- `docs/agent-execution/STORAGE_BUNDLE_RUNBOOK.md:3–5, 24–28` ghi storage bundle mới được test trên fixture, chưa có lịch backup/rehearsal volume production; `DEPLOYMENT.md:100–107` nói lịch daily là đề xuất, RPO chưa đo và RTO chưa đo.
- Code backup/restore có nhiều bảo vệ tốt (snapshot SQLite, integrity/checksum, restore vào instance cô lập), nhưng test fixture không chứng minh volume, quyền, dung lượng, retention/offsite hoặc phục hồi dữ liệu thật.

**Khuyến nghị:** xác nhận owner vận hành đã cấu hình lịch backup ngoài repository; thực hiện restore rehearsal DB + media trên bản sao cô lập; ghi lại tần suất, RPO/RTO đo được, retention, quyền truy cập/mã hóa và cảnh báo lỗi. Không coi lịch trong tài liệu là lịch đã chạy.

## Phát hiện ưu tiên trung bình

### F-06 — P2: chính sách mật khẩu admin chỉ yêu cầu 6 ký tự

`lib/auth/password.ts:8` đặt `MIN_PASSWORD_LENGTH = 6`; endpoint đổi mật khẩu cũng kiểm tra 6 ký tự (`app/api/admin/auth/change-password/route.ts:25–28`). Hash có salt và PBKDF2-SHA512 (`100,000` iterations), nhưng độ dài tối thiểu thấp làm giảm đáng kể khả năng chống đoán mật khẩu quản trị.

**Khuyến nghị:** tăng mức tối thiểu lên tối thiểu 12 ký tự (không ép quy tắc composition không cần thiết), kiểm tra password phổ biến/bị lộ, hỗ trợ password manager và cân nhắc MFA cho admin.

### F-07 — P2: migration “checksum” không kiểm tra nội dung migration

`lib/db/migrations/runner.ts:13–16` tính checksum SHA-256 chỉ từ `version:name`, không từ nội dung `up/down`; `lib/db/migrations/state.ts:11–23` chỉ đọc ledger và không so checksum đã lưu với checksum hiện tại. Chỉnh sửa migration lịch sử sẽ không bị phát hiện, dù migration có cột tên checksum.

**Khuyến nghị:** dùng checksum bất biến được tính từ source/định nghĩa migration, kiểm tra các version đã áp dụng khi khởi động/`--status`, dừng rõ ràng khi drift; không sửa migration cũ đã phát hành.

### F-08 — P2: token Telegram được trả nguyên văn qua API settings

`app/api/admin/settings/route.ts:43–48` trả toàn bộ `site_settings`; `:64–72` lưu và trả lại toàn bộ settings. Theo service lead, bot token được đọc trực tiếp từ setting để gọi Telegram (`lib/services/leads.ts:113–140`). Endpoint giới hạn cho admin, nên đây không phải lộ public trực tiếp, nhưng làm lộ token vào browser response/state/logging và tăng hậu quả khi admin session bị chiếm; DB/backup cũng có thể chứa secret dạng rõ.

**Khuyến nghị:** không echo secret; trả boolean/masked sentinel và chỉ thay token khi nhập giá trị mới; ưu tiên secret manager/environment, đồng thời bảo vệ/mã hóa backup theo chính sách phù hợp.

### F-09 — P2: upload parse multipart trước khi áp giới hạn kích thước file

`app/api/admin/upload/route.ts:59–86` gọi `request.formData()` và đọc `file.arrayBuffer()` trước khi áp giới hạn kích thước 25 MB/ảnh 5 MB/tài liệu 20 MB. Giới hạn hiện có kiểm tra sau khi body đã được parse/buffer; người gửi cần quyền editor/admin nhưng tài khoản bị chiếm có thể gây tiêu thụ memory/băng thông. Chưa xác minh giới hạn request của reverse proxy/hosting.

**Khuyến nghị:** giới hạn body ở ingress; dùng streaming multipart parser hoặc cơ chế upload trực tiếp có quota; áp giới hạn concurrency và kiểm tra size trước khi buffer toàn file.

### F-10 — P2: lead/login rate limit cần gắn với proxy tin cậy và triển khai nhiều instance

Lead endpoint có bộ đếm 5/15 phút và cap map (`app/api/public/lead/route.ts:7–31`), tốt hơn việc không có limiter; tuy nhiên vẫn lấy IP từ `x-real-ip`/`x-forwarded-for` (`:11–16`) và lưu trong RAM từng instance. Nếu proxy không chuẩn hóa header, quota có thể bị né; nhiều instance làm quota không đồng nhất. Có thể gây lead spam và Telegram notification flood.

**Khuyến nghị:** cùng chuẩn hóa IP/rate limit tại ingress hoặc store dùng chung; cân nhắc honeypot/challenge phù hợp, quota notification và cảnh báo spam. Giữ nguyên validation consent/idempotency hiện có.

## Chất lượng và kiểm tra đã chạy

| Kiểm tra                                 | Kết quả                       | Ghi chú                                                                                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                      | **Pass**                      | `tsc --noEmit`                                                                                                                                                                                                                                       |
| `npm test -- --reporter=dot`             | **Pass: 47 files, 291 tests** | Vitest setup dùng DB/backup/uploads fixture tạm; test notification được cô lập theo cấu hình dự án                                                                                                                                                   |
| `./node_modules/.bin/eslint app/api lib` | **Pass**                      | Lint tập trung backend không báo lỗi                                                                                                                                                                                                                 |
| `npm run lint`                           | **Fail**                      | Toàn repo báo **308 errors, 20 warnings**; các lỗi có cả tests/evidence và UI ngoài backend. Lỗi tiêu biểu trong output: nhiều `@ts-ignore` ở test CMS, `prefer-const`, React setState-in-effect ở trang admin pages, `require()` ở evidence script. |
| `npm audit --omit=dev --json`            | **Fail theo advisory**        | **1 critical + 8 high** trong production dependency tree; npm audit hoàn tất khi chuyển cache sang `/tmp`, không sửa lockfile.                                                                                                                       |
| Build/Docker build                       | **Chưa chạy**                 | Không chạy build vì audit chỉ đọc và Dockerfile hiện phụ thuộc seed ignored; cần clean-checkout test sau khi sửa provisioning.                                                                                                                       |

Môi trường kiểm tra hiện tại là **Node `v26.7.0`**, trong khi `package.json` yêu cầu Node `22.x`; do đó kết quả test không xác nhận tương thích production Node 22.

## Các kiểm soát tốt đã quan sát

- API admin được bảo vệ bằng guard theo user/role; nhiều thao tác ghi kiểm tra same-origin.
- Có bounded JSON parser cho public lead/public analytics events; Zod validation cho payload.
- Truy vấn DB chủ yếu parameterized; private media nằm ngoài public path và có route bảo vệ.
- CMS HTML đi qua sanitizer; backup dùng SQLite snapshot + integrity/checksum, restore từ chối ghi đè active DB và tạo target cô lập.
- Test hiện có bao phủ auth, upload isolation, migration safety, restore safety và CMS workflows; không có lỗi trong 291 test chạy lần này.

## Kế hoạch xử lý đề xuất

1. **Ngay trước phát hành:** cập nhật Next và dependency tree theo advisory; kiểm tra bằng audit mới và build/test trên Node 22.
2. **Sửa blocker Docker:** bỏ phụ thuộc artifact `railway-seed` bị ignore; kiểm tra image build từ clone sạch và startup chỉ trên volume fixture mới.
3. **Giảm rủi ro public API:** rate-limit analytics events ở edge/server và thêm retention; khóa xác thực forwarded IP cho login/lead; giới hạn login body/username và dọn limiter bounded.
4. **Củng cố credential:** tăng password minimum, xử lý token Telegram dạng secret/masked.
5. **Migration/DR:** xác minh migration checksum thật; diễn tập restore DB+media trên volume cô lập và ghi evidence/RPO/RTO.
6. Chạy lại toàn bộ lint sau khi xử lý danh sách lỗi; riêng backend lint hiện đang sạch.

## Giới hạn phạm vi

Audit này không đọc nội dung `.env`, SQLite DB, backup hoặc seed; không xác nhận production env, TLS/proxy/WAF, secrets thật, quyền volume, logs, traffic, backup schedule bên ngoài repository hoặc trạng thái hệ thống đang deploy. Không chạy kiểm thử tấn công trên production và không sửa source. Các rủi ro phụ thuộc reverse proxy cần đối chiếu cấu hình ingress thực tế trước khi kết luận mức phơi nhiễm.
