import { StoreChoices } from "@/components/store-choices";
import { getStoreDirectory } from "@/lib/store-directory";
export const dynamic = "force-dynamic";
export const metadata = { title: "Chọn cửa hàng · Dịch vụ chăm sóc" };
export default async function Page() {
  const stores = await getStoreDirectory();
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">DỊCH VỤ THEO TỪNG CỬA HÀNG</span>
        <h1>
          Bạn muốn ghé cửa hàng nào?
        </h1>
        <p>
          Chọn cửa hàng để xem đúng dịch vụ, giá và lịch chăm sóc tại đó.
        </p>
      </div>
      <StoreChoices stores={stores} />
    </div>
  );
}
