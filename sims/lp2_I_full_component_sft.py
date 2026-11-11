#!/usr/bin/env python3
"""Original-JPEG rune I glyph census from full-height source components.

Run: python sims/lp2_I_full_component_sft.py
ZIP: python sims/lp2_I_full_component_sft.py --archive /path/to/liber-primus-jpegs.zip
"""
from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
GP_I_INDEX = 10
# ord(character)-65 is the original physical page's I rune count, p0..p57.
COUNTS = "IIIJIKHJGJJIKHBHJPIJMLCGKJKIOPGLBHHPOJHKIMILLKKMMEABGFHFBJ"


def source_components(gray: np.ndarray):
    """Yield (printed line center, full source components [x,y,width,height])."""
    projection = (gray[:, 595:1800] < 160).sum(axis=1)
    centers, _ = find_peaks(gaussian_filter1d(projection.astype(float), sigma=5),
                            prominence=40, distance=100)
    for center in centers:
        if not 450 < center < 3150:
            continue
        top, bottom = max(0, center - 60), min(gray.shape[0], center + 65)
        ink = gray[top:bottom, 530:1880] < 110
        active = np.flatnonzero(ink.sum(axis=0) >= 2)
        components = []
        for chunk in np.split(active, np.flatnonzero(np.diff(active) > 1) + 1):
            if not len(chunk):
                continue
            left, right = int(chunk[0]), int(chunk[-1]) + 1
            cut = ink[:, left:right]
            ys = np.flatnonzero(cut.sum(axis=1))
            if not len(ys) or cut.sum() < 100 or int(ys[-1]-ys[0]+1) < 70:
                continue
            x = left + 530
            if 595 <= x <= 1800:
                components.append((x, int(top+ys[0]), right-left, int(ys[-1]-ys[0]+1)))
        if components:
            yield int(center), components


def count_full_height_i(gray: np.ndarray) -> tuple[int, list[tuple[int,int]]]:
    positions = []
    for _, components in source_components(gray):
        broad = [entry[3] for entry in components if entry[2] > 13]
        if not broad:
            continue
        full_height = float(np.median(broad))
        for x, y, width, height in components:
            if 8 <= width <= 12 and height >= full_height:
                positions.append((x, y))
    return len(positions), positions


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--corpus", type=Path, default=SOURCE / "lp2-corpus.json")
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--stop", type=int, default=58)
    args = parser.parse_args()
    assert 0 <= args.start < args.stop <= 58
    assert len(COUNTS) == 58
    if args.corpus.exists():
        corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
        assert corpus["translit"][GP_I_INDEX] == "I"
        for page in range(58):
            actual = sum(x == GP_I_INDEX for x in corpus["pages"][page]["indices"])
            assert actual == ord(COUNTS[page]) - 65
        assert corpus["pages"][50]["indices"] == []

    archive = ZipFile(args.archive) if args.archive else None

    def read(page: int) -> np.ndarray:
        name = f"{page+17:02}.jpg"
        if archive:
            raw = archive.read("liber-primus-jpegs/" + name)
            return np.asarray(Image.open(io.BytesIO(raw)).convert("L"))
        return np.asarray(Image.open(SOURCE / name).convert("L"))

    total, source_control, solved_controls = 0, {}, {}
    try:
        for page in range(args.start, args.stop):
            count, positions = count_full_height_i(read(page))
            expected = ord(COUNTS[page]) - 65
            if page == 50:
                # LP2 p50 is a 104-cell base-60 numeral grid with zero runes.
                assert expected == 0
                source_control["p50_nonrune_numeric_candidates"] = count
                continue
            assert count == expected, (page, expected, count, positions)
            total += count
            if page == 56:
                assert (1290, 1889) in positions
                solved_controls["p56"] = positions
            elif page == 57:
                solved_controls["p57"] = positions
        if (args.start, args.stop) == (0, 58):
            assert total == 481
            assert source_control["p50_nonrune_numeric_candidates"] == 1
            assert len(solved_controls["p56"]) == 1
            assert len(solved_controls["p57"]) == 9
        print(json.dumps({
            "original_scans": "17.jpg to 74.jpg",
            "pages_checked": [args.start, args.stop],
            "full_height_rune_I_matches": total,
            "p50_excluded_nonrune_numeric_shape": source_control.get("p50_nonrune_numeric_candidates"),
            "solved_position_controls": solved_controls,
            "method": "narrow 8-12px source component with height >= source row median",
            "decision": "exact rune I original-source census; no cryptographic key or allograph state",
        }, indent=2))
    finally:
        if archive:
            archive.close()


if __name__ == "__main__":
    main()
