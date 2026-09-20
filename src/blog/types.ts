/** Markdown から読み出した記事。本文は描画済み HTML として持つ */
export type Post = {
  slug: string;
  title: string;
  /** ISO 日付 (JST)。一覧の並び替えと表示に使う */
  date: string;
  updated?: string;
  /** 旧 MongoDB の _id。過去 URL との対応を追えるよう残している */
  legacyId?: string;
  /** 本文から機械的に起こした抜粋 */
  excerpt: string;
  /** レンダリング済みの本文 HTML */
  html: string;
  /** 目次に使う見出し */
  headings: { depth: number; text: string; id: string }[];
  readingMinutes: number;
};

export type PostSummary = Omit<Post, "html" | "headings">;
