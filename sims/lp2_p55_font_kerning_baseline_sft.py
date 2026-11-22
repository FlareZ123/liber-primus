#!/usr/bin/env python3
"""Native-font spacing control on LP2 p55, original scan pixels and transcript.

Run: python sims/lp2_p55_font_kerning_baseline_sft.py
Needs NumPy and Pillow. Source geometry and advance-model methods are shared
with source_glyph_advance_inversion.py; no OCR, plaintext fitting or RNG.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from source_glyph_advance_inversion import (
    RUNES, equations, glyph_positions, source_lines,
)

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "resources" / "liber-primus"


def source_register(page: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    text = (ROOT / "resources" / "lp2-transcription.txt").read_text(encoding="utf-8")
    # The runeless physical p50 grid has no ordinary text transcript record.
    lines = source_lines(text, page - int(page >= 50))
    observed = glyph_positions(IMG / f"{page + 17:02d}.jpg")
    if page == 55:
        # The original page has an 86px-high red terminal 13-dot mark
        # and a separate tree illustration: neither is a GP rune.
        assert [len(line) for line in observed] == [24, 22, 22, 9, 1]
        assert len(lines) == 4
        observed = observed[:len(lines)]
        observed = [
            row[:sum(char in RUNES for char in line)]
            for row, line in zip(observed, lines)
        ]
    A, y, labels = equations(lines, observed)
    return A, y, labels


def main() -> None:
    source, gaps, line_ids = source_register(43)
    target, measured, _ = source_register(55)
    training = line_ids < 7
    assert len(gaps) == 262 and int(training.sum()) == 152
    assert len(measured) == 72
    fit = np.linalg.lstsq(source[training], gaps[training], rcond=None)[0]

    def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
        return float(np.sqrt(np.mean((actual - predicted) ** 2)))

    train = rmse(gaps[training], source[training] @ fit)
    heldout = rmse(gaps[~training], source[~training] @ fit)
    original = rmse(measured, target @ fit)
    max_abs_holdout = float(np.max(np.abs(gaps[~training] - source[~training] @ fit)))
    max_abs_original = float(np.max(np.abs(measured - target @ fit)))

    # Planted spacing-channel control: inject a 3px mark at every other gap.
    plant = measured.copy()
    plant[::2] += 3
    planted = rmse(plant, target @ fit)
    assert round(train, 6) == 0.498559
    assert round(heldout, 6) == 0.720755
    assert round(original, 6) == 0.568009
    assert round(max_abs_original, 6) == 1.375
    assert original < heldout < planted

    print(json.dumps({
        "source": {"training": "60.jpg (first 7 lines)",
                   "holdout": "60.jpg (last 5 lines)",
                   "target": "72.jpg (four textual lines)"},
        "gaps": {"training": int(training.sum()),
                 "holdout": int((~training).sum()),
                 "target": len(measured)},
        "rmse_pixels": {"training": train,
                        "independent_heldout": heldout,
                        "p55_original": original,
                        "p55_planted_alternating_3px": planted},
        "max_abs_error_pixels": {"independent_heldout": max_abs_holdout,
                                 "p55_original": max_abs_original},
        "interpretation": (
            "Original p55 spacing fits independent native print advances "
            "better than source holdout; no distinct >=3px alternating "
            "kerning channel or unknown LP2 plaintext has been found."
        ),
    }, indent=2))


if __name__ == "__main__":
    main()
