# Giao việc và bàn giao cho AI agent

## 1. Prompt khởi động có thể dùng ngay

```text
Bạn đang tiếp tục hoàn thiện website Topica trong repository hiện tại.

Đọc AGENTS.md và docs/agent-execution/README.md trước. Sau đó đọc
DESIGN_UX_SPEC.md, ACCEPTANCE_AND_EVIDENCE.md, task được giao trong
IMPLEMENTATION_BACKLOG.md, progress.json và báo cáo audit 11/10/2026.

Task của bạn: <Rxx — tên task>.
Mục tiêu đầu ra: <kết quả cụ thể>.
Phạm vi file bạn sở hữu: <danh sách đã xác nhận>.
Phiên bản đầu vào: <branch/commit hoặc dirty snapshot>.
Evidence/dependency đã có: <đường dẫn; chưa có thì ghi rõ>.

Kiểm tra hiện trạng và dependency trước khi sửa, không tin trạng thái “100%”
nếu thiếu bằng chứng. Đọc guide Next đi kèm trước code liên quan. Giữ thay đổi
của người khác; không sửa ngoài phạm vi/không rewrite toàn dự án.

Test phải dùng DB/storage riêng, notification stub và server/build riêng.
Không seed/xóa/ghi đè DB thật. Không tự tạo giá, kỳ tuyển sinh, chứng thực,
ảnh người thật, người tham gia nghiên cứu hoặc điểm Lighthouse.

Triển khai đến đầu ra có thể review, kiểm tra phù hợp, xem screenshot UI thật,
sửa findings trong phạm vi và bàn giao theo mẫu trong AGENT_HANDOFF.md.
Nếu bị chặn, ghi nguyên nhân/evidence/phần ảnh hưởng; tiếp tục phần độc lập.
Không đổi blocked/not_run thành pass. Không tự đánh dấu phase accepted khi
còn thiếu nguồn nội dung, nghiên cứu người thật hoặc xác nhận nghiệp vụ.
```

Task đầu tiên nên giao **R00**, sau đó **R01** trước khi chạy lại CMS/integration test. Có thể giao R03 khảo sát nội dung độc lập nếu thực sự có nhiều người/agent và ownership đã tách. Tài liệu này không tự yêu cầu tạo thêm agent/chat.

## 2. Vai trò và ownership

| Vai trò            | Sở hữu điển hình                                                 | Tránh sửa đồng thời với                       |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------- |
| Tích hợp           | progress, contract index, RC, package/lock/config, phase reports | Mọi người đang đổi dependency/schema/config   |
| Nền tảng           | DB connection, isolation, backup/restore, runtime                | CMS schema/test integration                   |
| Nội dung/UX        | content register, nguồn, IA, prototype, research                 | Người đang migration nội dung cùng record     |
| Design system      | token, UI primitives, globals                                    | Shell/public/CMS đang override cùng component |
| Frontend public    | Layout/sections/templates theo task                              | Design system khi contract chưa ổn định       |
| CMS/backend        | Schema/services/admin/API/workflow/time/cache                    | Public khi DTO/schema đang đổi                |
| QA                 | Tests/runners/evidence/defects                                   | Agent triển khai đang đổi cùng test runner    |
| Vận hành/analytics | Release config, observability, event contract                    | Tích hợp/package và lead API                  |

Đây là vai trò trách nhiệm, không bắt buộc một agent cho mỗi vai trò. Một agent có thể thực hiện tuần tự. Người tích hợp quản lý file dùng chung; task khác đề xuất patch/interface rồi phối hợp, không tự ghi đè.

## 3. Checklist trước khi bắt đầu task

1. Xác nhận root, branch/worktree, Git status và yêu cầu mới nhất. Không coi file untracked là rác.
2. Đọc task/deps/progress/evidence, kiểm tra đầu ra có thật. Nếu version khác, ghi chênh lệch.
3. Tìm source bằng `rg`, đọc caller/consumer/API/query/schema; xác định source of truth. Không chỉ sửa file tên giống task.
4. Ghi phạm vi file và những file chung cần phối hợp; nhận ownership trước mutation khi có nhiều người làm.
5. Liệt kê dữ liệu/migration/env/providers có thể bị tác động. Kiểm DB/storage path và notification mode trước test.
6. Đọc Next local docs tương ứng; xác nhận runtime/dependency được dùng. Không tự nâng Next/React để giải quyết một lỗi chưa chẩn đoán.
7. Ghi expected behavior và kiểm tra dự kiến. UI có viewport/states/content cần chụp; backend có failure/permission/time cases.
8. Triển khai đợt nhỏ, review diff, kiểm tra, sửa. Không gom 10 task vào một patch không thể nghiệm thu riêng.

