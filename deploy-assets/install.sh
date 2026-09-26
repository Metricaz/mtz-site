#!/usr/bin/env bash
# Installs this folder's server config: systemd services, nginx site and cron.
# Safe to run again (it overwrites with the versions in the repository). Run as root:
#   /local/dev/mtz-site/deploy-assets/install.sh
set -euo pipefail

cd "$(dirname "$0")"

install -m 644 systemd/mtz-site-django.service systemd/mtz-site-web.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable mtz-site-django mtz-site-web
systemctl restart mtz-site-django mtz-site-web

install -m 644 sites-available/mtz-site.conf /etc/nginx/sites-available/
ln -sfn /etc/nginx/sites-available/mtz-site.conf /etc/nginx/sites-enabled/mtz-site.conf
nginx -t
systemctl reload nginx

install -m 644 cron.d/mtz-site /etc/cron.d/

echo "Installed: mtz-site-django, mtz-site-web, nginx mtz-site.conf, cron.d/mtz-site"
