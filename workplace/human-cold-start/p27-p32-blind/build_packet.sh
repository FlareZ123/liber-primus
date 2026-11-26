#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HERE="$ROOT/workplace/human-cold-start/p27-p32-blind"
OUT="${1:-$ROOT/p27-p32-blind-human-packet.zip}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/images"
for spec in "44 01" "45 02" "46 03" "47 04" "48 05" "49 06"; do
  read -r source neutral <<<"$spec"
  cp "$ROOT/resources/liber-primus/$source.jpg" "$TMP/images/$neutral.jpg"
done
cp "$HERE/instructions.md" "$HERE/historical-context.md" "$TMP/"
(
  cd "$TMP"
  sha256sum images/*.jpg > image-sha256.txt
  zip -qr "$OUT" instructions.md historical-context.md image-sha256.txt images
)
echo "Wrote $OUT"
