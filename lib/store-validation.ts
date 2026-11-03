import { z } from "zod";
export const storeDetailsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000),
  address: z.string().trim().min(5).max(500),
  phone: z
    .string()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0."),
});
export const createStoreSchema = storeDetailsSchema.extend({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.",
    ),
  adminName: z.string().trim().min(2).max(100),
  adminEmail: z
    .email()
    .max(191)
    .transform((s) => s.toLowerCase()),
  adminPassword: z.string().min(10).max(128),
  withSampleCatalog: z.boolean().default(false),
});
const price = z.number().int().min(1000).max(999999999);
export const productCreateSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
  category: z.string().trim().min(1).max(80),
  price,
  stock: z.number().int().min(0).max(100000),
  imageUrl: z
    .string()
    .url()
    .max(500)
    .refine((s) => s.startsWith("https://"), "Ảnh cần là đường dẫn HTTPS."),
});
export const serviceCreateSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
  category: z.string().trim().min(1).max(80),
  price,
  durationMinutes: z.number().int().min(15).max(240),
  process: z.string().trim().min(3).max(3000),
});
