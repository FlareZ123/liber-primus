#!/usr/bin/env python3
"""Independent LP2 source-rune assignment audit.

The image row registration uses only row geometry and per-line rune counts.
Rune labels are assigned by nearest-neighbour comparison with the p43 image
templates. Solved p56/p57 body text is held out as a control. No language model
or language scoring is used.

Run from the repository root:
    python sims/lp2_full_source_rune_assignment_audit.py

Optional:
    --archive /path/to/liber-primus-jpegs.zip
    --json /path/to/report.json
"""
from __future__ import annotations

import argparse
import json
import re
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
TRANSLIT = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
            "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
            "A", "AE", "Y", "IA", "EA"]
RUNE_INDEX = {r: i for i, r in enumerate(RUNES)}
MANUAL_SPLITS = {
    # Cuts are measured from the connected-component crop, left to right.
    # p2's thin infinity illustration crosses the top of a three-rune cluster;
    # trim its upper 33 px before splitting the visible H,B,M glyph bodies.
    (2, 0): {"component": 9, "cuts": [47, 86], "trim_top": 33, "expected": "ᚻᛒᛗ"},
    # Clear vertical valleys split the touching C,B and C,TH pairs.
    (20, 9): {"component": 13, "cuts": [50], "trim_top": 0, "expected": "ᚳᛒ"},
    (25, 9): {"component": 18, "cuts": [50], "trim_top": 0, "expected": "ᚳᚦ"},
}
SPECIAL_ARTISTIC_LINES = {
    (39, 5): "Five enlarged black glyphs immediately precede a three-rune red span and red 13-dot mark; template disagreements here are separately annotated, not transcription corrections."
}


def parse_unknown_lines(path: Path) -> dict[int, list[list[int]]]:
    raw = path.read_text(encoding="utf-8")
    parts = raw.split("%")[:55]
    pages: dict[int, list[list[int]]] = {}
    for k, part in enumerate(parts):
        page = k + (1 if k >= 50 else 0)  # LP2 page 50 is the omitted grid.
        lines = []
        for segment in part.split("/"):
            line = [RUNE_INDEX[c] for c in segment if c in RUNE_INDEX]
            if line:
                lines.append(line)
        pages[page] = lines
    return pages


def parse_solved_lines(path: Path) -> dict[int, list[list[int]]]:
    raw = path.read_text(encoding="utf-8")
    p56 = raw.split("%56", 1)[1].split("%57", 1)[0]
    p57 = raw.split("%57", 1)[1].split("%", 1)[0]
    out = {}
    for page, section in ((56, p56), (57, p57)):
        lines = []
        for text_line in section.splitlines():
            line = [RUNE_INDEX[c] for c in text_line if c in RUNE_INDEX]
            if line:
                lines.append(line)
        out[page] = lines
    return out


class ImageSource:
    def __init__(self, root: Path, archive: Path | None):
        self.root = root
        self.archive = zipfile.ZipFile(archive) if archive else None

    def gray(self, page: int) -> np.ndarray:
        name = f"{page + 17:02d}.jpg"
        if self.archive:
            data = self.archive.read(f"liber-primus-jpegs/{name}")
            from io import BytesIO
            return np.asarray(Image.open(BytesIO(data)).convert("L"))
        return np.asarray(Image.open(self.root / "resources" / "liber-primus" / name).convert("L"))


def row_centers(gray: np.ndarray) -> list[int]:
    projection = (gray[:, 595:1800] < 160).sum(axis=1)
    peaks, _ = find_peaks(
        gaussian_filter1d(projection.astype(float), sigma=5),
        prominence=40,
        distance=100,
    )
    return [int(y) for y in peaks if 450 < y < 3150]


