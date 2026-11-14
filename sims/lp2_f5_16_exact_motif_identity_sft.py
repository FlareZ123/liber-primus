#!/usr/bin/env python3
"""Original LP2 p24-p26 DCT anomaly identity cross-check.

Inputs: unchanged LP2 JPEG originals; the existing native libjpeg reader
sims/lp2_f5_glyph_dct_reader.c compiled once against libjpeg.
Reads only the original quantized Y coefficients, without recompression,
OCR, guessing an embedding password, or modifying source files.

Windows: python sims/lp2_f5_16_exact_motif_identity_sft.py --sources
  resources/liber-primus --reader path-to-compiled-reader.exe
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from pathlib import Path

from lp2_f5_glyph_atlas_gate import (
    REFERENCE_PAGES,
    ink_items,
    make_decrement_neighbors,
    read_coefficients,
    score,
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sources", required=True, type=Path)
    parser.add_argument("--reader", required=True)
    args = parser.parse_args()
    reference: Counter[bytes] = Counter()
    for page in REFERENCE_PAGES:
        original = args.sources / f"{page + 17:02d}.jpg"
        counts, _ = ink_items(read_coefficients(args.reader, original))
        reference.update(counts)
    assert len(reference) == 11067, len(reference)
    neighbors = make_decrement_neighbors(reference)
    groups: dict[bytes, list[tuple[int, int, int]]] = defaultdict(list)
    per_page: dict[int, int] = {}
    for page in (24, 25, 26):
        original = args.sources / f"{page + 17:02d}.jpg"
        counts, entries = ink_items(read_coefficients(args.reader, original))
        result = score(entries, reference, neighbors)
        per_page[page] = result["one_decrement_novel"]
        for position, block in entries:
            if block not in reference and block in neighbors:
                x = 400 + (position % 206) * 8
                y = 600 + (position // 206) * 8
                groups[block].append((page, x, y))
        assert counts
    assert per_page == {24: 5, 25: 8, 26: 3}, per_page
    assert sum(map(len, groups.values())) == 16
    assert sorted(map(len, groups.values()), reverse=True) == [
        9, 1, 1, 1, 1, 1, 1, 1
    ]
    dominant = max(groups.values(), key=len)
    assert sorted(dominant) == sorted((
        (24, 600, 2240), (24, 600, 2256), (24, 600, 2272),
        (25, 600, 1312), (25, 600, 1320), (25, 616, 2192),
        (26, 600, 2240), (26, 600, 2256), (26, 600, 2272),
    )), dominant
    print(f"REFERENCE 10 pages; {len(reference)} distinct exact DCT blocks")
    print(f"EVENTS {per_page}; 16 total, {len(groups)} distinct blocks")
    print("MULTIPLICITIES 9,1,1,1,1,1,1,1")
    print("NINE REPEATED BLOCK SITES", dominant)
    print("RESULT: repeated exact coefficient templates undermine treating "
          "all 16 positions as independent payload symbols; no original "
          "payload or key identified")


if __name__ == "__main__":
    main()
