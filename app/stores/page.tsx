import { StoreChoices } from "@/components/store-choices";
import { getStoreDirectory } from "@/lib/store-directory";
export const dynamic = "force-dynamic";
export const metadata = { title: "Các cửa hàng trên TailUp" };
export default async function Page() {
  const stores = await getStoreDirectory();
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">CÙNG TAILUP CHĂM SÓC BÉ</span>
        <h1>Tìm một cửa hàng phù hợp.</h1>
        <p>
          Một tài khoản dùng chung. Chọn cửa hàng để xem dịch vụ, sản phẩm và
          đặt lịch.
        </p>
      </div>
      <StoreChoices stores={stores} />
    </div>
  );
}
