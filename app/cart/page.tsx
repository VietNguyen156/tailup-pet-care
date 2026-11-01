import { getProducts } from "@/lib/catalog";
import { currentUser } from "@/lib/auth";
import { Cart } from "@/components/cart";
export const dynamic = "force-dynamic";
export const metadata = { title: "Giỏ hàng" };
export default async function Page() {
  const [products, user] = await Promise.all([getProducts(), currentUser()]);
  return (
    <div className="container page-space">
      <div className="page-intro compact">
        <span className="eyebrow">MỘT CHÚT NIỀM VUI MANG VỀ</span>
        <h1>
          Giỏ hàng <em>của bạn.</em>
        </h1>
      </div>
      <Cart products={products} user={user} />
    </div>
  );
}
