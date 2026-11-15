"""Original p24 -> solved p57 GIMP 2.8 Dissolve artwork reproduction.

Read-only, source-JPEG SFT. Requires Pillow, NumPy, SciPy, native
GLib 2.2-compatible GRand and original repository JPEGs 41.jpg/74.jpg.
The affine parameters were fitted on 80% of the 60,260 source cells
and are locked before measuring the separate 20% spatial holdout.
This is artwork provenance evidence, not a recovered LP2 cipher key.
"""
from __future__ import annotations

import ctypes
import ctypes.util
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
GIMP_SEED = 314159265
# p24 grayscale image to original p57 source-cell coordinates.
# x24 = cx + ax*(x57 - 288) + bx*(y57 - 546)
# y24 = cy + by*(x57 - 288) + ay*(y57 - 546)
FROZEN = (
    305.2531733391564,
    1325.5363430764332,
    2.475652678422321,
    -0.004331912807886796,
    -0.021703222539651595,
    2.5579697154729297,
    0.8107181307630735,
)


def gray_jpeg(n: int) -> np.ndarray:
    with Image.open(SOURCE / f"{n:02d}.jpg") as image:
        assert image.size == (2400, 3600)
        return np.asarray(image.convert("L"))


def native_raster(gray: np.ndarray) -> np.ndarray:
    """Invert exact 25/6 enlargement: source 576x864, scan 2400x3600."""
    bx = np.array([(25 * k + 2) // 6 for k in range(577)])
    by = np.array([(25 * k + 3) // 6 for k in range(865)])
    assert (bx[-1], by[-1]) == (2400, 3600)
    raw = gray[((by[:-1] + by[1:]) // 2)[:, None],
               ((bx[:-1] + bx[1:]) // 2)[None, :]] < 128
    assert raw.shape == (864, 576)
    assert np.count_nonzero(raw[460:800]) == 2033
    return raw


def historical_gimp_field() -> np.ndarray:
    """GIMP 2.8 paint-composite Dissolve 4096-row GRand field."""
    name = ctypes.util.find_library("glib-2.0")
    assert name, "2014-compatible GLib GRand library is required"
    lib = ctypes.CDLL(name)
    lib.g_rand_new_with_seed.argtypes = [ctypes.c_uint32]
    lib.g_rand_new_with_seed.restype = ctypes.c_void_p
    lib.g_rand_int.argtypes = [ctypes.c_void_p]
    lib.g_rand_int.restype = ctypes.c_uint32
    lib.g_rand_int_range.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int]
    lib.g_rand_int_range.restype = ctypes.c_int
    lib.g_rand_free.argtypes = [ctypes.c_void_p]

    root = lib.g_rand_new_with_seed(GIMP_SEED)
    try:
        seeds = [lib.g_rand_int(root) for _ in range(4096)]
    finally:
        lib.g_rand_free(root)
    assert seeds[:8] == [
        3721122731, 618219707, 807213306, 3144837749,
        3447982176, 3230631767, 755972506, 1398685501,
    ]

    result = np.empty((262, 230), dtype=np.uint8)
    for row, yy in enumerate(range(3, 265)):
        state = lib.g_rand_new_with_seed(seeds[yy])
        try:
            for xx in range(254):
                value = lib.g_rand_int_range(state, 0, 255)
                if xx >= 24:
                    result[row, xx - 24] = value
        finally:
            lib.g_rand_free(state)
    return result


def score(actual: np.ndarray, predicted: np.ndarray, use: np.ndarray) -> dict:
    tp = int(np.count_nonzero(actual & predicted & use))
    fp = int(np.count_nonzero(~actual & predicted & use))
    fn = int(np.count_nonzero(actual & ~predicted & use))
    tn = int(np.count_nonzero(~actual & ~predicted & use))
    return {"TP": tp, "FP": fp, "FN": fn, "TN": tn,
            "F1": 2 * tp / (2 * tp + fp + fn)}


def main() -> None:
    original_p57 = gray_jpeg(74)
    native = native_raster(original_p57)

    # The low-res insect and high-res printed runes were composited as
    # distinct layers: the same 25:6 reconstruction fits only the insect.
    xb = np.array([(25 * k + 2) // 6 for k in range(577)])
    yb = np.array([(25 * k + 3) // 6 for k in range(865)])

    def reprojection_errors(x0: int, x1: int, y0: int, y1: int) -> int:
        ix = np.searchsorted(xb, np.arange(x0, x1), side="right") - 1
        iy = np.searchsorted(yb, np.arange(y0, y1), side="right") - 1
        return int(np.count_nonzero(
            native[iy[:, None], ix[None, :]] !=
            (original_p57[y0:y1, x0:x1] < 128)
        ))

    image_error = reprojection_errors(530, 1890, 1900, 3180)
    text_error = reprojection_errors(350, 1880, 900, 1300)
    assert image_error == 1474
    assert text_error == 17842

    actual = native[487:749, 178:408]
    assert actual.shape == (262, 230)
    assert np.count_nonzero(actual) == 2033
    noise = historical_gimp_field()

    # Coordinates independently published for all four isolated p57 dots
    # in SECRA, reconciled with full original source canvas.
    for sx, sy in [(211, 725), (202, 731), (199, 740), (215, 744)]:
        assert native[sy, sx]
        assert noise[sy - 487, sx - 178] == 0

    yy, xx = np.mgrid[487:749, 178:408]
    cx, cy, ax, bx, by, ay, gain = FROZEN
    xp = cx + ax * (xx - 288) + bx * (yy - 546)
    yp = cy + by * (xx - 288) + ay * (yy - 546)
    p24_blurred = gaussian_filter(gray_jpeg(41).astype(np.float32), 1.2)
    darkness = 255 - map_coordinates(
        p24_blurred, [yp, xp], order=1, mode="constant", cval=255)
    opacity = np.clip(gain * darkness, 0, 255)
    prediction = noise < opacity

    # 20% fixed 10x10-block spatial holdout, declared before optimization.
    heldout = (xx // 10 + 3 * (yy // 10)) % 5 == 0
    training = score(actual, prediction, ~heldout)
    holdout = score(actual, prediction, heldout)
    east_wrong = score(actual, np.roll(noise, 1, axis=1) < opacity, heldout)
    south_wrong = score(actual, np.roll(noise, 1, axis=0) < opacity, heldout)

    assert (training["TP"], training["FP"], training["FN"]) == (1279, 308, 286)
    assert (holdout["TP"], holdout["FP"], holdout["FN"]) == (370, 71, 98)
    assert abs(holdout["F1"] - 0.8140814081408141) < 1e-12
    assert east_wrong["F1"] < .40 and south_wrong["F1"] < .40

    print({
        "original_jpegs": ["41.jpg", "74.jpg"],
        "source_dimensions": [576, 864],
        "p57_black_source_cells": 2033,
        "insect_pixel_reprojection": [image_error, 1740800],
        "printed_text_pixel_reprojection": [text_error, 612000],
        "historical_gimp_seed": GIMP_SEED,
        "training": training,
        "spatial_holdout": holdout,
        "wrong_field_east_1": east_wrong,
        "wrong_field_south_1": south_wrong,
        "conclusion": "GIMP rendering source corroborated, no extracted payload",
    })


if __name__ == "__main__":
    main()
