"""Original-JPEG p24/p57 Dissolve no-payload and planted-overlay gate (#740).

Requires Pillow, NumPy, OpenCV and system GLib 2.0. Source JPEGs are not edited.
The seven affine/tone settings are a frozen exploratory fit, not GIMP history.
"""
from __future__ import annotations

import ctypes
import ctypes.util
import hashlib
import io
import json
import os
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(os.environ.get('LP2_RESOURCE_DIR', ROOT / 'resources/liber-primus'))
H, W = 274, 293
# One exactly matching nearest-neighbor enlargement of the p57 cell mask.
GRID_X0, GRID_Y0, GRID_SX, GRID_SY = (
    658.68563726, 1979.37631256, 4.16364299, 4.16621713,
)
# Locked source registration/tonality from a seven-parameter 65%-tile fit.
# Pixel coordinates refer to original physical p24 (41.jpg), NOT a model key.
X0, Y0, SX, SY, SKEW, GAMMA, GAIN = (
    -23.476689081679787, 1157.9880729131057,
    2.5182724150007676, 2.399729459426211,
    0.007736420992813517, 1.0066713104228624,
    0.9040711924709398,
)


def grayscale(filename: str) -> tuple[np.ndarray, str]:
    data = (ASSETS / filename).read_bytes()
    return np.asarray(Image.open(io.BytesIO(data)).convert('L')), hashlib.sha256(data).hexdigest()


def historical_thresholds() -> np.ndarray:
    glib = ctypes.CDLL(ctypes.util.find_library('glib-2.0'))
    glib.g_rand_new_with_seed.argtypes = [ctypes.c_uint32]
    glib.g_rand_new_with_seed.restype = ctypes.c_void_p
    glib.g_rand_int.argtypes = [ctypes.c_void_p]
    glib.g_rand_int.restype = ctypes.c_uint32
    glib.g_rand_int_range.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int]
    glib.g_rand_int_range.restype = ctypes.c_int
    glib.g_rand_free.argtypes = [ctypes.c_void_p]
    master = glib.g_rand_new_with_seed(314159265)
    row_seed = [glib.g_rand_int(master) for _ in range(4096)]
    glib.g_rand_free(master)
    field = np.empty((H, W), dtype=np.uint8)
    for row in range(H):
        random = glib.g_rand_new_with_seed(row_seed[(row - 9) % 4096])
        for _ in range(4):
            glib.g_rand_int(random)
        for col in range(W):
            field[row, col] = glib.g_rand_int_range(random, 0, 255)
        glib.g_rand_free(random)
    return field


def alpha_from_plate(page: np.ndarray, dx: int = 0, dy: int = 0) -> np.ndarray:
    source = cv2.GaussianBlur(np.float32(page[1100:1830, :600]), (0, 0), 1.2)
    col, row = np.meshgrid(np.arange(W, dtype=np.float32),
                           np.arange(H, dtype=np.float32))
    mx = np.float32(X0 + SX * col + SKEW * row + dx)
    my = np.float32(Y0 + SY * row - 1100 + dy)
    values = cv2.remap(source, mx, my, cv2.INTER_LINEAR,
                       borderMode=cv2.BORDER_CONSTANT, borderValue=255)
    return np.clip(((255.0 - values) / 255.0) ** GAMMA * GAIN * 255.0, 0, 255)


def recovered_jpeg_mask(bits: np.ndarray, quality: int = 92) -> np.ndarray:
    col_edges = np.rint(658 + np.arange(W + 1) * (25 / 6)).astype(int)
    row_edges = np.rint(1979 + np.arange(H + 1) * (25 / 6)).astype(int)
    center_x = np.rint(658 + (np.arange(W) + .5) * (25 / 6)).astype(int)
    center_y = np.rint(1979 + (np.arange(H) + .5) * (25 / 6)).astype(int)
    canvas = np.full((3600, 2400), 255, dtype=np.uint8)
    for row in range(H):
        for col in np.flatnonzero(bits[row]):
            canvas[row_edges[row]:row_edges[row + 1],
                   col_edges[col]:col_edges[col + 1]] = 0
    output = io.BytesIO()
    Image.fromarray(canvas).save(output, format='JPEG', quality=quality)
    restored = np.asarray(Image.open(io.BytesIO(output.getvalue())).convert('L'))
    return restored[np.ix_(center_y, center_x)] < 128


def f1(predicted: np.ndarray, actual: np.ndarray, select: np.ndarray) -> dict:
    tp = int(np.count_nonzero(predicted & actual & select))
    fp = int(np.count_nonzero(predicted & ~actual & select))
    fn = int(np.count_nonzero(~predicted & actual & select))
    return {'tp': tp, 'fp': fp, 'fn': fn,
            'f1': 2 * tp / (2 * tp + fp + fn)}


