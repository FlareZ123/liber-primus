"""Read-only exact-pixel test of the 16 original LP2 floral plates.

Original LP2 physical pages p40..p55 are source JPEGs 57.jpg..72.jpg.
Requires Pillow; prints the RGB strip hashes of the first page and asserts
identity on all sixteen, plus central-content diversity as a negative control.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

from PIL import Image


ROOT = Path(os.environ.get("LP2_IMAGE_DIR", Path(__file__).resolve().parents[1] / "resources" / "liber-primus"))
SOURCE_FILES = tuple(ROOT / f"{page + 17:02d}.jpg" for page in range(40, 56))
BOXES = {
    "left": (0, 0, 591, 3600),
    "center": (591, 0, 1832, 3600),
    "right": (1832, 0, 2400, 3600),
}


def hashes_for_source(path: Path) -> dict[str, str]:
    with Image.open(path) as image:
        assert image.size == (2400, 3600), f"Unexpected JPEG size: {path}"
        rgb = image.convert("RGB")
        return {
            name: hashlib.sha256(rgb.crop(box).tobytes()).hexdigest()
            for name, box in BOXES.items()
        }


def main() -> None:
    hashes = [hashes_for_source(path) for path in SOURCE_FILES]
    assert all(row["left"] == hashes[0]["left"] for row in hashes)
    assert all(row["right"] == hashes[0]["right"] for row in hashes)
    assert len({row["center"] for row in hashes}) == 16, "Central areas should differ"
    assert hashes[0]["left"] == "3487367efc8b098f9dd8d4b878132bab0f56e36bebb7bc168283f7a9669910c1"
    assert hashes[0]["right"] == "d860da957dc1b6dd00319f6b158a6a66884142c0a635bdd5725b5c5af260d089"
    print("PASS: p40-p55 all 16 original JPEGs: exact RGB left/right border matches")
    print("Changing columns are strictly between x=591 and x=1831; 16 distinct central crops")
    print(f"left SHA256:   {hashes[0]['left']}")
    print(f"right SHA256:  {hashes[0]['right']}")
    print(f"center p40 SHA256: {hashes[0]['center']}")


if __name__ == "__main__":
    main()
