#!/usr/bin/env python3
"""Exact p49–p51 candidate preimages for the 128-hex p56 digest.

Uses only the image-audited 256 tokens, the two explicitly discussed radix
interpretations, and original p49–p51 JPEG bytes. No serialization sweep.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
LP2 = ROOT / "resources" / "liber-primus"
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a842"
    "5893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
ALPHABET60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
ALPHABET59 = ALPHABET60.replace("f", "")


def decode(tokens, alphabet):
    out = bytearray()
    for token in tokens:
        if len(token) != 2:
            raise ValueError(f"not a two-character cell: {token!r}")
        value = alphabet.index(token[0]) * len(alphabet) + alphabet.index(token[1])
        if not 0 <= value <= 255:
            raise ValueError(f"cell {token!r} is outside byte range: {value}")
        out.append(value)
    return bytes(out)


def whirlpool(data):
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
        capture_output=True,
        check=False,
    )
    if proc.returncode:
        return "UNAVAILABLE"
    match = re.search(rb"= ([0-9a-f]{128})\s*$", proc.stdout.strip())
    return match.group(1).decode("ascii") if match else "UNAVAILABLE"


grid = json.loads((LP2 / "lp2-grid-256.json").read_text(encoding="utf-8"))
tokens = [token for page in grid["pages"] for token in page["tokens"]]
if len(tokens) != 256:
    raise SystemExit(f"expected 256 tokens, got {len(tokens)}")

checksum_rows = {}
for line in (LP2 / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
    fields = line.split()
    if len(fields) >= 2:
        checksum_rows[fields[-1]] = fields[0]

image_paths = [LP2 / f"{n}.jpg" for n in (66, 67, 68)]
images = [path.read_bytes() for path in image_paths]
for path, data in zip(image_paths, images):
    expected = checksum_rows.get(path.name)
    actual = hashlib.sha256(data).hexdigest()
    if expected != actual:
        raise SystemExit(f"source checksum mismatch for {path.name}: {actual} != {expected}")

base60 = decode(tokens, ALPHABET60)
base59 = decode(tokens, ALPHABET59)
literal = "".join(tokens).encode("ascii")
per_token_reverse = "".join(token[::-1] for token in tokens).encode("ascii")

candidates = [
    ("p50 table, base60 bytes", base60),
    ("p50 table, base59 bytes", base59),
    ("literal 512-token string", literal),
    ("original p49 JPEG (66.jpg)", images[0]),
    ("original p50 JPEG (67.jpg)", images[1]),
    ("original p51 JPEG (68.jpg)", images[2]),
    ("p49-p51 concatenated JPEGs", b"".join(images)),
]
for label, data in (
    ("p50 base60", base60),
    ("p50 base59", base59),
    ("p50 literal", literal),
):
    candidates.extend([
        (f"{label}, whole-byte reverse", data[::-1]),
        (f"{label}, nibble swap", nibble_swap(data)),
        (f"{label}, whole-byte reverse + nibble swap", nibble_swap(data[::-1])),
    ])
candidates.append(("p50 literal, per-token character reverse", per_token_reverse))

wp_control = whirlpool(b"abc")
if wp_control not in ("UNAVAILABLE", WHIRLPOOL_ABC):
    raise SystemExit(f"Whirlpool abc KAT mismatch: {wp_control}")

print(f"target_sha512_or_whirlpool={TARGET}")
print(f"whirlpool_abc_control={wp_control}")
print("candidate\tbytes\tsha512\twhirlpool\tblake2b_512\tmatch")
match_count = 0
for name, data in candidates:
    sha512 = hashlib.sha512(data).hexdigest()
    wp = whirlpool(data)
    b2 = hashlib.blake2b(data, digest_size=64).hexdigest()
    match = sha512 == TARGET or wp == TARGET or b2 == TARGET
    match_count += int(match)
    print(f"{name}\t{len(data)}\t{sha512}\t{wp}\t{b2}\t{match}")
if match_count:
    raise SystemExit(f"unexpected p56 digest match count: {match_count}")
print(f"tested_candidates={len(candidates)} match_count={match_count}")
