"""Original p57 96-dpi GIMP-Dissolve cell grid and JPEG residual controls.

Original inputs: physical p24, p25, p26, p57 = 41.jpg, 42.jpg, 43.jpg, 74.jpg.
The 2400x3600 scans are 400-dpi exports of 6x9-inch pages. The source-grid
map (x+0.5)*400/96 recovers the exact 293x267 p57 cell mask at origin
(158,475) in 576x864 page coordinates. No language or ciphertext is fitted.

Reproduce: python sims/lp2_p57_96dpi_mayfly_dissolve_original_sft.py
Requires NumPy and OpenCV. No writes, passwords, or parameter sweeps.
"""
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"
SCALE = 25 / 6
HEIGHT, WIDTH = 293, 267
CROP_TOP, CROP_LEFT = 475, 158
FOUR_DOTS = [(53, 250), (44, 256), (41, 265), (57, 269)]


def scan(n: int) -> np.ndarray:
    """Return original 400-dpi scan grayscale, no interpolation or re-encoding."""
    raster = cv2.imread(str(SOURCE / f"{n:02}.jpg"), cv2.IMREAD_GRAYSCALE)
    assert raster is not None and raster.shape == (3600, 2400)
    return raster


def to_96dpi(original: np.ndarray) -> np.ndarray:
    """Sample fixed 400/96 pixel centers on a full 576x864 source grid."""
    ys = np.floor((np.arange(864) + 0.5) * SCALE).astype(int)
    xs = np.floor((np.arange(576) + 0.5) * SCALE).astype(int)
    return original[np.ix_(ys, xs)]


def mayfly(original: np.ndarray, threshold: int = 128) -> np.ndarray:
    """Extract the original 293-row by 267-column p57 mayfly crop."""
    source = to_96dpi(original)
    return source[CROP_TOP:CROP_TOP + HEIGHT,
                  CROP_LEFT:CROP_LEFT + WIDTH] < threshold


def gimp_legacy_thresholds() -> np.ndarray:
    """GLib GRand v2.2, GIMP 2.8.10 seed, y rowtable, source-aligned +4/-9.

    The historical g_rand_int_range(0,255) rejects 0xffffffff and reduces
    valid raw MT19937 outputs modulo 255. No rejection occurs in these cells.
    """
    seeds = np.random.RandomState(314159265).randint(
        0, 2**32, size=4096, dtype=np.uint32
    )
    r = np.empty((HEIGHT, WIDTH), dtype=np.uint8)
    for y in range(HEIGHT):
        mt = np.random.RandomState(int(seeds[(y - 9) % 4096]))
        raw = mt.randint(0, 2**32, size=WIDTH + 4, dtype=np.uint32)
        assert not np.any(raw == np.uint32(0xFFFFFFFF))
        r[y] = (raw[4:] % np.uint32(255)).astype(np.uint8)
    return r


def q92(image: np.ndarray) -> np.ndarray:
    """JPEG production control at explicit grayscale quality 92."""
    ok, encoded = cv2.imencode(".jpg", image,
                              [cv2.IMWRITE_JPEG_QUALITY, 92])
    assert ok
    result = cv2.imdecode(encoded, cv2.IMREAD_GRAYSCALE)
    assert result is not None and result.shape == image.shape
    return result


def run() -> None:
    """Assert original support, three no-payload controls and a 64-bit plant."""
    original = scan(74)
    black = mayfly(original)
    assert black.shape == (HEIGHT, WIDTH)
    assert int(black.sum()) == 2033
    assert np.array_equal(black, mayfly(original, 64))
    assert np.array_equal(black, mayfly(original, 192))
    assert all(black[y, x] for x, y in FOUR_DOTS)

    r = gimp_legacy_thresholds()
    assert [int(r[y, x]) for x, y in FOUR_DOTS] == [0, 0, 0, 0]
    # The nonuniform conditional threshold distribution is a consequence of
    # historical GIMP alpha screening, not an independently decoded key.
    assert 51.9 < float(r[black].mean()) < 52.1
    assert 128.9 < float(r[~black].mean()) < 129.2

    # Genuine native page doublet: p24 and p26 use an identical ornament.
    a = scan(41)[1100:2400, 30:530]
    b = scan(42)[1100:2400, 30:530]
    c = scan(43)[1100:2400, 30:530]
    assert np.array_equal(a, c)
    assert np.array_equal(q92(a), q92(c))

    # Editorial one-pixel registration on p25 changes thousands of dark cells.
    aa = a[2:-2, 2:-2] < 128
    unregistered = int(np.count_nonzero(aa != (b[2:-2, 2:-2] < 128)))
    registered = int(np.count_nonzero(aa != (b[1:-3, 1:-3] < 128)))
    assert (unregistered, registered) == (3759, 1693)

    # JPEG-92 grayscale recompression of the *genuine* solved plate is lossless
    # as a binary source-cell channel, even though RGB/JPEG sample values vary.
    assert np.array_equal(black, mayfly(q92(original)))

    # A seeded, prespecified 64-cell overlay is fully detectable even after Q92.
    ys, xs = np.indices(black.shape)
    distance = cv2.distanceTransform(
        (~black).astype(np.uint8), cv2.DIST_L2, 5
    )
    allowed = (~black) & (distance > 5) & (ys > 30) & (ys < 275)
    allowed &= (xs > 30) & (xs < 250)
    possibilities = np.argwhere(allowed)
    np.random.default_rng(3301).shuffle(possibilities)
    planted: list[tuple[int, int]] = []
    for y, x in possibilities:
        y, x = int(y), int(x)
        if all((y - yy)**2 + (x - xx)**2 >= 36 for yy, xx in planted):
            planted.append((y, x))
            if len(planted) == 64:
                break
    assert len(planted) == 64

    forged = original.copy()
    for y, x in planted:
        yy = int(np.floor((CROP_TOP + y + 0.5) * SCALE))
        xx = int(np.floor((CROP_LEFT + x + 0.5) * SCALE))
        forged[yy - 1:yy + 2, xx - 1:xx + 2] = 0
    changed = mayfly(q92(forged)) ^ black
    actual = {(int(y), int(x)) for y, x in np.argwhere(changed)}
    assert actual == set(planted)

    print({
        "p57_mask": [HEIGHT, WIDTH],
        "source96_origin_xy": [CROP_LEFT, CROP_TOP],
        "original_black_cells": int(black.sum()),
        "four_isolated_dot_thresholds": [int(r[y, x]) for x, y in FOUR_DOTS],
        "mean_gimp_R_black": float(r[black].mean()),
        "mean_gimp_R_white": float(r[~black].mean()),
        "p57_q92_cell_changes": 0,
        "p24_p26_exact_artwork_pixel_differences": 0,
        "p24_p25_dark_mismatch_unregistered": unregistered,
        "p24_p25_dark_mismatch_onepixel_registered": registered,
        "Q92_planted_overlay_cells_recovered": len(actual),
        "Q92_planted_false_positives": len(actual - set(planted))
    })
    print("PASS: native p57 source-grid recovery and historical noise; "
          "no manuscript payload, key or unknown plaintext established")


if __name__ == "__main__":
    run()
