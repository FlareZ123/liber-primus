#!/usr/bin/env python3
"""Original-source moth edit gate with solved-art and synthetic positive controls.

SFT reads only repository JPEGs and outputs JSON; requires numpy and opencv-python.
Source crops, registration and pixel thresholds never use unknown LP2 ciphertext.
"""
from __future__ import annotations

from hashlib import sha256
import json
from pathlib import Path

import cv2
import numpy as np

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
HASHES = {
    5: "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
    9: "975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
    70: "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
    71: "dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4",
    72: "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
}


def page(number: int) -> np.ndarray:
    data = (SOURCE / f"{number:02}.jpg").read_bytes()
    assert sha256(data).hexdigest() == HASHES[number], number
    img = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert img is not None and img.shape == (3600, 2400), number
    return img


def gate(source: np.ndarray, target: np.ndarray, inverse: np.ndarray) -> dict:
    aligned = cv2.warpPerspective(target, inverse, (source.shape[1], source.shape[0]),
                                  flags=cv2.INTER_AREA, borderValue=255)
    mask = np.zeros(source.shape, dtype=bool)
    mask[142:350, 205:695] = True  # Actual moth; exclude neighboring ornament/text
    a = (source < 125) & mask
    b = (aligned < 125) & mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    only_a = a & ~cv2.dilate(b.astype(np.uint8), kernel).astype(bool)
    only_b = b & ~cv2.dilate(a.astype(np.uint8), kernel).astype(bool)
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(
        (only_a | only_b).astype(np.uint8), 8)
    regions = sorted(
        ({"area": int(stats[i, cv2.CC_STAT_AREA]),
          "x": int(stats[i, cv2.CC_STAT_LEFT]),
          "y": int(stats[i, cv2.CC_STAT_TOP]),
          "width": int(stats[i, cv2.CC_STAT_WIDTH]),
          "height": int(stats[i, cv2.CC_STAT_HEIGHT])}
         for i in range(1, count)),
        key=lambda region: region["area"], reverse=True)
    return {
        "source_ink_pixels": int(a.sum()),
        "target_ink_pixels": int(b.sum()),
        "source_only_pixels_after_radius2": int(only_a.sum()),
        "target_only_pixels_after_radius2": int(only_b.sum()),
        "largest_residual_components": regions[:6],
        "components_area_at_least_20": sum(region["area"] >= 20 for region in regions),
    }


def main() -> None:
    lp1, lp2a, lp2b, wrong = (page(i) for i in (5, 70, 72, 71))
    source = lp1[1450:1900, 750:1650]
    target = lp2a[2500:3250, 450:1950]
    translated = lp2b[2567:3317, 516:2016]
    wrong_target = wrong[2500:3250, 450:1950]

    sift = cv2.SIFT_create(nfeatures=2200, contrastThreshold=0.005)
    source_kp, source_desc = sift.detectAndCompute(source, None)
    target_kp, target_desc = sift.detectAndCompute(target, None)
    assert source_desc is not None and target_desc is not None
    pairs = cv2.BFMatcher().knnMatch(source_desc, target_desc, k=2)
    accepted = [m for m, runner_up in pairs if m.distance < 0.75 * runner_up.distance]
    from_xy = np.float32([source_kp[m.queryIdx].pt for m in accepted])
    to_xy = np.float32([target_kp[m.trainIdx].pt for m in accepted])
    transform, inliers = cv2.findHomography(from_xy, to_xy, cv2.RANSAC, 3.0)
    assert transform is not None and inliers is not None
    assert len(accepted) >= 350 and int(inliers.sum()) >= 335
    scales = np.linalg.svd(transform[:2, :2])[1]
    assert 2.32 < float(scales.min()) <= float(scales.max()) < 2.34
    inverse = np.linalg.inv(transform)

    p53, p55 = gate(source, target, inverse), gate(source, translated, inverse)
    assert p53["components_area_at_least_20"] == 0
    assert p55["components_area_at_least_20"] == 0
    assert p53["source_only_pixels_after_radius2"] <= 2
    assert p55["source_only_pixels_after_radius2"] <= 2

    # Two independently encoded LP2 physical pages show the exact same moth.
    art53 = lp2a[2663:3213, 564:1834]
    art55 = lp2b[2730:3280, 630:1900]
    diff = np.abs(art53.astype(np.int16) - art55.astype(np.int16))
    assert int(diff.max()) == 10

    # Wrong source page and a second known copied-art family calibrate the gate.
    wrong_result = gate(source, wrong_target, inverse)
    assert wrong_result["source_only_pixels_after_radius2"] > 5000
    insect1 = page(9)[1935:2120, 835:1525][:, ::-1]
    insect2 = page(19)[2642:2827, 876:1566]
    black_a, black_b = insect1 < 100, insect2 < 100
    insect_iou = float((black_a & black_b).sum() / (black_a | black_b).sum())
    assert insect_iou > 0.99997

    # Sensitivity: original-scale white (400,240) gets a large black mark.
    point = transform @ np.array([400.0, 240.0, 1.0])
    cx, cy = (int(round(x)) for x in point[:2] / point[2])
    injected = target.copy()
    cv2.circle(injected, (cx, cy), 15, 0, thickness=-1)
    positive = gate(source, injected, inverse)
    assert positive["components_area_at_least_20"] >= 1
    assert positive["largest_residual_components"][0]["area"] >= 30

    print(json.dumps({
        "source_sha256": HASHES,
        "registration": {
            "source_lp1_crop_xyxy": [750, 1450, 1650, 1900],
            "lp2_p53_crop_xyxy": [450, 2500, 1950, 3250],
            "matched_features": len(accepted),
            "ransac_inliers": int(inliers.sum()),
            "scales": [float(value) for value in scales],
            "homography": transform.tolist(),
        },
        "p53": p53, "p55": p55,
        "within_lp2": {
            "pixels": int(diff.size),
            "gray_max_abs_difference": int(diff.max()),
            "gray_exact_pixels": int(np.count_nonzero(diff == 0)),
            "gray_abs_diff_over_4": int(np.count_nonzero(diff > 4)),
        },
        "wrong_p54_lost_source_ink": wrong_result["source_only_pixels_after_radius2"],
        "independent_copied_insect_ink_iou": insect_iou,
        "planted_spot_positive": {
            "p53_crop_center_xy": [cx, cy],
            "max_residual_component": positive["largest_residual_components"][0]["area"],
        },
        "conclusion": "No fixed-threshold residual component >=20 pixels; edit-key gate closed."
    }, indent=2))


if __name__ == "__main__":
    main()
