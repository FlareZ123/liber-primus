"""Independent same-pair microspacing histogram and line-permutation companion.

Uses the established original-image whole-space SFT unchanged, avoiding a
duplicate glyph classifier. Requires Python 3, NumPy, Pillow, OpenCV.
Writes no files; all original inputs are repository-native source JPEGs.
"""
import json
from pathlib import Path
from runpy import run_path
from collections import Counter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
base = run_path(str(ROOT / "sims/lp2_original_rune_typography_sft.py"))
HOLDOUT = base["HOLDOUT"]
source_image = base["source_image"]
detect = base["detect"]
predict = base["predict"]
visible_dots = base["visible_dots"]
types = base["types"]
templates = base["templates"]
model = base["model"]

# Additional original-image test: microscopic (1-2 px) spacing variation.
# Reuse the independent 29-class glyph fit and previously checked whole-space
# positive controls above. This deliberately makes no plaintext inference.
from collections import defaultdict

extra = {}
for page in HOLDOUT:
    original = source_image(page)
    for row in range(12):
        boxes = detect(original, row)
        keys, confidence = predict(boxes, types, templates)
        for i in range(len(boxes) - 1):
            if min(confidence[i], confidence[i + 1]) < 0.88:
                continue
            left, right = boxes[i:i + 2]
            punctuation = visible_dots(original, row, left[1], right[0])
            dx = right[0] - left[0]
            expected = model[keys[i]] + model[29 + keys[i + 1]] + punctuation * model[58]
            extra[(page, row, i)] = (int(keys[i]), int(keys[i + 1]),
                                     punctuation, dx, float(dx - expected))

assert len(extra) == 6352
by_signature = defaultdict(list)
by_line = defaultdict(list)
for place, (a, b, dots, dx, residual) in extra.items():
    by_signature[(a, b, dots)].append(dx)
    by_line[place[:2]].append((place[2], residual))
repeated = [vals for vals in by_signature.values() if len(vals) >= 4]
mode_counts = Counter(len(set(vals)) for vals in repeated)
assert len(repeated) == 781
assert sum(map(len, repeated)) == 4944
assert dict(mode_counts) == {1: 154, 2: 523, 3: 104}

neighbor = np.array([
    (data[4], extra[(p, row, i + 1)][4])
    for (p, row, i), data in extra.items()
    if (p, row, i + 1) in extra
], dtype=float)
assert len(neighbor) == 6034
observed_corr = float(np.corrcoef(neighbor.T)[0, 1])

# A frozen per-line permutation destroys the original physical adjacency
# but preserves each line's error histogram, all confidence filtering and
# all page/row residual differences. Gaps caused by rejected glyph pairs
# remain missing in this control; they are not silently bridged.
line_maps = {}
for key, entries in by_line.items():
    line_maps[key] = dict(entries)
rng = np.random.default_rng(3301)
shuffled = []
for _ in range(1000):
    control_pairs = []
    for _, entries in sorted(line_maps.items()):
        positions = sorted(entries)
        shuffled_vals = rng.permutation([entries[pos] for pos in positions])
        remapped = dict(zip(positions, shuffled_vals))
        control_pairs.extend((remapped[pos], remapped[pos + 1])
                             for pos in positions if pos + 1 in remapped)
    control_pairs = np.asarray(control_pairs, dtype=float)
    shuffled.append(float(np.corrcoef(control_pairs.T)[0, 1]))
assert observed_corr < min(shuffled), (observed_corr, min(shuffled))

line_drifts = [abs(sum(row.values())) for row in line_maps.values()]
print(json.dumps({
    "hypothesis": "one-pixel-scale hidden positional bits in rune advances",
    "original_holdout_pages": HOLDOUT,
    "train_glyphs": 197,
    "matched_holdout_gaps": len(extra),
    "repeated_transition_classes_nge4": len(repeated),
    "repeated_transition_samples": sum(map(len, repeated)),
    "number_distinct_integer_advances_by_pair_class": dict(sorted(mode_counts.items())),
    "physically_adjacent_highconfidence_residual_pairs": len(neighbor),
    "observed_lag1_residual_corr": observed_corr,
    "line_stratified_permutation_trials": len(shuffled),
    "permutation_corr_median": float(np.median(shuffled)),
    "permutation_corr_min": min(shuffled),
    "permutation_corr_max": max(shuffled),
    "two_sided_permutation_p_upper_bound": 1 / (len(shuffled) + 1),
    "absolute_residual_sum_per_line_median_pixels": float(np.median(line_drifts)),
    "absolute_residual_sum_per_line_90pct_pixels": float(np.percentile(line_drifts, 90)),
    "absolute_residual_sum_per_line_max_pixels": max(line_drifts),
    "conclusion": "Small gaps consistent with shared-position rounding; no source-selected bit rule, ciphertext key or plaintext"
}, indent=2))
