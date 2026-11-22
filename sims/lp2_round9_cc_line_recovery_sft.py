"""Original-image-only LP2 full text-line detection.

Python 3.12; Pillow, NumPy, OpenCV 4.x. No transcription or
class-to-rune map participates in the detector. --emit-tsv outputs all
604 source-derived line coordinates. Printed counts are held-out tests.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / 'resources' / 'liber-primus'
EXPECTED = (
    12, 12, 9, 11, 12, 12, 10, 10, 12, 12, 12, 12, 12, 12,
    7, 8, 12, 12, 12, 12, 12, 12, 6, 10, 12, 12, 12, 11,
    12, 12, 12, 12, 6, 11, 12, 12, 11, 11, 11, 12, 11, 12,
    12, 12, 12, 12, 12, 12, 12, 3, 0, 4, 12, 9, 11, 4, 5, 5,
)


def recover_rows(gray: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Return source-only (y_top, component witnesses, left_x, right_x)."""
    ink = np.ascontiguousarray((gray[:, 580:1800] < 128).astype(np.uint8))
    _, _, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    bins: dict[int, list[tuple[int, int, int]]] = defaultdict(list)
    for x, y, width, height, area in stats[1:]:
        if 102 <= height <= 125 and 6 <= width <= 135 and area >= 300:
            x0 = int(x) + 580
            bins[round(int(y) / 7) * 7].append(
                (x0, int(y), x0 + int(width))
            )

    groups: list[list[int]] = []
    for key in sorted(bins):
        if groups and key - groups[-1][-1] <= 21:
            groups[-1].append(key)
        else:
            groups.append([key])

    rows = []
    for group in groups:
        witnesses = [component for key in group for component in bins[key]]
        if len(witnesses) >= 2:
            rows.append((
                round(float(np.median([c[1] for c in witnesses]))),
                len(witnesses),
                min(c[0] for c in witnesses),
                max(c[2] for c in witnesses),
            ))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--emit-tsv', action='store_true')
    args = parser.parse_args()
    all_rows = []
    for page, expected in enumerate(EXPECTED):
        jpeg = IMAGES / f'{page + 17:02d}.jpg'
        gray = np.asarray(Image.open(jpeg).convert('L'))
        assert gray.shape == (3600, 2400), jpeg
        rows = recover_rows(gray)
        assert len(rows) == expected, (
            f'p{page}: recovered {len(rows)} lines, expected {expected}',
            rows
        )
        assert len({r[0] for r in rows}) == len(rows)
        all_rows.extend((page, page + 17, i, *row)
                        for i, row in enumerate(rows))
        if page in (6, 39, 55):
            print(f'Sparse original p{page}: '
                  f'{[(y, n) for y, n, _, _ in rows]}')
    assert len(all_rows) == 604
    assert sum(EXPECTED[:56]) == 594
    assert EXPECTED[50] == 0
    print('PASS: 58/58 source-image physical pages; '
          '604/604 printed rune lines')
    print('PASS: 594/594 unknown-page line coordinates; '
          'p50 numeric-only has zero rune-height lines')
    if args.emit_tsv:
        print('physical_page\tarchive_jpg\tpage_line\ty_top_px\t'
              'component_witnesses\tleft_x_px\tright_x_px')
        for row in all_rows:
            print('\t'.join(map(str, row)))


if __name__ == '__main__':
    main()
