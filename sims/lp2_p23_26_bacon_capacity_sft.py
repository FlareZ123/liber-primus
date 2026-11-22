"""Exact original LP2 pp23-26 Bacon-style 5-rune capacity gate.

Requires numpy and scipy. Run from the repository root:
    python sims/lp2_p23_26_bacon_capacity_sft.py
"""
import json
from pathlib import Path
import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp

root = Path(__file__).resolve().parents[1]
corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
pages = [p for p in corpus["pages"] if 23 <= p["page"] <= 26]
assert [len(p["indices"]) for p in pages] == [213, 270, 273, 265]
source = [x for p in pages for x in p["indices"]]
assert source[:16] == [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]
q = np.asarray(source[16:], dtype=int).reshape(201, 5)
assert len(set(q.ravel())) == 29

# Baconian A-Z uses binary 00000..11001. Invalid 11010..11111 occur
# exactly when b0=b1=1 and either b2=1 or b3=1. For each quintet
# forbid both corresponding 3-one configurations. Duplicate glyphs
# accumulate coefficients automatically.
A = np.zeros((len(q) * 2, 29), dtype=float)
for i, group in enumerate(q):
    for j, pos in enumerate((2, 3)):
        np.add.at(A[2 * i + j], group[[0, 1, pos]], 1)
result = milp(
    c=-np.ones(29),
    integrality=np.ones(29),
    bounds=Bounds(np.zeros(29), np.ones(29)),
    constraints=LinearConstraint(A, -np.inf, 2),
    options={"time_limit": 30},
)
assert result.status == 0 and round(-result.fun) == 10, (
    result.status, result.message, result.fun
)
bits = np.rint(result.x).astype(int)
assert int(bits.sum()) == 10
weights = np.asarray([16, 8, 4, 2, 1], dtype=int)
actual_codes = (weights * bits[q]).sum(axis=1)
assert actual_codes.max() <= 25

# Positive: known 201-letter English message, two fixed rune classes,
# and 29 available source labels. Exact decoding must reproduce it.
phrase = "THEWORDSARETHEMAPANDTHEIRMEANINGISTHEROAD"
positive = (phrase * 5)[:201]
labels_zero = np.arange(10, 29)
labels_one = np.arange(10)
plant = np.empty((len(positive), 5), dtype=int)
for i, char in enumerate(positive):
    n = ord(char) - ord("A")
    for j in range(5):
        b = (n >> (4 - j)) & 1
        group = labels_one if b else labels_zero
        plant[i, j] = group[(i * 7 + j * 11) % len(group)]
plant_codes = (weights * (plant < 10)).sum(axis=1)
assert "".join(chr(v + ord("A")) for v in plant_codes) == positive

counts = np.zeros((5, 29), dtype=int)
for j in range(5):
    counts[j] = np.bincount(q[:, j], minlength=29)
contrast = counts[0] - counts[3]
assert int(contrast[contrast > 0].sum()) == 37
print(json.dumps({
    "source": "LP2 physical pp23-26, original heading excluded",
    "rune_count": 1005,
    "quintets": 201,
    "distinct_source_runes": 29,
    "max_one_labeled_rune_types_for_26_letter_Bacon": 10,
    "bit0_minus_bit3_count_range": [-37, 37],
    "source_positive_201_letter_plant": "passed",
    "status": "bounded necessary condition; not an LP2 decryption",
}, indent=2))
