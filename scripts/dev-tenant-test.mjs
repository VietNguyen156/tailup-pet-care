import { spawn } from "node:child_process";
process.loadEnvFile(".env.tenant-test");
const url = new URL(process.env.DATABASE_URL);
if (!url.pathname.endsWith("_test")) throw Error("Test database required");
const child = spawn(
  process.execPath,
  ["scripts/dev.mjs", "--port", "3005", "--hostname", "127.0.0.1"],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
