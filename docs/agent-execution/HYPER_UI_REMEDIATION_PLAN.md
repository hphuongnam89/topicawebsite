# Kế hoạch sửa giao diện theo review Hyper UI

> Kế hoạch này xử lý finding HUI-01–HUI-09. Để triển khai trải nghiệm toàn website T01–T13, thứ tự package và bàn giao cho agent, dùng thêm [TOPICA_VISUAL_EXPERIENCE_PLAN.md](TOPICA_VISUAL_EXPERIENCE_PLAN.md); tài liệu mới không thay backlog hoặc trạng thái tiến độ.

- Ngày lập: 12/10/2026
- Cập nhật kế hoạch: 12/10/2026, sau khi đối chiếu blocker, effort QA và khả năng bắt đầu từng phần.
- Trạng thái: `planned`; chưa triển khai finding nào trong gói này.
- Nguồn: [review và evidence Hyper UI](../evidence/hyper-ui-review-2026-10-12/REVIEW.md).
- Phạm vi: hoàn tất chín finding HUI-01–HUI-09 và cải thiện liền kề cần thiết để người học dùng website rõ ràng, nhất quán hơn.
- Backlog cha: R03–R13, R20–R23. Kế hoạch này chia các finding theo phụ thuộc và bàn giao; không thay đổi trạng thái R-task hoặc `progress.json`.

## 1. Mục tiêu và kết quả cuối

Người học có thể hiểu chương trình, chọn ngành, đọc điều kiện/chi phí, phân biệt tư vấn với đăng ký/tra cứu, và tìm hỗ trợ mà không gặp nhãn gây hiểu nhầm hoặc thông tin nội bộ biên tập. Trang desktop/mobile dùng cùng hệ typography, màu và hành vi. Ảnh, học phí, trạng thái tuyển sinh, văn bằng và đối tác chỉ được trình bày theo dữ liệu có nguồn và trạng thái được duyệt.

Kết quả cuối phải có screenshot sau sửa cho cùng route, state và viewport của baseline; ghi rõ source/build/runtime; liệt kê finding đã sửa và finding còn chờ nguồn/owner; có kết quả kiểm tra đúng phạm vi với exit code. Screenshot hiện tại là bằng chứng **trước sửa**, không được đổi nhãn thành sau sửa.

## 2. Tài liệu đầu vào và luật ưu tiên

Agent nhận gói việc đọc theo thứ tự:

1. `AGENTS.md` ở repo và thư mục đang sửa.
2. Tài liệu này và review gốc được dẫn ở trên.
3. `docs/agent-execution/README.md`, task R tương ứng trong `IMPLEMENTATION_BACKLOG.md`, `DESIGN_UX_SPEC.md`, `ACCEPTANCE_AND_EVIDENCE.md`, `AGENT_HANDOFF.md`.
4. `progress.json`, Git status, source/build manifest và evidence cũ liên quan.
5. Tìm lại route, file, callers, data contract và CSS thực tế trước khi sửa. Đường dẫn trong task là gợi ý, không đảm bảo source chưa đổi.
6. Với Next.js code: mở guide liên quan trong `node_modules/next/dist/docs/` trước khi viết code.

Ưu tiên theo thứ tự: an toàn/trung thực dữ liệu → semantics và hành vi CTA → tính nhất quán → nhịp trang/visual polish → hiệu ứng. `DESIGN_UX_SPEC.md` và nội dung Topica đã xác nhận quyết định màu, kích thước, touch target, ảnh và CTA. Hyper UI cung cấp khung bố cục/thẩm mỹ; không thay thế spec hoặc hợp thức hóa neon, hiệu ứng nặng hay dependency mới.

### Blueprint thiết kế theo bốn lớp Hyper UI

