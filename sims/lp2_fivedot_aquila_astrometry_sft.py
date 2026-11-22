"""Original LP2 p23 five-dot constellation geometry. Read-only source SFT.

Run on Windows: python sims/lp2_fivedot_aquila_astrometry_sft.py
Requires Pillow. No plaintext, key or authored star map is claimed.
"""
from hashlib import sha256
from itertools import permutations
from pathlib import Path
import json
import math
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus" / "40.jpg"
SHA = "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee"
SEEDS = [(797, 568), (993, 507), (1297, 807), (1479, 546), (1527, 738)]

def source_centroids():
    assert sha256(SOURCE.read_bytes()).hexdigest() == SHA
    image = Image.open(SOURCE).convert("L")
    assert image.size == (2400, 3600)
    points = []
    for x0, y0 in SEEDS:
        pixels = [(x, y) for y in range(y0 - 43, y0 + 44)
                  for x in range(x0 - 43, x0 + 44)
                  if image.getpixel((x, y)) < 90]
        assert 3000 < len(pixels) < 4000
        points.append((sum(x for x, _ in pixels) / len(pixels),
                       sum(y for _, y in pixels) / len(pixels)))
    return points

def ra(h, m, s):
    return 15 * (h + m / 60 + s / 3600)

def dec(sign, d, m, s):
    return sign * (d + m / 60 + s / 3600)

# J2000 catalog RA and Dec. Sources and candidate-selection caveats are
# given in im-results/lp2-fivedot-aquila-astrometry-original-gate.md.
AQUILA = [
    ("Altair/alpha", ra(19, 50, 46.999), dec(1, 8, 52, 5.96)),
    ("Tarazed/gamma", ra(19, 46, 15.580), dec(1, 10, 36, 47.74)),
    ("Delta", ra(19, 25, 29.902), dec(1, 3, 6, 53.20)),
    ("Iota/Al Thalimain", ra(19, 36, 43.2777), dec(-1, 1, 17, 11.759)),
    ("Eta", ra(19, 52, 28.369), dec(1, 1, 0, 20.372)),
]
LAMBDA = ("Lambda/Al Thalimain", ra(19, 6, 14.939), dec(-1, 4, 52, 57.23))
CASSIOPEIA = [
    ("Epsilon", ra(1, 54, 23.73409), dec(1, 63, 40, 12.36)),
    ("Delta", ra(1, 25, 48.986), dec(1, 60, 14, 7.5)),
    ("Gamma", ra(0, 56, 42.514), dec(1, 60, 43, 0.3)),
    ("Alpha", ra(0, 40, 30.465), dec(1, 56, 32, 14)),
    ("Beta", ra(0, 9, 10.719), dec(1, 59, 8, 59)),
]
CATALOGS = {
    "aquila_iota": AQUILA,
    "aquila_lambda": [AQUILA[0], AQUILA[1], AQUILA[2], LAMBDA, AQUILA[4]],
    "cassiopeia_bright_five": CASSIOPEIA,
}

def centered(values):
    mean = sum(values) / len(values)
    return [v - mean for v in values]

def star_plane(stars):
    mean_dec = sum(item[2] for item in stars) / len(stars)
    cos_dec = math.cos(math.radians(mean_dec))
    return centered([complex(r * cos_dec, d) for _, r, d in stars])

def closest_fit(stars, points):
    """All 5! labels, rotations, and reflections; one isotropic scale.

    Normalized RMS is sqrt(1-rho^2), where rho is the optimal centered
    complex correlation. Zero means an exactly similar five-point shape.
    """
    a = star_plane(stars)
    b = centered([complex(x, y) for x, y in points])
    denom = math.sqrt(sum(abs(z)**2 for z in a) *
                      sum(abs(z)**2 for z in b))
    best = (float("inf"), None, None)
    for order in permutations(range(5)):
        z = [a[i] for i in order]
        rotation = abs(sum(v.conjugate() * w for v, w in zip(z, b)))
        reflection = abs(sum(v * w for v, w in zip(z, b)))
        for numerator, orientation in [(rotation, "rotation"),
                                       (reflection, "reflection")]:
            residual = math.sqrt(max(0, 1 - (numerator / denom)**2))
            if residual < best[0]:
                best = (residual, order, orientation)
    return {"normalized_rms": best[0],
            "left_to_right_stars": [stars[i][0] for i in best[1]],
            "orientation": best[2]}

def y_permutation_control(stars, points):
    """Exact 120 controls retain x positions and the multiset of y values."""
    original = closest_fit(stars, points)["normalized_rms"]
    xs, ys = zip(*points)
    null = [closest_fit(stars, list(zip(xs, p)))["normalized_rms"]
            for p in permutations(ys)]
    return {"extreme_or_better": sum(v <= original + 1e-12 for v in null),
            "total_layouts": len(null),
            "mean_layout_rms": sum(null) / len(null)}

def main():
    points = source_centroids()
    witness = star_plane(AQUILA)
    # Positive control: genuinely reflected, rotated, translated source.
    planted = [(z.conjugate() * (17 + 5j) + (1300 + 500j))
               for z in witness]
    assert closest_fit(AQUILA,
                       [(z.real, z.imag) for z in planted])["normalized_rms"] < 1e-7
    results = {
        name: {**closest_fit(stars, points),
               "y_permutation_control": y_permutation_control(stars, points)}
        for name, stars in CATALOGS.items()
    }
    assert abs(results["aquila_iota"]["normalized_rms"] -
               0.18782839888423106) < 1e-9
    assert abs(results["aquila_lambda"]["normalized_rms"] -
               0.31115929624671507) < 1e-9
    assert abs(results["cassiopeia_bright_five"]["normalized_rms"] -
               0.2668998167726436) < 1e-9
    assert [results[k]["y_permutation_control"]["extreme_or_better"]
            for k in CATALOGS] == [2, 27, 23]
    print(json.dumps({"original": "LP2 p23, resources/liber-primus/40.jpg",
                      "sha256": SHA, "five_source_centroids": points,
                      "catalog_fit": results, "recovered_plaintext": False,
                      "warning": "Retrospective, approximate star candidate. "
                                 "No authorial decoding instruction."},
                     indent=2))

if __name__ == "__main__":
    main()
