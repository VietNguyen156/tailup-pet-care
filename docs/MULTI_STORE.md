# TailUp nhiều cửa hàng

## Mô hình quyền

- `SUPER_ADMIN`: chủ nền tảng, `/platform`; tạo/tạm ngưng cửa hàng, cấp tài khoản chủ cửa hàng, xem toàn bộ số liệu và vào quản trị từng cửa hàng.
- `STORE_ADMIN`: chủ cửa hàng, `/admin`; `User.storeId` xác định cửa hàng được quản trị. Tham số URL hoặc request body không thể thay đổi phạm vi này.
- `CUSTOMER`: một tài khoản dùng chung TailUp, `/dashboard`; thú cưng thuộc tài khoản. Đơn hàng và lịch hẹn thuộc cửa hàng cung cấp sản phẩm/dịch vụ.

Trang cửa hàng: `/stores/[slug]`. Danh sách cửa hàng: `/stores`.
Danh mục toàn nền tảng vẫn có ở `/services` và `/shop`; mỗi mục hiển thị cửa hàng cung cấp.
Giỏ hàng giữ sản phẩm nhiều cửa hàng nhưng người dùng thanh toán riêng từng cửa hàng. Server từ chối đơn trộn sản phẩm.
Mỗi cửa hàng có sức chứa khung giờ riêng; lịch của cùng một thú cưng vẫn được kiểm tra trùng giờ trên toàn nền tảng.

## Số liệu

- Quản trị tổng: số cửa hàng hoạt động/tổng, số tài khoản khách hàng, tổng tiền các đơn COMPLETED/PAID và giá trị dịch vụ COMPLETED (thống kê riêng vì chưa có xác nhận thu tiền dịch vụ).
- Từng cửa hàng: lịch chờ, đơn chờ, doanh thu đơn đã thu tiền, giá trị dịch vụ hoàn thành, khách đã giao dịch.
- Khách của một cửa hàng là tài khoản có ít nhất một lịch hẹn hoặc đơn hàng tại cửa hàng đó; kể cả giao dịch đã hủy. Đây không phải chỉ số active users.
- Số liệu toàn thời gian. Bảng lịch/đơn và danh sách khách giới hạn 100 bản ghi; các số tổng không bị giới hạn 100.
- Một người dùng nhiều cửa hàng được tính trong từng cửa hàng tương ứng, nhưng chỉ là một tài khoản trong tổng toàn nền tảng.

## Chuyển đổi dữ liệu cũ

Migration: `202611020001_multi_store`.

1. Tạo cửa hàng ban đầu `store-tailup`, đường dẫn `/stores/tailup`.
2. Gán sản phẩm, dịch vụ, lịch hẹn, đơn hàng và khung giờ hiện có vào cửa hàng này.
3. Chuyển tất cả tài khoản `ADMIN` cũ thành `SUPER_ADMIN`; `STAFF` cũ thành `STORE_ADMIN` của cửa hàng ban đầu. `CUSTOMER` không đổi. Không đổi email, mật khẩu, ID hoặc lịch sử.
4. Đổi unique key của khung giờ thành `(storeId, bookingDate, timeSlot)`.
5. Các cửa hàng mới và tài khoản chủ cửa hàng được tạo từ `/platform`; có thể cấp thêm tài khoản cho cửa hàng ban đầu ngay trên trang này. Không tự chuyển một tài khoản khách hàng có sẵn thành chủ cửa hàng.

## Triển khai với Vercel và database đang dùng chung

KHÔNG chạy migration trên database thật chỉ để xem thử giao diện, và KHÔNG push lên nhánh production tự deploy trước khi đã lên lịch chuyển đổi.
Mã cũ và schema mới không tương thích: mã cũ không ghi `storeId`, còn vai trò cũ đã đổi tên.

Quy trình chuyển đổi có thời gian bảo trì:

1. Sao lưu database hiện tại bằng cơ chế backup của dịch vụ MySQL; xác minh có thể khôi phục. Kiểm tra các tài khoản ADMIN cũ vì tất cả sẽ được nâng thành quản trị tổng.
2. Build/kiểm thử commit mới trên database riêng. Nếu dùng Vercel Preview, cấu hình DATABASE_URL riêng cho Preview; không dùng chung database Production cho kiểm thử ghi dữ liệu.
3. Chuẩn bị deployment mới và bố trí cửa sổ bảo trì, ngừng nhận giao dịch trên bản cũ trong lúc chuyển đổi.
4. Với DATABASE_URL trỏ đúng Production, chạy `npm run db:deploy`. Không dùng `db push`, `migrate reset` hoặc sửa migration đã áp dụng.
5. Triển khai bản code mới trên production ngay sau migration. Nếu đã build sẵn, promote đúng deployment đã kiểm tra và đúng môi trường Production. Không promote deployment còn dùng database test.
6. Kiểm tra `/login`, `/platform`, `/stores/tailup`, `/admin` với tài khoản chủ cửa hàng, lịch hẹn và đơn hàng cũ. Bật nhận giao dịch lại.
7. Quản trị tổng cập nhật địa chỉ/điện thoại cửa hàng ban đầu và cấp tài khoản chủ cửa hàng nếu chưa có.

