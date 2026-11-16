#!/usr/bin/env python3
"""Source-coordinate SFT for the oversized red GP initials in LP1.

Run from the repository root:
  python sims/lp1_red_initial_dropcap_sft.py resources/liber-primus

The script also accepts the supplied liber-primus-jpegs.zip as its first
argument. It verifies physical red-component coordinates and that each
human-adjudicated rune/context occurs in the matching canonical LP1 page.
It is not OCR and does not infer a cipher or a separate red-only stream.
"""
from __future__ import annotations

import argparse
import io
import json
import zipfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# scan index, LP1 rune-page index, expected (x, y, width, height), rune,
# exact source-text context containing that rune at the word/paragraph start.
EXPECTED = [
    (1, 0, (602, 672, 164, 550), "ᚱ", "ᚱᛝᚱᚪᛗ"),
    (3, 1, (601, 673, 230, 492), "ᚢ", "ᚢᛠᛝᛋᛇᚠᚳ"),
    (4, 2, (601, 2044, 149, 492), "ᛒ", "ᛒᛗᚱᚦᚠᛈ"),
    (6, 4, (600, 670, 150, 495), "ᚹ", "ᚹ-ᚣᛠᚹᛟ"),
    (10, 8, (601, 667, 148, 497), "ᚦ", "ᚦᛖ-ᛚᚩᛋᛋ"),
    (13, 11, (602, 1488, 148, 498), "ᛋ", "ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ"),
    (13, 11, (600, 2489, 148, 495), "ᚪ", "ᚪᚾ-ᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ"),
    (14, 12, (601, 669, 148, 497), "ᚪ", "ᚪ-ᛋᚹᚪᛁ"),
    (16, 14, (601, 670, 148, 495), "ᚪ", "ᚪᚾ-ᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ"),
]
TOLERANCE = 2


def load_jpeg(source: Path, scan: int) -> Image.Image:
    if source.is_dir():
        return Image.open(source / f"{scan:02d}.jpg").convert("RGB")
    with zipfile.ZipFile(source) as archive:
        member = f"liber-primus-jpegs/{scan:02d}.jpg"
        return Image.open(io.BytesIO(archive.read(member))).convert("RGB")


def canonical_pages(path: Path) -> list[str]:
    raw = path.read_text(encoding="utf-8")
    pages = [part.replace("§", "").strip() for part in raw.split("%")]
    return [page for page in pages if page]


def large_red_components(image: Image.Image) -> list[tuple[int, int, int, int]]:
    a = np.asarray(image.convert("RGB"))
    r, g, b = (a[:, :, i].astype(np.int16) for i in range(3))
    mask = (
        (r > 140) & (g < 120) & (b < 120)
        & ((r - g) > 60) & ((r - b) > 60)
    ).astype(np.uint8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    boxes = []
    for i in range(1, count):
        x, y, w, h, area = map(int, stats[i])
        if w >= 100 and h >= 400 and area >= 20_000:
            boxes.append((x, y, w, h))
    return boxes


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "image_source",
        type=Path,
        help="resources/liber-primus directory, extracted image directory, or original ZIP",
    )
    parser.add_argument(
        "--transcription",
        type=Path,
        default=Path("resources/transcriptions/lp1_wulfic_canonical.txt"),
    )
    args = parser.parse_args()

    pages = canonical_pages(args.transcription)
    assert len(pages) == 15, f"expected 15 nonempty LP1 rune pages, got {len(pages)}"

    by_scan: dict[int, list[tuple[int, tuple[int, int, int, int], str, str]]] = {}
    for scan, page, box, rune, context in EXPECTED:
        by_scan.setdefault(scan, []).append((page, box, rune, context))

    results = []
    for scan, items in sorted(by_scan.items()):
        components = large_red_components(load_jpeg(args.image_source, scan))
        unused = list(components)
        for page, expected_box, rune, context in items:
            matches = [
                box for box in unused
                if all(abs(box[j] - expected_box[j]) <= TOLERANCE for j in range(4))
            ]
            assert len(matches) == 1, (
                f"scan {scan}: expected one large red component near {expected_box}, "
                f"got {matches}; all={components}"
            )
            actual = matches[0]
            unused.remove(actual)
            flat_page = pages[page].replace("\n", "")
            assert context in flat_page, (
                f"canonical page {page} lacks source context {context!r}"
            )
            results.append({
                "scan": scan,
                "lp1_page": page,
                "bbox_xywh": actual,
                "initial_rune": rune,
                "canonical_context": context,
            })
        assert not unused, (
            f"scan {scan}: unexpected additional oversized red components {unused}"
        )

    assert len(results) == 9
    print(json.dumps({
        "verified_oversized_red_initials": len(results),
        "scans": sorted(by_scan),
        "interpretation": (
            "each large red form is a GP rune already present at a canonical "
            "word/paragraph start; no arrow or extra rune is added"
        ),
        "results": results,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
