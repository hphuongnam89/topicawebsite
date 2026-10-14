# Hướng dẫn CMS Topica

CMS hiện dùng SQLite và Next.js. Public đọc qua `lib/services/publication.ts` và `lib/cms/queries.ts`; HTML được làm sạch tại boundary và khi render. Hướng dẫn WordPress/REST/ISR cũ không còn đúng source.

Vào `/admin/content`. Chương trình dùng mã `ba`, `tourism`, `it`, `english`, `chinese`; nội dung mới dùng mã duy nhất. Khi sửa record hiện có, nhấn **Tải nội dung hiện có theo mã** trước khi sửa. Bản nháp lưu snapshot đầy đủ, giữ input khi lỗi và cảnh báo thay đổi chưa lưu.

1. Editor nhập, lưu nháp, xem trước, gửi duyệt.
2. Admin duyệt đúng phiên bản; yêu cầu sửa phải ghi lý do. Sửa sau duyệt tạo bản nháp mới và cần duyệt lại.
3. Admin công bố ngay hoặc chọn lịch. Giao diện nhập giờ Việt Nam, server lưu UTC. Hiệu lực bao gồm thời điểm bắt đầu, không bao gồm thời điểm hết hạn.
4. Lưu trữ gỡ phiên bản khỏi public; bản cũ không tự xuất hiện lại khi bản mới hết hạn/lưu trữ.

Lưu/thao tác trên version cũ nhận `409`: tải bản mới trước khi sửa, không tự ghi đè. Preview cần session và token gắn người dùng/phiên bản/thời gian cập nhật, hết hạn sau 5 phút. Bài viết/trang dùng template nội dung; ngành học, tuyển sinh, học phí, học bổng, tài liệu và liên hệ có bố cục xem trước theo loại dữ liệu. Đây là bản xem trước dữ liệu của revision, chưa thay thế UAT trên public template. Preview không vào search/sitemap.

| Thao tác                                | Editor | Admin |
| --------------------------------------- | ------ | ----- |
| Tạo nháp, xem trước, gửi duyệt          | Có     | Có    |
| Duyệt, công bố, đặt lịch, lưu trữ       | Không  | Có    |
| Xem lead, tài khoản, cấu hình trang chủ | Không  | Có    |

Quyền kiểm tra lại từ DB mỗi request. API page/article cũ chỉ sửa nháp chưa tham gia revision; nội dung công bố/phân phiên bản dùng workflow mới. Nguồn, ngày, giá, tài liệu cần đủ trước publish; không nhập fixture QA vào CMS thật.

Dashboard quản trị hiển thị số bản chờ duyệt/lead mới, bản đã công bố có deadline hoặc hiệu lực trong 30 ngày, record thiếu nguồn và tài liệu thiếu file URL. Các cảnh báo trỏ tới nội dung cần rà soát; chúng không tự sửa hay tự gỡ nội dung. Nhật ký `/admin/audit` lọc theo người thực hiện, hành động, loại nội dung và ngày.

Thư viện media phân biệt public/private. Tệp private lưu ngoài `public`, chỉ admin xem; không xóa được tệp đang được revision, trang, bài viết, tài liệu hoặc cấu hình tham chiếu. Tải mới được giới hạn MIME/kích thước; backup bundle mới chứa riêng media public/private và restore vẫn đọc bundle v1.

Editor có trường riêng cho danh sách alias/ngành, tín chỉ-thời lượng cơ bản, khoản phí, URL dịch vụ, địa điểm và tài liệu hướng dẫn. `assumptions` và lộ trình `tracks` chi tiết vẫn cần JSON. Chưa có walkthrough 5 nhiệm vụ với biên tập viên trên staging, nên R19 vẫn chưa được nghiệm thu. Public chọn dữ liệu theo thời gian mỗi request. Nội dung đã quản lý nhưng archived/expired không tự lấy lại bản tĩnh. Dữ liệu tĩnh được người dùng cho phép dùng khi chưa có record quản lý, chưa đồng nghĩa nghiệm thu nghiệp vụ. Xem [đối chiếu nguồn](docs/agent-execution/SOURCE_RECONCILIATION_2026-10-12.md).

Backup DB+uploads xem [runbook](docs/agent-execution/STORAGE_BUNDLE_RUNBOOK.md).
