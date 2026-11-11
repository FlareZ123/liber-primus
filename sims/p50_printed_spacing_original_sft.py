#!/usr/bin/env python3
"""Source-native spacing test for the original 32x8 LP2 number table.

Run from repository root with Python 3, Pillow, numpy and scikit-learn.
Original scans are resources/liber-primus/66.jpg, 67.jpg, 68.jpg.
The reference p15 printed four-square is original scan 32.jpg.
No OCR, decoded ciphertext or number values enter geometric fitting.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.linear_model import Ridge

ROOT = Path(__file__).resolve().parents[1]
RESOURCE = ROOT / "resources" / "liber-primus"
LAYOUT = {66: (1200, 3020, 10), 67: (600, 2950, 13), 68: (600, 2200, 9)}


def segments(mask: np.ndarray) -> list[tuple[int, int]]:
    """Inclusive consecutive-ink spans along a single projection axis."""
    spans = []
    active = False
    start = 0
    for i, v in enumerate(mask):
        if v and not active:
            start = i
            active = True
        if not v and active:
            spans.append((start, i - 1))
            active = False
    if active:
        spans.append((start, len(mask) - 1))
    return spans


def extract(threshold: int, table: list[list[str]]) -> list[dict]:
    all_rows = []
    row_number = 0
    for page, (ymin, ymax, count) in LAYOUT.items():
        image = np.asarray(Image.open(RESOURCE / f"{page:02d}.jpg").convert("L"))
        assert image.shape == (3600, 2400)
        # Delimit exact numeral bands without recognizing their glyphs.
        projection = (image[ymin:ymax, 620:1800] < threshold).sum(axis=1)
        bands = [(a + ymin, b + ymin) for a, b in segments(projection >= 5)]
        assert len(bands) == count, (page, bands)
        for line, (lo, hi) in enumerate(bands):
            crop = image[lo:hi + 1, 600:1830] < threshold
            char_ink = crop.sum(axis=0)
            spans = [(x0 + 600, x1 + 600) for x0, x1 in segments(char_ink > 0)]
            chars = "".join(table[row_number])
            assert len(chars) == 16
            # The p68 first line's 0J two glyphs touch horizontally on the scan.
            # Leave this row out rather than invent a boundary.
            assert len(spans) == (15 if page == 68 and line == 0 else 16), (
                page, line, len(spans)
            )
            bottoms = []
            if len(spans) == 16:
                for x0, x1 in spans:
                    yy, xx = np.nonzero(image[lo:hi + 1, x0:x1 + 1] < threshold)
                    assert yy.size
                    bottoms.append(int(yy.max()) + lo)
            all_rows.append({
                "page": page,
                "global_row": row_number,
                "page_row": line + 1,
                "chars": chars,
                "spans": spans,
                "bottoms": bottoms,
            })
            row_number += 1
    assert row_number == 32
    return all_rows


def geometry(rows: list[dict]) -> dict:
    alphabet = sorted(set("".join(row["chars"] for row in rows)))
    letters = {char: i for i, char in enumerate(alphabet)}
    X, y, transition_meta = [], [], []
    Z, bottoms, vertical_meta = [], [], []
    for row in rows:
        if len(row["spans"]) != 16:
            continue
        n = row["global_row"]
        chars = row["chars"]
        spans = row["spans"]
        for j in range(16):
            v = np.zeros(32 + len(letters))
            v[n] = 1
            v[32 + letters[chars[j]]] = 1
            Z.append(v)
            bottoms.append(row["bottoms"][j])
            vertical_meta.append((n, row["page"], j, chars[j]))
            if j == 15:
                continue
            vec = np.zeros(2 * len(letters) + 1)
            vec[letters[chars[j]]] = 1
            vec[len(letters) + letters[chars[j + 1]]] = 1
            vec[-1] = j % 2  # Inter-token space after every second glyph.
            X.append(vec)
            y.append(spans[j + 1][0] - spans[j][1] - 1)
            transition_meta.append((n, row["page"], j))
    X = np.stack(X)
    y = np.array(y)
    Z = np.stack(Z)
    bottoms = np.array(bottoms)
    assert X.shape[0] == 31 * 15
    assert Z.shape[0] == 31 * 16
    hold = np.array([r == 31 for r, page, j in transition_meta])
    hold_v = np.array([r == 31 for r, page, j, c in vertical_meta])
    assert hold.sum() == 15
    assert hold_v.sum() == 16

    # Character-dependent side bearings and one common extra word space.
    # Training on 30 rows, with the last original p68 row fully held out.
    hmodel = Ridge(alpha=0.1).fit(X[~hold], y[~hold])
    hres = y - hmodel.predict(X)
    train_abs = np.abs(hres[~hold])
    held_abs = np.abs(hres[hold])
    assert np.max(train_abs) < 2.1
    assert np.max(held_abs) < 1.2
    space = float(hmodel.coef_[-1])
    assert 25 < space < 29

    # Independent page-held-out controls for the font-space explanation.
    page_control = {}
    for page in LAYOUT:
        page_hold = np.array([p == page for r, p, j in transition_meta])
        model = Ridge(alpha=0.1).fit(X[~page_hold], y[~page_hold])
        errs = np.abs(y[page_hold] - model.predict(X[page_hold]))
        page_control[str(page)] = {
            "observations": int(errs.size),
            "median_abs_px": float(np.median(errs)),
            "p95_abs_px": float(np.quantile(errs, 0.95)),
            "max_abs_px": float(np.max(errs)),
        }
    assert page_control["66"]["max_abs_px"] < 11
    assert page_control["67"]["max_abs_px"] < 5
    assert page_control["68"]["max_abs_px"] < 3
    # Page66 alone contains some J transitions unseen on the other pages.

    # Character-descender effect and one independently fitted baseline per
    # printed line. Test glyph vertical offsets on held-out final row.
    vmodel = Ridge(alpha=0.0001).fit(Z[~hold_v], bottoms[~hold_v])
    trained_vres = bottoms[~hold_v] - vmodel.predict(Z[~hold_v])
    fixed_effects = np.array([
        vmodel.coef_[32 + letters[c]]
        for row, page, j, c in vertical_meta if row == 31
    ])
    base = float(np.median(bottoms[hold_v] - fixed_effects))
    held_vres = bottoms[hold_v] - (base + fixed_effects)
    assert np.max(np.abs(trained_vres)) < 1.2
    assert np.max(np.abs(held_vres)) < 0.2

    # Test power at the true held-out row under one inserted wordspace
    # (position j=7) and one glyph shifted down by 20 source pixels.
    planted_gap = y[hold].copy()
    planted_gap[7] += 27
    gap_signal = float(np.max(np.abs(planted_gap - hmodel.predict(X[hold]))))
    assert gap_signal > 25
    planted_bottom = bottoms[hold_v].copy()
    planted_bottom[5] += 20
    plant_baseline = np.median(planted_bottom - fixed_effects)
    vertical_signal = float(np.max(np.abs(
        planted_bottom - (plant_baseline + fixed_effects)
    )))
    assert vertical_signal > 19

    return {
        "model": "sidebearing left/right per character + one wordspace",
        "glyph_classes": len(letters),
        "complete_rows": 31,
        "source_joined_row": "68.jpg first numeral row, 15 projected blobs",
        "transition_observations": int(X.shape[0]),
        "fitted_wordspace_extra_px": space,
        "trained_horizontal_max_abs_px": float(np.max(train_abs)),
        "heldout_horizontal_median_abs_px": float(np.median(held_abs)),
        "heldout_horizontal_max_abs_px": float(np.max(held_abs)),
        "trained_vertical_max_abs_px": float(np.max(np.abs(trained_vres))),
        "heldout_vertical_max_abs_px": float(np.max(np.abs(held_vres))),
        "cross_page_controls": page_control,
        "planted_wordspace_detected_abs_px": gap_signal,
        "planted_vertical_shift_detected_abs_px": vertical_signal,
    }


def main() -> None:
    data = json.loads((RESOURCE / "base60-grid.json").read_text("utf-8"))
    table = data["rows"]
    assert len(table) == 32 and all(len(r) == 8 for r in table)
    # Real p15 source control for the four printed numeral baselines.
    p15 = np.asarray(Image.open(RESOURCE / "32.jpg").convert("L"))
    projection = (p15[850:1420, 620:1800] < 110).sum(axis=1)
    assert len(segments(projection >= 5)) == 4

    output = {}
    for threshold in (80, 110, 150):
        output[str(threshold)] = geometry(extract(threshold, table))
    assert len(output) == 3
    print(json.dumps({
        "control_p15_numeric_line_count": 4,
        "p50_original_scans": ["66.jpg", "67.jpg", "68.jpg"],
        "threshold_results": output,
        "decision": "No source-stable displaced-glyph or extra-wordspace class under the fixed 32x8 geometric model",
        "status": "PASS",
    }, indent=2))


if __name__ == "__main__":
    main()
