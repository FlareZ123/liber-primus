"""Native-JPEG test of LP2 glyph widths inferred from the opposite manuscript half.

Read authentic source image pixels only. Recover approximate ink width of the
FIRST graphical glyph of each physically printed line: a self-contained run
of vertical black-pixel columns (allowing 2 blank columns), rather than
identifying glyphs through OCR. Original rune transcription supplies the
known first-glyph identity. Each half's image widths are compared ONLY to
the opposite half's frozen line-wrap widths, estimated independently by the
existing CommonJS tool. Source line segmentation is conservatively skipped
if the number of detected rows differs from the transcription.

Dependencies: Python 3.11+, Pillow, NumPy, SciPy; Node.js 22+ for the
shared cross-fitted source-width program. The source JPEGs reside under
resources/liber-primus, images 17.jpg through 72.jpg.
"""
import json
from collections import defaultdict
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks
from scipy.stats import pearsonr, spearmanr

ROOT = Path(__file__).resolve().parent.parent
GP = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
INDEX = {glyph: i for i, glyph in enumerate(GP)}
SEED = 0x47A1651D
TRIALS = 1500


def recover_other_half_widths():
    """Evaluate the source-only JS fit with disjoint physical page halves."""
    program = ROOT / "sims" / "printed_line_greedy_width_inverse.cjs"
    result = subprocess.run(
        ["node", str(program), "50"],
        cwd=ROOT, check=True, capture_output=True, text=True
    )
    model = json.loads(result.stdout)
    return {
        "early": np.asarray(model["backward"]["glyphWidths"][:29], dtype=float),
        "late": np.asarray(model["forward"]["glyphWidths"][:29], dtype=float),
    }


def printed_first_glyphs():
    """Source transcription only, preserving each page and line."""
    records = (ROOT / "resources" / "lp2-transcription.txt").read_text(
        encoding="utf-8"
    ).split("%")[:55]
    assert len(records) == 55
    pages = {}
    for ordinal, record in enumerate(records):
        physical = ordinal if ordinal < 50 else ordinal + 1
        runic_lines = [
            line.strip() for line in record.split("/")
            if any(glyph in INDEX for glyph in line)
        ]
        pages[physical] = [
            INDEX.get(line[0], -1) if line else -1
            for line in runic_lines
        ]
    return pages


def first_ink_component(image, line_y, start_x):
    """Width of first dark-column component, spanning <= 2 empty columns."""
    projection = (
        image[line_y - 60:line_y + 65, start_x:start_x + 110] < 160
    ).sum(axis=0)
    dark = projection > 2
    occupied = np.flatnonzero(dark)
    if not occupied.size:
        return None
    start = int(occupied[0])
    last = start
    consecutive_empty = 0
    for column in range(start + 1, dark.size):
        if dark[column]:
            last = column
            consecutive_empty = 0
        else:
            consecutive_empty += 1
            if consecutive_empty > 2:
                break
    return last - start + 1


def native_observations():
    pages = printed_first_glyphs()
    observations = {"early": [], "late": []}
    skipped = {"unmatched_line_counts": [], "off_margin_or_punctuation": 0}
    for page, labels in pages.items():
        image_file = ROOT / "resources" / "liber-primus" / f"{page + 17:02d}.jpg"
        image = np.asarray(Image.open(image_file).convert("L"))
        assert image.shape == (3600, 2400), image_file
        projection = (image[:, 790:1770] < 160).sum(axis=1)
        smoothed = gaussian_filter1d(projection.astype(float), sigma=7)
        peaks, _ = find_peaks(smoothed, prominence=125, distance=137)
        centers = [int(y) for y in peaks if 450 < y < 3150]
        if len(centers) != len(labels):
            skipped["unmatched_line_counts"].append({
                "page": page, "image": len(centers),
                "transcript": len(labels)
            })
            continue
        for label, center in zip(labels, centers):
            row = image[center - 60:center + 65, 555:1860]
            occupancy = (row < 160).sum(axis=0)
            cols = np.flatnonzero(occupancy > 7)
            if not cols.size:
                continue
            start_x = int(cols[0]) + 555
            if label < 0 or not 595 <= start_x <= 610:
                skipped["off_margin_or_punctuation"] += 1
                continue
            width = first_ink_component(image, center, start_x)
            if width is None:
                continue
            section = "early" if page < 26 else "late"
            observations[section].append((page, label, width))
    return observations, skipped


def metrics(points, predicted):
    by_rune = defaultdict(list)
    for _, rune, pixels in points:
        by_rune[rune].append(pixels)
    usable = sorted(i for i, pix in by_rune.items() if len(pix) >= 3)
    x = [predicted[i] for i in usable]
    y = [np.median(by_rune[i]) for i in usable]
    return {
        "runes": len(usable),
        "observations": len(points),
        "pearson": float(pearsonr(x, y).statistic),
        "spearman": float(spearmanr(x, y).statistic),
        "median_ink_width": [
            {"rune": GP[i], "ink_px": float(np.median(by_rune[i])),
             "count": len(by_rune[i]), "other_half_width": float(predicted[i])}
            for i in usable
        ],
    }


def test_permuted_labels(points, prediction, random):
    observed = metrics(points, prediction)
    group = defaultdict(list)
    for j, (page, _, _) in enumerate(points):
        group[page].append(j)
    labels = np.asarray([rune for _, rune, _ in points], dtype=int)
    widths = np.asarray([width for _, _, width in points], dtype=int)
    pages = np.asarray([page for page, _, _ in points], dtype=int)
    exceeding = 0
    maxima = -1.0
    average = 0.0
    for _ in range(TRIALS):
        reassigned = labels.copy()
        for indexes in group.values():
            indexes_array = np.asarray(indexes)
            reassigned[indexes_array] = random.permutation(
                reassigned[indexes_array]
            )
        null_points = list(zip(pages, reassigned, widths))
        corr = metrics(null_points, prediction)["pearson"]
        average += corr
        maxima = max(maxima, corr)
        exceeding += corr >= observed["pearson"] - 1e-12
    return {
        "observed": observed,
        "page_preserving_label_null": {
            "trials": TRIALS, "mean_pearson": average / TRIALS,
            "largest_null_pearson": maxima,
            "exceedances": exceeding,
            "plus_one_p": (exceeding + 1) / (TRIALS + 1),
        }
    }


def main():
    frozen = recover_other_half_widths()
    observations, skipped = native_observations()
    random = np.random.default_rng(SEED)
    tests = {
        half: test_permuted_labels(observations[half], frozen[half], random)
        for half in ("early", "late")
    }
    return {
        "source": "Original physical LP2 image JPEGs and runic-line transcription",
        "measure": "First runic glyph ink-column span, not an OCR or true font-advance measurement",
        "heldout_contract": "Each source image half is compared only with glyph advances inferred from the opposite physical page half",
        "thresholds": {
            "black_pixel": 160, "column_ink_for_component": 2,
            "maximum_blank_columns_inside_component": 2,
            "row_projection_peak_prominence": 125,
            "row_projection_peak_distance": 137,
            "line_start_x": [595, 610],
            "minimum_repeats_per_rune": 3
        },
        "seed": SEED,
        "skipped": skipped,
        "tests": tests,
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
