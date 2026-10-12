# Kế hoạch hoàn thiện Topica dành cho AI agent

Ngày lập: 11/10/2026. Phạm vi: hoàn thiện dự án hiện hữu theo yêu cầu giao diện học thuật, bắt mắt, hai tông navy, thông tin đầy đủ/kịp thời và tạo niềm tin cho người học.

**Đây là kế hoạch thực thi, không phải báo cáo đã triển khai.** Các task bắt đầu ở `planned`; không lấy tài liệu tự ghi “100%” làm bằng chứng hoàn thành.

Checkpoint mới nhất buổi tối12/10 theo yêu cầu tiếp tục: [báo cáo](../bao-cao-hoan-thien-2026-10-12.md), [handoff và gate](../evidence/completion-2026-10-12/HANDOFF.md), [đối chiếu nguồn](SOURCE_RECONCILIATION_2026-10-12.md). Build/source mới thay bản sáng cho phạm vi đã sửa; automation qua đêm giữ PAUSED. Không có task được accepted trong phiên mới.

Checkpoint đêm12/10: [handoff an toàn/QA](../evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md),
[baseline trình duyệt và defects](../evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md),
[sổ nội dung cần nguồn](CONTENT_REGISTER.md). Các trạng thái hiện tại nằm trong
`progress.json`; chưa có task mới nào được accepted qua lượt tự động.

## 1. Đọc theo thứ tự

1. Yêu cầu mới nhất của người dùng và `AGENTS.md` tại repository/thư mục đang sửa.
2. Báo cáo [hiện trạng 11/10/2026](../kiem-tra-muc-do-hoan-thien-cac-phase-2026-10-11.md).
3. File này: phạm vi, thứ tự và cổng nghiệm thu.
4. [DESIGN_UX_SPEC.md](DESIGN_UX_SPEC.md): đặc tả thiết kế toàn site.
5. [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md): 30 gói công việc R00–R29.
6. [ACCEPTANCE_AND_EVIDENCE.md](ACCEPTANCE_AND_EVIDENCE.md): checklist, test và bằng chứng.
7. [AGENT_HANDOFF.md](AGENT_HANDOFF.md): mẫu giao việc, bàn giao, xử lý blocker.
8. [TOPICA_VISUAL_EXPERIENCE_PLAN.md](TOPICA_VISUAL_EXPERIENCE_PLAN.md): bản đồ T01–T13, chuẩn chất lượng “WOW” theo Topica, các work package P0–P9, hướng dẫn giao việc và nghiệm thu cho agent thực thi UI toàn site.
9. [HYPER_UI_REMEDIATION_PLAN.md](HYPER_UI_REMEDIATION_PLAN.md): kế hoạch cụ thể hóa 9 finding giao diện từ review Hyper UI, route/file, phụ thuộc, owner và evidence nghiệm thu cho phạm vi đó.

Kế hoạch gốc [12 phase](../ke-hoach-hoan-thien-website-topica.md) vẫn là bối cảnh mục tiêu. Bộ tài liệu này cụ thể hóa phần còn thiếu sau audit; khi có khác biệt, ghi decision và căn cứ thay đổi, không âm thầm sửa mục tiêu.

## 2. Kết quả cần đạt

- Người học biết Topica là đơn vị nào, ai cấp bằng, hình thức học/thi, ngành phù hợp, chi phí, kỳ tuyển sinh và cách nhận hỗ trợ.
- Trang chủ thể hiện rõ con người và môi trường học, có khoảng thở; thông tin đáng tin được nhìn thấy trước khi yêu cầu người học điền nhiều trường.
- Hai navy `#00264D` và `#16466B` là nền tảng nhận diện; vàng của logo dùng tiết chế. Không chỉ thay màu CSS rồi coi như đã thiết kế lại.
- Nội dung cần cập nhật thường xuyên được quản trị trong CMS, có nguồn, phiên bản, người duyệt và hiệu lực.
- Mọi kết luận chất lượng có kết quả đo hoặc quan sát phù hợp; không có điểm mô phỏng hoặc nghiên cứu người dùng do agent tự tạo.
- Release có bản build xác định, backup/restore đã thử, rollback khả thi, người vận hành và theo dõi sau phát hành.

## 3. Phạm vi và giới hạn thay đổi

