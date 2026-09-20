import type { SkillGroup } from "./types";

/**
 * 実際に業務または個人開発で投入したものだけを、その文脈つきで挙げる。
 * 触った程度のもの(クラウド・IaC 等)は意図的に載せていない。
 * 過大な申告は面談の最初の 5 分で崩れるため、ここは常に控えめに保つ。
 */
export const skills: SkillGroup[] = [
  {
    label: "業務の主戦場",
    items: [
      { name: "Scala", note: "Backlog のサーバーサイド。オニオンアーキテクチャの実装と解説記事" },
      { name: "TypeScript", note: "業務のフロントエンドと個人開発すべて" },
      { name: "React", note: "Backlog の SPA 化、個人開発" },
      { name: "Java", note: "flexmark-java での Markdown パーサー実装" },
    ],
  },
  {
    label: "設計",
    items: [
      { name: "関数型プログラミング", note: "宣言的な合成 → テスタビリティ → リファクタリングの自由度" },
      { name: "オニオンアーキテクチャ / DDD" },
      { name: "認証認可の設計", note: "分散したロジックの統合を主導中" },
      { name: "パーサー実装", note: "CommonMark / GFM 準拠、AST の拡張点設計" },
      { name: "Architectural Katas", note: "社内演習を主催" },
    ],
  },
  {
    label: "その他の言語",
    items: [
      { name: "JavaScript" },
      { name: "Go", note: "個人開発(echo)" },
      { name: "Rust", note: "個人開発。認証マイクロサービスを試作し、過剰設計と判断して撤退" },
      { name: "Python", note: "データ処理" },
    ],
  },
  {
    label: "基盤",
    items: [
      { name: "Node.js" },
      { name: "Next.js" },
      { name: "Play Framework" },
      { name: "PostgreSQL / MySQL / SQLite" },
      { name: "Docker / Compose" },
      { name: "Linux (VPS 運用)" },
    ],
  },
  {
    label: "進め方",
    items: [
      { name: "スクラム", note: "PBI の作成からリファインメント・プランニングの運営まで" },
      { name: "テスト", note: "Vitest / Playwright" },
      { name: "JVM の性能解析", note: "ヒープダンプと Eclipse MAT" },
      { name: "GitHub Actions" },
    ],
  },
];
