"""Read-only original-JPEG curved GIMP Dissolve forward model (Agent18).

Reproduces 2014 GIMP 2.8 row-based GRand thresholds and the original
source-native 576×864 p57 artwork. The 19 nonlinear parameters were fit
against the complementary 80% of source cell positions only. The
precommitted frozen values are independently evaluated on the exact
20% heldout original cells, and on the separate p26 JPEG artwork copy.

Run: python sims/lp2_p57_gimp_curved_holdout_original_sft.py
Requires Python 3.11, NumPy, SciPy, Pillow, and native GLib 2.
No files are written.
"""
from __future__ import annotations

import ctypes
import ctypes.util
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates, label

ROOT = Path(__file__).resolve().parent.parent
SEED = 314159265
BASE = np.array([
    305.2531733391564, 1325.5363430764332,
    2.475652678422321, -0.004331912807886796,
    -0.021703222539651595, 2.5579697154729297,
    0.8107181307630735
])
# Fitted on training cells only with 19-variable bounded SciPy L-BFGS-B
# smooth Bernoulli loss and 2.3-unit GIMP threshold temperature. These are
# geometric and photometric corrections to the fixed 7-parameter baseline.
CURVE = np.array([
    6.648329677696025, -13.390632345084459, -2.2003501768699674,
    -18.17847837152754, 8.72485576595383, 22.011214989290483,
    3.5015433326268557, 1.0265105487458563, -7.060758846199755,
    0.9485376341692032, -5.679340252499198, 0.18225717000319988,
    1.6536247132010502, 10.388868777752238, -0.2688797800469643,
    -0.17689384080403128, -0.10686590555360906, -0.3,
    -0.09031552996863368
])

def read_image(image_number: int) -> np.ndarray:
    with Image.open(ROOT / "resources" / "liber-primus" /
                    f"{image_number:02d}.jpg") as img:
        assert img.size == (2400, 3600)
        return np.asarray(img.convert("L"), dtype=np.float32)

def gimp_field() -> np.ndarray:
    dll = ctypes.util.find_library("glib-2.0")
    assert dll, "Historical GLib 2 native generator is required"
    glib = ctypes.CDLL(dll)
    glib.g_rand_new_with_seed.argtypes = [ctypes.c_uint32]
    glib.g_rand_new_with_seed.restype = ctypes.c_void_p
    glib.g_rand_int.argtypes = [ctypes.c_void_p]
    glib.g_rand_int.restype = ctypes.c_uint32
    glib.g_rand_int_range.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int]
    glib.g_rand_int_range.restype = ctypes.c_int
    glib.g_rand_free.argtypes = [ctypes.c_void_p]

    root = glib.g_rand_new_with_seed(SEED)
    try:
        seeds = [glib.g_rand_int(root) for _ in range(4096)]
    finally:
        glib.g_rand_free(root)
    assert seeds[:8] == [
        3721122731, 618219707, 807213306, 3144837749,
        3447982176, 3230631767, 755972506, 1398685501
    ]
    raster = np.empty((262, 230), dtype=np.uint8)
    for y in range(262):
        state = glib.g_rand_new_with_seed(seeds[y + 3])
        try:
            raw = [glib.g_rand_int_range(state, 0, 255) for _ in range(254)]
        finally:
            glib.g_rand_free(state)
        raster[y] = raw[24:254]
    for x, y in [(211, 725), (202, 731), (199, 740), (215, 744)]:
        assert raster[y - 487, x - 178] == 0
    return raster