Giữ nền tảng Next.js/React/Tailwind/SQLite và chức năng hữu ích hiện có. Chỉ thay framework, database, auth, nhà cung cấp hoặc công cụ thiết kế khi có vấn đề cụ thể, phân tích tác động và quyết định rõ. Không viết lại toàn site chỉ để thuận tiện cho agent.

Các đường dẫn trong backlog là vị trí hiện tại hoặc vị trí mới được đề xuất; phải tìm lại trước khi sửa. Đọc source thay vì suy luận từ tên component. `/hoc-phi` đang redirect; các trang catch-all có thể đọc CMS. Không tạo route trùng để “sửa nhanh”.

Không tự công bố thông tin học thuật, giá, học bổng, cam kết tăng học phí, trả góp, kiểm định, tỷ lệ việc làm, ảnh chứng thực hoặc địa chỉ mới. Đầu mối Topica xác nhận dữ liệu; agent chuẩn bị biểu mẫu, đối chiếu, ghi nguồn và triển khai cơ chế.

Không xóa hoặc seed lại `data/topica.db`, uploads hoặc dữ liệu người dùng để test. Không gửi lead thử tới Telegram/webhook thật. Không đưa file `.env`, credential, dữ liệu lead hoặc bản backup thật vào Git/bằng chứng công khai.

## 4. Bản đồ phase → task sửa chữa

| Phase gốc           | Gói việc bổ sung       | Đóng phase khi                                                          |
| ------------------- | ---------------------- | ----------------------------------------------------------------------- |
| 0 — Baseline        | R00, R01               | Có baseline theo build, inventory và hệ kiểm tra an toàn                |
| 1 — Nội dung        | R03–R06, R18, R21      | Nội dung quan trọng có nguồn/duyệt, nhất quán và đúng hiệu lực          |
| 2 — IA              | R07, R20               | Luồng, nhãn, route và kết quả thử nghiệm phù hợp                        |
| 3 — Design system   | R08, R09               | Hướng mỹ thuật và component có đủ trạng thái, áp dụng nhất quán         |
| 4 — Thiết kế trang  | R08, R11–R15           | Mọi template có desktop/mobile/trạng thái và không còn lỗi thiết kế lớn |
| 5 — UX research     | R20                    | Có phiên người thật, log, vấn đề, sửa và thử lại                        |
| 6 — Khung/component | R09, R10, R15          | Shell, menu, form và sticky hoạt động đúng mọi phương thức nhập         |
| 7 — Public pages    | R11–R15, R21           | Trang và luồng dùng dữ liệu đã duyệt, file/CTA đúng                     |
| 8 — CMS             | R02, R16–R19, R21, R26 | Biên tập viên tự hoàn thành nghiệp vụ, workflow có hiệu lực server      |
| 9 — QA              | R22–R24                | Build/automation/manual QA đạt, không còn P0/P1                         |
| 10 — Release        | R25, R26, R27          | Release được xác nhận, restore/rollback đạt và bàn giao đủ              |
| 11 — 30 ngày        | R27, R28               | Có dữ liệu thật, phân tích và cải tiến được kiểm tra lại                |
| Tổng kết            | R29                    | Trạng thái từng phase đúng bằng chứng, không còn task bị quên           |

## 5. Thứ tự thực thi và cổng nghiệm thu

### Đợt A — Làm nền và dữ liệu đáng tin

R00 → R01 → R02. R03 có thể khảo sát cùng lúc, sau đó R04/R05/R06. Hoàn thiện R07. R16 bắt đầu khi hợp đồng nội dung đủ rõ, trước khi tích hợp CMS vào UI.

**Gate A:** test/backup tách môi trường, baseline có phiên bản; thông tin quyết định tuyển sinh có nguồn hoặc có blocker rõ; tài liệu, contact, cổng hệ thống được phân loại. Không tự bù giá/ngày/URL còn thiếu.

### Đợt B — Chốt trải nghiệm và hệ thiết kế

R08 tạo mẫu trang chủ/ngành/học phí và prototype luồng chính; lên lịch nghiên cứu R20 ngay khi có prototype. R09 → R10. Không nhân rộng mẫu có lỗi typography, CTA, mobile hoặc hình thức/văn bằng gây hiểu sai.

**Gate B:** mẫu desktop/mobile được rà soát; design tokens và states thống nhất; có kết quả nghiên cứu hoặc ghi rõ nghiên cứu còn chờ. Có thể tiếp tục xây phần kỹ thuật có thể đảo ngược trong khi chờ người tham gia, nhưng không đóng phase 5 hay tuyên bố thiết kế đã được người dùng xác nhận.

