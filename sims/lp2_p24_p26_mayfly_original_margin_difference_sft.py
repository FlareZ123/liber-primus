"""SFT: test LP2 original p24-26 mayfly art for page-specific graphic edits.

The repeated inset mayfly picture is independently source-attributed to a
1977 Severa/Zahradnik illustration. This test isolates two outer artwork-only
margins on original physical p24,p25,p26, so central changing rune text cannot
create spurious differences. Pixel equality and native-scale translation are
measured without a proposed cipher or key.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile

import cv2
from filelock import FileLock
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "im-results/lp2-p24-p26-mayfly-margin-original-pixel-difference.json"
INPUTS = {
    24: ("41.jpg", "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80"),
    25: ("42.jpg", "a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff"),
    26: ("43.jpg", "ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7"),
}
# (x0,x1,y0,y1) exclude all changing central rune columns.
BANDS = {"left_art": (0, 570, 900, 2600),
         "right_art": (1850, 2400, 900, 2600)}


def input_images():
    result = {}
    for page, (name, expected) in INPUTS.items():
        original = (ROOT / "resources/liber-primus" / name).read_bytes()
        assert hashlib.sha256(original).hexdigest() == expected
        image = cv2.imdecode(np.frombuffer(original, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        assert image is not None and image.shape == (3600, 2400)
        result[page] = image
    return result


def compare(reference, candidate, bbox):
    x0, x1, y0, y1 = bbox
    target = reference[y0+40:y1-40, x0+40:x1-40]
    source = candidate[y0:y1, x0:x1]
    scores = cv2.matchTemplate(255-source, 255-target, cv2.TM_CCOEFF_NORMED)
    _, corr, _, (sx, sy) = cv2.minMaxLoc(scores)
    selected = source[sy:sy+target.shape[0], sx:sx+target.shape[1]]
    delta = cv2.absdiff(target, selected)
    return {
        "translation_xy": [sx-40, sy-40],
        "registered_correlation": round(float(corr), 8),
        "registered_mean_abs_pixel": round(float(delta.mean()), 8),
        "exact_pixel_fraction": round(float(np.mean(target == selected)), 8),
        "dark_220_xor_fraction": round(float(np.mean((target < 220) != (selected < 220))), 8),
        "large_intensity_difference_fraction": round(float(np.mean(delta > 10)), 8),
    }


def run():
    image = input_images()
    observations = {}
    for name, box in BANDS.items():
        x0, x1, y0, y1 = box
        outer_a = image[24][y0:y1, x0:x1]
        outer_b = image[26][y0:y1, x0:x1]
        exact = bool(np.array_equal(outer_a, outer_b))
        assert exact, ("original p24 and p26 source-art margins changed", name)
        record = {"bbox_xyxy": [x0,y0,x1,y1],
                  "p24_vs_p26_original_pixels_exact": exact,
                  "original_equal_pixel_count": int(outer_a.size),
                  "p24_vs_p25": compare(image[24], image[25], box),
                  "p24_vs_p26": compare(image[24], image[26], box)}
        assert record["p24_vs_p25"]["translation_xy"] == [-1,-1], record
        assert record["p24_vs_p25"]["registered_correlation"] > 0.99, record
        assert record["p24_vs_p26"]["translation_xy"] == [0,0], record
        assert record["p24_vs_p26"]["registered_mean_abs_pixel"] == 0, record
        observations[name] = record
        print(name, json.dumps(record), flush=True)
    report = {"original_sources": {str(page): {"path": name, "sha256": digest}
                                   for page, (name, digest) in INPUTS.items()},
              "result": "p24 and p26 repeated mayfly margins are identical; p25 register is shifted one pixel and differs in edge/compression pixels",
              "bands": observations,
              "scope": "side margin artwork only; not the central ciphertext and not a source-book image comparison"}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", newline="\n",
                                         prefix=".mayfly-diff-", suffix=".tmp",
                                         dir=OUT.parent, delete=False) as f:
            tmp = Path(f.name)
            json.dump(report, f, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, OUT)
    return report


if __name__ == "__main__":
    run()
