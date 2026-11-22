#!/usr/bin/env python3
"""Original-JPEG fixed-template census for six previously unchecked GP29 glyphs.

Run: python sims/lp2_six_more_allograph_sft.py
ZIP: python sims/lp2_six_more_allograph_sft.py --archive /path/to/liber-primus-jpegs.zip
A bounded sample can be tested with --start 0 --stop 8.
"""
from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
# Fixed original-image pixel crops from solved physical p56, scan 73.jpg.
# B stops at x1361, before a neighboring punctuation square.
TEMPLATES = {
    "EO": (826, 1050, 866, 1164),
    "X": (1700, 673, 1764, 787),
    "S": (886, 673, 921, 787),
    "B": (1328, 2077, 1361, 2191),
    "OE": (836, 673, 881, 787),
    "EA": (891, 2077, 978, 2191),
}
INDEX = {"EO": 12, "X": 14, "S": 15, "B": 17, "OE": 22, "EA": 28}
# Each 58-character string encodes the physical-page source count as ord(ch)-65.
COUNTS = {
    "EO": "JDFJKPGJHHHMIIDDEKKHLEDFEGGEIJMKDIJLGDFHFKJLHJJKKBADIKGFBA",
    "X": "MMEGQKJINIQMLKIJKIIGMHDEKKIDHGMMFGNJMJFDKJLHJIOFDBABKEKECA",
    "S": "IMDJHGIEJLLGGJJDJFGKMJCHNNKHIJIIFILJFJHMJLHKJJGPFBAEJFFGDF",
    "B": "JEKIJDGFIGJKJKDHLIJHJFHHJKLMMKINIHHFGIGOILKLJILLKCAFJEGFBB",
    "OE": "IODFKLHHLKRJJFGFNLOJKLCHLJIGKNOGEGHQOFJJLMEQPNHFPDAELFJBBA",
    "EA": "GMKNMJFLJJIIOKGFKHOLIJFIJKOKODOGDGKIEHKHJJIHGIHLHCACPEIDCA",
}
# Source-red enlarged first initials are outside normal 114px glyph crops.
EXCEPTIONS = {("S", 0): 0, ("X", 8): 0}
IMAGE_BOUNDS = (540, 3250, 440, 2100)
THRESHOLD = 160
MIN_NCC = .90
NMS = np.ones((105, 36), dtype=np.uint8)

def matched_positions(field: np.ndarray, template: np.ndarray) -> list[tuple[int, int, float]]:
    score = cv2.matchTemplate(field, template, cv2.TM_CCOEFF_NORMED)
    maximum = (score == cv2.dilate(score, NMS)) & (score >= MIN_NCC)
    ys, xs = np.where(maximum)
    hits = sorted((int(x + 440), int(y + 540), float(score[y, x])) for y, x in zip(ys, xs))
    deduped: list[tuple[int, int, float]] = []
    for hit in hits:
        if any(abs(hit[0] - p[0]) <= 2 and abs(hit[1] - p[1]) <= 2 for p in deduped):
            continue
        deduped.append(hit)
    return deduped

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--archive", type=Path)
    ap.add_argument("--corpus", type=Path, default=SOURCE / "lp2-corpus.json")
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--stop", type=int, default=58)
    args = ap.parse_args()
    assert 0 <= args.start < args.stop <= 58
    assert all(len(s) == 58 for s in COUNTS.values())
    if args.corpus.exists():
        corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
        assert len(corpus["pages"]) == 58
        for name, rune in INDEX.items():
            assert corpus["translit"][rune] == name
            for page in range(58):
                expected = sum(index == rune for index in corpus["pages"][page]["indices"])
                assert expected == ord(COUNTS[name][page]) - 65, (name, page, expected)
        for (name, page), offset in EXCEPTIONS.items():
            assert corpus["pages"][page]["indices"][offset] == INDEX[name]

    archive = ZipFile(args.archive) if args.archive else None
    def read(page: int) -> np.ndarray:
        if archive:
            data = archive.read(f"liber-primus-jpegs/{page + 17:02}.jpg")
            image = Image.open(io.BytesIO(data))
        else:
            image = Image.open(SOURCE / f"{page + 17:02}.jpg")
        return np.asarray(image.convert("L"))
    try:
        solved = read(56)
        templates = {
            name: (solved[y1:y2, x1:x2] < THRESHOLD).astype(np.uint8) * 255
            for name, (x1, y1, x2, y2) in TEMPLATES.items()
        }
        matched = {name: 0 for name in TEMPLATES}
        min_ncc = {name: 1. for name in TEMPLATES}
        for page in range(args.start, args.stop):
            image = read(page)
            y1, y2, x1, x2 = IMAGE_BOUNDS
            field = (image[y1:y2, x1:x2] < THRESHOLD).astype(np.uint8) * 255
            for name, template in templates.items():
                hits = matched_positions(field, template)
                expected = ord(COUNTS[name][page]) - 65 - int((name, page) in EXCEPTIONS)
                assert len(hits) == expected, (name, page, expected, hits)
                matched[name] += len(hits)
                if hits:
                    min_ncc[name] = min(min_ncc[name], min(score for _, _, score in hits))
        if args.start == 0 and args.stop == 58:
            assert matched == {"EO": 400, "X": 459, "S": 441,
                               "B": 447, "OE": 493, "EA": 462}
        print(json.dumps({
            "original_scans": "17.jpg–74.jpg",
            "checked_pages": [args.start, args.stop],
            "matched_ordinary": matched,
            "min_ncc": min_ncc,
            "enlarged_red_initials": [{"rune": "S", "page": 0, "offset": 0},
                                    {"rune": "X", "page": 8, "offset": 0}],
            "decision": "exact per-page source-class counts for six ordinary glyph classes",
        }, indent=2))
    finally:
        if archive:
            archive.close()

if __name__ == "__main__":
    main()
