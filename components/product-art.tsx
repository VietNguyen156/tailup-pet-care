export function ProductArt({ id }: { id: string }) {
  return (
    <img
      src={`/products/${id}.svg`}
      alt=""
      loading="lazy"
      className="product-art"
    />
  );
}
