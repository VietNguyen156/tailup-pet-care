import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
if (existsSync(".env.tenant-test"))
  throw new Error(
    "A test environment already exists; reuse it or archive its configuration before creating another.",
  );
const db = new PrismaClient();
const name = "tailup_" + randomBytes(5).toString("hex") + "_test";
try {
  await db.$executeRawUnsafe(
    "CREATE DATABASE `" +
      name +
      "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = "/" + name;
  writeFileSync(
    ".env.tenant-test",
    "DATABASE_URL=" +
      JSON.stringify(url.toString()) +
      "\nTEST_DATABASE_URL=" +
      JSON.stringify(url.toString()) +
      "\nAPP_URL=http://127.0.0.1:3005\nPREVIEW_MODE=false\n",
  );
  console.log("Created isolated database: " + name);
} catch (e) {
  console.error("Could not create isolated database:", e.code ?? e.name);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
