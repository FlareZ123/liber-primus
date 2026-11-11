#!/usr/bin/env python3
"""Recover p57 native dot lattice and test historical GIMP field.

Single runnable test from repository root:
    python sims/lp2_stipple_native_gimp_sft.py

Input: resources/liber-primus/74.jpg. Uses NumPy and OpenCV.
The SECRA GIMP offset is a published source input, not a fitted LP2 key.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus" / "74.jpg"
CROP = (350, 1900, 2050, 3450)
SECRA_FOUR_DOTS = [(53, 250), (44, 256), (41, 265), (57, 269)]
SECRA_GIMP_SHIFT = (4, -9)


def fit_lattice_pitch(single_dot_stats: np.ndarray, axis: int) -> tuple[float, float, float]:
    """Estimate the native pitch from isolated 4x4 / 4x5 enlarged raster dots."""
    centers = (single_dot_stats[:, axis]
               + single_dot_stats[:, axis + 2] / 2 + CROP[axis])
    candidates = np.arange(4.15, 4.18, 0.0001)
    phases = np.exp((2j * np.pi * centers[:, None]) / candidates[None, :]).mean(axis=0)
    index = int(np.abs(phases).argmax())
    pitch = float(candidates[index])
    phase = float(np.angle(phases[index]) * pitch / (2 * np.pi))
    return pitch, phase, float(abs(phases[index]))


def native_grid(gray: np.ndarray) -> tuple[np.ndarray, np.ndarray, dict]:
    x0, y0, x1, y1 = CROP
    mask = (gray[y0:y1, x0:x1] < 128).astype(np.uint8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    assert count - 1 == 574
    dots = stats[1:][np.isin(stats[1:, cv2.CC_STAT_AREA], [16, 20])]
    assert len(dots) > 350
    px, ox, qx = fit_lattice_pitch(dots, 0)
    py, oy, qy = fit_lattice_pitch(dots, 1)
    assert 4.162 < px < 4.165 and 4.164 < py < 4.168, (px, py)
    assert min(qx, qy) > 0.93
    xx = ox + px * np.arange(600)
    yy = oy + py * np.arange(900)
    ix = np.flatnonzero((xx >= x0) & (xx < x1))
    iy = np.flatnonzero((yy >= y0) & (yy < y1))
    cells = (gray[np.ix_(np.rint(yy[iy]).astype(int),
                          np.rint(xx[ix]).astype(int))] < 128).astype(np.uint8)
    return cells, xx[ix], {
        "pitch_x": px, "pitch_y": py, "phase_x": ox, "phase_y": oy,
        "concentration_x": qx, "concentration_y": qy,
        "original_components": count - 1, "single_dot_samples": int(len(dots)),
    }


def four_dot_translation(cells: np.ndarray, labels: np.ndarray,
                         stats: np.ndarray) -> tuple[int, int]:
    yy, xx = np.where(cells != 0)
    present = set(zip(xx.tolist(), yy.tolist()))
    translations = []
    for x, y in present:
        dx, dy = x - SECRA_FOUR_DOTS[0][0], y - SECRA_FOUR_DOTS[0][1]
        coords = [(u + dx, v + dy) for u, v in SECRA_FOUR_DOTS]
        if (all(p in present for p in coords)
                and all(int(stats[labels[v, u], cv2.CC_STAT_AREA]) == 1
                        for u, v in coords)):
            translations.append((dx, dy))
    assert translations == [(74, 19)], translations
    return translations[0]


def gimp_field() -> np.ndarray:
    master = np.random.RandomState(314159265)
    seeds = master.randint(0, 2**32, size=4096, dtype=np.uint32)
    assert seeds[:3].tolist() == [3721122731, 618219707, 807213306]
    field = np.empty((4096, 400), dtype=np.uint8)
    for y, seed in enumerate(seeds):
        raw = np.random.RandomState(int(seed)).randint(
            0, 2**32, size=400, dtype=np.uint32)
        assert not np.any(raw == 0xFFFFFFFF), "GLib range rejection required"
        field[y, :] = raw % 255
    return field


def main() -> None:
    gray = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert gray is not None and gray.shape == (3600, 2400)
    cells, xnative, lattice = native_grid(gray)
    count, labels, stats, centers = cv2.connectedComponentsWithStats(cells, connectivity=8)
    assert (int(cells.sum()), count - 1) == (2033, 574)
    areas = stats[1:, cv2.CC_STAT_AREA]
    top2 = np.argsort(areas)[-2:]
    keep = np.ones(len(areas), dtype=bool)
    keep[top2] = False
    x_component = np.interp(
        centers[1:, 0][keep], np.arange(len(xnative)), xnative)
    left = int(np.count_nonzero(x_component < 1200))
    right = int(np.count_nonzero(x_component >= 1200))
    assert (left, right) == (241, 331), (left, right)

    dx, dy = four_dot_translation(cells, labels, stats)
    field = gimp_field()
    four = [int(field[v + SECRA_GIMP_SHIFT[1],
                      u + SECRA_GIMP_SHIFT[0]])
            for u, v in SECRA_FOUR_DOTS]
    assert four == [0, 0, 0, 0], four
    yy, xx = np.where(cells != 0)
    gx = xx - dx + SECRA_GIMP_SHIFT[0]
    gy = yy - dy + SECRA_GIMP_SHIFT[1]
    assert gx.min() >= 0 and gx.max() + 127 < field.shape[1]
    assert gy.min() >= 0 and gy.max() < field.shape[0]
    actual = float(field[gy, gx].mean())
    shifts = np.random.default_rng(3301).integers(0, 128, size=(2000, 2))
    controls = np.array([
        float(field[(gy + int(sy)) % 4096, gx + int(sx)].mean())
        for sx, sy in shifts if sx != 0 or sy != 0
    ])
    assert len(controls) >= 1900 and not np.any(controls <= actual)

    print(json.dumps({
        "status": "native-raster and software-rendering consistency; no LP2 key or plaintext",
        "source": "resources/liber-primus/74.jpg",
        "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "lattice": lattice,
        "native_shape": list(cells.shape),
        "black_cells": int(cells.sum()),
        "components": int(count - 1),
        "components_excluding_two_largest_left_right": [left, right],
        "unique_four_isolated_dots_translation": [dx, dy],
        "historical_GIMP_thresholds_at_four_dots": four,
        "historical_GIMP_mean_at_black_cells": actual,
        "nonzero_shift_control_count": int(len(controls)),
        "shift_control_min_median_max": [
            float(controls.min()), float(np.median(controls)),
            float(controls.max())],
        "shift_controls_at_or_below_actual": int(np.count_nonzero(controls <= actual)),
        "limitation": ("The published GIMP offset is used as input. "
                       "Independent source opacity has not yet predicted "
                       "the exact 574/241/331 component split."),
    }, indent=2))


if __name__ == "__main__":
    main()
