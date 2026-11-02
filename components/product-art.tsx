export function ProductArt({ id }: { id: string }) {
  return (
    <img
      src={
        id === "prd-food"
          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFw7ohCeSH-KIzhkGfB5HjdhwmF43xvA2m3dwfCVpnLQ&s=10"
          : id === "prd-shampoo"
            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSomr4a0ptm75o4Q1ecPAv8AeIBkvCvhMHBtxLzmqV6KA&s=10"
            : id === "prd-bowl"
              ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-WXfQr9M-dPmRzaYHfaS4adO-e3OmMJdFVfhwQPlvYw&s=10"
              : id === "prd-treat"
                ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_MptS4oNuK2Ji_bM-49WYpiC0bgY6my-n24IqAjlDLw&s"
                : id === "prd-toy"
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG7ijqBmUwaKFawU-R-gbkaix_Do8megIQ5chzhcVkPg&s=10"
                  : id === "prd-brush"
                    ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5Er1ZPqMBO0c26gb7eMhHqYBnJxFaXz24lIcJ2VBOw&s"
                    : `/products/${id}.svg`
      }
      alt=""
      loading="lazy"
      className="product-art"
    />
  );
}
