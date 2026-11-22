#!/usr/bin/env python3
"""Original-JPEG held-out test of the pp0-2 repeated cross / twig-rune reading.

Run from the repository root:
    python sims/lp2_p1_p2_cross_twig_rune_holdout_sft.py
Optional original archive:
    python sims/lp2_p1_p2_cross_twig_rune_holdout_sft.py --archive /path/to/liber-primus-jpegs.zip

This does not re-estimate the p0 3|3 branch count. It tests the already-published
3|3 -> thorn candidate against the two repeated, previously withheld pp1-2
source instances at the only source-fixed page-local position: the first rune.
"""
from __future__ import annotations

import argparse
from hashlib import sha256
import io
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
CORPUS = SOURCE / "lp2-corpus.json"
INK = SOURCE / "lp2-ink-annotations.json"
EXPECTED_SCAN_SHA256 = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}
# Fixed crop coordinates already used in the original p0 cross audit.
CROPS = {
    "lower_left": (52, 1679, 552, 2965),
    "upper_right": (1848, 635, 2348, 1921),
}
THRESHOLD = 145


def load_scan(scan: int, archive: ZipFile | None) -> tuple[Image.Image, str]:
    if archive is None:
        raw = (SOURCE / f"{scan:02}.jpg").read_bytes()
    else:
        raw = archive.read(f"liber-primus-jpegs/{scan:02}.jpg")
    digest = sha256(raw).hexdigest()
    assert digest == EXPECTED_SCAN_SHA256[scan], (scan, digest)
    image = Image.open(io.BytesIO(raw)).convert("L")
    assert image.size == (2400, 3600), (scan, image.size)
    return image, digest


def compare(a: Image.Image, b: Image.Image) -> dict:
    aa = np.asarray(a, dtype=np.uint8)
    bb = np.asarray(b, dtype=np.uint8)
    assert aa.shape == bb.shape == (1286, 500)
    ma = aa < THRESHOLD
    mb = bb < THRESHOLD
    iou = float(np.logical_and(ma, mb).sum() / np.logical_or(ma, mb).sum())
    mae = float(np.abs(aa.astype(np.int16) - bb.astype(np.int16)).mean())
    return {"ink_iou": iou, "grayscale_mae": mae}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--corpus", type=Path, default=CORPUS)
    parser.add_argument("--ink", type=Path, default=INK)
    args = parser.parse_args()

    corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
    annotations = json.loads(args.ink.read_text(encoding="utf-8"))
    assert len(corpus["pages"]) == 58
    page_annotations = {row["page"]: row for row in annotations["pages"]}
    pages = corpus["pages"]

    # The p0 candidate is specifically the first rune after its red 13-rune span.
    p0_spans = page_annotations[0]["red_spans"]
    assert len(p0_spans) == 1 and p0_spans[0]["start"] == 0
    assert p0_spans[0]["length"] == 13
    p0_target_offset = p0_spans[0]["start"] + p0_spans[0]["length"]
    p0_target = corpus["translit"][pages[0]["indices"][p0_target_offset]]
    assert p0_target == "TH"

    # The two repeated page frames have no red text span and begin A / OE.
    assert not page_annotations[1].get("red_spans", [])
    assert not page_annotations[2].get("red_spans", [])
    first = {
        page: corpus["translit"][pages[page]["indices"][0]]
        for page in (1, 2)
    }
    assert first == {1: "A", 2: "OE"}, first

    archive = ZipFile(args.archive) if args.archive else None
    try:
        images = {}
        source_hashes = {}
        for scan in (17, 18, 19):
            images[scan], source_hashes[scan] = load_scan(scan, archive)

        results = {}
        for name, bounds in CROPS.items():
            crops = {scan: images[scan].crop(bounds) for scan in (17, 18, 19)}
            # pp1 and p2 carry exactly the same decoded crop bytes.
            assert crops[18].tobytes() == crops[19].tobytes(), name
            results[name] = {
                "bounds_xyxy": bounds,
                "p0_vs_p1": compare(crops[17], crops[18]),
                "p0_vs_p2": compare(crops[17], crops[19]),
                "p1_p2_exact_crop_sha256": sha256(crops[18].tobytes()).hexdigest(),
            }
            assert results[name]["p0_vs_p1"]["ink_iou"] > 0.970
            assert results[name]["p0_vs_p2"]["ink_iou"] > 0.970
            assert results[name]["p1_p2_exact_crop_sha256"] == sha256(crops[19].tobytes()).hexdigest()

        output = {
            "source": "original LP2 scans 17.jpg-19.jpg (physical pp0-2)",
            "source_sha256": source_hashes,
            "cross_crops": results,
            "fixed_twig_rune_candidate": {
                "previously_published_branch_count": "3|3",
                "historical_mapping": "Orkney 6:5:5 Younger Futhark convention: 3|3 -> thorn (TH)",
                "p0_special_post_red_span_target": {"offset": p0_target_offset, "translit": p0_target},
                "p1_first_rune": first[1],
                "p2_first_rune": first[2],
                "page_local_first_rune_prediction_passes": all(value == "TH" for value in first.values()),
            },
            "decision": (
                "The p1/p2 repeated cross art is a fixed frame, not a reusable page-local TH selector. "
                "The p0 post-red-span TH match remains a single-page candidate without a second "
                "source-fixed target; this test does not disprove a p0-only semantic use."
            ),
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
    finally:
        if archive is not None:
            archive.close()


if __name__ == "__main__":
    main()
