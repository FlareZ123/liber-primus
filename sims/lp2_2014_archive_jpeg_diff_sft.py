#!/usr/bin/env python3
"""Compare original LP2 image content against the pinned 2014 archive witness.

The external archive is checked out by a manual GitHub Actions workflow. This
script distinguishes JPEG byte/container changes from decoded pixel changes.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "resources" / "liber-primus"
HISTORICAL = ROOT / "_external_neuro" / "2014" / "011-seventh-onion"


def run() -> dict:
    counts = {
        "byte_identical": 0,
        "app0_only": 0,
        "different_jpeg_same_pixels": 0,
        "different_pixels": 0,
    }
    rows = []
    for page in range(58):
        historic_file = HISTORICAL / f"{page}.jpg"
        canonical_file = CANONICAL / f"{page + 17:02d}.jpg"
        historic = historic_file.read_bytes()
        canonical = canonical_file.read_bytes()

        if canonical == historic:
            status = "byte_identical"
        elif canonical.startswith(bytes.fromhex("ffd8ffe00010")) and (
            canonical[:2] + canonical[20:] == historic
        ):
            status = "app0_only"
        else:
            with Image.open(historic_file) as earlier, Image.open(canonical_file) as later:
                assert earlier.size == later.size == (2400, 3600)
                quantization_same = earlier.quantization == later.quantization
                delta = ImageChops.difference(
                    earlier.convert("RGB"), later.convert("RGB")
                )
                status = (
                    "different_pixels"
                    if delta.getbbox() is not None
                    else "different_jpeg_same_pixels"
                )
                if status == "different_pixels":
                    earlier_ink = earlier.convert("L").point(
                        lambda value: 255 if value < 128 else 0
                    )
                    later_ink = later.convert("L").point(
                        lambda value: 255 if value < 128 else 0
                    )
                    ink_delta = ImageChops.difference(earlier_ink, later_ink)
                    ink_disagreement = int(ImageStat.Stat(ink_delta).sum[0] / 255)
                    mean_abs = [round(v, 6) for v in ImageStat.Stat(delta).mean]
                    print(
                        f"PIXEL_DIFFERENCE page={page} bbox={delta.getbbox()} "
                        f"qtable_equal={quantization_same} "
                        f"mean_rgb_abs={mean_abs} ink_mask_diff_pixels={ink_disagreement} "
                        f"ink_bbox={ink_delta.getbbox()} "
                        f"historical_sha256={hashlib.sha256(historic).hexdigest()} "
                        f"canonical_sha256={hashlib.sha256(canonical).hexdigest()}",
                        flush=True,
                    )

        counts[status] += 1
        rows.append(
            {
                "page": page,
                "status": status,
                "historic_bytes": len(historic),
                "canonical_bytes": len(canonical),
            }
        )
        print(
            f"page={page:02} status={status:31} "
            f"historic_bytes={len(historic):7} canonical_bytes={len(canonical):7}",
            flush=True,
        )

    result = {"compared": 58, "counts": counts, "pages": rows}
    print("SUMMARY_JSON=" + json.dumps(result, separators=(",", ":")), flush=True)
    return result


if __name__ == "__main__":
    run()