## 4. Mẫu bàn giao bắt buộc

```markdown
# Handoff <Rxx> — <tên>

- Status: implemented | verified | accepted | blocked
- Owner / reviewer: ...
- Source: branch/commit/dirty snapshot ...
- Build/runtime/dataset: ...
- Phạm vi hoàn thành: ...
- File/contract thay đổi: ...
- Migration/backward compatibility: ... hoặc không áp dụng
- Nguồn dữ liệu/ai xác nhận: ... hoặc chưa đủ

## Hành vi cuối cùng

Mô tả trước/sau theo tình huống cụ thể, không kể lại mọi thao tác.

## Kiểm tra

| Command/case | Result/exit code | Evidence |
| ... | pass/fail/blocked/not_run | ... |

## UI review

Route/template/state/viewport + screenshot before/after + findings đã sửa.
Nếu không có UI, ghi không áp dụng và lý do.

## Còn thiếu/rủi ro

Defect ID, mức độ, owner, hạn, tác động, hành động tiếp theo.
Không ghi “không có” khi còn chưa chạy build/UAT/thiết bị thật.

## Bàn giao tiếp

Task nào có thể bắt đầu, input path/contract/version cần dùng.
```

## 5. Mẫu sổ quyết định và blocker

Decision record: `ID | ngày | task | vấn đề | phương án | lựa chọn/lý do | tác động UI/API/data/cache | evidence | người xác nhận | khi nào xem lại`.

Blocker record: `ID | task | lỗi/thiếu gì | bằng chứng | phần phụ thuộc | phần vẫn làm được | ai có thể giải quyết | câu hỏi/đầu vào cụ thể cần nhận`.

Không chờ người dùng quyết định lại màu/nav/giải pháp thông thường đã có trong brief. Chỉ gom câu hỏi về dữ liệu nghiệp vụ/ảnh/quyền sử dụng/cổng dịch vụ/môi trường thật hoặc lựa chọn có tác động chưa được xác định. Không coi im lặng là xác nhận giá/bằng cấp hoặc release.

## 6. Mẫu content register

```text
record_id,entity_id,field,current_value,proposed_value,scope,
source_reference,source_date,effective_from,effective_to,
owner,reviewer,verification_status,public_urls,conflict,decision_id
```

Trạng thái xác minh: `unreviewed`, `needs_source`, `in_review`, `confirmed`, `rejected`, `superseded`. `confirmed` có người/nguồn/ngày. Nội dung chưa có giá trị không điền giá trị giả để CSV trông đầy đủ.

## 7. Mẫu nghiên cứu người dùng

```text
participant_code,segment,session_date,consent_record,build,device,
task_id,outcome_independent_assisted_failed,time_seconds,
wrong_path,hesitation,participant_question,confidence,
finding_id,fix_task_id,retest_session,retest_outcome
```

Ghi câu hỏi/kết quả đúng quan sát, không tự thêm participant hoặc thời gian. Raw recording lưu nơi có quyền phù hợp, không commit công khai. Báo cáo số lượt và bối cảnh; chỉ so sánh trước/sau khi có baseline cùng cách đo.

## 8. Tình huống dễ làm sai và cách xử lý

