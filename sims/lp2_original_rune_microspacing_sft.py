"""Original LP2 JPEG ink advances and visible punctuation; extended microspacing test.

Requires Python 3, NumPy, Pillow and OpenCV. Reads original repo files; writes nothing.
"""
from collections import Counter
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
TRAIN_LAYOUT = {32: [25, 23, 23, 21, 22, 7], 55: [24, 22, 22, 8]}
HOLDOUT = [1, 5, 9, 11, 12, 13, 16, 17, 18, 19, 20, 24, 25, 26, 28, 29,
           30, 31, 34, 44, 45, 46, 47, 48, 52]


def source_image(page):
    path = ROOT / "resources/liber-primus" / f"{page + 17}.jpg"
    return np.array(Image.open(path).convert("L"))


def detect(source, row, xmax=1810):
    """Read full-height glyph components, excluding small separator marks."""
    y0 = 673 + 188 * row
    image = source[y0 - 10:y0 + 125, 590:xmax] < 155
    columns = np.flatnonzero(image.sum(axis=0) >= 2)
    if not len(columns):
        return []
    components = np.split(columns, np.where(np.diff(columns) > 1)[0] + 1)
    result = []
    for component in components:
        if not len(component):
            continue
        yy = np.flatnonzero(image[:, component].any(axis=1))
        if not len(yy) or yy[-1] - yy[0] + 1 < 93:
            continue
        left = int(component[0]) + 590
        right = int(component[-1]) + 590
        glyph = image[yy[0]:yy[-1] + 1,
                      component[0]:component[-1] + 1].astype("uint8")
        feature = cv2.resize(glyph, (48, 96), interpolation=cv2.INTER_LINEAR)
        feature = feature.ravel().astype("float32")
        feature /= np.linalg.norm(feature)
        result.append((left, right, feature))
    return result


def visible_dots(source, row, x1, x2):
    y0 = 673 + 188 * row
    image = source[y0 - 10:y0 + 125, x1 + 1:x2] < 155
    if not image.shape[1]:
        return 0
    columns = np.flatnonzero(image.sum(axis=0) >= 2)
    if not len(columns):
        return 0
    return 1 + int(np.sum(np.diff(columns) > 1))


def prototypes(features, labels):
    types = np.unique(labels)
    values = np.stack([features[labels == k].mean(axis=0) for k in types])
    values /= np.linalg.norm(values, axis=1, keepdims=True)
    return types, values


def predict(boxes, types, templates):
    if not boxes:
        return np.empty(0, dtype=int), np.empty(0)
    similarities = np.stack([b[2] for b in boxes]) @ templates.T
    chosen = similarities.argmax(axis=1)
    return types[chosen], similarities[np.arange(len(chosen)), chosen]


images = {p: source_image(p) for p in TRAIN_LAYOUT}
training_lines = []
for page, counts in TRAIN_LAYOUT.items():
    reference = CORPUS["pages"][page]["indices"]
    offset = 0
    for row, count in enumerate(counts):
        xmax = 1032 if page == 55 and row == 3 else 1810
        boxes = detect(images[page], row, xmax)
        assert len(boxes) == count, (page, row, len(boxes), count)
        keys = reference[offset:offset + count]
        assert len(keys) == count
        training_lines.append((page, row, boxes, keys))
        offset += count
    assert offset == len(reference)

features = np.stack([b[2] for _, _, boxes, _ in training_lines for b in boxes])
labels = np.array([k for _, _, _, ks in training_lines for k in ks])
origins = np.array([p for p, _, boxes, _ in training_lines for _ in boxes])
assert len(features) == 197 and len(np.unique(labels)) == 29

cross_validation = {}
for page in TRAIN_LAYOUT:
    types, templates = prototypes(features[origins != page], labels[origins != page])
    target = labels[origins == page]
    eligible = np.isin(target, types)
    guesses = types[(features[origins == page] @ templates.T).argmax(axis=1)]
    correct = int(np.sum((guesses == target) & eligible))
    assert correct == int(np.sum(eligible))
    cross_validation[page] = {"eligible": int(np.sum(eligible)), "correct": correct}

