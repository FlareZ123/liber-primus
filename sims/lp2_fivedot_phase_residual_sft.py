#!/usr/bin/env python3
"""Fixed-transform residual check for the LP2 p7/p23/p56 five-dot stencil.

Reads unchanged original JPEGs. The source-defined transforms are fixed by
lp2-fivedot-source-stencil-mirror-and-p56-key-gate.md; no fitting, threshold
sweep, OCR, or rune-key search is performed. Also measures the known one-pixel
p24/p25 insect-art shift as a source-native raster-phase control.

Requirements: Pillow, NumPy, OpenCV.
Run: python3 lp2_fivedot_phase_residual_sft.py --sources resources/liber-primus
"""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

EXPECTED = {
    24: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
    41: "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
    42: "",  # Hash is reported from the original file but not used as a selector.
}
THRESHOLD = 90

def read_gray(root: Path, scan: int) -> tuple[np.ndarray, str]:
    path = root / f"{scan:02d}.jpg"
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if EXPECTED.get(scan):
        assert digest == EXPECTED[scan], (scan, digest, EXPECTED[scan])
    with Image.open(path) as image:
        assert image.size == (2400, 3600), (scan, image.size)
        gray = np.asarray(image.convert("L"))
    return gray, digest

def mapped_pair(source: np.ndarray, target: np.ndarray,
                x0: int, x1: int, y0: int, y1: int, mapping):
    xs = np.arange(x0, x1, dtype=np.int32)
    ys = np.arange(y0, y1, dtype=np.int32)
    xx, yy = np.meshgrid(xs, ys)
    sx, sy = mapping(xx, yy)
    assert sx.min() >= 0 and sx.max() < source.shape[1]
    assert sy.min() >= 0 and sy.max() < source.shape[0]
    return source[sy, sx], target[y0:y1, x0:x1]

def summarize(name: str, a: np.ndarray, b: np.ndarray) -> dict[str, float]:
    assert a.shape == b.shape
    ma = a < THRESHOLD
    mb = b < THRESHOLD
    intersection = int(np.count_nonzero(ma & mb))
    union_count = int(np.count_nonzero(ma | mb))
    iou = intersection / union_count
    residual = np.abs(a.astype(np.int16) - b.astype(np.int16))
    union = ma | mb
    dist_inside = cv2.distanceTransform(union.astype(np.uint8), cv2.DIST_L2, 5)
    dist_outside = cv2.distanceTransform((~union).astype(np.uint8), cv2.DIST_L2, 5)
    regions = {
        "ink_interior_gt5px": union & (dist_inside > 5),
        "ink_edge_le5px": union & (dist_inside <= 5),
        "paper_gt5px": (~union) & (dist_outside > 5),
    }
    print(f"{name}: source_black={int(ma.sum())} target_black={int(mb.sum())} "
          f"intersection={intersection} union={union_count} IoU={iou:.9f} "
          f"pixel_exact={float(np.mean(a == b)):.9f} "
          f"MAE={float(residual.mean()):.9f}")
    for label, mask in regions.items():
        values = residual[mask]
        assert len(values)
        print(f"  {label}: n={len(values)} mean={float(values.mean()):.6f} "
              f"median={float(np.median(values)):.3f} "
              f"p95={float(np.quantile(values, .95)):.3f} "
              f"max={int(values.max())} frac_gt5={float(np.mean(values > 5)):.8f}")
    return {"iou": iou, "pixel_exact": float(np.mean(a == b)),
            "mae": float(residual.mean())}

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", type=Path, required=True,
                    help="directory containing original 00.jpg..74.jpg")
    root = ap.parse_args().sources
    p7, h24 = read_gray(root, 24)
    p23, h40 = read_gray(root, 40)
    p56, h73 = read_gray(root, 73)
    p24_insect, h41 = read_gray(root, 41)
    p25_insect, h42 = read_gray(root, 42)
    print("source hashes:", {24: h24, 40: h40, 73: h73, 41: h41, 42: h42})

    # Target coordinates map back to p7 under the already published transforms.
    a, b = mapped_pair(p7, p23, 740, 1620, 414, 874,
                       lambda x, y: (x, 3674 - y))
    r723 = summarize("p7->p23 vertical reflection", a, b)
    assert r723["iou"] > .9994 and r723["mae"] < .08

    a, b = mapped_pair(p7, p56, 781, 1661, 2381, 2841,
                       lambda x, y: (2401 - x, y + 419))
    r756 = summarize("p7->p56 horizontal reflection+translation", a, b)
    assert .971 < r756["iou"] < .973 and r756["mae"] < .36

    a, b = mapped_pair(p23, p56, 781, 1661, 2381, 2841,
                       lambda x, y: (2401 - x, 3255 - y))
    r2356 = summarize("p23->p56 180-degree rotation+translation", a, b)
    assert .972 < r2356["iou"] < .973 and r2356["mae"] < .34

    # Independent source-native one-pixel-shifted art control: p24->p25.
    # The target coordinate (x,y) maps to p24 source (x+1,y+1).
    for label, roi in (
        ("p24/p25 left insect", (0, 519, 1000, 2599)),
        ("p24/p25 right insect", (1800, 2399, 1000, 2599)),
    ):
        x0, x1, y0, y1 = roi
        a, b = mapped_pair(p24_insect, p25_insect, x0, x1, y0, y1,
                           lambda x, y: (x + 1, y + 1))
        residual = np.abs(a.astype(np.int16) - b.astype(np.int16))
        print(f"{label} one-pixel shift control: shape={a.shape} "
              f"pixel_exact={float(np.mean(a == b)):.9f} "
              f"MAE={float(residual.mean()):.9f} "
              f"p95={float(np.quantile(residual, .95)):.3f} "
              f"max={int(residual.max())}")

    # A direct blockwise quantized-DCT subtraction is invalid for these
    # three transforms: the source/target offsets have nonzero residues mod 8.
    phases = {"p7->p23_y": 3674 % 8, "p7->p56_x": 2401 % 8,
              "p7->p56_y": (-419) % 8, "p23->p56_x": 2401 % 8,
              "p23->p56_y": 3255 % 8}
    print("JPEG 8x8 phase offsets (nonzero means no one-to-one block map):", phases)
    assert phases == {"p7->p23_y": 2, "p7->p56_x": 1,
                      "p7->p56_y": 5, "p23->p56_x": 1,
                      "p23->p56_y": 7}
    print("PASS: fixed source transforms reproduce the five-dot stencil; "
          "residuals are concentrated in the antialiased edge band. "
          "No coefficient-difference bitstream is asserted or extracted.")

if __name__ == "__main__":
    main()