Không tự động chạy migrate trong build: mỗi build Preview không được thay đổi database dùng chung.
Rollback ứng dụng cũ đơn thuần không đủ sau migration; cần kế hoạch khôi phục database tương ứng và xử lý giao dịch phát sinh trong thời gian chuyển đổi.

## Kiểm thử đã bổ sung

- `npm test`: kiểm tra ma trận quyền, từ chối role cũ/không hợp lệ, đăng ký không thể tự cấp role/store và validation cửa hàng.
- `scripts/integration.ts`: chạy trên TEST_DATABASE_URL riêng có tên kết thúc `_test`; kiểm tra sức chứa, trùng giờ, quyền sở hữu thú cưng, tồn kho và rollback đơn.
- `scripts/tenant-integration.ts`: HTTP test với quản trị tổng, hai cửa hàng và hai khách hàng; chặn đọc/sửa chéo cửa hàng, chặn cấp quyền trái phép, không trộn đơn, sức chứa độc lập, khóa cửa hàng và kiểm tra dữ liệu cũ sau migration.

### Tạo môi trường test riêng

Các script dưới đây từ chối sử dụng database không kết thúc bằng `_test` khi có thao tác test dữ liệu. File `.env.tenant-test` chứa kết nối test và được `.gitignore` loại trừ.

```powershell
# Cần quyền tạo database trên máy chủ cấu hình trong .env.
node --env-file=.env scripts/prepare-tenant-test.mjs

# Dựng schema cũ + dữ liệu giả để kiểm tra nâng cấp.
node --env-file=.env.tenant-test scripts/prepare-legacy-test.mjs
node --env-file=.env.tenant-test node_modules/prisma/build/index.js migrate resolve --applied 202610310001_init
node --env-file=.env.tenant-test node_modules/prisma/build/index.js migrate deploy

# Chạy server dùng riêng database test ở cổng 3005.
node scripts/dev-tenant-test.mjs
```

Trong terminal khác:

```powershell
node --env-file=.env.tenant-test --import tsx scripts/integration.ts
node --env-file=.env.tenant-test --import tsx scripts/tenant-integration.ts
node --env-file=.env.tenant-test --import tsx scripts/seed-tenant-demo.ts
```

Demo chỉ dùng trên database test:

- Quản trị tổng: `demo-super@tailup.test`.
- Chủ Pet House: `demo-owner@tailup.test`.
- Chủ Paw Spa: `demo-owner-b@tailup.test`.
- Mật khẩu demo: `TailUpDemo2026!`.
- Đăng nhập tại `http://127.0.0.1:3005/login`.

Không dùng các tài khoản/mật khẩu demo cho production. Script demo kiểm tra tên database trước khi chạy.

### Website riêng và nội dung cửa hàng

