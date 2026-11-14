"""Original 58-scan source-pixel gate for p39's three black punctuation dots.

Run from repository root:
  python sims/lp2_p39_three_dot_original_inventory_sft.py
Or against the identical original archive:
  python sims/lp2_p39_three_dot_original_inventory_sft.py --archive FILE
Uses numpy and opencv-python. Read-only: no generated images, no OCR.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import zipfile
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
P39_SHA256 = "d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00"


def components(data: bytes, threshold: int = 150) -> list[dict[str, int | float]]:
    image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert image is not None and image.shape == (3600, 2400, 3)
    black = np.all(image < threshold, axis=2).astype(np.uint8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(black, connectivity=8)
    found = []
    for i in range(1, count):
        x, y, w, h, area = [int(q) for q in stats[i]]
        if not 25 <= w <= 55 or not 25 <= h <= 55:
            continue
        if not 0.82 <= w / h <= 1.20 or not 0.60 <= area / (w * h) <= 0.85:
            continue
        found.append({"x": x, "y": y, "w": w, "h": h, "area": area,
                      "fill": round(area / (w * h), 5)})
    return sorted(found, key=lambda p: (p["y"], p["x"]))


def run(archive: str | None) -> dict:
    records = {}
    p39 = b""
    with zipfile.ZipFile(archive) if archive else _NullReader() as source:
        for number in range(17, 75):
            name = f"{number:02}.jpg"
            data = (source.read(f"liber-primus-jpegs/{name}") if archive
                    else (ROOT / "resources/liber-primus" / name).read_bytes())
            if number == 56:
                p39 = data
                assert hashlib.sha256(data).hexdigest() == P39_SHA256
            hits = components(data)
            if hits:
                records[name] = hits
    assert list(records) == ["56.jpg"], records
    dots = records["56.jpg"]
    assert [(d["x"], d["y"], d["w"], d["h"]) for d in dots] == [
        (1282, 1677, 32, 33), (1478, 1677, 32, 33), (1702, 1677, 33, 33)
    ]
    assert [d["area"] for d in dots] == [784, 784, 817]
    thresholds = {}
    for threshold in [100, 150, 200]:
        selected = [d for d in components(p39, threshold)
                    if 1250 <= d["x"] <= 1740 and 1660 <= d["y"] <= 1700]
        assert len(selected) == 3
        assert [d["x"] for d in selected] == [1282, 1478, 1702]
        thresholds[threshold] = [d["area"] for d in selected]
    return {
        "status": "PASS",
        "original_p39_sha256": P39_SHA256,
        "images": 58,
        "strict_solid_black_circle_hits": records,
        "threshold_100_150_200_area_controls": thresholds,
        "interpretation": "p39 upper-line ellipsis, no source-selected cipher action",
        "scope": "detached near-solid black circles of this size only"
    }


class _NullReader:
    def __enter__(self):
        return self

    def __exit__(self, *_):
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive")
    arguments = parser.parse_args()
    print(json.dumps(run(arguments.archive), indent=2))
