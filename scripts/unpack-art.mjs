import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packed = join(root, "art-packed");
const manifest = JSON.parse(await readFile(join(packed, "manifest.json"), "utf8"));
const mirror = "https://raw.githubusercontent.com/SwaTik91/Roguebullet/cursor/gun-branches-d655/";

for (const [rel, file] of Object.entries(manifest)) {
  const dest = join(root, rel);
  await mkdir(dirname(dest), { recursive: true });
  try {
    const bytes = Buffer.from(await readFile(join(packed, file), "utf8"), "base64");
    await writeFile(dest, bytes);
    continue;
  } catch {
    // The packed copy is not in this checkout yet.
  }
  const response = await fetch(mirror + rel);
  if (!response.ok) throw new Error(`Нет картинки ${rel}`);
  await writeFile(dest, Buffer.from(await response.arrayBuffer()));
}
