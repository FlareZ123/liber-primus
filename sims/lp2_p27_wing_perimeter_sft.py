"""Original p27 wing perimeter/inner-region source test and one bounded p55 consumer.

Run from any directory on Windows 11: python sims/lp2_p27_wing_perimeter_sft.py
Requires opencv-python, numpy, scipy. Reads original repo sources only.
"""
from pathlib import Path
from hashlib import sha256
from collections import Counter
import json
import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'resources' / 'liber-primus' / '44.jpg'
SOURCE_SHA256 = 'c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e'


def perimeter_faces(gray: np.ndarray, level: int):
    x0, y0, x1, y1 = 520, 450, 1940, 930
    gray = gray[y0:y1, x0:x1]
    white = (gray > level).astype(np.uint8)
    n, labels, stats, cent = cv2.connectedComponentsWithStats(white, 8)
    faces = sorted((i for i in range(1, n)
        if stats[i, cv2.CC_STAT_AREA] >= 200
        and stats[i, cv2.CC_STAT_LEFT] > 0
        and stats[i, cv2.CC_STAT_TOP] > 0
        and stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] < white.shape[1]
        and stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] < white.shape[0]),
        key=lambda i: cent[i, 0])
    assert len(faces) == 15, (level, len(faces))
    numbered = np.zeros_like(labels, dtype=np.uint8)
    for i, face in enumerate(faces, 1):
        numbered[labels == face] = i
    distance, nearest = distance_transform_edt(numbered == 0, return_indices=True)
    near = numbered[nearest[0], nearest[1]]
    contours, _ = cv2.findContours((gray <= level).astype(np.uint8),
                                  cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    outside = max(contours, key=cv2.contourArea)[:, 0, :]
    xs, ys = outside[:, 0], outside[:, 1]
    along = np.where(distance[ys, xs] <= 50, near[ys, xs], 0)
    changes = np.flatnonzero(np.roll(along, 1) != along)
    along = np.roll(along, -int(changes[0]))
    runs = [(int(group[0]), len(group)) for group in
            np.split(along, np.flatnonzero(along[1:] != along[:-1]) + 1)]
    ring = [label for label, length in runs if label and length >= 12]
    return ring, sorted(set(range(1, 16)) - set(ring)), runs


def ioc(values):
    freq = Counter(values)
    return sum(n * (n - 1) for n in freq.values()) / (len(values) * (len(values) - 1))


def column_read(text, columns):
    return [text[15 * row + col] for col in columns for row in range(5)]


def column_fill(text, columns):
    output = [0] * 75
    values = iter(text)
    for col in columns:
        for row in range(5):
            output[15 * row + col] = next(values)
    return output


def main():
    original = SOURCE.read_bytes()
    assert sha256(original).hexdigest() == SOURCE_SHA256
    gray = cv2.imdecode(np.frombuffer(original, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert gray.shape == (3600, 2400)
    rim = [1, 2, 5, 7, 4, 8, 11, 12, 14, 15, 13, 10, 3]
    for level in (80, 120, 160, 200, 235):
        observed, inside, runs = perimeter_faces(gray, level)
        assert observed == rim, (level, observed)
        assert inside == [6, 9], (level, inside)
        print(f'gray>{level}: rim={observed}, interior={inside}, contour runs={len(runs)}')

    corpus = json.loads((ROOT / 'resources' / 'liber-primus' / 'lp2-corpus.json').read_text(encoding='utf-8'))
    p27 = corpus['pages'][27]['indices']
    p55 = corpus['pages'][55]['indices']
    assert len(p27) == 234 and len(p55) == 76 and p55[0] == 21
    assert abs(ioc(p27) - 0.03393125710722277) < 1e-14
    source = p55[1:]
    assert len(source) == 75 and abs(ioc(source) - 0.03855855855855856) < 1e-14

    # Investigator-chosen, NOT source-instructed, entire 15-cell shell order.
    shell = rim + [6, 9]
    order = [face - 1 for face in shell]
    candidates = [column_fill(source, order), column_read(source, order),
                  column_fill(source, order[::-1]), column_read(source, order[::-1])]
    assert all(column_read(column_fill(source, cols), cols) == source
               for cols in (order, order[::-1]))
    assert all(column_fill(column_read(source, cols), cols) == source
               for cols in (order, order[::-1]))
    heads = ['AEBSW', 'AEIAP', 'JIGGS', 'SEAI']
    for i, decoded in enumerate(candidates):
        translit = ''.join(corpus['translit'][r] for r in decoded)
        assert translit.startswith(heads[i]), (i, translit[:15])
        assert abs(ioc(decoded) - ioc(source)) < 1e-15
        print(f'p55 wing-shell trial {i}: {translit}')
    print(f'p27 IoC {ioc(p27):.12f}; true p55 body IoC {ioc(source):.12f}')
    print('PASS: thirteen perimeter and two inner cells; no authenticated key or plaintext')


if __name__ == '__main__':
    main()
