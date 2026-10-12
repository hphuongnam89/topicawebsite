# Hướng dẫn CMS Topica

CMS hiện dùng SQLite và Next.js. Public đọc qua `lib/services/publication.ts` và `lib/cms/queries.ts`; HTML được làm sạch tại boundary và khi render. Hướng dẫn WordPress/REST/ISR cũ không còn đúng source.

Vào `/admin/content`. Chương trình dùng mã `ba`, `tourism`, `it`, `english`, `chinese`; nội dung mới dùng mã duy nhất. Khi sửa record hiện có, nhấn **Tải nội dung hiện có theo mã** trước khi sửa. Bản nháp lưu snapshot đầy đủ, giữ input khi lỗi và cảnh báo thay đổi chưa lưu.

1. Editor nhập, lưu nháp, xem trước, gửi duyệt.
2. Admin duyệt đúng phiên bản; yêu cầu sửa phải ghi lý do. Sửa sau duyệt tạo bản nháp mới và cần duyệt lại.
3. Admin công bố ngay hoặc chọn lịch. Giao diện nhập giờ Việt Nam, server lưu UTC. Hiệu lực bao gồm thời điểm bắt đầu, không bao gồm thời điểm hết hạn.
4. Lưu trữ gỡ phiên bản khỏi public; bản cũ không tự xuất hiện lại khi bản mới hết hạn/lưu trữ.

Lưu/thao tác trên version cũ nhận `409`: tải bản mới trước khi sửa, không tự ghi đè. Preview cần session và token gắn người dùng/phiên bản/thời gian cập nhật, hết hạn sau 5 phút. Đóng tab preview để quay về CMS; preview không vào search/sitemap.

| Thao tác | Editor | Admin |
| --- | --- | --- |
| Tạo nháp, xem trước, gửi duyệt | Có | Có |
| Duyệt, công bố, đặt lịch, lưu trữ | Không | Có |
| Xem lead, tài khoản, cấu hình trang chủ | Không | Có |

Quyền kiểm tra lại từ DB mỗi request. API page/article cũ chỉ sửa nháp chưa tham gia revision; nội dung công bố/phân phiên bản dùng workflow mới. Nguồn, ngày, giá, tài liệu cần đủ trước publish; không nhập fixture QA vào CMS thật.

Public chọn dữ liệu theo thời gian mỗi request. Nội dung đã quản lý nhưng archived/expired không tự lấy lại bản tĩnh. Dữ liệu tĩnh được người dùng cho phép dùng khi chưa có record quản lý, chưa đồng nghĩa nghiệm thu nghiệp vụ. Xem [đối chiếu nguồn](docs/agent-execution/SOURCE_RECONCILIATION_2026-10-12.md).

Trường cấu trúc phụ vẫn cần JSON; preview domain ngoài page/article hiện là thông tin, chưa có UAT 5 nhiệm vụ với editor. R19 còn mở. Backup DB+uploads xem [runbook](docs/agent-execution/STORAGE_BUNDLE_RUNBOOK.md).
