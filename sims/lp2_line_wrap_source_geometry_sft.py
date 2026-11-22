"""Measure source-visible LP2 line-start bias and actual JPEG wrap constraints.

One reproducible original-input test. Requires numpy and Pillow.
All data, including glyph widths and printed line divisions, are read from
the repository's pinned resource corpus. Uses no external downloads or OCR.

Original physical LP2 page p corresponds to archive image (p+17).jpg.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
CLEAN_PAGES = tuple(range(16, 22)) + tuple(range(28, 32))
CANDIDATE_RIGHT_EDGES = np.arange(1780, 1811)
SAMPLE_SEED = 20261112


def coincidence(values: np.ndarray) -> float:
    histogram = np.bincount(values, minlength=29)
    return float(np.sum(histogram * (histogram - 1)) /
                 (len(values) * (len(values) - 1)))


def original_line_rows() -> tuple[list[tuple[int, int, list[int]]], np.ndarray]:
    corpus = json.loads((ROOT / "lp2-corpus.json").read_text(encoding="utf-8"))
    transcription = (ROOT / "lp2-transcription.txt").read_text(encoding="utf-8")
    widths = json.loads((ROOT / "lp2-line-start-ink-widths.json").read_text(
        encoding="utf-8"))["modeInkRunWidthsPx"]
    glyph = {character: i for i, character in enumerate(corpus["runes"])}
    sections = transcription.split("%")
    assert len(sections) == 57, "transcription page separators changed"
    assert len(widths) == 29

    lines: list[tuple[int, int, list[int]]] = []
    for text_page in range(55):
        physical_page = text_page if text_page < 50 else text_page + 1
        raw_lines = re.split(r"[\n/]", sections[text_page])
        ink_lines = [
            [glyph[character] for character in line if character in glyph]
            for line in raw_lines
        ]
        ink_lines = [line for line in ink_lines if line]
        original = next(p for p in corpus["pages"]
                        if p["page"] == physical_page)["indices"]
        assert [x for line in ink_lines for x in line] == original, (
            f"page {physical_page}: original transcription diverges"
        )
        for line_index, line in enumerate(ink_lines):
            lines.append((physical_page, line_index, line))

    assert len(lines) == 594
    assert sum(len(line) for _, _, line in lines) == 12956
    return lines, np.asarray(widths, dtype=np.int32)


def sample_line_initials(lines: list[tuple[int, int, list[int]]],
                         observed: float, trials: int = 50000) -> dict:
    rng = np.random.default_rng(SAMPLE_SEED)
    lengths = np.asarray([len(line) for _, _, line in lines], dtype=np.int32)
    n_lines = len(lines)
    rectangular = np.zeros((n_lines, max(lengths)), dtype=np.int16)
    for i, (_, _, line) in enumerate(lines):
        rectangular[i, :len(line)] = line

    exceed, max_ioc, sum_ioc, sum_sq = 0, 0.0, 0.0, 0.0
    batch_size = 1000
    for start in range(0, trials, batch_size):
        batch = min(batch_size, trials - start)
        positions = (rng.random((batch, n_lines)) *
                     lengths[np.newaxis, :]).astype(np.intp)
        picked = rectangular[np.arange(n_lines)[np.newaxis, :], positions]
        counts = np.zeros((batch, 29), dtype=np.int32)
        np.add.at(counts, (
            np.arange(batch)[:, np.newaxis], picked
        ), 1)
        values = (np.sum(counts * (counts - 1), axis=1) /
                  (n_lines * (n_lines - 1)))
        exceed += int(np.count_nonzero(values >= observed))
        max_ioc = max(max_ioc, float(values.max()))
        sum_ioc += float(values.sum())
        sum_sq += float(np.square(values).sum())

    mean = sum_ioc / trials
    return {
        "trials": trials,
        "seed": SAMPLE_SEED,
        "exceed": exceed,
        "empirical_add_one_p": (exceed + 1) / (trials + 1),
        "mean": mean,
        "sd": float(np.sqrt(max(0, sum_sq / trials - mean * mean))),
        "largest_ioc": max_ioc,
    }


def printed_line_boxes(physical_page: int) -> list[tuple[int, int, int, int]]:
    image_path = ROOT / f"{physical_page + 17:02}.jpg"
    with Image.open(image_path) as image:
        assert image.size == (2400, 3600)
        assert image.mode == "L", f"expected original grayscale page {physical_page}"
        ink = np.asarray(image)[450:3100, 500:2050] < 115

    y_pixels = np.flatnonzero(ink.sum(axis=1) > 15)
    groups: list[list[int]] = []
    for y in y_pixels:
        index = int(y)
        if groups and index - groups[-1][-1] < 3:
            groups[-1].append(index)
        else:
            groups.append([index])

    bounds = []
    for group in groups:
        if group[-1] - group[0] < 65:
            continue
        projection = ink[group[0]:group[-1] + 1, :].any(axis=0)
        x_pixels = np.flatnonzero(projection) + 500
        bounds.append((
            450 + group[0], 450 + group[-1],
            int(x_pixels.min()), int(x_pixels.max())
        ))
    assert len(bounds) == 12, f"page {physical_page}: {len(bounds)} bands"
    return bounds


def glyph_width_wrap_gate(lines: list[tuple[int, int, list[int]]],
                          widths: np.ndarray) -> dict:
    source_lines: dict[int, list[list[int]]] = {}
    for page, _, line in lines:
        source_lines.setdefault(page, []).append(line)

    labels, ends, following_width = [], [], []
    for page in CLEAN_PAGES:
        assert len(source_lines[page]) == 12
        boxes = printed_line_boxes(page)
        for j in range(11):
            labels.append((page, j))
            ends.append(boxes[j][3])
            following_width.append(int(widths[source_lines[page][j + 1][0]]))

    endpoints = np.asarray(ends)
    starts = np.asarray(following_width)
    candidate = CANDIDATE_RIGHT_EDGES
    fits = (endpoints[:, None] <= candidate[None, :]) & (
        endpoints[:, None] + starts[:, None] > candidate[None, :]
    )
    observed = fits.sum(axis=0)
    best_count = int(observed.max())
    best_right_edge = int(candidate[int(np.argmax(observed))])
    assert best_count == 104
    assert best_right_edge == 1792

    training = np.asarray([page < 22 for page, _ in labels])
    train_fit = fits[training].sum(axis=0)
    fit_right_edge = int(candidate[int(np.argmax(train_fit))])
    held_out = int(np.count_nonzero(
        (endpoints[~training] <= fit_right_edge) &
        (endpoints[~training] + starts[~training] > fit_right_edge)
    ))
    assert fit_right_edge == 1792
    assert held_out == 41

    # Source-match permutation null. Reshuffle which next rune width occurs
    # after each printed original line, optimizing W anew each time.
    rng = np.random.default_rng(SAMPLE_SEED)
    eligible_left = endpoints[:, None] <= candidate[None, :]
    null_counts = np.empty(20000, dtype=np.int16)
    for j in range(len(null_counts)):
        shuffled = rng.permutation(starts)
        counts = np.sum(eligible_left & (
            endpoints[:, None] + shuffled[:, None] > candidate[None, :]
        ), axis=0)
        null_counts[j] = int(counts.max())
    exceed = int(np.count_nonzero(null_counts >= best_count))

    exceptions = [
        {"page": p, "line_zero_based": j, "line_ink_right": int(end),
         "next_rune_ink_width": int(width)}
        for (p, j), end, width in zip(labels, ends, following_width)
        if not (end <= best_right_edge < end + width)
    ]

    return {
        "clean_original_pages": list(CLEAN_PAGES),
        "transitions": len(endpoints),
        "width_vs_previous_right_margin_pearson": float(np.corrcoef(
            1800 - endpoints, starts
        )[0, 1]),
        "training_fits": int(train_fit.max()),
        "training_total": int(training.sum()),
        "training_best_W": fit_right_edge,
        "independent_holdout_fits": held_out,
        "independent_holdout_total": int((~training).sum()),
        "whole_source_best_fits": best_count,
        "whole_source_best_W": best_right_edge,
        "source_exceptions": exceptions,
        "permutations": len(null_counts),
        "permutation_best_fit_null_mean": float(null_counts.mean()),
        "permutation_best_fit_null_99pct": float(np.quantile(null_counts, 0.99)),
        "permutation_exceed": exceed,
        "permutation_add_one_p": (exceed + 1) / (len(null_counts) + 1),
    }


def main() -> None:
    lines, widths = original_line_rows()
    starts = np.asarray([line[0] for _, _, line in lines])
    ends = np.asarray([line[-1] for _, _, line in lines])
    corpus = json.loads((ROOT / "lp2-corpus.json").read_text(encoding="utf-8"))
    all_runes = np.asarray([
        x for page in corpus["pages"] if page["page"] <= 55
        for x in page["indices"]
    ])
    total_frequency = np.bincount(all_runes, minlength=29)
    initial_frequency = np.bincount(starts, minlength=29)
    excess = initial_frequency - (
        len(starts) * total_frequency / len(all_runes)
    )

    outcome = {
        "source": "original LP2 printed rune lines and original JPG image bytes",
        "printed_unknown_lines": len(lines),
        "original_symbols_reconstructed": len(all_runes),
        "first_rune_ioc": coincidence(starts),
        "last_rune_ioc": coincidence(ends),
        "all_unknown_rune_ioc": coincidence(all_runes),
        "first_rune_width_excess_pearson": float(np.corrcoef(
            widths, excess
        )[0, 1]),
        "line_initial_random-position_null": sample_line_initials(
            lines, coincidence(starts)
        ),
        "actual_JPEG_line_width_test": glyph_width_wrap_gate(lines, widths),
        "recovered_plaintext": False,
    }
    print(json.dumps(outcome, indent=2))


if __name__ == "__main__":
    main()
