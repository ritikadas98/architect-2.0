#!/usr/bin/env bash
# Build Architect 2.0 and publish it to ritikadas.in/architect.
# The portfolio repo (ritikadas98/ritikadas.github.io) serves ritikadas.in, so the
# built site is copied into its architect/ folder and pushed as Ritika Das.
set -euo pipefail

APP="$(cd "$(dirname "$0")/.." && pwd)"
SITE="${SITE:-$APP/../ritikadas.github.io}"

export GH_TOKEN="${GH_TOKEN:-$(gh auth token --user ritikadas98)}"   # push as Ritika, whatever gh account is active

cd "$APP"
npm run build

cd "$SITE"
GIT_CONFIG_GLOBAL=/dev/null git -c credential.helper='!gh auth git-credential' pull --ff-only https://github.com/ritikadas98/ritikadas.github.io.git main
rm -rf architect
cp -R "$APP/dist" architect
git add architect
if git diff --cached --quiet; then
  echo "Nothing changed."
  exit 0
fi
git -c user.name="Ritika Das" -c user.email="168818346+ritikadas98@users.noreply.github.com" \
  commit -m "Publish Architect 2.0 ($(git -C "$APP" rev-parse --short HEAD))"
GIT_CONFIG_GLOBAL=/dev/null git -c credential.helper='!gh auth git-credential' \
  push https://github.com/ritikadas98/ritikadas.github.io.git HEAD:main
echo "Live at https://ritikadas.in/architect/ in about a minute."