def segment_at_center(gray: np.ndarray, center: int):
    x0, x1 = 530, 1880
    y0, y1 = max(0, center - 60), min(gray.shape[0], center + 65)
    ink = gray[y0:y1, x0:x1] < 110
    xs = np.flatnonzero(ink.sum(axis=0) >= 2)
    runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
    row = []
    for run in runs:
        if not run.size:
            continue
        left, right = int(run[0]), int(run[-1]) + 1
        area = np.argwhere(ink[:, left:right])
        if len(area) < 100 or np.ptp(area[:, 0]) < 32:
            continue
        start = left + x0
        if not (595 <= start <= 1800) or np.ptp(area[:, 0]) + 1 < 70:
            continue
        crop = ink[:, left:right]
        yy, xx = np.where(crop)
        crop = crop[yy.min():yy.max() + 1, xx.min():xx.max() + 1].astype(np.uint8)
        box = (start, y0 + int(yy.min()), x0 + right, y0 + int(yy.max()) + 1)
        row.append((crop, box))
    return row


def get_rows(source: ImageSource, page: int):
    gray = source.gray(page)
    centers = row_centers(gray)
    return gray, centers, [segment_at_center(gray, y) for y in centers]


def align_lines(expected_lengths, detected_counts, skip_cost=2.0, max_diff=5):
    """Monotonic line-to-row registration; count ties are reported."""
    n, m = len(expected_lengths), len(detected_counts)
    inf = 1e12
    dp = [[inf] * (m + 1) for _ in range(n + 1)]
    ways = [[0] * (m + 1) for _ in range(n + 1)]
    back = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0], ways[0][0] = 0.0, 1
    for i in range(n + 1):
        for j in range(m + 1):
            cur = dp[i][j]
            if cur >= inf:
                continue
            transitions = []
            if j < m:
                transitions.append((i, j + 1, skip_cost, "skip"))
            if i < n and j < m:
                diff = abs(expected_lengths[i] - detected_counts[j])
                if diff <= max_diff:
                    transitions.append((i + 1, j + 1, float(diff), "match"))
            for ni, nj, cost, action in transitions:
                value = cur + cost
                if value < dp[ni][nj] - 1e-9:
                    dp[ni][nj] = value
                    ways[ni][nj] = ways[i][j]
                    back[ni][nj] = (i, j, action)
                elif abs(value - dp[ni][nj]) < 1e-9:
                    ways[ni][nj] = min(1000, ways[ni][nj] + ways[i][j])
    best, best_j, nways = inf, None, 0
    for j in range(m + 1):
        value = dp[n][j] + (m - j) * skip_cost
        if value < best - 1e-9:
            best, best_j, nways = value, j, ways[n][j]
        elif abs(value - best) < 1e-9:
            nways = min(1000, nways + ways[n][j])
    if best_j is None or best >= inf:
        return None
    i, j = n, best_j
    mapping, skipped = [None] * n, list(range(best_j, m))
    while i > 0 or j > 0:
        item = back[i][j]
        if item is None:
            break
        pi, pj, action = item
        if action == "match":
            mapping[i - 1] = j - 1
        else:
            skipped.append(j - 1)
        i, j = pi, pj
    if any(x is None for x in mapping):
        return None
    return mapping, sorted(set(skipped)), float(best), int(nways)