1. **Structural blueprint:** chọn **Narrative Workflow (#15)** cho T01 vì người học cần đi lần lượt từ hiểu chương trình, so sánh ngành, kiểm chứng bằng chứng/chi phí đến chọn bước tiếp theo. Không dùng hero căn giữa rồi xếp ba card bằng nhau. Năm ngành vẫn được trình bày và so sánh đủ theo `DESIGN_UX_SPEC.md`; heuristic tải nhận thức yêu cầu phân cấp và grouping dễ quét, không phải cắt tùy tiện số lựa chọn.
2. **Core design system:** giữ navy, gold tiết chế, Be Vietnam Pro và Lora theo `DESIGN_UX_SPEC.md`; dùng tokens và component đang có làm nguồn chuẩn. Khuyến nghị OKLCH/Shadcn/Tailwind trong Hyper UI không tự động thành yêu cầu migration. Chỉ đổi biểu diễn token khi hỗ trợ trình duyệt dự án, giữ nguyên vai trò/mức tương phản và có bằng chứng cải thiện; không thêm dependency chỉ để khớp skill.
3. **Visual focus:** điểm nhấn là một hero có nội dung/ảnh được xác nhận và một vùng chọn ngành/bằng chứng có tương phản navy rõ. Chỉ dùng ảnh có ledger quyền/nguồn và không dùng spotlight/aurora/glass/beam chỉ để thêm hiệu ứng. Nếu asset chưa được duyệt, dùng layout chữ/shape biên tập không hàm ý có người học, giảng viên hay đối tác thật.
4. **Kinetic interactions:** giữ phản hồi hiện có khi mở menu/accordion và CTA; rà trạng thái `hover`, `active`, `focus-visible`, `loading`, `disabled` theo ngữ cảnh. Ưu tiên transform/opacity nhẹ khi thật sự hỗ trợ phản hồi; nội dung không phụ thuộc animation. Không thêm Framer Motion hay hiệu ứng cuộn nếu stack hiện tại không cần; `prefers-reduced-motion` phải giữ nguyên khả năng nhận biết thay đổi trạng thái.

Đây là quyết định theo sản phẩm, không phải lệnh thêm hiệu ứng: nếu review không chứng minh một hiệu ứng cải thiện hiểu biết hoặc phản hồi thao tác, giữ bố cục/animation hiện có và ghi lý do. Mọi thay đổi về visual world phải theo `DESIGN_UX_SPEC.md` và ghi decision khi khác spec.

## 3. Chia gói, phụ thuộc và ownership

Mỗi hàng là một gói có một owner tích hợp. Có thể giao song song các gói không sở hữu chung file, nhưng agent phải chốt ownership file/config/CMS data trước khi sửa đồng thời. R03 là luồng xác nhận nội dung; R09 là luồng design system; R21 là luồng tích hợp contract. Không để hai owner chỉnh cùng file cùng lúc.

| Gói | Finding/backlog | Vai trò | Phụ thuộc cứng | Kết quả chính |
|---|---|---|---|---|
| HU-01 — Chuẩn CTA và trạng thái tuyển sinh | HUI-01, HUI-02; R04, R05, R12, R13, R21 | Frontend + data/content reviewer | R03, link map R07 và contract của R05 | Label diễn đạt đúng hành động; badge lấy cùng trạng thái kỳ hiệu lực đã duyệt |
| HU-02 — Đồng bộ design tokens và typography | HUI-03, HUI-08 (phần token/màu); R08, R09, R10, R12, R13 | Design system/frontend | R08 chốt direction; HU-01 chốt semantics CTA | Heading, semantic colors, focus/hover/disabled; cung cấp token cho cụm hỗ trợ |
| HU-03 — Tái cấu trúc trang chủ theo hành trình | HUI-04; R08, R11, R20 | UX/frontend/content | HU-01; R08 xác nhận IA/concept | Crosswalk component-order T01, ngành và bằng chứng quyết định dễ thấy sớm; anchor/CTA không gãy |
| HU-04 — Header tablet và hành động hỗ trợ | HUI-05, HUI-08 (integration: layout/hành vi); R04, R10 | Frontend; owner tích hợp HUI-08 | HU-02 cung cấp tokens | Breakpoint utility rõ; một hành động nổi ưu tiên mỗi thời điểm; không chồng/focus trap |
| HU-05 — Copy nguồn và nội dung học thuật public | HUI-06; R03, R06, R12, R21 | Content/frontend | R03 xác nhận trường và public-safe language | Nguồn dễ đọc; trạng thái biên tập không rò ra trang công khai; hero claims/CTA có nguồn và đích |
| HU-06 — Manifest media và đối tác | HUI-07; R03, R06, R11 | Media/content owner + frontend | Chủ sở hữu media/quan hệ xác nhận; R03/R06 | Mỗi media có tên, nguồn, quyền, alt, caption và phạm vi quan hệ hoặc không xuất bản |
| HU-07 — Reduced motion và lượt QA lại | HUI-09 cùng toàn bộ HUI-01–08; R09, R20, R22, R23 | Frontend QA/accessibility | HU-01–06; HU-06 cho quyết định asset nếu chặn | Fix cascade motion; kiểm tra browser/manual và report retest sau sửa |

### Phân loại phần làm ngay, phần chờ và điều kiện nghiệm thu

`Có thể bắt đầu` nghĩa là agent có thể khảo sát hoặc sửa code bằng dữ liệu/fixture hiện có. Nó không có nghĩa cả HU đã hết blocker hoặc được phép publish. Gắn nhãn riêng cho từng subtask:

| Gói/phần | Có thể làm ngay | Chờ đầu vào hoặc quyết định | Chỉ nghiệm thu khi |
|---|---|---|---|
| HU-01 / HUI-01 CTA | Đổi “Xem trạng thái hồ sơ” thành “Xem chương trình” nếu đích là `#chuong-trinh`; rà nhãn và route hiện có | URL/chức năng tra cứu hồ sơ và owner dịch vụ nếu muốn CTA tra cứu | Mọi label khớp action và browser xác nhận điểm đến thật |
| HU-01 / HUI-02 badge | Audit source/status consumer, chuẩn bị contract/test fixture; ẩn trạng thái không đủ nguồn | Kỳ tuyển sinh, chương trình/đối tượng áp dụng, ngày hiệu lực, nguồn, người duyệt | Home/catalog/admission dùng cùng logic với case mở, hết hạn, chưa có kỳ |
| HU-02 | Inventory tokens, typography, contrast/state và page override; sửa defect thuần kỹ thuật không đổi hướng thiết kế | R08 chốt direction/copy semantics nếu thay đổi ảnh hưởng trải nghiệm hoặc nhận diện | Screenshot ở các template chịu tác động, state keyboard/contrast và reviewer design theo R08 |
| HU-03 | Kiểm kê thứ tự section, ID/fragment hiện hữu, CTA href và breakpoint; chuẩn bị phương án layout | R08 chốt IA/concept; R03 xác nhận mọi claim/asset được giữ hoặc di chuyển; R20 cho xác nhận người dùng | Thứ tự/hành trình được review; anchors và callers không gãy; R20 chỉ được tuyên bố đạt khi có nghiên cứu thật |
| HU-04 | Kiểm tra hiện trạng header ở chiều rộng 700–1100px, sửa lỗi CSS/behavior tái hiện được | Quyết định chính sách utility/action nếu lựa chọn ảnh hưởng điều hướng hoặc ưu tiên CTA | Header/action/menu đủ bằng chứng ở breakpoint sửa, keyboard/focus và mobile |
| HU-05 | Inventory public text, filename/note nội bộ và source metadata; chuẩn bị empty-state | Nguồn chính thức, public wording và người duyệt trong R03/R06 | Không lộ thông tin biên tập; citation/claim được đối chiếu nguồn |
| HU-06 | Lập ledger các asset đang hiển thị, giữ file/metadata, dùng layout không claim khi cần | Owner, nguồn, phạm vi quyền, tên đối tác/người/đơn vị được thể hiện | Mọi media public có quyền/nhãn/alt/caption phù hợp hoặc đã được ẩn |
| HU-07 / HUI-09 fix | Xác nhận cascade hiện tại, sửa rule reduced-motion độc lập và kiểm computed style bằng browser | Không cần business input cho fix CSS; integration retest đợi HU-01–06 được tích hợp | Reduced mode được kiểm thực tế; sau đó chạy regression tổng hợp, không gộp hai trạng thái này |

Không dùng nhãn “no business blocker” cho cả HU khi chỉ một phần kỹ thuật có thể bắt đầu. `blocked` chỉ áp dụng subtask phụ thuộc trực tiếp; agent vẫn làm phần độc lập và ghi rõ phần nào còn mở.

R20 nghiên cứu người dùng thật chỉ thực hiện khi Topica bố trí người tham gia và có consent phù hợp. Chạy usability nội bộ bằng agent không được ghi thành nghiên cứu người dùng. Nếu nghiên cứu chưa có, ghi blocker độc lập; không làm dừng sửa kỹ thuật có thể kiểm tra bằng tiêu chí khác.

Coordinator của gói Hyper UI là nguồn chuẩn cho trạng thái HUI-01–HUI-09 và cross-link tới R-tasks/evidence trong `HYPER_UI_REMEDIATION_PLAN.md` cùng run `summary.md`; không tạo status song song không đồng bộ trong `progress.json`. Với HUI-08, HU-02 sở hữu token/semantic color; HU-04 sở hữu vị trí, stacking, focus và hành vi; HU-04 là một owner tích hợp duy nhất, chịu trách nhiệm retest và đóng HUI-08 sau khi nhận phần token HU-02.

## 4. Kế hoạch thao tác theo từng finding

### HU-01 — CTA đúng tên, đúng điểm đến; badge cùng một nguồn

**Phạm vi rà soát:** `components/program/ProgramHero.tsx`, `components/sections/HeroSection.tsx`, `data/program-details.ts`, `data/programs.ts`, nguồn/service kỳ tuyển sinh, `components/sections/ProgramsSection.tsx`, `components/admission/CurrentAdmissions.tsx`, trang home/catalogue/programs, liên kết điều hướng và test consumers hiện có. Mở callers thật trước khi chọn file sửa.

- **Subtask độc lập, làm trước:** thay “Xem trạng thái hồ sơ” bằng “Xem chương trình” khi đích là `#chuong-trinh`; xác nhận `#chuong-trinh` tồn tại đúng một lần và cuộn tới nội dung có thể nhận diện. Chỉ dùng “Tra cứu hồ sơ” nếu R04 xác nhận portal có chức năng tra cứu đúng nhãn; link phải tới endpoint thực, nêu rõ đi sang hệ thống ngoài khi phù hợp.
- Truy vết nguồn badge “Đang tuyển sinh”. Badge public chỉ được render từ admission record đã duyệt, nằm trong khoảng hiệu lực, đúng chương trình/đợt. Dùng một hàm/status contract chung cho home, catalog và admission pages; không rải `isOpen`/status riêng hoặc ngày hard-code ở UI.
- Kiểm cả CTA “Đăng ký xét tuyển” ở homepage: nhãn này phải tới application portal đã xác nhận ở R04, không tới form tư vấn hoặc landing page. Ghi source/owner cho đích. Đây là checklist xác minh source/đích; không mặc định CTA hiện tại sai.
- Khi fixture/site không có kỳ hiệu lực, không hiển thị “Đang tuyển sinh”; dùng nội dung trung tính đã UX/content reviewer chấp thuận, như “Xem chương trình” hoặc link tư vấn. Không tự tạo ngày, hạn hay kỳ mới để làm giao diện trông đầy đủ.
- Không đổi nguồn học phí/tín chỉ để sửa chữ; kiểm tra unit/tín chỉ của các trang khác không mâu thuẫn và mở blocker nguồn khi cần.

**Nghiệm thu tách đôi:** HUI-01 có thể `verified` khi program CTA và homepage application CTA có nhãn/đích đúng đã kiểm browser, dù trạng thái HUI-02 còn `blocked` vì thiếu kỳ/nguồn. HUI-02 chỉ `verified` sau khi case fixture mở/đã hết hạn/không có kỳ thống nhất ở home/catalog/admission và có evidence nguồn cho trạng thái public. Không nâng HU-01 lên `accepted` nếu một finding thuộc gói còn mở. Gắn screenshot và evidence nguồn, không dùng screenshot source code thay screenshot UI.

### HU-02 — Hệ chữ và CTA nhất quán desktop/mobile

**Phạm vi rà soát:** `app/design-tokens.css`, `app/theme.css`, `app/globals.css`, `components/ui/Button.tsx`, `components/program/ProgramHero.tsx`, `components/ui/*` và page intro/heading thật của T01/T02/T03/T05; overrides CSS của từng template.

- Dùng `DESIGN_UX_SPEC.md` làm contract: Be Vietnam Pro cho body/UI, Lora chọn lọc cho tiêu đề/truyền đạt học thuật; trang con H1 khởi điểm 40–48px desktop, 30–36px mobile. Trang chủ giữ 48–64px desktop, 32–40px mobile. Dùng clamp/layout theo độ dài tiếng Việt; không ép cỡ gây cắt dấu hoặc gãy dòng xấu.
- Thống nhất nền sáng, navy `#00264D`/`#16466B`, gold `#B78744` tiết chế. Giữ trang ngành có cá tính học thuật nếu tokens, link, focus và CTA vẫn tuân cùng quy ước; không buộc mọi section thành một màu.
- Sửa page-specific override gây trang ngành sans/gold-nâu biệt lập khi override không có lý do trong spec. Kiểm tra CTA default/hover/focus/disabled/loading ở nền sáng và nền navy; ưu tiên một primary và một secondary; đo contrast thay vì dựa vào tên token.
- Rà soát button/floating/support links để chỉ một CTA mobile nổi ưu tiên tại một thời điểm; màu cyan/blue/red chỉ giữ nếu chúng là affordance social hợp lý và không cạnh tranh action tuyển sinh. Giữ `tel:`/`mailto:`/external URL đúng semantics.

**Nghiệm thu:** screenshot T01/T03/T05 sau sửa tại viewport liên quan theo mục 6; H1 mobile theo spec hoặc có lý do nội dung; không tràn/cắt tiếng Việt; states keyboard nhìn rõ; contrast theo acceptance; mobile CTA ≥44px theo mục tiêu nội bộ spec. HU-02 chỉ chỉnh color tokens/support affordance của HUI-08; vị trí/chồng lấn/focus thuộc HU-04, owner tích hợp của finding. Không coi screenshot đơn lẻ là chứng nhận accessibility.

### HU-03 — Trang chủ: ngành và bằng chứng trước quy trình/form dài

**Phạm vi rà soát:** `app/(main)/page.tsx`, `components/sections/HeroSection.tsx`, `AdmissionTimeline.tsx`, `ProgramsSection.tsx`, `TrustSection.tsx`, `WhyTopicaSection.tsx`, `TestimonialSection.tsx`, `PartnersSection.tsx`, contact/form sections, IDs/anchors/navigation.

- Giữ hero có thông điệp/ảnh và tối đa hai CTA. Dùng Narrative Workflow có chọn lọc: (1) hiểu chương trình và trạng thái kỳ hiện hành, (2) chọn ngành, (3) thông tin tin cậy/cách học/bằng chứng đã xác nhận, (4) quy trình tuyển sinh ngắn, (5) nhận tư vấn. Không bắt buộc animation hay landing page một màn hình.
- Crosswalk T01 phải chốt trước khi đổi JSX. Thứ tự đích theo `DESIGN_UX_SPEC.md`: `HeroSection` → `CurrentAdmissions` → `ProgramsSection` (đủ 5 ngành) → `TrustSection` (bằng chứng đã duyệt, có thể chứa `PartnersSection` chỉ khi quan hệ được xác nhận) → trải nghiệm học (`WhyTopicaSection` và `CampusSection` khi có nguồn/quyền) → lối sang học phí/lộ trình (`AdmissionTimeline` là lộ trình tuyển sinh; T01 cần link rõ tới T05, chỉ tóm tắt số liệu khi có source) → `TestimonialSection` (chỉ dữ liệu/ảnh được duyệt) → `NewsPreview` → liên hệ/form (`LeadForm` một lần, cuối hành trình theo spec). Gộp/chuyển component chỉ theo nội dung thực; không nhân đôi và không mặc định thêm giá/claim mới.
- Để xử lý quãng cuộn mobile dài mà không đặt form trước bằng chứng/chi phí, giữ một `LeadForm` duy nhất ở cuối hành trình nhưng cho CTA “Nhận tư vấn” theo ngữ cảnh ở hero/ngành/học phí nhảy thẳng đến cùng `#tu-van`. Tinh gọn section lặp/không phục vụ quyết định; không lấy vị trí y tuyệt đối làm KPI. Retest anchor sau sticky header, keyboard và bàn phím ảo; mở link phải đưa form/heading nhìn thấy được.
- Source hiện có `HeroSection` claim “văn bằng cử nhân được Bộ GD&ĐT công nhận” và CTA “Đăng ký xét tuyển”. Không kết luận claim sai; tạo/đối chiếu record R03 cho câu claim, phạm vi/chương trình, source văn bản, ngày và reviewer có thẩm quyền; CTA phải được R04 xác nhận đích cổng xét tuyển thật. Chưa đủ xác nhận thì không để CTA/claim hàm ý sai; dùng copy/CTA trung tính đã được reviewer chấp thuận. Bổ sung case này vào HU-01 và HU-05 acceptance, không chỉ HUI-01 trên trang ngành.
- Đưa catalog ngành đến ngay sau hero/trạng thái; rút 5 bước thành summary/link hoặc dời xuống dưới danh mục và chứng cứ. Xóa lặp heading/CTA “bắt đầu hành trình” khi action giống nhau. Đặt form một lần tại vị trí có ngữ cảnh; hero CTA “Nhận tư vấn” phải tới form/contact thực.
- Giữ bento/khối bất đối xứng nơi chúng tổ chức các thông tin độc lập rõ nghĩa; tránh lặp card chỉ để đủ bố cục. Không di chuyển/sao chép testimonial, statistic, accreditation, partnership, campus hoặc claim nghề nghiệp nếu chưa có nguồn/quyền R03.
- Tại điểm chọn ngành, giữ đủ 5 lựa chọn có thể so sánh nhanh theo facts nguồn chuẩn; không thêm bộ lọc phức tạp hoặc cắt xuống 4 để áp heuristic tải nhận thức. Với 6 nhóm menu, kiểm tra grouping/nhãn/ưu tiên và hỗ trợ ghi nhớ thay vì xóa mục dịch vụ cần thiết. Mỗi vùng CTA tối đa 1 primary + 1 secondary theo spec.
- Không lấy thời điểm section y=2467px hay form y=9220px trong báo cáo trước làm KPI người dùng. Dùng làm baseline định vị; nghiệm thu dựa trên thứ tự nội dung, số lần lặp và screenshot.
- Trước khi đổi thứ tự section, tạo anchor inventory: mọi `id`, fragment trong nav/MegaMenu/footer/CTA, liên kết nội trang, mục lục và URL bên ngoài đã chia sẻ. Giữ ID ổn định nếu có thể; nếu bắt buộc đổi, cập nhật toàn caller và cung cấp redirect/alias phù hợp. Kiểm tra hash tới đúng section sau khi header sticky settle, với `scroll-margin`/offset theo spec.
- MegaMenu chỉ là điểm kiểm tra khi inventory xác nhận nó trỏ tới anchor/route bị đổi; không ghi sẵn một regression giả định. Lưu kết quả từng fragment: exists, unique, target heading, focus/scroll behavior.

**Nghiệm thu:** thứ tự component ghi trong decision/crosswalk và tuân T01 spec hoặc có lý do/evidence cho khác biệt; người đọc thấy 5 ngành trước quy trình dài; học phí/lộ trình có lối tới T05; chỉ có một mục đích chính mỗi vùng; mọi CTA “Nhận tư vấn” theo ngữ cảnh tới cùng `#tu-van`; form chỉ tồn tại một lần và nhìn/nhấn được sau jump ở mobile/keyboard. Sticky CTA không che footer/form/keyboard. Các section đã giữ đều có nội dung/asset đúng status. Kiểm anchor inventory trước/sau và mọi caller liên quan. Full-page capture là tùy chọn: review Hyper UI trước đó gặp CDP timeout khi chụp fullPage, vì vậy ưu tiên screenshot viewport liền mạch theo section; ghi rõ route, scroll offset và phần coverage, chỉ dùng fullPage nếu runner hoàn tất ổn định.

Trước khi đánh dấu HU-03 verified, walkthrough ba kịch bản checklist (không gọi là nghiên cứu người dùng): Jordan lần đầu tìm hiểu phải hiểu “đăng ký” khác “tư vấn”; Casey trên mobile phải thấy ngành, bằng chứng và bước tiếp theo mà không cuộn qua khối lặp; Riley thử trạng thái chưa có kỳ, claim thiếu nguồn, CTA/anchor và quay lại từ T05. Ghi điểm dừng, thông tin phải nhớ, vùng gây do dự và đường phục hồi. R20 vẫn cần người thật nếu muốn tuyên bố usability đã được xác nhận.

### HU-04 — Tablet header và floating actions

**Phạm vi rà soát:** `components/layout/Header.tsx`, `MobileNav.tsx`, `MegaMenu.tsx`, `FloatingActions.tsx`, `MobileStickyBar.tsx`, `ProgramStickyBar.tsx`, header utility, CSS breakpoint/tokens.

- Kiểm tra kích thước thật quanh 768, breakpoint hiện dùng, 1024 và các chiều rộng lân cận. Khi header utility không vừa: cho wrap có chủ ý, gộp utility, ẩn mục ít ưu tiên có alternative trong menu, hoặc chuyển breakpoint sang mobile. Không giảm font/meta đến mức khó đọc và không để email dính nav.
- Chuẩn hóa hành động nổi theo R10 policy: menu/search/dialog/form focus/keyboard ưu tiên trên sticky; không đồng thời chồng social float, floating CTA và sticky action bar trên nút submit. Giữ safe area/end-content padding; anchor có offset.
- Kiểm tra Escape, focus mở/đóng, scroll lock, link thật, keyboard Tab/Shift+Tab và trạng thái drawer sau sửa CSS. Baseline menu pass không thay lượt retest.

**Nghiệm thu:** screenshot browser tại kích thước lỗi tái hiện, breakpoint ngay hai bên và đại diện trong dải 700–1100px; bổ sung mobile 390/320 khi shell/action dùng chung. Không chồng/cắt/nav-wrap xấu; menu/action không chặn nhau; `documentElement.scrollWidth <= innerWidth` nhưng cũng quan sát bằng mắt để không dùng clip che tràn; thao tác keyboard/form nhìn thấy được. Chỉ ghi MegaMenu regression nếu link inventory/browser xác nhận có lỗi. Ghi dimensions thực.

### HU-05 — Nguồn đọc được và public copy an toàn

**Phạm vi rà soát:** `components/program/ProgramQuickFacts.tsx`, `StudyRoadmap.tsx`, `PendingAcademicSections.tsx`, `components/sections/HeroSection.tsx`, `data/program-details.ts`, CMS public reader/content mapping, routes T01/T03 và public copy.

- Đổi “Những gì đã được xác minh” cho người học thành nhãn trung tính, ví dụ “Thông tin chương trình”, sau khi reviewer nội dung chốt wording.
- Không render filename nội bộ như `chương trình đào tạo-02.jpg` làm trích dẫn. Hiển thị tiêu đề tài liệu, đơn vị/nguồn, ngày/phiên bản khi metadata có thật; otherwise gắn “Đang chờ tài liệu chính thức”/ẩn trường theo UX/content reviewer, không dựng citation mới.
- Gỡ ghi chú biên tập như “Sẽ cập nhật sau khi chốt bộ dữ liệu…” khỏi trang public. Nếu tổng học phần chưa chốt, không trình bày số count như final; dùng trạng thái public trung tính được duyệt hoặc bỏ section/field. Ghi thiếu nội dung trong CMS/hand-off nội bộ.
- Không viết lại claim bằng cấp, tuyển sinh, curriculum, job outcomes hoặc luật trong công đoạn UI nếu không có source và reviewer. Mâu thuẫn chuyển sang `CONTENT_REGISTER.md` theo R03, kèm owner.
- Với homepage hero, record phải gắn đúng câu chữ claim về văn bằng, phạm vi chương trình/đối tượng, source văn bản và người review; CTA “Đăng ký xét tuyển” ghi URL cuối/redirect/function đã xác nhận ở R04. Nếu không đủ, dùng fallback copy/action public-neutral đã được reviewer chấp thuận; không tự viết claim thay thế.

**Nghiệm thu:** không còn filename/note nội bộ trong DOM public của năm ngành và CMS preview; citation thật mở đúng resource; empty/missing source state rõ ràng; claim hero được đối chiếu tới record/source/reviewer; homepage CTA xét tuyển có đích thật đã kiểm; không mất record CMS hoặc sửa official value trong migration ngoài ownership. Có content reviewer cho copy quyết định.

### HU-06 — Ảnh và đối tác

**Phạm vi rà soát:** `components/sections/PartnersSection.tsx`, `data/campuses.ts`, `components/sections/HeroSection.tsx`, media contracts, CMS media preview/alt/caption/crop, content register R03/R06.

- Lập media ledger cho asset đang nhìn thấy ở hero, campus, partners, testimonials, faculty: file/URL, asset owner, source, usage permission/scope/expiry, represented org/person, public label, alt, caption, focal point. Không khẳng định từ hình dạng ảnh rằng đó là ảnh AI, giảng viên/sinh viên thật, logo chính thức, hoặc quan hệ đối tác.
- Với logo `Đối tác 6`–`Đối tác 9`, truy nguyên file và relationship/source; chỉ dùng tên và mô tả do chủ sở hữu/nguồn xác nhận. Nếu chưa có, không render như bằng chứng xã hội và không alt generic “Đối tác số”. Thay bằng khối bỏ qua/empty layout public được design, không dùng placeholder rõ ra trang production.
- Review hero collage/mascot về quyền, ảnh người thật hay tổng hợp, caption/ngữ cảnh và focal points tại desktop/mobile. Nếu source/permission chưa đạt, dùng bố cục editorial không ảnh đã thiết kế sẵn; không tạo ảnh AI giả làm học viên/giảng viên.
- `alt` phản ánh chức năng ảnh: ảnh trang trí rỗng alt; logo có tên chính xác; ảnh minh họa có caption tách bối cảnh, tránh alt mang claim chưa kiểm chứng. Rà broken image, crop và kích thước giữ chỗ.

**Nghiệm thu:** ledger cho mọi asset trong phạm vi có owner/source/permission/status; tất cả public logo/ảnh người có label và usage được xác nhận hoặc đã ẩn; alt/caption được xem bằng DOM/screen-reader-relevant browser state; screenshot T01 desktop/mobile và partners section.

### HU-07 — Reduced motion và retest tổng hợp

**Phạm vi rà soát:** `app/globals.css` quanh `@media (prefers-reduced-motion: reduce)` và `.animate-marquee`, Motion components `components/layout/*`, sections, `lib/motion.ts`; QA runner evidence theo R22/R23.

- **Subtask HUI-09 độc lập:** xác nhận cascade specificity/ordering thật. Đảm bảo reduced-motion rule thắng base marquee infinite animation và transition/animation JavaScript liên quan; tắt chuyển động không cần thiết nhưng vẫn giữ trạng thái nội dung/interaction. Dùng reduced motion 150–250ms/transform guidance từ `DESIGN_UX_SPEC.md`. Đây là sửa CSS có thể bắt đầu trước khi HU-01–06 hoàn tất.
- Kiểm tra prefers-reduced-motion `reduce` bằng browser context/OS tương ứng trên trang có marquee, menu, accordion và hero. Nếu motion library có `useReducedMotion` hoặc config, ưu tiên pattern hiện hành trong repo; không thêm framework/dependency mới chỉ để đóng finding.
- **Subtask integration riêng:** sau khi HU-01–06 được ghép vào một source/build fingerprint xác định, retest HUI-01–08: semantic destination/badge, assets/status, headings/colors, tablet/mobile, form/sticky, links/anchors, overflow và accessibility. Rà finding hồi quy và đóng từng ID chỉ khi evidence thực có. HUI-09 có thể verified sớm; HU-07 chỉ verified sau regression tích hợp.

**Nghiệm thu:** computed animation của marquee không tiếp tục lặp trong `reduce`; transitions/motion còn lại không cản nội dung; default mode còn phản hồi bình thường; status pass/fail/not_run tách rõ. Báo cáo R23 lưu browser, source fingerprint/build, viewport/state, ảnh, axe/manual results và performance thật nếu đã được chạy. Không tuyên bố 60fps/Lighthouse/field vitals khi chưa đo.

## 5. Các đợt thực thi

| Đợt | Gói | Bắt đầu khi | Gate để qua đợt |
|---|---|---|---|
| 0 — Baseline, an toàn, ownership | R00/R01 gate đã có evidence hoặc được kiểm lại; ghi Git dirty fingerprint, runtime, build/fixture | Trước mọi test mutation/integration và screenshot so sánh | DB/storage/backup tách thật, notification mock, build/browser xác định, ownership file rõ. Nếu chưa đạt thì chỉ đọc/audit, không chạy test có tác động |
| A — Bắt đầu song song phần độc lập | HUI-01 CTA; audit HUI-02; HUI-04 breakpoint audit; HUI-05 inventory; HU-06 ledger; HUI-09 CSS fix; HU-03 anchor/section inventory | Source/callers và owner file đã xác định; subtask kỹ thuật có thể làm bằng state hiện tại | Mỗi subtask có before evidence/command; blocker business không ngăn phần độc lập; chưa claim package accepted |
| B — Thu thập/chốt đầu vào | HUI-02 visual direction; HUI-02 admission badge; HU-05 public wording/source; HU-06 publishable media; HUI-01 tra cứu portal | Đầu mối tương ứng R03/R04/R05/R06 được chỉ định; gửi câu hỏi cụ thể có deadline do coordinator/Topica thống nhất | Nguồn, ngày hiệu lực, phạm vi, owner và reviewer có bằng chứng; chờ thì giữ trung tính/ẩn claim |
| C — Shared design system và chrome | Hoàn thiện HU-02 → HU-04 | R08 direction và semantics CTA đã rõ; quyền sở hữu token/header files đã chốt | Component states nhất quán; header fit ở vùng breakpoint đã kiểm; mobile action policy có thể thao tác |
| D — Homepage, nội dung và media | HU-03/HU-05; tích hợp HU-06 khi có quyết định media | Direction/IA theo R08; nội dung/asset được duyệt hoặc fallback trung tính; HU-01 status contract khi trang hiển thị badge | Hành trình/section/anchors đúng, content public sạch, asset có nguồn/quyền hoặc đã ẩn |
| E — Regression và nghiệm thu | HU-07 integration, R22/R23 evidence | Gói cần ghép đã tích hợp; R01/R22 safety; build/source fingerprint khóa cho run | Matrix theo phạm vi đủ, P0/P1 đóng, screenshot/browser/manual/axe phù hợp và blocker còn lại có owner/date; R20 tách riêng |

Không buộc team chờ xác nhận business để sửa CSS responsive, kiểm cascade reduced-motion, sửa CTA sai đích đã xác minh, kiểm anchor inventory hoặc chuẩn bị layout không chứa claim. HU-01 badge/học phí/media labels phải giữ trung tính nếu business source chưa có. HU-06 không chặn phần code độc lập; nếu asset đang dùng làm hero/trust proof có thể tạo claim sai, dùng layout fallback cho public trước khi nghiệm thu.

## 6. Bộ bằng chứng cần có

Tạo run riêng: `docs/evidence/hyper-ui-remediation/<run-id>/` (không ghi đè review trước sửa `hyper-ui-review-2026-10-12`). `manifest.json` cần source/build/runtime/status dirty hash, browser/OS/version, viewport thực và fixture/data mode. Lưu ảnh theo route/template-state-width, kết quả link/action/breakpoint, axe/keyboard/reduced-motion khi chạy, danh sách lệnh với exit code, manual QA, content/media sources review và `summary.md`. Trước mỗi run, lưu đường dẫn output riêng; không đụng DB/uploads/backups thật hoặc notification thật.

Baseline đối chiếu khi nghiệm thu cuối (không bắt buộc chụp lại toàn bộ cho từng HU):

| Template/state | Viewport cần retest | Finding |
|---|---|---|
| Home populated/empty admissions/menu closed/open | 1440×900, 1024, 768×900, 390×844, 375, 320 | HUI-02/03/04/05/08/09 |
| Catalog 5 ngành/badge | 1440, 768, 390, 320 | HUI-02/03/06 |
| CNTT hero/academic facts/curriculum/anchor/sticky | 1440, 768, 390, 320 | HUI-01/03/06/08/09 |
| Tuition populated cards/table and CTA | 1440, 768, 390, 320 | HUI-03/08 |
| Sources/media empty/approved | Home & catalog desktop/mobile | HUI-06/07 |

### Chính sách chọn viewport và ảnh bằng chứng

- Trong từng gói, chụp trước/sau tại viewport tái hiện finding, một kích thước ngay dưới/trên breakpoint bị sửa và một viewport đại diện cho layout còn lại. Ví dụ HU-04 kiểm vùng 700–1100px quanh điểm wrap; HU-02 kiểm các breakpoint typography thật sự đổi.
- Khi sửa component dùng chung hoặc chuẩn bị release, chạy matrix cuối theo `ACCEPTANCE_AND_EVIDENCE.md`: T01/T03/T05/shell/form gồm 320, 360, 390, 768, 1024, 1280, 1440px; template khác theo coverage tối thiểu tại tài liệu đó, thêm boundary vừa sửa. Sáu viewport của Hyper UI không đồng nghĩa phải nhân mọi route × mọi state × mọi viewport trong mỗi vòng.
- Với T01/home, dùng đủ states trọng yếu (admission populated/empty, menu closed/open, CTA/sticky) ở kích thước đại diện; trên kích thước ít liên quan chỉ kiểm reflow/overflow. Ghi từng cặp route/state/viewport và lý do chọn.
- FullPage chỉ dùng khi capture kết thúc với output hợp lệ. Nếu CDP timeout, chụp các viewport cuộn tiếp nối, lưu `scrollY`/vùng nội dung, tránh vùng trùng quá lớn, đánh dấu coverage còn thiếu. Không coi ảnh vài vùng là full-page evidence.
- Mỗi ảnh là một lần review có mắt: mở ảnh, ghi finding quan sát được, sửa/retest trong scope. Không tạo ảnh giả lập hoặc thay screenshot bằng DOM/class assertion.

### Checklist tổng hợp theo Impeccable và Hyper UI

Run nghiệm thu ghi ngắn gọn kết quả cho: (a) design specificity/hierarchy/IA; (b) tải nhận thức tại menu, chọn 5 ngành, học phí và CTA; (c) hành trình cảm xúc từ hero/claim qua bằng chứng, chi phí, form và success/error; (d) mười heuristic Nielsen hoặc giải thích `n/a`; (e) checklist rubric 0–2 hiện có trong `DESIGN_UX_SPEC.md`. Điểm chuyên gia là công cụ review có giới hạn, không phải số đo chuyển đổi, khảo sát hay xác nhận người dùng.

Manifest hoặc summary của run thêm bốn trường để agent sau hiểu quyết định thiết kế: `macrostructure` và lý do; `design_system`/token source; `visual_focus` (1–2 điểm nhấn hoặc lý do không thêm hiệu ứng); `motion_policy` (phản hồi mặc định và reduced motion). Mọi exception với bốn lớp Hyper UI phải nêu căn cứ từ brief/spec, không để agent sau tự suy ra.

Mỗi screenshot phải được mở và review bằng mắt. DOM, unit test, class name hay axe đơn lẻ không chứng minh bố cục đẹp/đọc được. Axe tự động không thay keyboard/manual. Nghiên cứu người dùng cần người thật/consent/session log; không agent tạo participant hoặc thời gian. Lighthouse/Core Web Vitals chỉ ghi nếu thật sự chạy theo acceptance docs.

## 7. Cách chia việc cho agent và mẫu bàn giao

Điều phối viên giao **một HU** mỗi owner, không gửi task chung “cải thiện toàn bộ UI”. Prompt gợi ý:

```text
Task: HU-0X — <tên đúng như HYPER_UI_REMEDIATION_PLAN.md>.
Trước sửa, đọc AGENTS.md, README, HYPER_UI_REMEDIATION_PLAN.md, R-task được liên kết,
DESIGN_UX_SPEC.md, ACCEPTANCE_AND_EVIDENCE.md và AGENT_HANDOFF.md.
Nguồn bằng chứng: docs/evidence/hyper-ui-review-2026-10-12/REVIEW.md.
Owner files/contract: <điều phối viên điền>; source/build: <fingerprint/build được chốt>.
Tự kiểm tra git status, route/callers/source trước sửa. Giữ mọi thay đổi có sẵn.
Không tự xác nhận dữ liệu nghiệp vụ, media rights, claim, nghiên cứu người thật hoặc release.
Nếu source/permission thiếu, dựng UI trung tính, ghi blocker và tiếp tục phần không phụ thuộc.
Đọc local Next guide trước khi sửa Next code. Test dùng isolated fixture/storage/outbound stubs;
chạy lệnh phù hợp scope, không ghi pass theo dự kiến.
Sửa, chụp screenshot sau ở viewport quy định, mở và review ảnh, sửa findings nhìn thấy.
Ghi status riêng cho từng HUI finding và từng subtask; phần kỹ thuật verified sớm
không làm package có blocker được coi là accepted. Nếu fullPage timeout, dùng ảnh
viewport tiếp nối và ghi scrollY/coverage thiếu theo mục 6.
Bàn giao theo AGENT_HANDOFF.md: liệt kê file, build/source fingerprint, route/state/
viewport, before/after, commands + exit code, evidence path, owner/blocker/date đã
được thống nhất và việc phụ thuộc kế tiếp. Không tự đặt ngày phản hồi.
Không sửa progress.json; người tích hợp cập nhật sau khi kiểm evidence.
```

Từng HU khi hoàn tất bàn giao bảng `HUI-ID | status | build | route/state/viewport | before | after | findings còn lại | owner/retest`. Chỉ trạng thái `verified/accepted` khi đáp ứng rule từ `README.md` và `ACCEPTANCE_AND_EVIDENCE.md`; status review này không tự thay đổi `R08`, `R09`, `R10`, `R11`, `R12`, `R13`, `R21`, `R23` hoặc phase gates.

## 8. Blocker nghiệp vụ/asset chờ Topica

`CONTENT_REGISTER.md` và `CONTENT_REGISTER.csv` đã có; CSV hiện có 192 field `needs_source`, chưa có owner/reviewer nghiệp vụ được chỉ định và chưa phải inventory hoàn chỉnh của kỳ tuyển sinh, văn bản tải xuống, toàn bộ media/đối tác/chứng thực hay record CMS legacy. Không tạo register trùng. R03 coordinator cập nhật chính register hiện có và gom yêu cầu theo owner, gửi đúng nhóm phụ trách, yêu cầu trả về cho từng nhóm: (1) giá trị/phạm vi chương trình-khóa-đối tượng, (2) file/URL văn bản hoặc quyết định có số/ngày, (3) ngày hiệu lực/hết hạn, (4) owner dữ liệu và reviewer có thẩm quyền, (5) route/CTA/copy được phép công bố, (6) nguồn và quyền media theo từng asset. Nhóm cụ thể: Tuyển sinh xác nhận portal/chức năng, URL, kỳ và deadline; Đào tạo xác nhận ngành/văn bằng/curriculum; Tài chính xác nhận giá/phí/học bổng; Vận hành xác nhận contact/cổng; Marketing/chủ sở hữu asset xác nhận nguồn/quyền/tên đối tác; Topica chỉ định người review public copy và người tham gia R20.

Mỗi câu hỏi ghi `record_id`, `source_reference`, `owner`, `reviewer`, `status`, `impact`, `fallback`, `requested_at`, `requested_due_at`, `response_at` và link evidence. `requested_due_at` phải được coordinator/Topica thống nhất, không tự bịa SLA. Nếu chưa có phản hồi tại ngày chốt đã thống nhất: giữ `needs_source`/`blocked` ở đúng record, dùng neutral/hidden fallback public, tiếp tục code độc lập và báo ảnh hưởng tới gate; im lặng không phải approval. Không gửi trực tiếp cho stakeholder thay người dùng nếu chưa được giao quyền liên hệ.

Fallback: CTA tới anchor đổi nhãn cho đúng; thiếu kỳ thì hiện trạng thái trung tính; thiếu source thì ẩn claim/asset hoặc dùng editorial layout không claim; thiếu review thì không xuất bản dữ liệu nhạy cảm. Không suy diễn “hết kỳ” từ DB fixture trống, “giả ảnh” từ thị giác, hay “official” từ alt/file name.

## 9. Definition of done cho toàn gói

Gói UI này được xem là đã triển khai có kiểm chứng khi:

1. HU-01–HU-07 và HUI-01–HUI-09 được cross-link status cụ thể; finding chưa sửa/thiếu nguồn ghi open/not_run/blocked đúng lý do.
2. HUI-01 CTA tới action thật; HUI-02 trạng thái kỳ cùng contract; HUI-03 headings/colors theo spec; HUI-04 hierarchy home được chụp/review; HUI-05 tablet nav fits; HUI-06 public copy/citation an toàn; HUI-07 media rights/alt có evidence; HUI-08 floating CTA không chồng/cạnh tranh; HUI-09 reduced motion computed và tương tác đã kiểm.
3. Không P0/P1 còn mở trong scope. P2 có owner, hạn, tác động, và quyết định theo G9; không hạ mức để làm sạch báo cáo.
4. Screenshot/evidence ứng với **build/source sau sửa**, đã review mắt; đầy đủ desktop/mobile về scope và states thiết yếu. Regression browser/axe/manual phù hợp. Test không ghi đè real DB, upload, backup, notification.
5. Bàn giao theo mẫu bắt buộc; người tích hợp review diff/contract/evidence và cập nhật progress tuần tự. Không tuyên bố người dùng đã xác nhận nếu chưa có UAT/R20.

Kế hoạch này không phải bằng chứng triển khai hoặc chấp thuận release; mọi finding đều bắt đầu `planned/open` cho đến khi có retest evidence.
