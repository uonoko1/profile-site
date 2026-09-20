import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { createHighlighter, type Highlighter } from "shiki";
import type { Post } from "./types";

const POSTS_DIR = path.resolve(process.cwd(), "content/posts");

/** 記事中に現れる言語だけを読み込む。増えたらここに足す */
const LANGS = [
  "scala", "java", "typescript", "javascript", "bash", "shell",
  "json", "yaml", "sql", "rust", "go", "python", "text",
];

let highlighter: Highlighter | null = null;
async function getHighlighter() {
  highlighter ??= await createHighlighter({
    themes: ["github-dark"],
    langs: LANGS,
  });
  return highlighter;
}

/** 見出しに id を振り、目次から辿れるようにする */
function slugifyHeading(text: string, used: Set<string>) {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "section";
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

function buildMarkdown(hl: Highlighter) {
  const md = new MarkdownIt({
    html: false, // 本文は信頼できるが、生 HTML を通す理由がない
    linkify: true,
    typographer: false,
    highlight(code, lang) {
      const language = LANGS.includes(lang) ? lang : "text";
      try {
        return hl.codeToHtml(code, { lang: language, theme: "github-dark" });
      } catch {
        return "";
      }
    },
  });

  // 外部リンクは新規タブ。内部アンカーはそのまま
  const defaultLink =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = String(tokens[idx].attrGet("href") ?? "");
    if (/^https?:\/\//.test(href)) {
      tokens[idx].attrSet("target", "_blank");
      tokens[idx].attrSet("rel", "noreferrer noopener");
    }
    return defaultLink(tokens, idx, options, env, self);
  };

  return md;
}

/**
 * frontmatter の日付を YYYY-MM-DD に正規化する。
 * YAML は引用符なしの日付を Date に変換するため、そのまま文字列化すると
 * "Tue Dec 09 2025 ..." になってしまう。UTC 基準で組み直す。
 */
function normaliseDate(v: unknown): string {
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v ?? "").slice(0, 10);
}

/** 本文から抜粋を作る。記法を落として最初の段落だけ取る */
function makeExcerpt(raw: string, max = 120) {
  const text = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .find((s) => s.length > 0) ?? "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function loadPosts(): Promise<Post[]> {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const hl = await getHighlighter();
  const md = buildMarkdown(hl);

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const used = new Set<string>();
    const headings: Post["headings"] = [];
    for (const line of content.split("\n")) {
      const m = /^(#{1,6})\s+(.*)$/.exec(line);
      if (m) {
        const text = m[2].replace(/[*_`]/g, "").trim();
        headings.push({ depth: m[1].length, text, id: slugifyHeading(text, used) });
      }
    }

    // 目次の id と本文の id を一致させる
    const ids = headings.map((h) => h.id);
    let hi = 0;
    const defaultHeading =
      md.renderer.rules.heading_open ??
      ((t, i, o, _e, s) => s.renderToken(t, i, o));
    md.renderer.rules.heading_open = (t, i, o, e, s) => {
      const id = ids[hi++];
      if (id) t[i].attrSet("id", id);
      return defaultHeading(t, i, o, e, s);
    };

    // 画像は /blog/assets/ 配下に配置する
    const body = content.replace(
      /!\[([^\]]*)\]\(\.\/assets\/([^)]+)\)/g,
      (_m, alt, f) => `![${alt}](/blog/assets/${encodeURIComponent(f)})`,
    );

    const html = md.render(body);
    // コードブロックは読み物としての分量ではないので除いて見積もる
    const prose = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "");

    return {
      slug: String(data.slug ?? file.replace(/\.md$/, "")),
      title: String(data.title ?? "無題"),
      date: normaliseDate(data.date),
      ...(data.updated && { updated: normaliseDate(data.updated) }),
      ...(data.legacyId && { legacyId: String(data.legacyId) }),
      excerpt: makeExcerpt(content),
      html,
      headings,
      // 和文は文字数ベースで見積もる (約600字/分)
      readingMinutes: Math.max(1, Math.round(prose.length / 600)),
    } satisfies Post;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
