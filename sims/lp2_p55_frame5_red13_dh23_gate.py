#!/usr/bin/env python3
"""Check whether p55's visible 5+5+13=23 relation is page-specific."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "resources" / "liber-primus"

# Crops around the original red thirteen-dot marks on the three consecutive
# framed pages where the mark is visibly present. Coordinates are source pixels.
CROPS = {
    70: (810, 2250, 875, 2365),  # LP2 p53
    71: (1180, 920, 1245, 1030),  # LP2 p54
    72: (1020, 1240, 1085, 1350),  # LP2 p55
}


def red_mask(path: Path, box: tuple[int, int, int, int]) -> list[list[bool]]:
    image = Image.open(path).convert("RGB").crop(box)
    pixels = image.load()
    width, height = image.size
    return [
        [
            pixels[x, y][0] > 130
            and pixels[x, y][0] - pixels[x, y][1] > 40
            and pixels[x, y][0] - pixels[x, y][2] > 40
            for x in range(width)
        ]
        for y in range(height)
    ]


def component_areas(mask: list[list[bool]]) -> list[int]:
    height = len(mask)
    width = len(mask[0])
    seen: set[tuple[int, int]] = set()
    areas: list[int] = []
    for y in range(height):
        for x in range(width):
            if not mask[y][x] or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            area = 0
            while queue:
                cx, cy = queue.popleft()
                area += 1
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0:
                            continue
                        nx, ny = cx + dx, cy + dy
                        if (
                            0 <= nx < width
                            and 0 <= ny < height
                            and mask[ny][nx]
                            and (nx, ny) not in seen
                        ):
                            seen.add((nx, ny))
                            queue.append((nx, ny))
            areas.append(area)
    return sorted(areas)


summary = {}
for jpg, box in CROPS.items():
    areas = component_areas(red_mask(BASE / f"{jpg:02d}.jpg", box))
    dot_areas = [area for area in areas if 70 <= area <= 120]
    assert len(dot_areas) == 13
    summary[jpg] = {
        "lp2_page": jpg - 17,
        "crop": box,
        "red_dot_components": len(dot_areas),
        "component_areas": dot_areas,
    }

assert [summary[jpg]["lp2_page"] for jpg in sorted(summary)] == [53, 54, 55]

print({
    "status": "PASS: p55 red13 is not unique within the reused five-dot frame family",
    "pages_with_same_visible_conjunction": [53, 54, 55],
    "red13_counts": summary,
    "decision": (
        "The tempting 5+5+13=23 reading cannot independently select p55 or "
        "the signed DH prime 23 because the same reused side-frame plus a "
        "thirteen-dot red mark is present on p53 and p54 as well."
    ),
})
