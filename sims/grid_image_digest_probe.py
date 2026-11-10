"""Check literal SHA-256-family links from LP2's 256-byte grid to source JPEGs.

Usage: python sims/grid_image_digest_probe.py [source-image-directory]
A positive control places SHA-256(17.jpg) into a shadow grid column.
Only complete 32-byte digest equalities are tested.
"""
from __future__ import annotations

import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "resources" / "liber-primus"
GRID = ROOT / "resources" / "liber-primus" / "lp2-grid-256.json"
HASHES = ("sha256", "sha3_256", "blake2s")


def candidates(grid: list[int]) -> dict[bytes, list[str]]:
    if len(grid) != 256 or any(not 0 <= b <= 255 for b in grid):
        raise ValueError("Expected 256 eight-bit cells")
    out: dict[bytes, list[str]] = {}
    for layout in ("vertical-column", "contiguous-32"):
        for index in range(8):
            values = (grid[index::8] if layout == "vertical-column"
                      else grid[index * 32:(index + 1) * 32])
            for reverse in (False, True):
                value = bytes(reversed(values)) if reverse else bytes(values)
                label = f"{layout}-{index}{'-reversed' if reverse else ''}"
                out.setdefault(value, []).append(label)
    return out


def inputs() -> list[tuple[str, bytes]]:
    original = [(n, (IMAGES / f"{n:02}.jpg").read_bytes()) for n in range(75)]
    out = [(f"jpeg-{n:02}", content) for n, content in original]
    out += [
        ("lp2-all-jpegs", b"".join(content for n, content in original if n >= 17)),
        ("lp2-unsolved-jpegs", b"".join(content for n, content in original if 17 <= n <= 72)),
    ]
    for n, content in original[17:]:
        with Image.open(io.BytesIO(content)) as image:
            out.append((f"gray-raster-{n:02}", image.convert("L").tobytes()))
    return out


def screen(entries: list[tuple[str, bytes]], table: dict[bytes, list[str]]) -> list[dict[str, str]]:
    results = []
    for name, payload in entries:
        for algorithm in HASHES:
            digest = hashlib.new(algorithm, payload).digest()
            for label in table.get(digest, []):
                results.append({"input": name, "algorithm": algorithm,
                                "grid32": label})
    return results


def main() -> None:
    raw = json.loads(GRID.read_text(encoding="utf-8"))
    table = candidates(raw["bytes"])
    entries = inputs()
    actual = screen(entries, table)
    positive = {hashlib.sha256(entries[17][1]).digest(): ["planted-grid-column"]}
    control = screen([entries[17]], positive)
    assert control == [{"input": "jpeg-17", "algorithm": "sha256",
                        "grid32": "planted-grid-column"}]
    print(json.dumps({
        "scope": "75 source JPEGs, 58 decoded LP2 grayscale rasters, 2 combined streams",
        "inputs": len(entries), "algorithms": HASHES,
        "tested32byteGridPresentations": sum(map(len, table.values())),
        "totalComparisons": len(entries) * len(HASHES) * sum(map(len, table.values())),
        "originalMatches": actual, "positiveControl": control,
        "gridSHA256": hashlib.sha256(bytes(raw["bytes"])).hexdigest(),
        "limits": "Literal digest equality to eight vertical columns or eight row-major "
                  "32-byte chunks, forward and reversed. No claims for KDFs, transforms, "
                  "subsets, hidden JPEG coefficient fields or other hash encodings."
    }, indent=2))


if __name__ == "__main__":
    main()
