import type { Publication } from "./types";

/*
 * 現在このファイルはどの画面からも参照していない。
 * トップを入口だけの構成にした際に、経歴・実績の一覧を画面から外したため。
 *
 * 消さずに残しているのは、ここが一次情報の控えだから:
 * 本人提供のキャリア記録から事実確認のうえ起こしたもので、
 * 消すと同じものを作り直すのに同じ手間がかかる。
 * 詳細を出す画面を作るときはここから引く。
 */

/**
 * 書いたものは経歴の主張を外部から検証可能にする。
 * 会社の技術ブログを先に、個人ブログを後に並べる。
 */
export const publications: Publication[] = [
  {
    title: "Backlogの新しいMarkdown記法の実装背景",
    href: "https://nulab.com/ja/blog/nulab/new-markdown-implementation-background/",
    date: "2024",
    outlet: "Nulab Engineering Blog",
    topics: ["flexmark-java", "CommonMark", "GFM", "AST"],
  },
  {
    title: "社内で「アーキテクチャの基礎」の輪読会をしてArchitectural Katasに挑戦してみた",
    href: "https://nulab.com/ja/blog/nulab/architectural-katas/",
    date: "2024",
    outlet: "Nulab Engineering Blog",
    topics: ["アーキテクチャ設計", "BFF", "単一障害点"],
  },
  {
    title: "Scalaアプリケーションから取得したヒープダンプの解析をしてみる",
    href: "/blog/scala-heap-dump-analysis",
    date: "2025-12-09",
    outlet: "個人ブログ",
    topics: ["JVM", "メモリリーク", "Akka HTTP", "Eclipse MAT"],
  },
  {
    title: "Scalaで実装するオニオンアーキテクチャの解説",
    href: "/blog/scala-onion-architecture",
    date: "2024-10-22",
    outlet: "個人ブログ",
    topics: ["オニオンアーキテクチャ", "DIP", "SOLID"],
  },
];
