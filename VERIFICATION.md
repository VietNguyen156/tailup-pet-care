# Ghi nhận kiểm tra bàn giao

Ngày: 31/10/2026 (Việt Nam).

| Hạng mục | Kết quả |
| --- | --- |
| Prisma schema format / generate | Thành công, provider MySQL |
| TypeScript (`npm run typecheck`) | Thành công |
| Production build (`npm run build`) | Thành công |
| Unit tests (`npm test`) | 8/8 đạt |
| `npm audit --omit=dev` tại thời điểm kiểm tra | Không ghi nhận advisory trong cây dependencies đã cài |
| Lockfile | Khớp dependencies và devDependencies; có gói SWC cho Windows x64 |
| Trang chủ | Đã xem trên trình duyệt, hình minh họa và bố cục hiển thị |
| Cửa hàng | Đã thao tác lọc Đồ chơi, kết quả từ 6 còn 1 sản phẩm |
| Giỏ hàng | Đã thêm sản phẩm, tăng số lượng 1 → 2, tổng 89.000đ → 178.000đ |
| Lưu giỏ | Tải lại trang vẫn giữ số lượng 2 và tổng tiền |
| Checkout khi chưa đăng nhập | Nút xác nhận bị vô hiệu, có liên kết đăng nhập/đăng ký |
| Form đặt lịch | Đã chuyển bước chọn dịch vụ → thông tin; thiếu ngày/giờ bị chặn |
| MySQL integration tests | Có mã kiểm thử nhưng chưa chạy vì môi trường bàn giao không có MySQL Server |
| Đăng ký/đăng nhập, CRUD pet, đặt lịch, tạo đơn thật | Chưa xác nhận end-to-end trên MySQL |
| Kiểm thử viewport điện thoại thật | Chưa chạy; đã xây CSS responsive với các breakpoint 600/900/1150px |

Các thao tác trình duyệt dùng bản production và `PREVIEW_MODE=true` với catalog minh họa. Không có dữ liệu khách hàng, lịch hẹn hoặc đơn hàng thật được tạo trong quá trình kiểm tra.

Database schema và migration được sinh cho MySQL 8.0.16+. Chưa tuyên bố migration hoặc logic transaction đã được xác nhận trên một máy chủ MySQL thực tế. Hãy chạy hướng dẫn README và `test:integration` trên database test riêng để xác nhận tại máy của bạn.

Bài kiểm thử MySQL kèm theo bao gồm giới hạn 3 lịch khi 5 yêu cầu đồng thời, quyền sở hữu thú cưng, lịch nhân viên trùng, chỗ được giải phóng khi hủy lịch, tồn kho đồng thời và rollback khi tạo đơn lỗi. Kiểm thử này không thay thế toàn bộ kiểm thử API và nghiệp vụ trước khi kinh doanh.
