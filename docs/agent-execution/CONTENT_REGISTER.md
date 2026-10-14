# R03 — Sổ nội dung, checkpoint 12/10/2026

## Bổ sung phiên hoàn thiện buổi tối

Người dùng cho phép nguồn hiện hữu và topicauni.edu.vn. [Đối chiếu nguồn](SOURCE_RECONCILIATION_2026-10-12.md) ghi D01–D08, dữ liệu đã sửa và mâu thuẫn còn mở. CSV giữ snapshot trước sửa, không thay thế source hiện tại. Chưa có owner/reviewer nghiệp vụ; không tự chuyển 192 record sang `confirmed`.

Trạng thái: **in_progress**, chưa có record được xác nhận. Owner khảo sát: Codex;
owner/reviewer nghiệp vụ chưa được chỉ định. [CONTENT_REGISTER.csv](CONTENT_REGISTER.csv)
chứa 192 field hiện có trong source, đều `needs_source`. Chỉ đọc module dữ liệu tĩnh;
không mở DB thật, không công bố dữ liệu mới. `code_origin` là nơi quan sát giá trị,
không phải nguồn chính thức. Để trống ngày hiệu lực/nguồn/owner thay vì suy diễn từ
tên `OFFICIAL`, comment `verified`, năm cohort hoặc câu mô tả quyết định.

Phạm vi đã kiểm kê: năm ngành, đơn vị cấp bằng/triển khai, hình thức học, ảnh ngành,
track đối tượng, thời gian/tín chỉ, học phí/phí, học bổng, contact theo vai trò,
địa chỉ và cổng dịch vụ. Chưa đủ: kỳ tuyển sinh đang mở, phương thức thi, văn bản
tải xuống, toàn bộ ảnh/đối tác/chứng thực và record legacy CMS. Các phần này chưa
được kiểm kê đầy đủ; không coi file CSV là inventory hoàn chỉnh.

## Mâu thuẫn và đầu vào cần nhận

| ID  | Quan sát                                                                                    | Cần đầu mối xác nhận                                                   |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| C01 | `programs.ts` ghi THPT 3.5 năm/9 kỳ; T03 hiện 3 năm/9 kỳ                                    | Đào tạo: thời lượng theo từng ngành/đối tượng, quyết định miễn tín chỉ |
| C02 | Báo cáo phase 1 ghi học bổng 100/50/30%; source hiện các giá trị khác                       | Tài chính/tuyển sinh: quyết định, điều kiện, phạm vi và ngày hiệu lực  |
| C03 | Tên ngành du lịch và chuyên ngành marketing/đồ họa có cách ghi khác nhau                    | Đào tạo: tên ngành, chuyên ngành, mã ngành và văn bằng chính thức      |
| C04 | 600.000đ/tín chỉ, 126 tín chỉ, 75.600.000đ và phí 1.000.000đ chỉ có claim trong code        | Tài chính: biểu phí từng khóa/đối tượng, khoản loại trừ và cách tính   |
| C05 | Contact/cổng có flag verified, comment địa chỉ 28/08 nhưng chưa có capture/document tại run | Vận hành: vai trò, URL cuối, địa chỉ hiện hành và quyền sử dụng ảnh    |

Cần gom văn bản có số/ngày, file hoặc URL nguồn, phạm vi áp dụng, người duyệt và
ngày hiệu lực cho các nhóm trên; không chỉ xác nhận toàn bộ website bằng một câu.
Chưa nhận được đầu vào thì tiếp tục prototype/contract fixture, giữ gate nội dung mở.

## Tiến độ Đợt B — Bộ phiếu hỏi nghiệp vụ (Run 01)

Ngày 12/10/2026, toàn bộ các câu hỏi nghiệp vụ và mâu thuẫn dữ liệu đã được tổng hợp thành các gói yêu cầu chuyên biệt cho từng phòng ban tại [PHASE_B_STAKEHOLDER_PACKETS.md](../evidence/hyper-ui-remediation/run-01/PHASE_B_STAKEHOLDER_PACKETS.md):

- **PKT-ADM**: Ban Tuyển sinh (URL portal tra cứu hồ sơ HUI-01, đợt tuyển sinh đang mở HUI-02).
- **PKT-ACA**: Phòng Đào tạo (Thời lượng 3.5 năm vs 3 năm C01, mã/tên ngành C03, duyệt public copy HUI-05).
- **PKT-FIN**: Ban Tài chính (Quyết định biểu phí C04, chính sách học bổng C02).
- **PKT-MKT**: Ban Marketing & Đối ngoại (Tên và thỏa thuận logo đối tác 6–9 HUI-07, quyền ảnh hero).
- **PKT-OPS**: Ban Vận hành & Hệ thống (Kênh liên hệ C05, URL hệ thống Elearning & Thư viện số).

Trong thời gian chờ phản hồi, toàn bộ hệ thống áp dụng cơ chế **Fallback an toàn** (giữ nhãn trung tính, ẩn logo chưa xác minh) để tiến hành Đợt C mà không gây gián đoạn kỹ thuật.

## Quyết định an toàn

Migration 003 đã ngừng tự chèn/publish dữ liệu tĩnh chưa duyệt; fixture CMS chỉ ở
test. Điều đó không xóa record đã được migration cũ tạo, và public vẫn có fallback
vào dữ liệu tĩnh. R16/R18/R21 phải rà provenance, revisions, effective dates và
quy tắc fallback trước nghiệm thu. Không tự xóa hoặc sửa DB thật để che claim cũ.

Generator dùng trong lượt này lưu cùng evidence R03 để tái hiện khảo sát ban đầu;
không chạy lại đè CSV sau khi người duyệt đã bổ sung nguồn/trạng thái.
