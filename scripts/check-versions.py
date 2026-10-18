#!/usr/bin/env python3
"""Check that every plugin's plugin.json version matches its marketplace entry.

Usage:
  check-versions.py                     check all plugins
  check-versions.py PLUGIN VERSION      also require PLUGIN to be at VERSION (tag check)
"""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
market = json.loads((root / ".claude-plugin/marketplace.json").read_text())

errors = []
versions = {}
for entry in market["plugins"]:
    name = entry["name"]
    manifest = json.loads((root / entry["source"] / ".claude-plugin/plugin.json").read_text())
    versions[name] = manifest.get("version")
    if manifest.get("name") != name:
        errors.append(f"{name}: plugin.json name is {manifest.get('name')!r}")
    if entry.get("version") != manifest.get("version"):
        errors.append(f"{name}: marketplace.json has {entry.get('version')!r}, plugin.json has {manifest.get('version')!r}")

if len(sys.argv) == 3:
    plugin, want = sys.argv[1], sys.argv[2]
    if plugin not in versions:
        errors.append(f"tag names unknown plugin {plugin!r} (known: {', '.join(versions)})")
    elif versions[plugin] != want:
        errors.append(f"{plugin}: tag says {want}, manifests say {versions[plugin]}")

for e in errors:
    print(f"::error::{e}")
if errors:
    sys.exit(1)
print("versions ok: " + ", ".join(f"{n} {v}" for n, v in versions.items()))
