"""Globally optimal p8 static GP29-to-trit feedback repair under five axes.

Uses source p8's unchanged 243 black rune indices and a mixed-integer
linear program (SciPy HiGHS). The output counts required state-specific
feedback edits, not physical source rune corrections. Input is read-only.
"""
from hashlib import sha256
from json import loads
from pathlib import Path

import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp
from scipy.sparse import lil_matrix

CORPUS = Path(__file__).resolve().parents[1] / "resources" / "liber-primus" / "lp2-corpus.json"
gp = loads(CORPUS.read_text(encoding="utf-8"))
physical = gp["pages"][8]["indices"]
assert len(physical) == 255
original = physical[12:]
assert len(original) == 243 and len(set(original)) == 29
assert sha256(bytes(original)).hexdigest() == (
    "587d41e62de08d12121bb2500c18817461840c9f8bbf88e533dbb048cd50274d"
)


def triples(labels: list[int], axis: int) -> list[list[int]]:
    """Source fibers agreeing on four ternary coordinates."""
    stride = 3 ** axis
    return [
        [labels[i], labels[i + stride], labels[i + 2 * stride]]
        for i in range(243) if (i // stride) % 3 == 0
    ]


def minimum_edits(labels: list[int], axis: int) -> tuple[int, list[int]]:
    """Optimize a secret fixed 29-rune-to-trit map, with a proven MIP bound.

    Binary x[r,t] selects one trit for rune r. Binary y[f,t] says a rune
    in original triple f already has trit t. Maximize occupied distinct
    colors per triple. Each missing color costs one state-specific edit.
    """
    fibers = triples(labels, axis)
    assert len(fibers) == 81
    nvars = 330  # 29*3 rune colors + 81*3 fiber color-presence indicators
    objective = np.zeros(nvars)
    objective[87:] = -1
    matrix = lil_matrix((29 + 81 * 3, nvars), dtype=float)
    lower = np.full(matrix.shape[0], -np.inf)
    upper = np.full(matrix.shape[0], np.inf)
    for r in range(29):
        for t in range(3):
            matrix[r, 3 * r + t] = 1
        lower[r] = upper[r] = 1
    for f, group in enumerate(fibers):
        for t in range(3):
            row = 29 + 3 * f + t
            matrix[row, 87 + 3 * f + t] = 1
            for r in set(group):
                matrix[row, 3 * r + t] = -1
            upper[row] = 0
    var_lower = np.zeros(nvars)
    var_upper = np.ones(nvars)
    var_lower[0] = var_upper[0] = 1  # WLOG rename trit colors: rune 0 = trit 0
    fit = milp(
        objective,
        integrality=np.ones(nvars, dtype=int),
        bounds=Bounds(var_lower, var_upper),
        constraints=LinearConstraint(matrix.tocsr(), lower, upper),
        options={"mip_rel_gap": 0.0, "time_limit": 120.0},
    )
    assert fit.success and fit.status == 0, fit.message
    assert fit.mip_dual_bound is not None
    assert abs(fit.fun - fit.mip_dual_bound) < 1e-7
    rune_colors = np.argmax(fit.x[:87].reshape(29, 3), axis=1).tolist()
    matched = sum(len({rune_colors[r] for r in g}) for g in fibers)
    assert abs(-fit.fun - matched) < 1e-7
    return 243 - matched, rune_colors


def main() -> None:
    expected = [39, 41, 39, 39, 44]
    for axis in range(5):
        edits, key = minimum_edits(original, axis)
        assert edits == expected[axis], (axis, edits, expected[axis])
        planted = [[4, 14, 27][(i // (3 ** axis)) % 3] for i in range(243)]
        assert all(len(set(g)) == 3 for g in triples(planted, axis))
        print(f"axis={axis} stride={3 ** axis} certified_min_edits={edits} key={key}", flush=True)
    print("PASS: 5 optimal mixed-integer certificates, 5 source-native trit positives", flush=True)


if __name__ == "__main__":
    main()
