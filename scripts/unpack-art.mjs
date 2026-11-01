import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packed = join(root, "art-packed");
const manifest = JSON.parse(await readFile(join(packed, "manifest.json"), "utf8"));
for (const [rel, file] of Object.entries(manifest)) {
  const bytes = Buffer.from(await readFile(join(packed, file), "utf8"), "base64");
  const dest = join(root, rel);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
}
