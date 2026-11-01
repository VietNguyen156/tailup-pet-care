# TailUp — Website dịch vụ & cửa hàng thú cưng

Tên thương hiệu và package đã đổi sang TailUp (`tailup-pet-care`). Thư mục `pawly`, database, Docker volume, email tài khoản mẫu và khóa lưu phiên/giỏ hàng vẫn giữ tên kỹ thuật cũ để tương thích với cài đặt hiện có. Không cần tạo lại database hoặc seed lại khi đổi thương hiệu. Nội dung bài viết và tên tài khoản đã lưu trong database không tự đổi theo code; hãy cập nhật chúng nếu còn chứa tên thương hiệu cũ.

Dự án chạy trên **Windows + VS Code + Node.js + MySQL**. Frontend và API cùng một ứng dụng **Next.js App Router / TypeScript**; truy cập MySQL qua Prisma. Giao diện tiếng Việt, nền kem, xanh lá, cam đất, có bố cục điện thoại và hình minh họa SVG nằm sẵn trong dự án.

## 1. Chạy lần đầu trên Windows

Cài Node.js bản LTS **22 hoặc 24**, MySQL Server **8.0.16 trở lên** và VS Code. MySQL Workbench là công cụ quản lý; bạn vẫn cần MySQL Server đang chạy. Không cần Java, Maven hay XAMPP cho ứng dụng này.

1. Giải nén ZIP. Mở **thư mục `pawly` có `package.json`** bằng VS Code.
2. Mở Terminal → New Terminal, dùng PowerShell và kiểm tra:

```powershell
node -v
npm -v
```

3. Mở MySQL Workbench, kết nối MySQL của bạn, chạy:

```sql
CREATE DATABASE IF NOT EXISTS pawly_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Đây là database mới, riêng cho TailUp. Không cần xóa database các dự án cũ.

4. Trong terminal VS Code:

```powershell
Copy-Item .env.example .env
```

Mở file `.env`, thay mật khẩu MySQL và mật khẩu quản trị mẫu:

```dotenv
DATABASE_URL="mysql://root:MAT_KHAU_MYSQL_CUA_BAN@localhost:3306/pawly_db"
APP_URL="http://localhost:3000"
SEED_ADMIN_PASSWORD="DAT_MAT_KHAU_MAU_IT_NHAT_10_KY_TU"
```

Nếu mật khẩu MySQL chứa ký tự đặc biệt, mã hóa riêng phần mật khẩu theo URL: `@` → `%40`, `#` → `%23`, `:` → `%3A`, `/` → `%2F`, `%` → `%25`. MySQL chạy cổng khác thì thay `3306`.

5. Chạy lần lượt:

