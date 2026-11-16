"""Original p56 five-dot vs five main Cassiopeia stars: source-position gate.

Uses original LP2 scan 73.jpg and published J2000 stellar coordinates.
No ciphertext or language score is used in fitting the celestial geometry.
Requires NumPy and OpenCV.
"""
from hashlib import sha256
from itertools import permutations
from pathlib import Path

import cv2
import numpy as np

SRC = Path(__file__).resolve().parents[1] / "resources" / "liber-primus" / "73.jpg"
SHA = "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc"


def observed_dots():
    raw = SRC.read_bytes()
    assert sha256(raw).hexdigest() == SHA
    image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400)
    section = (image[2300:2850, 680:1850] < 160).astype(np.uint8)
    count, _, stats, points = cv2.connectedComponentsWithStats(section)
    original_points = [
        (680 + xy[0], 2300 + xy[1])
        for size, xy in zip(stats[1:count, cv2.CC_STAT_AREA], points[1:count])
        if 3000 <= size <= 5000
    ]
    assert len(original_points) == 5, original_points
    return np.array(sorted(original_points), dtype=np.float64)


def cassiopeia_gnomonic():
    # Ordered beta (Caph), alpha (Schedar), gamma (Cih),
    # delta (Ruchbah), epsilon (Segin). Source: Farinacci star table.
    ra_h = np.array([
        9/60 + 10.6/3600,
        40/60 + 30.4/3600,
        56/60 + 42.4/3600,
        1 + 25/60 + 48.9/3600,
        1 + 54/60 + 23.6/3600,
    ])
    dec_deg = np.array([
        59 + 8/60 + 59/3600,
        56 + 32/60 + 15/3600,
        60 + 43/60,
        60 + 14/60 + 7/3600,
        63 + 40/60 + 13/3600,
    ])
    ra, dec = np.deg2rad(ra_h * 15), np.deg2rad(dec_deg)
    ra0, dec0 = ra.mean(), dec.mean()
    d = np.sin(dec0) * np.sin(dec) + np.cos(dec0) * np.cos(dec) * np.cos(ra-ra0)
    return np.column_stack((
        np.cos(dec) * np.sin(ra-ra0) / d,
        (np.cos(dec0)*np.sin(dec) - np.sin(dec0)*np.cos(dec)*np.cos(ra-ra0)) / d,
    ))


def affine_error(stars, dots):
    mat = np.column_stack((stars, np.ones(len(stars))))
    transform = np.linalg.lstsq(mat, dots, rcond=None)[0]
    residual = np.linalg.norm(mat @ transform - dots, axis=1)
    return float(np.sqrt(np.mean(residual**2))), float(residual.max())


def sky_gnomonic(stars):
    """Five J2000 (RA hours, Dec degrees) points on a common tangent plane."""
    ra = np.deg2rad(np.array([r * 15 for r, _ in stars]))
    dec = np.deg2rad(np.array([d for _, d in stars]))
    ra0, dec0 = ra.mean(), dec.mean()
    divisor = np.sin(dec0) * np.sin(dec) + np.cos(dec0) * np.cos(dec) * np.cos(ra-ra0)
    return np.column_stack((
        np.cos(dec) * np.sin(ra-ra0) / divisor,
        (np.cos(dec0)*np.sin(dec) - np.sin(dec0)*np.cos(dec)*np.cos(ra-ra0)) / divisor,
    ))


def southern_star_sets():
    """ICRS/J2000 sky coordinates: Crux and two navigational Centaurus pointers.

    Crux alpha..delta: freestarcharts.com/crux.
    Crux epsilon: en.wikipedia.org/wiki/Epsilon_Crucis (Hipparcos).
    Alpha/Beta Cen: standard ICRS positions rounded to 0.01s.
    """
    cru = [
        (12 + 26/60 + 35.895/3600, -(63 + 5/60 + 56.7343/3600)),
        (12 + 47/60 + 43.26877/3600, -(59 + 41/60 + 19.5792/3600)),
        (12 + 31/60 + 9.95961/3600, -(57 + 6/60 + 47.5684/3600)),
        (12 + 15/60 + 9/3600, -(58 + 44/60 + 56/3600)),
        (12 + 21/60 + 21.608/3600, -(60 + 24/60 + 4.13/3600)),
    ]
    cen = [
        (14 + 39/60 + 36.494/3600, -(60 + 50/60 + 2.37/3600)),
        (14 + 3/60 + 49.4/3600, -(60 + 22/60 + 23/3600)),
    ]
    return sky_gnomonic(cru), sky_gnomonic(cru[:3] + cen)


def southern_fits(dots):
    crux, crux_pointers = southern_star_sets()
    all_assignments = tuple(permutations(range(5)))
    crux_min = min((affine_error(crux, dots[list(p)])[0], p)
                   for p in all_assignments)
    pointers_min = min((affine_error(crux_pointers, dots[list(p)])[0], p)
                       for p in all_assignments)
    # Independently observed 3+2 grouping: first 3 physical x positions -> Crux,
    # last two -> Alpha/Beta Centauri. No interleaved star assignment allowed.
    three_two_min = min(
        (affine_error(crux_pointers, dots[list(a+b)])[0], a+b)
        for a in permutations(range(3))
        for b in permutations((3, 4))
    )
    return crux_min, pointers_min, three_two_min



def main():
    dots = observed_dots()
    stars = cassiopeia_gnomonic()
    natural, worst = affine_error(stars, dots)
    diameter = max(np.linalg.norm(a-b) for a in dots for b in dots)
    best = min((affine_error(stars, dots[list(p)])[0], p)
               for p in permutations(range(5)))
    synthetic = np.column_stack((stars, np.ones(5))) @ np.array([
        [300, 50], [-100, 280], [1200, 1000],
    ])
    planted, _ = affine_error(stars, synthetic)
    assert planted < 1e-9
    assert 85 < natural < 93, natural
    assert 75 < best[0] < 82, best
    print("Source centroids, absolute pixels:", np.round(dots, 2).tolist())
    print(f"Natural affine RMS={natural:.5f}px, max point error={worst:.5f}px, "
          f"dot-span={diameter:.5f}px, normalized={natural/diameter:.6f}")
    print("Best over all 120 freely permuted matches (postselected):", best)
    print("Synthetic positive control RMS:", planted)

    crux_min, pointer_min, three_two_min = southern_fits(dots)
    assert 79 < crux_min[0] < 81, crux_min
    assert 62 < pointer_min[0] < 65, pointer_min
    assert 83 < three_two_min[0] < 87, three_two_min
    print("Crux principal alpha..epsilon, best of 120 arbitrary maps:", crux_min)
    print("Crux alpha,beta,gamma plus Centaurus alpha,beta, best of 120:", pointer_min)
    print("Same five stars, constrained visible three-left/two-right:", three_two_min)
    print("PASS: five principal Cassiopeia or Crux stars do not accurately reproduce "
          "the source five-dot diagram under the tested celestial projection.")


if __name__ == "__main__":
    main()
