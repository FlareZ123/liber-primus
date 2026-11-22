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
        if not 25 <= w <= 120 or not 25 <= h <= 120:
            continue
        if not 0.70 <= w / h <= 1.30 or not 0.58 <= area / (w * h) <= 0.88:
            continue
        found.append({"x": x, "y": y, "w": w, "h": h, "area": area,
                      "fill": round(area / (w * h), 5)})
    return sorted(found, key=lambda p: (p["y"], p["x"]))


def run(archive: str | None) -> dict:
    records = {}
    sources = {}
    with zipfile.ZipFile(archive) if archive else _NullReader() as source:
        for number in range(17, 75):
            name = f"{number:02}.jpg"
            data = (source.read(f"liber-primus-jpegs/{name}") if archive
                    else (ROOT / "resources/liber-primus" / name).read_bytes())
            if number in (50, 56):
                sources[number] = data
                if number == 56:
                    assert hashlib.sha256(data).hexdigest() == P39_SHA256
            hits = components(data)
            if hits:
                records[name] = hits
    assert list(records) == ["24.jpg", "40.jpg", "50.jpg", "56.jpg", "73.jpg"], records
    assert {name:len(dots) for name,dots in records.items()} == {
        "24.jpg":5, "40.jpg":5, "50.jpg":3, "56.jpg":3, "73.jpg":5
    }
    assert [(d["x"], d["y"], d["w"], d["h"]) for d in records["50.jpg"]] == [
        (732,1710,70,69), (1149,1710,70,69), (1628,1710,69,69)
    ]
    assert [d["area"] for d in records["50.jpg"]] == [3559,3542,3533]
    assert [(d["x"], d["y"], d["w"], d["h"]) for d in records["56.jpg"]] == [
        (1282,1677,32,33), (1478,1677,32,33), (1702,1677,33,33)
    ]
    assert [d["area"] for d in records["56.jpg"]] == [784,784,817]
    thresholds = {}
    for number, limits in [(50,(700,1740,1695,1735)), (56,(1250,1740,1660,1700))]:
        xmin,xmax,ymin,ymax = limits
        thresholds[f"{number:02}.jpg"] = {}
        for threshold in [100, 150, 200]:
            selected = [d for d in components(sources[number], threshold)
                        if xmin <= d["x"] <= xmax and ymin <= d["y"] <= ymax]
            assert len(selected) == 3
            assert [d["x"] for d in selected] == (
                [732,1149,1628] if number==50 else [1282,1478,1702])
            thresholds[f"{number:02}.jpg"][threshold] = [d["area"] for d in selected]
    return {
        "status": "PASS",
        "original_p39_sha256": P39_SHA256,
        "images": 58,
        "solid_black_circle_hits": records,
        "three_dot_seams": ["physical p33/50.jpg","physical p39/56.jpg"],
        "five_dot_motifs": ["physical p7/24.jpg","physical p23/40.jpg",
                             "solved physical p56/73.jpg"],
        "threshold_100_150_200_area_controls": thresholds,
        "interpretation": "two distinct three-dot section-seam ellipses; no source-selected cipher action",
        "scope": "disconnected near-solid black circular components 25–120px only"
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
