#!/usr/bin/env bash
# Release a plugin: bump its version in plugin.json and marketplace.json,
# commit, tag <plugin>--v<version>, and push. CI then validates and creates
# the GitHub Release.
#
#   scripts/release.sh how-it-works-site 1.1.0
set -euo pipefail

PLUGIN="${1:?usage: release.sh <plugin> <version>}"
VERSION="${2:?usage: release.sh <plugin> <version>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "version must be X.Y.Z" >&2; exit 1; }
[ -f "$PLUGIN/.claude-plugin/plugin.json" ] || { echo "no plugin at ./$PLUGIN" >&2; exit 1; }
[ "$(git branch --show-current)" = "main" ] || { echo "release from main" >&2; exit 1; }
git diff --quiet && git diff --cached --quiet || { echo "working tree not clean" >&2; exit 1; }
git pull --ff-only --quiet

python3 - "$PLUGIN" "$VERSION" <<'EOF'
import json, sys
from pathlib import Path
plugin, version = sys.argv[1], sys.argv[2]
for path, update in [
    (Path(plugin, ".claude-plugin/plugin.json"), lambda d: d.__setitem__("version", version)),
    (Path(".claude-plugin/marketplace.json"),
     lambda d: [p.__setitem__("version", version) for p in d["plugins"] if p["name"] == plugin]),
]:
    data = json.loads(path.read_text())
    update(data)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
EOF

python3 scripts/check-versions.py "$PLUGIN" "$VERSION"
claude plugin validate . >/dev/null
claude plugin validate "$PLUGIN" >/dev/null

git add "$PLUGIN/.claude-plugin/plugin.json" .claude-plugin/marketplace.json
git commit --quiet -m "release: $PLUGIN v$VERSION"
git push --quiet origin main
claude plugin tag "$PLUGIN" --message "$PLUGIN v%s" --push
echo "Tagged $PLUGIN--v$VERSION. CI will publish the GitHub Release."
