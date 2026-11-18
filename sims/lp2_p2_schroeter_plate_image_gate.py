"""Source-only p2 illustration attribution gate, no GP29 cipher fitting.

Download the figure explicitly labelled Schroeter (1774) by Strange Science,
normalize its black-pixel silhouette, and compare against exact LP2 19.jpg.
This is an *art-source* test, not an inferred cryptographic operation.
"""
from __future__ import annotations

from base64 import b64encode
from io import BytesIO
from urllib.request import Request, urlopen

import numpy as np
from PIL import Image, ImageOps

SOURCE_URL = "https://www.strangescience.net/pics/leggy.gif"
LP2_IMAGE = "resources/liber-primus/19.jpg"


def black_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    mask = np.asarray(img.convert("L")) < 165
    yy, xx = np.where(mask)
    if len(xx) == 0:
        raise ValueError("No ink pixels in candidate image")
    return int(xx.min()), int(yy.min()), int(xx.max()) + 1, int(yy.max()) + 1


def silhouette(img: Image.Image, w: int = 80, h: int = 32) -> np.ndarray:
    cropped = img.convert("L").crop(black_bbox(img))
    canvas = Image.new("L", (w, h), 255)
    cropped.thumbnail((w - 2, h - 2), Image.Resampling.LANCZOS)
    canvas.paste(cropped, ((w - cropped.width) // 2, (h - cropped.height) // 2))
    return np.asarray(canvas) < 165


def ascii_art(mask: np.ndarray) -> str:
    return "\n".join("".join("#" if p else " " for p in row) for row in mask)


def similarity(a: np.ndarray, b: np.ndarray) -> tuple[float, float]:
    intersection = np.count_nonzero(a & b)
    union = np.count_nonzero(a | b)
    iou = intersection / union if union else 0.0
    overlap = intersection / max(1, min(np.count_nonzero(a), np.count_nonzero(b)))
    return iou, overlap


def main() -> None:
    request = Request(SOURCE_URL, headers={"User-Agent": "Mozilla/5.0 (LP2 historical attribution study)"})
    with urlopen(request, timeout=45) as response:
        binary = response.read(6_000_001)
    if len(binary) > 6_000_000:
        raise ValueError("Image exceeds six-megabyte source limit")
    print("SOURCE_IMAGE_BASE64 " + b64encode(binary).decode("ascii"))
    source = Image.open(BytesIO(binary)).convert("L")
    page = Image.open(LP2_IMAGE).convert("L")
    # The original p2 insect occupies approximately x=870..1610, y=2630..2930.
    p2 = page.crop((870, 2620, 1610, 2940))
    orig_mask = silhouette(p2)
    print("SOURCES", SOURCE_URL, LP2_IMAGE)
    print("IMAGES", "historical_candidate", source.size, "LP2", page.size, "p2_crop", p2.size)
    print("SOURCE_MASK_BEGIN\n" + ascii_art(silhouette(source)) + "\nSOURCE_MASK_END")
    print("LP2_MASK_BEGIN\n" + ascii_art(orig_mask) + "\nLP2_MASK_END")
    variants = (
        ("identity", source),
        ("mirror", ImageOps.mirror(source)),
        ("flip", ImageOps.flip(source)),
        ("rotate180", source.rotate(180)),
    )
    for name, candidate in variants:
        a, b = similarity(silhouette(candidate), orig_mask)
        print(f"MASK_SCORE {name} IoU={a:.6f} overlap_min={b:.6f}")
    print("CONCLUSION_RULE: visual morphology and a source caption determine attribution; mask scores alone do not prove identical plates.")


if __name__ == "__main__":
    main()
