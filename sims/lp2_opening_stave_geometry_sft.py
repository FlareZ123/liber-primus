#!/usr/bin/env python3
"""Source-first geometry test for the opening LP2 stave-like illustrations.

Run from a repository checkout:
    python sims/lp2_opening_stave_geometry_sft.py
Or pass a directory containing 17.jpg, 18.jpg, 19.jpg and 39.jpg.

Only original JPEG artwork is measured. No ciphertext, language score, key,
phase, or cipher family is used to choose a geometry.
Dependencies: Pillow, NumPy, OpenCV.
"""
from __future__ import annotations
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROIS = {
    "p0-left": ("17.jpg", (40, 1600, 560, 3000)),
    "p0-right": ("17.jpg", (1830, 550, 2360, 1950)),
    "p1-left": ("18.jpg", (40, 1600, 560, 3000)),
    "p1-right": ("18.jpg", (1830, 550, 2360, 1950)),
    "p2-left": ("19.jpg", (40, 1600, 560, 3000)),
    "p2-right": ("19.jpg", (1830, 550, 2360, 1950)),
    "p22-horizontal-control": ("39.jpg", (627, 2235, 1739, 2632)),
}
TARGET_SIZE = (200, 540)
THRESHOLD = 150


def read_rois(root: Path) -> dict[str, np.ndarray]:
    out = {}
    for name, (filename, box) in ROIS.items():
        image = Image.open(root / filename).convert("L")
        if image.size != (2400, 3600):
            raise AssertionError(f"{filename}: expected 2400x3600, got {image.size}")
        out[name] = np.asarray(image.crop(box), dtype=np.uint8)
    return out


def mask(image: np.ndarray) -> np.ndarray:
    return (image < THRESHOLD).astype(np.uint8)


def aligned_iou(reference: np.ndarray, candidate: np.ndarray, rotation: int = 0) -> tuple[float, float, np.ndarray]:
    """Return ECC, threshold-mask IoU, and fitted affine transform.

    Rotation is a fixed, source-visible quarter-turn applied before a small
    affine registration. Registration compensates only for crop placement and
    scan offsets; the fitted transformation is reported, not interpreted.
    """
    moving = np.rot90(candidate, rotation) if rotation else candidate
    ref = cv2.resize(reference, TARGET_SIZE, interpolation=cv2.INTER_AREA)
    mov = cv2.resize(moving, TARGET_SIZE, interpolation=cv2.INTER_AREA)
    refm = mask(ref).astype(np.float32)
    movm = mask(mov).astype(np.float32)
    warp = np.eye(2, 3, dtype=np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 100, 1e-5)
    ecc, warp = cv2.findTransformECC(refm, movm, warp, cv2.MOTION_AFFINE, criteria)
    aligned = cv2.warpAffine(
        movm, warp, (refm.shape[1], refm.shape[0]),
        flags=cv2.INTER_NEAREST | cv2.WARP_INVERSE_MAP,
    )
    a, b = refm > 0, aligned > 0
    union = np.logical_or(a, b).sum()
    score = np.logical_and(a, b).sum() / union if union else 1.0
    return float(ecc), float(score), warp


def exact_crop_match(a: np.ndarray, b: np.ndarray) -> bool:
    return a.shape == b.shape and np.array_equal(a, b)


def main() -> None:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus")
    crops = read_rois(root)

    print("Original-JPEG stave geometry; threshold < 150; resized masks 200x540")
    print("same-side page reuse (p0→p1, p0→p2):")
    for side in ("left", "right"):
        ref = crops[f"p0-{side}"]
        for page in ("p1", "p2"):
            ecc, score, warp = aligned_iou(ref, crops[f"{page}-{side}"])
            print(f"  {side} p0→{page}: ECC={ecc:.6f}, IoU={score:.6f}, affine={warp.round(4).tolist()}")

    for side in ("left", "right"):
        equal = exact_crop_match(crops[f"p1-{side}"], crops[f"p2-{side}"])
        print(f"  p1/p2 {side} raw crop pixel-identical: {equal}")
        assert equal

    ecc, score, warp = aligned_iou(crops["p0-left"], crops["p0-right"], rotation=2)
    print(f"left vs right after 180°: ECC={ecc:.6f}, IoU={score:.6f}, affine={warp.round(4).tolist()}")
    assert score > 0.95

    control_scores = []
    for rotation in (1, 3):
        ecc, score, warp = aligned_iou(crops["p0-left"], crops["p22-horizontal-control"], rotation=rotation)
        control_scores.append((score, rotation, ecc, warp))
    best = max(control_scores, key=lambda row: row[0])
    print(
        "p22 horizontal object after quarter-turn (best): "
        f"rotation={best[1] * 90}°, ECC={best[2]:.6f}, IoU={best[0]:.6f}, affine={best[3].round(4).tolist()}"
    )
    assert best[0] < 0.70

    print("PASS: pp0–2 reuse one left/right stave pair; the pair is the same template at 180°; p22 is only a loose visual control.")
    print("No page-specific stave variation or source-selected Ogham/rune/directional key is established.")


if __name__ == "__main__":
    main()
