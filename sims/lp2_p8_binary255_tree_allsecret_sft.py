"""Exact original p8 binary-tree / 255-state register gate.

Checks every static rune-to-bit map using the SMT theory of bitvectors,
both globally and with independent red/black symbol classes. Covers
literal reading and the twelve source-simple complete-binary-tree
pre/in/post reading orders and their inverses.

Independent plaintext-free source premise: physical p8 has exactly 255
runes and depicts a branching sapling. The premise is speculative;
the exact UNSAT claims concern only the stated 26 frozen models.
Run with Python 3.12 and z3-solver==5.0.0.0.
"""
from __future__ import annotations

import json
from pathlib import Path
from time import perf_counter

from z3 import BitVec, BitVecVal, Concat, Distinct, Solver, sat, unsat

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
TOTAL = 255
ALPHABET = 29
RED_COUNT = 12
SOLVER_TIMEOUT_MS = 60000


def tree_walk(
    which: str, reverse_children: bool, node: int = 0
) -> list[int]:
    """The 255-node breadth-first-indexed complete binary tree."""
    if node >= TOTAL:
        return []
    left, right = 2 * node + 1, 2 * node + 2
    first, second = (right, left) if reverse_children else (left, right)
    if which == "pre":
        return [node, *tree_walk(which, reverse_children, first),
                *tree_walk(which, reverse_children, second)]
    if which == "in":
        return [*tree_walk(which, reverse_children, first), node,
                *tree_walk(which, reverse_children, second)]
    if which == "post":
        return [*tree_walk(which, reverse_children, first),
                *tree_walk(which, reverse_children, second), node]
    raise ValueError(which)


def invert(order: list[int]) -> list[int]:
    """Read BFS from an input originally serialized in this DFS order."""
    result = [0] * TOTAL
    for offset, node in enumerate(order):
        result[node] = offset
    return result


def orders() -> list[tuple[str, list[int]]]:
    """Printed order and 6 BFS→DFS plus 6 DFS→BFS traversals."""
    result = [("printed", list(range(TOTAL)))]
    for kind in ("pre", "in", "post"):
        for reverse in (False, True):
            walk = tree_walk(kind, reverse)
            assert len(walk) == TOTAL and sorted(walk) == list(range(TOTAL))
            suffix = "right-first" if reverse else "left-first"
            result.append((f"BFS-to-{kind}-{suffix}", walk))
            result.append((f"{kind}-to-BFS-{suffix}", invert(walk)))
    assert len(result) == 13
    assert len({tuple(order) for _, order in result}) == 13
    return result


def strict_binary_cycle(
    values: list[int], source_order: list[int], ink_split: bool
) -> tuple[bool, float]:
    """Is any fixed 29- or 58-class bit mapping a full 255-word cycle?

    Eight-bit windows are cyclic. Exactly 255 nonzero values must occur
    once each, a necessary condition for any order-eight binary m-sequence
    and for a 256-state binary de Bruijn cycle with 00000000 deleted.
    No chosen polynomial, LFSR tap, seed, phase or bit polarity is assumed.
    """
    class_count = ALPHABET * (2 if ink_split else 1)
    mapping = [BitVec(f"bit_{j}", 1) for j in range(class_count)]
    symbols = [
        values[source_position] + (
            ALPHABET if ink_split and source_position >= RED_COUNT else 0
        )
        for source_position in source_order
    ]
    windows = [
        Concat(*(mapping[symbols[(i + j) % TOTAL]] for j in range(8)))
        for i in range(TOTAL)
    ]
    s = Solver()
    s.set(timeout=SOLVER_TIMEOUT_MS)
    s.add(Distinct(*windows))
    s.add(*(v != BitVecVal(0, 8) for v in windows))
    start = perf_counter()
    outcome = s.check()
    seconds = perf_counter() - start
    assert outcome in (sat, unsat), f"solver inconclusive: {outcome}"
    return outcome == sat, seconds


def primitive_binary_control() -> list[int]:
    """Explicit order-eight primitive register; no source-language model."""
    taps = (1, 0, 1, 1, 1, 0, 0, 0)  # integer mask 29
    initial = [1, 0, 0, 0, 0, 0, 0, 0]
    state = initial.copy()
    sequence: list[int] = []
    for _ in range(TOTAL):
        sequence.append(state[0])
        nxt = sum(a * b for a, b in zip(taps, state)) % 2
        state = [*state[1:], nxt]
    assert state == initial, "positive m-sequence must return after 255"
    assert len({
        tuple(sequence[(i + j) % TOTAL] for j in range(8))
        for i in range(TOTAL)
    }) == 255
    assert not any(
        all(sequence[(i + j) % TOTAL] == 0 for j in range(8))
        for i in range(TOTAL)
    )
    return sequence


def positive_plant(order: list[int], ink_split: bool, binary: list[int]) -> None:
    """A two-rune encoded genuine 255-state cycle must be satisfiable."""
    original_layout = [0] * TOTAL
    for output_offset, physical_offset in enumerate(order):
        original_layout[physical_offset] = binary[output_offset]
    ok, _ = strict_binary_cycle(original_layout, order, ink_split)
    assert ok, "genuine m-sequence control must pass same SMT gate"


def main() -> None:
    corpus = json.loads(SOURCE.read_text(encoding="utf-8"))
    page8 = corpus["pages"][8]
    source = page8["indices"]
    assert page8["page"] == 8 and page8["runic_count"] == TOTAL
    assert len(source) == TOTAL and set(source) == set(range(ALPHABET))
    assert source[:12] == [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]
    assert len(source[RED_COUNT:]) == 243

    reading_orders = orders()
    binary = primitive_binary_control()
    # These three positive controls cover literal, BFS→DFS, and inverse
    # DFS→BFS source placement, both one- and two-ink code alphabets.
    for name in (
        "printed", "BFS-to-pre-left-first", "pre-to-BFS-left-first"
    ):
        order = next(item for label, item in reading_orders if label == name)
        for ink_split in (False, True):
            positive_plant(order, ink_split, binary)
            print(f"PASS real binary register plant: {name}, ink_split={ink_split}",
                  flush=True)

    outcomes = []
    for name, order in reading_orders:
        for ink_split in (False, True):
            satisfiable, seconds = strict_binary_cycle(
                source, order, ink_split
            )
            item = {
                "order": name,
                "alphabet": "ink-separated-58" if ink_split else "global-29",
                "satisfiable": satisfiable,
                "seconds": round(seconds, 3),
            }
            outcomes.append(item)
            print("CASE", json.dumps(item, sort_keys=True), flush=True)
            assert not satisfiable, f"unexpected original source binary mapping: {item}"

    assert len(outcomes) == 26
    print(json.dumps({
        "source": "Original physical LP2 p8, 255 GP29 runes, red first12",
        "statements": [
            "Every 8-bit cyclic word is nonzero and all 255 are distinct",
            "No hidden rune->bit map exists for any of 26 source-simple arrangements",
        ],
        "cases": len(outcomes),
        "original_unsat": sum(not x["satisfiable"] for x in outcomes),
        "positive_plants_sat": 6,
        "conclusion": "Bounded all-secret exclusion; no unknown LP2 plaintext or cipher recovered"
    }, indent=2), flush=True)


if __name__ == "__main__":
    main()
