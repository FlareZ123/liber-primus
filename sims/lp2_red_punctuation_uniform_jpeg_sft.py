#!/usr/bin/env python3
"""Original-JPEG fixed-red-pigment model for LP2 punctuation dots.

Standalone SFT. Python 3 with opencv-python, Pillow and NumPy.
Input: canonical resources/liber-primus folder or original 75-image ZIP.
"""
from collections import Counter
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import json
import sys

import cv2
import numpy as np
from PIL import Image, JpegImagePlugin


def source(path):
    base = Path(path)
    archive = ZipFile(base) if base.suffix.lower() == ".zip" else None
    for scan in range(17, 75):
        if archive:
            names = [n for n in archive.namelist()
                     if n.endswith(f"/{scan:02d}.jpg") or n == f"{scan:02d}.jpg"]
            assert len(names) == 1
            raw = archive.read(names[0])
        else:
            raw = (base / f"{scan:02d}.jpg").read_bytes()
        image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        assert image.shape[:2] == (3600, 2400)
        jpeg = Image.open(BytesIO(raw))
        yield scan, image, (jpeg.quantization, JpegImagePlugin.get_sampling(jpeg))
    if archive:
        archive.close()


def stencils(image):
    b, g, r = cv2.split(image)
    mask = ((r > 85) & (r > g.astype(float) * 1.4)
            & (r > b.astype(float) * 1.4) & (g < 130)).astype(np.uint8)
    n, _, bounds, centers = cv2.connectedComponentsWithStats(mask, 8)
    ids = [i for i in range(1, n) if 7 <= bounds[i, 2] <= 12
           and 7 <= bounds[i, 3] <= 12 and 55 <= bounds[i, 4] <= 120]
    boxes = bounds[ids]
    points = centers[ids]
    remaining = set(range(len(points)))
    while remaining:
        stack = [remaining.pop()]
        members = []
        while stack:
            i = stack.pop()
            members.append(i)
            nearby = [j for j in remaining if np.linalg.norm(points[i] - points[j]) <= 31]
            for j in nearby:
                remaining.remove(j)
                stack.append(j)
        q = points[members]
        if len(members) in (10, 13, 23) and np.ptp(q[:, 0]) <= 90 and np.ptp(q[:, 1]) <= 180:
            yield boxes[members]


def jpeg_reference(boxes, qtables, altered_dot=None):
    """Rasterize solid-red squares preserving the original JPEG modulo-16 phase."""
    left = (int(boxes[:, 0].min()) // 16) * 16 - 32
    top = (int(boxes[:, 1].min()) // 16) * 16 - 32
    rgb = np.full((256, 256, 3), 255, np.uint8)
    for i, (x, y, w, h, _) in enumerate(boxes):
        x, y, w, h = map(int, (x, y, w, h))
        rgb[y - top:y - top + h, x - left:x - left + w] = [
            200 if altered_dot == i else 192, 0, 0
        ]
    output = BytesIO()
    Image.fromarray(rgb).save(output, format="JPEG", qtables=[qtables[0], qtables[1]],
                              subsampling=2)
    return np.array(Image.open(BytesIO(output.getvalue()))), left, top


def dot_means(rgb, boxes, left=0, top=0):
    out = []
    for x, y, w, h, _ in boxes:
        x, y, w, h = map(int, (x, y, w, h))
        out.append(rgb[y - top + 2:y - top + h - 2,
                       x - left + 2:x - left + w - 2].mean(axis=(0, 1)))
    return np.array(out)


def main(path):
    observed = []
    predicted = []
    counts = Counter()
    residual_locations = []
    qtable_identity = None
    plant_detected = False
    for scan, image_bgr, (quant, sampling) in source(path):
        boxes_group = list(stencils(image_bgr))
        if boxes_group:
            identity = (tuple(quant[0]), tuple(quant[1]), sampling)
            if qtable_identity is None:
                qtable_identity = identity
            assert identity == qtable_identity and sampling == 2
        for boxes in boxes_group:
            counts[len(boxes)] += 1
            assert all(int(w * h) == int(area) for x, y, w, h, area in boxes)
            syn, left, top = jpeg_reference(boxes, quant)
            actual = dot_means(image_bgr[:, :, ::-1], boxes)
            estimated = dot_means(syn, boxes, left, top)
            assert actual.shape == estimated.shape == (len(boxes), 3)
            observed.extend(actual)
            predicted.extend(estimated)
            for i, diff in enumerate(actual - estimated):
                if abs(diff).max() > 0.25:
                    residual_locations.append([scan, int(boxes[i, 0]), int(boxes[i, 1]),
                                               round(float(diff[0]), 3)])
            if not plant_detected:
                planted, _, _ = jpeg_reference(boxes, quant, altered_dot=0)
                plant_actual = dot_means(planted, boxes, left, top)
                assert plant_actual[0, 0] - estimated[0, 0] > 5
                plant_detected = True

    assert counts == {13: 30, 10: 4, 23: 1}, counts
    actual = np.array(observed)
    synthetic = np.array(predicted)
    residual = actual - synthetic
    exact = np.abs(residual).max(axis=1) <= .01
    assert actual.shape == synthetic.shape == (453, 3)
    assert exact.sum() == 437, int(exact.sum())
    assert len(residual_locations) == 9, residual_locations
    assert plant_detected
    explained = 1 - residual.var(axis=0) / actual.var(axis=0)
    assert np.all(explained > [0.95, 0.99, 0.97]), explained
    print(json.dumps({
        "source": str(path),
        "red_stencils": dict(sorted(counts.items())),
        "dots": len(residual),
        "source_red_fill_rgb": [192, 0, 0],
        "same_original_jpeg_quantization_and_420_sampling": True,
        "identical_all_RGB_central_means_with_tolerance_0_01": int(exact.sum()),
        "rgb_explained_variance": [round(float(a), 9) for a in explained],
        "rgb_residual_RMS": [round(float(x), 9) for x in
                             np.sqrt((residual ** 2).mean(axis=0))],
        "largest_residuals_differing_over_0_25": residual_locations,
        "injected_single_dot_R_plus8_detected": plant_detected,
        "decision": "Color variation of red punctuation squares is reproduced by fixed-red fill and JPEG quantization; residual outliers neighbor red runes."
    }, indent=2))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "resources/liber-primus")
