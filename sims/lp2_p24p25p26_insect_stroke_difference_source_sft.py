"""Original p24-26 insect triptych: independently visible edit or raster shift?

The four isolated insect quarters are tested without text or ciphertext.
Zero parameters are fitted to an unknown plaintext. Source images, 2014:
  LP2 p24 = original 41.jpg, p25 = 42.jpg, p26 = 43.jpg.
Run: python sims/lp2_p24p25p26_insect_stroke_difference_source_sft.py
Requires NumPy and opencv-python; reads image files, no writes.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    24: ("41.jpg", "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80"),
    25: ("42.jpg", "a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff"),
    26: ("43.jpg", "ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7"),
}
# Four independently visible wings/bodies, no letter ink. Coordinates x0,x1,y0,y1.
REGIONS = {
    "left_upper": (0, 570, 950, 1700),
    "left_lower": (0, 570, 1700, 2450),
    "right_upper": (1850, 2400, 950, 1700),
    "right_lower": (1850, 2400, 1700, 2450),
}


def source_images() -> dict[int, np.ndarray]:
    images = {}
    for page, (filename, digest) in SOURCES.items():
        data = (ROOT / "resources" / "liber-primus" / filename).read_bytes()
        assert hashlib.sha256(data).hexdigest() == digest
        images[page] = cv2.imdecode(
            np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE
        )
        assert images[page] is not None and images[page].shape == (3600, 2400)
    return images


def components_above_100(original: np.ndarray, candidate: np.ndarray) -> tuple[int, int]:
    difference = np.abs(original.astype(np.int16) - candidate.astype(np.int16))
    changed = (difference > 100).astype(np.uint8)
    _, _, stat, _ = cv2.connectedComponentsWithStats(changed, 8)
    largest = int(np.max(stat[1:, cv2.CC_STAT_AREA])) if len(stat) > 1 else 0
    return int(changed.sum()), largest


def main() -> None:
    images = source_images()
    output = {}
    for name, (x0, x1, y0, y1) in REGIONS.items():
        # The original p25 printing is shifted by exactly one native pixel
        # in both axes. Align physical pixels without interpolation.
        outer24 = images[24][y0+1:y1, x0+1:x1]
        center25 = images[25][y0:y1-1, x0:x1-1]
        outer26 = images[26][y0+1:y1, x0+1:x1]
        assert np.array_equal(outer24, outer26), "p24/p26 copy differs"
        delta = np.abs(outer24.astype(np.int16) - center25.astype(np.int16))
        changed, largest = components_above_100(outer24, center25)
        assert delta.mean() < 1.2, (name, float(delta.mean()))
        assert largest <= 22, (name, largest)
        output[name] = {
            "p24_p26_identical": True,
            "p24_p25_registered_mean_abs": round(float(delta.mean()), 6),
            "changed_pixels_intensity_gt_100": changed,
            "largest_high_contrast_region": largest,
        }

    # The same finite high-contrast component gate detects an independently
    # planted 20x20-pixel solid black art edit without changing the original.
    x0, x1, y0, y1 = REGIONS["left_upper"]
    control = images[24][y0+1:y1, x0+1:x1]
    plant = control.copy()
    plant[10:30, 10:30] = 0
    planted_changed, planted_largest = components_above_100(control, plant)
    assert planted_changed >= 400
    assert planted_largest >= 400
    assert sum(r["changed_pixels_intensity_gt_100"] for r in output.values()) == 60
    print(json.dumps({
        "original_images": list(SOURCES.values()),
        "art_regions": output,
        "positive_control": {
            "patch": "20x20 solid high-contrast graphic edit",
            "changed_pixels": planted_changed,
            "largest_component": planted_largest,
        },
        "result": "p24/p26 exact art plate; p25 1px registration and no high-contrast contiguous changed shape",
    }, indent=2))
    print("PASS: original p24/p25/p26 art has no separate large edited glyph/mark")


if __name__ == "__main__":
    main()
