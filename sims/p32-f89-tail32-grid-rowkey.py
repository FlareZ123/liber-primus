#!/usr/bin/env python3
"""Bounded test: p32 F_11=89 tail as a row key for the LP2 32x8 byte grid.

Run from any directory:
    python sims/p32-f89-tail32-grid-rowkey.py

Uses only the canonical repository JSON inputs and Python's standard library.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources/liber-primus/lp2-corpus.json"
GRID_PATH = ROOT / "resources/liber-primus/lp2-grid-256.json"


def entropy(data: list[int]) -> float:
    counts = [0] * 256
    for value in data:
        counts[value] += 1
    return -sum((n / len(data)) * math.log2(n / len(data))
                for n in counts if n)


def summary(data: list[int]) -> dict:
    ascii_view = "".join(chr(x) if 32 <= x <= 126 else "." for x in data)
    return {
        "first_32_hex": " ".join(f"{x:02x}" for x in data[:32]),
        "printable_ascii_count": sum(32 <= x <= 126 for x in data),
        "shannon_entropy_bits_per_byte": round(entropy(data), 4),
        "ascii_prefix_128": ascii_view[:128],
        "magic": {
            "png": data[:8] == [137, 80, 78, 71, 13, 10, 26, 10],
            "jpeg": data[:3] == [255, 216, 255],
            "zip": data[:4] == [80, 75, 3, 4],
            "gzip": data[:2] == [31, 139],
            "pdf": ascii_view.startswith("%PDF-"),
            "elf": data[:4] == [127, 69, 76, 70],
        },
    }


def xor_row_key(grid: list[int], key: list[int]) -> list[int]:
    return [
        byte ^ key[row]
        for row in range(32)
        for byte in grid[row * 8:(row + 1) * 8]
    ]


def rotate_rows(grid: list[int], key: list[int], direction: str) -> list[int]:
    out: list[int] = []
    for row_index in range(32):
        row = grid[row_index * 8:(row_index + 1) * 8]
        shift = key[row_index] % 8
        if direction == "left":
            rotated = row[shift:] + row[:shift]
        elif direction == "right":
            rotated = row[-shift:] + row[:-shift] if shift else row[:]
        else:
            raise ValueError(direction)
        out.extend(rotated)
    return out


def main() -> None:
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    grid_data = json.loads(GRID_PATH.read_text(encoding="utf-8"))

    page32 = next(page for page in corpus["pages"] if page["page"] == 32)
    page_indices = page32["indices"]
    tail = page_indices[89:]  # zero-based offset 89, selected by F_11
    assert len(page_indices) == 121
    assert len(tail) == 32
    assert len(grid_data["bytes"]) == 256
    assert grid_data["shape"].startswith("32 rows by 8 columns")

    prime_key = [corpus["prime"][index] for index in tail]
    keys = {"gp_index": tail, "gp_prime_weight": prime_key}
    grid = grid_data["bytes"]

    variants: dict[str, dict] = {}
    for name, key in keys.items():
        variants[f"{name}_row_xor"] = summary(xor_row_key(grid, key))
        for direction in ("left", "right"):
            variants[f"{name}_row_rotation_{direction}"] = summary(
                rotate_rows(grid, key, direction)
            )

    result = {
        "inputs": {
            "p32_rune_count": len(page_indices),
            "offset_zero_based": 89,
            "tail_length": len(tail),
            "tail_gp_indices": tail,
            "tail_gp_index_sum": sum(tail),
            "tail_gp_prime_weights": prime_key,
            "tail_gp_prime_sum": sum(prime_key),
            "grid_shape": grid_data["shape"],
            "grid_byte_count": len(grid),
            "grid_source_notes": grid_data["source_notes"],
        },
        "variants": variants,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
