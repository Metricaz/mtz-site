#!/usr/bin/env bash
# Updates the site on the server to the latest commit of the checked-out branch.
# Run as root: sudo /local/dev/mtz-site/deploy-assets/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
as_owner() { sudo -u www-data -H "$@"; }

# The site runs as www-data; anything run by hand as root (npm, manage.py) leaves root-owned
# files behind (read-only database, npm unable to replace node_modules). Hand everything back.
install -d -o www-data -g www-data /var/www/.npm /var/www/.cache
chown -R www-data: . /var/www/.npm /var/www/.cache

branch=$(as_owner git rev-parse --abbrev-ref HEAD)
before=$(as_owner git rev-parse HEAD)
echo "Branch: $branch · antes: $(as_owner git log -1 --oneline)"
as_owner git pull --ff-only
if [ "$(as_owner git rev-parse HEAD)" = "$before" ]; then
  echo
  echo "AVISO: o pull não trouxe nada novo para a branch $branch; o deploy segue com o mesmo commit."
  # The usual cause: the change was committed to another branch that was never merged into this one.
  pending=$(as_owner git branch -r --no-merged HEAD --format='%(refname)' | grep -v '/HEAD$' | sed 's#^refs/remotes/##' || true)
  if [ -n "$pending" ]; then
    echo "Branches no remoto com commits que não estão em $branch:"
    for ref in $pending; do
      echo "  $ref: $(as_owner git rev-list --count "HEAD..$ref") commit(s), último: $(as_owner git log -1 --format='%h %cs %s' "$ref")"
    done
  fi
  echo
fi
as_owner backend/env/bin/pip install -r backend/requirements
as_owner backend/env/bin/python backend/manage.py migrate --noinput
as_owner backend/env/bin/python backend/manage.py collectstatic --noinput
as_owner npm ci
as_owner npm run build

# Services, nginx and cron as in the repository (also restarts the services).
deploy-assets/install.sh
echo "Deploy ok: $branch · $(as_owner git log -1 --oneline)"