types, templates = prototypes(features, labels)
training_pairs = []
for page, row, boxes, keys in training_lines:
    for i in range(len(boxes) - 1):
        left, right = boxes[i:i + 2]
        dots = visible_dots(images[page], row, left[1], right[0])
        training_pairs.append((keys[i], keys[i + 1], dots, right[0] - left[0]))

# Font ink-start increment = outgoing-rune bearing + incoming-rune bearing
#                           + dot count * one common punctuation advance.
# Fix the additive gauge by constraining incoming GP index 0 to zero.
design = np.zeros((len(training_pairs), 59))
target = np.array([item[3] for item in training_pairs], dtype=float)
for i, (before, after, dots, _) in enumerate(training_pairs):
    design[i, before] = 1
    design[i, 29 + after] = 1
    design[i, 58] = dots
columns = [k for k in range(59) if k != 29]
fit, _, rank, _ = np.linalg.lstsq(design[:, columns], target, rcond=None)
model = np.zeros(59)
model[columns] = fit
assert rank == 58
train_error = target - design @ model

counts = Counter()
errors = []
exact_pages = []
for page in HOLDOUT:
    original = source_image(page)
    lines = [detect(original, row) for row in range(12)]
    predicted = []
    for row, boxes in enumerate(lines):
        runes, confidence = predict(boxes, types, templates)
        predicted.extend(runes.tolist())
        counts["glyphs"] += len(boxes)
        for i in range(len(boxes) - 1):
            if min(confidence[i], confidence[i + 1]) < 0.88:
                continue
            left, right = boxes[i:i + 2]
            dots = visible_dots(original, row, left[1], right[0])
            dx = right[0] - left[0]
            expected = model[runes[i]] + model[29 + runes[i + 1]]
            derived_dots = int(round((dx - expected) / model[58]))
            if derived_dots != dots:
                counts["unmarked_gap_disagreements"] += 1
            counts[f"visible_dots_{dots}"] += 1
            errors.append(abs(dx - expected - dots * model[58]))
    source_indices = CORPUS["pages"][page]["indices"]
    if len(predicted) == len(source_indices):
        assert predicted == source_indices, f"Source glyph mismatch on page {page}"
        exact_pages.append(page)

assert counts["glyphs"] == 6696, counts
assert len(errors) == 6352, len(errors)
assert counts["unmarked_gap_disagreements"] == 0, counts
assert len(exact_pages) == 12, exact_pages
assert sum(e <= 2 for e in errors) == 6343

summary = {
    "source": "Original JPEG files 17.jpg-74.jpg at native 2400x3600 resolution",
    "train_pages": list(TRAIN_LAYOUT),
    "train_glyphs": len(features),
    "train_fit_rank": int(rank),
    "train_residual_rmse_px": float(np.sqrt(np.mean(train_error ** 2))),
    "punctuation_dot_advance_px": float(model[58]),
    "cross_page_control": cross_validation,
    "heldout_pages": HOLDOUT,
    "heldout_glyph_components": counts["glyphs"],
    "heldout_adjacent_glyph_pairs": len(errors),
    "full_pages_with_exact_source_rune_readback": exact_pages,
    "visible_dot_counts": {k: counts[f"visible_dots_{k}"] for k in range(4)},
    "invisible_extra_space_count": counts["unmarked_gap_disagreements"],
    "heldout_mean_absolute_error_px": float(np.mean(errors)),
    "heldout_root_mean_square_error_px": float(np.sqrt(np.mean(np.square(errors)))),
    "heldout_max_absolute_error_px": float(max(errors)),
    "heldout_errors_at_most_2px": int(sum(e <= 2 for e in errors)),
    "scope": "Fixed-geometry ink advances in 25 clean, twelve-line pages only"
}
print(json.dumps(summary, indent=2))


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
