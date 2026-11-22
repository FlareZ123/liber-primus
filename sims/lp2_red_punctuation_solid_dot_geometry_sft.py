#!/usr/bin/env python3
"""Original LP2 10/13/23-dot stencil pixel-geometry gate.

Use the canonical resources/liber-primus JPEG folder, or pass the original
liber-primus-jpegs.zip as the first argument. Requires numpy and opencv-python.
This is an original-image micro-geometry test, not a steganographic decoder.
"""
from collections import Counter
from pathlib import Path
from zipfile import ZipFile
import json
import sys

import cv2
import numpy as np


def source_images(path):
    """Yield physical LP2 pages as BGR arrays, one page at a time."""
    path = Path(path)
    archive = ZipFile(path) if path.suffix.lower() == ".zip" else None
    for scan in range(17, 75):
        if archive:
            members = [name for name in archive.namelist()
                       if name.endswith(f"/{scan:02d}.jpg") or name == f"{scan:02d}.jpg"]
            assert len(members) == 1, (scan, members)
            raw = archive.read(members[0])
        else:
            raw = (path / f"{scan:02d}.jpg").read_bytes()
        image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
        assert image is not None and image.shape[:2] == (3600, 2400), scan
        yield scan, image
    if archive:
        archive.close()


def components(image, red=True):
    """Recover small candidate square components under frozen ink thresholds."""
    b, g, r = cv2.split(image)
    if red:
        mask = ((r > 85) & (r > g.astype(float) * 1.4)
                & (r > b.astype(float) * 1.4) & (g < 130)).astype(np.uint8)
    else:
        mask = (np.max(image, axis=2) < 105).astype(np.uint8)
    count, _, bounds, centers = cv2.connectedComponentsWithStats(mask, 8)
    ids = [
        idx for idx in range(1, count)
        if (7 <= bounds[idx, 2] <= 12 and 7 <= bounds[idx, 3] <= 12
            and 55 <= bounds[idx, 4] <= 120)
    ] if red else [
        idx for idx in range(1, count)
        if (6 <= bounds[idx, 2] <= 12 and 6 <= bounds[idx, 3] <= 12
            and 40 <= bounds[idx, 4] <= 130)
    ]
    return bounds[ids], centers[ids]


def groups(bounds, centers):
    remaining = set(range(len(centers)))
    while remaining:
        pending = [remaining.pop()]
        group = []
        while pending:
            idx = pending.pop()
            group.append(idx)
            near = [j for j in remaining
                    if np.linalg.norm(centers[idx] - centers[j]) <= 31]
            for j in near:
                remaining.remove(j)
                pending.append(j)
        points = centers[group]
        if len(group) in (10, 13, 23) and np.ptp(points[:, 0]) <= 90 and np.ptp(points[:, 1]) <= 180:
            yield bounds[group]


def geometry(boxes):
    """An equal-col/equal-row solid square template has no dot-shape bits."""
    coords = boxes[:, :2]
    x0, y0 = coords.min(axis=0)
    normalized = boxes.copy()
    normalized[:, 0] -= x0
    normalized[:, 1] -= y0
    assert all(int(x[2] * x[3]) == int(x[4]) for x in normalized), normalized
    assert all(len({int(b[2]) for b in normalized if b[0] == x}) == 1
               for x in set(normalized[:, 0]))
    assert all(len({int(b[3]) for b in normalized if b[1] == y}) == 1
               for y in set(normalized[:, 1]))
    return normalized


def main(path):
    counters = Counter()
    shapes = Counter()
    thirteen = []
    red_interior_means = []
    for scan, image in source_images(path):
        red_boxes, red_centers = components(image)
        for boxes in groups(red_boxes, red_centers):
            normalized = geometry(boxes)
            size = len(normalized)
            for x, y, w, h, area in boxes:
                x, y, w, h = map(int, (x, y, w, h))
                red_interior_means.append(float(np.mean(
                    image[y + 2:y + h - 2, x + 2:x + w - 2, 2]
                )))
            counters[("red", size)] += 1
            for x, y, w, h, area in normalized:
                shapes[(int(w), int(h), int(area))] += 1
            if size == 13:
                thirteen.append((scan, sorted(
                    (int(x), int(y)) for x, y, *_ in normalized
                )))
        if scan == 24:
            black_boxes, black_centers = components(image, red=False)
            candidates = [
                boxes for boxes in groups(black_boxes, black_centers)
                if len(boxes) == 13
                and 1670 < boxes[:, 0].min() < 1720
                and 2210 < boxes[:, 1].min() < 2250
            ]
            assert len(candidates) == 1
            normalized = geometry(candidates[0])
            counters[("black", 13)] += 1
            for x, y, w, h, area in normalized:
                shapes[(int(w), int(h), int(area))] += 1
            thirteen.append((scan, sorted(
                (int(x), int(y)) for x, y, *_ in normalized
            )))

    assert counters == {("red", 13): 30, ("red", 10): 4,
                        ("red", 23): 1, ("black", 13): 1}, counters
    assert sum(shapes.values()) == 466, shapes
    assert set(shapes) <= {(9, 9, 81), (9, 10, 90),
                           (10, 9, 90), (10, 10, 100)}, shapes

    # Each 13-dot glyph has the same geometric layout, up to pixel snapping.
    layouts = np.asarray([[x for x, y in xy] + [y for x, y in xy]
                          for _, xy in thirteen], dtype=np.int16)
    assert layouts.shape == (31, 26)
    assert int(np.ptp(layouts[:, :13], axis=0).max()) <= 2
    assert int(np.ptp(layouts[:, 13:], axis=0).max()) <= 1

    red_values = np.asarray(red_interior_means, dtype=np.float64)
    assert red_values.size == 453
    assert 188.9 <= float(red_values.min()) <= 189.1
    assert 194.3 <= float(red_values.max()) <= 194.6
    assert float(red_values.std()) < 1.1
    assert float(red_values.max() + 20) > 195  # source-contrast plant

    # In-memory corruption test: a missing interior pixel breaks the exact
    # square-area invariant even when the rest of a glyph is unchanged.
    planted = np.array([[0, 0, 9, 9, 80]], dtype=np.int32)
    try:
        geometry(planted)
        raise AssertionError("Planted one-pixel notch escaped the invariant")
    except AssertionError as error:
        assert "Planted" not in str(error)

    print(json.dumps({
        "source": str(path),
        "mark_counts": {f"{ink}-{n}": value for (ink, n), value in sorted(counters.items())},
        "total_solid_dot_rectangles": sum(shapes.values()),
        "dot_shape_counts": {str(k): v for k, v in sorted(shapes.items())},
        "thirteen_mark_count": len(thirteen),
        "max_13dot_relative_x_spread_px": int(np.ptp(layouts[:, :13], axis=0).max()),
        "max_13dot_relative_y_spread_px": int(np.ptp(layouts[:, 13:], axis=0).max()),
        "red_interior_rgb_r_min": float(red_values.min()),
        "red_interior_rgb_r_max": float(red_values.max()),
        "red_interior_rgb_r_mean": float(red_values.mean()),
        "red_interior_rgb_r_sd": float(red_values.std()),
        "planted_red_fill_plus20_detected": True,
        "planted_missing_dot_pixel_detected": True,
    }, indent=2))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "resources/liber-primus")
