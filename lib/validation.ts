import { z } from "zod";
export const TIME_SLOTS = [
  "09:00",
  "10:30",
  "14:00",
  "15:30",
  "17:00",
] as const;
export function localDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function validDate(s: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(Date.parse(s)) &&
    new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s
  );
}
const date = z.string().refine(validDate, "Ngày không hợp lệ.");
const optionalDate = z.union([date, z.literal("")]).optional();
const name = z
  .string()
  .trim()
  .min(2, "Vui lòng nhập ít nhất 2 ký tự.")
  .max(100);
export const loginSchema = z.object({
  email: z
    .email("Email không hợp lệ.")
    .max(191)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(128),
});
export const registerSchema = loginSchema.extend({
  name,
  phone: z
    .string()
    .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0."),
  password: z.string().min(10, "Mật khẩu cần ít nhất 10 ký tự.").max(128),
});
export const petSchema = z.object({
  name: name.max(80),
  type: z.enum(["DOG", "CAT", "OTHER"]),
  breed: z.string().trim().max(100).optional(),
  weight: z
    .string()
    .optional()
    .refine(
      (s) =>
        !s ||
        (Number(s) >= 0.01 && Number(s) <= 200 && /^\d+(\.\d{1,2})?$/.test(s)),
      "Cân nặng từ 0,01 đến 200 kg, tối đa 2 số thập phân.",
    ),
  birthDate: optionalDate.refine(
    (s) => !s || s <= localDate(),
    "Ngày sinh không được ở tương lai.",
  ),
  vaccinationHistory: z.string().max(3000).optional(),
  nextVaccinationAt: optionalDate,
  nextDewormingAt: optionalDate,
});
export const bookingSchema = z
  .object({
    serviceId: z
      .string({ error: "Vui lòng chọn dịch vụ." })
      .trim()
      .min(1, "Vui lòng chọn dịch vụ."),
    petId: z.string().optional(),
    newPetName: z.string().trim().max(80).optional(),
    newPetType: z.enum(["DOG", "CAT", "OTHER"]).optional(),
    bookingDate: date,
    timeSlot: z.enum(TIME_SLOTS, { error: "Vui lòng chọn khung giờ." }),
    staffId: z.string().optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      !data.petId &&
      (!data.newPetName || data.newPetName.length < 2 || !data.newPetType)
    )
      ctx.addIssue({
        code: "custom",
        path: ["petId"],
        message: "Chọn thú cưng hoặc nhập tên và loài cho bé mới.",
      });
    if (data.petId && data.newPetName)
      ctx.addIssue({
        code: "custom",
        path: ["petId"],
        message: "Chỉ chọn một cách nhập thú cưng.",
      });
  });
export type BookingInput = z.infer<typeof bookingSchema>;
export const orderSchema = z.object({
  recipientName: name,
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ."),
  address: z.string().trim().min(10, "Vui lòng nhập địa chỉ đầy đủ.").max(500),
  note: z.string().max(1000).optional(),
  paymentMethod: z.literal("COD"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Giỏ hàng đang trống.")
    .max(50),
});
export function assertFutureSlot(date: string, time: string, now = new Date()) {
  const start = new Date(`${date}T${time}:00+07:00`);
  const days = (start.getTime() - now.getTime()) / 86400000;
  return days > 0 && days <= 90;
}
