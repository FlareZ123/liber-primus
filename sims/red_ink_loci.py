"""Locate saturated-red ink in original Liber Primus JPEGs.

This is a coordinate inventory, not OCR or a cipher identification.
Requires Pillow and NumPy. Regions are at 600x900, a quarter-size
render of the 2400x3600 original scans.
"""
from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image


def red_regions(jpeg: bytes) -> dict:
    """Measure saturated red ink and contiguous red-bearing row bands."""
    with Image.open(io.BytesIO(jpeg)) as source:
        image = source.convert("RGB").resize((600, 900), Image.Resampling.BICUBIC)
    pixels = np.asarray(image, dtype=np.int16)
    red = (
        (pixels[:, :, 0] > 85)
        & (pixels[:, :, 0] - pixels[:, :, 1] > 45)
        & (pixels[:, :, 0] - pixels[:, :, 2] > 40)
        & (pixels[:, :, 1] < 140)
    )
    row_counts = red.sum(axis=1)
    active_rows = np.flatnonzero(row_counts > 2)
    regions = []
    if active_rows.size:
        first = np.r_[0, np.flatnonzero(np.diff(active_rows) > 1) + 1]
        last = np.r_[first[1:] - 1, len(active_rows) - 1]
        for a, b in zip(first, last):
            y0, y1 = int(active_rows[a]), int(active_rows[b])
            ink = int(row_counts[y0:y1+1].sum())
            if ink < 10:
                continue
            xs = np.flatnonzero(red[y0:y1+1].any(axis=0))
            regions.append({
                "x0": int(xs[0]), "y0": y0,
                "x1": int(xs[-1]), "y1": y1,
                "red_pixels": ink,
            })
    return {"red_pixels": int(red.sum()), "regions": regions}


def census(image_dir: Path | None = None, archive: Path | None = None) -> list[dict]:
    if bool(image_dir) == bool(archive):
        raise ValueError("Supply either image_dir or archive")
    result = []
    with ZipFile(archive) if archive else _NoArchive() as zipped:
        for scan in range(17, 75):
            if archive:
                data = zipped.read(f"liber-primus-jpegs/{scan:02d}.jpg")
            else:
                data = (image_dir / f"{scan:02d}.jpg").read_bytes()
            item = red_regions(data)
            result.append({"scan": scan, "lp2_page": scan - 17, **item})
    return result


class _NoArchive:
    def __enter__(self):
        return None

    def __exit__(self, *_):
        return False


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--zip", type=Path)
    group.add_argument("--images", type=Path, default=None)
    args = parser.parse_args()
    results = census(args.images or (
        None if args.zip else Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
    ), args.zip)
    assert len(results) == 58
    print(json.dumps({
        "method": "RGB BICUBIC 600x900; R>85, R-G>45, R-B>40, G<140",
        "regions": "contiguous rows with >2 red pixels, group >=10 pixels",
        "coordinate_system": "600x900 thumbnail; x0,y0,x1,y1 inclusive",
        "images": results,
    }, indent=2))


if __name__ == "__main__":
    main()