### Đợt C — Triển khai trang và vận hành CMS

R11–R15 theo hợp đồng đã chốt; R16 → R17 → R18/R19; R21 nối dữ liệu thật, routing và migration. R27 chuẩn bị đo lường trên staging trước release.

**Gate C:** nội dung public chỉ lấy bản đã duyệt/còn hiệu lực; học phí/kỳ tuyển sinh/tài liệu sửa được qua CMS; form và notification tách test/production; người biên tập thực hiện các nhiệm vụ nghiệm thu.

### Đợt D — Kiểm chứng và sửa hồi quy

R22 → R23 → R24. R25 có milestone `staging_ready` phải đạt trước R23/R24: dựng staging và diễn tập restore/rollback trước nghiệm thu. Milestone phát hành của R25 chỉ thực hiện sau R24; không đợi đến sau QA mới dựng môi trường QA. Xử lý findings R20 và thử lại trước khi freeze release. Không dùng unit test thay thế browser test hoặc nghiên cứu UX.

**Gate D:** ma trận template/thiết bị đủ bằng chứng; build release đạt; E2E, axe và kiểm tra thủ công đúng phạm vi; link/file đúng đích; không còn P0/P1. P2 chỉ còn nếu có người xử lý, hạn và chấp thuận rõ.

### Đợt E — Phát hành và 30 ngày

Sau R24, hoàn thành milestone `release_complete` của R25 → R26; R27 phải sẵn sàng trước phát hành nếu muốn có baseline ngày 1; R28 đo 30 ngày; R29 tổng kết.

**Gate E:** Topica xác nhận release trên bản staging cụ thể; restore/rollback đã diễn tập; production có giám sát và ownership. **Gate F:** đủ thời gian/dữ liệu thật của phase 11, hoặc báo rõ chưa đủ, không giả lập 30 ngày.

## 6. Ước lượng nguồn lực và lịch

Ước lượng lập kế hoạch, không phải cam kết: khoảng 7–10 tuần đến release + 30 ngày theo dõi, giả định có 1 UX/UI, 1 frontend, 1 full stack/CMS, QA tham gia và đầu mối Topica phản hồi đều. Nếu chỉ một người/agent thực thi tuần tự hoặc thiếu nội dung/ảnh/người thử, phải ước lượng lại sau R00.

| Khoảng thời gian dự kiến | Đầu ra trọng tâm                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Tuần 1                   | Baseline, test isolation, backup an toàn, content register và vấn đề cần Topica xác nhận |
| Tuần 2–3                 | Hợp đồng dữ liệu, IA, concept, prototype, thử nghiệm UX vòng đầu, token/shell            |
| Tuần 3–6                 | Trang công khai, form, CMS và migration; feedback thiết kế theo từng template            |
| Tuần 6–8                 | Integration, nghiên cứu thử lại, QA, performance, accessibility, sửa hồi quy             |
| Tuần 8–10 nếu cần        | Staging/release, restore/rollback, nghiệm thu nội dung, đào tạo/bàn giao                 |
| Ngày 1–30 sau release    | Đo lường, kiểm tra nội dung hết hạn, cải tiến theo dữ liệu                               |

Không cộng tốc độ các agent một cách tuyến tính. Nút thắt thường là nội dung chính thức, ảnh thật, phiên người dùng, review và môi trường build.

## 7. Quy tắc làm việc để hạn chế lỗi

