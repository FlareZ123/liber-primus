"""Issue #3351: p32-trained stock-tree raster pipeline, p55 held-target transfer.

The only fitted target is original LP2 p32.  The source is the pinned common
stock mask already SHA-gated by lp2_tree_stock_root_transfer_sft.py.  The
candidate operation is deliberately low-description-length and available in
ordinary 2014 raster editors:

    optional horizontal reflection -> isotropic scale/translation ->
    Gaussian blur -> levels-insensitive comparison.

After orientation and four numeric parameters are frozen on p32, they are
applied unchanged to p55.  The p55 outline is converted to a filled latent
silhouette by one fixed connected-component + hole-fill rule solely for
geometric scoring; it is never used to select the p32 pipeline.

A p55-only oracle is computed only after the frozen score, as a diagnostic of
how much target-specific refitting would be required.  It does not select or
modify the tested pipeline.
"""
from __future__ import annotations

import json
import cv2
import numpy as np
from scipy.ndimage import binary_fill_holes, gaussian_filter
from scipy.optimize import differential_evolution

from lp2_tree_stock_root_transfer_sft import load_stock, native_sample, warp, corr

ROI = (slice(15, 190), slice(15, 185))
CROWN = (slice(15, 125), slice(15, 185))
ROOT = (slice(125, 190), slice(15, 185))


def p32_target() -> np.ndarray:
    raw = native_sample(49)
    return np.maximum(0, 252 - raw).astype(np.float32) / 252


def p55_latent_fill() -> np.ndarray:
    raw = native_sample(72)
    binary = (raw < 240).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    assert n > 1
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return binary_fill_holes(labels == largest).astype(np.float32)


def render(source: np.ndarray, v: np.ndarray, shape: tuple[int, int]) -> np.ndarray:
    scale, tx, ty, sigma = map(float, v)
    softened = gaussian_filter(source, sigma)
    return warp(softened, (scale, scale, tx, ty), shape)


def fit_p32(source: np.ndarray, target: np.ndarray) -> dict:
    bounds = [(.76, .96), (-22, 2), (26, 56), (2.0, 7.0)]
    def objective(v):
        return -corr(render(source, v, target.shape)[ROI], target[ROI])
    res = differential_evolution(
        objective, bounds, seed=3301, popsize=9, maxiter=55,
        tol=1e-6, polish=True, workers=1
    )
    q = render(source, res.x, target.shape)
    return {
        "v": [float(x) for x in res.x],
        "score_full": corr(q[ROI], target[ROI]),
        "score_crown": corr(q[CROWN], target[CROWN]),
        "score_root": corr(q[ROOT], target[ROOT]),
    }


def metrics(source: np.ndarray, v: np.ndarray, target: np.ndarray) -> dict:
    q = render(source, v, target.shape)
    geom = warp(source, (float(v[0]), float(v[0]), float(v[1]), float(v[2])), target.shape)
    pred = geom > .5
    truth = target > .5
    def m(region):
        a = pred[region]
        b = truth[region]
        union = np.logical_or(a, b).sum()
        return {
            "corr": corr(q[region], target[region]),
            "iou": float(np.logical_and(a, b).sum() / max(1, union)),
        }
    return {"full": m(ROI), "crown": m(CROWN), "root": m(ROOT)}


def p55_oracle(source: np.ndarray, frozen: np.ndarray, target: np.ndarray) -> dict:
    # Same orientation and blur; only geometry may move.  This is evaluation
    # after the held score, never a route for changing the frozen pipeline.
    sigma = float(frozen[3])
    bounds = [(.76, .96), (-22, 2), (26, 56)]
    def objective(x):
        v = np.array([x[0], x[1], x[2], sigma], dtype=float)
        return -corr(render(source, v, target.shape)[ROI], target[ROI])
    res = differential_evolution(
        objective, bounds, seed=1033, popsize=8, maxiter=40,
        tol=1e-6, polish=True, workers=1
    )
    v = np.array([res.x[0], res.x[1], res.x[2], sigma], dtype=float)
    return {"v": [float(x) for x in v], **metrics(source, v, target)}


def perturbations(v: np.ndarray) -> list[tuple[str, np.ndarray]]:
    scale, tx, ty, sigma = map(float, v)
    rows = [
        ("scale_-3pct", [scale * .97, tx, ty, sigma]),
        ("scale_+3pct", [scale * 1.03, tx, ty, sigma]),
        ("x_-4", [scale, tx - 4, ty, sigma]),
        ("x_+4", [scale, tx + 4, ty, sigma]),
        ("y_-4", [scale, tx, ty - 4, sigma]),
        ("y_+4", [scale, tx, ty + 4, sigma]),
        ("sigma_-1", [scale, tx, ty, max(2.0, sigma - 1)]),
        ("sigma_+1", [scale, tx, ty, min(7.0, sigma + 1)]),
    ]
    return [(name, np.asarray(x, dtype=float)) for name, x in rows]


def main() -> None:
    reflected = load_stock()  # fixture orientation is horizontal reflection
    direct = reflected[:, ::-1].copy()
    p32 = p32_target()
    p55 = p55_latent_fill()
    assert p32.shape in ((193, 200), (192, 199), (193, 199), (192, 200)), p32.shape
    assert p55.shape in ((193, 200), (192, 199), (193, 199), (192, 200)), p55.shape

    fits = {
        "horizontal_reflection": fit_p32(reflected, p32),
        "direct": fit_p32(direct, p32),
    }
    selected_name = max(fits, key=lambda k: fits[k]["score_full"])
    source = reflected if selected_name == "horizontal_reflection" else direct
    frozen = np.asarray(fits[selected_name]["v"], dtype=float)

    held = metrics(source, frozen, p55)
    wrong_source = direct if selected_name == "horizontal_reflection" else reflected
    wrong_fit = fits["direct" if selected_name == "horizontal_reflection" else "horizontal_reflection"]
    wrong = metrics(wrong_source, np.asarray(wrong_fit["v"], dtype=float), p55)

    nearby = {
        name: metrics(source, pv, p55)
        for name, pv in perturbations(frozen)
    }
    oracle = p55_oracle(source, frozen, p55)

    result = {
        "pipeline": "reflection? -> isotropic scale/translation -> Gaussian blur",
        "training_target": "p32 original native-lattice crop only",
        "held_target": "p55 largest dark connected component with holes filled",
        "p32_fits": fits,
        "selected_orientation": selected_name,
        "frozen_parameters": {
            "scale": float(frozen[0]), "tx": float(frozen[1]),
            "ty": float(frozen[2]), "sigma": float(frozen[3]),
        },
        "p55_frozen_holdout": held,
        "p55_wrong_orientation_with_own_p32_fit": wrong,
        "p55_nearby_pipeline_nulls": nearby,
        "p55_posthoc_geometry_oracle_same_orientation_and_sigma": oracle,
    }
    print(json.dumps(result, indent=2))

    assert fits[selected_name]["score_full"] > .80
    assert np.isfinite(held["full"]["corr"])
    assert 0 <= held["full"]["iou"] <= 1


if __name__ == "__main__":
    main()
