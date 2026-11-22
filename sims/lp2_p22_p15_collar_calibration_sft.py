#!/usr/bin/env python3
"""Source-pixel LP2 p22 / p15 collar-prime calibration. Requires numpy, Pillow, scipy.

The corpus-wide test is a broad visual-landmark opportunity census, not a
shape-matched null or a genuinely blinded human measurement.
"""
import argparse
import hashlib
import io
import itertools
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

PRIMES = np.array((2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463,
                   829, 1481, 2593, 4507, 7817))
PAIRS = np.column_stack((PRIMES[:-1], PRIMES[1:]))
COLLARS = ((660, 870), (940, 1120), (1400, 1620))
P22_SHA256 = "e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7"


def load_scans(archive):
    scans = {}
    if archive:
        with ZipFile(archive) as z:
            for name in z.namelist():
                if name.endswith('.jpg'):
                    scans[int(Path(name).stem)] = z.read(name)
    else:
        directory = Path(__file__).resolve().parent.parent / 'resources/liber-primus'
        for index in range(75):
            scans[index] = (directory / f'{index:02d}.jpg').read_bytes()
    assert set(scans) == set(range(75)), "Expected original scans 00..74"
    assert hashlib.sha256(scans[39]).hexdigest() == P22_SHA256
    return scans


def source_centroids(gray, threshold, y0, y1):
    """Reproduce previously selected x-windows with one pixel estimator."""
    density = np.count_nonzero(gray[y0:y1, 580:1840] < threshold, axis=0)
    centers = []
    for left, right in COLLARS:
        xs = np.arange(left, right)
        counts = density[left - 580:right - 580].astype(float)
        weights = np.maximum(counts - np.quantile(counts, .2), 0)
        centers.append(float(np.dot(xs, weights) / weights.sum()))
    gaps = np.diff(centers)
    return gaps.tolist(), float(np.linalg.norm(gaps - PAIRS[9]))


def familywise(scans, threshold, step):
    hits = []
    triplets = 0
    p22_best = (float('inf'), None)
    for scan, data in sorted(scans.items()):
        with Image.open(io.BytesIO(data)) as source:
            reduced = source.convert('L').resize((1200, 1800), Image.Resampling.BOX)
            mask = np.asarray(reduced) < threshold
        for y in range(100, 1500, step):
            column_ink = mask[y:y + 208].sum(axis=0).astype(float)
            smoothed = gaussian_filter1d(column_ink, 7.5)
            peaks, _ = find_peaks(smoothed, prominence=15, distance=60, width=10)
            peaks = peaks[(peaks >= 120) & (peaks <= 1080)]
            for first, second, third in itertools.combinations(peaks, 3):
                gaps = np.array((2 * (second-first), 2 * (third-second)))
                if np.any(gaps < 120):
                    continue
                triplets += 1
                differences = PAIRS - gaps
                errors = np.hypot(differences[:, 0], differences[:, 1])
                pair = int(np.argmin(errors))
                error = float(errors[pair])
                record = (scan, 2*y, 2*int(first), 2*int(second),
                          2*int(third), int(gaps[0]), int(gaps[1]), pair, error)
                if scan == 39 and error < p22_best[0]:
                    p22_best = error, record
                if error <= 5.25:
                    hits.append(record)
    return triplets, hits, p22_best[1]


def planted_control():
    """A three-band source-scale illustration checks that detection is live."""
    image = Image.new('RGB', (2400, 3600), 'white')
    ink = ImageDraw.Draw(image)
    for x in (500, 763, 1226):
        ink.rectangle((x - 25, 1250, x + 25, 1530), fill='black')
    ink.rectangle((450, 1360, 1270, 1390), fill='black')
    stream = io.BytesIO()
    image.save(stream, format='JPEG', quality=95)
    _, hits, _ = familywise({99: stream.getvalue()}, 130, 50)
    assert hits and all(hit[7] == 9 for hit in hits)
    print('synthetic three-collar positive:', len(hits), 'detections')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip', type=Path, help='archive containing original 00..74.jpg')
    args = parser.parse_args()
    planted_control()
    scans = load_scans(args.zip)
    with Image.open(io.BytesIO(scans[39])) as source:
        gray = np.asarray(source.convert('L'))
    assert gray.shape == (3600, 2400)
    for y0, y1 in ((2215, 2630), (2250, 2570), (2300, 2500)):
        gaps, error = source_centroids(gray, 130, y0, y1)
        print('centroid y', y0, y1, 'gaps', [round(v, 3) for v in gaps],
              'p15 pair error', round(error, 3))
    for threshold in (90, 130, 170):
        triplets, hits, p22 = familywise(scans, threshold, 50)
        print('family', threshold, 'candidates', triplets, 'hits', len(hits),
              'distinct scans', len({x[0] for x in hits}), 'p22 best', p22)
        if threshold == 130:
            assert triplets == 31210
            assert len(hits) == 14
            assert len({x[0] for x in hits}) == 11
            assert p22[5:8] == (250, 454, 9)
            assert any(x[0] == 51 and x[5:8] == (264, 462, 9)
                       for x in hits)
    print('PASS: source pixels calibrated; no source-selected decipherment.')


if __name__ == '__main__':
    main()
