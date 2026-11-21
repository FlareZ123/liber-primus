#!/usr/bin/env bash
set -euo pipefail

ISO_PATH="${1:?usage: cicadaos-rootfs-audit.sh ISO_PATH OUTPUT_DIR}"
OUT="${2:?usage: cicadaos-rootfs-audit.sh ISO_PATH OUTPUT_DIR}"
EXPECTED_MD5="74062dee4093c6ca0340cda23f0e994b" # informational cross-check
EXPECTED_SHA1="df433cba87644b35cbc47f702a02e2b58d90af6a" # informational cross-check
EXPECTED_SHA256="784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"
EXPECTED_SIZE="136398848"
EXPECTED_INITRAMFS_GIT_BLOB="d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a"
EXPECTED_PRIME_ECHO_GIT_BLOB="65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649"

mkdir -p "$OUT"
ISO_ROOT="$OUT/iso"
ROOTFS="$OUT/rootfs"
mkdir -p "$ISO_ROOT" "$ROOTFS"

actual_size="$(stat -c '%s' "$ISO_PATH")"
actual_md5="$(md5sum "$ISO_PATH" | awk '{print $1}')"
actual_sha1="$(sha1sum "$ISO_PATH" | awk '{print $1}')"
actual_sha256="$(sha256sum "$ISO_PATH" | awk '{print $1}')"
{
  printf 'path\t%s\n' "$ISO_PATH"
  printf 'size\t%s\nmd5\t%s\nsha1\t%s\nsha256\t%s\n' "$actual_size" "$actual_md5" "$actual_sha1" "$actual_sha256"
  printf 'expected_size\t%s\nexpected_sha256\t%s\nexpected_md5_reference\t%s\nexpected_sha1_reference\t%s\n' "$EXPECTED_SIZE" "$EXPECTED_SHA256" "$EXPECTED_MD5" "$EXPECTED_SHA1"
} > "$OUT/iso-verification.tsv"
cat "$OUT/iso-verification.tsv"
test "$actual_size" = "$EXPECTED_SIZE"
test "$actual_sha256" = "$EXPECTED_SHA256"

command -v xorriso >/dev/null || { echo "xorriso is not installed." >&2; exit 1; }
command -v binwalk >/dev/null || { echo "binwalk is not installed." >&2; exit 1; }
command -v cpio >/dev/null || { echo "cpio is not installed." >&2; exit 1; }
command -v fakeroot >/dev/null || { echo "fakeroot is not installed." >&2; exit 1; }

xorriso -osirrox on -indev "$ISO_PATH" -extract / "$ISO_ROOT" > "$OUT/iso-extraction.log" 2>&1
find "$ISO_ROOT" -type f -print0 | sort -z | while IFS= read -r -d '' file; do
  rel="${file#"$ISO_ROOT"/}"
  printf '%s\t%s\t%s\n' "$rel" "$(stat -c '%s' "$file")" "$(sha256sum "$file" | awk '{print $1}')"
done > "$OUT/iso-manifest.tsv"

IMG="$ISO_ROOT/boot/3301.img"
test -f "$IMG"
BOOT_GIT_BLOB="$(git hash-object "$IMG")"
printf '%s\n' "$BOOT_GIT_BLOB" > "$OUT/3301-img-git-blob-sha1.txt"
test "$BOOT_GIT_BLOB" = "$EXPECTED_INITRAMFS_GIT_BLOB"
file "$IMG" > "$OUT/3301-img-file.txt"
cp "$IMG" "$OUT/3301-decompressed.img.gz"
gzip -df "$OUT/3301-decompressed.img.gz"
DECOMPRESSED="$OUT/3301-decompressed.img"
file "$DECOMPRESSED" > "$OUT/3301-decompressed-file.txt"

mkdir -p "$OUT/binwalk"
binwalk -eM -C "$OUT/binwalk" "$DECOMPRESSED" > "$OUT/binwalk.log" 2>&1 || true

if file "$DECOMPRESSED" | grep -qi 'cpio'; then
  fakeroot sh -c 'cd "$1" && cpio -idm --no-absolute-filenames < "$2"' _ "$ROOTFS" "$DECOMPRESSED" > "$OUT/cpio-extraction.log" 2>&1
else
  CPIO_FILE="$(find "$OUT/binwalk" -type f \( -name '*.cpio' -o -name '*.cpio.gz' \) -print -quit || true)"
  if [ -n "$CPIO_FILE" ]; then
    if [[ "$CPIO_FILE" == *.gz ]]; then
      gzip -dc "$CPIO_FILE" | (cd "$ROOTFS" && cpio -idm --no-absolute-filenames) > "$OUT/cpio-extraction.log" 2>&1
    else
      (cd "$ROOTFS" && cpio -idm --no-absolute-filenames < "$CPIO_FILE") > "$OUT/cpio-extraction.log" 2>&1
    fi
  else
    CANDIDATE="$(find "$OUT/binwalk" -type f -path '*/usr/local/bin/prime_echo' -print -quit || true)"
    if [ -n "$CANDIDATE" ]; then
      ROOT_CANDIDATE="${CANDIDATE%/usr/local/bin/prime_echo}"
      cp -a "$ROOT_CANDIDATE/." "$ROOTFS/"
    fi
  fi
fi

