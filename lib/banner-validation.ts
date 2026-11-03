import { z } from "zod";

export const MAX_BANNERS = 5;
export const MAX_BANNER_BYTES = 2 * 1024 * 1024;
export const bannerLink = z
  .string()
  .trim()
  .max(1000)
  .refine((value) => {
    if (!value) return true;
    if (/[\u0000-\u0020\\]/.test(value)) return false;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    if (!value.startsWith("https://")) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Liên kết phải bắt đầu bằng / hoặc https://, không chứa khoảng trắng.");

export const bannerFields = z
  .object({
    title: z.string().trim().min(1, "Vui lòng nhập tiêu đề banner.").max(160),
    description: z.string().trim().max(500),
    buttonText: z.string().trim().max(80),
    buttonUrl: bannerLink,
    enabled: z.boolean(),
    sortOrder: z
      .number()
      .int()
      .min(0)
      .max(MAX_BANNERS - 1),
  })
  .refine((b) => Boolean(b.buttonText) === Boolean(b.buttonUrl), {
    message:
      "Nhập cả nội dung nút và đường dẫn, hoặc để trống cả hai để ẩn nút.",
    path: ["buttonUrl"],
  });
export type ManagedBanner = {
  slot: number;
  title: string;
  description: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
  buttonText: string;
  buttonUrl: string;
};
