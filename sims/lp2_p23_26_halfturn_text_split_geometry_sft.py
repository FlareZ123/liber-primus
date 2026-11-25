"""Source-locked geometry for the p24-p26 mayfly half-turn text split.

Run from the repository root:
    python sims/lp2_p23_26_halfturn_text_split_geometry_sft.py

This reproduces the p24 upper/lower registration used by #2675, transfers
the measured crop translation to the near-duplicate p25/p26 art, and checks
that the resulting center lies in the empty interline band. It does not read
or score rune values.
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from scipy.optimize import differential_evolution

EXPECTED = {
    24: "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
    25: "a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff",
    26: "ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7",
}


def ncc(a, b, mask):
    x = a[mask].astype(np.float64)
    y = b[mask].astype(np.float64)
    x -= x.mean()
    y -= y.mean()
    return float((x @ y) / np.sqrt((x @ x) * (y @ y) + 1e-30))


def load_page(image_dir, page):
    number = page + 17
    path = image_dir / f"{number}.jpg"
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    assert digest == EXPECTED[page], (page, digest)
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400), (page, image.shape)
    return image


def p24_halfturn_fit(image):
    # Same p24 left-flank crop, grid and body/antenna training mask as #2675.
    target = 255.0 - image[1100:2400, 30:530].astype(np.float32)
    xx, yy = np.meshgrid(
        np.arange(8, 497, 2.5, dtype=np.float32),
        np.arange(45, 631, 2.5, dtype=np.float32),
    )
    reference = cv2.remap(target, xx, yy, cv2.INTER_LINEAR)
    train = (((np.abs(xx - 282) < 35) & (yy > 218) & (yy < 470)) |
             ((yy > 65) & (yy < 225) & (np.abs(xx - 282) > 25)))
    wing = (((xx < 233) | (xx > 331)) & (yy > 191) & (yy < 340) &
            (xx > 15) & (xx < 490))
    legs = ((np.abs(xx - 282) > 24) & (np.abs(xx - 282) < 106) &
            (yy > 340) & (yy < 445))
    tail = ((np.abs(xx - 282) < 66) & (yy > 490) & (yy < 625))
    train &= ~(wing | legs | tail)

    def evaluate(params, flip, held_out=False):
        sx, sy, tx, ty = params
        mapped = cv2.remap(
            target,
            ((xx - 282) * sx * flip + tx).astype(np.float32),
            (ty - yy * sy).astype(np.float32),
            cv2.INTER_LINEAR,
        )
        masks = (wing, legs, tail) if held_out else (train,)
        return [ncc(mapped, reference, m) for m in masks]

    fits = {}
    for flip in (1, -1):
        fit = differential_evolution(
            lambda params: -evaluate(params, flip)[0],
            [(0.97, 1.03), (0.97, 1.03), (270, 295), (1340, 1410)],
            seed=20261125, popsize=8, maxiter=40, polish=True,
        )
        sx, sy, tx, ty = map(float, fit.x)
        center_x = (282 * sx + tx) / (1 + sx)
        center_y = ty / (1 + sy)
        fits["180deg" if flip == -1 else "vertical_reflection"] = {
            "fit_ncc": evaluate(fit.x, flip)[0],
            "heldout_wing_leg_tail_ncc": evaluate(fit.x, flip, True),
            "parameters": [sx, sy, tx, ty],
            "center_page_xy": [30 + center_x, 1100 + center_y],
        }
    assert fits["180deg"]["fit_ncc"] > fits["vertical_reflection"]["fit_ncc"]
    assert min(fits["180deg"]["heldout_wing_leg_tail_ncc"]) > max(
        fits["vertical_reflection"]["heldout_wing_leg_tail_ncc"]
    )
    return fits


def best_translation(base, target):
    # Return translation of target content relative to base content:
    # target[y+dy,x+dx] is compared with base[y,x].
    h, w = base.shape
    scores = []
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            ax0, ax1 = max(0, -dy), min(h, h - dy)
            ay0, ay1 = max(0, -dx), min(w, w - dx)
            bx0, bx1 = max(0, dy), min(h, h + dy)
            by0, by1 = max(0, dx), min(w, w + dx)
            a = base[ax0:ax1, ay0:ay1].astype(np.int16)
            b = target[bx0:bx1, by0:by1].astype(np.int16)
            scores.append((float(np.mean(np.abs(a - b))), dx, dy))
    return min(scores)


def line_bands(image):
    ink = image[:, 550:1850] < 150
    projection = ink.sum(axis=1)
    active = projection > 10
    starts = np.flatnonzero(active & ~np.r_[False, active[:-1]])
    ends = np.flatnonzero(active & ~np.r_[active[1:], False])
    return [(int(a), int(b)) for a, b in zip(starts, ends) if b - a > 10]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-dir", type=Path, default=Path("resources/liber-primus"))
    args = parser.parse_args()
    images = {p: load_page(args.image_dir, p) for p in (24, 25, 26)}
    fit = p24_halfturn_fit(images[24])
    center_x, center_y = fit["180deg"]["center_page_xy"]
    base_crop = images[24][1100:2400, 30:530]
    offsets = {}
    for page in (25, 26):
        target_crop = images[page][1100:2400, 30:530]
        mae, dx, dy = best_translation(base_crop, target_crop)
        offsets[page] = {"mae": mae, "dx": dx, "dy": dy}
    assert (offsets[25]["dx"], offsets[25]["dy"]) == (-1, -1)
    assert (offsets[26]["dx"], offsets[26]["dy"]) == (0, 0)

    line_data = {}
    for page in (24, 25, 26):
        bands = line_bands(images[page])
        assert len(bands) == 12, (page, bands)
        gap = images[page][1729:1802, 550:1850]
        assert int((gap < 180).sum()) == 0
        line_data[page] = {
            "bands_y": bands,
            "sixth_line_end": bands[5][1],
            "seventh_line_start": bands[6][0],
            "dark_pixels_in_interline_gap_lt180": 0,
        }

    centers = {
        24: [center_x, center_y],
        25: [center_x + offsets[25]["dx"], center_y + offsets[25]["dy"]],
        26: [center_x + offsets[26]["dx"], center_y + offsets[26]["dy"]],
    }
    for page, (_, y) in centers.items():
        assert line_data[page]["sixth_line_end"] < y < line_data[page]["seventh_line_start"]
    print(json.dumps({
        "source": "original LP2 JPEGs 41.jpg, 42.jpg, 43.jpg",
        "p24_upper_to_lower_registration": fit,
        "p25_p26_translation_relative_to_p24": offsets,
        "page_specific_rotation_centers": centers,
        "text_lines": line_data,
        "decision": "unique discrete split after line 6: no glyph ink intersects the interline band",
    }, indent=2))


if __name__ == "__main__":
    main()
