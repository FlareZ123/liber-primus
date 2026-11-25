#!/usr/bin/env python3
"""Original-JPEG adjudication of the two non-I/l pp49-51 byte conflicts.

Run from repository root:
  python sims/lp2_pp49_51_ow_cell_source_sft.py
Optional independent original image archive:
  python sims/lp2_pp49_51_ow_cell_source_sft.py --zip /path/liber-primus-jpegs.zip

The two cells are checked against same-font controls: O versus digit 5,
and uppercase W versus adjacent lowercase w. No OCR is used.
"""
import argparse
import hashlib
import io
import json
import zipfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
THRESHOLDS = (70, 90, 120, 140, 180)

parser = argparse.ArgumentParser()
parser.add_argument("--zip", default=None)
args = parser.parse_args()

grid = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json").read_text())
assert [page["rows"] for page in grid["pages"]] == [10, 13, 9]
tokens = [token for page in grid["pages"] for token in page["tokens"]]
assert len(tokens) == 256

def base60(token):
    assert len(token) == 2 and all(c in ALPHABET for c in token)
    return 60 * ALPHABET.index(token[0]) + ALPHABET.index(token[1])

if args.zip:
    archive = zipfile.ZipFile(args.zip)
    def source(page_number):
        matches = [name for name in archive.namelist()
                   if name.endswith("/%d.jpg" % page_number)
                   or name == "%d.jpg" % page_number]
        assert len(matches) == 1, (page_number, matches)
        return archive.read(matches[0])
else:
    def source(page_number):
        return (ROOT / "resources/liber-primus" / ("%d.jpg" % page_number)).read_bytes()

images = {}
image_sha256 = {}
for page_number in (66, 68):
    raw = source(page_number)
    image_sha256[str(page_number)] = hashlib.sha256(raw).hexdigest()
    image = Image.open(io.BytesIO(raw)).convert("L")
    assert image.size == (2400, 3600)
    images[page_number] = image

# Page 49 is image 66 (10 rows); page 51 is image 68 (9 rows).
# The table is eight columns wide. These cell boxes use the same fixed
# geometry as the repository's original-JPEG I/l adjudication.
def cell_crop(page_number, local_row, column, height=90):
    y0 = 1250 if page_number == 66 else 630
    y = y0 + 179 * local_row
    x0, x1 = 650, 1760
    cell_width = (x1 - x0) / 8
    left = round(x0 + column * cell_width)
    right = round(x0 + (column + 1) * cell_width)
    return images[page_number].crop((left, y, right, y + height)).convert("L")

def dark_components(crop, threshold):
    pixels = crop.load()
    width, height = crop.size
    seen = [[False] * width for _ in range(height)]
    components = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y] >= threshold or seen[y][x]:
                continue
            stack = [(x, y)]
            seen[y][x] = True
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while stack:
                px, py = stack.pop()
                area += 1
                min_x, max_x = min(min_x, px), max(max_x, px)
                min_y, max_y = min(min_y, py), max(max_y, py)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = px + dx, py + dy
                        if (0 <= nx < width and 0 <= ny < height
                                and not seen[ny][nx]
                                and pixels[nx, ny] < threshold):
                            seen[ny][nx] = True
                            stack.append((nx, ny))
            if area > 10:
                components.append((min_x, min_y,
                                   max_x - min_x + 1,
                                   max_y - min_y + 1, area))
    return sorted(components, key=lambda item: item[0])

