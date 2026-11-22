"""Source-selected p22 corpse art difference gate on original JPEGs.

Original LP1 scan14 and LP2 scan39 are one mirrored illustration family.
This script checks whether the p22 version contains a visible new drawing
or payload overlay distinct from the identical LP1 14/15 footer copies.
Requires numpy and opencv-python. Does not seek arbitrary low-bit payloads.
"""
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FILES = ROOT / "resources" / "liber-primus"


def grayscale(scan: str) -> np.ndarray:
    image = cv2.imread(str(FILES / scan), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400), scan
    return image


def source_align(source: np.ndarray, target: np.ndarray):
    """Compute a single original-body grayscale affine registration."""
    detector = cv2.SIFT_create(nfeatures=4500, contrastThreshold=0.018)
    kp1, des1 = detector.detectAndCompute(source, None)
    kp2, des2 = detector.detectAndCompute(target, None)
    matcher = cv2.BFMatcher()
    pairs = matcher.knnMatch(des1, des2, k=2)
    good = [first for first, second in pairs if first.distance < 0.74 * second.distance]
    assert len(good) > 250, len(good)
    p1 = np.float32([kp1[m.queryIdx].pt for m in good])
    p2 = np.float32([kp2[m.trainIdx].pt for m in good])
    matrix, inliers = cv2.estimateAffinePartial2D(
        p1, p2, method=cv2.RANSAC, ransacReprojThreshold=2.5, maxIters=20000
    )
    assert matrix is not None and int(inliers.sum()) > 300
    scale = float(np.linalg.norm(matrix[0, :2]))
    assert 1.002 < scale < 1.009, scale
    warped = cv2.warpAffine(
        source, matrix, (target.shape[1], target.shape[0]),
        flags=cv2.INTER_CUBIC, borderValue=255
    )
    return warped, good, inliers, matrix


def main() -> None:
    lp1 = grayscale("14.jpg")
    lp1_copy = grayscale("15.jpg")
    lp2 = grayscale("39.jpg")
    assert np.array_equal(lp1[-400:], lp1_copy[-400:])

    target = lp2[-650:]
    source = cv2.flip(lp1[-650:], 1)
    warped, good, inliers, matrix = source_align(source, target)
    residual = cv2.absdiff(warped, target)
    inner = residual[:-1]  # discard frame-edge warp/border artifact
    high = int(np.count_nonzero(inner > 80))
    very_high = int(np.count_nonzero(inner > 100))
    all_mae = float(np.mean(residual))
    assert high < 25 and very_high < 25, (high, very_high)

    # Independent original-style visible mark control on the actual target,
    # entirely inside the body crop, well away from the warp border.
    marked = target.copy()
    cv2.rectangle(marked, (1250, 270), (1309, 289), color=0, thickness=-1)
    plant_inner = cv2.absdiff(warped, marked)[:-1]
    assert int(np.count_nonzero(plant_inner > 80)) > 200

    print({
        "control_original_identical_footer": True,
        "source_matches": len(good),
        "affine_inliers": int(inliers.sum()),
        "source_scale": round(float(np.linalg.norm(matrix[0, :2])), 8),
        "original_all_pixel_mean_absolute_residual": round(all_mae, 6),
        "original_nonframe_abs_residual_gt80": high,
        "original_nonframe_abs_residual_gt100": very_high,
        "visible_mark_positive_control": True,
        "decision": "No independent high-contrast drawing in p22 mirrored corpse",
    })


if __name__ == "__main__":
    main()
