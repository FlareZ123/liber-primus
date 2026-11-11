#!/usr/bin/env bash
# Legacy filename retained: 00.jpg and 05.jpg are LP1 physical pages, not LP2.
# This probe adds only source-derived keys from the visible LP1 page-05 text/table.
set -euo pipefail

BIN="$1"
ROOT="$2"
OUT="$3"
mkdir -p "$OUT"

python3 - "$ROOT/resources/liber-primus/05.jpg" "$OUT" <<'PY'
from pathlib import Path
import sys, hashlib
src=Path(sys.argv[1])
out=Path(sys.argv[2])
data=src.read_bytes()
eoi=data.rfind(b"\xff\xd9")
if eoi < 0:
    raise SystemExit("05.jpg has no JPEG EOI marker")
tail=data[eoi+2:]
rev=tail[::-1]
main=data[:eoi+2]
(out/"05-main-only.jpg").write_bytes(main)
(out/"05-tail-reversed.jpg").write_bytes(rev)
print(f"05.jpg bytes={len(data)} EOI={eoi} tail_bytes={len(tail)}")
print(f"tail_sha256={hashlib.sha256(tail).hexdigest()}")
print(f"reverse_tail_equals_original_prefix={rev == data[:len(rev)]}")
print(f"main_only_sha256={hashlib.sha256(main).hexdigest()}")
PY

probe() {
  name="$1"
  input="$2"
  shift 2
  output="$OUT/$name.out"
  log="$OUT/$name.log"
  rm -f "$output"
  set +e
  "$BIN" "$@" -r "$input" "$output" >"$log" 2>&1
  rc=$?
  set -e
  echo "===== OutGuess 0.4 default-key $name (exit=$rc) ====="
  cat "$log"
  if [ -s "$output" ]; then
    file "$output" || true
    sha256sum "$output" || true
    echo "-- first 128 bytes --"
    xxd -l 128 "$output" || true
    echo "-- printable strings --"
    strings -a -n 5 "$output" | head -60 || true
    if command -v bzip2 >/dev/null 2>&1 && bzip2 -t "$output" >/dev/null 2>&1; then
      echo "-- bzip2 payload preview --"
      bzip2 -dc "$output" | head -c 2048 || true
      echo
    fi
  else
    echo "no nonempty payload file"
  fi
}

probe known-00 "$ROOT/resources/liber-primus/00.jpg"
probe known-00-ec "$ROOT/resources/liber-primus/00.jpg" -e
probe candidate-05 "$ROOT/resources/liber-primus/05.jpg"
probe candidate-05-ec "$ROOT/resources/liber-primus/05.jpg" -e
probe candidate-05-main-only "$OUT/05-main-only.jpg"
probe candidate-05-reversed-tail "$OUT/05-tail-reversed.jpg"

if [ -s "$OUT/candidate-05.out" ] && [ -s "$OUT/candidate-05-main-only.out" ]; then
  if cmp -s "$OUT/candidate-05.out" "$OUT/candidate-05-main-only.out"; then
    echo "original-vs-main-only extracted payloads: identical"
  else
    echo "original-vs-main-only extracted payloads: DIFFERENT"
  fi
fi

# Bounded key list from the visible LP1 page-05 wording and 5x5 table.
# No case variants, reversals, permutations, or generic password search.
keys=(
  "SHADOWS"
  "AETHEREAL"
  "BUFFERS"
  "VOID"
  "CARNAL"
  "OBSCURA"
  "FORM"
  "MOBIUS"
  "ANALOG"
  "MOURNFUL"
  "CABAL"
  "SOME WISDOM"
  "KNOW THIS"
  "THE PRIMES ARE SACRED"
  "THE TOTIENT FUNCTION IS SACRED"
  "ALL THINGS SHOULD BE ENCRYPTED"
  "LIBER PRIMUS"
  "1033"
  "91"
  "130"
  "SHADOWS AETHEREAL BUFFERS VOID CARNAL OBSCURA FORM MOBIUS ANALOG VOID MOURNFUL AETHEREAL CABAL"
  "272 138 341 131 151 366 199 130 320 18 226 245 91 245 226 18 320 130 199 366 151 131 341 138 272"
)

: > "$OUT/keyed-results.tsv"
: > "$OUT/keyed-key-map.tsv"
printf 'index\tkey\texit\tbytes\tgpg_packet\n' >> "$OUT/keyed-results.tsv"
index=0
for key in "\${keys[@]}"; do
  index=$((index+1))
  printf -v label 'matrix-key-%02d' "$index"
  output="$OUT/$label.out"
  log="$OUT/$label.log"
  rm -f "$output"
  set +e
  "$BIN" -k "$key" -r "$OUT/05-main-only.jpg" "$output" >"$log" 2>&1
  rc=$?
  set -e
  bytes=0
  if [ -f "$output" ]; then bytes=$(wc -c < "$output"); fi
  gpg_packet=no
  if [ -s "$output" ] && command -v gpg >/dev/null 2>&1 && gpg --batch --no-tty --list-packets "$output" >/dev/null 2>&1; then
    gpg_packet=yes
  fi
  printf '%02d\t%s\n' "$index" "$key" >> "$OUT/keyed-key-map.tsv"
  printf '%02d\t%s\t%s\t%s\t%s\n' "$index" "$key" "$rc" "$bytes" "$gpg_packet" >> "$OUT/keyed-results.tsv"
  echo "keyed candidate $index: bytes=$bytes exit=$rc gpg_packet=$gpg_packet"
  if [ "$gpg_packet" = yes ]; then
    file "$output" || true
    sha256sum "$output" || true
    echo "Potential PGP payload from source key $index: $key"
  fi
done

# Control that -k is active: a non-default key should not reproduce the
# page-00 default-key PGP carrier.
probe control-page00-key-MOBIUS "$ROOT/resources/liber-primus/00.jpg" -k "MOBIUS"
if [ -s "$OUT/known-00.out" ] && [ -s "$OUT/control-page00-key-MOBIUS.out" ]; then
  if cmp -s "$OUT/known-00.out" "$OUT/control-page00-key-MOBIUS.out"; then
    echo "keyed page-00 control matches default output"
  else
    echo "keyed page-00 control differs from default output"
  fi
fi

