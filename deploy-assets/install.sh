#!/usr/bin/env bash
# Installs this folder's server config: systemd services, nginx site and cron.
# Safe to run again (it overwrites with the versions in the repository). Run as root:
#   /local/dev/mtz-site/deploy-assets/install.sh       (UAT; production: /local/mtz-site/...)
# The files name the project as /local/dev/mtz-site; each copy gets the folder this script is in.
set -euo pipefail

cd "$(dirname "$0")"

# Which nginx site: DEPLOY_ENV in backend/.env (uat = mtz-site.conf, prd = mtz-site-prd.conf).
env=$(sed -n 's/^DEPLOY_ENV=//p' ../backend/.env)
case "${env:-uat}" in
    uat) site=mtz-site ;;
    prd) site=mtz-site-prd ;;
    *) echo "DEPLOY_ENV in backend/.env must be uat or prd (is: $env)" >&2; exit 1 ;;
esac

root=$(cd .. && pwd)
render() { sed "s#/local/dev/mtz-site#$root#g" "$1" > "$2"; chmod 644 "$2"; }

for unit in mtz-site-django.service mtz-site-web.service; do render systemd/$unit /etc/systemd/system/$unit; done
systemctl daemon-reload
systemctl enable mtz-site-django mtz-site-web
systemctl restart mtz-site-django mtz-site-web

mkdir -p /etc/nginx/snippets
render nginx/mtz-site-common.conf /etc/nginx/snippets/mtz-site-common.conf
render sites-available/$site.conf /etc/nginx/sites-available/$site.conf
ln -sfn /etc/nginx/sites-available/$site.conf /etc/nginx/sites-enabled/$site.conf
nginx -t
systemctl reload nginx

render cron.d/mtz-site /etc/cron.d/mtz-site

echo "Installed from $root: mtz-site-django, mtz-site-web, nginx $site.conf, cron.d/mtz-site"
