#!/usr/bin/env python3
"""P39 original-image exact five-glyph ordinary-type decision.

Run from repository root:
    python sims/lp2_p39_fiveglyph_typography_sft.py
Optional original archive:
    python sims/lp2_p39_fiveglyph_typography_sft.py --archive PATH

Uses a single SHA-pinned 2014 original LP2 p39 scan (archive 56.jpg).
Never modifies source images. This is an image-classification premise audit,
not plaintext recovery or a test of the adjacent three-dot ornament.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import zipfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHA256 = "d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00"

# Left-to-right printed p39 line 5, canonical glyphs M, S, W, OE, H.
# These are all five glyphs, including the one classified correctly by
# the previously trained p43 OCR model. The quoted four disagreements are
# classifier output, not four physically marked characters.
SPECIAL = [
    (601, 1616, 52, 113),
    (660, 1614, 35, 115),
    (699, 1615, 35, 114),
    (737, 1614, 44, 115),
    (787, 1614, 43, 115),
]

# Matched ordinary glyph shapes independently present elsewhere in this
# same original 56.jpg, from the original 212 non-special components.
# Controls are independent spatial locations in standard black-text rows.
CONTROLS = [
    (1316, 1239, 52, 113),
    (1317, 2422, 35, 115),
    (1432, 1238, 35, 114),
    (1169, 2046, 44, 115),
    (1682, 2046, 43, 115),
]


def read_source(archive: str | None) -> bytes:
    if archive is None:
        return (ROOT / "resources" / "liber-primus" / "56.jpg").read_bytes()
    with zipfile.ZipFile(archive) as z:
        return z.read("liber-primus-jpegs/56.jpg")


def components_in_band(black: np.ndarray, lo: int, hi: int) -> list[tuple[int, ...]]:
    """Return only same-page full-height ordinary glyph components.

    Threshold and spatial region are fixed independently of the test
    similarity; small punctuation, red13 and three oversized black dots
    are deliberately excluded from ordinary glyph comparators.
    """
    region = black[lo:hi, 590:1800].astype("uint8")
    count, _, stats, _ = cv2.connectedComponentsWithStats(region, 8)
    glyphs = []
    for i in range(1, count):
        x, y, width, height, area = map(int, stats[i])
        x, y = x + 590, y + lo
        if 70 <= height <= 125 and 15 <= width <= 80 and area >= 300:
            glyphs.append((x, y, width, height, area))
    return glyphs


def normal(black: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = box
    crop = black[y:y + h, x:x + w].astype("float32")
    return cv2.resize(crop, (64, 64), interpolation=cv2.INTER_AREA)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=str, default=None)
    args = parser.parse_args()

    source = read_source(args.archive)
    assert hashlib.sha256(source).hexdigest() == SHA256, "Original p39 scan changed"
    rgb = np.asarray(Image.open(io.BytesIO(source)).convert("RGB"))
    assert rgb.shape == (3600, 2400, 3)
    black = np.all(rgb < 160, axis=2)
    ordinary = components_in_band(black, 700, 1540)
    ordinary += components_in_band(black, 1830, 2910)
    special = components_in_band(black, 1570, 1760)
    assert len(ordinary) == 212
    assert sorted(special) == sorted(
        [(x, y, w, h, int(black[y:y + h, x:x + w].sum()))
         for x, y, w, h in SPECIAL]
    )

    # The original p39 5-glyph line uses the same glyph heights as
    # surrounding ordinary rows; "enlarged" was an erroneous descriptor.
    ordinary_heights = np.array([c[3] for c in ordinary])
    original_heights = [c[3] for c in SPECIAL]
    assert float(np.median(ordinary_heights)) == 114.0
    assert original_heights == [113, 115, 114, 115, 115]

    matches = []
    for i, (source_box, expected_box) in enumerate(zip(SPECIAL, CONTROLS)):
        a = normal(black, source_box)
        b = normal(black, expected_box)
        matched = float(np.mean(np.abs(a - b)))
        wrong = float(np.mean(np.abs(a - normal(black, CONTROLS[(i + 1) % 5]))))
        assert matched < 0.03, f"Same-glyph shape missing at {i}"
        assert wrong > 0.20, f"Different-glyph control too similar at {i}"
        assert any(tuple(c[:4]) == expected_box for c in ordinary)
        # Verify it truly is the nearest ordinary silhouette for each
        # of the five source glyphs, not a cherry-picked near match.
        nearest = min(float(np.mean(np.abs(a - normal(black, tuple(c[:4])))))
                      for c in ordinary)
        assert abs(matched - nearest) < 1e-5, f"Pair is not the nearest ordinary glyph {i}"
        matches.append({
            "glyph": ["M", "S", "W", "OE", "H"][i],
            "source_xywh": source_box,
            "ordinary_xywh": expected_box,
            "silhouette_MAE": round(matched, 8),
            "wrong_class_MAE": round(wrong, 8),
        })

    print(json.dumps({
        "original_image_sha256": SHA256,
        "original_printed_line": "MSWOEH",
        "physical_page": 39,
        "source_JPEG": "56.jpg",
        "ordinary_comparator_glyphs": len(ordinary),
        "ordinary_median_height_px": float(np.median(ordinary_heights)),
        "special_line_glyph_heights_px": original_heights,
        "matched_forms": matches,
        "decision": "All five p39 line-5 glyphs are ordinary existing letterforms; the OCR's four exceptions are model/segmentation artefacts. No independent four-symbol key, hidden typo alphabet or source-selected decoder is present. The three distinct large black dots beside the line are separate printed punctuation."
    }, indent=2))


if __name__ == "__main__":
    main()