def enclosed_white_components(crop, component, threshold):
    x, y, width, height, _ = component
    glyph = crop.crop((x, y, x + width, y + height))
    pixels = glyph.load()
    seen = [[False] * width for _ in range(height)]
    stack = []
    for xx in range(width):
        if pixels[xx, 0] >= threshold:
            seen[0][xx] = True
            stack.append((xx, 0))
        if pixels[xx, height - 1] >= threshold and not seen[height - 1][xx]:
            seen[height - 1][xx] = True
            stack.append((xx, height - 1))
    for yy in range(height):
        if pixels[0, yy] >= threshold and not seen[yy][0]:
            seen[yy][0] = True
            stack.append((0, yy))
        if pixels[width - 1, yy] >= threshold and not seen[yy][width - 1]:
            seen[yy][width - 1] = True
            stack.append((width - 1, yy))
    while stack:
        xx, yy = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = xx + dx, yy + dy
            if (0 <= nx < width and 0 <= ny < height
                    and not seen[ny][nx]
                    and pixels[nx, ny] >= threshold):
                seen[ny][nx] = True
                stack.append((nx, ny))
    holes = 0
    for yy in range(height):
        for xx in range(width):
            if pixels[xx, yy] < threshold or seen[yy][xx]:
                continue
            holes += 1
            seen[yy][xx] = True
            stack = [(xx, yy)]
            while stack:
                px, py = stack.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = px + dx, py + dy
                    if (0 <= nx < width and 0 <= ny < height
                            and not seen[ny][nx]
                            and pixels[nx, ny] >= threshold):
                        seen[ny][nx] = True
                        stack.append((nx, ny))
    return holes

# Global cell index -> (image number, local row, column).
# 80 cells on p49, 104 on p50, 72 on p51.
CELLS = {
    39: (66, 4, 7),    # "05": same-font digit-5 control
    215: (68, 3, 7),  # "1O": disputed O/5 cell
    236: (68, 6, 4),  # "3w": adjacent lowercase-w control
    237: (68, 6, 5),  # "0W": disputed W/w cell
}
assert tokens[39] == "05"
assert tokens[215] == "1O"
assert tokens[236] == "3w"
assert tokens[237] == "0W"
assert [base60(tokens[i]) for i in (215, 237)] == [84, 32]

runs = []
for threshold in THRESHOLDS:
    measured = {}
    for index, (page_number, row, col) in CELLS.items():
        crop = cell_crop(page_number, row, col)
        components = dark_components(crop, threshold)
        assert len(components) == 2, (threshold, index, components)
        glyph = components[1]  # second character of the two-character token
        measured[index] = {
            "bbox_width_height": [glyph[2], glyph[3]],
            "enclosed_white_components": enclosed_white_components(
                crop, glyph, threshold)
        }
    assert measured[215]["enclosed_white_components"] == 1
    assert measured[39]["enclosed_white_components"] == 0
    assert measured[237]["bbox_width_height"][1] >= 70
    assert measured[236]["bbox_width_height"][1] <= 48
    assert measured[237]["bbox_width_height"][1] - measured[236]["bbox_width_height"][1] >= 22
    runs.append({"threshold": threshold, "cells": measured})

assert all(run["cells"][215]["enclosed_white_components"] == 1 for run in runs)
assert all(run["cells"][39]["enclosed_white_components"] == 0 for run in runs)
assert all(run["cells"][237]["bbox_width_height"][1] >= 70 for run in runs)
assert all(run["cells"][236]["bbox_width_height"][1] <= 48 for run in runs)

print(json.dumps({
    "status": "PASS",
    "source_images": image_sha256,
    "thresholds": list(THRESHOLDS),
    "disputed_cells": {
        "215": {"token": tokens[215], "base60_value": base60(tokens[215]),
                "visual_test": "closed O has one enclosed white component; digit 5 control has none"},
        "237": {"token": tokens[237], "base60_value": base60(tokens[237]),
                "visual_test": "uppercase W is at least 70 px high; adjacent lowercase w is at most 48 px high"}
    },
    "controls": {
        "39": {"token": tokens[39], "base60_value": base60(tokens[39])},
        "236": {"token": tokens[236], "base60_value": base60(tokens[236])}
    },
    "measurements": runs,
    "conclusion": "The original images select 1O=84 at cell 215 and 0W=32 at cell 237; neither decimal-preferred alternative is supported."
}, indent=2))
