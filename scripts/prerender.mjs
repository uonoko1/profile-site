/**
 * ビルド後の dist/index.html を雛形に、各ルートの HTML を静的に書き出す。
 * JS を切っても本文が読める状態を保つのが目的。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const { render, posts } = await import(
  path.join(dist, "server/entry-server.js")
);

let template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

/*
 * three.js は端末の判定後にしか読み込まない(モバイルや reduced-motion では
 * そもそも起動しない)。modulepreload があると全ページで先読みしてしまい、
 * 遅延分割の意味がなくなるため落とす。
 */
template = template.replace(
  /\s*<link rel="modulepreload"[^>]*href="[^"]*three-[^"]*"[^>]*>/g,
  "",
);

const routes = [
  "/",
  "/blog",
  ...posts.map((p) => `/blog/${p.slug}`),
  "/404",
];

let count = 0;
for (const route of routes) {
  const { html, head } = render(route);

  const page = template
    .replace("<!--head-->", head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  // /blog/foo -> dist/blog/foo/index.html (trailingSlash 相当)
  const outPath =
    route === "/"
      ? path.join(dist, "index.html")
      : route === "/404"
        ? path.join(dist, "404.html")
        : path.join(dist, route, "index.html");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page);
  count++;
  console.log(`  ${route} -> ${path.relative(dist, outPath)}`);
}

// 検索エンジン向けの sitemap と robots.txt。
// 404 は除く (noindex を付けてある)。
const SITE = "https://daichisakai.net";
const urls = routes.filter((r) => r !== "/404");
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map((r) => {
      const loc = r === "/" ? `${SITE}/` : `${SITE}${r}/`;
      // 記事は執筆日を lastmod にする
      const post = posts.find((p) => `/blog/${p.slug}` === r);
      const lastmod = post ? (post.updated ?? post.date) : null;
      return (
        `  <url>\n    <loc>${loc}</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
        "  </url>"
      );
    })
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
);
console.log(`\nwrote sitemap.xml (${urls.length} urls) and robots.txt`);

// 記事の画像を配信パスへ配置する
const assetsSrc = path.join(root, "content/posts/assets");
if (fs.existsSync(assetsSrc)) {
  const assetsOut = path.join(dist, "blog/assets");
  fs.mkdirSync(assetsOut, { recursive: true });
  let copied = 0;
  for (const f of fs.readdirSync(assetsSrc)) {
    fs.copyFileSync(path.join(assetsSrc, f), path.join(assetsOut, f));
    copied++;
  }
  console.log(`\ncopied ${copied} assets`);
}

// サーバー用の中間生成物は配信物に含めない
fs.rmSync(path.join(dist, "server"), { recursive: true, force: true });

console.log(`\nprerendered ${count} routes`);
