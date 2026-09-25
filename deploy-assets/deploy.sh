#!/usr/bin/env bash
# Updates the site on the server to the latest commit of the checked-out branch.
# Run as root: sudo /srv/mtz-site/deploy-assets/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
as_owner() { sudo -u mtz-site -H "$@"; }

as_owner git pull --ff-only
as_owner backend/env/bin/pip install -r backend/requirements
as_owner backend/env/bin/python backend/manage.py migrate --noinput
as_owner backend/env/bin/python backend/manage.py collectstatic --noinput
as_owner npm ci
as_owner npm run build

systemctl restart mtz-site-django mtz-site-web
echo "Deploy ok: $(git log -1 --oneline)"
