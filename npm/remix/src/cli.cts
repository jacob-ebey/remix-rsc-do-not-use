import * as cp from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";

export function run() {
  const platformPackage = `@remix/${process.platform}-${os.arch()}`;

  const platformPackagePath = require.resolve(platformPackage, {
    paths: [__dirname, process.cwd()],
  });

  const child = cp.spawn(platformPackagePath, process.argv.slice(2), {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  return new Promise<number>((resolve, reject) => {
    try {
      fs.chmodSync(platformPackagePath, 0o755);

      child.once("close", (status) => {
        resolve(status);
      });
      child.once("error", () => {
        reject(new Error("Failed to spawn remix binary"));
      });
    } catch (e) {
      reject(e);
    }
  });
}
