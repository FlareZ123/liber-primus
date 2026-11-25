#!/usr/bin/env python3
"""Subpixel horizontal glyph-position and word-space audit for LP2.

Uses p0 glyphs as per-rune grayscale templates, estimates horizontal shifts
from 1-D darkness profiles, and evaluates a frozen font-advance model on
p40-p57. No network access or generated inputs are required.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
RUNE_INDEX = {r: i for i, r in enumerate(RUNES)}
P0_BODY_STARTS = [1234, 1422, 1610, 1798, 1986, 2174, 2362, 2550, 2738]
PAGE_OFFSET = 17
FEATURE_THRESHOLD = 0.02
SHIFT_GRID = np.linspace(-2.0, 2.0, 81)
XGRID = np.arange(96, dtype=float)


def read_gray(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("L"))


def line_bands(page: np.ndarray) -> list[int]:
    counts = np.count_nonzero(page[:, 850:1960] < 150, axis=1)
    positions = np.where(counts > 80)[0]
    runs: list[list[int]] = []
    for y in positions:
        if not runs or y > runs[-1][1] + 2:
            runs.append([int(y), int(y)])
        else:
            runs[-1][1] = int(y)
    return [
        a - 4 for a, b in runs
        if 85 <= b - a + 1 <= 145 and np.max(counts[a:b + 1]) > 200
    ]


def glyph_segments(page: np.ndarray, y0: int) -> list[tuple[int, int]]:
    ink = page[y0:y0 + 118, 600:2100] < 150
    positions = np.where(np.count_nonzero(ink, axis=0) >= 7)[0]
    runs: list[list[int]] = []
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


def glyph_feature(page: np.ndarray, y0: int, x0: int, x1: int) -> np.ndarray | None:
    ink = (page[y0:y0 + 118, x0:x1 + 1] < 150).astype(np.float32)
    active = np.where(np.any(ink, axis=1))[0]
    if not len(active):
        return None
    ink = ink[active[0]:active[-1] + 1]
    h, w = ink.shape
    if h > 120 or w > 96:
        return None
    padded = np.zeros((120, 96), np.float32)
    padded[:h, :w] = ink
    return cv2.resize(padded, (48, 60), interpolation=cv2.INTER_AREA).ravel()


def summary_stats(values: np.ndarray) -> dict:
    v = np.asarray(values, dtype=float)
    if not len(v):
        return {"n": 0}
    return {
        "n": int(len(v)),
        "mean": float(v.mean()),
        "sd": float(v.std()),
        "rmse": float(np.sqrt(np.mean(v * v))),
        "median": float(np.median(v)),
        "q01": float(np.quantile(v, 0.01)),
        "q05": float(np.quantile(v, 0.05)),
        "q95": float(np.quantile(v, 0.95)),
        "q99": float(np.quantile(v, 0.99)),
        "max_abs": float(np.max(np.abs(v))),
    }


def correlation(a: np.ndarray, b: np.ndarray) -> float:
    if len(a) < 2 or np.std(a) == 0 or np.std(b) == 0:
        return 0.0
    return float(np.corrcoef(a, b)[0, 1])


def build_design(records: np.ndarray) -> np.ndarray:
    left = records[:, 2].astype(int)
    right = records[:, 3].astype(int)
    design = np.zeros((len(records), 59), dtype=float)
    design[:, 0] = 1.0
    design[np.arange(len(records)), 1 + left] = 1.0
    design[np.arange(len(records)), 30 + right] = 1.0
    return design


def estimate_shift(profile: np.ndarray, template_grid: np.ndarray) -> tuple[float, float]:
    a = profile - profile.mean()
    centered = template_grid - template_grid.mean(axis=1, keepdims=True)
    denom = np.linalg.norm(a) * np.linalg.norm(centered, axis=1)
    scores = (centered @ a) / np.maximum(denom, 1e-12)
    k = int(np.argmax(scores))
    delta = float(SHIFT_GRID[k])
    if 0 < k < len(SHIFT_GRID) - 1:
        ym, y0, yp = scores[k - 1], scores[k], scores[k + 1]
        curvature = ym - 2.0 * y0 + yp
        if abs(curvature) > 1e-12:
            delta = float(
                SHIFT_GRID[k]
                + 0.5 * (ym - yp) / curvature * (SHIFT_GRID[1] - SHIFT_GRID[0])
            )
    return delta, float(scores[k])


def make_profiles(samples: list[tuple], page_cache: dict[int, np.ndarray],
                  band_cache: dict[int, list[int]]) -> np.ndarray:
    profiles = []
    for p, line_no, y0, x0, x1, _feature in samples:
        crop = page_cache[p][y0:y0 + 118, x0:x1 + 1].astype(np.float64)
        profile = (255.0 - crop).sum(axis=0)
        canvas = np.zeros(96, dtype=np.float64)
        if len(profile) <= 92:
            canvas[2:2 + len(profile)] = profile
        profiles.append(canvas)
    return np.stack(profiles)


def main() -> None:
    parser = argparse.ArgumentParser()
    root = Path(__file__).resolve().parents[1]
    parser.add_argument("--image-dir", type=Path, default=root / "resources" / "liber-primus")
    parser.add_argument("--master", type=Path, default=root / "resources" / "transcriptions" / "liber_primus_master.txt")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    master_pages = args.master.read_text(encoding="utf-8").split("%")
    if len(master_pages) <= 16:
        raise RuntimeError("Master transcription does not contain the LP2 p0 source page.")
    p0_lines = [line.strip() for line in master_pages[16].splitlines()]

    page_cache = {p: read_gray(args.image_dir / f"{p + PAGE_OFFSET}.jpg") for p in range(58)}
    band_cache = {p: line_bands(page_cache[p]) for p in range(58)}

    # Build the 29-class rune classifier from the original p0 body.
    p0_features = []
    p0_labels = []
    for line_no in range(3, 12):
        y0 = P0_BODY_STARTS[line_no - 3]
        runs = glyph_segments(page_cache[0], y0)
        chars = [c for c in p0_lines[line_no] if c in RUNE_INDEX]
        if len(runs) != len(chars):
            raise RuntimeError(
                f"p0 line {line_no}: image has {len(runs)} glyphs, transcription has {len(chars)}"
            )
        for rune, (x0, x1) in zip(chars, runs):
            feature = glyph_feature(page_cache[0], y0, x0, x1)
            if feature is not None:
                p0_features.append(feature)
                p0_labels.append(RUNE_INDEX[rune])
    templates = np.asarray(p0_features, dtype=np.float32)
    template_labels = np.asarray(p0_labels, dtype=np.int32)
    if len(set(template_labels.tolist())) != 29:
        raise RuntimeError("p0 template training did not cover all 29 GP29 symbols")

    # Segment and classify all 58 LP2 pages.
    samples = []
    for p in range(58):
        page = page_cache[p]
        for line_no, y0 in enumerate(band_cache[p]):
            for x0, x1 in glyph_segments(page, y0):
                feature = glyph_feature(page, y0, x0, x1)
                if feature is not None:
                    samples.append((p, line_no, y0, x0, x1, feature))
    X = np.stack([s[5] for s in samples])
    distances = (
        (X * X).sum(axis=1)[:, None]
        + (templates * templates).sum(axis=1)[None, :]
        - 2.0 * (X @ templates.T)
    ) / X.shape[1]
    best = np.argmin(distances, axis=1)
    predicted = template_labels[best]
    scores = distances[np.arange(len(X)), best]
    confident = scores < FEATURE_THRESHOLD

    # Horizontal darkness profiles and p0 per-rune median templates.
    profiles = make_profiles(samples, page_cache, band_cache)
    class_templates = {}
    for cls in range(29):
        ix = [
            i for i, sample in enumerate(samples)
            if sample[0] == 0 and confident[i] and predicted[i] == cls and profiles[i].sum() > 0
        ]
        if len(ix) >= 3:
            class_templates[cls] = np.median(profiles[ix], axis=0)
    if len(class_templates) != 29:
        raise RuntimeError("Could not build p0 horizontal templates for all 29 runes")
    template_grid = {
        cls: np.stack([
            np.interp(XGRID - delta, XGRID, profile, left=0.0, right=0.0)
            for delta in SHIFT_GRID
        ])
        for cls, profile in class_templates.items()
    }

    shifts = np.full(len(samples), np.nan)
    shift_correlations = np.full(len(samples), np.nan)
    for i in range(len(samples)):
        cls = int(predicted[i])
        if confident[i] and profiles[i].sum() > 0:
            shifts[i], shift_correlations[i] = estimate_shift(profiles[i], template_grid[cls])

    # Retain glyphs with reliable class assignments and a fitted subpixel shift.
    by_line = defaultdict(list)
    for i, sample in enumerate(samples):
        if confident[i] and np.isfinite(shifts[i]):
            p, line_no, _y0, x0, x1, _feature = sample
            by_line[(p, line_no)].append(
                (x0, x1, int(predicted[i]), float(x0 + shifts[i]), float(shifts[i]))
            )

    all_pairs = []
    intra_pairs = []
    for (p, line_no), items in by_line.items():
        items.sort()
        for a, b in zip(items, items[1:]):
            gap = b[0] - a[1] - 1
            record = (
                p, line_no, a[2], b[2], b[3] - a[3], gap,
                a[3], b[3], a[4], b[4],
            )
            all_pairs.append(record)
            if 0 <= gap <= 14:
                intra_pairs.append(record)

    records = np.asarray(intra_pairs, dtype=float)
    pages = records[:, 0].astype(int)
    lines = records[:, 1].astype(int)
    train = pages < 40
    holdout = ~train
    design = build_design(records)
    beta = np.linalg.lstsq(design[train], records[:, 4], rcond=None)[0]
    residuals = records[:, 4] - design @ beta

    # Integer-origin baseline on the identical pair inventory.
    integer_records = []
    by_line_integer = defaultdict(list)
    for i, sample in enumerate(samples):
        if confident[i]:
            p, line_no, _y0, x0, x1, _feature = sample
            by_line_integer[(p, line_no)].append((x0, x1, int(predicted[i])))
    for (p, line_no), items in by_line_integer.items():
        items.sort()
        for a, b in zip(items, items[1:]):
            gap = b[0] - a[1] - 1
            if 0 <= gap <= 14:
                integer_records.append((p, line_no, a[2], b[2], b[0] - a[0], gap))
    int_records = np.asarray(integer_records, dtype=float)
    int_pages = int_records[:, 0].astype(int)
    int_train = int_pages < 40
    int_design = build_design(int_records)
    int_beta = np.linalg.lstsq(int_design[int_train], int_records[:, 4], rcond=None)[0]
    int_residuals = int_records[:, 4] - int_design @ int_beta

    # Per-page and within-line residual diagnostics.
    per_page = {}
    for p in sorted(set(pages.tolist())):
        if p >= 40:
            per_page[str(int(p))] = summary_stats(residuals[pages == p])

    line_residuals = defaultdict(list)
    for i, record in enumerate(records):
        line_residuals[(int(record[0]), int(record[1]))].append(float(residuals[i]))
    acf = {}
    for lag in range(1, 21):
        values = []
        for group in line_residuals.values():
            v = np.asarray(group, dtype=float)
            if len(v) > lag:
                v = v - v.mean()
                denom = float(np.sum(v * v))
                if denom > 0:
                    values.append(float(np.sum(v[:-lag] * v[lag:]) / denom))
        acf[str(lag)] = float(np.mean(values)) if values else None

    corr = {
        "current_rune": correlation(residuals, records[:, 2]),
        "next_rune": correlation(residuals, records[:, 3]),
        "rune_delta": correlation(residuals, records[:, 3] - records[:, 2]),
        "page": correlation(residuals, records[:, 0]),
        "line": correlation(residuals, records[:, 1]),
        "gap": correlation(residuals, records[:, 5]),
        "current_shift": correlation(residuals, records[:, 8]),
        "next_shift": correlation(residuals, records[:, 9]),
    }

    # Word-space width: extend the frozen no-space font-advance model to gaps 15..30.
    all_array = np.asarray(all_pairs, dtype=float)
    all_design = build_design(all_array)
    extra = all_array[:, 4] - all_design @ beta
    gaps = all_array[:, 5].astype(int)
    word_mask = (gaps >= 15) & (gaps <= 30)
    word_holdout = word_mask & (all_array[:, 0] >= 40)
    word_counts = Counter(gaps[word_mask].tolist())

    # Synthetic profile-shift controls; fixed sample and seed.
    rng = np.random.default_rng(3301)
    hold_indices = [
        i for i, sample in enumerate(samples)
        if sample[0] >= 40 and confident[i] and int(predicted[i]) in template_grid
    ]
    chosen = rng.choice(hold_indices, size=min(600, len(hold_indices)), replace=False)

    def estimate_for_class(profile: np.ndarray, cls: int) -> float:
        return estimate_shift(profile, template_grid[cls])[0]

    controls = {}
    for planted in (0.1, 0.25, 0.5, -0.25, -0.5):
        errors = []
        for i in chosen:
            cls = int(predicted[i])
            baseline = estimate_for_class(profiles[i], cls)
            shifted = np.interp(XGRID - planted, XGRID, profiles[i], left=0.0, right=0.0)
            recovered = estimate_for_class(shifted, cls)
            errors.append((recovered - baseline) - planted)
        errors = np.asarray(errors, dtype=float)
        controls[str(planted)] = {
            "mean_error": float(errors.mean()),
            "sd_error": float(errors.std()),
            "within_0_1": float(np.mean(np.abs(errors) < 0.1)),
        }

    result = {
        "input": {
            "images": "resources/liber-primus/17.jpg..74.jpg (LP2 physical p0..p57)",
            "master": "resources/transcriptions/liber_primus_master.txt",
            "training_pages": "p0..p39",
            "holdout_pages": "p40..p57",
            "glyph_classifier_threshold": FEATURE_THRESHOLD,
            "subpixel_template_source": "p0 glyphs, per GP29 class",
            "subpixel_shift_search_px": [-2.0, 2.0, 0.05],
            "random_seed": 3301,
        },
        "counts": {
            "high_confidence_glyphs": int(confident.sum()),
            "rune_classes": int(len(class_templates)),
            "subpixel_estimates": int(np.isfinite(shifts).sum()),
            "intra_word_pairs": int(len(records)),
            "training_pairs": int(train.sum()),
            "holdout_pairs": int(holdout.sum()),
            "word_space_pairs_gap_15_30": int(word_mask.sum()),
            "word_space_holdout_pairs": int(word_holdout.sum()),
        },
        "integer_start_model": {
            "training_rmse_px": float(np.sqrt(np.mean(int_residuals[int_train] ** 2))),
            "holdout_rmse_px": float(np.sqrt(np.mean(int_residuals[~int_train] ** 2))),
            "holdout_max_abs_px": float(np.max(np.abs(int_residuals[~int_train]))),
        },
        "subpixel_model": {
            "training": summary_stats(residuals[train]),
            "holdout": summary_stats(residuals[holdout]),
            "solved_p56_p57": summary_stats(residuals[pages >= 56]),
            "holdout_correlations": corr,
            "within_line_autocorrelation_lags_1_20": acf,
            "per_page_holdout": per_page,
            "template_correlation_quantiles": np.quantile(
                shift_correlations[np.isfinite(shift_correlations)],
                [0.0, 0.01, 0.1, 0.5, 0.9, 0.99, 1.0],
            ).tolist(),
        },
        "word_spaces": {
            "extra_width_all_pages_px": summary_stats(extra[word_mask]),
            "extra_width_holdout_px": summary_stats(extra[word_holdout]),
            "gap_width_counts": {str(k): int(v) for k, v in sorted(word_counts.items())},
        },
        "synthetic_shift_controls": controls,
    }
    encoded = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
    print(encoded, end="")


if __name__ == "__main__":
    main()