def run() -> dict:
    p24, h24 = grayscale('41.jpg')
    p25, h25 = grayscale('42.jpg')
    p26, h26 = grayscale('43.jpg')
    p57, h57 = grayscale('74.jpg')
    cols = np.rint(658 + (np.arange(W) + .5) * 25 / 6).astype(int)
    rows = np.rint(1979 + (np.arange(H) + .5) * 25 / 6).astype(int)
    target = p57[np.ix_(rows, cols)] < 128
    field = historical_thresholds()
    dots = [(53, 250), (44, 256), (41, 265), (57, 269)]
    assert target.sum() == 2033
    # Reproduce the full original physical pixel mask, not merely centers.
    edges_x = np.rint(GRID_X0 + np.arange(W + 1) * GRID_SX).astype(int)
    edges_y = np.rint(GRID_Y0 + np.arange(H + 1) * GRID_SY).astype(int)
    decoded_native = np.zeros_like(p57, dtype=bool)
    for ir in range(H):
        for ic in np.flatnonzero(target[ir]):
            decoded_native[edges_y[ir]:edges_y[ir + 1],
                           edges_x[ic]:edges_x[ic + 1]] = True
    roi = (slice(1900, 3200), slice(600, 1900))
    native_errors = {}
    for threshold in (64, 128, 192):
        native_errors[str(threshold)] = int(np.count_nonzero(
            decoded_native[roi] != (p57[roi] < threshold)))
    assert native_errors == {'64': 0, '128': 0, '192': 0}
    assert all(target[r, c] and field[r, c] == 0 for c, r in dots)
    assert np.array_equal(p24[900:2500, :600], p26[900:2500, :600])
    a24 = alpha_from_plate(p24)
    clean = a24 > field
    assert np.array_equal(clean, alpha_from_plate(p26) > field)
    # A source-native near-copy, registered by image shape at dx=dy=-1.
    a25 = alpha_from_plate(p25, dx=-1, dy=-1)
    natural = a25 > field
    rng = np.random.default_rng(3301)
    tile_train = rng.random((H // 16 + 1, W // 16 + 1)) < .65
    rr, cc = np.indices((H, W))
    train = tile_train[rr // 16, cc // 16]
    tone = {}
    for level in (1, 2, 4):
        for direction in (1, -1):
            changed_alpha = a24.copy()
            active = a24 > 0
            changed_alpha[active] = np.clip(changed_alpha[active] + direction * level, 0, 255)
            name = ('plus' if direction > 0 else 'minus') + str(level)
            tone[name] = int(np.count_nonzero((changed_alpha > field) != clean))
    # 8x8 predeclared low-rate checkerboard marker on the left of the body.
    # These coordinates are experimenter-defined solely for a positive control.
    r0, c0 = 170, 40
    desired = (np.indices((8, 8)).sum(axis=0) % 2 == 0)
    marked = a24.copy()
    rr_roi = slice(r0, r0 + 8)
    cc_roi = slice(c0, c0 + 8)
    noise_roi = field[rr_roi, cc_roi].astype(np.float32)
    marked[rr_roi, cc_roi] = np.where(desired, noise_roi + 1, noise_roi)
    planted = marked > field
    received = recovered_jpeg_mask(planted)
    assert np.array_equal(received[rr_roi, cc_roi], desired)
    assert np.array_equal(recovered_jpeg_mask(clean), clean)
    return {
        'source_sha256': {'41.jpg': h24, '42.jpg': h25, '43.jpg': h26, '74.jpg': h57},
        'p57_black_cells': int(target.sum()),
        'native_pixel_reproduction': {
            'original_black_pixels': int((p57[roi] < 128).sum()),
            'renderer_edges': [int(edges_x[0]), int(edges_x[-1]),
                               int(edges_y[0]), int(edges_y[-1])],
            'fitted_source_grid': [GRID_X0, GRID_Y0, GRID_SX, GRID_SY],
            'mismatch_by_grayscale_threshold': native_errors},
        'four_published_dots_threshold_zero': True,
        'p24_p26_plate_pixel_equal': True,
        'plate_model': {'fit_params': [X0, Y0, SX, SY, SKEW, GAMMA, GAIN],
                        'predicted_black_cells': int(clean.sum()),
                        'train': f1(clean, target, train),
                        'heldout': f1(clean, target, ~train),
                        'all': f1(clean, target, np.ones_like(train, bool))},
        'no_payload_pixel_flips_vs_frozen_p24_model': {
            'p26_exact_clone': 0,
            'p25_registered_near_copy': int(np.count_nonzero(clean != natural)),
            **tone},
        'planted_marker': {'bits': 64, 'ones': int(desired.sum()),
                           'flips_vs_clean': int(np.count_nonzero(planted != clean)),
                           'q92_decoded_bits': int(np.count_nonzero(received[rr_roi, cc_roi] == desired))},
        'clean_q92_full_mask_flips': 0,
        'historical_refinement_166_reproduced': False,
    }


if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