PRIME_ECHO="$ROOTFS/usr/local/bin/prime_echo"
if [ ! -f "$PRIME_ECHO" ]; then
  PRIME_ECHO="$(find "$OUT/binwalk" -type f -path '*/usr/local/bin/prime_echo' -print -quit || true)"
fi
if [ -n "$PRIME_ECHO" ] && [ -f "$PRIME_ECHO" ]; then
  PRIME_ECHO_GIT_BLOB="$(python3 - "$PRIME_ECHO" <<'PY'
import hashlib, pathlib, sys
data = pathlib.Path(sys.argv[1]).read_bytes()
print(hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest())
PY
)"
  printf '%s\n' "$PRIME_ECHO_GIT_BLOB" > "$OUT/prime-echo-git-blob-sha1.txt"
  if [ "$PRIME_ECHO_GIT_BLOB" = "$EXPECTED_PRIME_ECHO_GIT_BLOB" ]; then
    echo "prime_echo matches the previously archived Git blob." > "$OUT/prime-echo-authentication.txt"
  else
    echo "prime_echo differs from the previously archived Git blob." > "$OUT/prime-echo-authentication.txt"
  fi
else
  echo "prime_echo not found in extracted rootfs." > "$OUT/prime-echo-authentication.txt"
fi

python3 - "$ROOTFS" "$OUT" <<'PY'
import hashlib, pathlib, sys
from collections import Counter
root, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
files = sorted(p for p in root.rglob("*") if p.is_file() and not p.is_symlink())
symlinks = sorted(p for p in root.rglob("*") if p.is_symlink())
with (out / "rootfs-symlinks.tsv").open("w") as f:
    f.write("path\ttarget\n")
    for p in symlinks: f.write(f"{p.relative_to(root).as_posix()}\t{p.readlink()}\n")
with (out / "rootfs-manifest.tsv").open("w") as f:
    f.write("path\tsize\tsha256\n")
    for p in files:
        data = p.read_bytes()
        f.write(f"{p.relative_to(root).as_posix()}\t{len(data)}\t{hashlib.sha256(data).hexdigest()}\n")
with (out / "rootfs-file-types.tsv").open("w") as f:
    for p in files:
        import subprocess
        kind = subprocess.run(["file","-b",str(p)],capture_output=True,text=True,check=False).stdout.strip()
        f.write(f"{p.relative_to(root).as_posix()}\t{kind}\n")
PY

PATTERN='3301|BASE29|BASE.?29|Gematria|Diffie|(^|[^A-Za-z])DH([^A-Za-z]|$)|NEXT|prime|rune|magic.?square|Liber Primus|onion|cipher|outguess|560[.]13|560[.]17|folly|wisdom'
grep -RIlE --binary-files=without-match "$PATTERN" "$ROOTFS" 2>/dev/null | sort -u > "$OUT/relevant-text-paths.txt" || true
mkdir -p "$OUT/relevant-files"
while IFS= read -r path; do
  [ -n "$path" ] || continue
  rel="${path#"$ROOTFS"/}"
  mkdir -p "$OUT/relevant-files/$(dirname "$rel")"
  cp -a "$path" "$OUT/relevant-files/$rel"
done < "$OUT/relevant-text-paths.txt"
for rel in tmp/folly tmp/wisdom usr/local/bin/cicada usr/local/bin/prime_echo usr/local/bin/message.txt usr/local/bin/message.txt.asc; do
  if [ -f "$ROOTFS/$rel" ]; then
    mkdir -p "$OUT/relevant-files/$(dirname "$rel")"
    cp -a "$ROOTFS/$rel" "$OUT/relevant-files/$rel"
  fi
done
grep -RInE --binary-files=without-match "$PATTERN" "$OUT/relevant-files" 2>/dev/null > "$OUT/relevant-text-matches.txt" || true

python3 - "$OUT" <<'PY'
import pathlib, sys
from collections import Counter
out = pathlib.Path(sys.argv[1])
manifest = (out / "rootfs-manifest.tsv").read_text().splitlines()
types = (out / "rootfs-file-types.tsv").read_text().splitlines()
relevant = (out / "relevant-text-paths.txt").read_text().splitlines()
counter = Counter(line.split("\t",1)[1] for line in types if "\t" in line)
lines = [
  "# CicadaOS rootfs audit",
  "",
  f"Extracted regular files: {max(0,len(manifest)-1)}",
  f"Extracted symlinks: {len(symlinks)}",
  f"Relevant text/script/config matches: {len(relevant)}",
  "Rootfs manifest: rootfs-manifest.tsv",
  "Rootfs symlinks: rootfs-symlinks.tsv",
  "File types: rootfs-file-types.tsv",
  "ISO verification: iso-verification.tsv",
  "ISO top-level manifest: iso-manifest.tsv",
  "Relevant source copies: relevant-files/",
  "Relevant text matches: relevant-text-matches.txt",
  "",
  "## Relevant paths",
  "",
]
lines.extend("- " + p for p in relevant)
lines.extend(["", "## File-type summary", ""])
lines.extend(f"- {count}: {kind}" for kind,count in counter.most_common(40))
(out / "summary.md").write_text("\n".join(lines) + "\n")
PY

test -s "$OUT/rootfs-manifest.tsv"
test -s "$OUT/rootfs-file-types.tsv"
