"""Exact LP2 unknown-29-cycle necessary-condition CP-SAT sieve for ASCII7.

Source hypothesis: delete each repeated adjacent runic glyph (86 events) from
12,956 unsolved LP2 GP runes, leaving 165 blocks of 78 base28 rank digits.
One secret 29-glyph cyclic ordering generates every successor by advancing
one through 28 positions. Each block is a big-endian 47-byte integer.
A necessary condition for 7bit ASCII: byte 1 (the second decoded byte) <128.
Its MSB is determined to a tight necessary domain by only the first three
base28 digits, independent of all remaining 75 digits and byte language.

One INFEASIBLE CP-SAT result proves there is NO fixed cyclic secret alphabet
satisfying this specific original-source 47-byte uncompressed-ASCII channel.
FEASIBLE/UNKNOWN prove no exclusion. All claims conditional on this framing.
Run with pinned ortools==9.15.6755:
 python sims/prime78_ascii_bit_cp.py --plant
 python sims/prime78_ascii_bit_cp.py --original
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import time
from pathlib import Path

from ortools.sat.python import cp_model

ROOT = Path(__file__).resolve().parent.parent
PACKETS, DIGITS, BYTES, GP = 165, 78, 47, 29
RADIX, PREFIX_DIGITS = 28, 3
DIVISOR, FACTOR = 256**45, 28**75


def input_source() -> tuple[list[int], list[int]]:
    data = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    original = [v for page in data["pages"] if page["page"] < 56 for v in page["indices"]]
    assert len(original) == 12956
    repeats = {i for i in range(1, len(original)) if original[i] == original[i-1]}
    assert len(repeats) == 86
    clean = [v for i, v in enumerate(original) if i not in repeats]
    assert len(clean) == PACKETS * DIGITS
    return original, clean


def exact_allowed(charset: str = "7bit") -> tuple[list[list[int]],int]:
    """Proof-safe 3-rank prefix domain for the first two ASCII byte slots.

    Every possible high two-byte integer for this prefix is included,
    even if the 75 unknown remaining digits cannot generate it. This
    overapproximation can only admit false candidates, never reject the
    actual proposed transport.
    """
    def character(b: int) -> bool:
        if charset == "7bit":
            return 0 <= b < 128
        if charset == "printable":
            return 32 <= b <= 126
        if charset == "upper":
            return b == 32 or 65 <= b <= 90
        if charset == "lower":
            return b == 32 or 97 <= b <= 122
        raise ValueError(charset)
    runs = []
    legal = 0
    for prefix in range(RADIX**PREFIX_DIGITS):
        lo = prefix*FACTOR//DIVISOR
        hi = (prefix+1)*FACTOR//DIVISOR
        valid = any(character(value>>8) and character(value&255)
                    for value in range(lo,hi+1))
        if not valid:
            continue
        legal += 1
        if runs and runs[-1][1] == prefix-1:
            runs[-1][1] = prefix
        else:
            runs.append([prefix,prefix])
    expected = {"7bit":(11130,126),"printable":(6186,94),
                "upper":(553,54),"lower":(550,54)}
    assert (legal,len(runs)) == expected[charset]
    return runs,legal


def packet_starts(clean: list[int]) -> list[tuple[int, int, int, int]]:
    assert len(clean) == PACKETS*DIGITS
    return [tuple(clean[k*DIGITS-1:k*DIGITS+3]) for k in range(1,PACKETS)]


def planted_source(charset: str = 'upper') -> tuple[list[int], list[int]]:
    text = (ROOT / "resources/liber-primus/lp1-plaintext-reference.txt").read_text(encoding="utf-8")
    text = " ".join(s for s in text.splitlines() if s and not s.startswith(("#","["))
                    and not s[0].isdigit()).upper()
    plain = " ".join("".join(c if "A" <= c <= "Z" else " " for c in text).split())+" "
    assert len(plain) > 3500
    if charset == "lower":
        plain = plain.lower()
    payload = (plain*((PACKETS*BYTES)//len(plain)+1))[:PACKETS*BYTES].encode("ascii")
    gen = random.Random(0x33017847)
    order = list(range(GP))
    gen.shuffle(order)
    positions = [0]*GP
    for position, rune in enumerate(order):
        positions[rune] = position
    previous = order[11]
    clean = []
    for packet in range(PACKETS):
        number = int.from_bytes(payload[packet*BYTES:(packet+1)*BYTES],"big")
        assert number < RADIX**DIGITS
        digits = [0]*DIGITS
        for j in range(DIGITS-1,-1,-1):
            number,digits[j] = divmod(number,RADIX)
        assert number == 0
        for digit in digits:
            previous = order[(positions[previous]+digit+1)%GP]
            clean.append(previous)
    assert len(clean) == PACKETS*DIGITS
    assert all(clean[i] != clean[i-1] for i in range(1,len(clean)))
    return clean,positions


def check_key(starts: list[tuple[int,int,int,int]], pi: list[int],
              valid: list[list[int]]) -> None:
    for a,b,c,d in starts:
        ds = [(pi[v]-pi[u]-1)%GP for u,v in [(a,b),(b,c),(c,d)]]
        prefix = 784*ds[0]+28*ds[1]+ds[2]
        assert any(lo <= prefix <= hi for lo,hi in valid)


def solve(clean: list[int], valid: list[list[int]], limit: float,
          plant_pi: list[int] | None = None) -> dict:
    starts = packet_starts(clean)
    model = cp_model.CpModel()
    pi = [model.new_int_var(0,GP-1,f"pi_{i}") for i in range(GP)]
    model.add_all_different(pi)
    model.add(pi[0] == 0)
    domain = cp_model.Domain.from_intervals(valid)
    for k,quad in enumerate(starts):
        ds = [model.new_int_var(0,27,f"d_{k}_{j}") for j in range(PREFIX_DIGITS)]
        for j in range(PREFIX_DIGITS):
            model.add_modulo_equality(ds[j],
                pi[quad[j+1]]-pi[quad[j]]+28,GP)
        model.add_linear_expression_in_domain(784*ds[0]+28*ds[1]+ds[2],domain)
    if plant_pi is not None:
        check_key(starts,plant_pi,valid)
        # Only synthetic positive receives a known-secret hint, no original hint.
        for i,v in enumerate(plant_pi):
            model.add_hint(pi[i],(v-plant_pi[0])%GP)
    cp = cp_model.CpSolver()
    cp.parameters.max_time_in_seconds = limit
    cp.parameters.num_search_workers = 8
    cp.parameters.random_seed = 33017847
    begin = time.monotonic()
    status = cp.solve(model)
    out = {"status":cp.status_name(status),"elapsed":round(time.monotonic()-begin,3),
           "conflicts":cp.num_conflicts,"branches":cp.num_branches,
           "tested_original_packet_leaders":len(starts),
           "allowed_prefix_intervals":len(valid)}
    if status in (cp_model.FEASIBLE,cp_model.OPTIMAL):
        pos = [cp.value(x) for x in pi]
        assert sorted(pos) == list(range(GP))
        check_key(starts,pos,valid)
        out["witness_positions"] = pos
        if plant_pi is not None:
            delta = (pos[0]-plant_pi[0])%GP
            out["planted_order_labels_recovered"] = sum(
                (pos[i]-plant_pi[i])%GP == delta for i in range(GP))
        actual_bytes = []
        overflow = 0
        for block in range(1,PACKETS):
            number = 0
            for j in range(DIGITS):
                idx = block*DIGITS+j
                digit = (pos[clean[idx]]-pos[clean[idx-1]]-1)%GP
                number = RADIX*number+digit
            if number >= 256**BYTES:
                overflow += 1
            else:
                actual_bytes.extend(number.to_bytes(BYTES,"big"))
        out["byte_capacity_overflows"] = overflow
        out["decoded_bytes"] = len(actual_bytes)
        out["high_bit_bytes"] = sum(b>=128 for b in actual_bytes)
        out["printable_bytes"] = sum(32<=b<=126 for b in actual_bytes)
        out["first_decoded_bytes_hex"] = bytes(actual_bytes[:47]).hex()
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plant",action="store_true")
    parser.add_argument("--original",action="store_true")
    parser.add_argument("--seconds",type=float,default=180.0)
    parser.add_argument("--charset",choices=("7bit","printable","upper","lower"),default="7bit")
    args = parser.parse_args()
    assert args.plant != args.original
    legal,legal_count = exact_allowed(args.charset)
    original,clean = input_source()
    if args.plant:
        clean,key = planted_source(args.charset)
        label = "synthetic7bit-positive"
        outcome = solve(clean,legal,args.seconds,key)
        assert outcome["status"] in ("OPTIMAL","FEASIBLE"), outcome
    else:
        label = "authentic-LP2-original"
        outcome = solve(clean,legal,args.seconds)
    result = {"case":label,"ascii_charset":args.charset,
              "original_indices_sha256":hashlib.sha256(bytes(original)).hexdigest(),
              "unsolved_runes":len(original),
              "clean_rank28_digits":len(clean),
              "packets":PACKETS,"ranks_per_packet":DIGITS,
              "bytes_per_packet":BYTES,"allowed_first3_rank_patterns":legal_count,
              "total_first3_rank_patterns":21952,
              "scope":"Only original 164 known-predecessor packets and 7bit second-byte MSB",
              **outcome}
    print(json.dumps(result,indent=2),flush=True)
    if not args.plant:
        print("CERTIFIED FINITE EXCLUSION" if outcome["status"] == "INFEASIBLE"
              else "NO FINITE EXCLUSION (SAT or solver UNKNOWN)",flush=True)


if __name__ == "__main__":
    main()
