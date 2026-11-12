#!/usr/bin/env python3
"""Inventory LP2 red-rune spans and red dot-punctuation topology.

Requires: Python 3, numpy, opencv-python.
Run from repository root:
  python sims/lp2_red_dot_glyph_inventory.py --zip /path/to/liber-primus-jpegs.zip
or provide --image-dir containing 00.jpg..74.jpg.
LP2 page p maps to original JPEG number p+17 (e.g. p49 -> 66.jpg).
"""
from __future__ import annotations
import argparse, json, math, zipfile
from collections import Counter
from pathlib import Path

import cv2
import numpy as np


def ioc(values):
    n = len(values)
    if n < 2:
        return 0.0
    f = Counter(values)
    return sum(v * (v - 1) for v in f.values()) / (n * (n - 1))


def adjacent_equal(values):
    return sum(a == b for a, b in zip(values, values[1:]))


def js_divergence(p, q):
    out = 0.0
    for a, b in zip(p, q):
        m = (a + b) / 2
        if a:
            out += 0.5 * a * math.log2(a / m)
        if b:
            out += 0.5 * b * math.log2(b / m)
    return out


def read_page_image(page, zf, image_dir):
    image_no = page + 17
    name = f"{image_no:02d}.jpg"
    if zf is not None:
        raw = zf.read(f"liber-primus-jpegs/{name}")
        image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    else:
        image = cv2.imread(str(image_dir / name), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"could not load original LP2 page {page}: {name}")
    return image


def red_dot_clusters(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mask = ((((hsv[:, :, 0] <= 10) | (hsv[:, :, 0] >= 170)) &
             (hsv[:, :, 1] >= 50) & (hsv[:, :, 2] >= 60)).astype(np.uint8))
    count, _, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    dots = []
    for i in range(1, count):
        x, y, w, h, area = stats[i]
        if 60 <= area <= 140 and 7 <= w <= 12 and 7 <= h <= 12:
            dots.append((float(centers[i][0]), float(centers[i][1])))

    # The isolated square dots within a glyph are separated by about 14–18 px.
    used, clusters = set(), []
    for i, point in enumerate(dots):
        if i in used:
            continue
        stack, group = [i], []
        used.add(i)
        while stack:
            j = stack.pop()
            group.append(dots[j])
            for k, other in enumerate(dots):
                if k not in used and math.dist(other, dots[j]) < 28:
                    used.add(k)
                    stack.append(k)
        if len(group) < 5:
            continue

        xs = sorted(x for x, _ in group)
        columns = []
        for x in xs:
            if not columns or x - columns[-1][-1] > 6:
                columns.append([x])
            else:
                columns[-1].append(x)
        clusters.append({
            "dot_count": len(group),
            "column_counts": [sum(1 for x, _ in group if min(abs(x-v) for v in col) < 6)
                              for col in columns],
            "bbox": [
                round(min(x for x, _ in group), 1),
                round(min(y for _, y in group), 1),
                round(max(x for x, _ in group), 1),
                round(max(y for _, y in group), 1),
            ],
        })
    return clusters


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", type=Path)
    ap.add_argument("--image-dir", type=Path, default=Path("resources/liber-primus-jpegs"))
    ap.add_argument("--root", type=Path, default=Path("."))
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()

    root = args.root
    annotations = json.loads((root / "resources/liber-primus/lp2-ink-annotations.json").read_text())
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text())
    pages = {p["page"]: p for p in corpus["pages"]}

    red_masks = {}
    red_spans, red_stream, black_stream = [], [], []
    red_adjacent = 0
    for annotation in sorted(annotations["pages"].values(), key=lambda x: x["page"]):
        page = annotation["page"]
        ids = pages[page]["indices"]
        mask = set()
        for span in sorted(annotation.get("red_spans", []), key=lambda x: x["start"]):
            start, length = span["start"], span["length"]
            selected = ids[start:start + length]
            mask.update(range(start, start + length))
            red_stream.extend(selected)
            red_adjacent += adjacent_equal(selected)
            red_spans.append({"page": page, "start": start, "length": length,
                              "adjacent_equal": adjacent_equal(selected)})
        red_masks[page] = mask

    for page, page_data in sorted(pages.items()):
        ids = page_data["indices"]
        mask = red_masks.get(page, set())
        black_stream.extend(x for i, x in enumerate(ids) if i not in mask)

    red_freq = np.bincount(red_stream, minlength=29).astype(float)
    black_freq = np.bincount(black_stream, minlength=29).astype(float)
    red_p, black_p = red_freq / len(red_stream), black_freq / len(black_stream)

    key_tests = []
    for sign in (-1, 1):
        decoded = [(x + sign * red_stream[i % len(red_stream)]) % 29
                   for i, x in enumerate(black_stream)]
        key_tests.append({
            "sign": sign,
            "ioc": ioc(decoded),
            "adjacent_equal_rate": adjacent_equal(decoded) / max(1, len(decoded) - 1),
        })

    dot_records = []
    zf = zipfile.ZipFile(args.zip) if args.zip else None
    try:
        for page in range(58):
            image = read_page_image(page, zf, args.image_dir)
            for cluster in red_dot_clusters(image):
                dot_records.append({"page": page, **cluster})
    finally:
        if zf is not None:
            zf.close()

    result = {
        "scope": "LP2 pages 0–57; original JPEG file number = page + 17",
        "red_spans": len(red_spans),
        "red_pages": sorted(red_masks),
        "red_runes": len(red_stream),
        "red_ioc": ioc(red_stream),
        "red_adjacent_equal_within_spans": red_adjacent,
        "red_adjacent_equal_rate_within_spans": red_adjacent / max(1, len(red_stream) - len(red_spans)),
        "black_runes": len(black_stream),
        "red_vs_black_js_divergence_bits": js_divergence(red_p, black_p),
        "repeating_red_key_tests": key_tests,
        "dot_cluster_count": len(dot_records),
        "dot_counts": dict(sorted(Counter(x["dot_count"] for x in dot_records).items())),
        "dot_clusters": dot_records,
        "span_records": red_spans,
    }
    encoded = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        args.output.write_text(encoded)
    print(encoded)


if __name__ == "__main__":
    main()
