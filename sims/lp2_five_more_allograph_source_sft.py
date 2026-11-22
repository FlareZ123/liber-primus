#!/usr/bin/env python3
"""Original-JPEG fixed-template census of five more GP29 glyph classes.

Run: python sims/lp2_five_more_allograph_source_sft.py
ZIP: python sims/lp2_five_more_allograph_source_sft.py --archive /path/to/liber-primus-jpegs.zip
A bounded sample can be tested with --start 0 --stop 8. Ordinary T/L source x-ink edges are checked against solved p56.
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
    "O": (770, 861, 804, 975),
    "H": (1200, 673, 1244, 787),
    "P": (846, 861, 899, 975),
    "T": (1736, 861, 1785, 975),
    "L": (1255, 861, 1288, 975),
}
INDEX = {"O": 3, "H": 8, "P": 13, "T": 16, "L": 20}
COUNTS = {
    "O": "GJFGEIGGNIJIGNEFLHLPFREIKMKKJIMIEHIHLGGEMNIQGOKMMAABKHLAED",
    "H": "KHNLEJHHHIJHJGGHEIGKGHEGLGKFHKINFGMHGJPGFIKKNIEJIBABJFHCBB",
    "P": "JLHGMLFKNLIFJEFHLJKJIRBGKIKKLHIMCEMGJGELHLKGHFLJMCAFKFJCCB",
    "T": "IGJJGIJFIGHKQLDFJNJIGHDHKJMKGHIKFIINGIIKLJIKMMLHJDACIGIABF",
    "L": "HOJKMIJLOGILHMFJHGIIOIEEIPHJGOKJEFJPHEIKNKKGKKJIJCAFHDGBDD",
}
# Source-red initials whose morphology is outside ordinary typeface.
EXCEPTIONS = {("P", 3): 119, ("P", 57): 0, ("L", 3): 0, ("L", 15): 9}
IMAGE_BOUNDS = (540, 3250, 440, 2100)
THRESHOLD = 160
MIN_NCC = {"O": .90, "H": .899, "P": .90, "T": .90, "L": .90}
NMS = np.ones((105, 36), dtype=np.uint8)

def matched_positions(field: np.ndarray, template: np.ndarray, cutoff: float) -> list[tuple[int, int, float]]:
    score = cv2.matchTemplate(field, template, cv2.TM_CCOEFF_NORMED)
    maximum = (score == cv2.dilate(score, NMS)) & (score >= cutoff)
    ys, xs = np.where(maximum)
    hits = sorted((int(x + 440), int(y + 540), float(score[y, x])) for y, x in zip(ys, xs))
    deduped: list[tuple[int, int, float]] = []
    for hit in hits:
        if any(abs(hit[0] - p[0]) <= 2 and abs(hit[1] - p[1]) <= 2 for p in deduped):
            continue
        deduped.append(hit)
    return deduped

def full_glyph_anchor(gray: np.ndarray, template: np.ndarray, hit: tuple[int, int, float]) -> bool:
    """Require both original horizontal component boundaries, within two pixels."""
    x, y, _ = hit
    ink_columns = np.where(template > 0)[1]
    tight_left, tight_right = int(ink_columns.min()), int(ink_columns.max())
    cut = gray[y:y + template.shape[0], x - 30:x + template.shape[1] + 30]
    occupied = np.count_nonzero(cut < 110, axis=0) >= 2
    left = tight_left + 30
    while left > 0 and occupied[left - 1]:
        left -= 1
    right = tight_right + 30
    while right + 1 < len(occupied) and occupied[right + 1]:
        right += 1
    return abs(left - tight_left - 30) <= 2 and abs(right - tight_right - 30) <= 2

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
        rejected = {name: 0 for name in TEMPLATES}
        solved_control = {}
        for page in range(args.start, args.stop):
            image = read(page)
            y1, y2, x1, x2 = IMAGE_BOUNDS
            field = (image[y1:y2, x1:x2] < THRESHOLD).astype(np.uint8) * 255
            for name, template in templates.items():
                raw_hits = matched_positions(field, template, MIN_NCC[name])
                hits = ([hit for hit in raw_hits if full_glyph_anchor(image, template, hit)]
                        if name in ("T", "L") else raw_hits)
                rejected[name] += len(raw_hits) - len(hits)
                if page == 56 and name in ("T", "L"):
                    solved_control[name] = [(x, y) for x, y, _ in hits]
                expected = ord(COUNTS[name][page]) - 65 - int((name, page) in EXCEPTIONS)
                assert len(hits) == expected, (name, page, expected, hits)
                matched[name] += len(hits)
                if hits:
                    min_ncc[name] = min(min_ncc[name], min(score for _, _, score in hits))
        if args.start == 0 and args.stop == 58:
            assert matched == {"O": 465, "H": 416, "P": 446, "T": 448, "L": 464}
            assert solved_control["T"] == [(1736, 861)]
            assert solved_control["L"] == [(1125, 673), (1255, 861), (1593, 674)]
        print(json.dumps({
            "original_scans": "17.jpg–74.jpg",
            "checked_pages": [args.start, args.stop],
            "matched_ordinary": matched,
            "min_ncc": min_ncc,
            "source_red_initials_excluded": [{"rune": name, "page": p, "offset": off}
                                             for (name, p), off in EXCEPTIONS.items()],
            "raw_partial_matches_rejected": rejected,
            "solved_p56_position_controls": solved_control,
            "decision": "exact full-source ordinary O/H/P/T/L census, no source-supplied font key",
        }, indent=2))
    finally:
        if archive:
            archive.close()

if __name__ == "__main__":
    main()