- Website cửa hàng: `/stores/{slug}`. Menu gồm Trang chủ, Giới thiệu (`/about`), Dịch vụ (`/services`), Thông tin (`/information`), Liên hệ (`/contact`). Khách và chủ cửa hàng xem cùng website; chủ cửa hàng có thêm liên kết quản trị/chỉnh sửa. Trang chủ TailUp `/` vẫn là trang chung của nền tảng.
- Vào `/admin` → **Nội dung website** để sửa tiêu đề, lời giới thiệu, giới thiệu cửa hàng, nội dung dịch vụ, tối đa 8 bài viết, email, giờ mở cửa và mạng xã hội. Bấm **Lưu nội dung website** để áp dụng. Địa chỉ, tên và điện thoại chỉnh ở **Thông tin cửa hàng**.
- Mục riêng **Quản lý banner** hiển thị ảnh thu nhỏ, tiêu đề, thứ tự và trạng thái của tối đa 5 banner. Bấm **Thêm banner** hoặc **Sửa** để chọn ảnh từ máy, xem trước, sửa tiêu đề/mô tả/nội dung nút/đường dẫn/thứ tự. Để trống cả nút và đường dẫn nếu muốn ẩn nút. Nhận JPG/PNG/WebP tối đa 2 MB/ảnh, khuyến nghị 1600 × 700 px. Bấm **Lưu banner** mới tải ảnh và lưu dữ liệu; **Hủy chỉnh sửa** không thay đổi ảnh đã lưu.
- Dùng mũi tên lên/xuống để lưu thứ tự, checkbox để bật/tắt. **Xóa** yêu cầu xác nhận, xóa cả metadata và ảnh tải lên; nếu ảnh đó từng được dùng trong giới thiệu/bài viết, liên kết ảnh tương ứng cũng được gỡ để không để lại ảnh hỏng. Khi danh sách rỗng hoặc tất cả tắt, carousel được ẩn. Chỉ banner bật được gửi đến carousel từ server, theo đúng thứ tự khi tải lại trang.
- Metadata banner nằm trong `Store.website.banners`; ảnh vẫn dùng bảng `StoreBanner` (tối đa 5 bản ghi mỗi cửa hàng), phù hợp Vercel không có ổ đĩa ghi lâu dài. Đổi thứ tự không đổi vị trí lưu ảnh. Lưu ảnh và metadata dùng cùng transaction; lưu nội dung website dùng cùng khóa cửa hàng và giữ nguyên banner hiện tại, tránh ghi đè dữ liệu từ tab cũ. Không cần migration mới cho lần nâng cấp quản lý banner này.
- API quản trị: `GET/POST/PATCH/DELETE /api/admin/banners?storeId=...`. POST/PATCH chỉnh thông tin dùng multipart, PATCH bật/tắt/sắp xếp và DELETE dùng JSON. Backend kiểm tra quyền cửa hàng, định dạng thực của ảnh, dung lượng, số lượng, thứ tự và URL của nút. URL chấp nhận đường dẫn nội bộ bắt đầu `/` hoặc HTTPS; không chấp nhận JavaScript, URL dạng `//` hay thông tin đăng nhập trong URL. API upload cũ trả 410 để tránh client cũ thay ảnh ngoài thao tác lưu nguyên tử.
- Khách chỉ đọc được ảnh của banner bật. Chủ cửa hàng và quản trị tổng được xem trước ảnh banner tắt; chủ cửa hàng khác không được xem. Dữ liệu banner cũ được chuẩn hóa khi đọc, giữ nguyên liên kết ảnh/vị trí; không tạo lại banner mặc định sau khi xóa hết.
- Nội dung dạng văn bản thuần, React escape khi hiển thị; không nhận HTML hay SVG. API xác thực chủ cửa hàng, kiểm tra cửa hàng hoạt động, giới hạn kích thước và nhận diện định dạng file. Khách hàng không được sửa. Quản trị tổng có thể sửa từng cửa hàng.
- Nút **Đăng xuất** hiển thị trên desktop và điện thoại, xóa phiên phía server và cookie đăng nhập.
- Migration bổ sung: `202611020003_store_website` (Store.website nullable và bảng StoreBanner). Dữ liệu cửa hàng cũ dùng nội dung mặc định cho đến lần lưu đầu, không bị ghi đè tự động.
- Kiểm thử riêng: `node --env-file=.env.tenant-test --import tsx scripts/banner-integration.ts` (`website-integration.ts` chạy cùng bộ test). Kiểm tra cả 5 trang, đủ 5 ảnh tải lên, CRUD/banner rỗng, thay ảnh, CTA, thứ tự, trạng thái, truy cập chéo cửa hàng, định dạng/dung lượng ảnh, lưu nội dung không ghi đè banner, thêm đồng thời và đăng xuất.

### Carousel ảnh cửa hàng riêng

- Mỗi cửa hàng có khu vực **Một góc [tên cửa hàng]** ở đầu trang chủ, ngay dưới thanh điều hướng và trước banner. Carousel tự chuyển ảnh mỗi 5 giây, quay lại ảnh đầu khi hết. Giao diện người xem không có nút tạm dừng, dãy ảnh thu nhỏ hoặc số đếm ảnh. Đây là carousel ảnh riêng, độc lập với banner và không có nút quảng cáo/CTA.
- Chủ cửa hàng vào `/admin#gallery-manager` → **Ảnh cửa hàng** để chọn ảnh từ máy, xem trước, thêm mô tả tùy chọn và bấm **Thêm ảnh vào carousel**. Xóa từng ảnh có xác nhận. Ảnh được sắp theo thứ tự thêm; không dùng giới hạn 5 vị trí của banner.
- Khách chỉ xem ảnh hoặc chuyển trước/sau; cũng hỗ trợ phím trái/phải khi focus carousel. Không có giao diện sửa/xóa cho khách. Khi chưa có ảnh hoặc xóa hết, khu vực này được ẩn.
- Ảnh JPG/PNG/WebP tối đa 2 MB, khuyến nghị 1600 × 900 px; tái sử dụng bộ đọc upload có giới hạn và kiểm tra định dạng ở backend. Lưu ảnh và mô tả trong bảng `StoreGalleryImage`, liên kết `storeId`; xóa là xóa cả bản ghi và ảnh.
- API quản trị: `GET/POST/DELETE /api/admin/gallery?storeId=...`. Chủ cửa hàng chỉ quản lý cửa hàng được cấp, quản trị tổng quản lý mọi cửa hàng; CUSTOMER và khách chưa đăng nhập không được ghi dữ liệu. Route ảnh kiểm tra đúng cửa hàng/ảnh và trạng thái cửa hàng.
- Migration bổ sung: `202611030001_store_gallery`. Chỉ áp dụng vào database test trong lúc phát triển, phối hợp migration/deploy khi đưa lên Vercel.
- Kiểm thử: `node --env-file=.env.tenant-test --import tsx scripts/gallery-integration.ts`.

