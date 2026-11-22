#!/usr/bin/env python3
"""Measure original LP2 rune advances directly from native JPEG glyph positions.

The identities come only from the published transcription. Pixel processing
segments glyph shapes, never reads them by OCR. Fits advances on the first
seven printed lines of physical LP2 page 43 (60.jpg), with frozen holdout
checks on its last five lines and the first line of 61.jpg.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
VARIABLES = RUNES + ["-", "."]
IDS = {r: i for i, r in enumerate(VARIABLES)}


def glyph_positions(image_path: Path) -> list[list[int]]:
    """Segment black glyph starts in the regular printing area; no OCR."""
    with Image.open(image_path) as image:
        pixels = np.asarray(image.convert("L"))
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    black = pixels[y0:y1, x0:x1] < 110
    y = np.flatnonzero(black.sum(axis=1) >= 18)
    bands = np.split(y, np.flatnonzero(np.diff(y) > 20) + 1)
    lines = []
    for band in bands:
        if band.size <= 40 or int(band[-1] - band[0]) < 40:
            continue
        ink_row = black[int(band[0]):int(band[-1]) + 1]
        x = np.flatnonzero(ink_row.sum(axis=0) >= 2)
        runs = np.split(x, np.flatnonzero(np.diff(x) > 1) + 1)
        starts = []
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            area = np.argwhere(ink_row[:, left:right])
            if len(area) < 100 or np.ptp(area[:, 0]) < 32:
                continue
            xstart = left + x0
            if 595 <= xstart <= 1800 and np.ptp(area[:, 0]) + 1 >= 70:
                starts.append(xstart)
        if starts:
            lines.append(starts)
    return lines


def source_lines(raw: str, index: int) -> list[str]:
    page = raw.split("%")[index]
    return [s.strip() for s in page.split("/") if any(c in RUNES for c in s)]


def equations(lines: list[str], observed: list[list[int]]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    assert len(lines) == len(observed)
    design, deltas, groups = [], [], []
    for line_id, (text, starts) in enumerate(zip(lines, observed)):
        positions = [j for j, c in enumerate(text) if c in RUNES]
        assert len(positions) == len(starts), (line_id, len(positions), len(starts))
        for j in range(len(starts) - 1):
            segment = text[positions[j]:positions[j + 1]]
            row = [0.] * len(VARIABLES)
            for c in segment:
                if c in IDS:
                    row[IDS[c]] += 1.
            design.append(row)
            deltas.append(starts[j + 1] - starts[j])
            groups.append(line_id)
    return np.asarray(design), np.asarray(deltas), np.asarray(groups)


def main() -> None:
    raw = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
    lines = source_lines(raw, 43)
    positions = glyph_positions(ROOT / "resources/liber-primus/60.jpg")
    design, deltas, group = equations(lines, positions)
    training = group < 7
    widths = np.linalg.lstsq(design[training], deltas[training], rcond=None)[0]

    page44 = source_lines(raw, 44)
    pixel44 = glyph_positions(ROOT / "resources/liber-primus/61.jpg")
    external_a, external_y, _ = equations([page44[0]], [pixel44[0]])
    external_rmse = float(np.sqrt(np.mean((external_a @ widths - external_y)**2)))
    result = {
        "source": "60.jpg", "physical_lp2_page": 43,
        "lines": len(lines), "glyphs": sum(map(len, positions)),
        "training_delta_RMSE_px": float(np.sqrt(np.mean((design[training] @ widths - deltas[training])**2))),
        "heldout_delta_RMSE_px": float(np.sqrt(np.mean((design[~training] @ widths - deltas[~training])**2))),
        "heldout_max_abs_px": float(np.max(np.abs(design[~training] @ widths - deltas[~training]))),
        "independent_page44_first_line_RMSE_px": external_rmse,
        "advance_px": dict(zip(VARIABLES, np.round(widths, 3))),
    }
    assert len(lines) == 12 and sum(map(len, positions)) == 274
    assert external_rmse < 2
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
