#!/usr/bin/env bash
set -u

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
  output="$OUT/$name.out"
  log="$OUT/$name.log"
  rm -f "$output"
  set +e
  "$BIN" -r "$input" "$output" >"$log" 2>&1
  rc=$?
  set -e
  echo "===== $name (exit=$rc) ====="
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
probe candidate-05 "$ROOT/resources/liber-primus/05.jpg"
probe candidate-05-main-only "$OUT/05-main-only.jpg"
probe candidate-05-reversed-tail "$OUT/05-tail-reversed.jpg"

if [ -s "$OUT/candidate-05.out" ] && [ -s "$OUT/candidate-05-main-only.out" ]; then
  if cmp -s "$OUT/candidate-05.out" "$OUT/candidate-05-main-only.out"; then
    echo "original-vs-main-only extracted payloads: identical"
  else
    echo "original-vs-main-only extracted payloads: DIFFERENT"
  fi
fi
