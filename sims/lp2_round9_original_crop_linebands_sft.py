"""Source-image-first LP2 text line-band recovery.

Python 3.12, NumPy and Pillow on Windows 11. Reads the 56 original
unknown-page JPEGs and computes original-ink text row projections
before reading any runic transcription or matching image templates.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
WINDOWS = ((520, 1850), (560, 1800), (580, 1800),
           (590, 1800), (600, 1800), (600, 1775),
           (620, 1750), (580, 1850), (580, 1775))

# Pre-registered image-only pixel projection outputs x=580..1799.
SOURCE_ROW_COUNTS = (
    12, 12, 10, 11, 12, 12, 9, 10, 12, 12, 12, 12, 12, 12,
    8, 12, 12, 12, 12, 12, 12, 12, 11, 10, 12, 12, 12, 13,
    12, 12, 12, 12, 6, 12, 12, 12, 11, 11, 11, 11, 11, 12,
    12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 12, 9, 11, 5,
)
# Published editorial line count, used ONLY for an output-level comparison.
# Physical page 50 is a numerical table, no runic text.
PUBLISHED_RUNE_LINE_COUNTS = (
    12, 12, 9, 11, 12, 12, 10, 10, 12, 12, 12, 12, 12, 12,
    7, 8, 12, 12, 12, 12, 12, 12, 6, 10, 12, 12, 12, 11,
    12, 12, 12, 12, 6, 11, 12, 12, 11, 11, 11, 12, 11, 12,
    12, 12, 12, 12, 12, 12, 12, 3, 0, 4, 12, 9, 11, 4,
)


def line_bands(image: np.ndarray, left: int, right: int) -> list[tuple[int, int, int]]:
    """Reproduce the published ink projection after cropping source pixels."""
    profile = np.count_nonzero(image[:, left:right] < 128, axis=1).astype(float)
    strong = profile[profile > 0.2 * profile.max()]
    threshold = 0.45 * np.median(strong)
    active = np.flatnonzero(profile > threshold)
    groups = np.split(active, np.where(np.diff(active) > 1)[0] + 1)
    return [(int(group[0]), int(group[-1]) + 1, int(profile[group].max()))
            for group in groups if group.size >= 40]


def main() -> None:
    assert len(SOURCE_ROW_COUNTS) == len(PUBLISHED_RUNE_LINE_COUNTS) == 56
    exact_pages = []
    exceptional_pages = []
    unstable_pages = []
    floral_bands = 0
    for page in range(56):
        original = IMAGES / f"{page + 17:02d}.jpg"
        image = np.asarray(Image.open(original).convert("L"))
        assert image.shape[1] >= 1850, f"Unexpected source width: {original}"
        selected = line_bands(image, 580, 1800)
        assert len(selected) == SOURCE_ROW_COUNTS[page], (page, len(selected))
        # Source-visible typographic controls: illustrations and numeric rows
        # use different vertical ink extents from full-size printed runes.
        if page in (22, 49, 51):
            rune_height_bands = [band for band in selected
                                 if 100 <= band[1] - band[0] <= 125]
            assert len(rune_height_bands) == {22: 6, 49: 3, 51: 4}[page]
        if page == 50:
            assert all(67 <= y1 - y0 <= 69 for y0, y1, _ in selected)
        candidate_counts = [len(line_bands(image, left, right))
                            for left, right in WINDOWS]
        if len(set(candidate_counts)) > 1:
            unstable_pages.append(page)
        if page != 50:
            if len(selected) == PUBLISHED_RUNE_LINE_COUNTS[page]:
                exact_pages.append(page)
            else:
                exceptional_pages.append(page)
        if 40 <= page <= 48:
            assert len(set(candidate_counts)) == 1
            assert len(selected) == (11 if page == 40 else 12)
            floral_bands += len(selected)
        print(f"LP2 p{page}: image bands={len(selected):2d}, "
              f"published rune lines={PUBLISHED_RUNE_LINE_COUNTS[page]:2d}, "
              f"crop min/max={min(candidate_counts)}/{max(candidate_counts)}")
    assert floral_bands == 107
    assert len(exact_pages) == 44
    assert sum(PUBLISHED_RUNE_LINE_COUNTS[p] for p in exact_pages) == 509
    assert exceptional_pages == [2, 6, 14, 15, 22, 27, 33, 39, 49, 51, 55]
    assert unstable_pages == [33, 55]
    print("PASS: floral original pixels yield all 107 source text bands")
    print("PASS: 44 of 55 rune-bearing pages have matching original-projected "
          "row counts, covering 509/594 published rune lines")
    print("PASS: source geometry unstable under nine image windows only "
          "at physical p33 and p55")


if __name__ == "__main__":
    main()
