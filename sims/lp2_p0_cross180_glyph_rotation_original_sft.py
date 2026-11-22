"""Original p0 GP29 rune silhouettes versus the cross-marked 180-degree rotation.

The visibly inverted Orthodox crosses on source LP2 pp0–2 motivate this finite
literal-glyph test. Exact source-image glyphs are isolated without fitting
unknown plaintext. A rotated rune must resemble a genuine GP rune before
physical half-turns can be used as an unambiguous glyph-alphabet decoder.
Uses the existing, independently source-validated segmentation module.
"""
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np

from lp2_original_glyph_morphology_spacing_sft import (
    P0_BODY_STARTS,
    RUNES,
    image,
    segments,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "lp2-transcription.txt"


def normalized_crop(page, y0, x0, x1):
    """Tight-source-ink crop; 180-degree rotation has no padding artifact."""
    ink = (page[y0:y0 + 118, x0:x1 + 1] < 150).astype(np.float32)
    ys, xs = np.nonzero(ink)
    assert len(ys)
    cropped = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return cv2.resize(cropped, (48, 96), interpolation=cv2.INTER_AREA)


def squared_distance(a, b):
    """Mean source-silhouette squared error in the same fixed pixel frame."""
    return float(np.mean((a - b) ** 2))


def main():
    source_lines = SOURCE.read_text(encoding="utf-8").splitlines()[:12]
    assert len(source_lines) == 12
    source = image(17)
    exemplars = defaultdict(list)
    counts = []
    for y0, line in zip(P0_BODY_STARTS, source_lines[3:12]):
        expected = [r for r in line if r in RUNES]
        bounds = segments(source, y0)
        assert len(expected) == len(bounds), (y0, len(expected), len(bounds))
        counts.append(len(expected))
        for glyph, (x0, x1) in zip(expected, bounds):
            exemplars[glyph].append(normalized_crop(source, y0, x0, x1))
    assert len(exemplars) == 29
    assert sum(counts) == 200
    assert min(map(len, exemplars.values())) >= 4

    # Medoid chosen within each glyph class before the cross-class comparison.
    medoids = {}
    within = []
    for glyph, masks in exemplars.items():
        for i, a in enumerate(masks):
            within.extend(squared_distance(a, b) for b in masks[i + 1:])
        mean = np.mean(np.stack(masks), axis=0)
        medoids[glyph] = min(masks, key=lambda mask: squared_distance(mask, mean))

    # One fixed geometric operation, not a selected cipher key or rune mapping.
    cross = []
    symmetric = []
    for glyph in RUNES:
        rotated = np.flip(medoids[glyph], axis=(0, 1))
        self_error = squared_distance(rotated, medoids[glyph])
        if self_error <= 0.1:
            symmetric.append((glyph, round(self_error, 5)))
        competitors = sorted(
            (squared_distance(rotated, medoids[other]), other)
            for other in RUNES if other != glyph
        )
        cross.append((glyph, competitors[0][1], competitors[0][0]))
    min_cross = min(item[2] for item in cross)
    max_within = max(within)
    best = sorted(cross, key=lambda entry: entry[2])[:8]
    # Source-font resolution separates even the closest non-identical
    # flipped glyph from the worst within-class JPEG/template variation.
    assert max_within < 0.06, max_within
    assert min_cross > 0.13, min_cross
    assert min_cross > 2 * max_within
    assert len(symmetric) == 8, symmetric
    assert squared_distance(np.flip(medoids["ᛁ"], axis=(0, 1)),
                            medoids["ᛁ"]) == 0.0
    assert np.array_equal(
        np.flip(np.flip(medoids["ᚾ"], axis=(0, 1)), axis=(0, 1)),
        medoids["ᚾ"]
    )
    print({
        "source_body_glyphs": sum(counts),
        "source_classes": len(exemplars),
        "maximum_within_class_mse": max_within,
        "minimum_rotated_cross_class_mse": min_cross,
        "unambiguous_cross_class_matches_below_0.1": 0,
        "rotationally_self_similar_glyphs": symmetric,
        "eight_best_nonself_comparisons": best,
    })


if __name__ == "__main__":
    main()
