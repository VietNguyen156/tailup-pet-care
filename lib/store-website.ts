import { z } from "zod";
import { bannerLink, MAX_BANNERS } from "./banner-validation";

export const websiteImage = z
  .string()
  .max(1000)
  .refine(
    (value) =>
      !value ||
      value === "/tailup-companions.webp" ||
      /^\/api\/stores\/[a-z0-9-]+\/banners\/[0-4](?:\?v=\d+)?$/.test(value) ||
      (() => {
        try {
          return new URL(value).protocol === "https:";
        } catch {
          return false;
        }
      })(),
    "Ảnh cần là ảnh tải lên hoặc đường dẫn HTTPS.",
  );
const text = (max: number) => z.string().trim().max(max);
export const websiteSchema = z.object({
  headline: text(160).min(2),
  introduction: text(1500),
  servicesTitle: text(160).min(2).default("Cho bé một ngày thật dễ chịu."),
  productsTitle: text(160).min(2).default("Bé thích. Bạn yên tâm."),
  informationTitle: text(160).min(2).default("Góc nhỏ của cửa hàng."),
  bookingTitle: text(160)
    .min(2)
    .default("Đã đến lúc dành một chút thời gian cho bé."),
  aboutTitle: text(160).min(2),
  aboutText: text(8000),
  aboutImage: websiteImage,
  servicesIntro: text(1500),
  informationIntro: text(1500),
  contactIntro: text(1500),
  email: z.union([z.literal(""), z.email().max(191)]),
  hours: text(500),
  facebook: z
    .string()
    .max(500)
    .refine(
      (v) =>
        !v ||
        (() => {
          try {
            return new URL(v).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      "Liên kết cần dùng HTTPS.",
    ),
  banners: z
    .array(
      z.object({
        title: text(160),
        description: text(500),
        image: websiteImage,
        enabled: z.boolean(),
        slot: z.number().int().min(0).max(4).optional(),
        sortOrder: z.number().int().min(0).max(4).optional(),
        buttonText: text(80).optional(),
        buttonUrl: bannerLink.optional(),
      }),
    )
    .max(MAX_BANNERS)
    .transform((items) =>
      items
        .map((item, index) => ({
          ...item,
          slot: item.slot ?? index,
          sortOrder: item.sortOrder ?? index,
          buttonText: item.buttonText ?? "Đặt lịch chăm sóc",
          buttonUrl: item.buttonUrl ?? "",
        }))
        .filter((item) => Boolean(item.image))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.slot - b.slot)
        .map((item, index) => ({ ...item, sortOrder: index })),
    )
    .refine(
      (items) => new Set(items.map((item) => item.slot)).size === items.length,
      "Vị trí banner bị trùng.",
    ),
  articles: z
    .array(
      z.object({
        title: text(160).min(2),
        body: text(6000).min(5),
        image: websiteImage,
      }),
    )
    .max(8),
});
export type StoreWebsite = z.infer<typeof websiteSchema>;
export function defaultWebsite(store: {
  name: string;
  description: string;
}): StoreWebsite {
  return {
    headline: "Chăm sóc tận tâm. Yêu thương trọn vẹn.",
    servicesTitle: "Cho bé một ngày thật dễ chịu.",
    productsTitle: "Bé thích. Bạn yên tâm.",
    informationTitle: "Góc nhỏ của cửa hàng.",
    bookingTitle: "Đã đến lúc dành một chút thời gian cho bé.",
    introduction:
      store.description ||
      `Cùng ${store.name} chăm chút cho những người bạn nhỏ mỗi ngày.`,
    aboutTitle: `Chào mừng bạn đến với ${store.name}`,
    aboutText:
      store.description ||
      "Mỗi người bạn nhỏ đều xứng đáng được chăm sóc bằng sự kiên nhẫn và yêu thương. Hãy liên hệ với cửa hàng để tìm dịch vụ phù hợp cho bé.",
    aboutImage: "/tailup-companions.webp",
    servicesIntro:
      "Chọn một buổi chăm sóc phù hợp với nhu cầu của bé. Xem rõ quy trình, thời lượng và giá trước khi đặt lịch.",
    informationIntro:
      "Thông báo, câu chuyện và những chia sẻ mới nhất từ cửa hàng.",
    contactIntro:
      "Bạn cần tư vấn dịch vụ hoặc muốn ghé thăm? Liên hệ với chúng mình qua thông tin bên dưới.",
    email: "",
    hours: "",
    facebook: "",
    articles: [],
    banners: [
      {
        slot: 0,
        sortOrder: 0,
        buttonText: "Đặt lịch chăm sóc",
        buttonUrl: "",
        title: "Một chút chăm sóc, thật nhiều yêu thương",
        description: "",
        image: "/tailup-companions.webp",
        enabled: true,
      },
    ],
  };
}
export function readWebsite(
  value: unknown,
  store: { name: string; description: string },
) {
  const parsed = websiteSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultWebsite(store);
}
