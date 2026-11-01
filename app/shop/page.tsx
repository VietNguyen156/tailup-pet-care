import { getProducts } from "@/lib/catalog";
import { Shop } from "@/components/shop";
export const dynamic = "force-dynamic";
export const metadata = { title: "Cửa hàng cho bé" };
export default async function Page() {
  const products = await getProducts();
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">TAILUP LITTLE SHOP</span>
        <h1>
          Những món đồ nhỏ.
          <br />
          <em>Cho niềm vui mỗi ngày.</em>
        </h1>
        <p>Đồ ăn, đồ chơi và những vật dụng thân quen cho cuộc sống cùng bé.</p>
      </div>
      <Shop products={products} />
    </div>
  );
}
