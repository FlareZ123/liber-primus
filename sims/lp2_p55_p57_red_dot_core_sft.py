#!/usr/bin/env python3
"""Reproduce red-dot occupancy on original LP2 scans 72.jpg and 74.jpg."""
from pathlib import Path
import json
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"

def clusters(values, tolerance=5):
    groups = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > tolerance:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [sum(group) / len(group) for group in groups]

def extract(filename, roi):
    x0, y0, x1, y1 = roi
    image = cv2.imread(str(IMAGE_DIR / filename), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(IMAGE_DIR / filename)
    blue, green, red = cv2.split(image)
    mask = ((red > 100) & (red > green * 1.35) & (red > blue * 1.25) &
            ((red.astype(np.int16) - green.astype(np.int16)) > 40))
    region = mask[y0:y1, x0:x1].astype(np.uint8) * 255
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(region, 8)
    points = []
    for i in range(1, count):
        x, y, width, height, area = stats[i]
        if 40 <= area <= 200:
            points.append((x0+x+width/2, y0+y+height/2))
    xs = clusters([p[0] for p in points])
    ys = clusters([p[1] for p in points])
    grid = [["." for _ in xs] for _ in ys]
    for x, y in points:
        col = min(range(len(xs)), key=lambda i: abs(xs[i]-x))
        row = min(range(len(ys)), key=lambda i: abs(ys[i]-y))
        if grid[row][col] == "#":
            raise AssertionError("duplicate component in lattice cell")
        grid[row][col] = "#"
    return {"count":len(points),"columns":len(xs),"rows":len(ys),
            "pattern":["".join(row) for row in grid]}

p55 = extract("72.jpg", (1000,1200,1100,1400))
p57_title = extract("74.jpg", (1125,900,1200,1050))
p57_terminal = extract("74.jpg", (1600,1700,1750,1850))
pattern13 = [".#.","#.#",".#.","#.#",".#.","#.#",".#.","#.#",".#."]
pattern23 = [".###.","#...#",".###.","#...#",".###.","#...#",".###.","#...#",".###."]
assert p55["count"] == 13 and p55["pattern"] == pattern13
assert p57_title["count"] == 13 and p57_title["pattern"] == pattern13
assert p57_terminal["count"] == 23 and p57_terminal["pattern"] == pattern23
assert ["".join(row[i] for i in (0,2,4)) for row in p57_terminal["pattern"]] == pattern13
assert sum(row[2] == "#" for row in p57_terminal["pattern"]) == 5
print(json.dumps({"p55_terminal_13":p55,"p57_after_title_13":p57_title,
  "p57_terminal_23":p57_terminal,"columns_1_3_5_reproduce_13_dot_pattern":True,
  "central_spine_dots":5},indent=2))
