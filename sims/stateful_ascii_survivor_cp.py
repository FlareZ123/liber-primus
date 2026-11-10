"""Two-ASCII-octet CP-SAT feasibility test for the one surviving
stationary GP28 byte framing. Requires ortools (Python 3.11+).

The untrusted 29x28 substitution rows are *simultaneously solved*, each
an all-different permutation. Every retained original 30-rune packet is
constrained to admit two printable ASCII high octets. This is an exact
necessary condition on 18-byte big-endian packet decoding, not a
cryptographic decryption or a sufficient condition for plaintext.

See im-results/stateful-radix28-ascii-octet-bound.md.
"""

import json
from pathlib import Path

from ortools.sat.python import cp_model

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
WIDTH = 30
PHASE = 29
ASCII = frozenset((9, 10, 13, *range(32, 127)))
DIGIT_PLACE = 28 ** (WIDTH - 4)
TWO_BYTE_PLACE = 256 ** (WIDTH * 3 // 5 - 2)


def read_original_packets():
    """Get 30 original cipher transitions per clean packet, page phase29."""
    corpus = json.loads(SOURCE.read_text(encoding="utf-8"))
    pages = [p["indices"] for p in corpus["pages"]
             if p["status"] == "unsolved" and p["indices"]]
    assert len(pages) == 55
    assert sum(map(len, pages)) == 12956
    full = []
    rejected = 0
    for page in pages:
        transitions = list(zip(page[:-1], page[1:]))
        for start in range(PHASE, len(transitions) - WIDTH + 1, WIDTH):
            original = transitions[start:start + WIDTH]
            if any(a == b for a, b in original):
                rejected += 1
                continue
            full.append(list(reversed(original)))
    assert len(full) == 282 and rejected == 70
    return full, rejected


def allowed_prefix_intervals():
    """Exact BigInt-equivalent domains for 4 leading radix28 digits.

    Any complete 30-digit integer with prefix p lies between
    p*28^26 and (p+1)*28^26-1. The 18-byte top-two-word interval has
    endpoints obtained by dividing each bound by 256^16. A prefix is
    allowed if at least one endpoint has both high octets in ASCII;
    the endpoints differ by at most one.
    """
    runs = []
    begin = None
    for prefix in range(28 ** 4):
        low = prefix * DIGIT_PLACE // TWO_BYTE_PLACE
        high = ((prefix + 1) * DIGIT_PLACE - 1) // TWO_BYTE_PLACE
        assert 0 <= high - low <= 1
        permitted = any(
            (v >> 8) in ASCII and (v & 255) in ASCII
            for v in range(low, high + 1)
        )
        if permitted and begin is None:
            begin = prefix
        if not permitted and begin is not None:
            runs.append((begin, prefix - 1))
            begin = None
    if begin is not None:
        runs.append((begin, 28 ** 4 - 1))
    assert len(runs) == 294
    assert sum(end - start + 1 for start, end in runs) == 77597
    return runs


def make_model(packets, allowed):
    """Create a stationary 29-row secret key subject to all original prefixes."""
    model = cp_model.CpModel()
    rank = {}
    for a in range(29):
        row = []
        for b in range(29):
            if a == b:
                continue
            var = model.new_int_var(0, 27, f"rank_{a}_{b}")
            rank[(a, b)] = var
            row.append(var)
        model.add_all_different(row)
    allowed_domain = cp_model.Domain.FromIntervals(allowed)
    seen = set()
    for packet in packets:
        first = packet[:4]
        coefficient = (28 ** 3, 28 ** 2, 28, 1)
        expr = sum(coefficient[i] * rank[edge] for i, edge in enumerate(first))
        model.add_linear_expression_in_domain(expr, allowed_domain)
        seen.add(first[0])
    # Strengthen the interval restriction with the one-digit result.
    lead_allowed = [0, 1] + list(range(3, 12))
    for pair in seen:
        model.add_allowed_assignments(
            [rank[pair]], [(d,) for d in lead_allowed])
    return model, rank, len(seen)


def solve(packets, seconds=180):
    """Prove infeasibility or find a satisfying complete 29-row code table."""
    intervals = allowed_prefix_intervals()
    model, rank, distinct = make_model(packets, intervals)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = seconds
    solver.parameters.num_search_workers = 8
    solver.parameters.random_seed = 44
    status = solver.solve(model)
    name = solver.status_name(status)
    result = {
        "status": name, "seconds": solver.wall_time,
        "branches": solver.num_branches,
        "conflicts": solver.num_conflicts,
        "original_packet_constraints": len(packets),
        "distinct_original_first_transition_edges": distinct,
        "prefix4_ascii_eligible_values": 77597,
        "prefix4_total_values": 28 ** 4,
        "prefix4_allowed_intervals": len(intervals),
        "row_permutations": 29,
    }
    if status in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        values = {pair: solver.value(var) for pair, var in rank.items()}
        assert all(
            sorted(values[(a, b)] for b in range(29) if b != a)
            == list(range(28)) for a in range(29))
        octets = []
        for packet in packets:
            value = 0
            for edge in packet:
                value = value * 28 + values[edge]
            # Some unconstrained suffixes may encode integers above 18 bytes;
            # track these exactly, rather than silently truncating.
            if value >= 256 ** 18:
                octets.append(None)
            else:
                octets.append(value.to_bytes(18, "big"))
        valid = [b for b in octets if b is not None]
        all_text = sum(all(x in ASCII for x in b) for b in valid)
        high_two = sum(all(x in ASCII for x in b[:2]) for b in valid)
        result.update(
            "diagnostic_key_reencodes_all_packets": True,
            "actually_18_byte_packets": len(valid),
            "actually_high_two_ascii": high_two,
            "actually_all_18_ascii": all_text,
            "most_common_prefixes": [b[:4].hex() for b in valid[:12]],
            "diagnostic_warning": "Key was optimized for two high octets, "
            "not recovered from independent Cicada evidence."
        )
    return result


def main():
    packets, excluded_markers = read_original_packets()
    result = solve(packets)
    print(json.dumps({
        "source": str(SOURCE.relative_to(ROOT)),
        "rejected_marker_packets": excluded_markers,
        "framing": "page-local, width30, phase29, reversed digit order",
        "assumptions": "29 fixed predecessor-indexed permutations of 28",
        "ascii_bytes": "09 0a 0d 20..7e",
        "two_high_ascii_octets": result,
        "interpretation": "INFEASIBLE proves exclusion; FEASIBLE only "
        "passes one necessary prefix condition; UNKNOWN is inconclusive.",
    }, indent=2))


if __name__ == "__main__":
    main()
