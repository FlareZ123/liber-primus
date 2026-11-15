"""SFT: original-JPEG GP29 glyph morphology and subpixel spacing audit.

Source: all 58 original LP2 JPEGs and canonical rune master. The 29 font
templates are trained on the nine source-aligned body lines of physical p0.
They are held out from the image-only classification of all other pages.
The source p57 (solved) provides an independent in-book calibration.
Requires numpy, Pillow and opencv-python. Windows 11 compatible.
"""
from collections import Counter, defaultdict
from pathlib import Path
import json

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
MASTER = ROOT / "resources" / "transcriptions" / "liber_primus_master.txt"
RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
INDEX = {c: i for i, c in enumerate(RUNES)}
P0_BODY_STARTS = [1234, 1422, 1610, 1798, 1986, 2174, 2362, 2550, 2738]


def image(n):
    return np.asarray(Image.open(SRC / f"{n:02d}.jpg").convert("L"))


def bands(page):
    counts = np.count_nonzero(page[:, 850:1960] < 150, axis=1)
    positions = np.where(counts > 80)[0]
    out = []
    for y in positions:
        if not out or y > out[-1][1] + 2:
            out.append([int(y), int(y)])
        else:
            out[-1][1] = int(y)
    return [
        a - 4 for a, b in out
        if 85 <= b - a + 1 <= 145 and np.max(counts[a:b + 1]) > 200
    ]


def segments(page, y0):
    ink = page[y0:y0 + 118, 600:2100] < 150
    positions = np.where(np.count_nonzero(ink, axis=0) >= 7)[0]
    runs = []
    for x in positions:
        if not runs or x > runs[-1][1] + 1:
            runs.append([int(x), int(x)])
        else:
            runs[-1][1] = int(x)
    result = []
    for a, b in runs:
        height = np.count_nonzero(np.any(ink[:, a:b + 1], axis=1))
        if height >= 100 and b - a + 1 <= 92:
            result.append((a + 600, b + 600))
    return result


def feature(page, y0, x0, x1):
    ink = (page[y0:y0 + 118, x0:x1 + 1] < 150).astype(np.float32)
    active = np.where(np.any(ink, axis=1))[0]
    if not len(active):
        return None
    ink = ink[active[0]:active[-1] + 1]
    height, width = ink.shape
    if height > 120 or width > 96:
        return None
    pad = np.zeros((120, 96), np.float32)
    pad[:height, :width] = ink
    return cv2.resize(pad, (48, 60), interpolation=cv2.INTER_AREA).ravel()


