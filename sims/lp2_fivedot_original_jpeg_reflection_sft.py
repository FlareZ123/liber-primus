#!/usr/bin/env python3
"""Exact original LP2 five-dot artwork-reflection check.

Original source JPEGs are the fixed resources/liber-primus/24.jpg (LP2 p7),
40.jpg (LP2 p23), and 73.jpg (LP2 solved p56). Requires Pillow. The
pre-registered coordinate equations are derived from the five dot centers.
No text OCR, cipher training, coordinate fitting or external requests.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
FILES = (24, 40, 73)
images = {}
for number in FILES:
    data = (ROOT / f"{number}.jpg").read_bytes()
    image = Image.open(ROOT / f"{number}.jpg").convert("L")
    assert image.size == (2400, 3600)
    images[number] = image.load()
    print(f"LP2 JPEG {number}.jpg SHA256 {sha256(data).hexdigest()}")

# Fully isolates the five large black disks in p7; no runic glyphs enter it.
# Native 2400x3600 image coordinates, X rightwards and Y downwards.
X = range(740, 1620)
Y = range(2800, 3260)
THRESHOLD = 90
registrations = (
    ("p7->p23 vertical mirror", lambda x, y: (x, 3674-y), 40, 0.995),
    ("p7->p56 horizontal mirror", lambda x, y: (2401-x, y-419), 73, 0.94),
)
for name, coordinate, target, gate in registrations:
    both = source = destination = 0
    for y in Y:
        for x in X:
            xx, yy = coordinate(x, y)
            foreground = images[24][x, y] < THRESHOLD
            mapped = images[target][xx, yy] < THRESHOLD
            source += foreground
            destination += mapped
            both += foreground and mapped
    union = source + destination - both
    iou = both / union
    f1 = 2 * both / (source + destination)
    print(f"{name}: source={source} destination={destination} "
          f"intersection={both} union={union} IoU={iou:.6f} F1={f1:.6f}")
    assert iou > gate, "five-dot stencil image should match pre-registered reflection"
print("PASS: the three instances are reflected/translated copies of one image stencil.")
