"""Original LP2 colored-stencil census, source JPEG pixels (read-only SFT).

Run from repository root: python sims/lp2_large_red_stencil_pixel_sft.py
Requires numpy and opencv-python. This tests visible shape, not a cipher key.
"""
from collections import Counter, defaultdict
from pathlib import Path
import json
import math

import cv2
import numpy as np

ART = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"


def red_dot_centroids(page):
    image = cv2.imread(str(ART / f"{page + 17:02d}.jpg"))
    assert image is not None, f"Missing original source JPEG {page + 17:02d}.jpg"
    b, g, r = (c.astype(np.int16) for c in cv2.split(image))
    mask = ((r > 75) & (r > 2*g) & (r > 2*b)).astype(np.uint8)
    num, _, stat, cent = cv2.connectedComponentsWithStats(mask, 8)
    assert num == len(stat) == len(cent)
    return [
        tuple(map(float, xy))
        for xy, row in zip(cent[1:], stat[1:])
        if 45 <= row[cv2.CC_STAT_AREA] <= 135
        and 6 <= row[cv2.CC_STAT_WIDTH] <= 13
        and 6 <= row[cv2.CC_STAT_HEIGHT] <= 13
    ]


def red_stencil_clusters(points):
    parents = list(range(len(points)))

    def root(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    for i, (x, y) in enumerate(points):
        for j in range(i):
            a, b = points[j]
            if (x-a)**2 + (y-b)**2 <= 57**2:
                parents[root(i)] = root(j)
    groups = defaultdict(list)
    for i, point in enumerate(points):
        groups[root(i)].append(point)
    return [q for q in groups.values() if len(q) >= 6]


def norm(points):
    left = min(x for x, _ in points)
    top = min(y for _, y in points)
    return [(x-left, y-top) for x, y in points]


def rms(ref, observed):
    return math.sqrt(sum(
        min((x-a)**2+(y-b)**2 for a, b in observed) for x, y in ref
    ) / len(ref))


def run():
    source = json.loads((ART / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    expected = Counter(
        (p["page"], m[1]) for p in source["pages"]
        for m in p.get("large_punctuation", []) if m[2] == "red"
    )
    observed = Counter()
    prototypes = {}
    distances = defaultdict(list)
    for page in range(58):
        for cluster in red_stencil_clusters(red_dot_centroids(page)):
            dots = len(cluster)
            observed[page, dots] += 1
            image = norm(cluster)
            prototypes.setdefault(dots, image)
            distances[dots].append(rms(prototypes[dots], image))
    assert observed == expected, f"Misses {expected-observed}; unexpected {observed-expected}"
    tally = Counter({dots: sum(n for (p, d), n in observed.items() if d == dots)
                     for dots in (10, 13, 23)})
    assert tally == {10: 4, 13: 30, 23: 1}
    assert max(distances[10]) < 1.0 and max(distances[13]) < 1.0
    assert len(distances[23]) == 1
    # Synthetic translation plant and missing-square discriminator.
    a = prototypes[13]
    assert rms(a, norm([(x+217, y+113) for x, y in a])) < 1e-10
    assert len(a[:-1]) == 12
    report = {
        "type": "exact source-JPEG morphology; no unknown rune decrypted",
        "red_stencil_inventory": dict(sorted(tally.items())),
        "red_marks": sum(tally.values()),
        "black_13_dot_event_from_separate_annotation": 1,
        "total_large_ornaments_in_original_58_pages": 36,
        "max_normalized_centroid_rms_pixels": {
            str(n): max(v) for n, v in distances.items()
        },
        "positive_translation_plant": True,
        "missing_square_detected_by_dot_count": True,
    }
    print(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    run()
