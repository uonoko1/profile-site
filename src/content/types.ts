/**
 * サイト内のコンテンツはすべてこの層に集約する。
 * 表示側はこの型だけに依存させ、経歴の更新が1ファイルで済むようにしている。
 */

export type Site = {
  name: string;
  nameJa: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  links: { label: string; href: string }[];
};

export type Link = { label: string; href: string };

/** 職歴の中の個別の実績。外部に検証可能な記事があれば link を添える */
export type Highlight = {
  title: string;
  body: string;
  link?: Link;
};

export type Job = {
  /** ISO 形式。終了が未定なら end を null にする */
  start: string;
  end: string | null;
  company: string;
  /** 社名を伏せる場合の表示名。未設定なら company をそのまま出す */
  companyAlias?: string;
  role: string;
  summary: string;
  /** 実績。検証可能なもの(公開記事・成果物)を優先して並べる */
  highlights: Highlight[];
  stack: string[];
};

export type Project = {
  slug: string;
  title: string;
  year: string;
  blurb: string;
  /** 課題 → 手法 → 結果 の順で書く */
  problem?: string;
  approach?: string;
  outcome?: string;
  stack: string[];
  links?: Link[];
  /** true のとき一覧で大きく扱う */
  featured?: boolean;
};

export type SkillGroup = {
  label: string;
  items: { name: string; note?: string }[];
};

export type Publication = {
  title: string;
  href: string;
  date: string;
  /** 掲載先。会社の技術ブログか個人ブログかで重みが変わるので明示する */
  outlet: string;
  topics: string[];
};

export type Education = {
  date: string;
  title: string;
  note?: string;
};
