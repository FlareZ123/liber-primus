"""Direct native-JPEG test: does a wider NEXT glyph leave more right-margin space?

The source contains page-exact images and transcribed printed lines. Pixel
positions and ink widths are extracted from ORIGINAL 2400 x 3600 JPEGs, with
fixed conservative crop/threshold gates. No cipher inverse or learned glyph
weights enter this test. Under greedy wrapping, previous right-margin slack
should covary positively with the actual ink width of the next line's glyph.

Requires Pillow, NumPy, SciPy. Run on Python 3.11+ with original repository.
"""
from collections import defaultdict
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks
from scipy.stats import pearsonr, spearmanr

from printed_line_glyph_ink_width import (
    ROOT, first_ink_component, printed_first_glyphs
)

RANDOM_SEED = 0x47A19A03
TRIALS = 4000
PAGE_RIGHT_MARGIN_X = 1800


def source_pixel_pairs():
    pairs = []
    omitted_pages = []
    for page, glyph_starts in printed_first_glyphs().items():
        image_file = ROOT / "resources" / "liber-primus" / f"{page + 17:02d}.jpg"
        image = np.asarray(Image.open(image_file).convert("L"))
        assert image.shape == (3600, 2400)
        projection = (image[:, 790:1770] < 160).sum(axis=1)
        peaks, _ = find_peaks(
            gaussian_filter1d(projection.astype(float), sigma=7),
            prominence=125, distance=137
        )
        centers = [int(y) for y in peaks if 450 < y < 3150]
        if len(centers) != len(glyph_starts):
            omitted_pages.append(page)
            continue
        previous = None
        for label, center in zip(glyph_starts, centers):
            occupancy = (
                image[center - 60:center + 65, 555:1860] < 160
            ).sum(axis=0)
            columns = np.flatnonzero(occupancy > 7)
            if not columns.size:
                previous = None
                continue
            first = int(columns[0]) + 555
            last = int(columns[-1]) + 555
            eligible_ink = (
                first_ink_component(image, center, first)
                if label >= 0 and 595 <= first <= 610 else None
            )
            if (
                previous is not None and eligible_ink is not None
                and 595 <= previous["start"] <= 610
                and 1080 <= previous["last"] - previous["start"] <= 1210
            ):
                gap = PAGE_RIGHT_MARGIN_X - previous["last"]
                pairs.append((page, gap, eligible_ink))
            previous = {"start": first, "last": last}
    return pairs, omitted_pages


def main():
    pairs, omitted_pages = source_pixel_pairs()
    assert len(pairs) == 376
    gaps = np.asarray([p[1] for p in pairs], dtype=float)
    next_ink = np.asarray([p[2] for p in pairs], dtype=float)
    real_pearson = float(pearsonr(gaps, next_ink).statistic)
    real_spearman = float(spearmanr(gaps, next_ink).statistic)

    page_indices = defaultdict(list)
    for i, (page, _, _) in enumerate(pairs):
        page_indices[page].append(i)
    random = np.random.default_rng(RANDOM_SEED)
    null_correlation = []
    for _ in range(TRIALS):
        shuffled = next_ink.copy()
        for indexes in page_indices.values():
            indexes_array = np.asarray(indexes)
            shuffled[indexes_array] = random.permutation(
                shuffled[indexes_array]
            )
        null_correlation.append(float(pearsonr(gaps, shuffled).statistic))
    null = np.asarray(null_correlation)
    exceed = int((null >= real_pearson - 1e-12).sum())
    return {
        "original_source": "resources/liber-primus/17.jpg...72.jpg",
        "criterion": "Previous line right ink edge relative to x=1800 versus NEXT initial rune's first dark column component",
        "eligible_line_break_pairs": len(pairs),
        "excluded_source_pages": omitted_pages,
        "original": {
            "pearson_correlation": real_pearson,
            "spearman_correlation": real_spearman,
            "gap_px_range": [float(gaps.min()), float(gaps.max())],
            "fraction_ink_fits_condition": {
                str(padding_px): float(np.mean(gaps < next_ink + padding_px))
                for padding_px in (0, 5, 10, 15)
            }
        },
        "null": {
            "design": "Shuffle next-glyph ink measurements within each real physical page; freeze all previous-line ink ends and page glyph multisets.",
            "seed": RANDOM_SEED,
            "trials": TRIALS,
            "mean_pearson": float(null.mean()),
            "max_pearson": float(null.max()),
            "exceedances": exceed,
            "plus_one_upper_p": (exceed + 1) / (TRIALS + 1)
        },
        "interpretation": "Direct source-pixel evidence for width-dependent greedy line breaking; no cipher plaintext or cryptographic key"
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
