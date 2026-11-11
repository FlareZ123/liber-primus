#!/usr/bin/env python3
"""Compare the 13-dot red punctuation motif on original LP2 scans.

Run from repository root:
  python sims/p32_p33_red13dot_boundary_sft.py
Optional local mirror directory:
  python sims/p32_p33_red13dot_boundary_sft.py --image-dir /path/to/jpegs
"""
from __future__ import annotations
import argparse
import hashlib
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "49.jpg": "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
    "50.jpg": "13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d",
    "74.jpg": "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b",
}
# Tight original-pixel crops around each 13-dot punctuation cluster.
CROPS = {
    "p32_end": ("49.jpg", (925, 1625, 975, 1720)),
    "p33_heading1": ("50.jpg", (1260, 680, 1315, 780)),
    "p33_heading2": ("50.jpg", (1138, 1925, 1190, 2015)),
    "p57_parable": ("74.jpg", (1138, 925, 1190, 1015)),
}


def components(mask: np.ndarray):
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    out = []
    ys, xs = np.nonzero(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if seen[y, x]:
            continue
        q = deque([(y, x)])
        seen[y, x] = True
        pts = []
        while q:
            cy, cx = q.popleft()
            pts.append((cy, cx))
            for ny in range(max(0, cy - 1), min(h, cy + 2)):
                for nx in range(max(0, cx - 1), min(w, cx + 2)):
                    if mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        if 20 <= len(pts) <= 200:
            py = [p[0] for p in pts]
            px = [p[1] for p in pts]
            out.append({
                "area": len(pts),
                "cx": (min(px) + max(px)) / 2,
                "cy": (min(py) + max(py)) / 2,
                "bbox": [min(px), min(py), max(px) + 1, max(py) + 1],
            })
    return sorted(out, key=lambda c: (c["cy"], c["cx"]))


def extract(image_dir: Path, name: str):
    filename, (x0, y0, x1, y1) = CROPS[name]
    path = image_dir / filename
    raw = path.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    if sha != EXPECTED[filename]:
        raise ValueError(f"unexpected source image hash for {filename}: {sha}")
    im = np.asarray(Image.open(path).convert("RGB"))[y0:y1, x0:x1]
    r, g, b = im[:, :, 0], im[:, :, 1], im[:, :, 2]
    mask = (r > 130) & (g < 120) & (b < 120) & (r > 1.35 * g) & (r > 1.35 * b)
    dots = components(mask)
    if len(dots) != 13:
        raise AssertionError(f"{name}: expected 13 red dots, found {len(dots)}")
    minx = min(d["cx"] for d in dots)
    miny = min(d["cy"] for d in dots)
    centers = [[round(d["cx"] - minx, 1), round(d["cy"] - miny, 1)] for d in dots]
    return {"image": filename, "sha256": sha, "crop": [x0, y0, x1, y1],
            "count": len(dots), "centers_normalized": centers}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image-dir", type=Path, default=ROOT / "resources" / "liber-primus")
    args = ap.parse_args()
    results = {name: extract(args.image_dir, name) for name in CROPS}
    ref = np.asarray(results["p57_parable"]["centers_normalized"], dtype=float)
    deviations = {}
    for name, result in results.items():
        centers = np.asarray(result["centers_normalized"], dtype=float)
        delta = np.abs(centers - ref)
        deviations[name] = {
            "max_abs_coordinate_delta_px": float(delta.max()),
            "rmse_px": float(np.sqrt(np.mean((centers - ref) ** 2))),
        }
        if delta.max() > 1.0:
            raise AssertionError(f"{name}: 13-dot layout differs from p57 control by >1 px")
    print(json.dumps({
        "classification": "original-source typography confirmation; no cipher inference",
        "red13dot_motif": results,
        "relative_to_p57_PARABLE_control": deviations,
        "interpretation": (
            "p32 end, both p33 red-title boundaries, and p57 PARABLE title carry "
            "the same 13-dot punctuation motif. The 10-rune p33 first red heading "
            "followed by this motif supports a new titled unit at p33 local offset 0; "
            "the p32 end marker closes the preceding unit. This resolves reading "
            "segmentation, not a cryptographic key reset."
        ),
    }, indent=2))


if __name__ == "__main__":
    main()
