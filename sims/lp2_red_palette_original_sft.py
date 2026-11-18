"""Original LP2 red-ink palette test (Python 3; Pillow, numpy, opencv-python).

Reads the original JPEG scans 17.jpg..74.jpg in resources/liber-primus.
If working from the human-provided archive, reads liber-primus-jpegs.zip.
No OCR, rune decoding, secret parameters, or file writes.
"""
from collections import Counter
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image


def original_image(page):
    name = f"{page + 17:02d}.jpg"
    path = Path("resources/liber-primus") / name
    if path.is_file():
        with Image.open(path) as src:
            return np.asarray(src.convert("RGB"))
    with ZipFile("liber-primus-jpegs.zip") as archive:
        with Image.open(BytesIO(archive.read(f"liber-primus-jpegs/{name}"))) as src:
            return np.asarray(src.convert("RGB"))


def red_components(image):
    red = image[:, :, 0].astype(np.int16)
    green = image[:, :, 1].astype(np.int16)
    blue = image[:, :, 2].astype(np.int16)
    mask = ((red > 120) & (red > 2 * green) & (red > 2 * blue)
            & (green < 120) & (blue < 120)).astype(np.uint8)
    count, labels, boxes, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    components = []
    for i in range(1, count):
        x, y, width, height, area = map(int, boxes[i])
        if not (250 <= area <= 100000 and width >= 7 and height >= 7):
            continue
        crop = image[y:y+height, x:x+width]
        pixels = crop[labels[y:y+height, x:x+width] == i]
        core = pixels[(pixels[:, 0] > 172) & (pixels[:, 1] < 20)
                      & (pixels[:, 2] < 20)]
        if len(core) < 50:
            continue
        med = np.median(core.astype(np.int16), axis=0)
        components.append((x, y, width, height, area,
                           *(int(round(float(z))) for z in med)))
    return components


def main():
    histogram = Counter()
    colored_pages = 0
    first_component = None
    for page in range(58):
        rgb = original_image(page)
        assert rgb.shape == (3600, 2400, 3), (page, rgb.shape)
        parts = red_components(rgb)
        if page == 0:
            original = rgb.copy()
            first_component = parts[0]
        if parts:
            colored_pages += 1
        for part in parts:
            r, g, b = part[-3:]
            histogram[(r, g, b)] += 1
            assert 189 <= r <= 192 and g <= 2 and b <= 4, (page, part)
    assert sum(histogram.values()) == 238, histogram
    assert colored_pages == 18, colored_pages
    print("Original 58 pages; red-bearing pages:", colored_pages)
    print("Substantial source red components:", sum(histogram.values()))
    print("Observed red-core median RGB histogram:", dict(sorted(histogram.items())))

    # Source-shaped positive: recolor one original p0 red component by +28,
    # recompress as JPEG quality 95 and apply the identical classification.
    x, y, w, h, *_ = first_component
    crop = original[y:y+h, x:x+w].copy()
    r = crop[:, :, 0].astype(np.int16)
    g = crop[:, :, 1].astype(np.int16)
    b = crop[:, :, 2].astype(np.int16)
    red = (r > 120) & (r > 2*g) & (r > 2*b)
    crop[red, 0] = 220
    original[y:y+h, x:x+w] = crop
    stream = BytesIO()
    Image.fromarray(original).save(stream, format="JPEG", quality=95)
    positive = np.asarray(Image.open(BytesIO(stream.getvalue())).convert("RGB"))
    hits = [part for part in red_components(positive) if part[-3] >= 205]
    assert len(hits) >= 1, "JPEG color detector missed the planted red glyph"
    print("Positive JPEG-reencoded recolor components detected:", len(hits))
    print("PASS: no source red-core class separated from #C00000 by 8 red levels")


if __name__ == "__main__":
    main()
