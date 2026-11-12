#!/usr/bin/env python3
"""Compare LP1 p9 and LP2 p2 trilobite artwork and test simple mirror readouts."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LP1 = ROOT / "resources/liber-primus/09.jpg"
DEFAULT_LP2 = ROOT / "resources/liber-primus/19.jpg"
DEFAULT_CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
ROI_LP1 = (835, 1935, 1525, 2120)
ROI_LP2 = (878, 2642, 1568, 2827)


def mirror_match(lp1_path: Path, lp2_path: Path) -> dict:
    with Image.open(lp1_path) as image:
        if image.size != (2400, 3600):
            raise ValueError(f"LP1 image dimensions changed: {image.size}")
        a = image.convert("L").crop(ROI_LP1)
    with Image.open(lp2_path) as image:
        if image.size != (2400, 3600):
            raise ValueError(f"LP2 image dimensions changed: {image.size}")
        b = ImageOps.mirror(image.convert("L").crop(ROI_LP2))
    if a.size != b.size:
        raise ValueError(f"ROI sizes differ: {a.size} vs {b.size}")

    best = None
    width, height = a.size
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            x0, y0 = max(0, dx), max(0, dy)
            x1, y1 = min(width, width + dx), min(height, height + dy)
            aa = a.crop((x0, y0, x1, y1))
            bb = b.crop((x0 - dx, y0 - dy, x1 - dx, y1 - dy))
            pa, pb = list(aa.tobytes()), list(bb.tobytes())
            ma = [value < 100 for value in pa]
            mb = [value < 100 for value in pb]
            intersection = sum(x and y for x, y in zip(ma, mb))
            union = sum(x or y for x, y in zip(ma, mb))
            mismatch = sum(x != y for x, y in zip(ma, mb))
            mae = sum(abs(x - y) for x, y in zip(pa, pb)) / len(pa)
            row = {
                "dx_after_flip_px": dx, "dy_after_flip_px": dy,
                "compared_pixels": len(pa), "black_intersection": intersection,
                "black_union": union,
                "black_iou_threshold_lt_100": intersection / union if union else 1.0,
                "binary_mismatch_pixels": mismatch, "grayscale_mae": mae,
            }
            rank = (row["black_iou_threshold_lt_100"], -mae, -abs(dx) - abs(dy))
            if best is None or rank > best[0]:
                best = (rank, row)
    return {
        "lp1_file": str(lp1_path), "lp2_file": str(lp2_path),
        "lp1_roi_xyxy": ROI_LP1, "lp2_roi_xyxy": ROI_LP2,
        "operation": "horizontal flip of LP2 crop; align within +/-3 px; grayscale threshold <100",
        **best[1],
    }


def direct_mirror_readouts(corpus_path: Path) -> dict:
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    page = next(page for page in corpus["pages"] if page["page"] == 2)
    indices = page["indices"]
    if len(indices) != 201:
        raise ValueError(f"Expected 201 p2 runes in the pinned corpus, got {len(indices)}")
    if len(corpus["translit"]) != 29:
        raise ValueError("Expected 29 GP transliterations")
    variants = {
        "original": indices,
        "reverse_sequence": list(reversed(indices)),
        "atbash_reverse_alphabet": [28 - value for value in indices],
        "atbash_and_reverse": [28 - value for value in reversed(indices)],
    }
    return {
        "p2_rune_count": len(indices),
        "p2_distinct_symbols": len(set(indices)),
        "direct_gp29_transliterations": {
            name: "".join(corpus["translit"][value] for value in sequence)
            for name, sequence in variants.items()
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lp1", type=Path, default=DEFAULT_LP1)
    parser.add_argument("--lp2", type=Path, default=DEFAULT_LP2)
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    args = parser.parse_args()
    print(json.dumps({
        "mirror_comparison": mirror_match(args.lp1, args.lp2),
        "direct_mirror_readouts": direct_mirror_readouts(args.corpus),
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