def native_p57() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    original = read_image(74)
    x = np.arange(178, 408)
    y = np.arange(487, 749)
    xc = ((25 * x + 2) // 6 + (25 * (x + 1) + 2) // 6) // 2
    yc = ((25 * y + 3) // 6 + (25 * (y + 1) + 3) // 6) // 2
    dark = original[np.ix_(yc, xc)] < 128
    assert dark.shape == (262, 230)
    assert int(dark.sum()) == 2033
    X, Y = np.meshgrid(x.astype(float), y.astype(float))
    hold = ((np.floor(X / 10) + 3 * np.floor(Y / 10)) % 5) == 0
    assert int(hold.sum()) == 12070
    assert int((dark & hold).sum()) == 468
    return dark, hold, X, Y

def predicted(source_image: np.ndarray, X: np.ndarray,
              Y: np.ndarray, rng: np.ndarray,
              curved: bool) -> tuple[np.ndarray, np.ndarray]:
    cx, cy, ax, bx, by, ay, baseline_gain = BASE
    x = cx + ax * (X - 288) + bx * (Y - 546)
    y = cy + by * (X - 288) + ay * (Y - 546)
    gain = np.full(X.shape, baseline_gain)
    if curved:
        u, v = (X - 288) / 115, (Y - 620) / 131
        shape = [u*u, u*v, v*v, u*u*u, u*u*v, u*v*v, v*v*v]
        g_shape = [u, v, u*u, u*v, v*v]
        x += sum(CURVE[i] * term for i, term in enumerate(shape))
        y += sum(CURVE[i + 7] * term for i, term in enumerate(shape))
        gain *= np.maximum(
            .12, 1 + sum(CURVE[i + 14] * term for i, term in enumerate(g_shape))
        )
    blurred = gaussian_filter(source_image, 1.2)
    luma = map_coordinates(blurred, [y, x], order=1,
                           mode="nearest", prefilter=False)
    alpha = np.clip(gain * (255 - luma), 0, 255)
    return rng < alpha, alpha

def stats(actual: np.ndarray, guess: np.ndarray,
          selected: np.ndarray) -> tuple[int, int, int, int, float]:
    tp = int((selected & actual & guess).sum())
    fp = int((selected & ~actual & guess).sum())
    fn = int((selected & actual & ~guess).sum())
    tn = int((selected & ~actual & ~guess).sum())
    return tp, fp, fn, tn, 2 * tp / (2 * tp + fp + fn)

def main() -> None:
    rng = gimp_field()
    actual, held, X, Y = native_p57()
    p24, p26 = read_image(41), read_image(43)
    base_guess, _ = predicted(p24, X, Y, rng, False)
    old_train = stats(actual, base_guess, ~held)
    old_test = stats(actual, base_guess, held)
    assert old_train[:3] == (1279, 308, 286)
    assert old_test[:3] == (370, 71, 98)
    print("SEVEN_PARAM original p24 train", old_train,
          "heldout", old_test)

    for image_number, image in [(41, p24), (43, p26)]:
        guess, alpha = predicted(image, X, Y, rng, True)
        train = stats(actual, guess, ~held)
        test = stats(actual, guess, held)
        both = stats(actual, guess, np.ones(held.shape, dtype=bool))
        print(f"NINETEEN_PARAM original p{image_number-17} train",
              train, "heldout", test, "all", both)
        if image_number == 41:
            assert train[:3] == (1301, 235, 264)
            assert test[:3] == (381, 58, 87)
            assert both[:3] == (1682, 293, 351)
            missed = actual & ~guess
            components, count = label(missed, structure=np.ones((3, 3)))
            print("UNPREDICTED_ORIGINAL_CELLS", int(missed.sum()),
                  "distinct_8connected_components", count)
            assert count == 269
            for x, y in [(211, 725), (202, 731),
                         (199, 740), (215, 744)]:
                gy, gx = y - 487, x - 178
                print("DISTINCT_DOT", x, y, "GIMP_R",
                      int(rng[gy, gx]), "FLOAT_ALPHA",
                      float(alpha[gy, gx]), "SUBINTEGER",
                      bool(alpha[gy, gx] < 1))
                assert float(alpha[gy, gx]) < 1
        else:
            assert train[:3] == (1301, 234, 264)
            assert test[:3] == (381, 58, 87)
            assert both[:3] == (1682, 292, 351)
    print("SOURCE_ONLY_HOLDOUT_PASS; NO_PLAINTEXT_OR_PAYLOAD")

if __name__ == "__main__":
    main()
