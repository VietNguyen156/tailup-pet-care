import { notFound } from "next/navigation";
import Link from "next/link";
import { PackageCheck, Truck } from "lucide-react";
import { getProductBySlug } from "@/lib/catalog";
import { ProductArt } from "@/components/product-art";
import { AddToCart } from "@/components/product-card";
import { money } from "@/lib/utils";
import { Reviews } from "@/components/reviews";
import { db } from "@/lib/db";
import { previewMode } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const reviews = previewMode
    ? []
    : await db.review.findMany({
        where: { productId: product.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
  return (
    <div className="container page-space">
      <Link className="back-link" href="/shop">
        ← Quay lại cửa hàng
      </Link>
      <div className="detail-grid">
        <div className={`product-detail-art ${product.color}`}>
          <ProductArt id={product.id} src={product.imageUrl} />
        </div>
        <div>
          <Link
            className="tenant-product-store"
            href={`/stores/${product.store.slug}`}
          >
            {product.store.name}
          </Link>
          <span className="eyebrow">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">{money(product.price)}</div>
          <p className="lead">{product.description}</p>
          <p className="stock-label">
            <PackageCheck size={18} />
            {product.stock > 0
              ? `Còn ${product.stock} sản phẩm`
              : "Tạm hết hàng"}
          </p>
          <AddToCart product={product} full />
          <p className="muted small-text mt-6">
            <Truck size={17} /> Thanh toán khi nhận hàng · Phí giao hàng: 0đ
            trong bản mẫu.
          </p>
        </div>
      </div>
      <Reviews
        productId={product.id}
        reviews={reviews.map((r) => ({
          id: r.id,
          name: r.user.name,
          rating: r.rating,
          comment: r.comment,
        }))}
      />
    </div>
  );
}
