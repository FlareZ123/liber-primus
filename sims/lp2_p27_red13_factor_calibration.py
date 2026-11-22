"""Calibrate the frozen p27 red-13 factor route from Director issue #1611.

Python 3.13 + SymPy 1.14.0.  Reads only the canonical ink annotations.

The matched null preserves exactly 30 marked positions among 255 red events.
Because zero-based lexicographic combination rank is a bijection from those
30-of-255 subsets to [0, C(255, 30)-1], the null rank is exactly uniform.
The script therefore computes exact p27-divisibility probability in rank
space and samples only the conditional quotient distribution for the
expensive 79/80-bit prime-factor test.  This is distribution-equivalent to
sampling full matched tapes and rejecting those whose ranks are not divisible.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from sympy import factorint, prime

ROOT = Path(__file__).resolve().parent.parent
INK_PATH = ROOT / "resources" / "liber-primus" / "lp2-ink-annotations.json"

TOTAL_13 = 31
N_EVENTS = 255
N_MARKS = 30
P27_PAGE = 27
P27_OFFSET = 19
P27_DIVISOR = 60667
EXPECTED_RANK = 816613232064430740393939040116034006349
EXPECTED_ONION_FACTOR = 521821166063052627702311
SEED = 0x1611
CONDITIONAL_TRIALS = 1000
MASK64 = (1 << 64) - 1


def choose(n: int, k: int) -> int:
    """Return exact binomial coefficient."""
    return math.comb(n, k)


def lex_rank(n: int, k: int, positions: list[int]) -> int:
    """Return zero-based lexicographic rank of an increasing combination."""
    if len(positions) != k:
        raise AssertionError(f"expected {k} positions, got {len(positions)}")

    rank = 0
    previous = -1
    for i, position in enumerate(positions):
        remaining = k - i
        rank += choose(n - previous - 1, remaining)
        rank -= choose(n - position, remaining)
        previous = position
    return rank


def splitmix64(seed: int):
    """Yield deterministic SplitMix64 words."""
    state = seed & MASK64
    while True:
        state = (state + 0x9E3779B97F4A7C15) & MASK64
        z = state
        z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & MASK64
        z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & MASK64
        yield (z ^ (z >> 31)) & MASK64


def conditional_quotients(count: int, maximum: int, seed: int) -> list[int]:
    """Sample uniformly from integers 1..maximum using SplitMix64 rejection."""
    if maximum <= 0 or maximum >= (1 << 114):
        raise AssertionError("expected positive quotient bound below 2^114")

    words = splitmix64(seed)
    space = 1 << 114
    limit = (space // maximum) * maximum
    out: list[int] = []

    while len(out) < count:
        value = ((next(words) << 64) | next(words)) & (space - 1)
        if value >= limit:
            continue
        out.append((value % maximum) + 1)

    return out


def wilson_interval(hits: int, trials: int, z: float = 1.959963984540054) -> tuple[float, float]:
    """Return a two-sided Wilson score interval."""
    p = hits / trials
    denominator = 1 + z * z / trials
    center = (p + z * z / (2 * trials)) / denominator
    half = z * math.sqrt(
        p * (1 - p) / trials + z * z / (4 * trials * trials)
    ) / denominator
    return center - half, center + half


def main() -> None:
    ink = json.loads(INK_PATH.read_text(encoding="utf-8"))

    events: list[dict[str, int | float | str]] = []
    serial = 0
    red_marks: list[tuple[int, int]] = []

    for page in sorted(ink["pages"], key=lambda item: item["page"]):
        page_number = int(page["page"])

        for span in page.get("red_spans", []):
            for i, _rune in enumerate(span["runes"]):
                events.append(
                    {
                        "page": page_number,
                        "offset": span["start"] + i + 0.5,
                        "kind": "red",
                        "color": "red",
                        "serial": serial,
                    }
                )
                serial += 1

        for offset, dots, color in page.get("large_punctuation", []):
            if dots != 13:
                continue
            events.append(
                {
                    "page": page_number,
                    "offset": offset,
                    "kind": "dot13",
                    "color": color,
                    "serial": serial,
                }
            )
            serial += 1
            if color == "red":
                red_marks.append((page_number, int(offset)))

    events.sort(
        key=lambda event: (
            event["page"],
            event["offset"],
            0 if event["kind"] == "dot13" else 1,
            event["serial"],
        )
    )

    assert len(events) == 256
    assert sum(event["kind"] == "red" for event in events) == 225
    assert sum(
        event["kind"] == "dot13" and event["color"] == "red"
        for event in events
    ) == 30
    assert sum(
        event["kind"] == "dot13" and event["color"] == "black"
        for event in events
    ) == 1

    red_only = [
        event
        for event in events
        if not (event["kind"] == "dot13" and event["color"] == "black")
    ]
    positions = [
        index
        for index, event in enumerate(red_only)
        if event["kind"] == "dot13"
    ]

    assert len(red_only) == N_EVENTS
    assert len(positions) == N_MARKS

    rank = lex_rank(N_EVENTS, N_MARKS, positions)
    assert rank == EXPECTED_RANK

    mark_rows = []
    exact_hits = []
    for page_number, offset in red_marks:
        if page_number < 1 or offset <= 0:
            mark_rows.append(
                {
                    "page": page_number,
                    "offset": offset,
                    "eligible": False,
                }
            )
            continue

        page_prime = int(prime(page_number))
        divisor = TOTAL_13 * offset * page_prime
        exact = rank % divisor == 0

        row = {
            "page": page_number,
            "offset": offset,
            "pagePrime": page_prime,
            "divisor": divisor,
            "eligible": True,
            "exactDivisor": exact,
        }

        if exact:
            quotient = rank // divisor
            factors = {str(factor): exponent for factor, exponent in factorint(quotient).items()}
            row["quotientBits"] = quotient.bit_length()
            row["quotientFactors"] = factors
            exact_hits.append(row)

        mark_rows.append(row)

    eligible_rows = [row for row in mark_rows if row["eligible"]]
    assert len(red_marks) == 30
    assert len(eligible_rows) == 28
    assert len(exact_hits) == 1
    assert exact_hits[0]["page"] == P27_PAGE
    assert exact_hits[0]["offset"] == P27_OFFSET
    assert exact_hits[0]["divisor"] == P27_DIVISOR

    p27_factors = exact_hits[0]["quotientFactors"]
    assert str(EXPECTED_ONION_FACTOR) in p27_factors
    assert EXPECTED_ONION_FACTOR.bit_length() == 79

    state_count = choose(N_EVENTS, N_MARKS)
    divisible_rank_count = (state_count - 1) // P27_DIVISOR + 1
    exact_divisibility_rate = divisible_rank_count / state_count

    quotient_maximum = (state_count - 1) // P27_DIVISOR
    quotients = conditional_quotients(CONDITIONAL_TRIALS, quotient_maximum, SEED)

    large_prime_hits = 0
    for index, quotient in enumerate(quotients, start=1):
        factors = factorint(quotient)
        hit = any(
            79 <= int(factor).bit_length() <= 80
            for factor in factors
        )
        large_prime_hits += int(hit)

        if index % 100 == 0:
            print(
                f"conditional factor sample {index}/{CONDITIONAL_TRIALS}: "
                f"{large_prime_hits} hits",
                flush=True,
            )

    assert large_prime_hits == 29

    conditional_rate = large_prime_hits / CONDITIONAL_TRIALS
    conditional_low, conditional_high = wilson_interval(
        large_prime_hits, CONDITIONAL_TRIALS
    )

    joint_rate = exact_divisibility_rate * conditional_rate
    joint_low = exact_divisibility_rate * conditional_low
    joint_high = exact_divisibility_rate * conditional_high

    result = {
        "status": "PASS",
        "sourceCensus": {
            "red13Marks": len(red_marks),
            "eligibleDivisors": len(eligible_rows),
            "exactDivisibilityHits": len(exact_hits),
            "uniqueHit": exact_hits[0],
            "allMarks": mark_rows,
        },
        "matchedNull": {
            "equivalence": (
                "uniform 30-of-255 tapes map bijectively to uniform zero-based "
                "lexicographic ranks"
            ),
            "stateCount": str(state_count),
            "p27Divisor": P27_DIVISOR,
            "exactDivisibleRankCount": str(divisible_rank_count),
            "exactDivisibilityRate": exact_divisibility_rate,
            "conditionalFactorSample": {
                "sampler": "SplitMix64 over uniform positive divisible-rank quotients",
                "seed": hex(SEED),
                "trials": CONDITIONAL_TRIALS,
                "hitsWith79Or80BitPrimeFactor": large_prime_hits,
                "rate": conditional_rate,
                "wilson95": [conditional_low, conditional_high],
            },
            "jointEstimate": joint_rate,
            "jointWilson95": [joint_low, joint_high],
        },
        "decision": (
            "p27 is the sole exact-divisor hit among 28 eligible source marks; "
            "the frozen p27 divisibility plus 79/80-bit-prime conjunction is "
            "rare under the matched tape null, but this does not authenticate "
            "the onion interpretation or recover a historical receiver."
        ),
    }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
