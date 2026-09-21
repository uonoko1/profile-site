import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { App } from "./App";
import { posts } from "virtual:posts";
import { site } from "@/content/site";

/** プリレンダ時に <head> へ焼き込む内容を組み立てる */
function headFor(url: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  let title = `${site.name} — ${site.role}`;
  let description = site.description;
  let canonical = `${site.url}/`;
  let ogType = "profile";
  let jsonLd: object | null = null;

  const post = posts.find((p) => `/blog/${p.slug}` === url);
  if (post) {
    title = `${post.title} — ${site.name}`;
    description = post.excerpt;
    canonical = `${site.url}/blog/${post.slug}/`;
    ogType = "article";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      ...(post.updated && { dateModified: post.updated }),
      author: { "@type": "Person", name: site.name },
      mainEntityOfPage: canonical,
    };
  } else if (url === "/404") {
    title = `見つかりません — ${site.name}`;
    description = "指定されたページは存在しません。";
    canonical = `${site.url}/`;
    ogType = "website";
  } else if (url === "/blog") {
    title = `書いたもの — ${site.name}`;
    description = "実装で詰まったところと、その解き方の記録。";
    canonical = `${site.url}/blog/`;
    ogType = "website";
  } else if (url === "/") {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      alternateName: site.nameJa,
      jobTitle: site.role,
      url: site.url,
      description: site.description,
      sameAs: site.links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
    };
  }

  const tags = [
    `<title>${esc(title)}</title>`,
    // 404 は検索結果に載せない
    ...(url === "/404" ? ['<meta name="robots" content="noindex" />'] : []),
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="${esc(ogType)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:locale" content="${esc(site.locale)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  ];
  if (jsonLd) {
    // JSON 内の < を退避して </script> による早期終了を防ぐ
    const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }
  return tags.join("\n    ");
}

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  return { html, head: headFor(url) };
}

export { posts };