### Ảnh minh họa dịch vụ

- Để chỉnh sửa danh mục: vào Admin → **Sửa sản phẩm / dịch vụ**, chọn tab **Sản phẩm** hoặc **Dịch vụ**, rồi bấm nút **Sửa sản phẩm / Sửa dịch vụ** của mục tương ứng. Bấm **Lưu thay đổi** để lưu hoặc **Hủy** để bỏ nội dung nháp. Chủ cửa hàng chỉ chỉnh sửa danh mục của cửa hàng mình; backend tiếp tục kiểm tra quyền trên từng yêu cầu.

- Trong Admin → **Thêm dịch vụ**, chủ cửa hàng có thể chọn ảnh từ máy và xem trước. Trong tab **Dịch vụ**, mở mục cần sửa để thay ảnh; không chọn ảnh mới sẽ giữ ảnh hiện tại. Ảnh là tùy chọn, JPG/PNG/WebP tối đa 2 MB, khuyến nghị 1200 × 800 px.
- Lưu ảnh và dịch vụ trong cùng thao tác database; bảng `ServiceImage` chứa ảnh nhị phân, liên kết duy nhất với dịch vụ. Không lưu file vào ổ đĩa tạm của Vercel. Bộ kiểm tra upload dùng chung với banner.
- Thẻ dịch vụ hiển thị ảnh đã tải lên. Mũi tên mở `/services/[slug]`, nơi khách xem ảnh, mô tả, giá, thời lượng và quy trình trước khi bấm đặt lịch. Liên kết quay lại dẫn về danh mục đúng cửa hàng.
- API thêm/sửa hỗ trợ cả JSON cũ và multipart gồm `data` (JSON) và `image` (file tùy chọn). Backend kiểm tra quyền theo cửa hàng của dịch vụ; khách không có quyền ghi. Ảnh của dịch vụ bị xóa/cửa hàng ngừng hoạt động không được phục vụ; ảnh dịch vụ đang ẩn chỉ chủ cửa hàng/quản trị tổng được xem.
- Migration `202611030002_service_image` cần được áp dụng trước khi triển khai bản code này. Trong quá trình phát triển chỉ áp dụng vào database test; chưa thay đổi database production.
- Kiểm thử: `node --env-file=.env.tenant-test --import tsx scripts/service-image-integration.ts`.

### Sản phẩm và dịch vụ

- Chủ cửa hàng chỉ xem danh mục của mình, kể cả trang chủ, `/shop`, `/services`, `/stores`, giỏ hàng và trang chọn cửa hàng đặt lịch. Đường dẫn trực tiếp đến danh mục cửa hàng khác trả về 404. Khách hàng và quản trị tổng vẫn xem được các cửa hàng đang hoạt động.
- Khi cấp cửa hàng mới, hệ thống luôn sao chép dịch vụ mẫu TailUp thành các bản ghi riêng. Tùy chọn sản phẩm mẫu chỉ áp dụng cho sản phẩm. Cửa hàng đã tồn tại không bị tự động ghi đè hay khôi phục mục đã xóa.
- Tại `/admin`, thêm mục bằng biểu mẫu phía trên; mở tab Sản phẩm hoặc Dịch vụ và bấm tên để sửa thông tin, ẩn/hiện hoặc xóa. Chủ cửa hàng không thể chuyển mục sang cửa hàng khác.
- Xóa danh mục đặt `deletedAt` và tắt `isActive`: không thể mua/đặt mới hoặc kích hoạt lại qua PATCH, nhưng lịch sử đơn hàng và lịch hẹn vẫn giữ liên kết. Dịch vụ mẫu của cửa hàng khác không bị ảnh hưởng.
- Migration `202611020002_catalog_deletion` thêm hai cột nullable, không xóa dữ liệu. Cần áp dụng cùng các migration trước trong đợt triển khai production đã lên lịch; môi trường Vercel dùng chung database nên không chạy lệnh migration vào `.env` khi chỉ thử giao diện.
Database test được giữ lại để xem giao diện; khi không còn dùng, xóa riêng database test có tên trong `.env.tenant-test` bằng công cụ quản trị MySQL. Không xóa database thật.
