import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "giinrecord",
    title: "議会ログ (giinrecord)",
    year: "2026",
    blurb:
      "国会議員の投票・提出法案・発言を、公式記録だけで出典付きで並べる公開サービス。",
    problem:
      "国会議員の実際の行動は公式に記録されているが、衆参・国立国会図書館に分散し、個人単位で追うのが現実的でない。既存の政治系サイトは独自の採点や色分けで評価を混ぜてしまう。",
    approach:
      "衆参両院と国会会議録から日次で収集する ETL を GitHub Actions のバッチとして実装し、正規化した JSON を生成。全行に一次資料へのリンクと取得日時を持たせた。事実と推定を型の上で分離し、個人別投票が公開されていない衆議院は「会派の態度」として別扱いにしている。配信はビルド時プリレンダリングの静的サイトで、サーバー実行コードを持たない。",
    outcome:
      "スコア・ランク・一致率といった評価指標を一切作らない方針を設計原則として明文化。コードを MIT、データを CC BY 4.0 で公開し、第三者が検証・再利用できる形にした。",
    stack: [
      "TypeScript",
      "React",
      "Vite",
      "ETL / GitHub Actions",
      "Docker",
      "nginx",
    ],
    links: [
      { label: "Site", href: "https://giinrecord.jp" },
      { label: "GitHub", href: "https://github.com/uonoko1/giinrecord" },
    ],
    featured: true,
  },
  {
    slug: "livegt",
    title: "LiveGT",
    year: "2023 — 2026",
    blurb: "近くのライブを地図上でリアルタイムに探せるサービス。個人開発を v3 まで継続。",
    problem:
      "ライブハウスの公演情報は会場ごとのサイトに散在し、「今夜この辺りで何をやっているか」を地図から探す手段がない。",
    approach:
      "PostGIS の地理空間インデックスを用いた bbox クエリで地図の表示範囲に対応するライブを引き、SSE でライブ作成イベントを配信。API は関心事ごとに 5 モジュールへ分割し、各モジュールが domain / usecase / infrastructure / controller / dto / di の層を内包する構成にした。composition root からポートを注入して組み立てる。auth モジュールを規約の参照実装と定め、移行手順を文書化してモジュール間の一貫性を保っている。",
    outcome:
      "pnpm ワークスペースのモノレポで web / api / スキーマを共有。Testcontainers で実 PostgreSQL・Valkey を起動する統合テストと、Playwright による実ブラウザ E2E を CI に組み込んでいる。",
    stack: [
      "TypeScript",
      "Hono",
      "PostgreSQL / PostGIS",
      "Drizzle ORM",
      "Valkey",
      "React 19",
      "MapLibre",
      "Docker",
      "Playwright",
    ],
    featured: true,
  },
  {
    slug: "livegt-auth-service",
    title: "LiveGT Auth Service",
    year: "2025",
    blurb: "認証をマイクロサービスに切り出し、過剰設計と判断して撤退した記録。",
    problem:
      "LiveGT のセッション認証を独立サービスに分離すれば、責務が綺麗に切れると考えた。",
    approach:
      "認証の責務を Rust で独立したサービスとして実装し、コンテナとして配置した。",
    outcome:
      "この規模のプロダクトに対しては分散のコストが利得を上回ると判断し、モノリスへ引き戻した。撤退の判断そのものを残しておきたいのでリポジトリは残している。書いたコードより、書かないと決めた判断のほうが学びが大きかった。",
    stack: ["Rust", "Docker"],
    featured: false,
  },
  {
    slug: "igor",
    title: "igor",
    year: "2026",
    blurb:
      "生活上の定型タスクを委譲するエージェント基盤。専門サブエージェントにタスクを振る構成。",
    approach:
      "Claude Code をベースに、資産集計などの周辺ツールをコンテナ構成で束ねた執事エージェント。",
    stack: ["TypeScript", "Docker", "Claude Code"],
    featured: false,
  },
];
