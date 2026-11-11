#!/usr/bin/env python3
"""Original-image check of five-bit terminal ornaments on LP2 physical p55.

Run from repository root:
    python sims/p55_binary_ornaments.py

Requires Pillow and NumPy. Evidence is source-side and the five-bit reading
is a hypothesis, not a decipherment or an authenticated cipher instruction.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGE = ROOT / "resources" / "liber-primus" / "72.jpg"
SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"
# For each ornament, centers ordered TOP, MIDDLE-LEFT, MIDDLE-RIGHT,
# BOTTOM-LEFT, BOTTOM-RIGHT; coordinates in native 2400x3600 JPEG pixels.
CENTERS = {
    "left": [(395, 1477), (367, 1498), (424, 1499), (378, 1540), (421, 1533)],
    "right": [(2005, 1477), (1975, 1499), (2032, 1499), (1980, 1535), (2019, 1541)],
}


def main() -> None:
    assert hashlib.sha256(IMAGE.read_bytes()).hexdigest() == SHA256
    rgb = Image.open(IMAGE).convert("RGB")
    assert rgb.size == (2400, 3600)
    gray = np.array(rgb.convert("L"), dtype=np.uint8)
    sampled: dict[str, dict] = {}
    for side, centers in CENTERS.items():
        entries: list[dict] = []
        for x, y in centers:
            center = gray[y - 4 : y + 5, x - 4 : x + 5]
            avg = float(center.mean())
            yy, xx = np.mgrid[-15:16, -15:16]
            r2 = yy * yy + xx * xx
            annulus = gray[y - 15 : y + 16, x - 15 : x + 16]
            ring = annulus[(r2 >= 49) & (r2 <= 144)]
            gray_outline = int(((ring >= 155) & (ring < 249)).sum())
            bit = int(avg < 60)
            # "Pale" marks must be extant gray outlines with white interiors.
            if bit == 0:
                assert avg > 240 and gray_outline > 80, (side, x, y)
            else:
                assert avg < 60
            entries.append({
                "center_x": x, "center_y": y, "bit": bit,
                "center_mean_grayscale": round(avg, 2),
                "gray_outline_pixels_annulus": gray_outline,
            })
        bits = "".join(str(e["bit"]) for e in entries)
        sampled[side] = {"bits": bits, "binary_value": int(bits, 2), "dots": entries}
    assert sampled["left"]["bits"] == "01101"
    assert sampled["right"]["bits"] == "11111"
    assert sampled["left"]["binary_value"] == 13
    assert sampled["right"]["binary_value"] == 31

    left_bits = [int(bit) for bit in sampled["left"]["bits"]]
    filled_positions = [i + 1 for i, bit in enumerate(left_bits) if bit]
    hollow_positions = [i + 1 for i, bit in enumerate(left_bits) if not bit]
    assert filled_positions == [2, 3, 5]
    assert hollow_positions == [1, 4]

    mismatch_bits = "".join(str(1 - bit) for bit in left_bits)
    assert mismatch_bits == "10010"
    assert int(mismatch_bits, 2) == 18

    orientation_orders = {
        "top_to_bottom_left_to_right": [0, 1, 2, 3, 4],
        "top_to_bottom_right_to_left": [0, 2, 1, 4, 3],
        "bottom_to_top_left_to_right": [3, 4, 1, 2, 0],
        "bottom_to_top_right_to_left": [4, 3, 2, 1, 0],
    }
    orientation_bits = {
        name: "".join(str(left_bits[i]) for i in order)
        for name, order in orientation_orders.items()
    }
    assert [
        name for name, bits in orientation_bits.items()
        if bits == "01101"
    ] == ["top_to_bottom_left_to_right"]

    ink_file = ROOT / "resources" / "liber-primus" / "lp2-ink-annotations.json"
    ink = json.loads(ink_file.read_text("utf8"))
    stencil_count = sum(
        int(mark[1] == 13)
        for page in ink["pages"]
        for mark in page.get("large_punctuation", [])
    )
    assert stencil_count == 31
    print(json.dumps({
        "source": str(IMAGE.relative_to(ROOT)),
        "sha256": SHA256,
        "reading_order": "top, middle-left, middle-right, bottom-left, bottom-right",
        "ornaments": sampled,
        "thirteen_dot_stencil_count": stencil_count,
        "candidate_pair_matches_stencil_size_and_frequency": [13, 31],
        "filled_positions_1_to_5": filled_positions,
        "hollow_circumference_positions_1_to_5": hollow_positions,
        "prime_indicator_1_to_5": sampled["left"]["bits"],
        "fold_mismatch_nonprime_mask": mismatch_bits,
        "fold_mismatch_value": int(mismatch_bits, 2),
        "orientation_bits": orientation_bits,
        "hollow_position_decimal_concatenation": int(
            "".join(str(position) for position in hollow_positions)
        ),
        "caveat": "Hypothesis-generating visual bit reading. It may be decorative; "
                  "other source mechanisms and historical intention remain unproved."
    }, indent=2))


if __name__ == "__main__":
    main()
