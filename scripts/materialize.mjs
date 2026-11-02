import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "source-parts", "manifest.json"), "utf8"));
for (const [rel, parts] of Object.entries(manifest)) {
  const chunks = [];
  let missing = false;
  for (const part of parts) {
    try {
      chunks.push(await readFile(join(root, "source-parts", part), "utf8"));
    } catch {
      missing = true;
      break;
    }
  }
  if (missing) continue;
  const dest = join(root, rel);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, chunks.join(""));
}
