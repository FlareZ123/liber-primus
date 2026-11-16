#!/usr/bin/env python3
"""Recover any standard Java Random 48-bit state behind the LP2 256-byte table.

No guessed seed: a proven-radius LLL decoder solves the complete state for
nextInt(256). An exhaustive 2**16-state inverse solves nextBytes.
Input: resources/liber-primus/lp2-grid-256.json, original 256 table bytes.
Requires Python 3.11+ and sympy 1.14.0. Run from any working directory.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from sympy import Matrix

M = 1 << 48
A = 0x5DEECE66D
C = 11
W = 1 << 40
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus" / "lp2-grid-256.json"
DIGEST = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"


def next_state(s: int) -> int:
    return (s * A + C) % M


def java_top8(seed: int, length: int, discard: int) -> tuple[int, list[int]]:
    state = (seed ^ A) % M
    for _ in range(discard):
        state = next_state(state)
    observed = []
    first = None
    for _ in range(length):
        state = next_state(state)
        if first is None:
            first = state
        observed.append(state >> 40)
    assert first is not None
    return first, observed


def java_bytes(seed: int, count: int) -> tuple[int, list[int]]:
    assert count % 4 == 0
    state = (seed ^ A) % M
    bytes_out = []
    first = None
    for _ in range(count // 4):
        state = next_state(state)
        if first is None:
            first = state
        word = state >> 16
        bytes_out.extend((word >> (8 * j)) & 255 for j in range(4))
    assert first is not None
    return first, bytes_out


class Top8Inverse:
    """Complete truncated-LCG lattice inversion, including arbitrary clock."""

    def __init__(self, count: int):
        assert count in (8, 12)
        self.count = count
        powers = []
        a, c = 1, 0
        for _ in range(count):
            powers.append((a, c))
            a = a * A % M
            c = (c * A + C) % M
        self.offsets = [c for _, c in powers]
        basis = [[a for a, _ in powers]]
        for j in range(1, count):
            row = [0] * count
            row[j] = M
            basis.append(row)
        reduced = Matrix(basis).lll()
        self.rows = [reduced.row(i) for i in range(count)]
        self.gs = []
        for row in self.rows:
            v = row
            for q in self.gs:
                v = v - (v.dot(q) / q.dot(q)) * q
            self.gs.append(v)
        self.min_gs2 = min(q.dot(q) for q in self.gs)
        # True states have Euclidean distance <= sqrt(count)*2**39
        # from box centres. This bound guarantees Babai finds ANY true state.
        self.radius_certificate = self.min_gs2 > count * W * W
        assert self.radius_certificate

    def solve(self, values: list[int]) -> int | None:
        n = self.count
        assert len(values) >= n
        target = Matrix([[
            int(values[i]) * W + W // 2 - self.offsets[i]
            for i in range(n)
        ]])
        residue = target
        for i in range(n - 1, -1, -1):
            q = self.gs[i]
            coefficient = round(residue.dot(q) / q.dot(q))
            residue -= coefficient * self.rows[i]
        recovered = int((target - residue)[0])
        if not 0 <= recovered < M:
            return None
        state = recovered
        if state >> 40 != values[0]:
            return None
        for required in values[1:]:
            state = next_state(state)
            if state >> 40 != required:
                return None
        return recovered


def nextbytes_inverse(values: list[int], first: int) -> list[int]:
    """Exhaustively enumerate all low 16 bits of a full 32-bit output."""
    source = values[first:]
    assert len(source) >= 8
    def word(pos: int) -> int:
        return sum(source[pos + j] << (j * 8) for j in range(4))
    a, b = word(0), word(4)
    valid_states = []
    for lo in range(65536):
        state = (a << 16) | lo
        nxt = next_state(state)
        if nxt >> 16 != b:
            continue
        good = True
        for pos in range(8, len(source), 4):
            nxt = next_state(nxt)
            value = nxt >> 16
            for j in range(min(4, len(source) - pos)):
                if source[pos+j] != (value >> (j*8)) & 255:
                    good = False
                    break
            if not good:
                break
        if good:
            valid_states.append(state)
    return valid_states


def source_groups() -> dict[str, list[int]]:
    grid = json.loads(SOURCE.read_text(encoding="utf-8"))
    alphabet = grid["alphabet"]
    assert len(alphabet) == 60
    bs = [60 * alphabet.index(tok[0]) + alphabet.index(tok[1])
          for page in grid["pages"] for tok in page["tokens"]]
    assert len(bs) == 256 and all(0 <= value < 256 for value in bs)
    assert hashlib.sha256(bytes(bs)).hexdigest() == DIGEST
    rows = [bs[i*8:i*8+8] for i in range(32)]
    cols = [[row[j] for row in rows] for j in range(8)]
    colmajor = [byte for col in cols for byte in col]
    snake = [byte for i, row in enumerate(rows)
             for byte in (row[::-1] if i & 1 else row)]
    groups = {
        "all_printed": bs,
        "all_reverse": bs[::-1],
        "all_columns": colmajor,
        "all_columns_reverse": colmajor[::-1],
        "all_zigzag": snake,
        "all_zigzag_reverse": snake[::-1],
        "physical49": bs[:80],
        "physical50": bs[80:184],
        "physical51": bs[184:],
    }
    groups.update({f"column_{i}": col for i, col in enumerate(cols)})
    groups.update({f"row_{i}": row for i, row in enumerate(rows)})
    assert len(groups) == 49
    return groups



def java_lowbyte(seed: int, length: int, discard: int) -> tuple[int, list[int]]:
    """Unsigned low byte of each Java Random.nextInt() 32-bit output."""
    state = (seed ^ A) % M
    for _ in range(discard):
        state = next_state(state)
    output = []
    first = None
    for _ in range(length):
        state = next_state(state)
        if first is None:
            first = state
        output.append((state >> 16) & 255)
    assert first is not None
    return first, output


def nextint_lowbyte_inverse(values: list[int]) -> list[int]:
    """Exhaust all 2^24 possible low-state patterns consistent with byte0.

    The observed low output byte depends on state bits 16..23 only.
    The lower 24 state bits evolve independently of the upper 24 bits,
    hence 2^16 candidates cover *every* unknown 48-bit state and phase.
    Recovered values are complete residue classes modulo 2^24, each
    representing all 2^24 possible upper-state choices.
    """
    assert len(values) >= 2
    lowmask = (1 << 24) - 1
    initial_high_byte = values[0] << 16
    valid = []
    for low16 in range(65536):
        state = initial_high_byte | low16
        complete = True
        for observed in values[1:]:
            state = (state * A + C) & lowmask
            if (state >> 16) != observed:
                complete = False
                break
        if complete:
            valid.append(initial_high_byte | low16)
    return valid


def main() -> None:
    groups = source_groups()
    inverses = {k: Top8Inverse(k) for k in (8, 12)}
    seed = 0x33012026
    for size, discard in ((8, 123), (12, 337)):
        state, known = java_top8(seed, size, discard)
        assert inverses[size].solve(known) == state
    sampled, low_data = java_lowbyte(seed, 48, discard=183)
    assert nextint_lowbyte_inverse(low_data) == [sampled & ((1 << 24)-1)]
    state, plant = java_bytes(seed, 256)
    assert nextbytes_inverse(plant, 0) == [state]

    upper_survivors = []
    block_survivors = []
    lowbyte_survivors = []
    for label, values in groups.items():
        s = inverses[min(12, len(values))].solve(values)
        if s is not None:
            upper_survivors.append((label, s))
        for lower24 in nextint_lowbyte_inverse(values):
            lowbyte_survivors.append((label, lower24))
        for align in range(min(4, len(values) - 7)):
            for s in nextbytes_inverse(values, align):
                block_survivors.append((label, align, s))
    assert not upper_survivors, upper_survivors
    assert not block_survivors, block_survivors
    assert not lowbyte_survivors, lowbyte_survivors
    print(json.dumps({
        "original_sha256": DIGEST,
        "original_streams": len(groups),
        "exhaustive_java_nextInt256_48bit_lanes": len(groups),
        "exhaustive_java_nextBytes_48bit_lanes": sum(min(4, len(v) - 7) for v in groups.values()),
        "original_nextInt256_survivors": upper_survivors,
        "original_nextBytes_survivors": block_survivors,
        "exhaustive_java_nextInt_low8_mod24_lanes": len(groups),
        "original_nextInt_low8_survivors": lowbyte_survivors,
        "gram_schmidt_radius_certificate": {
            n: solver.radius_certificate for n, solver in inverses.items()
        },
        "synthetic_fullstate_nextInt256": "PASS",
        "synthetic_fullstate_nextBytes": "PASS",
        "synthetic_nextInt_low8_unknown_residue": "PASS",
        "scope": "Continuous standard java.util.Random streams with listed layouts; "
                 "all internal 48-bit states and 0..3 nextBytes alignments; "
                 "low-byte lane all 2**24 possible lower-state patterns. "
                 "Not java.security.SecureRandom, altered sampling or other paths."
    }, indent=2))


if __name__ == "__main__":
    main()
