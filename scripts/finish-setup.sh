#!/usr/bin/env bash
#
# 寝ている間に終わらなかった分を、1コマンドでまとめて実行する。
#
#   bash scripts/finish-setup.sh
#
# 途中で sudo のパスワードを1回聞かれる (VPS の nginx 設定を書き換えるため)。
# それ以外の入力は要らない。
#
# やること:
#   1. GitHub にリポジトリを作って push する
#   2. デプロイに使う secrets を登録する
#   3. VPS の nginx 設定を直す  ← ここで sudo のパスワードを聞かれる
#   4. staging へデプロイして、表示を確認する
#
# 本番 (daichisakai.net) には触らない。
# staging を見て良ければ、最後に出る手順で反映する。

set -euo pipefail

REPO=profile-site
OWNER=uonoko1
VPS=sakura-vps
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$1"; }
ok()  { printf "    \033[32m+\033[0m %s\n" "$1"; }

# ---- 前提の確認 --------------------------------------------------------
say "前提を確認"
command -v gh >/dev/null || { echo "gh コマンドが要る: https://cli.github.com/"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh にログインして: gh auth login"; exit 1; }
ssh -o BatchMode=yes -o ConnectTimeout=10 "$VPS" true || { echo "$VPS に SSH できない"; exit 1; }
ok "gh と $VPS の疎通を確認"

# ---- 1. リポジトリ -----------------------------------------------------
say "GitHub にリポジトリを用意"
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
    ok "$OWNER/$REPO は既にある"
    git remote get-url origin >/dev/null 2>&1 || \
        git remote add origin "https://github.com/$OWNER/$REPO.git"
else
    # 職歴を載せるサイトなので公開。秘匿すべきものが無いことは commit 前に確認済み。
    gh repo create "$OWNER/$REPO" --public \
        --description "daichisakai.net - プロフィールサイト" \
        --source=. --remote=origin
    ok "$OWNER/$REPO を作成"
fi

say "push"
git push -u origin main
ok "main を push"

# ---- 2. secrets --------------------------------------------------------
say "デプロイ用の secrets を登録"
KEY=~/.ssh/id_ed25519
if [[ ! -f "$KEY" ]]; then
    echo "  $KEY が無いので、デプロイ用の鍵を作る"
    ssh-keygen -t ed25519 -N "" -f "$KEY" -C "github-actions@$REPO"
    ssh-copy-id -i "$KEY.pub" "$VPS"
fi

gh secret set SSH_PRIVATE_KEY --repo "$OWNER/$REPO" --body "$(base64 -w0 < "$KEY")"
gh secret set USER            --repo "$OWNER/$REPO" --body "$(ssh -G "$VPS" | awk '/^user /{print $2}')"
gh secret set HOST            --repo "$OWNER/$REPO" --body "$(ssh -G "$VPS" | awk '/^hostname /{print $2}')"
ok "SSH_PRIVATE_KEY / USER / HOST を登録"

# ---- 3. VPS の nginx (sudo はここだけ) ---------------------------------
say "VPS の nginx 設定を更新  <- sudo のパスワードを聞かれる"
echo "    (5010/5011 への /api プロキシを外す。該当プロセスはもう無い)"
# スクリプトを先に置いてから、端末付きで実行する。
# 'bash -s' < file だと stdin がファイルに占有され、ssh -t が端末を割り当てられず
# sudo がパスワードを聞けない。
scp -q scripts/vps-setup.sh "$VPS:/tmp/vps-setup.sh"
ssh -t "$VPS" 'bash /tmp/vps-setup.sh; rc=$?; rm -f /tmp/vps-setup.sh; exit $rc'
ok "nginx を更新"

# ---- 4. staging へ -----------------------------------------------------
say "staging へデプロイ"
if gh workflow run deploy-staging.yml --repo "$OWNER/$REPO" 2>/dev/null; then
    echo "    GitHub Actions を起動した。完了を待つ..."
    sleep 10
    RUN_ID=$(gh run list --repo "$OWNER/$REPO" --workflow deploy-staging.yml \
               --limit 1 --json databaseId --jq '.[0].databaseId')
    gh run watch --repo "$OWNER/$REPO" --exit-status "$RUN_ID" || true
else
    echo "    Actions が使えないので、ここから直接送る"
    pnpm install --frozen-lockfile
    pnpm build
    rsync -az --delete dist/ "$VPS:/var/www/staging.daichisakai.net/"
fi

say "確認"
for path in / /blog/ /blog/scala-heap-dump-analysis/; do
    code=$(curl -sS -o /dev/null -w '%{http_code}' "https://staging.daichisakai.net${path}")
    printf "    %-38s %s\n" "$path" "$code"
done

cat <<'DONE'

--------------------------------------------------------------
staging に出た:  https://staging.daichisakai.net

見て良ければ、本番へ:

    gh workflow run deploy-production.yml

本番は手動実行だけにしてある (push では流れない)。
--------------------------------------------------------------
DONE