```powershell
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

6. Mở **http://localhost:3000**.

`db:deploy` chạy migration có sẵn, không cần quyền tạo shadow database. `db:migrate` chỉ dùng khi bạn chủ động sửa schema trong quá trình phát triển.

Nếu PowerShell báo không chạy được `npm.ps1`, dùng `npm.cmd` thay `npm` hoặc chuyển terminal sang Command Prompt. Không cần thay chính sách bảo mật của máy.

## 2. Tài khoản và dữ liệu mẫu

Sau `npm run db:seed`:

| Vai trò  | Email                    | Mật khẩu                                           |
| -------- | ------------------------ | -------------------------------------------------- |
| Admin    | `admin@pawly.local`      | Giá trị `SEED_ADMIN_PASSWORD` bạn tự đặt           |
| Staff    | `staff1@pawly.local`     | Cùng giá trị seed, chỉ dành cho dữ liệu phát triển |
| Staff    | `staff2@pawly.local`     | Cùng giá trị seed, chỉ dành cho dữ liệu phát triển |
| Customer | Tự đăng ký ở `/register` | Mật khẩu bạn nhập khi đăng ký                      |

Seed có 4 dịch vụ, 6 sản phẩm và 3 bài viết. Chạy lại seed không xóa đơn hàng, không đặt lại tồn kho và không ghi đè mật khẩu tài khoản đã tồn tại. Đổi `SEED_ADMIN_PASSWORD` rồi seed lại **không đổi mật khẩu tài khoản cũ**.

Admin/Staff vào `/admin`; khách hàng vào `/dashboard/pets`. Đăng ký công khai chỉ tạo CUSTOMER, không thể tự gửi role ADMIN để nâng quyền.

## 3. Những gì đã có

- Trang chủ, giới thiệu và điều hướng responsive.
- Danh sách/chi tiết dịch vụ, giá, thời lượng và quy trình.
- Danh sách/chi tiết sản phẩm; tìm tên, lọc danh mục, sắp xếp giá.
- Giỏ hàng lưu trong trình duyệt; thay đổi số lượng, xóa sản phẩm.
- Đăng ký, đăng nhập, đăng xuất; mật khẩu băm scrypt có salt, phiên đăng nhập lưu bằng cookie HttpOnly và token băm trong database.
- Hồ sơ thú cưng: thêm, sửa, xóa, giống, cân nặng, ngày sinh, lịch sử tiêm và ngày chăm sóc tiếp theo. Tuổi được tính từ ngày sinh.
- Đặt lịch 3 bước, React Hook Form + Zod, chọn thú cưng có sẵn hoặc tạo bé mới, chọn nhân viên tùy ý, xem giờ trống và ghi chú.
- Theo dõi/hủy lịch hẹn của mình.
- Tạo đơn COD, tính giá tại server, kiểm tra tồn kho và trừ tồn kho trong transaction.
- Theo dõi đơn hàng và hủy khi còn chờ xử lý. Hủy đơn trả lại tồn kho.
- Đánh giá sản phẩm khi đã có đơn hoàn thành; API cũng hỗ trợ đánh giá dịch vụ đã hoàn thành.
- Bài viết chăm sóc thú cưng; lưu dạng văn bản, không render HTML chưa kiểm duyệt.
- Cập nhật họ tên, số điện thoại.
- Quản trị: thống kê, xác nhận/hủy/hoàn thành lịch; xử lý đơn; sửa giá/tồn kho/trạng thái bán sản phẩm và giá/trạng thái dịch vụ.

## 4. Quy tắc nghiệp vụ

**Lịch hẹn**

- Múi giờ nghiệp vụ: `Asia/Ho_Chi_Minh` (UTC+7).
- Có 5 khung bắt đầu: 09:00, 10:30, 14:00, 15:30, 17:00.
- Mỗi ngày/khung giờ tối đa 3 lịch đang PENDING hoặc CONFIRMED, tính chung toàn cửa hàng.
- Không đặt vào quá khứ hoặc xa hơn 90 ngày. Dịch vụ phải kết thúc trước hoặc đúng 18:00.
- Nhân viên được chọn không được có lịch trùng khoảng thời gian; một thú cưng cũng không được có hai lịch giao nhau.
- Hệ thống khóa bản ghi nhân viên/khung giờ và dùng transaction SERIALIZABLE với retry khi xung đột, không chỉ đếm rồi tạo ở hai thao tác rời rạc.
- Lịch trống hiển thị chỉ mang tính thời điểm; API kiểm tra lại khi tạo lịch và trả HTTP 409 nếu vừa hết chỗ.
- Khách chỉ đặt cho thú cưng của mình. Tạo thú cưng mới và lịch hẹn cùng một transaction.
- PENDING → CONFIRMED → COMPLETED; có thể hủy trước khi kết thúc. Khách không được hủy sau giờ bắt đầu. Nhân viên không hoàn thành lịch khi chưa đến giờ.
- Khi không chọn nhân viên, lịch lưu `staffId = null`; cửa hàng tự sắp xếp nhân sự ngoài hệ thống. Chưa có giao diện điều phối nhân viên cho các lịch này.
- Thú cưng đã có bất kỳ lịch hẹn nào không được xóa, để bảo toàn lịch sử.

**Đơn hàng**

- Chỉ triển khai thanh toán khi nhận hàng (COD); phí vận chuyển bản mẫu là 0đ, không có ưu đãi/thuế/phí ẩn.
- Giá/tổng tiền gửi từ trình duyệt không được tin cậy: server tự đọc giá hiện tại từ MySQL.
- Mỗi sản phẩm tối đa 20 đơn vị/đơn. Tồn kho được giữ bằng cách trừ ngay khi tạo đơn.
- PENDING → PROCESSING → SHIPPED → COMPLETED. Admin/Staff xác nhận COMPLETED đồng nghĩa đã thu tiền COD, cập nhật PAID.
- Khách chỉ hủy đơn của mình khi PENDING. Nhân viên có thể hủy ở PENDING/PROCESSING. Không hủy đơn đã giao/hoàn thành qua API này.

**Nhắc lịch chăm sóc** chỉ hiển thị ngày do khách nhập. Chưa có email, SMS hoặc push notification tự động.

## 5. Cấu trúc mã nguồn

```text
app/
  page.tsx                    Trang chủ
  services/                   Dịch vụ và chi tiết
  shop/                       Cửa hàng và chi tiết
  booking/                    Đặt lịch
  cart/                       Giỏ hàng / checkout
  login/ register/            Đăng nhập / đăng ký
  dashboard/                  Hồ sơ bé, lịch hẹn, đơn, thông tin cá nhân
  admin/                      Trang quản trị
  journal/                    Bài viết
  api/                        Các Next.js Route Handlers
