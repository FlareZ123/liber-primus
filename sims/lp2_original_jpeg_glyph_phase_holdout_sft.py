"""Original-JPEG GP29 font-outline/position gate, one-file reproducible SFT.

Loads the already source-validated two-page glyph calibrator, then examines
original JPEG shapes and predicts whole-line positions on disjoint page splits.
Requires NumPy, Pillow and OpenCV, original resources. Writes no files.
"""
from collections import defaultdict
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import runpy

import numpy as np

with redirect_stdout(io.StringIO()):
    base = runpy.run_path(str(Path(__file__).with_name("lp2_original_rune_typography_sft.py")))

pages = sorted(set(base["HOLDOUT"]) | {32, 55})
detect, predict = base["detect"], base["predict"]
source_image, visible_dots = base["source_image"], base["visible_dots"]
types, prototypes = base["types"], base["templates"]
samples = defaultdict(list)
positions, pairrows, cumrows, displacement, cumdisplacement = [], [], [], [], []
line_count = 0

for page in pages:
    source = source_image(page)
    for row in range(12):
        boxes = detect(source, row, 1032 if page == 55 and row == 3 else 1810)
        if not boxes:
            continue
        runes, confidence = predict(boxes, types, prototypes)
        for ix, (box, r, conf) in enumerate(zip(boxes, runes, confidence)):
            if conf < .88:
                continue
            left, right, _ = box
            y0 = 673 + 188 * row
            strip = source[y0 - 10:y0 + 125, left:right + 1] < 155
            yrange = np.flatnonzero(strip.any(axis=1))
            mask = strip[yrange[0]:yrange[-1] + 1]
            samples[int(r)].append((page, mask))
        if len(boxes) < 2 or min(confidence) < .88:
            continue
        line_count += 1
        cumulative = np.zeros(59)
        for i in range(len(boxes) - 1):
            x1, x2 = boxes[i][0], boxes[i + 1][0]
            dots = visible_dots(source, row, boxes[i][1], x2)
            advance = np.zeros(59)
            advance[int(runes[i])] = 1
            advance[29 + int(runes[i + 1])] = 1
            advance[58] = dots
            cumulative = cumulative + advance
            positions.append(page)
            pairrows.append(advance)
            cumrows.append(cumulative.copy())
            displacement.append(x2 - x1)
            cumdisplacement.append(x2 - boxes[0][0])

positions = np.asarray(positions)
pairrows = np.stack(pairrows)
cumrows = np.stack(cumrows)
displacement = np.asarray(displacement)
cumdisplacement = np.asarray(cumdisplacement)
cols = [i for i in range(59) if i != 29]

split_results = []
for parity in (0, 1):
    train = positions % 2 == parity
    model = np.zeros(59)
    model[cols] = np.linalg.lstsq(cumrows[train][:, cols], cumdisplacement[train], rcond=None)[0]
    residual = cumdisplacement[~train] - cumrows[~train] @ model
    split_results.append({
        "train_page_parity": parity,
        "train_positions": int(sum(train)),
        "heldout_positions": int(sum(~train)),
        "heldout_rmse_pixels": float(np.sqrt(np.mean(residual ** 2))),
        "heldout_max_abs_error_pixels": float(np.max(abs(residual))),
        "fitted_dot_advance_pixels": float(model[58]),
    })

shape_report = []
for rune, members in sorted(samples.items()):
    by_shape = defaultdict(list)
    for page, mask in members:
        by_shape[mask.shape].append(mask)
    most_common = max(by_shape.values(), key=len)
    masks = np.stack([mask.ravel() for mask in most_common]).astype("uint8")
    medoid = np.square(masks.astype(float) - masks.mean(axis=0)).sum(axis=1).argmin()
    fractions = np.mean(masks != masks[medoid], axis=1)
    shape_report.append({
        "rune": rune,
        "accepted": len(members),
        "modal_shape_count": len(most_common),
        "max_modal_shape_hamming_fraction": float(np.max(fractions)),
    })

assert len(pages) == 27
assert sum(x["accepted"] for x in shape_report) == 6870
assert len(positions) == 6171 and line_count == 290
assert max(x["max_modal_shape_hamming_fraction"] for x in shape_report) < .052
assert all(x["heldout_rmse_pixels"] < .70 for x in split_results)

print(json.dumps({
    "scope": "27 source physical pages, 29 GP classes, source image only",
    "glyphs_accepted_at_similarity_above_088": sum(x["accepted"] for x in shape_report),
    "ink_component_shape_gate": {
        "class_count": len(shape_report),
        "max_single_class_same_size_medoid_hamming_fraction": max(
            x["max_modal_shape_hamming_fraction"] for x in shape_report),
        "limitations": "Topological sameness and small edge variation do not exclude tiny stego marks or intentionally chosen raster phase.",
    },
    "whole_line_advance_position_holdout": {
        "number_of_lines": line_count,
        "disjoint_train_test_page_parities": split_results,
        "note": "Each heldout x position is relative to its line's first glyph, not fitted per test line.",
    },
    "result": "No clearly distinct GP29 font-outline variant; positions consistent with fixed glyph advances and visible dots. No plaintext or secret recovered.",
}, indent=2))
