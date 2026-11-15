"""Source-exact SFT: test whether repeated LP2 page ornaments vary per page.

Requirements: Pillow. Reads the repository's canonical source JPEGs from
resources/liber-primus, or the maintainer's 75-JPEG archive when supplied.
No OCR or conjectural rune decoding is involved.
"""
from __future__ import annotations

import hashlib
import io
import sys
import zipfile
from pathlib import Path
from PIL import Image, ImageChops

REGIONS = (
    ("floral-left", tuple(range(40, 56)), (0, 0, 450, 3600)),
    ("floral-right", tuple(range(40, 56)), (1950, 0, 2400, 3600)),
    ("cuneiform-heading", tuple(range(34, 40)), (900, 100, 1550, 500)),
)


def load(page: int, archive: zipfile.ZipFile | None, root: Path) -> Image.Image:
    filename = f"{page + 17:02}.jpg"
    if archive:
        raw = archive.read(f"liber-primus-jpegs/{filename}")
    else:
        raw = (root / filename).read_bytes()
    with Image.open(io.BytesIO(raw)) as image:
        if image.size != (2400, 3600):
            raise AssertionError((page, image.size))
        return image.convert("RGB")


def run(archive: zipfile.ZipFile | None, root: Path) -> None:
    for label, pages, bounds in REGIONS:
        reference = load(pages[0], archive, root).crop(bounds).tobytes()
        digest = hashlib.sha256(reference).hexdigest()
        for page in pages:
            pixels = load(page, archive, root).crop(bounds).tobytes()
            changes = sum(a != b for a, b in zip(reference, pixels))
            print(f"{label}, p{page}: {changes} changed RGB channel values")
            assert changes == 0, (label, page, changes)
        print(f"{label}: {len(pages)} source pages IDENTICAL, RGB SHA256={digest}")

    # Every changed pixel in the entire floral chapter, across all RGB channels.
    first = load(40, archive, root)
    changed = Image.new("L", first.size, 0)
    for page in range(41, 56):
        difference = ImageChops.difference(first, load(page, archive, root))
        rgb_masks = [channel.point(lambda value: 255 if value else 0) for channel in difference.split()]
        changed = ImageChops.lighter(changed, ImageChops.lighter(rgb_masks[0], ImageChops.lighter(rgb_masks[1], rgb_masks[2])))
    bounds = changed.getbbox()
    count = changed.histogram()[255]
    print(f"floral p40–55 full-page change union: bounds={bounds}, pixels={count}")
    assert bounds == (591, 624, 1832, 3184)
    assert count == 2631883
    assert all(changed.getpixel((x, y)) == 0 for x, y in ((0, 0), (1000, 100), (2000, 2000), (2399, 3599)))

    source = load(41, archive, root).crop((900, 500, 1500, 1200)).tobytes()
    other = load(42, archive, root).crop((900, 500, 1500, 1200)).tobytes()
    changed = sum(a != b for a, b in zip(source, other))
    print(f"independent text-region differential control p41/p42: {changed} changed channels")
    assert changed > 0, "differential control unexpectedly equal"
    print("PASS: exact repeated art pixel identity with effective differential control")


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as z:
            run(z, path)
    else:
        run(None, path)