components/                   Giao diện / form tương tác
lib/
  booking.ts                  Khóa slot và kiểm tra lịch trùng
  orders.ts                   Tạo đơn, tính tiền, trừ kho
  auth.ts password.ts         Phiên đăng nhập và mật khẩu
  validation.ts               Zod schemas và quy tắc ngày giờ
  transaction.ts              Serializable transaction + retry
  sample-data.ts              Dữ liệu cho seed / xem giao diện
prisma/
  schema.prisma               Models, relations, enums, indexes
  migrations/                 SQL tạo bảng + constraints
  seed.ts                     Khởi tạo dữ liệu mẫu
public/                       Logo, hình chó/mèo, hình sản phẩm SVG
scripts/integration.ts        Kiểm thử domain trên MySQL riêng
tests/                       Kiểm thử validation / mật khẩu
```

MySQL lưu danh sách ảnh qua bảng `ProductImage`, không dùng `String[]`. Giá dùng `Decimal`, không dùng float. `Review` có ràng buộc đúng một mục tiêu (dịch vụ hoặc sản phẩm), rating 1–5. Không lưu một cột tuổi dễ lỗi thời: dùng `birthDate`.

## 6. API chính

Các API ghi dữ liệu yêu cầu `Origin` đúng `APP_URL`; browser tự gửi header này. API cần đăng nhập dùng cookie phiên, không nhận userId của khách từ body.

| Method         | Endpoint                                                               | Chức năng                               |
| -------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| POST           | `/api/auth/register`                                                   | Đăng ký CUSTOMER                        |
| POST           | `/api/auth/login`                                                      | Đăng nhập                               |
| POST           | `/api/auth/logout`                                                     | Đăng xuất                               |
| GET / POST     | `/api/pets`                                                            | Liệt kê / thêm bé của mình              |
| PATCH / DELETE | `/api/pets/:id`                                                        | Sửa / xóa bé của mình                   |
| GET            | `/api/bookings/availability?date=YYYY-MM-DD&serviceId=...&staffId=...` | Xem slot trống                          |
| GET / POST     | `/api/bookings`                                                        | Danh sách / tạo lịch của mình           |
| PATCH          | `/api/bookings/:id`                                                    | Hủy lịch; nhân viên cập nhật trạng thái |
| POST           | `/api/orders`                                                          | Tạo đơn COD                             |
| PATCH          | `/api/orders/:id`                                                      | Hủy đơn / chuyển trạng thái             |
| POST           | `/api/reviews`                                                         | Gửi đánh giá sau khi sử dụng / mua hàng |
| PATCH          | `/api/account`                                                         | Đổi tên và điện thoại                   |
| PATCH          | `/api/admin/products`                                                  | Nhân viên sửa giá, kho, trạng thái      |
| PATCH          | `/api/admin/services`                                                  | Nhân viên sửa giá, trạng thái           |

Ví dụ đặt lịch (thay ID thật từ database):

```json
{
  "serviceId": "svc-bath",
  "petId": "ID_THU_CUNG_CUA_BAN",
  "bookingDate": "YYYY-MM-DD",
  "timeSlot": "09:00",
  "staffId": "",
  "note": "Bé hơi nhút nhát."
}
```

Để tạo bé mới ngay trong form: bỏ `petId`, gửi `newPetName` và `newPetType` (DOG/CAT/OTHER). Không gửi đồng thời cả hai cách.

## 7. Kiểm tra và build

```powershell
npm test
npm run typecheck
npm run build
```

`npm test` kiểm tra ngày giờ UTC+7, validation, quyền role trong đăng ký và băm mật khẩu. Build không yêu cầu MySQL đang chạy, nhưng trang lấy dữ liệu và API khi sử dụng thì cần MySQL.

Có bài kiểm tra MySQL riêng cho xung đột slot đồng thời, ownership thú cưng, lịch nhân viên, tồn kho đồng thời và rollback. Bài kiểm tra chỉ chạy với tên database kết thúc `_test`:

1. Tạo database `pawly_test` trong Workbench.
2. Thêm `TEST_DATABASE_URL` vào `.env`, cùng kiểu URL như database chính nhưng trỏ tới `pawly_test`.
3. Migration database test từ PowerShell:

```powershell
$env:DATABASE_URL="mysql://root:MAT_KHAU_DA_MA_HOA@localhost:3306/pawly_test"
npm run db:deploy
Remove-Item Env:DATABASE_URL
npm run test:integration
```

Script tạo dữ liệu riêng có prefix ngẫu nhiên, chỉ dọn dữ liệu do nó tạo. Chạy trên database test trống để tránh trùng ngày/slot của lần chạy khác. Đây là kiểm thử domain thật qua Prisma, chưa phải bộ test E2E đầy đủ cho mọi HTTP endpoint.

Xem `VERIFICATION.md` để biết phần nào đã được chạy trong môi trường bàn giao.

## 8. Chỉ xem giao diện khi chưa có MySQL

Tạo `.env` từ `.env.example` rồi thêm:

```dotenv
PREVIEW_MODE="true"
```

Chạy `npm run dev`. Các trang công khai dùng catalog mẫu; không giả vờ lưu hồ sơ, tạo tài khoản, đặt lịch hoặc đơn hàng. Muốn dùng dữ liệu thật thì bỏ dòng PREVIEW_MODE (hoặc đặt `false`), cấu hình MySQL và khởi động lại.

## 9. Các lỗi thường gặp

### P3018 / MySQL 3823 tại `Review_one_target`

MySQL không cho phép CHECK này dùng các cột khóa ngoại có hành động CASCADE. Migration và schema đã dùng `RESTRICT` cho cả xóa và cập nhật hai khóa ngoại `Review.serviceId` / `Review.productId`, giữ kiểm tra mỗi đánh giá chỉ thuộc một sản phẩm hoặc dịch vụ. Muốn xóa sản phẩm/dịch vụ có đánh giá, cần xử lý đánh giá trước; có thể dùng `isActive=false` để ngừng hiển thị.

Nếu lần chạy đầu đã dừng đúng tại `Review_one_target` (query 29), các bảng và khóa ngoại trước đó đã được tạo. Chạy từng lệnh sau trong thư mục `pawly`, chỉ tiếp tục khi lệnh trước thành công:

```powershell
npx prisma db execute --file prisma/recovery/202610310001_init.sql --schema prisma/schema.prisma
npx prisma migrate resolve --applied 202610310001_init
npm run db:deploy
npm run db:generate
npm run db:seed
```

SQL phục hồi sửa hai khóa ngoại và bổ sung năm CHECK còn thiếu, không xóa bảng hay dữ liệu. Chỉ dùng một lần cho trạng thái lỗi nêu trên, chưa sửa thủ công hoặc chạy tiếp một phần; nếu SQL báo lỗi, dừng lại và kiểm tra trạng thái database trước khi resolve. Không chỉ đánh dấu `--rolled-back` rồi deploy lại vì các bảng đã tồn tại. Database mới chỉ cần chạy quy trình cài đặt bình thường. Cảnh báo `package.json#prisma` deprecated không phải nguyên nhân P3018.

