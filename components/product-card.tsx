"use client";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { money } from "@/lib/utils";
import { ProductArt } from "./product-art";
export type ProductView = {
  id: string;
  storeId?: string;
  store?: { id: string; name: string; slug: string };
  imageUrl?: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  description: string;
};
export function AddToCart({
  product,
  full = false,
}: {
  product: ProductView;
  full?: boolean;
}) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const quantity = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const disabled = product.stock <= quantity || quantity >= 20;
  return (
    <button
      className={full ? "button" : "add-cart"}
      disabled={disabled}
      aria-label={`Thêm ${product.name} vào giỏ hàng`}
      onClick={() => {
        add(product.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? <Check size={20} /> : <Plus size={20} />}{" "}
      {full &&
        (added
          ? "Đã thêm vào giỏ"
          : disabled
            ? "Đã đạt giới hạn"
            : "Thêm vào giỏ hàng")}
    </button>
  );
}
export function ProductCard({ product }: { product: ProductView }) {
  return (
    <article className="product-card">
      <Link
        href={`/shop/${product.slug}`}
        className={`product-image ${product.color}`}
        aria-label={product.name}
      >
        <span className="product-tag">{product.category}</span>
        <ProductArt id={product.id} src={product.imageUrl} />
      </Link>
      {product.store && (
        <Link
          className="tenant-product-store"
          href={`/stores/${product.store.slug}`}
        >
          {product.store.name}
        </Link>
      )}
      <div className="product-info">
        <div>
          <Link href={`/shop/${product.slug}`}>
            <h3>{product.name}</h3>
          </Link>
          <span className="product-price">{money(product.price)}</span>
          {product.stock === 0 && (
            <small className="muted"> · Tạm hết hàng</small>
          )}
        </div>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
