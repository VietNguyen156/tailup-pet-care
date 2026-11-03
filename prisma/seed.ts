import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
import {
  sampleServices,
  sampleProducts,
  samplePosts,
} from "../lib/sample-data";
const db = new PrismaClient();
async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 10)
    throw new Error("Đặt SEED_ADMIN_PASSWORD ít nhất 10 ký tự trong .env.");
  const storeId = "store-tailup";
  await db.store.upsert({
    where: { id: storeId },
    update: {},
    create: {
      id: storeId,
      name: "TailUp",
      slug: "tailup",
      description: "Chăm sóc cho người bạn nhỏ.",
      phone: "",
      address: "",
    },
  });
  await db.user.upsert({
    where: { email: "admin@pawly.local" },
    update: {},
    create: {
      email: "admin@pawly.local",
      name: "Quản trị TailUp",
      phone: "0901234567",
      role: "SUPER_ADMIN",
      passwordHash: await hashPassword(password),
    },
  });
  const admin = await db.user.findFirstOrThrow({
    where: { role: "SUPER_ADMIN" },
  });
  for (const service of sampleServices)
    await db.service.upsert({
      where: { id: service.id },
      update: {},
      create: { ...service, storeId },
    });
  for (const product of sampleProducts)
    await db.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        storeId,
        images: {
          create: { url: `/products/${product.id}.svg`, alt: product.name },
        },
      },
    });
  for (const post of samplePosts)
    await db.post.upsert({
      where: { id: post.id },
      update: {},
      create: { ...post, authorId: admin.id, published: true },
    });
  console.log(
    "Đã tạo dữ liệu mẫu. Quản trị tổng: admin@pawly.local. Mật khẩu lấy từ SEED_ADMIN_PASSWORD. Không ghi đè dữ liệu đã tồn tại.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
