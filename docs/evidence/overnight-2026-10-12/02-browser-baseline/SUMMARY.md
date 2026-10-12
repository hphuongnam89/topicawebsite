# R00 — Baseline trình duyệt thật, 01:26 ngày 12/10/2026

Status: implemented từng phần; chưa accepted. Owner: Codex; reviewer: chưa có.
HEAD `f5a6b34709b6f4a88df0e2db10348f7f959ae8bc`, working tree dirty.
Server QA `overnight-01`, localhost:3107; production build riêng
`.next-qa-overnight-01`, DB rỗng đã migrate, outbound stubbed, không copy DB thật.
Chromium 151.0.7922.34, Node v24.19.0, Next16.3.3. Build ID ghi trong manifest.
Snapshot source tại checkpoint sau có thay đổi format/config QA so với lúc chụp;
chưa có fingerprint toàn source đúng thời điểm chụp, không coi baseline là RC.

`results.json`, sáu file `*-axe.json` và 12 ảnh full/top ghi T01/T03/T05 ở
1440×900 và 390×900. Đã xem trực tiếp cả sáu ảnh top; ảnh full đã chụp, chưa review
chi tiết mọi section. Font Be Vietnam Pro/Lora local tải được, dấu tiếng Việt hiện
đúng; chưa đo hiệu năng tải font. Không có ảnh broken trong ba route quan sát.

Route chính trả200; `/hoc-phi` và `/cntt` đến đúng URL cuối200; URL fixture thiếu
trả404. Không phải crawl toàn bộ155 URL. Safari/mobile thật,320px, menu/focus/form
states, journey end-to-end, Lighthouse, staging và UAT: **not_run** trong lượt này.

## Defect register

| ID | Mức | Quan sát/evidence | Task tiếp |
| --- | --- | --- | --- |
| ON-UI01 | P1 | T01-390-top: CTA phụ vượt mép phải và bị cắt, dù scrollWidth=viewport bởi overflow bị clip | R11/R09: CTA wrap/stack, kiểm320/390 |
| ON-A1101 | P1 | Axe serious color-contrast: T01 7/6 nodes desktop/mobile, T03 2/1, T05 4/3 | R09/R23: đọc từng node trong axe JSON, sửa token/consumer rồi đo lại |
| ON-A1102 | P1 | Axe serious definition-list tại T03 cả hai viewport | R12: sửa cấu trúc dl/dt/dd thực tế |
| ON-A1103 | P1 | Axe serious target-size: email utility header mobile chỉ14×14 | R10: hit area đủ24 tối thiểu, ưu tiên44 theo spec |
| ON-UX01 | P1 | T01 form vẫn yêu cầu email/trình độ cùng các trường khác; baseline chưa thử submit | R15: đối chiếu client/server với spec, kiểm success/error/dedup |
| ON-C01 | P1 | T05 vẫn ghi “chính thức”, 2026,600k/126TC; nguồn nghiệp vụ chưa được xác nhận | R03/R05/R21: sổ nội dung, chặn publish chưa duyệt |
| ON-UX02 | P2 | Header mobile utility link chen nhau; desktop nav wrap nhiều dòng | R10: thứ bậc/mobile utility, xem lại bằng screenshot |

Không quy đổi “không scroll ngang” thành reflow pass. Không quy đổi axe tự động
thành toàn bộ WCAG; vẫn cần keyboard, screen reader và thiết bị thật.

Các báo cáo phase0–9 trước đây được giữ nguyên lịch sử và gắn ghi chú audit ngày
12/10. Các claim100%, nguồn chính thức, UX participants và điểm QA lịch sử chưa
có bằng chứng phù hợp thì vẫn **chưa xác minh**. Kết quả173 tests/build hiện tại
chỉ chứng minh phạm vi kỹ thuật trong fixture; không xác nhận claim nghiệp vụ cũ.
