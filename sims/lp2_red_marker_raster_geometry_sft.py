"""Read-only original LP2 red-marker raster geometry check.

Requires Pillow, NumPy and SciPy. Reads original 17.jpg through 74.jpg
from resources/liber-primus. Neither image nor text is modified.
"""

from collections import defaultdict
from pathlib import Path
import argparse
import numpy as np
from PIL import Image
from scipy import ndimage


def red_mask(image):
    a = np.asarray(image.convert('RGB'), dtype=np.int16)
    return ((a[:, :, 0] > 90) & (a[:, :, 0] > 1.4*a[:, :, 1])
            & (a[:, :, 0] > 1.4*a[:, :, 2])
            & (a[:, :, 1] < 100) & (a[:, :, 2] < 100))


def small_square_components(mask):
    labels, _ = ndimage.label(mask)
    dots = []
    for i, bounds in enumerate(ndimage.find_objects(labels), 1):
        if bounds is None:
            continue
        y1, y2 = bounds[0].start, bounds[0].stop
        x1, x2 = bounds[1].start, bounds[1].stop
        w, h = x2-x1, y2-y1
        if 8 <= w <= 11 and 8 <= h <= 11:
            size = np.count_nonzero(labels[bounds] == i)
            if 75 <= size <= 110:
                dots.append((x1, y1, w, h))
    return dots


def marker_groups(dots):
    if not dots:
        return []
    centres = np.array([[x+w/2, y+h/2] for x, y, w, h in dots])
    parents = list(range(len(dots)))

    def root(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    for i in range(len(dots)):
        for j in range(i+1, len(dots)):
            if np.linalg.norm(centres[i]-centres[j]) <= 26:
                parents[root(i)] = root(j)
    groups = defaultdict(list)
    for i, dot in enumerate(dots):
        groups[root(i)].append(dot)
    return [sorted(g, key=lambda d: (d[1], d[0])) for g in groups.values()
            if len(g) in (10, 13)]


def relative_centres(group):
    x0 = min(d[0] for d in group)
    y0 = min(d[1] for d in group)
    xy = np.array([[x+w/2-x0, y+h/2-y0] for x, y, w, h in group])
    return x0, y0, xy


def main(source):
    classes = defaultdict(list)
    for page in range(58):
        filename = source / f'{page+17:02}.jpg'
        with Image.open(filename) as image:
            assert image.size == (2400, 3600), filename
            mask = red_mask(image)
        for group in marker_groups(small_square_components(mask)):
            x, y, coords = relative_centres(group)
            classes[len(group)].append((page, x, y, coords))
    assert set(classes) == {10, 13}, sorted(classes)
    assert [len(classes[13]), len(classes[10])] == [30, 4]
    assert [sum(r[0] <= 55 for r in classes[n]) for n in (13, 10)] == [27, 3]
    for n in (13, 10):
        cases = classes[n]
        xy = np.array([r[3] for r in cases])
        centre = np.median(xy, axis=0)
        err = np.abs(xy-centre)
        assert err.max() <= 1.0, (n, err.max())
        print(f'{n}-dot: {len(cases)} all LP2, '
              f'{sum(r[0] <= 55 for r in cases)} unsolved LP2, '
              f'max relative dot-centre variation {err.max():.1f} pixel')
        print('  source locations page,x,y:', [(p, x, y) for p, x, y, _ in cases])
        # A visibly shifted dot is distinct from the observed raster family.
        plant = xy[0].copy()
        plant[0, 0] += 4
        assert abs(plant-centre).max() >= 3
    print('PASS: all 34 isolated red 13/10 markers use a common dot layout '
          'within the one-pixel raster quantization envelope')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path,
                        default=Path('resources/liber-primus'))
    args = parser.parse_args()
    main(args.source)
