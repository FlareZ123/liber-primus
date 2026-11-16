"""Original-image p32/p55 tree blur identity gate, independent of rune transcription.

Run from the repository root with its original resources/liber-primus JPEGs.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from scipy.optimize import differential_evolution


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
SIZE = (200, 200)
BOUNDS = [(0.60, 1.25), (0.60, 1.25), (-35, 35), (-35, 35), (-22, 22)]


def decoded(no):
    image = cv2.imread(str(SOURCE / f"{no:02d}.jpg"), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    return image


def tree_crops():
    image32 = decoded(49)[2200:3150, 730:1670]
    image55 = decoded(72)[1375:2475, 640:1680]
    original = 1 - cv2.resize(image32, SIZE).astype(np.float32) / 255
    ink = np.uint8(image55 < 225) * 255
    contours, _ = cv2.findContours(ink, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    assert contours and cv2.contourArea(max(contours, key=cv2.contourArea)) > 100_000
    filled = np.zeros_like(image55)
    cv2.drawContours(filled, [max(contours, key=cv2.contourArea)], -1, 255, -1)
    source = cv2.resize(filled, SIZE).astype(np.float32) / 255
    return original, source


def render(source, parameters):
    sx, sy, dx, dy, angle = parameters
    matrix = cv2.getRotationMatrix2D((100, 100), angle, 1.0)
    matrix[:, :2] = matrix[:, :2] @ np.diag((sx, sy))
    matrix[:, 2] += (dx, dy)
    return cv2.warpAffine(source, matrix, SIZE, flags=cv2.INTER_LINEAR, borderValue=0)


def corr(x, y):
    a, b = x - x.mean(), y - y.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-10))


def optimize(target, source, seed):
    def loss(params):
        return -corr(target, render(source, params))

    solution = differential_evolution(
        loss, BOUNDS, popsize=9, maxiter=35, seed=seed, polish=True
    )
    return -solution.fun, [round(float(x), 6) for x in solution.x]


def main():
    original, source = tree_crops()
    blurred = cv2.GaussianBlur(source, (0, 0), 10)
    params = [0.80, 1.10, 9, -8, -12]
    plant = np.clip(0.2 + 0.65 * render(blurred, params), 0, 1)
    rng = np.random.default_rng(314159)
    plant += rng.normal(0, 0.014, plant.shape).astype(np.float32)
    pscore, pparams = optimize(plant, blurred, 410)
    assert pscore > 0.94, (pscore, pparams)
    scores = {}
    for sigma in (3, 6, 10, 14):
        blur = cv2.GaussianBlur(source, (0, 0), sigma)
        score, parameters = optimize(original, blur, 410)
        scores[sigma] = {"ncc": round(score, 7), "affine": parameters}
    assert max(x["ncc"] for x in scores.values()) < 0.80, scores
    print(json.dumps({"plant": {"ncc": round(pscore, 7), "affine": pparams}, "original": scores}, indent=2))


if __name__ == "__main__":
    main()
