#!/usr/bin/env bash
#
# VPS 側で sudo が要る作業をまとめたもの。
#
#   ssh sakura-vps 'bash -s' < scripts/vps-setup.sh
#
# やること:
#   1. nginx の設定を書き換える
#      - /api のリバースプロキシを外す (5010/5011 のプロセスはもう無い)
#      - 静的配信に必要なヘッダとキャッシュ設定を入れる
#   2. backlog.daichisakai.net の配信を止める
#   3. 設定を検証して反映する
#
# 変更前の設定は日時つきでバックアップする。
# 失敗した場合は自動で元に戻す。

set -euo pipefail

CONF=/etc/nginx/sites-available/daichisakai.net.conf
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="/etc/nginx/sites-available/daichisakai.net.conf.bak-${STAMP}"
ATTIC="/var/backups/daichisakai-${STAMP}"

echo "==> 現在の設定をバックアップ: ${BACKUP}"
sudo cp -a "$CONF" "$BACKUP"

echo "==> 新しい設定を書き出す"
sudo tee "$CONF" > /dev/null <<'NGINX'
# daichisakai.net (staging / production)
#
# 静的サイト。アプリケーションサーバーは無い。
# 記事も含めてビルド済みの HTML を配るだけなので、/api のプロキシは持たない。
#
# backlog.daichisakai.net は別ファイル (backlog.daichisakai.conf) が持っている。
# このファイルでは触らない。

# ---- 共通の設定 --------------------------------------------------------
# ビルド成果物はファイル名にハッシュが入るため長期キャッシュしてよい。
# HTML はハッシュを持たないので都度検証させる。
map $uri $daichisakai_cache {
    default                 "no-cache";
    ~*^/assets/             "public, max-age=31536000, immutable";
    ~*\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?)$ "public, max-age=2592000";
}

# ---- ステージング ------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name staging.daichisakai.net;

    root /var/www/staging.daichisakai.net;
    index index.html;

    # 検索結果に載せない
    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Cache-Control $daichisakai_cache always;

    # /blog/foo/ は /blog/foo/index.html を返す。無ければ 404 ページ
    location / {
        try_files $uri $uri/ $uri/index.html /404.html;
    }

    error_page 404 /404.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/staging.daichisakai.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/staging.daichisakai.net/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# ---- 本番 --------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name daichisakai.net www.daichisakai.net;

    root /var/www/daichisakai.net;
    index index.html;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Cache-Control $daichisakai_cache always;

    location / {
        try_files $uri $uri/ $uri/index.html /404.html;
    }

    error_page 404 /404.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/daichisakai.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/daichisakai.net/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = staging.daichisakai.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name staging.daichisakai.net;
    return 404; # managed by Certbot
}

server {
    if ($host = daichisakai.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name daichisakai.net www.daichisakai.net;
    return 404; # managed by Certbot
}
NGINX

# ---- backlog.daichisakai.net を止める ----------------------------------
#
# 2024-02 以降まったく触られておらず、不要との判断。
# ただし取り返しのつく形にしておく:
#   - 消さずに /var/backups へ退避する
#   - 証明書は残す (certbot の更新設定ごと消すと戻すのが面倒なため)
#   - プロセスは kill するだけ。systemd も cron も無く、手で起動されたもの

BACKLOG_CONF=/etc/nginx/sites-enabled/backlog.daichisakai.conf

if [[ -e "$BACKLOG_CONF" ]]; then
    echo "==> backlog.daichisakai.net の配信を止める"
    sudo mkdir -p "$ATTIC"

    # 設定を退避 (sites-available の実体ごと)
    sudo cp -aL "$BACKLOG_CONF" "$ATTIC/backlog.daichisakai.conf"
    sudo rm -f "$BACKLOG_CONF" /etc/nginx/sites-available/backlog.daichisakai.conf

    # 配信物を退避
    if [[ -d /var/www/backlog.daichisakai.net ]]; then
        sudo mv /var/www/backlog.daichisakai.net "$ATTIC/www"
    fi

    # 5020 のプロセスを止める。
    # 2024-02 から起動しっぱなしの Go バイナリで、systemd も cron も無い
    # (= 手で起動されたもの。再起動したら元から復活しない)。
    # バイナリのパスで特定する。ポート番号での照合より確実。
    PID=$(pgrep -f '^/home/githubactions/BacklogApp/backend/build$' | head -1 || true)
    if [[ -n "${PID:-}" ]]; then
        echo "    BacklogApp のプロセス (pid ${PID}) を停止"
        sudo kill "$PID" || true
    else
        echo "    BacklogApp のプロセスは見つからなかった (既に停止済み)"
    fi

    echo "    退避先: ${ATTIC}"
else
    echo "==> backlog.daichisakai.net の設定は既に無い"
fi

echo "==> 設定を検証"
if ! sudo nginx -t; then
    echo "!! 検証に失敗した。元の設定へ戻す"
    sudo cp -a "$BACKUP" "$CONF"
    if [[ -f "$ATTIC/backlog.daichisakai.conf" ]]; then
        sudo cp -a "$ATTIC/backlog.daichisakai.conf" /etc/nginx/sites-available/
        sudo ln -sf /etc/nginx/sites-available/backlog.daichisakai.conf "$BACKLOG_CONF"
    fi
    sudo nginx -t
    exit 1
fi

echo "==> nginx を再読み込み"
sudo systemctl reload nginx

echo
echo "完了。"
echo "  nginx 設定のバックアップ: ${BACKUP}"
if [[ -d "$ATTIC" ]]; then
    echo "  backlog の退避先:         ${ATTIC}"
    echo "    (中身を確認して不要なら sudo rm -rf ${ATTIC})"
fi
echo
echo "元に戻す場合:"
echo "  sudo cp ${BACKUP} ${CONF} && sudo nginx -t && sudo systemctl reload nginx"
