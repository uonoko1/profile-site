import type { Job } from "./types";

/**
 * 出典: 本人提供のキャリア記録(igor リポジトリ)。
 * 公開してよい職務事実のみを載せる。報酬・生年月日・私生活は含めない。
 */
export const career: Job[] = [
  {
    start: "2024-04",
    end: null,
    company: "株式会社ヌーラボ",
    role: "Software Engineer — Backlog",
    summary:
      "プロジェクト管理ツール Backlog の開発。4 名のチームで、Scala によるサーバーサイドと React / TypeScript のフロントエンドを担当している。",
    highlights: [
      {
        title: "Markdown パーサーの再実装",
        body: "GFM 準拠の新しい Markdown 記法を flexmark-java で実装。AST の拡張点を設計し、ベータで実利用のフィードバックを受けたうえで正式版へ昇格させた。設計の背景は会社の技術ブログで公開している。",
        link: {
          label: "Backlogの新しいMarkdown記法の実装背景",
          href: "https://nulab.com/ja/blog/nulab/new-markdown-implementation-background/",
        },
      },
      {
        title: "レガシー MPA の SPA 移行",
        body: "Scala + knockout.js + Haxe で書かれた画面群を React + TypeScript の SPA に書き換え。フロントエンドのテスタビリティを上げると同時に、チームが保守し続けなければならない旧技術を 3 つ減らした。",
      },
      {
        title: "認証認可の統合(プロジェクトリーダー)",
        body: "コードベースに点在していた認証認可のロジックを、統一されたインターフェースへ集約するプロジェクトを主導。ゴールからロードマップを逆算し、PBI の作成と価値の説明、リファインメントとプランニングの運営まで担当している。自分以外は 10〜20 年目のエンジニアで、最も若手の立場でリードしている。",
      },
      {
        title: "JVM のメモリ問題を解析",
        body: "Scala / Akka HTTP のサービスで発生したメモリの問題を、ヒープダンプと Eclipse MAT で追跡。手順をチームの参照用に記事としてまとめた。",
        link: {
          label: "Scalaアプリケーションから取得したヒープダンプの解析をしてみる",
          href: "https://daichisakai.net/blog/6937042844e67a430b72c4f2",
        },
      },
      {
        title: "社内輪読会と Architectural Katas",
        body: "『ソフトウェアアーキテクチャの基礎』の輪読会を社内で主催し、Architectural Katas の演習まで実施。単一障害点や BFF の是非を実際に議論した内容を記事にした。",
        link: {
          label: "社内で「アーキテクチャの基礎」の輪読会をしてArchitectural Katasに挑戦してみた",
          href: "https://nulab.com/ja/blog/nulab/architectural-katas/",
        },
      },
    ],
    stack: ["Scala", "Java", "TypeScript", "React", "flexmark-java", "Akka HTTP"],
  },
  {
    start: "2023-04",
    end: "2024-03",
    company: "個人開発",
    role: "Independent Developer",
    summary:
      "SWE として就職するまでの約 1 年間、独学で LiveGT をゼロから開発した。フロントエンド・バックエンド・データベース・デプロイまでを一人で通し、ソフトウェアエンジニアリングを実務として成立させられるところまで持っていった期間。",
    highlights: [],
    stack: ["JavaScript", "Node.js", "MongoDB"],
  },
  {
    start: "2022-04",
    end: "2023-03",
    company: "株式会社sizebook",
    role: "Web マーケティング / 広告運用",
    summary:
      "インターネット広告代理店で、B2C クライアントの広告運用と既存顧客への営業を担当。売るより作る側に回りたいと判断してソフトウェアエンジニアへ転向した。",
    highlights: [],
    stack: [],
  },
];

export const education = [
  {
    date: "2022-03",
    title: "関西学院大学 経済学部 卒業",
    note: "大洞ゼミ(ミクロ経済学・ゲーム理論・契約理論)",
  },
];
