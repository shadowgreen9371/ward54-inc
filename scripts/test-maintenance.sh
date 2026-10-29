#!/usr/bin/env bash
#
# Test for the maintenance-mode toggle. Verifies, in an isolated temp copy
# (never touching the real repo):
#   1. `maintenance.sh on`  → index.html becomes the maintenance page,
#                             the real site is preserved in index.full.html,
#                             and the service-worker cache version is bumped.
#   2. `maintenance.sh off` → index.html is restored byte-for-byte to the
#                             original, and the backup is removed.
# Exits non-zero on any failure.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/scripts"
cp "$ROOT/index.html"        "$TMP/index.html"
cp "$ROOT/maintenance.html"  "$TMP/maintenance.html"
cp "$ROOT/sw.js"             "$TMP/sw.js"
cp "$ROOT/scripts/maintenance.sh" "$TMP/scripts/maintenance.sh"
chmod +x "$TMP/scripts/maintenance.sh"

orig_sum=$(shasum "$TMP/index.html" | awk '{print $1}')
orig_sw=$(grep -oE "ward54-v[0-9]+" "$TMP/sw.js" | head -1)
fail=0
ok(){ echo "  ✅ $1"; }
bad(){ echo "  ❌ $1"; fail=1; }

echo "▶ test: maintenance ON"
( cd "$TMP" && scripts/maintenance.sh on >/dev/null )
grep -q "WARD-54-68-MAINTENANCE-MODE" "$TMP/index.html" && ok "index.html is the maintenance page" || bad "index.html did NOT switch to maintenance"
grep -q "hpCommMembers" "$TMP/index.html" && bad "full-app markup still present in index.html" || ok "full app no longer served at index.html"
[ -f "$TMP/index.full.html" ] && ok "real site backed up to index.full.html" || bad "backup index.full.html missing"
[ "$(shasum "$TMP/index.full.html" | awk '{print $1}')" = "$orig_sum" ] && ok "backup matches original site byte-for-byte" || bad "backup differs from original"
new_sw=$(grep -oE "ward54-v[0-9]+" "$TMP/sw.js" | head -1)
[ "$new_sw" != "$orig_sw" ] && ok "service-worker cache bumped ($orig_sw → $new_sw)" || bad "SW cache version not bumped"

echo "▶ test: maintenance OFF (restore)"
( cd "$TMP" && scripts/maintenance.sh off >/dev/null )
[ "$(shasum "$TMP/index.html" | awk '{print $1}')" = "$orig_sum" ] && ok "index.html restored byte-for-byte to original" || bad "restored index.html differs from original"
[ ! -f "$TMP/index.full.html" ] && ok "backup cleaned up after restore" || bad "stale backup left behind"

echo ""
if [ "$fail" -eq 0 ]; then echo "🟢 ALL TESTS PASSED"; else echo "🔴 TESTS FAILED"; fi
exit $fail
