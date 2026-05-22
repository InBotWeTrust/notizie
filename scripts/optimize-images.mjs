import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const uploadsRoot = join(root, "public/wp-content/uploads");
const textFiles = [join(root, "content/home.html"), join(root, "app/original.css")];
const imageExts = new Set([".jpg", ".jpeg", ".png"]);
const converted = new Map();

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function publicPath(path) {
  return path.replace(join(root, "public"), "").split("\\").join("/");
}

for (const file of walk(uploadsRoot)) {
  const ext = extname(file).toLowerCase();
  if (!imageExts.has(ext)) continue;

  const out = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const result = spawnSync("cwebp", ["-quiet", "-q", "78", "-m", "6", file, "-o", out], {
    encoding: "utf8",
  });
  if (result.status !== 0 || !existsSync(out)) {
    continue;
  }

  const before = statSync(file).size;
  const after = statSync(out).size;
  if (after >= before * 0.96) {
    unlinkSync(out);
    continue;
  }

  converted.set(publicPath(file), publicPath(out));
}

for (const textFile of textFiles) {
  let text = readFileSync(textFile, "utf8");
  for (const [from, to] of converted) {
    text = text.split(from).join(to);
  }
  writeFileSync(textFile, text);
}

let beforeTotal = 0;
let afterTotal = 0;
for (const [from, to] of converted) {
  const fromFile = join(root, "public", from);
  const toFile = join(root, "public", to);
  beforeTotal += statSync(fromFile).size;
  afterTotal += statSync(toFile).size;
}

console.log(
  `Converted ${converted.size} images to WebP where smaller. Referenced bytes ${beforeTotal} -> ${afterTotal}.`,
);

const combined = textFiles.map((file) => readFileSync(file, "utf8")).join("\n");
let removed = 0;
for (const from of converted.keys()) {
  if (!combined.includes(from)) {
    unlinkSync(join(root, "public", from));
    removed += 1;
  }
}
console.log(`Removed ${removed} original files that are no longer referenced.`);
