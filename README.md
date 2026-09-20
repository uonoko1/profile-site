# daichisakai.net

プロフィールサイト。静的サイトで、サーバーを持たない。

## 構成

| | |
|---|---|
| フロント | React 19 + TypeScript + Vite |
| スタイル | Tailwind CSS v4 |
| 3D | three.js (react-three-fiber) — ヒーローの粒子場のみ |
| 記事 | `content/posts/*.md` をビルド時に読み込む |
| 配信 | nginx (VPS) で静的ファイルを配るだけ |

バックエンドもデータベースもない。記事は Markdown としてこのリポジトリが正本で、
git の履歴がそのまま版管理と冗長化を兼ねている。

## 開発

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # dist/ に静的書き出し (各ルートを HTML へプリレンダ)
pnpm preview      # ビルド結果の確認
pnpm typecheck
pnpm lint
```

## 記事を書く

`content/posts/` に `YYYY-MM-DD-<slug>.md` を置く。

```markdown
---
title: "記事のタイトル"
date: 2026-01-15
slug: my-post
---

本文。画像は ./assets/ に置いて ![alt](./assets/foo.png) で参照する。
```

`slug` がそのまま URL (`/blog/<slug>/`) になる。
`pnpm build` すると一覧と記事ページが生成され、コードブロックは
シンタックスハイライトされる。

## デプロイ

- `main` への push → staging.daichisakai.net に自動反映
- 本番 (daichisakai.net) は GitHub Actions の workflow_dispatch から手動実行

どちらも `dist/` を rsync で VPS へ送るだけ。

## 経緯

旧サイトは Express + MongoDB Atlas で記事を配信していたが、
記事の保管場所が Atlas だけという状態だった。Markdown に移し、
リポジトリを正本にすることで、その依存とバックアップ運用の必要をなくしている。
