# Handoff R01/R02/R16 — Safety và QA fixture

- Status: implemented; kiểm chứng kỹ thuật từng phần, chưa accepted.
- Owner: Codex tiếp nối thay đổi antigravity; reviewer chưa có.
- Source: HEAD f5a6b34709b6f4a88df0e2db10348f7f959ae8bc + dirty fingerprint ở manifest.
- Runtime: Node24.19.0/npm11.17.0/Next16.3.3; package yêu cầu22.x, chưa kiểm22.x.
- Dataset: empty migrated fixture + synthetic test records; không copy lead/DB thật.

## Hành vi cuối cùng

Đọc DB không tạo/migrate/seed; thiếu DB hoặc migration báo lỗi có hướng dẫn.
Migrate/rollback phải backup đúng file connection trước mutation và lỗi backup
chặn schema change. Skip chỉ cho test fixture trong temp, không cho production.
Dry-run rollback transaction, status chỉ đọc và không tạo DB thiếu.
Snapshot dùng VACUUM INTO, không fallback copy mainfile khi WAL có thể chứa dữ liệu;
thất bại không rotation bản tốt. Migration001 không có admin password mặc định,
không seed hero/category;003 no-op, dữ liệu domain dùng fixture test riêng.
Historical003 giữ version/name/checksum cũ; record cũ cần audit, không tự xóa.

Test setup mỗi file có tempDB riêng, uploads/backups tách, notifications stubbed.
QA có DB/output/upload/port/tsconfig/tsbuildinfo riêng, refuses reuse fixture/port3000,
noindex/robots disallow. Bundled font local/OFL bỏ phụ thuộc Google Fonts khi build;
giữ hai font và weight hiện có. Proxy thay middleware theo Next16 docs.
Session production từ chối secret thiếu/ngắn, không dùng hardcoded fallback.

## Kiểm tra

| Command/case | Kết quả/exit | Evidence |
| --- | --- | --- |
| `npm run test -- --maxWorkers=2` | 24files/173tests,0 | full-tests-2.log |
| Repeat CMS/operations/services hai lần,2workers | cả hai0; metadata data/uploads không đổi | isolation-repeat.json, isolation-repeat-1/2.log |
| `npm run typecheck` |0 | typecheck-final.log |
| `npm run lint` |0 | lint-final.log |
| `node --conditions=react-server --import tsx scripts/qa-server.ts --build-only` run overnight-01-final |0,42staticpages | qa-build-final.log |
| Chromium baseline T01/T03/T05 desktop/mobile | capture0, axe có findings mở | ../02-browser-baseline/results.json |

Các lần fail/retest được giữ nguyên log: sandbox temp EPERM -> TEMP/TMP workspace
riêng; CLI server-only -> react-server condition; fontDNS -> bundled officialfonts;
sandbox Turbopack IPC -> approved build execution; TS widened NODE_ENV -> literal.
Không hạ assertion để xanh; draft assertion chuyển đúng public CMS service boundary.
Metadata unchanged chỉ chứng minh size/mtime/tree quan sát, không phải byte checksum
hay chứng minh mọi môi trường ngoại vi. Source review giữ các dirty changes cũ.

## UI review

Font/shell đã xem sáu ảnh top desktop/mobile tại baseline; layout hiện có còn P1.
Không có đổi thiết kế layout trong gói này. UI chưa accepted; xem defect register.

## Còn thiếu/rủi ro

- R02: restore DB+media rehearsal, disk/permission fault, measured RPO/RTO chưa đủ.
  Restore hiện chưa fail-closed với manifest thiếu/không có SHA; cần sửa ở lượt sau.
- R16/R17/R18/R21: revisions/quyền/scheduled-effective/publicDTO/fallback chưa đủ;
  checksum migration hiện chỉ hash version/name, không kiểm nội dung source.
- R01: E2E journeys/admin/upload fullbrowser và runtime22 chưa kiểm. Có metadata
  repeat evidence, chưa chứng minh mọi file external storage; không dùng DB thật.
- R01: Next tự ghi `next-env.d.ts` ở root dù distDir/tsconfig riêng; sau build file
  generated đang trỏ QA type output. Cần workspace build copy riêng hoặc quản lý
  generated helper an toàn trước khi coi build hoàn toàn không đụng dev workspace.
  Không sửa tay helper generated để che hạn chế; dev/typegen có thể tạo lại nó.
- LocalTTF tổng khoảng758KB; chưa đo Lighthouse hoặc tối ưu WOFF2.
- Provision tài khoản đã migrate001 cần quy trình riêng; không tự cấp admin thật.
- UAT, reviewer, nguồn nghiệp vụ, staging/release chưa có; không nâng accepted.

## Bàn giao tiếp

Đọc CONTENT_REGISTER.md/CSV (R03), bổ sung inventory kỳ thi/tài liệu/ảnh;
sửa restore safety nhỏ và test fixture trước. Sau đó dùng baseline defects để
chốt prototype/CTA/form/accessibility; vẫn giữ ảnh before và chụp after vào batch mới.
Đọc local Next guides trước code; mỗi lần QA dùng runID mới, không dùng port3000.
