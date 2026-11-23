"""SFT: distinguish original LP2 red 13-dot ink glyphs from per-marker payload art.

Run from a checkout: python sims/lp2_red13_marker_geometry_source_sft.py
Optional owner ZIP: python sims/lp2_red13_marker_geometry_source_sft.py --zip <path>
Dependencies: Pillow, NumPy, SciPy. Reads original source JPEGs without writing files.
"""

import argparse
from collections import Counter
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image
from scipy.ndimage import find_objects, label

ROOT = Path(__file__).resolve().parents[1]
PATTERN = ((0, 0), (-15, 12), (15, 12), (0, 20), (-15, 30),
           (15, 30), (0, 38), (-15, 47), (15, 47), (0, 58),
           (-15, 64), (15, 64), (0, 76))


def red_components(image):
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    red = ((rgb[:, :, 0] > 90) & (rgb[:, :, 0] > rgb[:, :, 1] * 1.55)
           & (rgb[:, :, 0] > rgb[:, :, 2] * 1.55) & (rgb[:, :, 1] < 160))
    numbered, _ = label(red)
    components = []
    for index, rect in enumerate(find_objects(numbered)):
        if rect is None:
            continue
        y0, y1, x0, x1 = rect[0].start, rect[0].stop, rect[1].start, rect[1].stop
        width, height = x1 - x0, y1 - y0
        count = int((numbered[rect] == index + 1).sum())
        if 7 <= width <= 12 and 7 <= height <= 12 and 60 <= count <= 110:
            components.append((x0, y0, width, height, count))
    return components


def markers(components):
    positions = np.array([(c[0], c[1]) for c in components], dtype=np.int32).reshape(-1, 2)
    used = set()
    output = []
    for top in components:
        x0, y0 = top[:2]
        found = []
        for dx, dy in PATTERN:
            deltas = np.abs(positions - [x0 + dx, y0 + dy])
            matches = np.where((deltas[:, 0] <= 3) & (deltas[:, 1] <= 3))[0]
            if not len(matches):
                break
            closest = min(matches, key=lambda index: int(np.sum((positions[index] - [x0 + dx, y0 + dy]) ** 2)))
            found.append(int(closest))
        if len(found) != 13 or len(set(found)) != 13 or min(found) in used:
            continue
        used.add(min(found))
        dots = [components[index] for index in found]
        residuals = [(dot[0] - x0 - dx, dot[1] - y0 - dy)
                     for dot, (dx, dy) in zip(dots, PATTERN)]
        output.append(dict(origin=(x0, y0), dots=dots, residuals=residuals))
    return output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", help="owner ZIP containing liber-primus-jpegs/17.jpg..74.jpg")
    args = parser.parse_args()
    annotated = json.loads((ROOT / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
    expected = {int(p["page"]): sum(mark[1] == 13 and mark[2] == "red"
              for mark in p.get("large_punctuation", [])) for p in annotated["pages"]}
    archive = ZipFile(args.zip) if args.zip else None
    all_marks = []
    residual_hist = Counter()
    for page in range(58):
        jpeg = f"{page + 17:02}.jpg"
        if archive:
            image = Image.open(BytesIO(archive.read(f"liber-primus-jpegs/{jpeg}")))
        else:
            image = Image.open(ROOT / "resources/liber-primus" / jpeg)
        detected = markers(red_components(image))
        count = expected.get(page, 0)
        assert len(detected) == count, f"page {page}: expected {count} red-13 glyphs, detected {len(detected)}"
        for mark in detected:
            assert len(mark["dots"]) == 13
            assert all(dot[2] * dot[3] == dot[4] for dot in mark["dots"]), "non-solid dot"
            assert all(max(abs(dx), abs(dy)) <= 1 for dx, dy in mark["residuals"]), "nonstandard dot placement"
            residual_hist.update(mark["residuals"])
            all_marks.append((page, mark))
            print(f"p{page:02}: red13 at xy={mark['origin']}")
    if archive:
        archive.close()
    assert len(all_marks) == 30
    assert sum(residual_hist.values()) == 390
    assert len([m for p, m in all_marks if p == 56]) == 2
    assert len([m for p, m in all_marks if p == 57]) == 1
    print(f"PASS source red13 marks={len(all_marks)}, solid component dots={sum(residual_hist.values())}")
    print("Relative-position integer raster residuals:", sorted(residual_hist.items()))
    print("All thirty marks share the same 5-center/4-left/4-right solid-dot topology.")
    print("Scope: no distinct large-scale marker variant; subpixel or JPEG color payload not ruled out.")


if __name__ == "__main__":
    main()
