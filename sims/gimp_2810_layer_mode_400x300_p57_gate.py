#!/usr/bin/env python3
"""Test the distinct GIMP 2.8.10 layer-mode Dissolve LUT against LP2 p57.

GIMP 2.8.10 has two distinct Dissolve paths:
* app/composite/gimp-composite-generic.c: 4096 row-seed table, seed 314159265
  (the field studied in gimp-dissolve-source-pad-gate.md);
* app/gegl/gimpoperationpointlayermode.c: 400x300 LUT, seed 737893334
  (the separate layer-mode implementation tested here).

This script tests only the latter. It maps dark pixels from the p57 lower
illustration into the 400x300 periodic field and scans every cyclic offset and
four axis-aligned orientations. The statistic is the mean normalized LUT
value at observed dark pixels: a partially transparent black source layer
should preferentially reveal low LUT values. This is a bounded screen, not a
complete reconstruction of an unknown source alpha layer.
"""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "74.jpg"
WIDTH, HEIGHT, SEED = 400, 300, 737893334
CROP = (500, 1700, 1850, 3200)
REFERENCE_FIRST8 = [1456167734, 2419149774, 2124798443, 1440698034,
                    2570123175, 2214556015, 2345487950, 451258718]


def glib_mt(seed: int, n: int, legacy_20: bool = False) -> np.ndarray:
    """GLib GRand MT19937 g_rand_int stream for G_RANDOM_VERSION 2.2 or 2.0."""
    N, M = 624, 397
    MATRIX_A, UPPER, LOWER = 0x9908B0DF, 0x80000000, 0x7FFFFFFF
    mt = [0] * N
    mt[0] = seed & 0xFFFFFFFF
    for i in range(1, N):
        prev = mt[i - 1]
        mt[i] = ((69069 * prev) if legacy_20 else
                 (1812433253 * (prev ^ (prev >> 30)) + i)) & 0xFFFFFFFF
    mti = N
    out = np.empty(n, dtype=np.uint32)
    for k in range(n):
        if mti >= N:
            for kk in range(N - M):
                y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER)
                mt[kk] = (mt[kk + M] ^ (y >> 1) ^
                          (MATRIX_A if y & 1 else 0)) & 0xFFFFFFFF
            for kk in range(N - M, N - 1):
                y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER)
                mt[kk] = (mt[kk + (M - N)] ^ (y >> 1) ^
                          (MATRIX_A if y & 1 else 0)) & 0xFFFFFFFF
            y = (mt[N - 1] & UPPER) | (mt[0] & LOWER)
            mt[N - 1] = (mt[M - 1] ^ (y >> 1) ^
                         (MATRIX_A if y & 1 else 0)) & 0xFFFFFFFF
            mti = 0
        y = mt[mti]
        mti += 1
        y ^= y >> 11
        y ^= (y << 7) & 0x9D2C5680
        y ^= (y << 15) & 0xEFC60000
        y ^= y >> 18
        out[k] = y & 0xFFFFFFFF
    return out


def scan(field: np.ndarray, count: np.ndarray) -> dict:
    corr = np.fft.ifft2(np.conj(np.fft.fft2(count)) *
                        np.fft.fft2(field)).real
    lo = np.unravel_index(np.argmin(corr), corr.shape)
    hi = np.unravel_index(np.argmax(corr), corr.shape)
    total = float(count.sum())
    return {
        "min_mean": float(corr[lo] / total), "min_offset_yx": list(map(int, lo)),
        "max_mean": float(corr[hi] / total), "max_offset_yx": list(map(int, hi)),
        "mean_over_offsets": float(corr.mean() / total),
        "std_over_offsets": float(corr.std() / total),
    }


def main() -> None:
    gray = np.asarray(Image.open(IMAGE).convert("L"))
    assert gray.shape == (3600, 2400), gray.shape
    page_sizes = Counter(Image.open(p).size for p in
                         sorted((ROOT / "resources/liber-primus").glob("*.jpg")))
    assert page_sizes == {(2400, 3600): 75}, page_sizes
    left, top, right, bottom = CROP
    dark = gray[top:bottom, left:right] < 128
    yy, xx = np.nonzero(dark)
    count = np.zeros((HEIGHT, WIDTH), dtype=np.float64)
    np.add.at(count, ((yy + top) % HEIGHT, (xx + left) % WIDTH), 1)
    modern = glib_mt(SEED, WIDTH * HEIGHT)
    assert modern[:8].tolist() == REFERENCE_FIRST8
    legacy = glib_mt(SEED, WIDTH * HEIGHT, legacy_20=True)
    result = {
        "source": str(IMAGE.relative_to(ROOT)), "image_size": [2400, 3600],
        "page_dimension_counts": {f"{w}x{h}": n for (w, h), n in page_sizes.items()},
        "crop_xyxy": list(CROP), "dark_pixels": int(dark.sum()),
        "occupied_periodic_cells": int(np.count_nonzero(count)),
        "effective_cells": float(count.sum() ** 2 / (count ** 2).sum()),
        "lut": {"width": WIDTH, "height": HEIGHT, "seed": SEED},
        "glib_2_2": {}, "glib_2_0_sensitivity": {},
    }
    for name, stream in [("glib_2_2", modern), ("glib_2_0_sensitivity", legacy)]:
        field = stream.reshape(HEIGHT, WIDTH).astype(np.float64) / 0xFFFFFFFF
        for orientation, oriented in [
            ("normal", field), ("flip_x", np.fliplr(field)),
            ("flip_y", np.flipud(field)),
            ("flip_xy", np.flipud(np.fliplr(field))),
        ]:
            result[name][orientation] = scan(oriented, count)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
