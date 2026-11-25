#!/usr/bin/env python3
"""Source-only geometry gate for #2797. No ciphertext or key search.
Run with optional original-JPEG zip path, otherwise resources/liber-primus.
"""
import json
import sys
import zipfile
from pathlib import Path

import cv2
import numpy as np

# Art-containing row bands from the original layout, chosen without cipher values.
# p5 is the candidate parent. Other LP1 examples are ordinary reuse controls.
BANDS = {5: (1450, 1900), 9: (1850, 2250), 13: (1000, 1400),
         16: (1400, 1800), 19: (2500, 3050),
         70: (2500, 3250), 72: (2600, 3300)}


def load(n, source):
    filename = f'{n:02d}.jpg'
    if source.is_file():
        with zipfile.ZipFile(source) as z:
            data = z.read(next(p for p in z.namelist() if p.endswith('/'+filename)))
    else:
        data = (source / filename).read_bytes()
    a = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert a.shape == (3600, 2400)
    return a


def gate(a, band, x0, x1, threshold):
    lo, hi = band
    occupied = np.flatnonzero((a[:, x0:x1] < threshold).any(axis=1))
    before = occupied[occupied < lo]
    within = occupied[(occupied >= lo) & (occupied < hi)]
    after = occupied[occupied >= hi]
    first, last = int(within[0]), int(within[-1])
    previous = int(before[-1]) if len(before) else -1
    following = int(after[0]) if len(after) else a.shape[0]
    # Half-open crop [top,bottom). Every choice keeps exactly the same
    # thresholded ink in the strip; the choices differ only in white padding.
    top_choices = first - previous
    bottom_choices = following - last
    return {'threshold': threshold, 'x': [x0, x1],
            'previous_ink_row': previous, 'first_art_row': first,
            'last_art_row': last, 'following_ink_row': following,
            'top_choices': top_choices, 'bottom_choices': bottom_choices,
            'equivalent_vertical_crops': top_choices * bottom_choices}


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'resources' / 'liber-primus'
    parent = load(5, source)
    exact = gate(parent, BANDS[5], 0, 2400, 255)
    assert exact['equivalent_vertical_crops'] > 30000
    # Verify all-white ambiguity directly, including unthresholded grayscale.
    p, f, l, q = (exact[k] for k in ('previous_ink_row', 'first_art_row', 'last_art_row', 'following_ink_row'))
    assert np.all(parent[p+1:f] == 255) and np.all(parent[l+1:q] == 255)
    # An artificial text-bearing intrusion within a white gap must shrink the
    # maximal source-only art interval, proving sensitivity to an ink boundary.
    plant = parent.copy()
    plant[f-20:f-10, 900:1000] = 0
    planted = gate(plant, BANDS[5], 0, 2400, 255)
    assert planted['first_art_row'] == f-20
    results = {str(n): gate(load(n, source), BANDS[n], 750, 1650, 140) for n in BANDS}
    print(json.dumps({'parent_exact_grayscale': exact, 'ordinary_crop_controls': results,
                      'planted_boundary_control': planted}, indent=2))


if __name__ == '__main__':
    main()
