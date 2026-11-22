#!/usr/bin/env python3
"""Reproduce source-image glyph-width priors used in the LP2 line-wrap test.

Read-only test. Requires Pillow and NumPy. The 35-page training partition is
selected solely by matching detected image text bands to the printed-line count.
The 20 rejected pages remain an untouched prediction set.
"""
from collections import Counter, defaultdict
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
META = json.loads((ROOT / "resources/liber-primus/lp2-line-start-ink-widths.json").read_text(encoding="utf-8"))
MASTER = (ROOT / "resources/transcriptions/liber_primus_master.txt").read_text(encoding="utf-8").split("%")
RUNE_INDEX = {rune: i for i, rune in enumerate(CORPUS["runes"])}


def bands(projection: np.ndarray) -> list[tuple[int, int]]:
    """Find source-image lines in a deterministic vertical foreground projection."""
    detected = []
    for yy in np.flatnonzero(projection > 35):
        y = int(yy)
        if not detected or y - detected[-1][-1] > 26:
            detected.append([y])
        else:
            detected[-1].append(y)
    return [(line[0], line[-1]) for line in detected if line[-1] - line[0] >= 45]


def reproduce() -> dict:
    widths: dict[int, list[int]] = defaultdict(list)
    accepted: list[int] = []
    excluded: list[int] = []
    all_lines = 0
    for page in range(56):
        entry = CORPUS["pages"][page]
        if not entry["indices"]:
            continue
        source = MASTER[page + 16]
        lines = [
            [RUNE_INDEX[ch] for ch in part if ch in RUNE_INDEX]
            for part in source.split("/")
        ]
        lines = [line for line in lines if line]
        assert [i for line in lines for i in line] == entry["indices"], page
        scan = np.asarray(Image.open(ROOT / f"resources/liber-primus/{page + 17:02d}.jpg").convert("L"))
        y = bands(np.count_nonzero(scan[450:3250, 720:1640] < 135, axis=1))
        if len(y) != len(lines):
            excluded.append(page)
            continue
        accepted.append(page)
        all_lines += len(lines)
        for line, (lo, hi) in zip(lines, y):
            y0, y1 = 450 + lo, 451 + hi
            x_ink = np.flatnonzero(np.count_nonzero(scan[y0:y1, 580:1850] < 135, axis=0) >= 3)
            x0 = 580 + int(x_ink[0])
            if not 590 <= x0 <= 780:
                continue
            first = np.flatnonzero(
                np.count_nonzero(scan[y0:y1, x0:x0+135] < 135, axis=0) >= 2
            )
            first_run_len = 1
            for x in first[1:]:
                if int(x) != first_run_len:
                    break
                first_run_len += 1
            widths[line[0]].append(first_run_len)
    observed = [Counter(widths[i]).most_common(1)[0][0] for i in range(29)]
    counts = [len(widths[i]) for i in range(29)]
    assert accepted == META["trainingPages"]
    assert excluded == META["untouchedPages"]
    assert all_lines == META["trainingLines"] == 416
    assert sum(counts) == META["usableGlyphObservations"] == 415
    assert observed == META["modeInkRunWidthsPx"]
    assert counts == META["observationsByRune"]
    return {
        "sourcePages": 55,
        "imageAlignedTrainingPages": accepted,
        "untouchedPhysicalPages": excluded,
        "trainingTextLines": all_lines,
        "usableGlyphObservations": sum(counts),
        "modalWidthsPx": observed,
        "perRuneCount": counts,
        "passesFrozenSourceImageAssertions": True,
    }


if __name__ == "__main__":
    print(json.dumps(reproduce(), indent=2))