### Các lỗi khác

- **P1001 / Can't reach database server:** khởi động MySQL Server, kiểm tra host và cổng.
- **P1000 / Access denied:** sai username/mật khẩu hoặc chưa URL-encode mật khẩu.
- **P2021 / Table doesn't exist:** chạy `npm run db:deploy` trước khi seed/chạy app.
- **Nguồn yêu cầu không hợp lệ:** dùng đúng `http://localhost:3000` như APP_URL. Nếu đổi cổng/tên miền, sửa APP_URL và khởi động lại.
- **Không đăng nhập được admin:** seed chưa chạy hoặc dùng sai SEED_ADMIN_PASSWORD của lần tạo tài khoản đầu tiên.
- **Chỉ xem được giao diện:** bỏ `PREVIEW_MODE=true` để bật kết nối thật.
- **Cổng 3000 đang dùng:** `npm run dev -- --port 3001` và sửa APP_URL thành `http://localhost:3001`.

## 10. Phạm vi bản đầu

Đây là bản nền tảng có luồng dữ liệu thật cho phát triển và demo trên máy. Chưa có thanh toán online, gửi email/SMS, quên/đổi mật khẩu, upload ảnh, nhiều chi nhánh, đặt khách sạn nhiều ngày, phân quyền nhân viên theo nhiệm vụ, giao diện tạo mới bài viết/dịch vụ/sản phẩm hoặc hoàn tiền. Dữ liệu giới thiệu và giá là minh họa, cần thay trước khi kinh doanh.

Muốn chạy trên server: dùng máy chủ Node.js kết nối được MySQL, cấu hình APP_URL HTTPS, tài khoản database riêng, mật khẩu riêng và backup; chạy migration rồi build/start. Cookie phiên ở chế độ production yêu cầu HTTPS. Không có bản MySQL online nào được triển khai kèm ZIP này.

Đã khóa phiên bản dependencies trong package-lock.json. Prisma 6 được giữ để cấu hình MySQL đơn giản; overrides cập nhật hai dependency nội bộ của Prisma config và đã kiểm tra lại generate/build. Khi nâng Prisma major, hãy đọc hướng dẫn tương ứng thay vì chạy `npm audit fix --force`.
