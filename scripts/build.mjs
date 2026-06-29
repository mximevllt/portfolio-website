import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}

mkdirSync(dist, { recursive: true });
for (const file of readdirSync(root).filter((entry) => entry.endsWith(".html"))) {
  cpSync(join(root, file), join(dist, file));
}
cpSync(join(root, "src"), join(dist, "src"), { recursive: true });
cpSync(join(root, "assets"), join(dist, "assets"), { recursive: true });

console.log("Build complete: dist/");
