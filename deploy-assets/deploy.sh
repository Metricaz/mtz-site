#!/usr/bin/env bash
# Updates the site on the server to the latest commit of the checked-out branch.
# Run as root: sudo /local/dev/mtz-site/deploy-assets/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
as_owner() { sudo -u www-data -H "$@"; }

as_owner git pull --ff-only
as_owner backend/env/bin/pip install -r backend/requirements
as_owner backend/env/bin/python backend/manage.py migrate --noinput
as_owner backend/env/bin/python backend/manage.py collectstatic --noinput
as_owner npm ci
as_owner npm run build

# Services, nginx and cron as in the repository (also restarts the services).
deploy-assets/install.sh
echo "Deploy ok: $(as_owner git log -1 --oneline)"
