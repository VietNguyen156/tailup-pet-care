import { spawnSync } from "node:child_process";
process.loadEnvFile(".env.tenant-test");
if (
  !process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL ||
  !new URL(process.env.DATABASE_URL).pathname.endsWith("_test")
) {
  throw new Error("Dedicated test database required");
}
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit", env: process.env },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
