#!/usr/bin/env python3
"""LP2 p22 exact-source visual-direction check (original JPEG only).

Tests only source-visible text alignment. Glyph shapes were independently
classified in the prior p22 original-source test, and full LP1 figure mirroring
was established separately. No OCR or post-hoc decryption score.
"""

from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

TARGET = Path("resources/liber-primus/39.jpg")
LP1 = Path("resources/liber-primus/14.jpg")
EXPECTED = {
    TARGET: ("e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7", 512143),
    LP1: ("de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e", 625668),
}
ROW_CENTERS = [727, 915, 1077, 1267, 1485, 1711]
EXACT_EXTENTS = [(601, 1772), (600, 1766), (601, 1778), (601, 1762), (601, 1779), (601, 1668)]


def main() -> None:
    for file, (digest, size) in EXPECTED.items():
        source = file.read_bytes()
        assert len(source) == size, f"Unexpected size: {file}"
        assert sha256(source).hexdigest() == digest, f"Unexpected source SHA: {file}"
        print(f"ORIGINAL_SOURCE_OK {file} bytes={size} sha256={digest}")

    page = np.asarray(Image.open(TARGET).convert("L"), dtype=np.uint8)
    assert page.shape == (3600, 2400)
    observed: list[tuple[int, int]] = []
    for number, y in enumerate(ROW_CENTERS, 1):
        # The six horizontal text lines are above the source figure. Only
        # original dark pixels in a fixed, predeclared text-column window.
        window = page[y - 85 : y + 85, 500:2000]
        dark = window < 125
        support = np.where(np.sum(dark, axis=0) > 4)[0]
        assert len(support) >= 800, f"Insufficient original text ink row {number}"
        left, right = int(support[0]) + 500, int(support[-1]) + 500
        observed.append((left, right))
        print(
            f"ORIGINAL_ROW row={number} y={y} left={left} right={right}"
            f" textWidth={right - left + 1}"
        )

    assert observed == EXACT_EXTENTS, "Original p22 glyph placement changed"
    assert max(left for left, _ in observed) - min(left for left, _ in observed) == 1
    assert min(right for _, right in observed[:5]) - observed[5][1] >= 90

    # This is a visual text-layout test, not a proof that a non-conventional
    # right-to-left manual reading was impossible. Source contains no
    # instruction uniquely selecting the latter. Human-visible punctuation
    # in p22 scan39 has separate quotation marks on lines four and five;
    # the normalized lp2-transcription.txt omits those non-rune marks.
    print(
        "PASS six identically left-anchored original runic lines; "
        "final line has 94px additional right-side ragged margin. "
        "This visibly distinguishes the text composition from the "
        "mirrored source figure, with no selected rune reordering."
    )


if __name__ == "__main__":
    main()
