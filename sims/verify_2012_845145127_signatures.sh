#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GNUPGHOME="$(mktemp -d)"
export GNUPGHOME
trap 'rm -rf "$GNUPGHOME"' EXIT
chmod 700 "$GNUPGHOME"
gpg --batch --import "$ROOT/resources/historical/cicada-3301-2012-public-key.asc"
for payload in "$ROOT"/im-results/2012-845145127/*.asc; do
  printf '\n== %s ==\n' "${payload#"$ROOT"/}"
  gpg --batch --verify "$payload"
done
