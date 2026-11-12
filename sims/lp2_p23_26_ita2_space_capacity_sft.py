"""Exact ITA2 five-dot / 201-quintet English-space capacity gate for LP2 pp23–26.

Source: resources/liber-primus/lp2-corpus.json, original physical pages 23–26.
Hypothesis: each of 29 rune identities has one permanent unknown bit;
each chronological five-rune group encodes a standard ITA2 code.
The test is restricted to letters-only mode, with 0/27/31 disallowed.
Requires scipy >= 1.11 and numpy. The solver runs without writing files.
"""

from pathlib import Path
import json
import re
import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp
from scipy.sparse import lil_matrix


ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
INVALID_CODES = (0, 27, 31)
ITA2 = {
    "E": 1, "A": 3, " ": 4, "S": 5, "I": 6, "U": 7,
    "D": 9, "R": 10, "J": 11, "N": 12, "F": 13,
    "C": 14, "K": 15, "T": 16, "Z": 17, "L": 18,
    "W": 19, "H": 20, "Y": 21, "P": 22, "Q": 23,
    "O": 24, "B": 25, "G": 26, "M": 28, "X": 29,
    "V": 30,
}


def matrix_from_original():
    """Return unchanged 201×5 GP29 indices after p23's red 16-rune title."""
    with CORPUS.open(encoding="utf-8") as handle:
        pages = json.load(handle)["pages"]
    body = [r for page in pages[23:27] for r in page["indices"]]
    assert [pages[p]["runic_count"] for p in range(23, 27)] == [213, 270, 273, 265]
    assert len(body) == 1021
    assert len(body[16:]) == 1005
    return np.asarray(body[16:], dtype=np.int8).reshape(201, 5)


def legal_ita2_space_max(group, invalid_codes=INVALID_CODES):
    """Exact MILP: maximize code4 count over all 2^29 constant rune-bit maps."""
    assert group.shape == (201, 5)
    assert np.min(group) >= 0 and np.max(group) < 29
    variables = 29 + 201  # 29 shared binary rune-bits, 201 space indicators
    rows, lows, highs = [], [], []

    def constraint(entries, low=-np.inf, high=np.inf):
        rows.append(entries)
        lows.append(low)
        highs.append(high)

    for i, group_row in enumerate(group):
        # Code 4 = 00100. The middle rune's bit is one; all four others zero.
        # Indicator may equal one only if all five literal conditions hold.
        middle = int(group_row[2])
        constraint({29 + i: 1, middle: -1}, high=0)
        for neighbour in set(map(int, list(group_row[:2]) + list(group_row[3:]))):
            constraint({29 + i: 1, neighbour: 1}, high=1)

        # Forbid nonletters-mode NULL, FIGS and LTRS codes using exact
        # disjunctive inequalities, including repeated rune identities.
        for code in invalid_codes:
            required = {}
            impossible = False
            for bit_index, rune in enumerate(group_row):
                desired_bit = (code >> (4 - bit_index)) & 1
                rune = int(rune)
                if rune in required and required[rune] != desired_bit:
                    impossible = True
                    break
                required[rune] = desired_bit
            if impossible:
                continue
            # At least one required literal must differ.
            constraint(
                {rune: (-1 if bit else 1) for rune, bit in required.items()},
                low=1 - sum(required.values()),
            )

    mat = lil_matrix((len(rows), variables), dtype=np.float64)
    for i, entries in enumerate(rows):
        for j, val in entries.items():
            mat[i, j] = val

    objective = np.concatenate((np.zeros(29), -np.ones(201)))
    opt = milp(
        objective,
        integrality=np.ones(variables),
        bounds=Bounds(np.zeros(variables), np.ones(variables)),
        constraints=LinearConstraint(mat.tocsr(), lows, highs),
        options={"mip_rel_gap": 0.0},
    )
    assert opt.success, opt.message
    assert abs(opt.mip_gap) < 1e-10

    bits = (opt.x[:29] > 0.5).astype(np.int8)
    codes = np.zeros(201, dtype=np.int64)
    for col in range(5):
        codes = 2 * codes + bits[group[:, col]]
    spaces = int(np.sum(codes == 4))
    assert not any(np.any(codes == v) for v in invalid_codes)
    assert spaces == round(-opt.fun) == round(-opt.mip_dual_bound)
    return spaces, "".join(map(str, bits)), codes


def native_positive_control():
    """Construct a complete 201-character source-English ITA2 carrier."""
    source = (ROOT / "resources" / "liber-primus" / "lp1-plaintext-reference.txt").read_text(encoding="utf-8")
    normalized = " ".join(re.findall(r"[A-Z]+", source.upper()))
    index = normalized.index("WELCOME PILGRIM TO THE GREAT JOURNEY")
    text = normalized[index:index + 201]
    assert len(text) == 201 and text.count(" ") == 42
    assert set(text).issubset(ITA2), sorted(set(text) - set(ITA2))
    bit_classes = [list(range(15)), list(range(15, 29))]
    plant = np.zeros((201, 5), dtype=np.int8)
    for i, ch in enumerate(text):
        code = ITA2[ch]
        for col in range(5):
            value = (code >> (4 - col)) & 1
            plant[i, col] = bit_classes[value][(i * 5 + col) % len(bit_classes[value])]
    planted_bits = np.asarray([0] * 15 + [1] * 14)
    check = np.zeros(201, dtype=np.int64)
    for col in range(5):
        check = check * 2 + planted_bits[plant[:, col]]
    assert all(int(v) == ITA2[ch] for v, ch in zip(check, text))
    return text, plant


def main():
    original = matrix_from_original()
    for name, group in (("printed", original), ("mirrored quintets", original[:, ::-1])):
        spaces, bit_key, codes = legal_ita2_space_max(group)
        print(f"{name}: EXACT maximum {spaces}/201 ITA2 ordinary spaces")
        print(f"  one witness bit-key: {bit_key}")
        print(f"  distinct output codes: {len(set(map(int, codes)))}")
        assert spaces == 12
        unrestricted, broad_key, broad_codes = legal_ita2_space_max(group, invalid_codes=())
        print(f"  with NULL/FIGS/LTRS allowed, exact maximum is {unrestricted}/201 spaces")
        print(f"  broad witness controls: NULL={sum(broad_codes == 0)}, FIGS={sum(broad_codes == 27)}, LTRS={sum(broad_codes == 31)}")
        assert unrestricted == 36

    positive, encoded = native_positive_control()
    print(f"native solved-LP1 prose positive: {len(positive)} symbols, {positive.count(' ')} spaces")
    assert positive.count(" ") >= 25
    print("  source-native 29-rune bit-code mapping and all 201 groups decode exactly")
    # This constructive control proves a native English plaintext has many spaces
    # under the identical five-bit output semantics; original max=12 cannot carry it.


if __name__ == "__main__":
    main()
