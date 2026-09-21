#!/usr/bin/env bash
#
# 旧サイトの残骸を web root から片付ける。
#
#   scp scripts/cleanup-old-webroot.sh sakura-vps:/tmp/ && ssh -t sakura-vps 'bash /tmp/cleanup-old-webroot.sh'
#
# なぜ要るか:
#   旧構成は githubactions ユーザーでデプロイしていた。新しい配信は ubuntu が
#   行うため、rsync --delete が旧ファイルを消せず (Permission denied)、
#   新旧が混ざったまま配信されて 500 になる。
#
# 消す前に tar.gz で退避する。中身は MyPortfolio リポジトリにも残っている。

set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
ATTIC="/var/backups/daichisakai-webroot-${STAMP}"

echo "==> 旧ファイルを退避してから削除"
sudo mkdir -p "$ATTIC"

for ROOT in /var/www/staging.daichisakai.net /var/www/daichisakai.net; do
    COUNT=$(sudo find "$ROOT" -user githubactions -mindepth 1 2>/dev/null | wc -l)
    NAME=$(basename "$ROOT")

    if [[ "$COUNT" -eq 0 ]]; then
        echo "    ${NAME}: 旧ファイルなし"
        continue
    fi

    echo "    ${NAME}: ${COUNT} 件"
    sudo find "$ROOT" -user githubactions -mindepth 1 -printf '%P\0' 2>/dev/null \
        | sudo tar -C "$ROOT" --null -T - --no-recursion \
              -czf "${ATTIC}/${NAME}.tar.gz"
    sudo find "$ROOT" -user githubactions -mindepth 1 -depth -delete
    echo "      -> ${ATTIC}/${NAME}.tar.gz に退避して削除"
done

# 今後 ubuntu が書き込めるよう、root 自体の所有を揃えておく
for ROOT in /var/www/staging.daichisakai.net /var/www/daichisakai.net; do
    sudo chown ubuntu:deploygroup "$ROOT"
    sudo chmod 775 "$ROOT"
done
echo "==> web root の所有者を ubuntu:deploygroup に統一"

echo
echo "完了。退避先: ${ATTIC}"
echo "  中身を確認して不要なら: sudo rm -rf ${ATTIC}"
