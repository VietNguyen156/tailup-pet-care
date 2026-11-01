import { getServices } from "@/lib/catalog";
import { ServiceCard } from "@/components/service-card";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dịch vụ chăm sóc" };
export default async function Page() {
  const services = await getServices();
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">DỊCH VỤ TAILUP</span>
        <h1>
          Mỗi bé một nhu cầu.
          <br />
          <em>Mỗi lần một chút thương.</em>
        </h1>
        <p>
          Chọn buổi chăm sóc phù hợp. Giá hiển thị là giá dịch vụ trong hệ thống
          mẫu.
        </p>
      </div>
      <div className="services-grid">
        {services.map((s, i) => (
          <ServiceCard key={s.id} service={s} index={i} />
        ))}
      </div>
      <div className="soft-panel mt-8">
        <h3>Trước khi mình hẹn nhau</h3>
        <p>
          Hãy ghi chú tình trạng da, tính cách và những điều cần lưu ý của bé.
          Bạn có thể chọn nhân viên hoặc để TailUp sắp xếp. Khung giờ trống sẽ
          được kiểm tra lại khi gửi lịch hẹn.
        </p>
      </div>
    </div>
  );
}
