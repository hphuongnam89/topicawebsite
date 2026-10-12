# Analytics hiện có — 12/10/2026

| Sự kiện | Khi ghi | Payload |
| --- | --- | --- |
| page view | Public pathname đổi | Path allowlist, bỏ query/hash, nhóm slug lạ |
| `cta_click` | Nhấn link xét tuyển/tư vấn/tel/mail | Path, button enum admission/consultation/contact |
| `search` | Vào trang tìm kiếm | Path trang, không từ khóa |
| `form_submit` | Server commit lead mới | Program ID, path an toàn, environment; duplicate không ghi thêm |

API event strict, body tối đa 4KB; metadata storage chỉ button enum. Không lưu tên/điện thoại/email/nội dung form/raw URL/session ID. Event lỗi không ảnh hưởng tư vấn. QA dùng DB riêng và `environment=test`, page views cũng DB riêng; không gộp vào production.

`form_submit` là lead đã lưu, không xác nhận notification/trúng tuyển. Click xét tuyển không phải hồ sơ đã nộp. Search chỉ là vào trang, không đếm mọi đổi từ khóa cùng pathname.

R27 mở: chưa có form start/error, download, program/tuition event riêng, session/denominator, bot exclusion, distributed limit/dashboard funnel đầy đủ. Lead limit trong process, phụ thuộc proxy tin cậy; nhiều worker cần shared store. Notification có timeout/stub nhưng chưa outbox/retry/status vận hành. Không dùng QA làm baseline kinh doanh/giả lập 30 ngày.
