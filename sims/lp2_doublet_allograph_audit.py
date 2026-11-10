#!/usr/bin/env python3
"""Audit all 86 original-image LP2 adjacent identical GP rune pairs.

Uses the canonical source transcription solely to register page/line/rune
coordinates, then compares ink pixels from original LP2 JPEGs. Also samples
controls from source-labeled, non-doublet p43 glyphs. This is an allograph
audit, not a decoder. Requires numpy, scipy and Pillow.

Run from repository root:
    python sims/lp2_doublet_allograph_audit.py
Prints a reproducible JSON index of all 86 crop boxes and diagnostics.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
RUNES = set("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")


def lines_from_transcription(raw: str):
    """Map 55 rune-bearing unsolved source sections to physical pages."""
    parts = raw.split("%")[:55]
    assert len(parts) == 55
    return {
        k + (k >= 50): [
            [c for c in segment if c in RUNES]
            for segment in parts[k].split("/")
            if any(c in RUNES for c in segment)
        ]
        for k in range(55)
    }


def line_position(lengths, offset):
    count = 0
    for line, length in enumerate(lengths):
        if count <= offset < count + length:
            return line, offset - count
        count += length
    raise ValueError(f"offset {offset} outside page with {count} runes")


def image_data(page):
    with Image.open(SOURCE / f"{page + 17:02d}.jpg") as image:
        rgb = np.asarray(image.convert("RGB"))
        gray = np.asarray(image.convert("L"))
    assert rgb.shape == (3600, 2400, 3)
    return gray, rgb


def row_centers(gray):
    projection = (gray[:, 790:1770] < 160).sum(axis=1)
    peaks, _ = find_peaks(
        gaussian_filter1d(projection.astype(float), sigma=7),
        prominence=125, distance=137
    )
    return [int(y) for y in peaks if 450 < y < 3150]


def segment_at_center(gray, center):
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
        if 595 <= start <= 1800 and np.ptp(area[:, 0]) + 1 >= 70:
            crop = ink[:, left:right]
            yy, xx = np.where(crop)
            box = (start, y0 + int(yy.min()), x0 + right,
                   y0 + int(yy.max()) + 1)
            row.append((crop[yy.min(): yy.max() + 1,
                             xx.min(): xx.max() + 1], box))
    return row


def full_band_glyphs(gray):
    """Independent p43 same-rune and different-rune control registration."""
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    ink = gray[y0:y1, x0:x1] < 110
    ys = np.flatnonzero(ink.sum(axis=1) >= 18)
    bands = np.split(ys, np.flatnonzero(np.diff(ys) > 20) + 1)
    glyphs = []
    for band in bands:
        if band.size <= 40 or band[-1] - band[0] < 40:
            continue
        strip = ink[band[0]:band[-1] + 1]
        xs = np.flatnonzero(strip.sum(axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            area = np.argwhere(strip[:, left:right])
            if len(area) < 100 or np.ptp(area[:, 0]) < 32:
                continue
            if not (595 <= left + x0 <= 1800
                    and np.ptp(area[:, 0]) + 1 >= 70):
                continue
            crop = strip[:, left:right]
            yy, xx = np.where(crop)
            glyphs.append(crop[yy.min():yy.max() + 1,
                               xx.min():xx.max() + 1])
    return glyphs


def selected_row(page, source_line):
    """Fixed source-layout registration; not learned from rune shapes."""
    if page == 27:  # two ornament bands before the source's first line
        return source_line + 2
    if page == 51:  # eight printed numerical rows precede four rune rows
        return source_line + 8
    if page == 33 and source_line >= 5:  # dot-stencil band between blocks
        return source_line + 1
    if page in (6, 36) and source_line >= (4 if page == 6 else 5):
        # short colored clause omitted by image-density peak finder
        return source_line - 1
    if page == 39 and source_line >= 7:  # short heading merged into band
        return source_line - 1
    return source_line


def column_shift(page, source_line):
    """Known visual spillover of an oversized initial or decorative stroke."""
    return int((page, source_line) in {(3, 2), (6, 6), (27, 0), (54, 1)})


def similarity(a, b, max_shift=1):
    h = max(a.shape[0], b.shape[0]) + 2 * max_shift
    w = max(a.shape[1], b.shape[1]) + 2 * max_shift
    aa = np.zeros((h, w), dtype=bool)
    aa[max_shift:max_shift + a.shape[0],
       max_shift:max_shift + a.shape[1]] = a
    best = 0.
    for dy in range(-max_shift, max_shift + 1):
        for dx in range(-max_shift, max_shift + 1):
            bb = np.zeros((h, w), dtype=bool)
            y = max_shift + dy
            x = max_shift + dx
            bb[y:y + b.shape[0], x:x + b.shape[1]] = b
            union = np.count_nonzero(aa | bb)
            score = np.count_nonzero(aa & bb) / union
            best = max(best, score)
    return best


def ink_color(rgb, box):
    x0, y0, x1, y1 = box
    pixels = rgb[y0:y1, x0:x1].astype(np.int16)
    dark = pixels.mean(axis=2) < 130
    red = (pixels[:, :, 0] > pixels[:, :, 1] + 50) & (
        pixels[:, :, 0] > pixels[:, :, 2] + 50) & (
        pixels[:, :, 0] > 100)
    return "red" if np.count_nonzero(dark & red) > .5 * max(1, np.count_nonzero(dark)) else "black"


def control_distribution(gray, labels, excluded):
    crops = full_band_glyphs(gray)
    assert len(crops) == len(labels) == 274
    permitted = [i for i in range(len(labels)) if i not in excluded]
    groups = defaultdict(list)
    for i in permitted:
        groups[labels[i]].append(i)
    rng = np.random.default_rng(31312026)
    same = []
    different = []
    valid = [r for r in groups if len(groups[r]) >= 2]
    for _ in range(1000):
        rune = int(rng.choice(valid))
        i, j = rng.choice(groups[rune], size=2, replace=False)
        same.append(similarity(crops[int(i)], crops[int(j)]))
        a = int(rng.choice(permitted))
        b = int(rng.choice(permitted))
        while labels[a] == labels[b]:
            b = int(rng.choice(permitted))
        different.append(similarity(crops[a], crops[b]))
    return {
        "same_rune_non_doublet": np.percentile(same, [0, 5, 25, 50, 75, 95, 100]).round(6).tolist(),
        "different_rune_non_doublet": np.percentile(different, [0, 5, 25, 50, 75, 95, 100]).round(6).tolist(),
        "seed": 31312026, "samples_per_group": 1000,
        "source_page": 43, "non_doublet_controls": len(permitted)
    }


def main():
    data = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf8"))
    raw = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf8")
    transcribed = lines_from_transcription(raw)
    assert len(data["pages"]) == 58
    rows = []
    labels43 = data["pages"][43]["indices"]
    p43_doublet_used = set()
    for page in range(56):
        if page == 50:
            continue  # runeless numerical page
        indices = data["pages"][page]["indices"]
        lines = transcribed[page]
        expected = [c for line in lines for c in line]
        assert expected == [data["runes"][i] for i in indices], page
        candidates = [j for j in range(len(indices)-1)
                      if indices[j] == indices[j+1]]
        if not candidates:
            continue
        gray, rgb = image_data(page)
        centers = row_centers(gray)
        scanned = [segment_at_center(gray, center) for center in centers]
        lengths = [len(line) for line in lines]
        for at in candidates:
            a_line, a_col = line_position(lengths, at)
            b_line, b_col = line_position(lengths, at + 1)
            a_row = selected_row(page, a_line)
            b_row = selected_row(page, b_line)
            a_shift = column_shift(page, a_line)
            b_shift = column_shift(page, b_line)
            a_pos = a_col + a_shift
            b_pos = b_col + b_shift
            assert a_row < len(scanned) and b_row < len(scanned)
            # An additional tiny printed mark trails source line 0 on p27.
            expected_a_extra = a_shift + int((page, a_line) == (27, 0))
            expected_b_extra = b_shift + int((page, b_line) == (27, 0))
            assert len(scanned[a_row]) == lengths[a_line] + expected_a_extra, (page, at, a_line)
            assert len(scanned[b_row]) == lengths[b_line] + expected_b_extra, (page, at, b_line)
            crop_a, box_a = scanned[a_row][a_pos]
            crop_b, box_b = scanned[b_row][b_pos]
            score = similarity(crop_a, crop_b)
            if page == 43:
                p43_doublet_used.update((at, at + 1))
            rows.append({
                "page": page, "jpeg": f"{page+17:02d}.jpg",
                "offset": at, "rune_index": indices[at],
                "rune": data["runes"][indices[at]],
                "a": {"source_line": a_line, "source_column": a_col,
                      "raster_row": a_row, "raster_column": a_pos,
                      "box_xyxy": box_a, "shape": crop_a.shape,
                      "ink": ink_color(rgb, box_a)},
                "b": {"source_line": b_line, "source_column": b_col,
                      "raster_row": b_row, "raster_column": b_pos,
                      "box_xyxy": box_b, "shape": crop_b.shape,
                      "ink": ink_color(rgb, box_b)},
                "jaccard_shift1": round(score, 6),
                "common_height_prefix_identical": bool(
                    crop_a.shape[1] == crop_b.shape[1] and
                    np.array_equal(crop_a[:min(len(crop_a),len(crop_b))],
                                   crop_b[:min(len(crop_a),len(crop_b))])
                )
            })
    assert len(rows) == 86
    assert len({(r["page"],r["offset"]) for r in rows}) == 86
    assert {r["page"] for r in rows} == {
        p for p in transcribed if any(
            a == b for a, b in zip(
                data["pages"][p]["indices"],
                data["pages"][p]["indices"][1:]))
    }
    values = [r["jaccard_shift1"] for r in rows]
    outlier = [r for r in rows if r["jaccard_shift1"] < .9]
    assert len(outlier) == 1 and (outlier[0]["page"],outlier[0]["offset"]) == (34,134)
    assert outlier[0]["common_height_prefix_identical"]
    assert all(r["a"]["ink"] == r["b"]["ink"] for r in rows)
    p43_gray, _ = image_data(43)
    result = {
        "method": "source-indexed original-JPEG raster glyph morphology; black threshold 110; +/-1px maximum Jaccard alignment",
        "scope": "56 unsolved physical LP2 pages, 55 rune-bearing; within-page adjacent equals only",
        "total_pairs": len(rows),
        "sampled_pages": len({r["page"] for r in rows}),
        "pairs_at_or_above_0.9": sum(s >= .9 for s in values),
        "perfect_jaccard": sum(s == 1 for s in values),
        "jaccard_percentiles_0_5_25_50_75_95_100": np.percentile(
            values, [0,5,25,50,75,95,100]).round(6).tolist(),
        "ink_pairs": dict(
            black=sum(r["a"]["ink"] == "black" for r in rows),
            red=sum(r["a"]["ink"] == "red" for r in rows),
            color_mismatches=sum(r["a"]["ink"] != r["b"]["ink"] for r in rows)
        ),
        "p43_control": control_distribution(p43_gray, labels43, p43_doublet_used),
        "outliers": outlier,
        "pairs": rows,
        "conclusion": "No resolved visually distinct allograph class among all 86 source-registered adjacent repeats; does not decrypt or prove a 29-state cipher."
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
