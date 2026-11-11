#!/usr/bin/env python3
"""Source-native LP2 red-ink chroma census; deliberately not a cipher search.

Run from the repository root:
    python sims/lp2_red_chroma_source_gate.py
Optional:
    python sims/lp2_red_chroma_source_gate.py --images /path/to/75-jpg-dir --annotations /path/to/lp2-ink-annotations.json

Inputs are the original LP2 scans 17.jpg--74.jpg (physical pages 0--57),
the existing independent ink annotation, Pillow, NumPy and OpenCV.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_IMAGES = ROOT / "resources" / "liber-primus"
DEFAULT_ANNOTATIONS = DEFAULT_IMAGES / "lp2-ink-annotations.json"

# Independent source annotation: sum of red-span rune counts by physical page.
EXPECTED_RED = {
    0: 13, 3: 19, 6: 11, 7: 14, 8: 12, 15: 20, 23: 16, 27: 19,
    33: 18, 39: 3, 40: 8, 53: 51, 54: 9, 56: 5, 57: 7,
}

# The first threshold segments saturated red ink while retaining complete
# ordinary and oversized glyphs. The second is an independently stricter
# interior-core threshold used only for sensitivity, not fitted to plaintext.
BASE_RED = (150, 80, 80)   # R > 150, G < 80, B < 80
CORE_RED = (180, 60, 60)   # R > 180, G < 60, B < 60
STANDARD = (100, 130, 500) # min/max height, minimum component area
LARGE = (300, 10000)       # minimum height and area for drop capitals
TRAIN_PAGES = (0, 3, 6, 7, 8, 15, 23, 27)
HOLDOUT_PAGES = (33, 39, 40, 53, 54, 56, 57)


def annotation_counts(path: Path) -> dict[int, int]:
    annotation = json.loads(path.read_text(encoding="utf-8"))
    counts = {}
    for page in annotation["pages"]:
        spans = page.get("red_spans", [])
        n = sum(int(span.get("length", len(span.get("runes", ""))))
                for span in spans)
        if n:
            counts[int(page["page"])] = n
    if counts != EXPECTED_RED or sum(counts.values()) != 225:
        raise AssertionError({"annotation_counts": counts,
                              "expected": EXPECTED_RED})
    return counts


def is_glyph_component(height: int, area: int) -> str | None:
    if STANDARD[0] <= height <= STANDARD[1] and area >= STANDARD[2]:
        return "standard"
    if height >= LARGE[0] and area >= LARGE[1]:
        return "large"
    return None


def jpeg_metadata(path: Path) -> tuple[str, tuple, str]:
    with Image.open(path) as image:
        mode = image.mode
        layers = tuple(tuple(int(v) for v in row)
                       for row in getattr(image, "layer", []))
        qtables = image.quantization or {}
        signature = json.dumps(
            sorted((int(k), [int(v) for v in values])
                   for k, values in qtables.items()),
            separators=(",", ":"),
        ).encode("ascii")
        return mode, layers, hashlib.sha256(signature).hexdigest()[:16]


def rounded_vector(values: np.ndarray) -> list[float]:
    return [round(float(v), 3) for v in values]


def hue_degrees(delta: np.ndarray) -> float:
    return math.degrees(math.atan2(float(delta[2]), float(delta[1])))


def run(images: Path, annotations: Path) -> dict:
    expected = annotation_counts(annotations)
    modes = Counter()
    sampling = defaultdict(Counter)
    qtables = defaultdict(Counter)
    rows = []
    page_components = Counter()
    strong_page_components = Counter()

    for page in range(58):
        path = images / f"{page + 17:02d}.jpg"
        if not path.exists():
            raise FileNotFoundError(path)
        mode, layers, qhash = jpeg_metadata(path)
        modes[mode] += 1
        sampling[mode][repr(layers)] += 1
        qtables[mode][qhash] += 1

        with Image.open(path) as source:
            if source.size != (2400, 3600):
                raise AssertionError((path, source.size))
            rgb = np.asarray(source.convert("RGB"))

        if mode != "RGB":
            if page in expected:
                raise AssertionError(f"red-annotated p{page} is not RGB")
            continue

        red = ((rgb[:, :, 0] > BASE_RED[0])
               & (rgb[:, :, 1] < BASE_RED[1])
               & (rgb[:, :, 2] < BASE_RED[2])).astype(np.uint8)
        strong = ((rgb[:, :, 0] > CORE_RED[0])
                  & (rgb[:, :, 1] < CORE_RED[1])
                  & (rgb[:, :, 2] < CORE_RED[2])).astype(np.uint8)

        n, labels, stats, _ = cv2.connectedComponentsWithStats(red, 8)
        _, _, sstats, _ = cv2.connectedComponentsWithStats(strong, 8)
        lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
        local_rows = []
        strong_count = 0

        for component_id, (x, y, width, height, area) in enumerate(stats[1:], 1):
            kind = is_glyph_component(int(height), int(area))
            if kind is None:
                continue
            page_components[page] += 1
            component = labels[y:y+height, x:x+width] == component_id
            pixels = rgb[y:y+height, x:x+width][component]
            core = (component
                    & (rgb[y:y+height, x:x+width, 0] > CORE_RED[0])
                    & (rgb[y:y+height, x:x+width, 1] < CORE_RED[1])
                    & (rgb[y:y+height, x:x+width, 2] < CORE_RED[2]))
            core_pixels = rgb[y:y+height, x:x+width][core]
            if len(core_pixels) < 10:
                raise AssertionError((page, x, y, "insufficient core pixels"))

            # A 24-pixel local annulus supplies the matched paper background.
            pad = 24
            x0, y0 = max(0, x-pad), max(0, y-pad)
            x1, y1 = min(2400, x+width+pad), min(3600, y+height+pad)
            yy, xx = np.ogrid[y0:y1, x0:x1]
            ring = ((xx < x) | (xx >= x+width)
                    | (yy < y) | (yy >= y+height))
            region = rgb[y0:y1, x0:x1].astype(np.int16)
            neutral = (ring & (region.mean(axis=2) > 165)
                       & ((region.max(axis=2)-region.min(axis=2)) < 25))
            if int(neutral.sum()) < 5:
                raise AssertionError((page, x, y, "no matched neutral background"))
            background_rgb = np.median(region[neutral], axis=0)
            background_lab = np.median(lab[y0:y1, x0:x1][neutral], axis=0)
            ink_lab = np.median(lab[y:y+height, x:x+width][component], axis=0)
            core_lab = np.median(lab[y:y+height, x:x+width][core], axis=0)
            delta = ink_lab - background_lab
            core_delta = core_lab - background_lab

            local_rows.append({
                "page": page, "x": int(x), "y": int(y),
                "width": int(width), "height": int(height),
                "area": int(area), "kind": kind,
                "pixels": int(len(pixels)), "core_pixels": int(len(core_pixels)),
                "rgb_median": [int(round(float(v))) for v in np.median(pixels, axis=0)],
                "core_rgb_median": [int(round(float(v))) for v in np.median(core_pixels, axis=0)],
                "background_rgb_median": [int(round(float(v))) for v in background_rgb],
                "lab_delta": delta,
                "core_lab_delta": core_delta,
            })

        # Independent segmentation at the stricter core threshold must recover
        # the same per-page glyph count; this is a threshold/page control.
        for _, (_, _, width, height, area) in enumerate(sstats[1:], 1):
            if is_glyph_component(int(height), int(area)) is not None:
                strong_count += 1
        strong_page_components[page] = strong_count

        expected_count = expected.get(page, 0)
        if page_components[page] != expected_count:
            raise AssertionError({"page": page, "segmented": page_components[page],
                                  "annotated": expected_count})
        if strong_count != expected_count:
            raise AssertionError({"page": page, "strong_segmented": strong_count,
                                  "annotated": expected_count})
        rows.extend(local_rows)

    if modes != Counter({"RGB": 35, "L": 23}):
        raise AssertionError(modes)
    if len(sampling["RGB"]) != 1 or len(qtables["RGB"]) != 1:
        raise AssertionError({"RGB_sampling": sampling["RGB"],
                              "RGB_qtables": qtables["RGB"]})
    if len(rows) != 225 or Counter(r["kind"] for r in rows) != Counter(
            {"standard": 210, "large": 15}):
        raise AssertionError((len(rows), Counter(r["kind"] for r in rows)))

    def matrix(items, field):
        return np.asarray([r[field] for r in items], dtype=float)

    def summary(items):
        rgb = matrix(items, "rgb_median")
        core_rgb = matrix(items, "core_rgb_median")
        bg = matrix(items, "background_rgb_median")
        delta = matrix(items, "lab_delta")
        core_delta = matrix(items, "core_lab_delta")
        hues = np.asarray([hue_degrees(d) for d in delta])
        core_hues = np.asarray([hue_degrees(d) for d in core_delta])
        base_b_codes = Counter(str(round(float(d[2]))) for d in delta)
        core_b_codes = Counter(str(round(float(d[2]))) for d in core_delta)
        flips = sum(round(float(d[2])) != round(float(c[2]))
                    for d, c in zip(delta, core_delta))
        return {
            "n": len(items),
            "rgb_median": {"median": rounded_vector(np.median(rgb, axis=0)),
                           "min": rounded_vector(np.min(rgb, axis=0)),
                           "max": rounded_vector(np.max(rgb, axis=0))},
            "core_rgb_median": {"median": rounded_vector(np.median(core_rgb, axis=0)),
                                "min": rounded_vector(np.min(core_rgb, axis=0)),
                                "max": rounded_vector(np.max(core_rgb, axis=0))},
            "matched_background_rgb_median": rounded_vector(np.median(bg, axis=0)),
            "lab_delta_median": rounded_vector(np.median(delta, axis=0)),
            "lab_delta_range": [rounded_vector(np.min(delta, axis=0)),
                                rounded_vector(np.max(delta, axis=0))],
            "lab_b_delta_code_counts_base": dict(base_b_codes),
            "lab_b_delta_code_counts_core": dict(core_b_codes),
            "hue_degrees_median_range": [round(float(np.median(hues)), 3),
                                         round(float(np.min(hues)), 3),
                                         round(float(np.max(hues)), 3)],
            "core_hue_degrees_median_range": [round(float(np.median(core_hues)), 3),
                                              round(float(np.min(core_hues)), 3),
                                              round(float(np.max(core_hues)), 3)],
            "one_code_b_channel_bin_flips_base_to_core": int(flips),
        }

    by_kind = {kind: summary([r for r in rows if r["kind"] == kind])
               for kind in ("standard", "large")}
    train = [r for r in rows if r["page"] in TRAIN_PAGES]
    holdout = [r for r in rows if r["page"] in HOLDOUT_PAGES]
    by_page = {}
    for page in sorted(expected):
        page_rows = [r for r in rows if r["page"] == page]
        by_page[str(page)] = summary(page_rows)

    return {
        "method": {
            "source_scans": "17.jpg--74.jpg; physical LP2 page = scan - 17",
            "base_mask": "R>150, G<80, B<80; 8-connected components",
            "core_mask": "R>180, G<60, B<60",
            "standard_glyph": "height 100..130 px and red area >=500 px",
            "oversized_initial": "height >=300 px and red area >=10000 px",
            "matched_background": "24-px annulus; neutral pixels mean RGB>165 and max-min<25",
            "colour_space": "OpenCV 8-bit Lab; glyph median minus matched local-background median",
            "no_cipher_fit": True,
        },
        "jpeg_modes": dict(modes),
        "rgb_sampling_factors": dict(sampling["RGB"]),
        "rgb_quantization_table_hashes": dict(qtables["RGB"]),
        "red_pages": sorted(expected),
        "annotated_red_runes": sum(expected.values()),
        "segmented_glyph_components": len(rows),
        "segmented_by_kind": dict(Counter(r["kind"] for r in rows)),
        "per_page_counts_match_annotation_at_both_thresholds": True,
        "per_page_counts": {str(p): {"annotated": expected.get(p, 0),
                                      "base": page_components[p],
                                      "core": strong_page_components[p]}
                            for p in range(58) if expected.get(p, 0)},
        "all_glyphs": summary(rows),
        "by_typography": by_kind,
        "train_pages": list(TRAIN_PAGES),
        "holdout_pages_including_solved_controls": list(HOLDOUT_PAGES),
        "train": summary(train),
        "holdout": summary(holdout),
        "per_page_colour": by_page,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGES)
    parser.add_argument("--annotations", type=Path, default=DEFAULT_ANNOTATIONS)
    args = parser.parse_args()
    result = run(args.images, args.annotations)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
