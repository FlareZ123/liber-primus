"""Original LP2 JPEG subspace microspacing bit-channel gate.

Run: python sims/lp2_microspacing_innovation_sft.py

Requires NumPy, Pillow, OpenCV and the original 58 LP2 JPEGs. Reuses the
independent original glyph/font control and reads authentic images only.
No files are written, no ciphertext/plaintext or key is inferred.
"""
import json
from pathlib import Path
from runpy import run_path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
base = run_path(str(ROOT / "sims/lp2_original_rune_typography_sft.py"))
image = base["source_image"]
detect = base["detect"]
predict = base["predict"]
dots = base["visible_dots"]
types = base["types"]
templates = base["templates"]
holdout = base["HOLDOUT"]

# Original measured adjacent rune-ink left edges; every page/row is preserved.
# The already established glyph classifier is frozen by its original p32/p55
# training pages. Only gaps with both glyph similarities >=0.88 are retained.
records = []
for page in holdout:
    img = image(page)
    for row in range(12):
        boxes = detect(img, row)
        runes, confidence = predict(boxes, types, templates)
        for j in range(len(boxes) - 1):
            if min(confidence[j], confidence[j + 1]) < 0.88:
                continue
            left, right = boxes[j:j + 2]
            records.append((
                page, row, j,
                int(runes[j]), int(runes[j + 1]),
                dots(img, row, left[1], right[0]),
                right[0] - left[0],
            ))

assert len(records) == 6352, len(records)
# Font bearings: outgoing GP glyph (29 states), incoming GP glyph (29),
# and independently fitted 1-/2-/3-dot punctuation advances. Remove
# one additive gauge degree of freedom.
design = np.zeros((len(records), 62), dtype=float)
target = np.array([r[6] for r in records], dtype=float)
for i, (_, _, _, prev, curr, mark_count, _) in enumerate(records):
    design[i, prev] = 1
    design[i, 29 + curr] = 1
    if mark_count:
        assert mark_count in (1, 2, 3)
        design[i, 58 + mark_count] = 1
used = [k for k in range(62) if k != 29]
coeff = np.zeros(62)
coeff[used] = np.linalg.lstsq(design[:, used], target, rcond=None)[0]
residual = target - design @ coeff
assert abs(coeff[59] - 16.03599) < 0.0001

# Only consecutive, accepted gaps on the same original printed line can
# share the middle glyph's raster-quantization error.
pairs = np.array([
    (i, i + 1)
    for i in range(len(records) - 1)
    if records[i][:2] == records[i + 1][:2]
    and records[i + 1][2] == records[i][2] + 1
], dtype=int)
assert len(pairs) == 6034, len(pairs)


def innovation(values, accepted=None):
    """Residual variance plus twice consecutive-gap covariance.

    If a measured ink start X_i has source-coordinate rounding error E_i,
    its observed advance error is E_(i+1) - E_i + M_i. Under independent
    rounding and independent per-gap micro-mark M, this expression estimates
    Var(M), while cancelling the rounding term in expectation.
    """
    if accepted is None:
        accepted = np.ones(len(values), dtype=bool)
    relevant = pairs[accepted[pairs[:, 0]] & accepted[pairs[:, 1]]]
    first, second = values[relevant[:, 0]], values[relevant[:, 1]]
    variance = float(np.var(values[accepted]))
    covariance = float(np.mean((first - np.mean(first)) *
                               (second - np.mean(second))))
    return {"paired_gaps": int(len(relevant)), "variance_px2": variance,
            "lag1_covariance_px2": covariance,
            "innovation_px2": variance + 2 * covariance}


original = innovation(residual)
no_dots = innovation(
    residual, np.array([r[5] == 0 for r in records], dtype=bool)
)
assert abs(original["innovation_px2"] - 0.05544177582) < 1e-6
assert abs(no_dots["innovation_px2"] - 0.05216062655) < 1e-6
assert no_dots["paired_gaps"] == 3351

# Blind matched positive: append a 0/1-pixel bit to every gap BEFORE
# refitting the same font parameters. This planted watermark adds 0.25 px2
# of independent centered shift variance, as the test should detect.
rng = np.random.default_rng(3301)
positive_observed = target + rng.integers(0, 2, size=len(target))
pos_coeff = np.zeros(62)
pos_coeff[used] = np.linalg.lstsq(
    design[:, used], positive_observed, rcond=None
)[0]
positive = positive_observed - design @ pos_coeff
planted = innovation(positive)
assert abs(planted["innovation_px2"] - 0.29499061277) < 1e-6

# Conditional nonparametric confidence intervals: resample whole original
# printed lines, keeping each line's adjacent gap sequence together. The
# font model is frozen at the complete-sample fit; it is not refitted within
# each bootstrap resample. This assesses sampling variation rather than
# uncertainty about author intent or other hidden channels.
by_line = {}
for i, (page, row, *_rest) in enumerate(records):
    by_line.setdefault((page, row), []).append(i)
groups = [np.array(g, dtype=int) for g in by_line.values()]


def bootstrap_innovation(sample, source_pairs):
    var = float(np.var(sample))
    x = sample[source_pairs[:, 0]]
    y = sample[source_pairs[:, 1]]
    cov = float(np.mean((x - x.mean()) * (y - y.mean())))
    return var + 2 * cov


original_boot, planted_boot = [], []
for _ in range(2000):
    ids = rng.integers(0, len(groups), size=len(groups))
    original_parts = [residual[groups[j]] for j in ids]
    planted_parts = [positive[groups[j]] for j in ids]
    current = np.concatenate(original_parts)
    control = np.concatenate(planted_parts)
    connected = []
    offset = 0
    for group_id in ids:
        g = groups[group_id]
        for j in range(len(g) - 1):
            if records[g[j]][2] + 1 == records[g[j + 1]][2]:
                connected.append((offset + j, offset + j + 1))
        offset += len(g)
    ip = np.array(connected, dtype=int)
    original_boot.append(bootstrap_innovation(current, ip))
    planted_boot.append(bootstrap_innovation(control, ip))

ci = np.percentile(original_boot, [2.5, 50, 97.5])
pos_ci = np.percentile(planted_boot, [2.5, 50, 97.5])
gain_ci = np.percentile(np.array(planted_boot) - original_boot,
                        [2.5, 50, 97.5])
assert 0.045 < ci[0] < ci[2] < 0.065
assert 0.27 < pos_ci[0] < pos_ci[2] < 0.32

print(json.dumps({
    "sample": "25 independent original 2400x3600 LP2 JPEG pages",
    "total_high_confidence_gaps": len(records),
    "adjacent_paired_gaps": len(pairs),
    "punctuation_advance_px": coeff[59:62].tolist(),
    "original": original,
    "no_visible_punctuation": no_dots,
    "independent_one_pixel_fair_bit_positive_control": planted,
    "bootstrap_2000_original_innovation_95pct": [float(x) for x in ci],
    "bootstrap_2000_planted_innovation_95pct": [float(x) for x in pos_ci],
    "bootstrap_2000_control_minus_original_95pct": [float(x) for x in gain_ci],
    "decision": "Source gap variation is too small to support one independent balanced full-pixel bit per measured glyph advance under the fixed rounding/mark model. Sparse, correlated, subpixel or other physical channels remain possible. No plaintext/key recovered."
}, indent=2))
