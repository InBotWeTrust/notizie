import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const workspace = join(root, "..");
const sourcePath = "/private/tmp/nutrizione24-home.html";
const source = readFileSync(sourcePath, "utf8");

const uploadsUrl = "https://nutrizione24.store/wp-content/uploads/";
const localUploads = join(workspace, "news.artmez.pro/wp-content/uploads");
const publicUploads = join(root, "public/wp-content/uploads");

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function decodeUrlPath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function copyUpload(url) {
  const withoutQuery = url.split("?")[0].replace(uploadsUrl, "");
  const decoded = decodeUrlPath(withoutQuery);
  const from = join(localUploads, decoded);
  const to = join(publicUploads, decoded);
  if (!existsSync(from)) return;
  ensureDir(dirname(to));
  copyFileSync(from, to);
}

const uploadUrls = new Set(
  Array.from(source.matchAll(/https:\/\/nutrizione24\.store\/wp-content\/uploads\/[^"')\s<]+/g)).map(
    ([url]) => url.replace(/&quot;.*/, ""),
  ),
);
for (const url of uploadUrls) copyUpload(url);

const vendorFiles = [
  ["news.artmez.pro/wp-content/themes/hub/assets/vendors/bootstrap/css/bootstrap.min.css", "public/vendor/bootstrap.min.css"],
  ["news.artmez.pro/wp-content/themes/hub/style.css", "public/vendor/hub-style.css"],
  ["news.artmez.pro/wp-content/themes/hub/assets/css/elements/base/typography.css", "public/vendor/hub-typography.css"],
  ["news.artmez.pro/wp-content/plugins/elementor/assets/css/frontend.min.css", "public/vendor/elementor-frontend.min.css"],
  ["news.artmez.pro/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css", "public/vendor/widget-social-icons.min.css"],
  ["news.artmez.pro/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css", "public/vendor/widget-form.min.css"],
  ["news.artmez.pro/wp-content/plugins/elementor-pro/assets/css/widget-countdown.min.css", "public/vendor/widget-countdown.min.css"],
  ["news.artmez.pro/wp-content/plugins/elementor/assets/css/widget-spacer.min.css", "public/vendor/widget-spacer.min.css"],
];

const vendorCss = [];
for (const [fromRel, toRel] of vendorFiles) {
  const from = join(workspace, fromRel);
  const to = join(root, toRel);
  if (!existsSync(from)) continue;
  ensureDir(dirname(to));
  copyFileSync(from, to);
  vendorCss.push(`/* ${toRel} */\n${readFileSync(from, "utf8")}`);
}

const inlineStyles = Array.from(source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))
  .map(([, css]) => css)
  .join("\n\n")
  .replaceAll("{}", "")
  .replace(/\.main-header\.is-stuck > \.elementor > :is\(\.elementor-section, \.e-con\)\{background-color: #FFFFFF99;\}@media \(max-width: 1024px\)\{\.main-header\.is-stuck > \.elementor > :is\(\.elementor-section, \.e-con\)\}@media \(max-width: 767px\)\{\.main-header\.is-stuck > \.elementor > :is\(\.elementor-section, \.e-con\)\}/g, "")
  .replace(/@media \(max-width: 1024px\)@media \(max-width: 767px\)/g, "");

let body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
body = body.replace(/<script\b[\s\S]*?<\/script>/gi, "");
body = body.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");
body = body.replace(/<template\b[\s\S]*?<\/template>/gi, "");
body = body.replace(/<div class="lqd-preloader-wrap[\s\S]*?<\/div>\s*<\/div>/, "");
body = body.replace(/https:\/\/nutrizione24\.store\/wp-content\/uploads\//g, "/wp-content/uploads/");
body = body.replace(/https:\/\/news\.artmez\.pro\/wp-content\/uploads\//g, "/wp-content/uploads/");
body = body.replace(/https:\/\/nutrizione24\.store\//g, "/");
body = body.replace(/src="data:image\/svg\+xml[^"]+"\s+class=/g, 'class=');
body = body.replace(/\sdata-src="([^"]+)"/g, ' src="$1"');
body = body.replace(/\sdata-srcset=/g, " srcSet=");
body = body.replace(/\sdata-sizes=/g, " sizes=");
body = body.replace(/\sdata-aspect="[^"]*"/g, "");
body = body.replace(/<form class="elementor-form"[\s\S]*?<\/form>/i, "<!--LEAD_FORM-->");

ensureDir(join(root, "content"));
writeFileSync(join(root, "content/home.html"), body);
writeFileSync(
  join(root, "app/original.css"),
  `${vendorCss.join("\n\n")}\n\n${inlineStyles}\n`,
);

const hrefs = Array.from(source.matchAll(/href="([^"]+)"/g)).map(([, href]) => href);
writeFileSync(
  join(workspace, "docs/research/PAGE_TOPOLOGY.md"),
  `# Nutrizione24 Page Topology\n\n- Source URL: https://nutrizione24.store/\n- Public pages discovered through REST: /, /%d0%b8%d1%82%d0%b0%d0%bb2/, /your-submission-was-successful/\n- Public ecommerce flow: not exposed. WooCommerce cart, checkout, account, and shop pages are trashed in the local dump.\n- Primary page type: long-form article landing page for Nano Slim.\n- Main interaction target: repeated CTA links scroll to #form.\n- Lead form: multi-step Elementor form replaced by a lightweight client placeholder in Next.\n\n## Links\n\n${hrefs.map((href) => `- ${href}`).join("\n")}\n`,
);
writeFileSync(
  join(workspace, "docs/research/BEHAVIORS.md"),
  `# Nutrizione24 Behaviors\n\n- Header is visually sticky in the WordPress source; the lightweight clone keeps the header visible without loading theme runtime JavaScript.\n- CTA links point to #form.\n- The original form uses Elementor Pro JavaScript and hidden fields. The clone replaces it with a small validated client form and redirects to /your-submission-was-successful/.\n- WordPress analytics, Yandex/Facebook pixels, Elementor runtime, Swiper, lazyload, and WooCommerce snippets are intentionally removed.\n- Known first-pass risk: animation, carousel, and sticky micro-behaviors may not exactly match until browser QA pass.\n`,
);
writeFileSync(
  join(workspace, "docs/research/components/home-page.spec.md"),
  `# Home Page Spec\n\n- Target file: nutrizione24-next/app/page.tsx\n- Reference HTML: /private/tmp/nutrizione24-home.html\n- Reference screenshots: docs/design-references/nutrizione24-desktop.png, docs/design-references/nutrizione24-mobile.png\n- DOM source: sanitized WordPress/Elementor HTML with scripts removed.\n- Styling: source inline Elementor CSS plus local copies of the minimum theme/vendor CSS.\n- Assets: copied from news.artmez.pro/wp-content/uploads into nutrizione24-next/public/wp-content/uploads.\n- Interaction model: anchor scroll and client-side form redirect.\n- Responsive behavior: inherits Elementor source media queries, with custom safety overrides in app/globals.css.\n`,
);

const favicon = join(workspace, "news.artmez.pro/wp-content/uploads/2024/09/Фавикон-150x150.png");
if (existsSync(favicon)) {
  ensureDir(join(root, "public/assets"));
  copyFileSync(favicon, join(root, "public/assets/favicon.png"));
}
const product = join(workspace, "news.artmez.pro/wp-content/uploads/2026/02/product.png");
if (existsSync(product)) {
  ensureDir(join(root, "public/assets"));
  copyFileSync(product, join(root, "public/assets/product.png"));
}

console.log(`Copied ${uploadUrls.size} referenced upload URLs and generated sanitized content.`);
