#!/usr/bin/env python3
"""Test the natural 4 x 64-byte relationship between the p49-51 base60 panel and p56 hash."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESOURCE = ROOT / "resources" / "liber-primus"
GRID_PATH = RESOURCE / "base60-grid.json"
TARGET_HEX = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)


def whirlpool(data: bytes) -> str:
    """Return OpenSSL Whirlpool; requires the OpenSSL legacy provider."""
    result = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    match = re.search(rb"([0-9a-f]{128})\s*$", result.stdout)
    if not match:
        raise RuntimeError(f"Could not parse OpenSSL Whirlpool output: {result.stdout!r}")
    return match.group(1).decode("ascii")


def decode_grid() -> bytes:
    grid = json.loads(GRID_PATH.read_text(encoding="utf-8"))
    alphabet = grid["alphabet"]
    assert len(alphabet) == 60 and len(set(alphabet)) == 60
    rows = grid["rows"]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    tokens = [token for row in rows for token in row]
    assert len(tokens) == 256 and all(len(token) == 2 for token in tokens)
    values = [alphabet.index(token[0]) * 60 + alphabet.index(token[1]) for token in tokens]
    assert all(0 <= value <= 255 for value in values)
    raw = bytes(values)
    recorded = bytes(value for row in grid["byte_rows"] for value in row)
    assert len(recorded) == 256 and recorded == raw, "base60 tokens disagree with byte_rows"
    return raw


def main() -> None:
    target = bytes.fromhex(TARGET_HEX)
    assert len(target) == 64
    raw = decode_grid()
    blocks = [raw[offset : offset + 64] for offset in range(0, 256, 64)]
    assert len(blocks) == 4 and all(len(block) == 64 for block in blocks)

    stream_checks = {}
    for name, data in {
        "raw_256": raw,
        "reversed_256": raw[::-1],
        "hex_ascii": raw.hex().encode("ascii"),
    }.items():
        sha = hashlib.sha512(data).hexdigest()
        whirl = whirlpool(data)
        stream_checks[name] = {
            "length": len(data),
            "sha512": sha,
            "whirlpool": whirl,
            "sha512_equals_p56_target": sha == TARGET_HEX,
            "whirlpool_equals_p56_target": whirl == TARGET_HEX,
        }

    block_checks = []
    for index, block in enumerate(blocks, start=1):
        sha = hashlib.sha512(block).hexdigest()
        whirl = whirlpool(block)
        block_checks.append(
            {
                "block": index,
                "direct_equals_p56_target": block == target,
                "sha512_of_block_equals_p56_target": sha == TARGET_HEX,
                "whirlpool_of_block_equals_p56_target": whirl == TARGET_HEX,
                "block_sha512": sha,
                "block_whirlpool": whirl,
            }
        )

    images = sorted(RESOURCE.glob("*.jpg"))
    assert len(images) == 75, f"Expected 75 original JPEGs, found {len(images)}"
    block_hexes = {block.hex(): index + 1 for index, block in enumerate(blocks)}
    image_matches = []
    target_matches = []
    for image_path in images:
        data = image_path.read_bytes()
        sha = hashlib.sha512(data).hexdigest()
        whirl = whirlpool(data)
        if sha == TARGET_HEX:
            target_matches.append({"image": image_path.name, "algorithm": "SHA-512"})
        if whirl == TARGET_HEX:
            target_matches.append({"image": image_path.name, "algorithm": "Whirlpool"})
        if sha in block_hexes:
            image_matches.append(
                {"image": image_path.name, "algorithm": "SHA-512", "block": block_hexes[sha]}
            )
        if whirl in block_hexes:
            image_matches.append(
                {"image": image_path.name, "algorithm": "Whirlpool", "block": block_hexes[whirl]}
            )

    output = {
        "target_sha512_hex": TARGET_HEX,
        "p50_length_bytes": len(raw),
        "p50_sha256": hashlib.sha256(raw).hexdigest(),
        "p50_sha512": hashlib.sha512(raw).hexdigest(),
        "p50_whirlpool": whirlpool(raw),
        "stream_checks": stream_checks,
        "block_checks": block_checks,
        "original_jpegs_tested": len(images),
        "jpeg_hashes_matching_p56_target": target_matches,
        "jpeg_hashes_matching_any_p50_64_byte_block": image_matches,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
