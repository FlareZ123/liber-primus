"""Original-image three-bar-cross half-turn gate (LP2 pp0–3).

Run: python sims/lp2_p0_cross_halfturn_sft.py
Requires Pillow and numpy; read-only, uses the original JPEGs and corpus.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "resources" / "liber-primus"
LEFT = (57, 1697, 548, 2953)
RIGHT = (1852, 647, 2343, 1903)


def mask(scan, bounds):
    with Image.open(SOURCES / f"{scan:02d}.jpg") as image:
        assert image.size == (2400, 3600)
        return np.asarray(image.convert("L").crop(bounds)) < 90


def iou(a, b):
    assert a.shape == b.shape
    return np.count_nonzero(a & b) / np.count_nonzero(a | b)


def ic(sequence):
    counts = [sequence.count(k) for k in range(29)]
    n = len(sequence)
    return sum(v * (v - 1) for v in counts) / (n * (n - 1))


def main():
    left = {scan: mask(scan, LEFT) for scan in (17, 18, 19, 20)}
    right = {scan: mask(scan, RIGHT) for scan in (17, 18, 19, 20)}
    assert all(a.shape == (1256, 491) for a in left.values())
    assert np.array_equal(left[18], left[19])
    assert np.array_equal(right[18], right[19])

    print("scan,halfturn IoU,left black pixels,right black pixels")
    for scan in (17, 18, 19, 20):
        score = iou(np.flip(left[scan], axis=(0, 1)), right[scan])
        print(scan, f"{score:.9f}", np.count_nonzero(left[scan]), np.count_nonzero(right[scan]))
        assert score > 0.98 if scan in (17, 18, 19) else score < 0.08

    source = json.loads((SOURCES / "lp2-corpus.json").read_text(encoding="utf-8"))
    pages = {p["page"]: p["indices"] for p in source["pages"] if p.get("indices")}
    assert [len(pages[k]) for k in (0, 1, 2, 56, 57)] == [262, 266, 201, 85, 95]
    black = pages[0][13:] + pages[1] + pages[2]
    assert len(black) == 716
    assert 0.033 < ic(black) < 0.036
    assert ic(pages[57]) > 0.06

    reversed_pages = pages[0][13:][::-1] + pages[1][::-1] + pages[2][::-1]
    assert ic(reversed_pages) == ic(black)
    assert reversed_pages[::-1] != black
    assert [p[::-1][::-1] for p in (pages[0][13:], pages[1], pages[2])] == [
        pages[0][13:], pages[1], pages[2]
    ]
    print("black p0–2:", len(black), "IoC", f"{ic(black):.12f}")
    print("clear p57:", len(pages[57]), "IoC", f"{ic(pages[57]):.12f}")
    print("No original mark-selected rune column, rotation alphabet or key is specified.")


if __name__ == "__main__":
    main()
