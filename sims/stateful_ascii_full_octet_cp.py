#!/usr/bin/env python3
"""Exact all-octet CP-SAT test for the sole 30-digit stationary radix-28 frame.

The conversion uses 28**4 = 256*2401. Thirty radix-28 digits are split into
seven 4-digit groups and one 2-digit group. Eighteen exact byte carries
convert the complete big-endian integer without a 144-bit CP-SAT integer.
Every linear coefficient is <=255 and every intermediate bound is <2**28.
"""
from __future__ import annotations
import argparse, hashlib, json, random, time
from pathlib import Path

RADIX = 28
WIDTH = 30
PHASE = 29
GROUP_BASE = RADIX ** 4
BYTE_BASE = 256
NMAX = RADIX ** WIDTH - 1
GROUP_MAX = [GROUP_BASE - 1] * 7 + [RADIX**2 - 1]
COEFFICIENT_BASES = [RADIX**2 * (GROUP_BASE ** (6-g)) for g in range(7)] + [1]
COEFFICIENTS = [
    [(COEFFICIENT_BASES[g] // (BYTE_BASE**t)) % BYTE_BASE for g in range(8)]
    for t in range(18)
]

MAX_SUMS: list[int] = []
MAX_CARRIES: list[int] = []
_previous_carry_max = 0
for _t in range(18):
    _sum_max = _previous_carry_max + sum(
        GROUP_MAX[g] * COEFFICIENTS[_t][g] for g in range(8)
    )
    _sum_max = min(_sum_max, NMAX // (BYTE_BASE**_t))
    _previous_carry_max = _sum_max // BYTE_BASE
    MAX_SUMS.append(_sum_max)
    MAX_CARRIES.append(_previous_carry_max)

assert max(MAX_SUMS) < 2**28
assert max(MAX_CARRIES) < 2**20
assert MAX_CARRIES[-1] == 1

ASCII_BYTES = [9, 10, 13, *range(32, 127)]

def load_source(repo_root: Path):
    corpus_path = repo_root / "resources" / "liber-primus" / "lp2-corpus.json"
    raw = corpus_path.read_bytes()
    corpus = json.loads(raw)
    pages = [
        page["indices"] for page in corpus["pages"]
        if page.get("status") == "unsolved" and page.get("indices")
    ]
    assert len(pages) == 55
    assert sum(map(len, pages)) == 12956
    packets = []
    rejected = total = 0
    for page in pages:
        transitions = list(zip(page[:-1], page[1:]))
        for start in range(PHASE, len(transitions) - WIDTH + 1, WIDTH):
            chunk = transitions[start:start+WIDTH]
            total += 1
            if any(a == b for a, b in chunk):
                rejected += 1
            else:
                packets.append(list(reversed(chunk)))
    assert (total, rejected, len(packets)) == (352, 70, 282)
    return packets, hashlib.sha256(raw).hexdigest()

def allowed_leading_digits(byte_values):
    M = RADIX ** (WIDTH - 1)
    H = BYTE_BASE ** 17
    allowed = set()
    for byte in byte_values:
        lo = (byte * H) // M
        hi = ((byte + 1) * H - 1) // M
        allowed.update(range(max(0, lo), min(27, hi) + 1))
    return sorted(allowed)

def groups_from_digits(digits):
    assert len(digits) == WIDTH
    groups = []
    for g in range(7):
        x = 0
        for d in digits[4*g:4*g+4]:
            x = x * RADIX + d
        groups.append(x)
    groups.append(digits[28] * RADIX + digits[29])
    return groups

def convert_digits_to_bytes(digits):
    groups = groups_from_digits(digits)
    carry = 0
    little_endian = []
    trace = []
    for t in range(18):
        s = carry + sum(
            groups[g] * COEFFICIENTS[t][g] for g in range(8)
        )
        assert s <= MAX_SUMS[t]
        byte = s % BYTE_BASE
        carry = s // BYTE_BASE
        little_endian.append(byte)
        trace.append((s, carry))
    return bytes(reversed(little_endian)), carry, trace

def digits_from_integer(value):
    assert 0 <= value < RADIX**WIDTH
    digits = [0] * WIDTH
    for i in range(WIDTH - 1, -1, -1):
        value, digits[i] = divmod(value, RADIX)
    assert value == 0
    return digits

def self_test(samples=1000, seed=44):
    rng = random.Random(seed)
    key = {a: [b for b in range(29) if b != a] for a in range(29)}
    for a in range(29):
        rng.shuffle(key[a])
    inverse = {(a, b): d for a in range(29) for d, b in enumerate(key[a])}
    for _ in range(samples):
        plaintext = bytes(rng.choice(ASCII_BYTES) for _ in range(18))
        digits = digits_from_integer(int.from_bytes(plaintext, "big"))
        original_transitions = []
        state = rng.randrange(29)
        for digit in reversed(digits):
            successor = key[state][digit]
            original_transitions.append((state, successor))
            state = successor
        packet = list(reversed(original_transitions))
        recovered_digits = [inverse[e] for e in packet]
        assert recovered_digits == digits
        recovered, overflow, trace = convert_digits_to_bytes(recovered_digits)
        assert overflow == 0 and recovered == plaintext
        assert all(s <= MAX_SUMS[t] for t, (s, _) in enumerate(trace))
    return {
        "samples": samples, "shared_secret_rows": 29,
        "packet_digits": WIDTH, "packet_bytes": 18,
        "all_bytes_ascii": True, "carry_max": max(MAX_CARRIES),
        "sum_max": max(MAX_SUMS), "roundtrip": "exact",
    }

def build_and_solve(repo_root: Path, mode: str, seconds: int, seed: int):
    from ortools.sat.python import cp_model

    packets, corpus_sha256 = load_source(repo_root)
    byte_values = list(range(128)) if mode == "7bit" else ASCII_BYTES
    lead_allowed = allowed_leading_digits(byte_values)
    lead_by_row = {a: set() for a in range(29)}
    for packet in packets:
        a, b = packet[0]
        lead_by_row[a].add(b)
    max_leading = max(map(len, lead_by_row.values()))
    assert max_leading <= len(lead_allowed)

    model = cp_model.CpModel()
    rank = {}
    for a in range(29):
        row = []
        for b in range(29):
            if a == b:
                continue
            name = f"rank_{a}_{b}"
            if b in lead_by_row[a]:
                var = model.new_int_var_from_domain(
                    cp_model.Domain.from_values(lead_allowed), name
                )
            else:
                var = model.new_int_var(0, 27, name)
            rank[a, b] = var
            row.append(var)
        model.add_all_different(row)

    for p, packet in enumerate(packets):
        groups = []
        for g in range(8):
            x = model.new_int_var(0, GROUP_MAX[g], f"group_{p}_{g}")
            n = 4 if g < 7 else 2
            terms = [
                (RADIX ** (n - 1 - j)) * rank[packet[g*4+j]]
                for j in range(n)
            ]
            model.add(x == sum(terms))
            groups.append(x)

        previous_carry = None
        for t in range(18):
            carry = model.new_int_var(0, MAX_CARRIES[t], f"carry_{p}_{t}")
            byte = model.new_int_var_from_domain(
                cp_model.Domain.from_values(byte_values), f"byte_{p}_{t}"
            )
            lhs = sum(
                COEFFICIENTS[t][g] * groups[g]
                for g in range(8) if COEFFICIENTS[t][g]
            )
            if previous_carry is not None:
                lhs += previous_carry
            model.add(lhs == BYTE_BASE * carry + byte)
            previous_carry = carry
        model.add(previous_carry == 0)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = seconds
    solver.parameters.num_search_workers = 8
    solver.parameters.random_seed = seed
    solver.parameters.log_search_progress = True
    start = time.time()
    status = solver.solve(model)
    result = {
        "mode": mode, "status": solver.status_name(status),
        "elapsed_seconds": time.time() - start,
        "time_limit_seconds": seconds, "corpus_sha256": corpus_sha256,
        "page_count": 55, "rune_count": 12956,
        "complete_packets": 352, "marker_affected_packets_dropped": 70,
        "clean_packets": len(packets), "digits_per_packet": 30,
        "bytes_per_packet": 18, "lead_allowed_digits": lead_allowed,
        "max_distinct_leading_edges_per_row": max_leading,
        "carry_bound_max": max(MAX_CARRIES), "sum_bound_max": max(MAX_SUMS),
    }
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        row_key = {
            (a, d): b for a in range(29) for b in range(29) if b != a
            for d in [solver.value(rank[a, b])]
        }
        assert all(
            sorted(row_key[(a, d)] for d in range(28))
            == [b for b in range(29) if b != a] for a in range(29)
        )
        plaintext_packets = []
        for packet in packets:
            digits = [solver.value(rank[e]) for e in packet]
            value = 0
            for digit in digits:
                value = value * RADIX + digit
            assert value < BYTE_BASE**18
            plaintext = value.to_bytes(18, "big")
            assert digits_from_integer(int.from_bytes(plaintext, "big")) == digits
            assert all(b in byte_values for b in plaintext)
            recovered, overflow, _ = convert_digits_to_bytes(digits)
            assert overflow == 0 and recovered == plaintext
            for edge, digit in zip(packet, digits):
                assert row_key[(edge[0], digit)] == edge[1]
            plaintext_packets.append(plaintext)
        joined = b"".join(plaintext_packets)
        result.update({
            "rank_rows": 29, "rank_entries": len(rank),
            "decoded_bytes": len(joined),
            "printable_bytes": sum(32 <= b <= 126 for b in joined),
            "letter_bytes": sum(65 <= b <= 90 or 97 <= b <= 122 for b in joined),
            "space_bytes": joined.count(b" "),
            "control_bytes": {
                str(b): joined.count(bytes([b]))
                for b in sorted(set(joined)) if b < 32
            },
            "plaintext": joined.decode("ascii", "replace"),
            "rank": {f"{a},{b}": solver.value(v) for (a,b),v in rank.items()},
            "packet_hex": [p.hex() for p in plaintext_packets],
        })
    (repo_root / f"full_octet_{mode}_result.json").write_text(
        json.dumps(result, indent=2) + "\n"
    )
    return result

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["7bit", "printable"], default="printable")
    ap.add_argument("--seconds", type=int, default=780)
    ap.add_argument("--seed", type=int, default=44)
    ap.add_argument("--self-test-only", action="store_true")
    ap.add_argument("--self-test-samples", type=int, default=1000)
    args = ap.parse_args()
    if args.self_test_only:
        print(json.dumps(self_test(args.self_test_samples, args.seed), indent=2))
        return
    repo_root = Path(__file__).resolve().parents[1]
    print(json.dumps(build_and_solve(repo_root, args.mode, args.seconds, args.seed), indent=2))

if __name__ == "__main__":
    main()
