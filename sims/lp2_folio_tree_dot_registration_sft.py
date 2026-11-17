"""Original LP2 physical folio registration: independent red-mark holdout.

The manuscript's p32 blurred tree and p55 outlined tree were independently
registered in lp2_p32_p55_outline_fill_trunk_holdout_sft.py. Freeze that
tree-only fit, then test whether the independently printed terminal 13-dot
red marks register under the same paper-level geometric transformation.

Original JPEGs are read-only. All coordinates below are native 2400x3600
pixel coordinates, and the transformation is deliberately not refitted
to either dot mark.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
P32 = ("49.jpg", "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72")
P55 = ("72.jpg", "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba")

# Original tree crops and the *previously fitted* p55 -> p32 registration,
# sourced from im-results/lp2-p32-p55-blurred-tree-correspondence.md.
P32_CROP = (650, 2070, 1810, 3230)
P55_CROP = (625, 1430, 1735, 2510)
TREE_SCALE = 0.9
TREE_SHIFT = (-12, 1)
SOURCE_GRID = 360
CENTER_SHIFT = (SOURCE_GRID - round(SOURCE_GRID * TREE_SCALE)) // 2


def original_rgb(filename: str, expected_sha256: str) -> np.ndarray:
    raw = (SOURCE / filename).read_bytes()
    assert sha256(raw).hexdigest() == expected_sha256, filename
    rgb = np.asarray(Image.open(SOURCE / filename).convert("RGB"))
    assert rgb.shape == (3600, 2400, 3), filename
    return rgb


def red_thirteen_dot_center(
    rgb: np.ndarray, box: tuple[int, int, int, int]
) -> tuple[float, float]:
    """Count and center each original isolated red stencil dot, no OCR."""
    x0, y0, x1, y1 = box
    crop = rgb[y0:y1, x0:x1].astype(np.int16)
    r, g, b = [crop[:, :, i] for i in range(3)]
    ink = (r > 80) & (r > g + 55) & (r > b + 55)
    pending = set(map(tuple, np.argwhere(ink).tolist()))
    points = []
    while pending:
        queue = [pending.pop()]
        connected = []
        while queue:
            y, x = queue.pop()
            connected.append((x, y))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    neighbor = (y + dy, x + dx)
                    if neighbor in pending:
                        pending.remove(neighbor)
                        queue.append(neighbor)
        xs, ys = zip(*connected)
        width = max(xs) - min(xs) + 1
        height = max(ys) - min(ys) + 1
        if 6 <= width <= 17 and 6 <= height <= 17 and 35 <= len(connected) <= 200:
            points.append((np.mean(xs) + x0, np.mean(ys) + y0))
    assert len(points) == 13, f"Expected source 13-dot mark, got {len(points)}"
    points = np.array(points)
    assert 28 <= np.ptp(points[:, 0]) <= 31
    assert 75 <= np.ptp(points[:, 1]) <= 78
    return float(np.mean(points[:, 0])), float(np.mean(points[:, 1]))


def tree_fitted_projection(p55_xy: tuple[float, float]) -> tuple[float, float]:
    """Apply independently locked tree transform, including page crop scales."""
    origin_x, origin_y, right, bottom = P55_CROP
    x55 = (p55_xy[0] - origin_x) * SOURCE_GRID / (right - origin_x)
    y55 = (p55_xy[1] - origin_y) * SOURCE_GRID / (bottom - origin_y)
    x32 = TREE_SCALE * x55 + CENTER_SHIFT + TREE_SHIFT[0]
    y32 = TREE_SCALE * y55 + CENTER_SHIFT + TREE_SHIFT[1]
    x0, y0, x1, y1 = P32_CROP
    return (
        x0 + x32 * (x1 - x0) / SOURCE_GRID,
        y0 + y32 * (y1 - y0) / SOURCE_GRID,
    )


def inverse_projection(p32_xy: tuple[float, float]) -> tuple[float, float]:
    x0, y0, x1, y1 = P32_CROP
    x32 = (p32_xy[0] - x0) * SOURCE_GRID / (x1 - x0)
    y32 = (p32_xy[1] - y0) * SOURCE_GRID / (y1 - y0)
    x55 = (x32 - CENTER_SHIFT - TREE_SHIFT[0]) / TREE_SCALE
    y55 = (y32 - CENTER_SHIFT - TREE_SHIFT[1]) / TREE_SCALE
    a0, b0, a1, b1 = P55_CROP
    return (
        a0 + x55 * (a1 - a0) / SOURCE_GRID,
        b0 + y55 * (b1 - b0) / SOURCE_GRID,
    )


def main() -> None:
    p32 = red_thirteen_dot_center(original_rgb(*P32), (920, 1620, 976, 1723))
    p55 = red_thirteen_dot_center(original_rgb(*P55), (1025, 1245, 1083, 1345))
    projected = tree_fitted_projection(p55)
    displacement = np.subtract(projected, p32)
    distance = float(np.linalg.norm(displacement))

    # A true paper-level registration would align this second fiducial at
    # approximately the stencil's own 77-pixel height, not 352 pixels away.
    assert np.allclose(p32, [948.5, 1671.076923076923], atol=0.01)
    assert np.allclose(p55, [1053.3076923076924, 1294.5], atol=0.01)
    assert abs(distance - 351.62889278308745) < 0.05
    assert distance > 4 * 77

    # A planted dot at the actual p55 mark, displaced by the already
    # registered tree affine transform, passes with zero projection error.
    recovered_plant = inverse_projection(projected)
    assert np.allclose(recovered_plant, p55, atol=1e-9)
    print(f"p55 original red-13 centroid: {p55}")
    print(f"p32 original red-13 centroid: {p32}")
    print(f"tree-fit prediction for p55 red-13 on p32: {projected}")
    print(f"unfitted red-marker holdout distance: {distance:.6f} native pixels")
    print("PASS: true source red marks fail the tree-anchored folio overlay.")
    print("This does not rule out image reuse, individual art transforms,"
          " or a separately instructed nonrigid alignment.")


if __name__ == "__main__":
    main()
