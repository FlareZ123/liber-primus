#!/usr/bin/env python3
"""Exact direct SHA-512 relation test for the LP2 pp49-51 256-byte base60 table.

Run from any directory:
    python3 sims/pp49_51_base60_anend_hash_sft.py

This tests only the source-fixed direct-preimage interpretation: the 256-byte
row-major table, its four aligned 64-byte blocks, and the eight natural
row/column traversal directions of the printed 32x8 table.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRID_PATH = ROOT / "resources" / "liber-primus" / "base60-grid.json"
TARGET_HEX = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
SHA512_ABC = (
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
    "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
)


def sha512(data: bytes) -> bytes:
    return hashlib.sha512(data).digest()


def orientations(rows: list[list[int]]) -> dict[str, bytes]:
    """Eight row/column-major traversals with both axis directions."""
    return {
        "row-major-top-left": bytes(x for row in rows for x in row),
        "row-major-top-right": bytes(x for row in rows for x in reversed(row)),
        "row-major-bottom-left": bytes(x for row in reversed(rows) for x in row),
        "row-major-bottom-right": bytes(
            x for row in reversed(rows) for x in reversed(row)
        ),
        "column-major-top-left": bytes(rows[r][c] for c in range(8) for r in range(32)),
        "column-major-top-right": bytes(rows[r][c] for c in range(7, -1, -1) for r in range(32)),
        "column-major-bottom-left": bytes(rows[r][c] for c in range(8) for r in range(31, -1, -1)),
        "column-major-bottom-right": bytes(rows[r][c] for c in range(7, -1, -1) for r in range(31, -1, -1)),
    }


def main() -> None:
    assert sha512(b"abc").hex() == SHA512_ABC, "SHA-512 known-vector control failed"
    grid = json.loads(GRID_PATH.read_text(encoding="utf-8"))
    rows = grid["byte_rows"]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows), "expected 32x8 grid"
    assert all(type(v) is int and 0 <= v <= 255 for row in rows for v in row)
    target = bytes.fromhex(TARGET_HEX)
    assert len(target) == 64

    results = []
    for name, data in orientations(rows).items():
        assert len(data) == 256
        blocks = [data[i:i + 64] for i in range(0, 256, 64)]
        results.append({
            "orientation": name,
            "sha512": sha512(data).hex(),
            "whole_payload_matches_p56": sha512(data) == target,
            "64_byte_blocks_equal_p56": [i for i, block in enumerate(blocks) if block == target],
            "64_byte_block_sha512_matches_p56": [
                i for i, block in enumerate(blocks) if sha512(block) == target
            ],
        })

    any_hit = any(
        row["whole_payload_matches_p56"]
        or row["64_byte_blocks_equal_p56"]
        or row["64_byte_block_sha512_matches_p56"]
        for row in results
    )
    print(json.dumps({
        "input": str(GRID_PATH.relative_to(ROOT)),
        "shape": "32x8",
        "payload_bytes": 256,
        "target": "LP2 p56 printed SHA-512 AN-END digest",
        "target_sha512": TARGET_HEX,
        "sha512_abc_control": "PASS",
        "orientations_tested": len(results),
        "whole_payload_hits": sum(r["whole_payload_matches_p56"] for r in results),
        "aligned_64_byte_blocks_tested": 32,
        "direct_block_hits": sum(len(r["64_byte_blocks_equal_p56"]) for r in results),
        "block_sha512_hits": sum(len(r["64_byte_block_sha512_matches_p56"]) for r in results),
        "any_hit": any_hit,
        "results": results,
    }, indent=2))
    if any_hit:
        raise SystemExit("A source-fixed direct hash relation matched; investigate before treating as a solve.")


if __name__ == "__main__":
    main()
