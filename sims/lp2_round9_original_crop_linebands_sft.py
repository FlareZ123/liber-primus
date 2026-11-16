"""Source-image-first LP2 p40-48 text line-band recovery.

Python 3.12, NumPy and Pillow on Windows 11. Reads only the original
JPEGs. Applies the independently published projection-profile geometry
to original image pixels after removing border art.

This test checks all original floral-section lines and a nine-window
source-geometry holdout; no transcription labels enter segmentation.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
EXPECTED = {40: 11, 41: 12, 42: 12, 43: 12, 44: 12,
            45: 12, 46: 12, 47: 12, 48: 12}
WINDOWS = ((520, 1850), (560, 1800), (580, 1800),
           (590, 1800), (600, 1800), (600, 1775),
           (620, 1750), (580, 1850), (580, 1775))


def line_bands(image: np.ndarray, left: int, right: int) -> list[tuple[int, int, int]]:
    """Return source-pixel vertical text bands, matching the external algorithm."""
    profile = np.count_nonzero(image[:, left:right] < 128, axis=1).astype(float)
    strong = profile[profile > 0.2 * profile.max()]
    threshold = 0.45 * np.median(strong)
    active = np.flatnonzero(profile > threshold)
    groups = np.split(active, np.where(np.diff(active) > 1)[0] + 1)
    return [(int(group[0]), int(group[-1]) + 1, int(profile[group].max()))
            for group in groups if group.size >= 40]


def main() -> None:
    bands = 0
    for page, expected in EXPECTED.items():
        original = IMAGES / f"{page + 17:02d}.jpg"
        image = np.asarray(Image.open(original).convert("L"))
        if image.shape[1] < 1850:
            raise AssertionError(f"Unexpected source width: {original}")
        selected = line_bands(image, 580, 1800)
        assert len(selected) == expected, (page, len(selected), expected)
        for left, right in WINDOWS:
            actual = line_bands(image, left, right)
            assert len(actual) == expected, (page, left, right, len(actual))
        bands += len(selected)
        print(f"LP2 physical p{page}: {len(selected)} original-ink bands;"
              f" y first={selected[0][0]} last={selected[-1][1]}")
    assert bands == 107
    print("PASS: 107 source-original text lines across nine physical photos,"
          " all nine crop settings, no rune labels")


if __name__ == "__main__":
    main()