def feature(glyph: np.ndarray) -> np.ndarray:
    """The original source-readback representation: top-left 100x100, BOX 50x50."""
    glyph = np.asarray(glyph).astype(np.uint8)
    ys, xs = np.where(glyph)
    canvas = np.zeros((100, 100), dtype=np.uint8)
    if len(xs):
        crop = glyph[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        h, w = crop.shape
        canvas[:min(h, 100), :min(w, 100)] = crop[:100, :100] * 255
    reduced = Image.fromarray(canvas).resize((50, 50), resample=Image.Resampling.BOX)
    return np.asarray(reduced, dtype=np.float32).ravel() / 255.0


class NearestTemplates:
    def __init__(self, crops, labels):
        self.labels = np.asarray(labels, dtype=np.int16)
        self.features = np.stack([feature(c) for c in crops])

    def distances(self, crop):
        x = feature(crop)
        d = np.sum((self.features - x) ** 2, axis=1)
        return np.asarray([d[self.labels == c].min() for c in range(29)])

    def classify(self, crop):
        x = feature(crop)
        d = np.sum((self.features - x) ** 2, axis=1)
        order = np.argsort(d)
        return int(self.labels[order[0]]), float(d[order[0]]), int(self.labels[order[1]]), float(d[order[1]])

    def leave_one_out(self, crops):
        correct = 0
        for i, crop in enumerate(crops):
            x = feature(crop)
            d = np.sum((self.features - x) ** 2, axis=1)
            d[i] = np.inf
            correct += int(self.labels[int(np.argmin(d))] == self.labels[i])
        return correct, len(crops)


def merge_components(gray, row, start, count):
    boxes = [row[i][1] for i in range(start, start + count)]
    x0 = min(b[0] for b in boxes)
    x1 = max(b[2] for b in boxes)
    y0 = max(0, min(b[1] for b in boxes) - 15)
    y1 = min(gray.shape[0], max(b[3] for b in boxes) + 32)
    ink = (gray[y0:y1, x0:x1] < 110).astype(np.uint8)
    yy, xx = np.where(ink)
    crop = ink[yy.min():yy.max() + 1, xx.min():xx.max() + 1]
    box = (x0 + int(xx.min()), y0 + int(yy.min()), x0 + int(xx.max()) + 1, y0 + int(yy.max()) + 1)
    return crop, box


def split_component(entry, cuts, trim_top=0):
    crop, box = entry
    x0, y0, _, _ = box
    crop = crop[trim_top:, :]
    y0 += trim_top
    boundaries = [0] + list(cuts) + [crop.shape[1]]
    parts = []
    for a, b in zip(boundaries, boundaries[1:]):
        part = crop[:, a:b]
        yy, xx = np.where(part)
        if len(xx):
            tight = part[yy.min():yy.max() + 1, xx.min():xx.max() + 1]
            new_box = (x0 + a + int(xx.min()), y0 + int(yy.min()),
                       x0 + a + int(xx.max()) + 1, y0 + int(yy.max()) + 1)
            parts.append((tight, new_box))
    return parts


def apply_manual_splits(page, line_index, row):
    row = list(row)
    spec = MANUAL_SPLITS.get((page, line_index))
    if spec is None:
        return row
    component_index = spec["component"]
    if component_index >= len(row):
        return row
    row[component_index:component_index + 1] = split_component(
        row[component_index], spec["cuts"], spec.get("trim_top", 0))
    return row


def segment_row_dp(gray, row, target_count, templates, skip_threshold=40.0,
                   merge_penalty=5.0, max_group=3):
    """Choose target_count glyph groups; skip outliers, or merge touching pieces."""
    m, n = len(row), target_count
    cache = {}

    def candidate(i, g):
        key = (i, g)
        if key not in cache:
            crop = row[i][0] if g == 1 else merge_components(gray, row, i, g)[0]
            cache[key] = (crop, *templates.classify(crop))
        return cache[key]

    inf = 1e18
    dp = [[inf] * (n + 1) for _ in range(m + 1)]
    back = [[None] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = 0.0
    for i in range(m + 1):
        for j in range(n + 1):
            cur = dp[i][j]
            if cur >= inf:
                continue
            if i < m:
                _, _, dist, _, _ = candidate(i, 1)
                skip = 5.0 + max(0.0, skip_threshold - dist)
                if cur + skip < dp[i + 1][j]:
                    dp[i + 1][j] = cur + skip
                    back[i + 1][j] = (i, j, "skip", 1)
            if i < m and j < n:
                for g in range(1, min(max_group, m - i) + 1):
                    _, pred, dist, _, _ = candidate(i, g)
                    cost = dist + merge_penalty * (g - 1)
                    if cur + cost < dp[i + g][j + 1]:
                        dp[i + g][j + 1] = cur + cost
                        back[i + g][j + 1] = (i, j, "group", g)
    if dp[m][n] >= inf:
        return None
    i, j = m, n
    groups, skipped = [], []
    while i > 0 or j > 0:
        item = back[i][j]
        if item is None:
            return None
        pi, pj, action, g = item
        if action == "skip":
            skipped.append(pi)
        else:
            crop, pred, dist, second, dist2 = candidate(pi, g)
            boxes = [row[k][1] for k in range(pi, pi + g)]
            box = (min(b[0] for b in boxes), min(b[1] for b in boxes),
                   max(b[2] for b in boxes), max(b[3] for b in boxes))
            groups.append({"start": pi, "end": pi + g, "crop": crop, "box": box,
                           "pred": pred, "dist": dist, "second": second, "dist2": dist2})
        i, j = pi, pj
    return list(reversed(groups)), sorted(skipped), float(dp[m][n])


def optional_hog(crops, labels, control_crops, control_labels):
    try:
        from skimage.feature import hog
        from sklearn.model_selection import LeaveOneOut, cross_val_predict
        from sklearn.pipeline import make_pipeline
        from sklearn.preprocessing import StandardScaler
        from sklearn.svm import SVC
    except ImportError:
        return None

    def hog_feature(glyph):
        arr = np.asarray(glyph).astype(np.uint8)
        ys, xs = np.where(arr)
        canvas = np.zeros((100, 100), dtype=np.uint8)
        if len(xs):
            g = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            h, w = g.shape
            scale = min(1.0, 100 / h, 100 / w)
            if scale < 1:
                nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
                g = np.asarray(Image.fromarray(g * 255).resize((nw, nh), Image.Resampling.BOX)) > 0
                g = g.astype(np.uint8)
                h, w = g.shape
            canvas[:h, :w] = g
        return hog(canvas, orientations=9, pixels_per_cell=(10, 10),
                   cells_per_block=(2, 2), block_norm="L2-Hys", feature_vector=True)

    x = np.stack([hog_feature(c) for c in crops])
    y = np.asarray(labels)
    model = make_pipeline(StandardScaler(), SVC(C=10, kernel="rbf", gamma="scale"))
    loo = cross_val_predict(model, x, y, cv=LeaveOneOut())
    model.fit(x, y)
    ctrl = model.predict(np.stack([hog_feature(c) for c in control_crops]))
    return {"p43_loo_correct": int(np.sum(loo == y)), "p43_loo_total": len(y),
            "control_correct": int(np.sum(ctrl == np.asarray(control_labels))),
            "control_total": len(control_labels), "model": model, "feature": hog_feature}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--json", type=Path, default=ROOT / "im-results" / "lp2-full-source-rune-assignment-audit.json")
    args = parser.parse_args()

    unknown = parse_unknown_lines(args.root / "resources" / "lp2-transcription.txt")
    corpus = json.loads((args.root / "resources" / "liber-primus" / "lp2-corpus.json").read_text(encoding="utf-8"))
    corpus_pages = {int(p["page"]): p["indices"] for p in corpus["pages"]}
    for page, lines in unknown.items():
        assert [v for line in lines for v in line] == corpus_pages[page], f"transcription/corpus mismatch on page {page}"
    total_positions = sum(len(line) for lines in unknown.values() for line in lines)
    assert total_positions == 12956, total_positions

    ink = json.loads((args.root / "resources" / "liber-primus" / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    red_spans_by_page = {int(p["page"]): p.get("red_spans", []) for p in ink["pages"]}
    line_offsets = {}
    for page, lines in unknown.items():
        offsets, cursor = [], 0
        for line in lines:
            offsets.append(cursor)
            cursor += len(line)
        line_offsets[page] = offsets
    red_runes_in_unknown_pages = sum(
        span["length"] for p in ink["pages"] if int(p["page"]) in unknown
        for span in p.get("red_spans", [])
    )

    source = ImageSource(args.root, args.archive)

    # p43 is the source template page; its 274 crops are line-registered exactly.
    p43_lines = unknown[43]
    gray43, centers43, rows43 = get_rows(source, 43)
    p43_alignment = align_lines([len(x) for x in p43_lines], [len(x) for x in rows43])
    assert p43_alignment is not None
    map43, skipped43, _, ways43 = p43_alignment
    assert not skipped43 and all(len(rows43[map43[i]]) == len(p43_lines[i]) for i in range(len(p43_lines)))
    train_crops, train_labels = [], []
    for i, line in enumerate(p43_lines):
        train_crops.extend(crop for crop, _ in rows43[map43[i]])
        train_labels.extend(line)
    templates = NearestTemplates(train_crops, train_labels)
    p43_loo = templates.leave_one_out(train_crops)

    # Solved p56/p57 controls. Their first visual lines are known red GP rune
    # spans ("AN END" and "PARABLE"), not Latin titles; retain them as red controls.
    solved = parse_solved_lines(args.root / "resources" / "external" / "Liber Primus 57.txt")
    control_crops, control_labels = [], []
    control_results = []
    for page, lines in solved.items():
        gray, centers, rows = get_rows(source, page)
        alignment = align_lines([len(x) for x in lines], [len(x) for x in rows])
        assert alignment is not None
        mapping, skipped_rows, _, ways = alignment
        for li, line in enumerate(lines):
            row = rows[mapping[li]]
            result = segment_row_dp(gray, row, len(line), templates)
            assert result is not None
            groups, skipped_components, _ = result
            predicted = [g["pred"] for g in groups]
            control_results.append({"page": page, "line": li, "ink": "red" if li == 0 else "black",
                                    "expected": len(line), "predicted": len(predicted),
                                    "correct": sum(a == b for a, b in zip(line, predicted)),
                                    "skipped_components": skipped_components})
            control_crops.extend(g["crop"] for g in groups)
            control_labels.extend(line)
    control_correct = sum(r["correct"] for r in control_results)
    control_total = len(control_labels)
    red_control_results = [r for r in control_results if r["ink"] == "red"]
    black_control_results = [r for r in control_results if r["ink"] == "black"]
    red_control_correct = sum(r["correct"] for r in red_control_results)
    red_control_total = sum(r["expected"] for r in red_control_results)
    black_control_correct = sum(r["correct"] for r in black_control_results)
    black_control_total = sum(r["expected"] for r in black_control_results)
    control_class_indices = set(control_labels)
    missing_control_classes = [TRANSLIT[i] for i in range(29) if i not in control_class_indices]

    # Optional second feature family (HOG/SVM), independently trained on p43.
    hog_result = optional_hog(train_crops, train_labels, control_crops, control_labels)
    if hog_result:
        hog_model, hog_feature = hog_result.pop("model"), hog_result.pop("feature")
    else:
        hog_model = hog_feature = None

    page_results = []
    mismatch_records = []
    unresolved = []
    exact_nodrop_positions = exact_nodrop_correct = exact_nodrop_mismatch = 0
    classified_positions = 0
    unmapped_observed_components = 0
    for page, lines in unknown.items():
        gray, centers, rows = get_rows(source, page)
        alignment = align_lines([len(x) for x in lines], [len(x) for x in rows])
        if alignment is None:
            unresolved.append({"page": page, "reason": "no monotonic line mapping"})
            continue
        mapping, skipped_rows, map_cost, map_ways = alignment
        page_record = {"page": page, "mapping_ways": map_ways, "mapping_cost": map_cost,
                       "skipped_rows": skipped_rows, "lines": []}
        for li, expected in enumerate(lines):
            row = apply_manual_splits(page, li, rows[mapping[li]])
            if len(row) < len(expected):
                observed = []
                for crop, box in row:
                    pred, dist, second, dist2 = templates.classify(crop)
                    observed.append({"box": box, "nearest": TRANSLIT[pred], "distance": dist})
                unmapped_observed_components += len(row)
                unresolved.append({"page": page, "line": li, "expected": len(expected),
                                   "detected": len(row), "missing": len(expected) - len(row),
                                   "page_local_start": line_offsets[page][li],
                                   "expected_runes": "".join(RUNES[v] for v in expected),
                                   "observed_components": observed})
                page_record["lines"].append({"line": li, "expected": len(expected),
                                             "detected": len(row), "status": "undercount",
                                             "observed_components": observed})
                continue
            result = segment_row_dp(gray, row, len(expected), templates)
            if result is None:
                unresolved.append({"page": page, "line": li, "reason": "glyph segmentation DP failed"})
                continue
            groups, skipped_components, seg_cost = result
            predicted = [g["pred"] for g in groups]
            classified_positions += len(groups)
            line_mismatches = []
            for pos, (want, got, group) in enumerate(zip(expected, predicted, groups)):
                hog_pred = int(hog_model.predict(np.asarray([hog_feature(group["crop"])]))[0]) if hog_model else None
                if want != got:
                    d = templates.distances(group["crop"])
                    page_local_offset = line_offsets[page][li] + pos
                    red_spans = red_spans_by_page.get(page, [])
                    red_span_index = next((j for j, span in enumerate(red_spans)
                                           if span["start"] <= page_local_offset < span["start"] + span["length"]), None)
                    red_span = red_spans[red_span_index] if red_span_index is not None else None
                    special_note = SPECIAL_ARTISTIC_LINES.get((page, li))
                    item = {"page": page, "line": li, "position": pos,
                            "page_local_offset": page_local_offset,
                            "is_red": red_span is not None,
                            "is_special_artistic_line": special_note is not None,
                            "special_artistic_note": special_note,
                            "is_red_initial": bool(red_span is not None and page_local_offset == red_span["start"]),
                            "red_span_index": red_span_index,
                            "red_span_start": red_span["start"] if red_span is not None else None,
                            "red_span_offset": page_local_offset - red_span["start"] if red_span is not None else None,
                            "red_span_length": red_span["length"] if red_span is not None else None,
                            "box": group["box"],
                            "expected_index": want, "expected": TRANSLIT[want],
                            "nearest_index": got, "nearest": TRANSLIT[got],
                            "nearest_distance": group["dist"],
                            "expected_distance": float(d[want]),
                            "margin": float(d[want] - d[got]),
                            "hog": TRANSLIT[hog_pred] if hog_pred is not None else None,
                            "component_span": [group["start"], group["end"]]}
                    mismatch_records.append(item)
                    line_mismatches.append(item)
            no_drops = not skipped_components and all(g["end"] - g["start"] == 1 for g in groups)
            if page != 43 and len(row) == len(expected) and no_drops:
                exact_nodrop_positions += len(expected)
                exact_nodrop_mismatch += len(line_mismatches)
                exact_nodrop_correct += len(expected) - len(line_mismatches)
            page_record["lines"].append({
                "line": li, "expected": len(expected), "detected": len(row),
                "skipped_components": skipped_components, "segmentation_cost": seg_cost,
                "mismatches": line_mismatches,
                "status": "audited" if not line_mismatches else "candidate_disagreement",
            })
        page_results.append(page_record)

    # Exact-count/no-drop metrics above exclude p43, which supplied the templates.
    heldout_exact_positions = exact_nodrop_positions
    heldout_exact_mismatches = exact_nodrop_mismatch
    heldout_exact_correct = heldout_exact_positions - heldout_exact_mismatches
    heldout_mismatch_records = [m for m in mismatch_records if m["page"] != 43]
    red_mismatch_records = [m for m in heldout_mismatch_records if m["is_red"]]
    black_mismatch_records = [m for m in heldout_mismatch_records if not m["is_red"]]
    red_initial_mismatch_records = [m for m in heldout_mismatch_records if m["is_red_initial"]]
    special_artistic_mismatch_records = [m for m in heldout_mismatch_records if m["is_special_artistic_line"]]
    high_confidence = [m for m in mismatch_records
                       if m["page"] == 0 and m["line"] == 0 and m["position"] in (9, 10, 11, 12)]
    report = {
        "method": {
            "row_projection": "gray<160 over x=595:1800; Gaussian sigma=5; peak prominence=40; distance=100",
            "glyph_components": "gray<110; y=center-60:center+65; x=530:1880; x-run gaps>1; area>=100; height>=70",
            "line_registration": "monotonic DP; match cost=absolute row-count difference (max 5); skipped-row cost=2",
            "glyph_assignment": "nearest p43 line-level template in 100x100 top-left canvas, BOX-resized to 50x50",
            "component_segmentation": "DP to expected line count; skip penalty=5+max(0,40-nearest-distance); merge penalty=5",
            "manual_splits": [{"page": page, "line": line, **spec}
                              for (page, line), spec in sorted(MANUAL_SPLITS.items())],
            "special_artistic_lines": [{"page": page, "line": line, "note": note}
                                       for (page, line), note in sorted(SPECIAL_ARTISTIC_LINES.items())],
            "language_scoring": False,
        },
        "totals": {
            "unknown_pages": len(unknown), "source_lines": sum(map(len, unknown.values())),
            "expected_positions": total_positions,
            "p43_training_positions": len(train_labels),
            "heldout_positions": total_positions - len(train_labels),
            "position_aligned_classifications_including_p43": classified_positions,
            "position_aligned_classifications_heldout": classified_positions - len(train_labels),
            "unmapped_observed_components": unmapped_observed_components,
            "unresolved_expected_positions": total_positions - classified_positions,
            "undercount_missing_positions": sum(x.get("missing", 0) for x in unresolved),
            "expected_positions_in_unresolved_rows": sum(x.get("expected", 0) for x in unresolved),
            "red_runes_in_unknown_pages": red_runes_in_unknown_pages,
            "nearest_neighbor_mismatches_including_p43": len(mismatch_records),
            "nearest_neighbor_matches_including_p43": classified_positions - len(mismatch_records),
            "nearest_neighbor_mismatches_heldout": len(heldout_mismatch_records),
            "red_mismatches_heldout": len(red_mismatch_records),
            "black_mismatches_heldout": len(black_mismatch_records),
            "red_initial_mismatches_heldout": len(red_initial_mismatch_records),
            "special_artistic_line_mismatches_heldout": len(special_artistic_mismatch_records),
            "nearest_neighbor_matches_heldout": classified_positions - len(train_labels) - len(heldout_mismatch_records),
            "exact_count_no_drop_positions_including_p43": exact_nodrop_positions + len(train_labels),
            "exact_count_no_drop_positions_heldout": heldout_exact_positions,
            "exact_count_no_drop_heldout_mismatches": heldout_exact_mismatches,
            "exact_count_no_drop_heldout_matches": heldout_exact_correct,
        },
        "controls": {
            "p43_leave_one_out": {"correct": p43_loo[0], "total": p43_loo[1]},
            "solved_p56_p57_body": {"correct": control_correct, "total": control_total,
                                    "classes": len(control_class_indices),
                                    "missing_classes": missing_control_classes,
                                    "red_controls": {"correct": red_control_correct, "total": red_control_total},
                                    "black_controls": {"correct": black_control_correct, "total": black_control_total},
                                    "lines": control_results},
            "hog_svm": hog_result,
        },
        "ambiguous_line_mappings": [{"page": p["page"], "ways": p["mapping_ways"]}
                                    for p in page_results if p["mapping_ways"] > 1],
        "high_confidence_p0_line0_candidates": high_confidence,
        "mismatches": mismatch_records,
        "unresolved": unresolved,
        "pages": page_results,
    }
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"totals": report["totals"], "controls": {
        "p43_leave_one_out": report["controls"]["p43_leave_one_out"],
        "solved_p56_p57_body": {k: v for k, v in report["controls"]["solved_p56_p57_body"].items() if k != "lines"},
        "hog_svm": {k: v for k, v in (hog_result or {}).items() if not isinstance(v, dict)},
    }, "ambiguous_pages": report["ambiguous_line_mappings"],
       "high_confidence_p0_line0_candidates": high_confidence,
       "unresolved": unresolved}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