| Tình huống                                    | Cách xử lý đúng                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Docs nói xong nhưng code/ảnh còn lỗi          | Mở defect, ghi trạng thái chưa nghiệm thu, không chép lại kết luận cũ                          |
| Test import `lib/db` tự mở DB thật            | Dừng chạy test mutation, làm R01; không “chạy thử xem sao”                                     |
| Lỗi HTTP từ terminal nhưng browser mở được    | Giữ transport error/code, kiểm môi trường; không tuyên bố site 500                             |
| Build lỗi khi dev đang dùng `.next`           | Cô lập checkout/output/process; không dừng server người dùng tùy tiện                          |
| CMS có trường date nhưng query chỉ lọc status | Kiểm logic thời gian + cache, thêm boundary tests, không gọi là scheduling đã xong             |
| Thiếu file/ảnh/giá chính thức                 | Dùng trạng thái nội bộ/blocker; public theo thiết kế trung tính, không giả tài liệu/chứng thực |
| Selector E2E cũ                               | Cập nhật theo semantics hợp lệ và kiểm hành vi, không bỏ test                                  |
| Muốn xanh nhanh bằng đổi threshold            | Giữ tiêu chí, chẩn đoán/sửa hoặc ghi limitation có quyết định rõ                               |
| Revert release có migration/lead mới          | Dùng rollback tương thích và preserve dữ liệu mới; không restore DB cũ mù                      |
| Phase 11 chưa đủ thời gian                    | Bàn giao trạng thái đang theo dõi, không seed 30 ngày analytics                                |

## 9. Quy tắc chốt cuối

Người tích hợp kiểm dependency graph và evidence, cập nhật progress tuần tự rồi phase matrix. Không cộng số task implemented thành phần trăm nghiệm thu. Nếu cần phần trăm, chỉ tính checklist đã accepted trong phạm vi được chốt và công bố cách tính/trọng số; vẫn hiển thị gate chưa đạt riêng.

Agent báo hoàn thành cần nêu: kết quả, bằng chứng, giới hạn và việc tiếp theo. Không dùng “hoàn hảo/100%/WCAG compliant/production ready” khi phạm vi kiểm tra không hỗ trợ kết luận đó.

## 10. Gói đầu vào Topica cần chuẩn bị

R03 gom các mục này theo owner, nhận bản có ngày/phiên bản. Đây là danh sách chuẩn bị, không yêu cầu gửi credential hoặc thông tin riêng trong chat.

| Đầu vào                                                                                  | Ai xác nhận                        | Agent làm được trong khi chờ                                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| Tên/quan hệ tổ chức, đơn vị cấp bằng, hình thức học/thi và cách diễn đạt                 | Đào tạo/lãnh đạo                   | Audit các chỗ mâu thuẫn, chuẩn bị content model và layout                        |
| 5 ngành/chuyên ngành, curriculum, tín chỉ/thời gian và miễn trừ                          | Đào tạo                            | Mapping ID, template, case khác đối tượng với fixture nội bộ                     |
| Học phí/phí khác/học bổng, điều kiện, khóa/đối tượng/hiệu lực, cam kết tài chính         | Tài chính/tuyển sinh               | Validation, phép tính fixture, policy editor và register nguồn                   |
| Các kỳ/hạn/khai giảng, hồ sơ, URL xét tuyển/tra cứu                                      | Tuyển sinh                         | Logic ngày/trạng thái, luồng không có kỳ mở và tests                             |
| Hotline/email/giờ hỗ trợ/địa điểm, URL thư viện/LMS/khảo thí                             | Vận hành/tuyển sinh                | Nguồn contact chung, nhãn/semantics và dịch vụ directory                         |
| Ảnh/logo/story/giảng viên/đối tác và quyền sử dụng                                       | Marketing/đơn vị sở hữu            | Manifest, crop spec, layout không ảnh; không tạo chứng thực thay thế             |
| File chính thức và nguồn/ngày/phiên bản, chính sách dữ liệu                              | Đào tạo/tài chính/đơn vị phụ trách | Document model, validation/file states và policy versioning                      |
| Người duyệt/biên tập, nhóm người tham gia nghiên cứu và lịch UAT                         | Topica chỉ định                    | Prototype, kịch bản, sample log trống, checklist đào tạo                         |
| Domain/hosting/runtime/volume, quyền triển khai, người nhận cảnh báo và mục tiêu RPO/RTO | Vận hành                           | Runbook, phân tích deployment và rehearsal fixture; không deploy khi thiếu quyền |

Nội dung thật còn thiếu không ngăn agent hoàn thiện component bằng fixture trong môi trường riêng; nó ngăn công bố dữ liệu chưa được xác nhận và đóng gate nghiệp vụ tương ứng.
