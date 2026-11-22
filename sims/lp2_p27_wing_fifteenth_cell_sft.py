"""Source-exact fifthteenth original wing face under two fixed area cutoffs.

Original resources/liber-primus/44.jpg. Run as a self-contained Python file.
"""
import json
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources/liber-primus/44.jpg"
THRESHOLDS = (80, 120, 160, 200, 235)
CROP = (520, 450, 1940, 930)

def main():
    im = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert im is not None and im.shape == (3600, 2400)
    x0, y0, x1, y1 = CROP
    crop = im[y0:y1, x0:x1]
    rows = []
    for threshold in THRESHOLDS:
        n, labels, stats, centroid = cv2.connectedComponentsWithStats(
            np.uint8(crop > threshold), connectivity=8)
        cells = [i for i in range(1, n)
            if stats[i, cv2.CC_STAT_LEFT] > 0
            and stats[i, cv2.CC_STAT_TOP] > 0
            and stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] < crop.shape[1]
            and stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] < crop.shape[0]
            and stats[i, cv2.CC_STAT_AREA] >= 200]
        large = [i for i in cells if stats[i, cv2.CC_STAT_AREA] >= 500]
        extra = [i for i in cells if stats[i, cv2.CC_STAT_AREA] < 500]
        assert (len(cells), len(large), len(extra)) == (15, 14, 1)
        i = extra[0]
        xy = [round(float(centroid[i, 0] + x0)), round(float(centroid[i, 1] + y0))]
        assert xy == [1231, 839], (threshold, xy)
        rows.append(dict(threshold=threshold, faces_at_200=len(cells),
                         faces_at_500=len(large), fifteenth_face_area=int(stats[i, cv2.CC_STAT_AREA]),
                         fifteenth_face_xy=xy))
    assert [r["fifteenth_face_area"] for r in rows] == [385, 375, 344, 314, 288]
    print(json.dumps(dict(source=str(SOURCE.relative_to(ROOT)), crop_xyxy=CROP,
                          interpretation="cutoff-dependent 14, real 15th; no key/plaintext",
                          thresholds=rows), indent=2))

if __name__ == "__main__":
    main()
