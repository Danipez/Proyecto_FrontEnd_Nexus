import { spawn } from "node:child_process";
import { createServer } from "vite";
const api = spawn(process.execPath, ["server/index.mjs"], {
  stdio: "inherit",
  windowsHide: true,
});
let vite;
const stop = async () => {
  api.kill();
  await vite?.close();
};
try {
  vite = await createServer();
  await vite.listen();
  vite.printUrls();
} catch (e) {
  console.error(e.message);
  await stop();
  process.exit(1);
}
api.on("exit", async (code) => {
  if (code) {
    await vite.close();
    process.exit(code);
  }
});
process.on("SIGINT", async () => {
  await stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await stop();
  process.exit(0);
});
