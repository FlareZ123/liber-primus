"""Fixed p32 southeast image-tile path, using the original 2016 signed JPEG.

The path was frozen by Agent45 before this image test. It uses the
already established p32 GP-prime axis partition of the authentic 563x569
image. Compare the six proposed tiles to all 36 legal six-step southeast
diagonals with exactly the same rule. No tunable key, direction, threshold,
path start, image edits, or ciphertext fitness search are permitted.
"""

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
IMAGE = ROOT / "resources" / "historical" / "cicada2016-4gq25.jpg"
THRESHOLD = 180
PATH_START = (3, 0)
LENGTH = 6


def cumul(values):
    out = [0]
    for value in values:
        out.append(out[-1] + value)
    return out


def main():
    data = json.loads(CORPUS.read_text(encoding="utf-8"))
    runes = data["pages"][32]["indices"]
    assert len(runes) == 121
    primes = data["prime"]
    matrix = [[primes[x] for x in runes[r*11:(r+1)*11]] for r in range(11)]
    assert matrix[0] == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert [row[0] for row in matrix] == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    xedges = cumul(matrix[0])
    yedges = cumul([row[0] for row in matrix])
    assert (xedges[-1], yedges[-1]) == (563, 569)
    im = Image.open(IMAGE).convert("L")
    assert im.size == (563, 569)
    px = im.load()
    tiles = {}
    for row in range(11):
        for col in range(11):
            x0, x1 = xedges[col], xedges[col + 1]
            y0, y1 = yedges[row], yedges[row + 1]
            area = (x1-x0)*(y1-y0)
            bright = sum(px[x, y] >= THRESHOLD
                         for y in range(y0, y1) for x in range(x0, x1))
            tiles[row, col] = {
                "row": row, "column": col,
                "rectangle_xyxy": [x0, y0, x1, y1],
                "source_prime": matrix[row][col],
                "source_gp": data["translit"][runes[row*11+col]],
                "area_px": area, "bright_px": bright,
                "bright_fraction": bright/area,
            }

    def path(row, col):
        cells = [tiles[row+i, col+i] for i in range(LENGTH)]
        area = sum(cell["area_px"] for cell in cells)
        bright = sum(cell["bright_px"] for cell in cells)
        return {
            "start": [row, col],
            "cells": cells,
            "aggregate_bright_fraction": bright/area,
            "mean_tile_bright_fraction": sum(c["bright_fraction"] for c in cells)/LENGTH,
            "empty_tile_count": sum(c["bright_px"] == 0 for c in cells),
            "total_bright_px": bright,
            "total_area_px": area,
        }

    chosen = path(*PATH_START)
    assert [c["rectangle_xyxy"] for c in chosen["cells"]] == [
        [0,101,73,124], [73,124,78,203], [78,203,179,262],
        [179,262,198,315], [198,315,299,394], [299,394,302,453],
    ]
    all_paths = [path(r,c) for r in range(6) for c in range(6)]
    def lowrank(key):
        return {
            "number_of_36_with_value_le_original": sum(
                p[key] <= chosen[key] for p in all_paths),
            "empirical_lower_tail": sum(
                p[key] <= chosen[key] for p in all_paths)/len(all_paths),
            "min": min(p[key] for p in all_paths),
            "median": sorted(p[key] for p in all_paths)[len(all_paths)//2],
            "max": max(p[key] for p in all_paths),
        }
    print(json.dumps({
        "status": "source-frozen visual route; no decipherment claim",
        "source": str(IMAGE.relative_to(ROOT)),
        "image_dimensions": list(im.size),
        "threshold": THRESHOLD,
        "comparison": "every 6-tile southeast diagonal, starts row/column 0..5",
        "chosen": chosen,
        "controls": {
            "all_36_bright_area_rank": lowrank("aggregate_bright_fraction"),
            "all_36_equal_tile_rank": lowrank("mean_tile_bright_fraction"),
            "all_36_empty_tile_count": {
                "chosen": chosen["empty_tile_count"],
                "number_with_at_least_chosen": sum(
                    p["empty_tile_count"] >= chosen["empty_tile_count"]
                    for p in all_paths),
            },
            "best_5_by_aggregate": [
                {"start": p["start"],
                 "fraction": p["aggregate_bright_fraction"]}
                for p in sorted(all_paths, key=lambda p: p["aggregate_bright_fraction"])[:5]
            ],
        },
        "caveat": "The HOME and BUDS endpoints are substrings of longer canonical p32 words; no authenticated path selector or decode rule follows.",
    }, indent=2))


if __name__ == "__main__":
    main()
