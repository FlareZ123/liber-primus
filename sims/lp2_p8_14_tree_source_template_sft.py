#!/usr/bin/env python3
"""Original-source SFT: p8–14 tree placement versus a genuine mirror instruction.

Requires Pillow and NumPy. Reads the seven original JPEGs and the committed
canonical rune counts. The measured stencil registration is a geometric
observation, not a claimed LP2 decoding operation. No files are written.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
PAGES = range(8, 15)


def original_image(page: int) -> np.ndarray:
    """Read exactly the original physical LP2 page, file number +17."""
    with Image.open(IMAGES / f"{page + 17:02d}.jpg") as image:
        array = np.asarray(image.convert("L"), dtype=np.uint8)
    assert array.shape == (3600, 2400), (page, array.shape)
    return array


def iou_dark(first: np.ndarray, second: np.ndarray) -> float:
    """Exact overlap of source-ink dark pixels; no fitted color thresholds."""
    a = first < 140
    b = second < 140
    assert a.shape == b.shape
    return float(np.count_nonzero(a & b) / np.count_nonzero(a | b))


def main() -> None:
    source = json.loads(
        (IMAGES / "lp2-corpus.json").read_text(encoding="utf-8")
    )
    lengths = {page["page"]: page["runic_count"] for page in source["pages"]}
    assert sum(lengths[p] for p in PAGES) == 1729

    images = {page: original_image(page) for page in PAGES}
    left = {page: images[page][:, :460] for page in (10, 12, 14)}
    right = {page: images[page][:, 1940:] for page in (9, 11, 13)}
    for page in (12, 14):
        assert np.array_equal(left[10], left[page])
    for page in (11, 13):
        assert np.array_equal(right[9], right[page])

    # Registration from the printed template's horizontal position:
    # same orientation is translated by 136 px in the two 480-px strips.
    odd = images[9][600:3000, 1920:]
    even = images[10][600:3000, :480]
    registered_same = iou_dark(odd[:, :344], even[:, 136:])
    registered_reflected = iou_dark(odd[:, :447], even[:, ::-1][:, 33:])
    same_side_first_page = iou_dark(images[8][700:2900, :440], images[10][700:2900, :440])
    assert registered_same > 0.95, registered_same
    assert registered_reflected < 0.15, registered_reflected
    assert same_side_first_page > 0.75, same_side_first_page

    print(json.dumps({
        "originalPhysicalPages": list(PAGES),
        "sourceRuneaCounts": [lengths[p] for p in PAGES],
        "sourceChapterRunes": 1729,
        "imageIds": [f"{p + 17:02d}.jpg" for p in PAGES],
        "treeSide": ["left" if p % 2 == 0 else "right" for p in PAGES],
        "sameSideRasterExact": {
            "rightOriginalPages": [9, 11, 13],
            "leftOriginalPages": [10, 12, 14],
            "stripWidthPixels": 460,
            "stripHeightPixels": 3600,
            "identicalAllPixelsWithinEachGroup": True,
            "indistinguishableOrdersWithinSideGroups": 36
        },
        "registeredUnmirroredDarkInkIoU": registered_same,
        "registeredReflectedDarkInkIoU": registered_reflected,
        "p8VersusP10SameSideDarkInkIoU": same_side_first_page,
        "testDecision": "Repeated page-layout stencil; no page-specific tree data, mirrored orientation, or original cipher operation selected.",
        "recoveredUnknownPlaintext": False
    }, indent=2))


if __name__ == "__main__":
    main()
