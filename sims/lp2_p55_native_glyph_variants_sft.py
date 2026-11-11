#!/usr/bin/env python3
"""Original-pixel control for proposed LP2 p55 glyph-variant key material.

Run: python sims/lp2_p55_native_glyph_variants_sft.py
Dependencies: NumPy, Pillow. Uses the unchanged original 60.jpg and 72.jpg
and the canonical LP2 GP29 corpus. No OCR or fitted plaintext.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
CORPUS = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))


def glyphs(page: int) -> list[np.ndarray]:
    """Segment ink shapes in ordinary text lines using only pixel geometry."""
    with Image.open(SOURCE / f"{page + 17:02d}.jpg") as image:
        pixels = np.asarray(image.convert("L"))
    assert pixels.shape == (3600, 2400)
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    ink = pixels[y0:y1, x0:x1] < 110
    ys = np.flatnonzero(ink.sum(axis=1) >= 18)
    bands = np.split(ys, np.flatnonzero(np.diff(ys) > 20) + 1)
    found: list[np.ndarray] = []
    for band in bands:
        if len(band) <= 40 or int(band[-1] - band[0]) < 40:
            continue
        line = ink[int(band[0]):int(band[-1]) + 1]
        xs = np.flatnonzero(line.sum(axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
        for run in runs:
            if not len(run):
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            points = np.argwhere(line[:, left:right])
            if len(points) < 100 or np.ptp(points[:, 0]) < 32:
                continue
            if not (595 <= left + x0 <= 1800 and np.ptp(points[:, 0]) + 1 >= 70):
                continue
            crop = line[:, left:right]
            rr, cc = np.where(crop)
            glyph = crop[rr.min():rr.max() + 1, cc.min():cc.max() + 1]
            if page == 55 and (glyph.shape[0] < 110 or glyph.shape[1] > 90):
                # The physically separate red terminal dot mark and tree
                # ornament are not GP runes, and must not become bits.
                continue
            found.append(glyph)
    return found


def binary_features(page: int) -> tuple[np.ndarray, np.ndarray]:
    source = np.asarray(CORPUS["pages"][page]["indices"], dtype=np.int16)
    observed = glyphs(page)
    assert len(observed) == len(source), (page, len(observed), len(source))
    data = np.zeros((len(source), 122, 100), dtype=np.int16)
    for i, glyph in enumerate(observed):
        h, w = glyph.shape
        assert h <= 122 and w <= 100
        data[i, :h, :w] = glyph
    return source, data.reshape(len(source), -1)


def nearest_same_label(
    target_labels: np.ndarray,
    target: np.ndarray,
    baseline_labels: np.ndarray,
    baseline: np.ndarray,
    leave_one_out: bool,
) -> tuple[np.ndarray, np.ndarray]:
    """Exact binary Hamming distance, without decoding rune identities."""
    d = (
        target.sum(axis=1, dtype=np.int32)[:, None]
        + baseline.sum(axis=1, dtype=np.int32)[None, :]
        - 2 * (target.astype(np.int32) @ baseline.astype(np.int32).T)
    )
    if leave_one_out:
        np.fill_diagonal(d, 1000000000)
    nearest_any = baseline_labels[np.argmin(d, axis=1)]
    d[~(target_labels[:, None] == baseline_labels[None, :])] = 1000000000
    nearest = d.min(axis=1)
    assert np.all(nearest < 1000000000)
    return nearest, nearest_any


def summarize(scores: np.ndarray) -> dict[str, float | int]:
    return {
        "n": int(len(scores)),
        "median": float(np.median(scores)),
        "p95": float(np.percentile(scores, 95)),
        "maximum": int(scores.max()),
        "zero_distance": int(np.count_nonzero(scores == 0)),
    }


def main() -> None:
    baseline_labels, baseline = binary_features(43)
    target_labels, target = binary_features(55)
    control_d, control_pred = nearest_same_label(
        baseline_labels, baseline, baseline_labels, baseline, True)
    target_d, target_pred = nearest_same_label(
        target_labels, target, baseline_labels, baseline, False)
    assert np.all(control_pred == baseline_labels)
    assert np.all(target_pred == target_labels)
    assert len(control_d) == 274 and len(target_d) == 76
    control, candidate = summarize(control_d), summarize(target_d)
    assert (control["median"], control["maximum"]) == (0., 271)
    assert (candidate["median"], candidate["maximum"]) == (0., 227)
    print(json.dumps({
        "source_scans": {"baseline": "60.jpg", "target": "72.jpg"},
        "baseline_native_same_rune_leave_one_out": control,
        "target_nearest_native_same_rune": candidate,
        "source_exact_label_readback": {"baseline": 274, "target": 76},
        "target_shapes_beyond_baseline_loo_maximum": int(
            np.count_nonzero(target_d > control_d.max())),
        "conclusion": (
            "No p55 rune has an anomalous binary glyph-distance score "
            "outside the original p43 native-printing maximum; this does "
            "not exclude kerning, microdots or non-shape carriers, and "
            "supplies no ciphertext key."
        ),
    }, indent=2))


if __name__ == "__main__":
    main()
