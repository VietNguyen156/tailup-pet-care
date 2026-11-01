// Accept both Next.js arguments and preview tooling's Vite-style host flags.
import { spawn } from "node:child_process";
const args = process.argv.slice(2);
const value = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const port = value("--port") ?? process.env.PORT ?? "3000";
const hostname = value("--hostname") ?? value("--host") ?? "0.0.0.0";
const command = args.includes("--production")
  ? ["start"]
  : ["dev", "--webpack"];
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    ...command,
    "--hostname",
    hostname,
    "--port",
    port,
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
