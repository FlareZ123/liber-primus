"""Test the p32 inner-ring Möbius 4x7 decomposition as a tree-direction code.

Source constraints:
- p32's first row/column prime sums tile the original 563x569 signed 2016 image.
- The inner-5 perimeter side sums, in clockwise side order, form M over F29.
- M has four 7-cycles and two fixed points on P^1(F29), hence 28 moving states.
- An independent 2026 analysis models the LP2 adjacent-difference fingerprint as a
  28-symbol nonzero step alphabet. This test asks whether the p32 4-cycle / 7-phase
  decomposition predicts the tree image's local branch orientation.

The only tested mappings are the source-canonical cycle ID (four line directions)
and within-cycle phase (seven line directions). Cycle order: the trace-13 cycle
first, then remaining cycles by smallest finite member. Phase starts at 13 in that
cycle and at the smallest finite member in the others. Fixed points are no-direction
states. The permutation null shuffles the 100 source labels as intact (cycle, phase)
pairs, preserving the 13 fixed points and all label counts.

This is a bounded image-structure discriminator, not a decryption claim.
"""
import json
import math
import random
from bisect import bisect_right
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
SOURCE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
TRIALS = 100_000
SEED = 0x20161133
TEXT_THRESHOLD = 180


def cumulative(values):
    out = [0]
    for value in values:
        out.append(out[-1] + value)
    return out


def mobius(x, a=14, b=25, c=25, d=28):
    if x is None:
        return (a * pow(c, -1, 29)) % 29
    den = (c * x + d) % 29
    if den == 0:
        return None
    return ((a * x + b) * pow(den, -1, 29)) % 29


def canonical_cycles():
    states = set(range(29)) | {None}
    cycles = []
    starts = [13] + list(range(29)) + [None]
    for start in starts:
        if start not in states:
            continue
        cycle = []
        x = start
        while x in states:
            states.remove(x)
            cycle.append(x)
            x = mobius(x)
        assert x == start, (start, cycle, x)
        cycles.append(cycle)
    return cycles


