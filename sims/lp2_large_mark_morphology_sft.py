"""Original-image SFT for LP2's red large-dot punctuation and repeat locations.

Run from the repository root:
    python sims/lp2_large_mark_morphology_sft.py

Requires Pillow, NumPy and opencv-python, as does the existing p0 image SFT.
This tests red-ink dot geometry only; the separate black 13-dot annotation is
not included in the image-component comparison.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def axis_levels(values: list[float], tolerance: float = 5.0) -> list[float]:
    groups: list[list[float]] = []
    for value in sorted(values):
        if not groups or value - float(np.mean(groups[-1])) > tolerance:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [float(np.mean(group)) for group in groups]


def occupancy(components: list[tuple[float, float, int]]) -> tuple[tuple[int, ...], ...]:
    xs = axis_levels([x for x, _, _ in components])
    ys = axis_levels([y for _, y, _ in components])
    assert len(xs) == 3, (len(xs), xs)
    matrix = [[0] * 3 for _ in ys]
    for x, y, _ in components:
        xi = min(range(3), key=lambda i: abs(xs[i] - x))
        yi = min(range(len(ys)), key=lambda i: abs(ys[i] - y))
        assert matrix[yi][xi] == 0, (xi, yi)
        matrix[yi][xi] = 1
    return tuple(tuple(row) for row in matrix)


def red_dot_clusters(image_path: Path) -> list[tuple[int, tuple[tuple[int, ...], ...], tuple[float, float, float, float]]]:
    rgb = np.asarray(Image.open(image_path).convert("RGB"))
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    mask = (
        (red > 120) & (red > 1.35 * green) & (red > 1.35 * blue)
        & (green < 150) & (blue < 150)
    ).astype(np.uint8)
    count, _, stats, centers = cv2.connectedComponentsWithStats(mask, connectivity=8)
    components = []
    for i in range(1, count):
        x, y, w, h, area = map(int, stats[i])
        if 45 <= area <= 130 and 6 <= w <= 12 and 6 <= h <= 12:
            components.append((float(centers[i][0]), float(centers[i][1]), area))

    adjacency = [[] for _ in components]
    for i, (x, y, _) in enumerate(components):
        for j in range(i + 1, len(components)):
            x2, y2, _ = components[j]
            if max(abs(x - x2), abs(y - y2)) <= 24:
                adjacency[i].append(j)
                adjacency[j].append(i)

    seen: set[int] = set()
    found = []
    for i in range(len(components)):
        if i in seen:
            continue
        stack = [i]
        seen.add(i)
        cluster = []
        while stack:
            k = stack.pop()
            cluster.append(components[k])
            for j in adjacency[k]:
                if j not in seen:
                    seen.add(j)
                    stack.append(j)
        if len(cluster) not in (10, 13):
            continue
        xs = [x for x, _, _ in cluster]
        ys = [y for _, y, _ in cluster]
        bbox = (min(xs), min(ys), max(xs), max(ys))
        if bbox[2] - bbox[0] >= 100 or bbox[3] - bbox[1] >= 140:
            continue
        found.append((len(cluster), occupancy(cluster), bbox))
    return found


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    annotations = json.loads((root / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))

    expected13 = (
        (0, 1, 0), (1, 0, 1), (0, 1, 0),
        (1, 0, 1), (0, 1, 0), (1, 0, 1),
        (0, 1, 0), (1, 0, 1), (0, 1, 0),
    )
    expected10 = (
        (0, 1, 0), (1, 0, 1), (0, 1, 0),
        (1, 0, 1), (0, 1, 0), (1, 0, 1),
        (0, 1, 0),
    )

    red13 = []
    red10 = []
    for page in range(56):
        image_path = root / "resources/liber-primus" / f"{page + 17}.jpg"
        for count, pattern, bbox in red_dot_clusters(image_path):
            if count == 13:
                assert pattern == expected13, (page, pattern)
                red13.append((page, bbox))
            else:
                assert pattern == expected10, (page, pattern)
                red10.append((page, bbox))
    assert len(red13) == 27, len(red13)
    assert len(red10) == 3, len(red10)

    annotation_by_page = {p["page"]: p for p in annotations["pages"]}
    repeat_total = 0
    red_runes = 0
    red_spans = 0
    repeats_in_red = []
    marks = []
    near_marks = []
    nearest = None

    for page in corpus["pages"]:
        if page["page"] >= 56:
            continue
        pno = page["page"]
        ann = annotation_by_page.get(pno, {})
        red_mask = [0] * len(page["indices"])
        for span in ann.get("red_spans", []):
            red_spans += 1
            red_runes += span["length"]
            for j in range(span["start"], span["start"] + span["length"]):
                if 0 <= j < len(red_mask):
                    red_mask[j] = 1

        repeats = [
            j for j in range(1, len(page["indices"]))
            if page["indices"][j] == page["indices"][j - 1]
        ]
        repeat_total += len(repeats)
        for j in repeats:
            if red_mask[j] and red_mask[j - 1]:
                repeats_in_red.append({"page": pno, "offset": j})

        for offset, dots, color in ann.get("large_punctuation", []):
            marks.append((pno, offset, dots, color))
            for j in repeats:
                distance = abs(j - offset)
                if distance <= 1:
                    near_marks.append({
                        "page": pno, "markOffset": offset,
                        "dots": dots, "color": color, "repeatOffset": j
                    })
                candidate = (distance, pno, offset, j, dots, color)
                if nearest is None or candidate < nearest:
                    nearest = candidate

    assert repeat_total == 86, repeat_total
    assert red_runes == 213 and red_spans == 16, (red_runes, red_spans)
    assert len(repeats_in_red) == 1, repeats_in_red
    assert repeats_in_red == [{"page": 27, "offset": 229}], repeats_in_red
    assert len(marks) == 31, len(marks)
    assert not near_marks, near_marks
    assert nearest is not None and nearest[0] == 4, nearest

    print(json.dumps({
        "result": "PASS",
        "red13Count": len(red13),
        "red13Pages": [p for p, _ in red13],
        "red13Pattern": ["".join(map(str, row)) for row in expected13],
        "red10Count": len(red10),
        "red10Pages": [p for p, _ in red10],
        "red10Pattern": ["".join(map(str, row)) for row in expected10],
        "separateBlack13Mark": "not included in red-ink morphology comparison",
        "redRunes": red_runes,
        "redSpans": red_spans,
        "repeatTransitions": repeat_total,
        "repeatPairsWhollyInsideRedSpans": repeats_in_red,
        "largeMarks": len(marks),
        "repeatWithinOneRuneOfLargeMark": near_marks,
        "nearestMarkRepeat": {
            "offsetDifference": nearest[0],
            "page": nearest[1],
            "markOffset": nearest[2],
            "repeatOffset": nearest[3],
            "dots": nearest[4],
            "color": nearest[5]
        }
    }, indent=2))


if __name__ == "__main__":
    main()
