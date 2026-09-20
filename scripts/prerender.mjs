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
