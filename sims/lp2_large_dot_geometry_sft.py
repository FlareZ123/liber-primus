"""Check the geometry of all large red-dot punctuation in original LP2 JPEGs.
Run from repository root: python sims/lp2_large_dot_geometry_sft.py
Dependencies: pillow, numpy, opencv-python-headless, scikit-learn.
Original image files are read-only. Distinct 13/10/23-dot typography is not a key.
"""
from __future__ import annotations
import json
from pathlib import Path
import sys
import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import DBSCAN

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    0: {13: 1}, 2: {13: 1}, 3: {13: 3}, 6: {13: 2}, 7: {13: 2},
    14: {13: 1}, 15: {13: 3}, 22: {13: 1}, 23: {13: 1},
    26: {13: 1}, 27: {13: 1}, 32: {13: 1}, 33: {13: 3},
    36: {10: 1}, 38: {10: 1}, 39: {13: 3}, 49: {10: 1},
    53: {13: 1}, 54: {13: 1}, 55: {13: 1},
    56: {13: 2, 10: 1}, 57: {13: 1, 23: 1},
}

def measure(path: Path) -> list[dict]:
    marks = []
    for physical_page in range(58):
        image = np.array(Image.open(path / f"{physical_page + 17:02d}.jpg").convert("RGB"))
        r, g, b = (image[:, :, i].astype(np.float32) for i in range(3))
        red = ((r > 1.6 * g) & (r > 1.5 * b) & (r > 90)).astype(np.uint8)
        _, _, stats, _ = cv2.connectedComponentsWithStats(red, 8)
        boxes = [tuple(int(q) for q in s) for s in stats[1:]
                 if 8 <= s[2] <= 12 and 8 <= s[3] <= 12 and 65 <= s[4] <= 125]
        if not boxes:
            continue
        points = np.array([(x + w / 2, y + h / 2) for x, y, w, h, area in boxes])
        labels = DBSCAN(eps=95, min_samples=7).fit_predict(points)
        for label in sorted(set(labels) - {-1}):
            dots = points[labels == label]
            if len(dots) < 9:
                continue
            local = dots - dots.min(axis=0)
            local = local[np.lexsort((local[:, 0], local[:, 1]))]
            marks.append({"page": physical_page, "dots": int(len(dots)),
                          "positions": local.tolist()})
    return marks

def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) == 2 else ROOT / "resources" / "liber-primus"
    marks = measure(path)
    by_page = {}
    for mark in marks:
        page = by_page.setdefault(mark["page"], {})
        page[mark["dots"]] = page.get(mark["dots"], 0) + 1
    assert by_page == EXPECTED, (by_page, EXPECTED)
    summary = {"source_images": 58, "red_marks": len(marks), "mark_sizes": {},
               "page_counts_match_source_annotations": True}
    for n in (10, 13, 23):
        group = [np.array(mark["positions"]) for mark in marks if mark["dots"] == n]
        spans = np.ptp(np.stack(group), axis=0)
        max_x, max_y = [float(x) for x in spans.max(axis=0)]
        assert max_x <= (1.5 if n == 13 else 1) and max_y <= 0.5
        summary["mark_sizes"][str(n)] = {
            "count": len(group), "max_x_dot_center_variation_px": max_x,
            "max_y_dot_center_variation_px": max_y,
        }
    assert sum(x["dots"] for x in marks) == 30 * 13 + 4 * 10 + 23
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