def main():
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    page = corpus["pages"][32]
    assert page["page"] == 32 and len(page["indices"]) == 121
    prime_table = corpus["prime"]
    values = [prime_table[i] for i in page["indices"]]
    matrix = [values[r * 11:(r + 1) * 11] for r in range(11)]

    widths = matrix[0]
    heights = [matrix[r][0] for r in range(11)]
    assert widths == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert heights == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    assert sum(widths) == 563 and sum(heights) == 569

    inner = [row[3:8] for row in matrix[3:8]]
    north = sum(inner[0])
    east = sum(inner[r][4] for r in range(1, 4))
    south = sum(inner[4])
    west = sum(inner[r][0] for r in range(1, 4))
    side_sums = [north, east, south, west]
    M = [[north % 29, east % 29], [south % 29, west % 29]]
    assert side_sums == [275, 257, 373, 231]
    assert M == [[14, 25], [25, 28]]
    assert (M[0][0] * M[1][1] - M[0][1] * M[1][0]) % 29 == 28
    assert (M[0][0] + M[1][1]) % 29 == 13

    cycles = canonical_cycles()
    moving = [cy for cy in cycles if len(cy) == 7]
    fixed = [cy[0] for cy in cycles if len(cy) == 1]
    assert len(moving) == 4 and sorted(fixed) == [22, 25]
    assert [len(cy) for cy in cycles] == [7, 7, 7, 7, 1, 1]
    cycle_id = {}
    phase_id = {}
    for ci, cy in enumerate(moving):
        for pi, x in enumerate(cy):
            cycle_id[x] = ci
            phase_id[x] = pi

    cells = [(r, c) for r in range(1, 11) for c in range(1, 11)]
    labels = []
    for r, c in cells:
        x = matrix[r][c] % 29
        labels.append(None if x not in cycle_id else (cycle_id[x], phase_id[x]))

    image = Image.open(SOURCE).convert("L")
    assert image.size == (563, 569)
    px = image.load()
    xe, ye = cumulative(widths), cumulative(heights)
    hist4 = [[0.0] * 4 for _ in cells]
    hist7 = [[0.0] * 7 for _ in cells]

    for y in range(1, 568):
        row = bisect_right(ye, y) - 1
        for x in range(1, 562):
            if px[x, y] >= TEXT_THRESHOLD:
                continue
            if any(px[x + dx, y + dy] >= TEXT_THRESHOLD
                   for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                continue
            tl, tc, tr = px[x-1, y-1], px[x, y-1], px[x+1, y-1]
            ml, mr = px[x-1, y], px[x+1, y]
            bl, bc, br = px[x-1, y+1], px[x, y+1], px[x+1, y+1]
            gx = -tl - 2*ml - bl + tr + 2*mr + br
            gy = -tl - 2*tc - tr + bl + 2*bc + br
            if gx == 0 and gy == 0:
                continue
            theta = math.atan2(gy, gx) % math.pi
            bin4 = int((theta + math.pi/8) / (math.pi/4)) % 4
            tangent = (theta - math.pi/2) % math.pi
            bin7 = int((tangent + math.pi/14) / (math.pi/7)) % 7
            col = bisect_right(xe, x) - 1
            i = (row - 1) * 10 + (col - 1)
            hist4[i][bin4] += math.hypot(gx, gy)
            hist7[i][bin7] += math.hypot(gx, gy)

    total_energy = sum(sum(h) for h in hist4)
    assert total_energy > 0

    def score4(order):
        return sum(hist4[i][lab[0]] for i, lab in enumerate(order) if lab is not None)

    def score7(order):
        return sum(hist7[i][lab[1]] for i, lab in enumerate(order) if lab is not None)

    observed4 = score4(labels)
    observed7 = score7(labels)
    rng = random.Random(SEED)
    shuffled = labels.copy()
    values4, values7 = [], []
    for _ in range(TRIALS):
        rng.shuffle(shuffled)
        values4.append(score4(shuffled))
        values7.append(score7(shuffled))

    def stats(observed, samples):
        mean = sum(samples) / len(samples)
        variance = max(0.0, sum(x*x for x in samples) / len(samples) - mean*mean)
        sd = math.sqrt(variance)
        exceed = sum(x >= observed for x in samples)
        two_sided = sum(abs(x-mean) >= abs(observed-mean) for x in samples)
        return {
            "observed": observed,
            "fraction_of_total_edge_energy": observed / total_energy,
            "null_mean": mean,
            "null_sd": sd,
            "z_score": (observed - mean) / sd if sd else None,
            "upper_tail": (exceed + 1) / (len(samples) + 1),
            "two_sided": (two_sided + 1) / (len(samples) + 1),
        }

    s4 = stats(observed4, values4)
    s7 = stats(observed7, values7)
    z4 = abs(s4["z_score"] or 0.0)
    z7 = abs(s7["z_score"] or 0.0)
    obs_max = max(z4, z7)
    null_max = []
    mean4, mean7 = s4["null_mean"], s7["null_mean"]
    sd4, sd7 = s4["null_sd"], s7["null_sd"]
    if sd4 and sd7:
        null_max = [max(abs((a-mean4)/sd4), abs((b-mean7)/sd7))
                    for a, b in zip(values4, values7)]
    familywise = ((sum(v >= obs_max for v in null_max) + 1) / (TRIALS + 1)
                  if null_max else None)

    cycle_counts = {str(k): sum(lab is not None and lab[0] == k for lab in labels)
                    for k in range(4)}
    phase_counts = {str(k): sum(lab is not None and lab[1] == k for lab in labels)
                    for k in range(7)}
    print(json.dumps({
        "classification": "source-locked p32 Möbius 4-cycle/7-phase tree-orientation test; no plaintext claim",
        "source_image": "resources/historical/cicada2016-4gq25.jpg",
        "image_size": list(image.size),
        "tile_widths": widths,
        "tile_heights": heights,
        "inner5_side_sums": side_sums,
        "M_mod29": M,
        "trace": 13,
        "determinant": 28,
        "projective_cycles": [[("infinity" if x is None else x) for x in cy] for cy in cycles],
        "fixed_points": fixed,
        "scored_tiles": sum(lab is not None for lab in labels),
        "fixed_point_tiles": sum(lab is None for lab in labels),
        "cycle_counts": cycle_counts,
        "phase_counts": phase_counts,
        "orientation_conventions": {
            "cycle_id": "trace-13 cycle first, then remaining cycles by smallest finite member; IDs map to gradient-normal bins 0/45/90/135 degrees",
            "phase": "phase starts at 13 in trace cycle and at smallest finite member in other cycles; phase maps to seven branch-tangent bins over 180 degrees",
        },
        "bright_text_mask": {"threshold": TEXT_THRESHOLD, "dark_3x3_required": True},
        "total_edge_energy": total_energy,
        "four_cycle_test": s4,
        "seven_phase_test": s7,
        "joint_max_abs_z_familywise_p": familywise,
        "permutation_null": {"trials": TRIALS, "seed": hex(SEED), "shuffle": "100 intact (cycle, phase) labels including fixed-point labels"},
    }, indent=2))


if __name__ == "__main__":
    main()