def main():
    raw = MASTER.read_text(encoding="utf-8")
    pages = raw.split("%")
    assert len(pages) == 75
    p0_lines = [
        [c for c in s if c in INDEX]
        for s in pages[16].splitlines()
        if any(c in INDEX for c in s)
    ]
    assert len(p0_lines) == 12
    p0 = image(17)
    templates = []
    template_labels = []
    for line_no in range(3, 12):
        y0 = P0_BODY_STARTS[line_no - 3]
        runs = segments(p0, y0)
        chars = p0_lines[line_no]
        assert len(runs) == len(chars), (line_no, len(runs), len(chars))
        for c, (x0, x1) in zip(chars, runs):
            f = feature(p0, y0, x0, x1)
            if f is not None:
                templates.append(f)
                template_labels.append(INDEX[c])
    assert set(template_labels) == set(range(29))
    T = np.asarray(templates, np.float32)
    labels = np.asarray(template_labels, np.int32)

    samples = []
    for p in range(58):
        original = image(p + 17)
        for line_no, y0 in enumerate(bands(original)):
            for x0, x1 in segments(original, y0):
                f = feature(original, y0, x0, x1)
                if f is not None:
                    samples.append((p, line_no, x0, x1, f))
    X = np.stack([s[4] for s in samples])
    distances = (
        (X * X).sum(axis=1)[:, None]
        + (T * T).sum(axis=1)[None, :]
        - 2 * (X @ T.T)
    ) / X.shape[1]
    best = np.argmin(distances, axis=1)
    predicted = labels[best]
    score = distances[np.arange(len(X)), best]

    source_counts = np.zeros((58, 29), np.int32)
    for p in range(58):
        for c in pages[p + 16]:
            if c in INDEX:
                source_counts[p, INDEX[c]] += 1
    assert int(source_counts.sum()) == 13136
    confident = score < 0.02
    measured_counts = np.zeros((58, 29), np.int32)
    words = defaultdict(list)
    for i, (p, line_no, x0, x1, _) in enumerate(samples):
        if confident[i]:
            measured_counts[p, predicted[i]] += 1
            words[(p, line_no)].append((x0, x1, predicted[i]))
    delta = measured_counts - source_counts

    # Fit the raster renderer's fixed per-glyph advance and side bearing.
    # A punctuation gap is wider: keep only adjacent ink extents 0..14 px.
    steps = []
    for (p, line_no), items in words.items():
        items.sort()
        for a, b in zip(items, items[1:]):
            gap = b[0] - a[1] - 1
            if 0 <= gap <= 14:
                steps.append((p, a[2], b[2], b[0] - a[0]))
    record = np.asarray(steps, np.int32)
    design = np.zeros((len(record), 59), np.float64)
    design[:, 0] = 1
    design[np.arange(len(record)), 1 + record[:, 1]] = 1
    design[np.arange(len(record)), 30 + record[:, 2]] = 1
    target = record[:, 3].astype(np.float64)
    training = record[:, 0] < 40
    beta = np.linalg.lstsq(design[training], target[training], rcond=None)[0]
    residual = target - design @ beta
    holdout = ~training

    # Independent planted control: 5% of held-out kerning positions gain
    # a 3-pixel offset, with locked seed, and are read by the frozen fit.
    rng = np.random.default_rng(3301)
    test_indices = np.where(holdout)[0]
    planted_positions = rng.choice(
        test_indices, size=len(test_indices) // 20, replace=False)
    altered = target.copy()
    altered[planted_positions] += rng.choice(
        [-3, 3], size=len(planted_positions))
    planted_residual = altered - design @ beta
    def rmse(v):
        return float(np.sqrt(np.mean(np.square(v))))

    outcome = {
        "source": "Original resources/liber-primus/{17..74}.jpg and canonical master",
        "runic_font_classes": len(set(template_labels)),
        "original_symbols": int(source_counts.sum()),
        "extracted_glyph_candidates": len(samples),
        "high_confidence_glyphs": int(confident.sum()),
        "per_page_complete_histograms": int(
            np.sum(np.all(delta == 0, axis=1))),
        "uncaptured_or_disputed_original_symbol_count": int(
            np.maximum(-delta, 0).sum()),
        "extra_known_decorative_strokes": int(np.maximum(delta, 0).sum()),
        "sequential_glyph_pairs": len(record),
        "fixed_advance_renderer": {
            "training_pairs_p0_to_p39": int(training.sum()),
            "heldout_pairs_p40_to_p57": int(holdout.sum()),
            "holdout_rmse_px": rmse(residual[holdout]),
            "holdout_max_absolute_error_px": float(
                np.max(np.abs(residual[holdout]))),
            "holdout_errors_over_2px": int(
                np.sum(np.abs(residual[holdout]) > 2)),
            "solved_p56_p57_rmse_px": rmse(
                residual[record[:, 0] >= 56]),
        },
        "planted_5_percent_pm3_px_control": {
            "modified_pairs": len(planted_positions),
            "holdout_rmse_px": rmse(planted_residual[holdout]),
            "holdout_errors_over_2px": int(
                np.sum(np.abs(planted_residual[holdout]) > 2)),
        },
        "scope": "Strongly disfavors separately encoded 3-pixel kerning shifts "
                 "or alternative letter silhouettes among recognized glyphs; "
                 "cannot rule out subpixel channels or non-glyph image payloads. "
                 "No ciphertext plaintext or key recovered."
    }
    print(json.dumps(outcome, indent=2))
    assert len(record) >= 9600
    assert np.max(np.abs(residual[holdout])) < 2
    assert np.sum(np.abs(planted_residual[holdout]) > 2) >= (
        len(planted_positions) * 0.90)


if __name__ == "__main__":
    main()