1. Trước mỗi task: đọc yêu cầu, source, trạng thái Git, dependency và evidence cũ; nhận diện thay đổi của người khác. Không reset/stash/ghi đè thay đổi chưa hiểu.
2. Mỗi gói có một người chịu trách nhiệm tích hợp. Không để hai agent sửa cùng file trong cùng thời điểm. Tách worktree khi phù hợp và được workflow hiện tại cho phép; branch mới mặc định `codex/<task-id>-<slug>`.
3. Không build cùng thư mục `.next` với server dev đang chạy. Dùng checkout/process/output directory được cô lập theo Next docs hiện hành. Không tự dừng server của người dùng để chiếm port.
4. Đọc guide Next đi kèm phiên bản trước khi sửa. Hiện có `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`, `09-revalidating.md`, `16-proxy.md`, `02-guides/draft-mode.md`; kiểm tra lại tên/path khi phiên bản đổi.
5. Schema/API/data contract chốt trước khi frontend/backend sửa độc lập. Mọi thay đổi contract kèm consumer, migration, validation, cache và test liên quan trong cùng đợt tích hợp.
6. Migration thêm trường/table trước, backfill có dry-run, kiểm tra, rồi chuyển reader; tránh xóa cột hoặc thay dữ liệu cũ trong cùng release đầu. Rollback code có thể vẫn đọc schema mới.
7. Format diện rộng là thay đổi riêng sau khi thống nhất ownership; không lẫn với sửa chức năng khiến review khó đọc.
8. Kiểm tra vừa đủ theo tác động, mở rộng khi có lỗi/rủi ro chưa giải quyết. Không viết test chỉ để khẳng định hằng số hoặc tìm một chuỗi CSS có mặt.
9. UI phải xem screenshot ở bề rộng thực, nội dung thật và font đã tải; DOM tồn tại chưa đủ chứng minh đọc/nhấn được.
10. Mọi blocker ghi lỗi gốc và ảnh hưởng; không đổi EACCES/timeout thành “HTTP 500”, không bỏ test để làm pipeline xanh.
11. Không tự tăng phạm vi sang chatbot, 3D, cổng sinh viên mới, thanh toán, website song ngữ hoặc tracking quảng cáo. Tạo đề xuất riêng nếu có nhu cầu thực.
12. Có thể chọn giải pháp kỹ thuật thường quy và tiếp tục phần độc lập; chỉ cần đầu mối xác nhận dữ liệu/nghiệp vụ hoặc hành động release thực sự cần quyết định.

## 8. Theo dõi tiến độ

Dùng `progress.json` đi kèm làm sổ task. Trạng thái: `planned`, `in_progress`, `implemented`, `verified`, `accepted`, `blocked`, `deferred`. `implemented` chưa được tính là hoàn thành nghiệm thu.

`depends_on` là dependency cấp task. Riêng R25 có milestone staging trước QA và milestone release sau QA; `requires_milestones` ghi dependency chi tiết. R23/R24 chỉ cần R25 `staging_ready`, không yêu cầu cả R25 đã accepted. Khi review graph phải mở rộng milestone, tránh tạo vòng “QA cần staging nhưng staging lại đợi QA”.

Một task `accepted` phải có: commit/build hoặc phiên bản artifact, evidence paths, người kiểm tra, test có exit code, findings đã xử lý và xác nhận nghiệp vụ khi áp dụng. Ghi `not_run` cho việc chưa chạy, không ghi pass theo dự kiến.

Mọi cập nhật trạng thái phải phản ánh việc thật. Nếu agent chưa được giao task, không đổi trạng thái hoặc nhận ownership. Tránh cập nhật `progress.json` đồng thời: người tích hợp nhận bàn giao rồi cập nhật tuần tự.

## 9. Tài liệu và tham chiếu

Vòng tự thực thi qua đêm theo yêu cầu ngày 12/10/2026: xem
[OVERNIGHT_RUNBOOK.md](OVERNIGHT_RUNBOOK.md) về vòng lặp, hàng đợi, điều kiện
dừng và báo cáo sáng; [OVERNIGHT_LOG.md](OVERNIGHT_LOG.md) ghi checkpoint và
automation ID. Đây là cơ chế tiếp tục kế hoạch, không thay thế các gate bên trên.

- [RMIT Việt Nam](https://www.rmit.edu.vn/vi): tham khảo tổ chức lối vào chương trình, học phí, sinh viên và nội dung theo thời điểm; chỉ học nguyên tắc phù hợp, không sao chép nhận diện/nội dung.
- [BUV](https://buv.edu.vn/vi/): tham chiếu do người dùng cung cấp; cần xem trực tiếp khi thực hiện R08 vì lượt lập kế hoạch này không tải được trang. Không tự mô tả chi tiết chưa quan sát.
- [E-LIB PXU](https://elib.pxu.edu.vn/): trang chính thức tự nhận là thư viện; phân biệt với LMS/khảo thí và xác nhận URL LMS với Topica.
- [Assessment PXU](https://assessment.pxu.edu.vn/): tham chiếu người dùng cung cấp; chưa truy cập được trong lượt lập kế hoạch này. Hai mã navy trong đặc tả là hướng thiết kế đề xuất, không phải kết quả lấy mẫu màu đã xác minh từ trang đó.
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) và [Core Web Vitals](https://web.dev/articles/vitals): xem tiêu chí kiểm tra ở tài liệu nghiệm thu; không coi pass tự động là chứng nhận toàn site.
