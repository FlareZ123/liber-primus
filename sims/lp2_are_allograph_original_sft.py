"""Original LP2 allograph gate for GP A, R and E, with solved-page glyph controls.

Run from the repository with python sims/lp2_are_allograph_original_sft.py.
OpenCV, Pillow and numpy are required. The optional --archive and --corpus
arguments permit reproducing the test from an independently mounted ZIP.
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

# Exact red PARABLE heading, original release scan 74.jpg, after the large P.
# x ranges are hand-selected rune boxes from the source scan, not ciphertext fits.
SOURCE_BOXES = {"A": (890, 923), "R": (928, 962), "E": (1084, 1134)}
SOURCE_Y = (918, 1031)
SOURCE_RUNE = {"A": 24, "R": 4, "E": 18}

# Ink-annotated oversized red drop capitals. The original GP rune is A,
# but a standard-sized A template is not intended to classify these designs.
LARGE_A = {6: 71, 54: 0}
SOURCE_THRESHOLD = 160
MATCH_THRESHOLD = 0.90
ROW_PITCH = 188
IMAGE_BOUNDS = (540, 3250, 440, 2100)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--corpus", type=Path, default=SOURCE / "lp2-corpus.json")
    parser.add_argument("--ink", type=Path, default=SOURCE / "lp2-ink-annotations.json")
    args = parser.parse_args()
    corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
    annotation = json.loads(args.ink.read_text(encoding="utf-8"))
    pages = {p["page"]: p for p in corpus["pages"]}
    ink_pages = {p["page"]: p for p in annotation["pages"]}
    if len(pages) != 58:
        raise AssertionError("Expected the entire 58-page original LP2 release")
    if [corpus["translit"][i] for i in (24, 4, 18)] != ["A", "R", "E"]:
        raise AssertionError("Canonical GP index contract changed")
    for page, position in LARGE_A.items():
        original = pages[page]["indices"]
        if original[position] != SOURCE_RUNE["A"]:
            raise AssertionError("Oversize A source rune differs")
        spans = ink_pages[page]["red_spans"]
        if not any(s["start"] == position and s["runes"].startswith("ᚪ") for s in spans):
            raise AssertionError("Oversize A is absent from source red-ink annotation")

    archive = ZipFile(args.archive) if args.archive else None

    def load(page: int) -> np.ndarray:
        scan_name = f"{page+17:02}.jpg"
        if archive:
            encoded = archive.read(f"liber-primus-jpegs/{scan_name}")
            return np.asarray(Image.open(io.BytesIO(encoded)).convert("L"))
        return np.asarray(Image.open(SOURCE / scan_name).convert("L"))

    original_57 = load(57)
    templates = {
        name: (original_57[SOURCE_Y[0]:SOURCE_Y[1], x1:x2] < SOURCE_THRESHOLD).astype(np.uint8) * 255
        for name, (x1, x2) in SOURCE_BOXES.items()
    }
    locator = np.ones((105, 36), dtype=np.uint8)
    checks = []
    all_matches = {"A": 0, "R": 0, "E": 0}
    min_similarity = {"A": 1., "R": 1., "E": 1.}
    exact_bitmap = {"A": 0, "R": 0, "E": 0}

    for page in range(58):
        image = load(page)
        y1, y2, x1, x2 = IMAGE_BOUNDS
        field = (image[y1:y2, x1:x2] < SOURCE_THRESHOLD).astype(np.uint8) * 255
        matches = []
        for name, template in templates.items():
            score = cv2.matchTemplate(field, template, cv2.TM_CCOEFF_NORMED)
            maxima = (score == cv2.dilate(score, locator)) & (score >= MATCH_THRESHOLD)
            ys, xs = np.where(maxima)
            for x, y in zip(xs.tolist(), ys.tolist()):
                similarity = float(score[y, x])
                matches.append((x+x1, y+y1, name, similarity))
                all_matches[name] += 1
                min_similarity[name] = min(min_similarity[name], similarity)
                if similarity > .99999:
                    exact_bitmap[name] += 1

        matches.sort(key=lambda m: (round(m[1]/ROW_PITCH), m[0]))
        got = "".join(m[2] for m in matches)
        original = pages[page]["indices"]
        expected = "".join(
            name for i, rune in enumerate(original)
            for name, index in SOURCE_RUNE.items()
            if rune == index and i != LARGE_A.get(page)
        )
        if got != expected:
            raise AssertionError(f"p{page}: image A/R/E reading {got!r} != source {expected!r}")
        checks.append({"page": page, "matched": len(matches), "oversized_red_A": int(page in LARGE_A)})
        print(f"LP2 p{page:02}: exact chronological A/R/E readout, {len(matches)} ordinary glyphs")

    if all_matches != {"A": 487, "R": 436, "E": 456}:
        raise AssertionError(f"Regression counts changed: {all_matches}")
    if sum(x["oversized_red_A"] for x in checks) != 2:
        raise AssertionError("Oversized red initial count changed")

    print(json.dumps({
        "source": "58 original release JPEGs; LP2 physical page p = scan p+17",
        "templates": "LP2 p57 red PARABLE A/R/E, fixed original-pixel boxes",
        "thresholds": {"pixel_gray_less_than": SOURCE_THRESHOLD, "normalized_correlation_at_least": MATCH_THRESHOLD},
        "ordinary_A": all_matches["A"],
        "ordinary_R": all_matches["R"],
        "ordinary_E": all_matches["E"],
        "large_red_A": LARGE_A,
        "total_source_A_R_E": sum(all_matches.values())+len(LARGE_A),
        "minimum_normalized_correlations": min_similarity,
        "exact_bitmap_matches": exact_bitmap,
        "verified_pages": len(checks),
        "status": "PASS: no separate A/R/E allograph in 1379 regular-size instances",
    }, indent=2))
    if archive:
        archive.close()


if __name__ == "__main__":
    main()
