#!/usr/bin/env python3
"""Original-JPEG glyph census for seven additional GP29 rune classes.

Usage: python sims/lp2_seven_additional_allograph_sft.py
       python sims/lp2_seven_additional_allograph_sft.py --archive /path/to/liber-primus-jpegs.zip

The compact A+count source contract below is independently checked against
resources/liber-primus/lp2-corpus.json on normal repository execution.
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
# Crops are exact solved-p56 original-JPEG glyphs, scan 73.jpg, y=[861,975).
TEMPLATES = {
    "U": (1095, 1148), "G": (1152, 1196), "N": (1368, 1402),
    "Y": (1407, 1460), "F": (1584, 1618), "J": (1464, 1510),
    "IA": (1622, 1674),
}
INDEX = {"U": 1, "G": 6, "N": 9, "Y": 26, "F": 0, "J": 11, "IA": 27}
# Each 58-character line encodes original physical-page counts as ord(ch)-65.
COUNTS = {
    "U": "HGIDKKGFLGMQKKENIHKFLGEKOKKIGIJFGILJMHLJKFLHGLIJKCACGLIDDG",
    "G": "MLGHQHJEFNIENKFENJHJLMGJEOKHHKJHDHKKGHHNIGFHIHGJEDACLHLDDB",
    "N": "MIIKHFFKPIMLMFGGGNGKBJGGKMLKLHEGDGLEMHINJHPNGLJILCADJHEAEJ",
    "Y": "NKCIGSHDJPIEIKHFHKHFIKDIKJKJHHMICHGKOJIHINIIOJJKICADNGLADB",
    "F": "ONHHHIDBILHOMMCHKMKMHIGHMJJLMIIJEJGEIGDEKLORMIJJOCAEKFDDFD",
    "J": "IIIGJNIHIJFFGJCCMKHQLKIGFIIFPOCMDKIJJIHEHMMLONJHKDAFHKJBDA",
    "IA": "HJHJJHJMFPIKKLJIOJKHLMGKLFJGJJKKHKDMFGKIGFNLLHJMNEADHFICDA",
}
# Oversized, source-red initials are intentionally outside ordinary 114px templates.
EXCEPTIONS = {("U", 23): 0, ("IA", 39): 119, ("F", 40): 0}
RED_BOXES = {
    ("U", 23): (601, 1156, 831, 1653),
    ("IA", 39): (601, 1852, 832, 2350),
    ("F", 40): (601, 667, 751, 1165),
}
BOUNDS = (540, 3250, 440, 2100)
THRESHOLD = 160
MIN_NCC = 0.90

def unique_hits(score: np.ndarray) -> tuple[list[tuple[int, int, float]], int]:
    maxima = (score == cv2.dilate(score, np.ones((105, 36), np.uint8))) & (score >= MIN_NCC)
    ys, xs = np.where(maxima)
    raw = sorted((int(x + 440), int(y + 540), float(score[y, x])) for y, x in zip(ys, xs))
    out = []
    for hit in raw:
        if any(abs(hit[0] - prior[0]) <= 2 and abs(hit[1] - prior[1]) <= 2 for prior in out):
            continue
        out.append(hit)
    return out, len(raw) - len(out)

def source_red_iou(image: np.ndarray, box: tuple[int, int, int, int], template: np.ndarray) -> float:
    x1, y1, x2, y2 = box
    c = image[y1:y2, x1:x2].astype(np.int16)
    red = (c[:, :, 0] > 105) & (c[:, :, 0] - c[:, :, 1] > 70) & (c[:, :, 0] - c[:, :, 2] > 70)
    shrunk = cv2.resize(red.astype(np.uint8), (template.shape[1], template.shape[0]), interpolation=cv2.INTER_NEAREST) > 0
    target = template > 0
    best = 0.0
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            shifted = np.roll(shrunk, (dy, dx), axis=(0, 1))
            union = np.logical_or(shifted, target).sum()
            best = max(best, float(np.logical_and(shifted, target).sum() / union))
    return best

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--archive", type=Path)
    ap.add_argument("--corpus", type=Path, default=SOURCE / "lp2-corpus.json")
    args = ap.parse_args()
    for key, counts in COUNTS.items():
        assert len(counts) == 58, key
    if args.corpus.exists():
        corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
        assert len(corpus["pages"]) == 58
        for name, idx in INDEX.items():
            assert corpus["translit"][idx] == name
            for page in range(58):
                original = sum(v == idx for v in corpus["pages"][page]["indices"])
                assert original == ord(COUNTS[name][page]) - 65, (name, page)
        for (name, page), offset in EXCEPTIONS.items():
            assert corpus["pages"][page]["indices"][offset] == INDEX[name]
    archive = ZipFile(args.archive) if args.archive else None
    def load(page: int) -> np.ndarray:
        if archive is not None:
            raw = archive.read(f"liber-primus-jpegs/{page + 17:02}.jpg")
            return np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))
        return np.asarray(Image.open(SOURCE / f"{page + 17:02}.jpg").convert("RGB"))
    try:
        solved_gray = cv2.cvtColor(load(56), cv2.COLOR_RGB2GRAY)
        templates = {name: (solved_gray[861:975, x1:x2] < THRESHOLD).astype(np.uint8) * 255
                     for name, (x1, x2) in TEMPLATES.items()}
        counts = {name: 0 for name in TEMPLATES}
        min_scores = {name: 1.0 for name in TEMPLATES}
        red_ious = {}
        plateau_ties = 0
        for page in range(58):
            image = load(page)
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            y1, y2, x1, x2 = BOUNDS
            field = (gray[y1:y2, x1:x2] < THRESHOLD).astype(np.uint8) * 255
            for name, template in templates.items():
                match = cv2.matchTemplate(field, template, cv2.TM_CCOEFF_NORMED)
                hits, dedup = unique_hits(match)
                plateau_ties += dedup
                expected = ord(COUNTS[name][page]) - 65 - int((name, page) in EXCEPTIONS)
                assert len(hits) == expected, (name, page, expected, len(hits), hits)
                counts[name] += len(hits)
                if hits:
                    min_scores[name] = min(min_scores[name], min(hit[2] for hit in hits))
                if (name, page) in RED_BOXES:
                    similarity = source_red_iou(image, RED_BOXES[(name, page)], template)
                    assert similarity > 0.90, (name, page, similarity)
                    red_ious[f"{name}@p{page}"] = similarity
        expected_total = sum(sum(ord(ch) - 65 for ch in value) for value in COUNTS.values())
        assert expected_total == 3204
        assert sum(counts.values()) == expected_total - len(EXCEPTIONS) == 3201
        assert plateau_ties == 1, plateau_ties
        print(json.dumps({
            "source": "58 original archive scans 17.jpg..74.jpg",
            "ordinary_glyphs": counts,
            "matched": sum(counts.values()),
            "source_total": expected_total,
            "oversized_red_initials": red_ious,
            "deduplicated_adjacent_maxima": plateau_ties,
            "min_ncc": min_scores,
            "result": "seven additional ordinary glyph classes accounted for; no unresolved allograph candidate"
        }, indent=2))
    finally:
        if archive is not None:
            archive.close()

if __name__ == "__main__":
    main()
