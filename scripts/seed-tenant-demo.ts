import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { provisionStore } from "../lib/store-provisioning";
if (!new URL(process.env.DATABASE_URL!).pathname.endsWith("_test"))
  throw new Error("Chỉ dùng database test.");
const db = new PrismaClient();
const password = "TailUpDemo2026!"; // Public demo credential, only accepted by this test-only seed.
async function main() {
  await db.user.upsert({
    where: { email: "demo-super@tailup.test" },
    update: {},
    create: {
      email: "demo-super@tailup.test",
      name: "Quản trị TailUp Demo",
      role: "SUPER_ADMIN",
      passwordHash: await hashPassword(password),
    },
  });
  for (const [slug, name, email, address] of [
    [
      "demo-pet-house",
      "Pet House",
      "demo-owner@tailup.test",
      "123 Nguyễn Trãi, TP. Hồ Chí Minh",
    ],
    [
      "demo-paw-spa",
      "Paw Spa",
      "demo-owner-b@tailup.test",
      "25 Lê Lợi, TP. Hồ Chí Minh",
    ],
  ]) {
    if (!(await db.store.findUnique({ where: { slug } })))
      await provisionStore({
        name,
        slug,
        adminName: `Chủ ${name}`,
        adminEmail: email,
        adminPassword: password,
        description:
          "Không gian chăm sóc nhẹ nhàng dành cho người bạn nhỏ. Cửa hàng minh họa trên môi trường kiểm thử.",
        address,
        phone: "0901234567",
        withSampleCatalog: true,
      });
  }
  console.log("Demo accounts and stores ready on test database only.");
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
