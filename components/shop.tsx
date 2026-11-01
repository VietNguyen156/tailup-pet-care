"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard, type ProductView } from "./product-card";
export function Shop({ products }: { products: ProductView[] }) {
  const [category, setCategory] = useState("Tất cả"),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("default");
  const categories = ["Tất cả", ...new Set(products.map((p) => p.category))];
  const filtered = products
    .filter(
      (p) =>
        (category === "Tất cả" || p.category === category) &&
        p.name.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
    )
    .sort((a, b) =>
      sort === "asc"
        ? a.price - b.price
        : sort === "desc"
          ? b.price - a.price
          : 0,
    );
  return (
    <>
      <div className="shop-toolbar">
        <div className="filter-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Tìm sản phẩm"
            placeholder="Tìm món đồ cho bé…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="sort-select">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Sắp xếp giá"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Đề xuất</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </label>
      </div>
      <p className="muted result-count">
        {filtered.length} món đồ cho người bạn nhỏ
      </p>
      {filtered.length ? (
        <div className="products-grid shop-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search />
          <h3>Chưa tìm thấy món đồ phù hợp</h3>
          <p>Thử từ khóa khác hoặc chọn tất cả danh mục nhé.</p>
          <button
            className="button outline"
            onClick={() => {
              setQuery("");
              setCategory("Tất cả");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}
