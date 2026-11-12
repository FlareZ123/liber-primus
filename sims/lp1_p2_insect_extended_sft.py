#!/usr/bin/env python3
"""Original JPEG SFT: LP1 p1/p15 vertical insect reuse on LP2 p2.

Read unmodified 2400x3600 source images; uses image matching only, no rune
transcript, plaintext, language score, tuned cipher or inferred page key.
"""
from __future__ import annotations
import hashlib
import json
import math
import sys
from pathlib import Path
import cv2
import numpy as np

SHA = {
    1: "71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46",
    10: "12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376",
    13: "bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56",
    15: "f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}
X, Y, W, H = 876, 2642, 690, 185


def read_sources(base):
    images = {}
    for number, digest in SHA.items():
        path = base / f"{number:02}.jpg"
        assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, path
        image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
        assert image is not None and image.shape == (3600, 2400), path
        images[number] = image
    return images


def art_features(image, sift):
    small = cv2.resize(image, (600, 900), interpolation=cv2.INTER_AREA)
    dark = (small < 180).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(dark, 8)
    selected = [i for i in range(1, count)
                if stats[i, cv2.CC_STAT_AREA] >= 450
                and (stats[i, cv2.CC_STAT_WIDTH] >= 45
                     or stats[i, cv2.CC_STAT_HEIGHT] >= 43)]
    mask = cv2.dilate(np.isin(labels, selected).astype(np.uint8)*255,
                      np.ones((5, 5), np.uint8))
    return sift.detectAndCompute(small, mask)


def register(source, target):
    skp, sdes = source
    dkp, ddes = target
    matcher = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=80))
    matches = matcher.knnMatch(sdes, ddes, k=2)
    good_by_target = {}
    for pair in matches:
        if len(pair) != 2:
            continue
        m, next_best = pair
        if m.distance >= .7*next_best.distance:
            continue
        if m.trainIdx not in good_by_target or m.distance < good_by_target[m.trainIdx].distance:
            good_by_target[m.trainIdx] = m
    good = list(good_by_target.values())
    src = np.float32([skp[m.queryIdx].pt for m in good])
    dst = np.float32([dkp[m.trainIdx].pt for m in good])
    cv2.setRNGSeed(3301)
    matrix, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC,
                                                   ransacReprojThreshold=3, maxIters=3000)
    assert matrix is not None and inliers is not None
    return matrix, len(good), int(inliers.sum())


def overlap(source, target, quarter_transform):
    full = quarter_transform.copy()
    full[:, 2] *= 4
    warped = cv2.warpAffine(source, full, (2400, 3600),
                            flags=cv2.INTER_LINEAR, borderValue=255)
    a = warped[Y:Y+H, X:X+W] < 128
    b = target[Y:Y+H, X:X+W] < 128
    return float(np.count_nonzero(a & b)/np.count_nonzero(a | b))


def main():
    base = Path(sys.argv[1]) if len(sys.argv)>1 else Path("resources/liber-primus")
    images = read_sources(base)
    cv2.setNumThreads(1)
    sift = cv2.SIFT_create(nfeatures=3000, contrastThreshold=.012)
    features = {n: art_features(image, sift) for n, image in images.items() if n != 10}
    output = {}
    first_matrix = None
    for n in (1, 13, 15):
        matrix, matched, inliers = register(features[n], features[19])
        scale = math.hypot(matrix[0, 0], matrix[1, 0])
        degrees = math.degrees(math.atan2(matrix[1, 0], matrix[0, 0]))
        iou = overlap(images[n], images[19], matrix)
        if n == 1:
            first_matrix = matrix
        if n in (1, 15):
            assert inliers >= 30 and abs(abs(degrees)-90)<1.5
            assert .94<scale<1.04 and iou>.70
        else:
            assert inliers>=30 and abs(degrees)<1.5 and iou>.97
        output[f"LP1_p{n}"] = {
            "unique_descriptor_matches": matched, "affine_inliers": inliers,
            "scale": scale, "degrees": degrees, "ink_iou": iou
        }
    assert first_matrix is not None
    wrong = overlap(images[10], images[19], first_matrix)
    assert wrong < .20, wrong
    output["wrong_LP1_p10_under_p1_transform"] = wrong
    output["insect_parent_intersection_with_p22_footer"] = [15, 16]
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
