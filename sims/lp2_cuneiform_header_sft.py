"""Verify the repeated LP2 p33–39 cuneiform illustration on original JPEGs.

Requires numpy and opencv-python. Use an optional directory argument to point to
00.jpg through 74.jpg; the default is repository resources/liber-primus.
"""
from pathlib import Path
import hashlib
import json
import sys

import cv2
import numpy as np


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) == 2 else Path(__file__).resolve().parents[1] / "resources" / "liber-primus"

    def image(page: int) -> np.ndarray:
        im = cv2.imread(str(source / f"{page + 17:02d}.jpg"), cv2.IMREAD_COLOR)
        assert im is not None and im.shape == (3600, 2400, 3), page
        return im

    original = image(33)
    template = cv2.cvtColor(original[3025:3450, 1016:1405], cv2.COLOR_BGR2GRAY)
    small_template = cv2.resize(template, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    scans = []
    header_hashes = {}
    for page in range(58):
        im = image(page)
        small = cv2.resize(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
        corr = cv2.matchTemplate(small, small_template, cv2.TM_CCOEFF_NORMED)
        _, maximum, _, location = cv2.minMaxLoc(corr)
        scans.append({"page": page, "score": round(float(maximum), 6), "x": location[0] * 4, "y": location[1] * 4})
        if 34 <= page <= 39:
            header = im[131:556, 1016:1405]
            header_hashes[page] = hashlib.sha256(header.tobytes()).hexdigest()
            upper = cv2.cvtColor(im[:900, 850:1550], cv2.COLOR_BGR2GRAY)
            score = cv2.matchTemplate(upper, template, cv2.TM_CCOEFF_NORMED)
            _, peak, _, pos = cv2.minMaxLoc(score)
            assert (pos[0] + 850, pos[1]) == (1016, 131), (page, pos)
            assert peak > 0.969, (page, peak)

    matches = [r["page"] for r in scans if r["score"] > 0.95]
    assert matches == list(range(33, 40)), matches
    assert len(set(header_hashes.values())) == 1, header_hashes
    nonheader_max = max(r["score"] for r in scans if r["page"] not in matches)
    assert nonheader_max < 0.32, nonheader_max
    print(json.dumps({
        "status": "SOURCE VISUAL REPEAT; NO CIPHER OR PLAINTEXT",
        "lp2_physical_pages": matches,
        "archive_scans": [p + 17 for p in matches],
        "source_page33_template": [1016, 3025, 1405, 3450],
        "source_pages34_to39_crop": [1016, 131, 1405, 556],
        "matched_scaled_correlations": [scans[p]["score"] for p in matches],
        "strongest_outside_score": nonheader_max,
        "six_identical_rgb_crops_sha256": next(iter(header_hashes.values())),
        "notes": "The p33 bottom ornament recurs at the tops of pp34–39; it is the already-known 1033/3301 cuneiform, not a decoded new key."
    }, indent=2))


if __name__ == "__main__":
    main()
