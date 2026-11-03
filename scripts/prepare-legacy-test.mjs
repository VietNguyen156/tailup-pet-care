import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
const db = new PrismaClient();
if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
  throw Error("Test database required");
try {
  const sql = readFileSync(
    "prisma/migrations/202610310001_init/migration.sql",
    "utf8",
  ).replace(/^\uFEFF/, "");
  for (const statement of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.$executeRawUnsafe(statement);
  await db.$executeRawUnsafe(
    "INSERT INTO `User` (`id`,`name`,`email`,`passwordHash`,`role`,`updatedAt`) VALUES ('legacy-super','Legacy Admin','legacy-admin@example.invalid','unused','ADMIN',NOW()),('legacy-owner','Legacy Staff','legacy-staff@example.invalid','unused','STAFF',NOW()),('legacy-customer','Legacy Customer','legacy-customer@example.invalid','unused','CUSTOMER',NOW())",
  );
  await db.$executeRawUnsafe(
    "INSERT INTO `Product` (`id`,`name`,`slug`,`category`,`price`,`stock`,`description`) VALUES ('legacy-product','Legacy product','legacy-product','Test',12000,7,'Retain existing data')",
  );
  await db.$executeRawUnsafe(
    "INSERT INTO `Service` (`id`,`name`,`slug`,`description`,`process`,`price`,`durationMinutes`,`category`) VALUES ('legacy-service','Legacy service','legacy-service','Retain service',JSON_ARRAY('step'),100000,60,'Test')",
  );
  await db.$executeRawUnsafe(
    "INSERT INTO `AppointmentSlot` (`id`,`bookingDate`,`timeSlot`,`capacity`) VALUES ('legacy-slot','2026-12-01','09:00',3)",
  );
  console.log("Created legacy-schema fixtures in isolated test database");
} finally {
  await db.$disconnect();
}
