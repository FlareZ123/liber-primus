#!/usr/bin/env python3
"""Reproduce the nested 2014 OutGuess chain rooted at LP1 page 03.

Source path:
  resources/liber-primus/03.jpg
    -- OutGuess 0.4, empty key -->
  page03.out (historical community copy: rtkd/iddqd/lp_outguessed/03.txt)
    -- extract embedded JPEG hex -->
  2.jpg (15,188 bytes)
    -- OutGuess 0.4, empty key -->
  T2.bin (reported by independent research as seed=38370, len=7524)

This script deliberately does not interpret T2.bin as a key or plaintext.
It preserves the exact intermediate files and emits hashes/entropy for later
cryptanalytic tests.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
from collections import Counter
from pathlib import Path


EXPECTED_PAGE03_GIT_BLOB_SHA1 = "2a355d1bf14d37041384f09d8700e2ee274a13e6"
EXPECTED_T2_SEED = 38370
EXPECTED_T2_LENGTH = 7524


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    n = len(data)
    return -sum((count / n) * math.log2(count / n) for count in counts.values())


def run_outguess(executable: Path, source: Path, destination: Path) -> str:
    command = [str(executable), "-r", "-k", "", str(source), str(destination)]
    proc = subprocess.run(command, capture_output=True, text=True, errors="replace")
    log = (proc.stdout or "") + (proc.stderr or "")
    print("$ " + " ".join(command))
    print(log.rstrip())
    if proc.returncode != 0:
        raise RuntimeError(f"OutGuess failed ({proc.returncode}) for {source}")
    if not destination.is_file():
        raise RuntimeError(f"OutGuess reported success but did not create {destination}")
    return log


def extract_embedded_jpeg(source: Path, destination: Path) -> bytes:
    text = source.read_text(encoding="ascii", errors="replace")
    # The signed-message wrapper follows the embedded hex JPEG. Exclude the
    # detached PGP signature so its hexadecimal material cannot contaminate it.
    signature = text.find("-----BEGIN PGP SIGNATURE-----")
    body = text if signature < 0 else text[:signature]
    lower = body.lower()
    start = lower.find("ffd8")
    end = lower.rfind("ffd9")
    if start < 0 or end < start:
        raise RuntimeError("Could not locate a complete FFD8...FFD9 JPEG in page03 output")
    hex_text = re.sub(r"[^0-9a-f]", "", body[start:end + 4], flags=re.IGNORECASE)
    if len(hex_text) % 2:
        raise RuntimeError(f"Odd-length JPEG hex payload: {len(hex_text)}")
    image = bytes.fromhex(hex_text)
    if not image.startswith(b"\\xff\\xd8") or not image.endswith(b"\\xff\\xd9"):
        raise RuntimeError("Extracted bytes do not have JPEG SOI/EOI markers")
    destination.write_bytes(image)
    return image


def parse_seed_length(log: str) -> tuple[int | None, int | None]:
    match = re.search(r"seed\\s*:\\s*(\\d+)\\s*,\\s*len\\s*:\\s*(\\d+)", log, re.IGNORECASE)
    return (int(match.group(1)), int(match.group(2))) if match else (None, None)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--outguess", required=True, type=Path)
    parser.add_argument("--image", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()

    outguess = args.outguess.resolve()
    image = args.image.resolve()
    out_dir = args.out_dir.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    page03_out = out_dir / "page03.out"
    hidden_jpeg = out_dir / "2.jpg"
    t2_path = out_dir / "T2.bin"

    page03_log = run_outguess(outguess, image, page03_out)
    page03_bytes = page03_out.read_bytes()
    page03_seed, page03_reported_len = parse_seed_length(page03_log)
    page03_blob_sha1 = git_blob_sha1(page03_bytes)

    jpeg_bytes = extract_embedded_jpeg(page03_out, hidden_jpeg)
    t2_log = run_outguess(outguess, hidden_jpeg, t2_path)
    t2_bytes = t2_path.read_bytes()
    t2_seed, t2_reported_len = parse_seed_length(t2_log)

    manifest = {
        "source_image": str(image),
        "source_image_sha256": sha256(image.read_bytes()),
        "outguess_executable": str(outguess),
        "page03_output": {
            "path": page03_out.name,
            "length": len(page03_bytes),
            "sha256": sha256(page03_bytes),
            "git_blob_sha1": page03_blob_sha1,
            "historical_copy_git_blob_sha1": EXPECTED_PAGE03_GIT_BLOB_SHA1,
            "matches_historical_copy": page03_blob_sha1 == EXPECTED_PAGE03_GIT_BLOB_SHA1,
            "outguess_seed": page03_seed,
            "outguess_reported_length": page03_reported_len,
        },
        "embedded_jpeg": {
            "path": hidden_jpeg.name,
            "length": len(jpeg_bytes),
            "sha256": sha256(jpeg_bytes),
            "starts_jpeg": jpeg_bytes.startswith(b"\\xff\\xd8"),
            "ends_jpeg": jpeg_bytes.endswith(b"\\xff\\xd9"),
        },
        "T2": {
            "path": t2_path.name,
            "length": len(t2_bytes),
            "sha256": sha256(t2_bytes),
            "entropy_bits_per_byte": round(entropy(t2_bytes), 6),
            "first_32_bytes_hex": t2_bytes[:32].hex(),
            "last_32_bytes_hex": t2_bytes[-32:].hex(),
            "outguess_seed": t2_seed,
            "outguess_reported_length": t2_reported_len,
            "matches_independent_report": (
                t2_seed == EXPECTED_T2_SEED and
                t2_reported_len == EXPECTED_T2_LENGTH and
                len(t2_bytes) == EXPECTED_T2_LENGTH
            ),
        },
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
