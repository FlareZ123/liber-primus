"""Registered pre-2014 logo control for p55 moth's unexplained dark strokes.

The January 2014 source logo is independently dated and recovers the p55
artwork with 561 robust local feature inliers. Register the unmodified source
onto the LP2 original, then ask whether original dark pixels exist more than
four/six source-image pixels from the known silhouette. Original strokes
outside the source are candidates for *visible* added ink, not proof of steg.

Produces JSON and a red residual overlay under im-results. No plaintext
is inferred from picture differences. Windows Python 3.11 compatible.

SFT: python sims/lp2_p55_logo_registered_residual_sft.py
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from filelock import FileLock

from lp2_moth_pre2014_logo_registration_sft import (
    IMAGE, ORIGINAL_SHA256, ROOT, align, get_original, load_image,
)

OUTPUT = ROOT / "im-results/lp2-p55-logo-registered-residual.json"
OVERLAY = ROOT / "im-results/lp2-p55-logo-registered-residual.png"
SOURCE_SHA256 = "0a7fb4199ae595802bfd45893107c0122d2d6b662a11cb908f64c19391224829"


def extra_components(target: np.ndarray, dist: np.ndarray, threshold: int = 160,
                     exclusion_px: float = 4.5) -> tuple[dict, np.ndarray]:
    """Find target ink farther than exclusion_px from registered source ink."""
    extras = np.uint8((target < threshold) & (dist > exclusion_px))
    number, labels, stats, centroids = cv2.connectedComponentsWithStats(
        extras, connectivity=8
    )
    components = []
    for i in range(1, number):
        x, y, w, h, area = (int(v) for v in stats[i])
        if area >= 20:
            components.append({
                "x": x, "y": y, "width": w, "height": h,
                "area": area, "cx": round(float(centroids[i, 0]), 2),
                "cy": round(float(centroids[i, 1]), 2),
            })
    components.sort(key=lambda c: c["area"], reverse=True)
    return {
        "threshold_gray": threshold,
        "exclusion_distance_px": exclusion_px,
        "target_ink_pixels": int((target < threshold).sum()),
        "extra_dark_pixels": int(extras.sum()),
        "extra_fraction_of_target_ink": round(
            float(extras.sum() / max(1, (target < threshold).sum())), 8
        ),
        "components_total": number - 1,
        "components_area_at_least_20": len(components),
        "largest_components": components[:30],
    }, extras.astype(bool)


def main() -> None:
    target, original_sha = get_original()
    source, source_sha = load_image(IMAGE)
    assert original_sha == ORIGINAL_SHA256
    assert source_sha == SOURCE_SHA256, "Reference JPEG content changed"
    registration = align(source, target)
    assert registration["affine_inliers"] >= 500
    assert registration["fuzzy_f1"] > 0.99
    matrix = np.asarray(registration["affine_source_to_original_crop"],
                        dtype=np.float64)
    source_dark = np.uint8(source < 160)
    projected = cv2.warpAffine(
        source_dark, matrix, (target.shape[1], target.shape[0]),
        flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0
    )
    dist = cv2.distanceTransform(
        np.uint8(projected == 0), cv2.DIST_L2, cv2.DIST_MASK_PRECISE
    )
    source_warped = cv2.warpAffine(
        source, matrix, (target.shape[1], target.shape[0]),
        flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
        borderValue=255
    )
    encoded = cv2.imencode(
        ".jpg", source_warped, [int(cv2.IMWRITE_JPEG_QUALITY), 92]
    )[1]
    negative = cv2.imdecode(encoded, cv2.IMREAD_GRAYSCALE)
    # Pre-declared visible-ink insertion control on clear background
    # above the source drawing. All six circles must be recovered.
    positive = negative.copy()
    for x in (100, 300, 500, 700, 900, 1100):
        cv2.circle(positive, (x, 38), 11, 0, -1, lineType=cv2.LINE_8)
    output = {
        "scope": "Visible extra dark ink after pre-2014 logo registration",
        "source_url": IMAGE,
        "source_sha256": source_sha,
        "original_sha256": original_sha,
        "original_p55_crop_xyxy": [650, 2600, 1850, 3300],
        "registration": registration,
        "controls": {},
        "original": {},
        "unknown_lp2_plaintext_recovered": False,
    }
    for exclusion in (3.5, 4.5, 6.5):
        name = str(exclusion)
        original_stats, marked = extra_components(target, dist, exclusion_px=exclusion)
        negative_stats, _ = extra_components(negative, dist, exclusion_px=exclusion)
        positive_stats, _ = extra_components(positive, dist, exclusion_px=exclusion)
        output["original"][name] = original_stats
        output["controls"][name] = {"synthetic_jpeg_negative": negative_stats,
                                    "six_dark_dots_positive": positive_stats}
        if exclusion == 4.5:
            rgb = cv2.cvtColor(target, cv2.COLOR_GRAY2BGR)
            rgb[marked] = (0, 0, 255)
        assert positive_stats["components_area_at_least_20"] >= 6
    assert isinstance(output["original"]["4.5"]["extra_dark_pixels"], int)
    # Source + original are immutable; persist derived diagnostic artifacts
    # atomically under one shared lock.
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        jtmp = OUTPUT.with_name(OUTPUT.name + "." + uuid4().hex + ".tmp")
        ptmp = OVERLAY.with_name(OVERLAY.stem + "." + uuid4().hex + ".png")
        try:
            jtmp.write_text(json.dumps(output, indent=2) + "\n", encoding="utf8")
            assert cv2.imwrite(str(ptmp), rgb)
            os.replace(jtmp, OUTPUT)
            os.replace(ptmp, OVERLAY)
        finally:
            jtmp.unlink(missing_ok=True)
            ptmp.unlink(missing_ok=True)
    concise = {
        "registration_inliers": registration["affine_inliers"],
        "registration_fuzzy_f1": registration["fuzzy_f1"],
        "source_sha256": source_sha,
        "original_vs_synthetic_controls": {
            key: {
                "original": output["original"][key]["extra_dark_pixels"],
                "negative": value["synthetic_jpeg_negative"]["extra_dark_pixels"],
                "positive": value["six_dark_dots_positive"]["extra_dark_pixels"],
                "original_components_ge20":
                    output["original"][key]["components_area_at_least_20"],
            } for key, value in output["controls"].items()
        },
        "largest_original_components": output["original"]["4.5"]["largest_components"][:15],
        "report": str(OUTPUT.relative_to(ROOT)),
        "overlay": str(OVERLAY.relative_to(ROOT)),
    }
    print(json.dumps(concise, indent=2), flush=True)


if __name__ == "__main__":
    main()
