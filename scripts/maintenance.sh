#!/usr/bin/env bash
#
# Ward 54 → Ward 68 — reversible maintenance-mode toggle.
#
#   scripts/maintenance.sh on      # swap the live site for the maintenance page
#   scripts/maintenance.sh off     # restore the full site
#   scripts/maintenance.sh status  # show current state
#
# Mechanism (static GitHub Pages site — no server-side flag is possible):
#   • "on"  backs up the real index.html to index.full.html, then copies
#           maintenance.html over index.html, and bumps the service-worker
#           cache version so returning PWA/app visitors fetch the new page.
#   • "off" restores index.full.html back to index.html and bumps the SW again.
# Nothing is deleted; the real site is always preserved in index.full.html
# and in git history. After either action, commit + push to deploy.
#
# NOTE: uses BSD (macOS) sed syntax. Run locally, not in CI.
set -euo pipefail
cd "$(dirname "$0")/.."

MAINT="maintenance.html"
LIVE="index.html"
BACKUP="index.full.html"
SW="sw.js"
MARKER="WARD-54-68-MAINTENANCE-MODE"

bump_sw(){
  [ -f "$SW" ] || { echo "  (no $SW — skipping cache bump)"; return 0; }
  local cur new
  cur=$(grep -oE "ward54-v[0-9]+" "$SW" | head -1 | sed -E 's/^ward54-v//' || echo "")
  [ -n "$cur" ] || { echo "  (could not read SW cache version — skipping)"; return 0; }
  new=$((cur+1))
  sed -i '' -E "s/ward54-v[0-9]+/ward54-v${new}/g" "$SW"
  echo "  service-worker cache bumped: ward54-v${cur} → ward54-v${new}"
}

is_maint(){ grep -q "$MARKER" "$LIVE" 2>/dev/null; }

case "${1:-status}" in
  on)
    if is_maint; then echo "ℹ️  Already in maintenance mode — nothing to do."; exit 0; fi
    [ -f "$MAINT" ] || { echo "❌ $MAINT not found."; exit 1; }
    cp "$LIVE" "$BACKUP"
    cp "$MAINT" "$LIVE"
    bump_sw
    echo "✅ Maintenance mode ON."
    echo "   • Real site preserved → $BACKUP"
    echo "   • index.html now serves the 'We'll be back soon' page"
    echo "   • Next: git add -A && git commit && git push   (deploys in ~30s)"
    echo "   • To restore later: scripts/maintenance.sh off"
    ;;
  off)
    if ! is_maint; then echo "ℹ️  Live site is already active — nothing to restore."; exit 0; fi
    [ -f "$BACKUP" ] || { echo "❌ Backup $BACKUP missing — restore manually from git history."; exit 1; }
    cp "$BACKUP" "$LIVE"
    rm -f "$BACKUP"
    bump_sw
    echo "✅ Maintenance mode OFF — full site restored to index.html."
    echo "   • Next: git add -A && git commit && git push   (deploys in ~30s)"
    ;;
  status)
    if is_maint; then echo "STATUS: 🟠 MAINTENANCE — index.html is the coming-soon page";
    else echo "STATUS: 🟢 LIVE — index.html is the full application"; fi
    ;;
  *)
    echo "Usage: $0 {on|off|status}"; exit 1 ;;
esac
