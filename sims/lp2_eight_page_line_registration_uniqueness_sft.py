#!/usr/bin/env python3
"""Image-first exact registration tie audit, independent of rune identity scores.

Original JPEGs are read directly. For each of the eight pages with previously
reported tied row registrations, compute row peaks and source glyph-component
counts using the source-audit thresholds, then enumerate ALL globally cheapest
skip/match monotone mappings. This deduplicates equivalent skip histories.

From repository root:
    python sims/lp2_eight_page_line_registration_uniqueness_sft.py
With independently supplied original archive:
    python sims/lp2_eight_page_line_registration_uniqueness_sft.py --archive PATH
"""
from __future__ import annotations
import argparse
import io
import json
import zipfile
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
RUNES = set("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
TIED = [2, 7, 14, 22, 32, 49, 53, 55]
EXPECTED_DETECTED = {
    2: (9, 10, 2),
    7: (10, 12, 3),
    14: (7, 8, 2),
    22: (6, 8, 3),
    32: (6, 8, 3),
    49: (3, 13, 11),
    53: (9, 10, 2),
    55: (4, 5, 2)
}
VISUAL_SUFFIX = {
    2: "insect illustration",
    7: "black dot ornaments",
    14: "winged insect",
    22: "black illustrated staff",
    32: "blurred tree illustration",
    49: "base60 numeral table, not rune text",
    53: "butterfly illustration",
    55: "butterfly illustration"
}

def source_lines() -> dict[int, list[int]]:
    """Exact line rune counts from the canonical physical manuscript."""
    source = (ROOT / "resources" / "lp2-transcription.txt").read_text(encoding="utf-8")
    data = {}
    for i, block in enumerate(source.split("%")[:55]):
        p = i + int(i >= 50)
        data[p] = [sum(ch in RUNES for ch in line) for line in block.split("/")
                   if any(ch in RUNES for ch in line)]
    return data

def measure_rows(gray: np.ndarray) -> tuple[list[int], list[int]]:
    """Independent pixel extraction with the pinned registration thresholds."""
    projection = np.count_nonzero(gray[:, 595:1800] < 160, axis=1)
    peaks, _ = find_peaks(gaussian_filter1d(projection.astype(float), sigma=5),
                          prominence=40, distance=100)
    centers = [int(y) for y in peaks if 450 < y < 3150]
    counts = []
    for center in centers:
        x0, x1 = 530, 1880
        y0 = max(0, center - 60)
        y1 = min(gray.shape[0], center + 65)
        ink = gray[y0:y1, x0:x1] < 110
        xs = np.flatnonzero(np.count_nonzero(ink, axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
        good = 0
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            area = np.argwhere(ink[:, left:right])
            if len(area) < 100 or np.ptp(area[:, 0]) < 32:
                continue
            start = left + x0
            if 595 <= start <= 1800 and np.ptp(area[:, 0]) + 1 >= 70:
                good += 1
        counts.append(good)
    return centers, counts

def exact_unique_mappings(wanted: list[int], found: list[int]) -> tuple[int, list[tuple[int, ...]]]:
    """All optimum source-row matchings, ignoring equivalent trailing skip paths."""
    n, m = len(wanted), len(found)
    inf = 10 ** 9

    @lru_cache(None)
    def rec(i: int, j: int) -> tuple[int, frozenset[tuple[int, ...]]]:
        if i == n:
            return 2 * (m - j), frozenset([tuple()])
        best, unique = inf, set()
        if j < m:
            cost, maps = rec(i, j + 1)
            best = cost + 2
            unique = set(maps)
            diff = abs(wanted[i] - found[j])
            if diff <= 5:
                cost, maps = rec(i + 1, j + 1)
                value = cost + diff
                paths = {(j,) + entry for entry in maps}
                if value < best:
                    best, unique = value, paths
                elif value == best:
                    unique |= paths
        return best, frozenset(unique)

    cost, mappings = rec(0, 0)
    return cost, sorted(mappings)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    corpus = source_lines()
    report = json.loads((ROOT / "im-results" /
        "lp2-full-source-rune-assignment-audit.json").read_text(encoding="utf-8"))
    old = {item["page"]: item["ways"] for item in report["ambiguous_line_mappings"]}
    result = []
    archive = zipfile.ZipFile(args.archive) if args.archive else None

    for page in TIED:
        name = f"{page + 17:02d}.jpg"
        if archive:
            im = Image.open(io.BytesIO(archive.read("liber-primus-jpegs/" + name)))
        else:
            im = Image.open(ROOT / "resources" / "liber-primus" / name)
        gray = np.asarray(im.convert("L"))
        centers, components = measure_rows(gray)
        want = corpus[page]
        assert (len(want), len(centers), old[page]) == EXPECTED_DETECTED[page]
        cost, maps = exact_unique_mappings(want, components)
        assert len(maps) == 1 and maps[0] == tuple(range(len(want))), (page, maps)
        assert old[page] == len(centers) - len(want) + 1
        entry = {
            "page": page,
            "scan": name,
            "rune_line_count": len(want),
            "detected_row_count": len(centers),
            "previous_reported_tied_paths": old[page],
            "distinct_optimal_rune_line_registrations": len(maps),
            "matched_row_indices": list(maps[0]),
            "extra_row_indices": list(range(len(want), len(centers))),
            "extra_row_y_centers": centers[len(want):],
            "extra_row_component_counts": components[len(want):],
            "visual_content_of_extra_rows": VISUAL_SUFFIX[page],
            "optimal_cost": cost
        }
        result.append(entry)
    assert sum(x["rune_line_count"] for x in result) == 54
    print(json.dumps({"result": "Eight reported ties are skip-path multiplicities; all mappings unique",
                      "all_original_image_checks_pass": True, "pages": result}, indent=2))

if __name__ == "__main__":
    main()
