#!/usr/bin/env python3
"""OCR-free line-geometry control on original Stage11 LP2 JPEGs.

Repository: python sims/lp2_line_geometry_gate.py
Owner ZIP: python sims/lp2_line_geometry_gate.py --zip path.zip
Requires numpy and Pillow; no OCR or inferred plaintext.
"""
import argparse
import io
import json
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

RIGHT_EDGE = 1792  # Fixed by an earlier original-image experiment.
SEED = 20261113
HELDOUT_PAGES = tuple(range(0, 15)) + tuple(range(40, 54))


def image_reader(zip_path):
    if zip_path:
        archive = zipfile.ZipFile(zip_path)
        names = set(archive.namelist())
        prefix = next(name[:-7] for name in names if name.endswith('/17.jpg'))
        def read(page):
            return Image.open(io.BytesIO(archive.read(f'{prefix}/{page + 17:02}.jpg'))).convert('L')
    else:
        root = Path(__file__).resolve().parent.parent / 'resources' / 'liber-primus'
        def read(page):
            return Image.open(root / f'{page + 17:02}.jpg').convert('L')
    return read


def bands_and_boxes(arr):
    ink = arr < 135
    projection = ink[450:3250, 720:1640].sum(axis=1)
    ys = np.flatnonzero(projection > 35) + 450
    groups = []
    for val in ys:
        y = int(val)
        if groups and y - groups[-1][-1] <= 25:
            groups[-1].append(y)
        else:
            groups.append([y])
    boxes = []
    for group in groups:
        y0, y1 = group[0], group[-1]
        if y1 - y0 < 46:
            continue
        cols = ink[y0:y1 + 1, 590:1830].sum(axis=0)
        x = np.flatnonzero(cols >= 3) + 590
        if len(x):
            boxes.append((int(x[0]), int(x[-1]), y0, y1))
    return boxes, ink


def first_ink_run_width(ink, box):
    x0, _, y0, y1 = box
    cols = ink[y0:y1 + 1, x0:x0 + 150].sum(axis=0) >= 3
    xs = np.flatnonzero(cols)
    if not len(xs):
        raise ValueError('Empty first glyph')
    last = int(xs[0])
    for i in xs[1:]:
        if int(i) - last > 2:
            break
        last = int(i)
    return last + 1


def geometry(zip_path=None, trials=20000):
    read = image_reader(zip_path)
    page_lines, blocks, clean_pages = {}, [], []
    lefts, pitches = [], []
    for page in range(58):
        arr = np.asarray(read(page))
        assert arr.shape == (3600, 2400), (page, arr.shape)
        boxes, ink = bands_and_boxes(arr)
        page_lines[page] = [
            dict(x0=b[0], x1=b[1], y0=b[2], y1=b[3]) for b in boxes
        ]
        clean = len(boxes) == 12 and all(
            109 <= y1 - y0 + 1 <= 117 and 597 <= x0 <= 608
            for x0, _, y0, y1 in boxes
        )
        if not clean:
            continue
        clean_pages.append(page)
        lefts.extend(b[0] for b in boxes)
        pitches.extend(boxes[i + 1][2] - boxes[i][2] for i in range(11))
        if page not in HELDOUT_PAGES:
            continue
        first = [first_ink_run_width(ink, b) for b in boxes]
        pairs = [(boxes[j][1], first[j + 1])
                 for j in range(11)
                 if boxes[j + 1][2] - boxes[j][2] <= 190]
        if pairs:
            blocks.append((page, np.asarray(pairs, dtype=np.int16)))

    observed = np.concatenate([block for _, block in blocks])
    def count(a, allowance, tolerance):
        return int(np.count_nonzero(
            (a[:, 0] <= RIGHT_EDGE + tolerance)
            & (a[:, 0] + a[:, 1] + allowance >= RIGHT_EDGE)
        ))

    rng = np.random.default_rng(SEED)
    null = np.empty(trials, dtype=np.int16)
    for trial in range(trials):
        shuffled = np.concatenate([
            np.column_stack((b[:, 0], rng.permutation(b[:, 1])))
            for _, b in blocks
        ])
        null[trial] = count(shuffled, 0, 0)
    strict = count(observed, 0, 0)
    near = count(observed, 4, 4)  # Descriptive ink-space and JPEG tolerance.
    exceptions = [
        {'page': p, 'line': i, 'right': int(b[i, 0]),
         'next_first_ink_width': int(b[i, 1])}
        for p, b in blocks for i in range(len(b))
        if not (b[i, 0] <= RIGHT_EDGE and b[i, 0] + b[i, 1] >= RIGHT_EDGE)
    ]
    exceed = int(np.count_nonzero(null >= strict))
    return {
        'source': 'Original LP2 JPEGs archive scans 17 through 74',
        'method': {
            'ink_cutoff': 135, 'row_dark_min': 35,
            'row_search_x': [720, 1640], 'row_search_y': [450, 3250],
            'row_join_gap': 25, 'row_min_height': 47,
            'ink_box_x': [590, 1830],
            'right_edge_frozen_px': RIGHT_EDGE, 'first_run_col_min_dark': 3
        },
        'clean_pages': clean_pages,
        'clean_line_starts': dict(sorted(Counter(lefts).items())),
        'clean_interline_pitches': dict(sorted(Counter(pitches).items())),
        'heldout_pages': [p for p, _ in blocks],
        'heldout_pairs': len(observed),
        'strict_fits': strict,
        'within_4px_ink_tolerance': near,
        'strict_page_preserving_null': {
            'trials': trials, 'seed': SEED, 'mean': float(null.mean()),
            'sd': float(null.std()), 'max': int(null.max()),
            'exceed': exceed,
            'add_one_upper_p': (exceed + 1) / (trials + 1),
        },
        'strict_exceptions': exceptions,
        'solved_page_boxes': {'56': page_lines[56], '57': page_lines[57]},
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip', default=None)
    args = parser.parse_args()
    print(json.dumps(geometry(args.zip), indent=2))
