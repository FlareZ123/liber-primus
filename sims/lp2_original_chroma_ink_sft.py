#!/usr/bin/env python3
"""Original LP2 JPEG high-amplitude chromatic-ink census; no ciphertext editing.

Run: python sims/lp2_original_chroma_ink_sft.py /path/to/liber-primus-jpegs.zip
An omitted argument uses repository resources/liber-primus/17.jpg–74.jpg.
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DILATE = np.ones((49, 49), dtype=np.uint8)


def measure(rgb: np.ndarray) -> dict:
    """Suppress all red-ink RGB differences and a 24-pixel neighbor halo."""
    image = rgb.astype(np.int16)
    r, g, b = [image[:, :, i] for i in range(3)]
    red = (r > g + 16) & (r > b + 16) & (g < 230)
    halo = cv2.dilate(red.astype(np.uint8), DILATE).astype(bool)
    spread = image.max(2) - image.min(2)
    spread[halo] = 0
    body = spread[500:2600, 440:2100]
    return {
        "red_pixels": int(red.sum()),
        "max_outside_red": int(spread.max()),
        "outside_red_gt4": int((spread > 4).sum()),
        "outside_red_gt8": int((spread > 8).sum()),
        "outside_red_gt16": int((spread > 16).sum()),
        "body_max": int(body.max()),
        "body_gt8": int((body > 8).sum()),
    }


def main() -> None:
    archive = ZipFile(sys.argv[1]) if len(sys.argv) > 1 else None
    try:
        archive_names = archive.namelist() if archive else []
        output = []
        for page in range(58):
            scan = page + 17
            if archive:
                path = [p for p in archive_names if p.endswith(f"/{scan:02}.jpg")]
                assert len(path) == 1, (page, path)
                data = io.BytesIO(archive.read(path[0]))
                im = Image.open(data)
            else:
                im = Image.open(ROOT / "resources" / "liber-primus" / f"{scan:02}.jpg")
            rgb = np.asarray(im.convert("RGB"))
            assert rgb.shape == (3600, 2400, 3), (page, rgb.shape)
            row = measure(rgb)
            row.update(physical_page=page, original_scan=f"{scan:02}.jpg")
            output.append(row)
            if page == 0:
                control = rgb.copy()
                control[100:108, 100:108] = [50, 100, 200]
                assert measure(control)["outside_red_gt16"] >= 64
        summary = {
            "page_count": len(output),
            "source_scans": "17.jpg through 74.jpg",
            "halo_radius": 24,
            "body_xyxy": [440, 500, 2100, 2600],
            "max_outside_red": max(x["max_outside_red"] for x in output),
            "total_outside_red_gt16": sum(x["outside_red_gt16"] for x in output),
            "total_body_gt8": sum(x["body_gt8"] for x in output),
            "pages_outside_red_gt8": [
                x["physical_page"] for x in output if x["outside_red_gt8"]
            ],
            "planted_8x8_chromatic_control": "detected",
        }
        assert summary["total_outside_red_gt16"] == 0
        assert summary["total_body_gt8"] == 0
        print(json.dumps({"summary": summary, "pages": output}, indent=2))
    finally:
        if archive:
            archive.close()


if __name__ == "__main__":
    main()
