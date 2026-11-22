"""Original p7-derived GF3 cycle order: exact p8 feedback-repair min edits.

Both mathematically valid zero splices, both reading directions, and both
canonical one-trit shift directions. Reads only original LP2 sources.
Imports the binary HiGHS SFT in this directory as a reusable exact solver.
"""
from functools import reduce
from operator import mul

from lp2_p8_feedback_minimum_edit_milp_sft import (
    gp, original, triples, minimum_edits,
)

p7 = gp["pages"][7]["indices"]
red_words = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]]
assert len(p7) == 208
assert p7[-14:] == sum(red_words, [])
taps = [reduce(mul, word, 1) % 29 % 3 for word in red_words]
assert taps == [2, 2, 2, 0, 2]

state = taps[:]
trits = []
for i in range(242):
    trits.append(state[0])
    state = state[1:] + [sum(a * b for a, b in zip(taps, state)) % 3]
assert state == taps
zero_starts = [
    i for i in range(242)
    if all(trits[(i + j) % 242] == 0 for j in range(4))
]
assert zero_starts == [83, 204]

expected = {
    (83, "forward"): (37, 43),
    (83, "reverse"): (38, 41),
    (204, "forward"): (40, 42),
    (204, "reverse"): (40, 35),
}
for first_zero in zero_starts:
    completed = trits[:]
    completed.insert(first_zero + 4, 0)
    addresses = [
        sum(completed[(i + j) % 243] * 3 ** (4 - j) for j in range(5))
        for i in range(243)
    ]
    assert len(set(addresses)) == 243
    assert addresses[:5] == [236, 223, 184, 67, 203]
    for direction in ("forward", "reverse"):
        ordered = addresses if direction == "forward" else addresses[::-1]
        indexed = [None] * 243
        for i, address in enumerate(ordered):
            indexed[address] = original[i]
        assert None not in indexed
        for which, dropped_axis in enumerate((0, 4)):
            forced = sum(len(set(g)) < 3 for g in triples(indexed, dropped_axis))
            optimal, key = minimum_edits(indexed, dropped_axis)
            assert forced > 0 and optimal >= forced
            assert optimal == expected[(first_zero, direction)][which]
            print(
                f"zero_run={first_zero}, direction={direction}, "
                f"drop_axis={dropped_axis}, duplicate_fibers={forced}, "
                f"certified_min_feedback_edits={optimal}, "
                f"stationary_rune_to_trit_witness={key}",
                flush=True,
            )
print("PASS: 8 p7-source LFSR state-address exact optimal repair costs", flush=True)
