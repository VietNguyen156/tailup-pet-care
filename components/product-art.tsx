const productImages: Record<string, string> = {
  "prd-food":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFw7ohCeSH-KIzhkGfB5HjdhwmF43xvA2m3dwfCVpnLQ&s=10",
  "prd-shampoo":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSomr4a0ptm75o4Q1ecPAv8AeIBkvCvhMHBtxLzmqV6KA&s=10",
  "prd-bowl":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-WXfQr9M-dPmRzaYHfaS4adO-e3OmMJdFVfhwQPlvYw&s=10",
  "prd-treat":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_MptS4oNuK2Ji_bM-49WYpiC0bgY6my-n24IqAjlDLw&s",
  "prd-toy":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG7ijqBmUwaKFawU-R-gbkaix_Do8megIQ5chzhcVkPg&s=10",
  "prd-brush":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5Er1ZPqMBO0c26gb7eMhHqYBnJxFaXz24lIcJ2VBOw&s",
};
export function ProductArt({ id, src }: { id: string; src?: string }) {
  const sampleId = src?.match(/^\/products\/(prd-[a-z]+)\.svg$/)?.[1];
  const image = sampleId
    ? (productImages[sampleId] ?? src)
    : src || productImages[id];
  return image ? (
    <img src={image} alt="" loading="lazy" className="product-art" />
  ) : (
    <div className="product-art tenant-no-image">Chưa có ảnh</div>
  );
}
