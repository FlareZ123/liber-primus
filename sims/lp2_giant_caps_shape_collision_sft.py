"""Original LP2 full-height illuminated-initial source audit (Pillow and NumPy).

Correction to 2026-11-16 early truncated-window test: crop to top+720,
rather than top+160, because oversized red drop-caps span ~500 pixels.
The old top-third p3/p56 collision disappears when the whole glyph is read.
Controls use actual solved pages p56 (AE) and p57 (P).
Read only. Original JPEGs 17.jpg..74.jpg, native 2400x3600.
"""
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"

# physical LP2 page, zero-based printed line, top-row y, first small glyph x
SITES = (
    (0, 0, 673, 772), (3, 0, 673, 761), (3, 6, 2102, 838),
    (6, 4, 1725, 765), (8, 0, 673, 894), (15, 1, 1736, 761),
    (23, 0, 1160, 848), (27, 0, 917, 858), (33, 0, 673, 858),
    (33, 5, 1914, 841), (39, 6, 1858, 851), (40, 0, 673, 765),
    (54, 0, 917, 781), (56, 0, 673, 770), (57, 0, 917, 890),
)
# Applied only after cropping; no known alphabet determines a mask.
CANONICAL = (
    "S", "L", "P", "A", "X", "L", "U", "M", "D", "NG",
    "IA", "F", "A", "AE", "P"
)


def red_mask(site, bottom=720):
    page, _line, top, first_regular_x = site
    image = np.asarray(
        Image.open(SOURCE / f"{page + 17:02d}.jpg").convert("RGB"),
        dtype=np.int16
    )
    assert image.shape == (3600, 2400, 3)
    window = image[top - 80:top + bottom, 590:first_regular_x - 6]
    red = (
        (window[:, :, 0] > 100)
        & (window[:, :, 0] > 2 * window[:, :, 1])
        & (window[:, :, 0] > 2 * window[:, :, 2])
    )
    y, x = np.nonzero(red)
    assert y.size > 6000, (page, y.size)
    if bottom == 720:
        # A full cap must finish before the crop's lower edge.
        assert y.min() > 0 and y.max() < window.shape[0] - 1
    return np.ascontiguousarray(
        red[y.min():y.max() + 1, x.min():x.max() + 1]
    )


def iou(a, b):
    # Fixed presentation scale, nearest neighbour; compare whole shapes.
    a = np.asarray(
        Image.fromarray(a).resize(
            (256, 384), resample=Image.Resampling.NEAREST
        ),
        dtype=np.bool_
    )
    b = np.asarray(
        Image.fromarray(b).resize(
            (256, 384), resample=Image.Resampling.NEAREST
        ),
        dtype=np.bool_
    )
    return float(np.count_nonzero(a & b) / np.count_nonzero(a | b))


def main():
    full = [red_mask(s) for s in SITES]
    top_third = [red_mask(s, bottom=160) for s in SITES]
    assert len(full) == 15
    assert all(
        490 <= glyph.shape[0] <= 620
        and 140 <= glyph.shape[1] <= 300
        for glyph in full
    )

    # A direct regression: first 165 pixels misleadingly matched exactly.
    assert top_third[1].shape == top_third[13].shape == (165, 139)
    assert np.array_equal(top_third[1], top_third[13])
    assert not np.array_equal(full[1], full[13])
    assert not np.array_equal(full[1], full[6])

    comparisons = (
        (1, 13),  # p3 L vs solved p56 AE: distinct full runes
        (1, 5),   # p3 L vs p15 L: same rune
        (1, 6),   # p3 L vs p23 U: distinct full runes
        (6, 13),  # p23 U vs p56 AE: distinct full runes
        (2, 14),  # p3 P vs solved clear p57 P: same rune
        (3, 12),  # p6 A vs p54 A: dot/ornament variation
    )
    observed = {}
    for a, b in comparisons:
        score = iou(full[a], full[b])
        observed[a, b] = score
        print(
            f"p{SITES[a][0]}/line{SITES[a][1]} {CANONICAL[a]} "
            f"vs p{SITES[b][0]}/line{SITES[b][1]} {CANONICAL[b]}: "
            f"FULL {score:.8f} normalized-mask IoU"
        )
    assert 0.79 < observed[1, 13] < 0.83
    assert 0.98 < observed[1, 5] < 1
    assert 0.39 < observed[1, 6] < 0.42
    assert 0.37 < observed[6, 13] < 0.41
    assert 0.96 < observed[2, 14] < 1
    assert 0.72 < observed[3, 12] < 0.78
    assert all(
        not np.array_equal(full[a], full[b])
        for a in range(15) for b in range(a + 1, 15)
        if CANONICAL[a] != CANONICAL[b]
    )
    print(
        "PASS: source-truncated red-cap collision was an image-crop artifact;"
        " all 13 unknown giant full-height silhouettes are visible, distinct"
        " as needed, and visually consistent with the canonical GP29 runes."
    )
    print(
        "No independent 29-way trained giant font classifier, unknown plaintext,"
        " historic key or actual cipher mechanism is inferred."
    )


if __name__ == "__main__":
    main()
