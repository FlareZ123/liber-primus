#!/usr/bin/env python3
"""Bounded source test for a second LP2 twig/cipher-rune marker.

Run from the repository root:
    python sims/lp2_second_twig_marker_gate.py

The p0 detector is imported unchanged from lp2_opening_stave_geometry_sft.py.
This script tests only the other visually plausible crossbar/tree/vine objects;
it does not search thresholds or orientations for English.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from lp2_opening_stave_geometry_sft import branch_side_peaks


def gray_crop(root: Path, filename: str, box: tuple[int, int, int, int]) -> np.ndarray:
    return np.asarray(Image.open(root / filename).convert("L").crop(box))


def main() -> None:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus")

    # The only other prominent crossbar object: archive scan 39 (physical p22).
    p22 = gray_crop(root, "39.jpg", (627, 2235, 1739, 2632))
    expected = {
        1: {80: (6, 3), 85: (5, 3), 90: (4, 3)},  # 90 degrees CCW
        3: {80: (3, 6), 85: (3, 5), 90: (3, 4)},  # 90 degrees CW
    }
    print("p22 lateral-profile peak counts (left|right):")
    for rotation, by_threshold in expected.items():
        oriented = np.rot90(p22, k=rotation)
        for threshold, wanted in by_threshold.items():
            left = branch_side_peaks(oriented, "left", min_peak=threshold)
            right = branch_side_peaks(oriented, "right", min_peak=threshold)
            observed = (len(left), len(right))
            print(f"  rotation={rotation * 90} threshold={threshold}: {observed[0]}|{observed[1]}")
            assert observed == wanted, (rotation, threshold, observed, wanted)

    # The p8–14 tree figures repeat as two fixed margin templates.
    left_tree = [gray_crop(root, f"{n:02d}.jpg", (0, 500, 520, 3300))
                 for n in (25, 27, 29, 31)]
    right_tree = [gray_crop(root, f"{n:02d}.jpg", (1880, 500, 2400, 3300))
                  for n in (26, 28, 30)]
    assert all(np.array_equal(left_tree[0], x) for x in left_tree[1:])
    assert all(np.array_equal(right_tree[0], x) for x in right_tree[1:])
    print("p8/10/12/14 left-tree crops: pixel-identical")
    print("p9/11/13 right-tree crops: pixel-identical")

    # The p49 and p55 vine borders are also exact repeated source crops.
    for side, box in (
        ("left", (0, 700, 520, 3000)),
        ("right", (1880, 700, 2400, 3000)),
    ):
        p49 = gray_crop(root, "66.jpg", box)
        p55 = gray_crop(root, "72.jpg", box)
        assert np.array_equal(p49, p55), side
        print(f"p49/p55 {side} vine crop: pixel-identical")

    # Test the natural page-end association for the p22 illustration.
    corpus = json.loads((root / "lp2-corpus.json").read_text(encoding="utf-8"))
    annotations = json.loads((root / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    translit = corpus["translit"]
    pages = {page["page"]: page for page in corpus["pages"]}
    ink = {page["page"]: page for page in annotations["pages"]}
    p22_tokens = [translit[i] for i in pages[22]["indices"]]
    p23_red = ink[23]["red_spans"][0]
    p23_first_black = p23_red["start"] + p23_red["length"]
    next_symbol = translit[pages[23]["indices"][p23_first_black]]
    assert len(p22_tokens) == 131
    assert (p22_tokens[0], p22_tokens[-1]) == ("NG", "X")
    assert p22_tokens.count("TH") == 11
    assert p22_tokens.count("R") == 5
    assert p23_first_black == 16 and next_symbol == "EA"
    print("p22 text: 131 runes, starts NG, ends X, TH=11, R=5")
    print(f"p23 first black rune after 16-rune red span: {next_symbol}")

    print("PASS: no stable, source-anchored second twig/cipher-rune selector is established.")


if __name__ == "__main__":
    main()
