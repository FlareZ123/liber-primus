"""Original-image SFT: does the 32 x 8 LP2 numeric table encode cell spacing?

Uses the three source JPEGs and existing base60 token transcription.
Requires Pillow and NumPy. No OCR, key search, or ciphertext tuning.
Run: python sims/lp2_numeric_grid_typographic_spacing_sft.py
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
ROWS = json.loads((SOURCE / "base60-grid.json").read_text(encoding="utf-8"))["rows"]
assert len(ROWS) == 32 and all(len(row) == 8 and all(len(t) == 2 for t in row) for row in ROWS)

# Original Stage11 images: p49=66.jpg, p50=67.jpg, p51=68.jpg.
PANELS = (("66.jpg", 0, 10, 1280), ("67.jpg", 10, 13, 660), ("68.jpg", 23, 9, 660))
ALPHABET = sorted(set("".join("".join(row) for row in ROWS)))
INDEX = {symbol: i for i, symbol in enumerate(ALPHABET)}
N = len(ALPHABET)
assert N == 59  # All numeral-alphabet characters except lowercase 'f'.

records = []
component_counts = []
intertoken_gaps = []
for filename, first_row, count, first_baseline in PANELS:
    source = np.asarray(Image.open(SOURCE / filename).convert("L"), dtype=np.uint8)
    assert source.shape == (3600, 2400)
    for local_row in range(count):
        row = first_row + local_row
        text = "".join(ROWS[row])
        mid = first_baseline + 179 * local_row
        visible = source[mid - 46 : mid + 46, 580:1810] < 120
        cols = np.any(visible, axis=0)
        left = np.flatnonzero(cols & ~np.r_[False, cols[:-1]])
        right = np.flatnonzero(cols & ~np.r_[cols[1:], False])
        runs = [(int(a + 580), int(b + 580))
                for a, b in zip(left, right) if b - a > 2]
        component_counts.append(len(runs))
        assert len(runs) == (15 if row == 23 else 16), (filename, row, runs)

        # Row 23 has one joined printed token '0J' at x=971..1043.
        # The space before/after this token remains measurable.
        if row == 23:
            assert text[4:6] == "0J" and runs[4] == (971, 1043)
            x = [r[0] for r in runs[:5]] + [None] + [r[0] for r in runs[5:]]
            words = [(runs[2*i], runs[2*i + 1]) for i in range(2)]
            words += [(runs[4], runs[4])]
            words += [(runs[2*i - 1], runs[2*i]) for i in range(3, 8)]
        else:
            x = [r[0] for r in runs]
            words = [(runs[2*i], runs[2*i + 1]) for i in range(8)]
        assert len(x) == len(text) == 16 and len(words) == 8

        for i in range(15):
            if x[i] is not None and x[i+1] is not None:
                records.append((row, i, text[i], text[i+1], x[i+1]-x[i]))
        intertoken_gaps.extend(words[i+1][0][0]-words[i][1][1]-1 for i in range(7))

assert component_counts.count(15) == 1 and component_counts.count(16) == 31
assert len(records) == 478 and len(intertoken_gaps) == 224

# Same proportional-font cursor model across all three original scans.
# A_{previous glyph}+B_{next glyph}+inter-token space+constant.
# Differences of consecutive glyph positions remove each row's alignment.
X = np.zeros((len(records), 2*N+2), dtype=float)
y = np.array([r[4] for r in records], dtype=float)
groups = np.array([r[0] for r in records])
for j, (_, k, prior, after, _) in enumerate(records):
    X[j, INDEX[prior]] = 1
    X[j, N+INDEX[after]] = 1
    X[j, -2] = k % 2  # one space between two-character cells
    X[j, -1] = 1

# Small ridge term removes linear dependence of glyph bearing parameters.
alpha = 0.001
def fit(train):
    observed = X[train]
    return np.linalg.solve(observed.T @ observed + alpha*np.eye(X.shape[1]),
                           observed.T @ y[train])

training_error = y - X @ fit(np.arange(len(records)))
heldout = np.zeros(len(records), dtype=float)
for row in np.unique(groups):
    train = np.flatnonzero(groups != row)
    test = np.flatnonzero(groups == row)
    heldout[test] = X[test] @ fit(train)
holdout_error = y - heldout

metrics = {
    "original_pages": 3,
    "printed_rows": 32,
    "printed_cells": 256,
    "visible_horizontal_character_runs": int(sum(component_counts)),
    "rows_with_one_touching_character_pair": 1,
    "intertoken_gaps": len(intertoken_gaps),
    "raw_gap_range_pixels": [int(min(intertoken_gaps)), int(max(intertoken_gaps))],
    "measured_adjacent_glyph_start_distances": len(records),
    "distinct_source_glyphs": N,
    "training_rmse_pixels": round(float(np.sqrt(np.mean(training_error**2))), 6),
    "training_max_absolute_residual_pixels": round(float(np.max(np.abs(training_error))), 6),
    "leave_one_printed_row_out_rmse_pixels": round(float(np.sqrt(np.mean(holdout_error**2))), 6),
    "leave_one_printed_row_out_mae_pixels": round(float(np.mean(np.abs(holdout_error))), 6),
}
print(json.dumps(metrics, indent=2))
assert metrics["training_max_absolute_residual_pixels"] < 1.8
assert metrics["leave_one_printed_row_out_rmse_pixels"] < 2.0
