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

1. `content/posts/` に `YYYY-MM-DD-<slug>.md` を作る

   ```markdown
   ---
   title: "記事のタイトル"
   date: 2026-01-15
   slug: my-post
   ---

   本文をここから書く。
   ```

   `slug` がそのまま URL (`/blog/my-post/`) になる。英数字とハイフンで、
   内容が分かる短い名前にする。ファイル名の日付は並べ替え用で、
   表示に使うのは frontmatter の `date`。

2. 画像を使うなら `content/posts/assets/` に置いて、本文からは
   `![説明](./assets/foo.png)` で参照する。ビルド時に `/blog/assets/`
   へ配置され、パスも書き換わる。

3. `pnpm dev` で確認する (http://localhost:5173/blog/)。
   記事を保存すると自動で再読み込みされる。

4. commit して push する。

   ```bash
   git add content/posts && git commit -m "Add post: 記事のタイトル"
   git push
   ```

   push すると staging に自動で出る。確認して良ければ本番へ:

   ```bash
   gh workflow run deploy-production.yml
   ```

書き終えたら一覧とトップの導線、`sitemap.xml` は自動で更新される。
手で触るファイルは `.md` ひとつだけ。

### 書けること

- 見出し (`##`〜`####`)、リスト、引用、表
- コードブロックはシンタックスハイライトされる。
  対応言語は `src/blog/loader.ts` の `LANGS` にある
  (Scala / Java / TypeScript / Rust / Go / Python / SQL など)。
  増やしたいときはそこに足す
- 見出しが3つ以上あると、記事ページの左に目次が出る
- 読了時間は本文の文字数から自動で出す (コードブロックは除く)

### 注意

- frontmatter の日付は引用符で囲まなくてよいが、`2026-01-15` の形で書く
- 本文に `<int>` のような山かっこを裸で書くと HTML として解釈される。
  バッククォートで囲む

## デプロイ

- `main` への push → staging.daichisakai.net に自動反映
- 本番 (daichisakai.net) は GitHub Actions の workflow_dispatch から手動実行

どちらも `dist/` を rsync で VPS へ送るだけ。

## 経緯

旧サイトは Express + MongoDB Atlas で記事を配信していたが、
記事の保管場所が Atlas だけという状態だった。Markdown に移し、
リポジトリを正本にすることで、その依存とバックアップ運用の必要をなくしている。

## 旧構成の後始末

`scripts/vps-setup.sh` が以下をまとめて行う (`finish-setup.sh` から呼ばれる)。

- `/api` のリバースプロキシを外す — 5010/5011 のプロセスは既に無い
- `backlog.daichisakai.net` の配信を止める — 2024-02 以降更新されておらず不要

どちらも消す前に `/var/backups/daichisakai-<日時>/` へ退避する。
証明書は残してあるので、気が変わったら設定を戻すだけで復旧できる。

### 記事の投稿について

旧構成には BlogAdmin という別リポジトリがあり、`POST /blog` などの
書き込み口と記事エディタを持っていた。ただし**認証が一切無く**、
VPS にデプロイもされていなかった (本番のサーバーは読み取り口しか持たない)。

現構成では記事は Markdown ファイルなので、書き込み口そのものが不要になり、
認証を持たないエンドポイントが公開される余地も無くなっている。
