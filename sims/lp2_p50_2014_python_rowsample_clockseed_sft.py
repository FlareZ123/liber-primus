"""Source-pinned 2014 seed test for CPython 3.13 random.sample of each 8-byte row.

Reads the original image-audited p50 byte table. This is a narrow hypothesis
test, not an LP2 decoder or an authenticated historical RNG attribution.
Windows 11, CPython 3.13.5; no writes, no external packages.
"""

from __future__ import annotations

import hashlib
import json
import random
import sys
from pathlib import Path

SOURCE = Path(__file__).resolve().parent.parent / "resources" / "liber-primus" / "lp2-grid-256.json"
FIRST_SECOND = 203, 231
START = 1397952000  # 2014-04-20 00:00:00 UTC
END = 1401580800  # 2014-06-01 00:00:00 UTC inclusive
EXPECTED_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"


def prefix_length(actual: list[int], target: list[int]) -> int:
    """Return number of equal leading items."""
    count = 0
    for a, b in zip(actual, target):
        if a != b:
            break
        count += 1
    return count


def main() -> None:
    print(f"[SOURCE] Python runtime: {sys.version}")
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    values = data["bytes"]
    assert len(values) == 256
    assert hashlib.sha256(bytes(values)).hexdigest() == EXPECTED_SHA256
    expected = values[:8]
    assert expected[:2] == list(FIRST_SECOND)
    assert len(set(expected)) == 8

    # Synthetic positive: a known seed must be selected, and all eight values
    # recovered, before testing the original unknown table.
    plant_seed = 1399766400  # 2014-05-11 00:00:00 UTC
    planted = random.Random(plant_seed).sample(range(256), 8)
    assert len(set(planted)) == 8
    assert random.Random(plant_seed).sample(range(256), 8) == planted
    print(f"[PLANT] Python sample seed={plant_seed} roundtrip=8/8: {planted}")
    print(f"[SOURCE] Original eight bytes={expected}, UTC seed window={START}..{END}")

    two_prefix = 0
    best_prefix = 0
    best_seeds: list[int] = []
    for seed in range(START, END + 1):
        probe = random.Random(seed)
        if probe.randrange(256) != FIRST_SECOND[0]:
            continue
        if probe.randrange(256) != FIRST_SECOND[1]:
            continue
        # CPython sample(range(256),8) first uses the same randbelow draws,
        # then skips duplicate values. Original first two bytes are distinct.
        two_prefix += 1
        actual = random.Random(seed).sample(range(256), 8)
        length = prefix_length(actual, expected)
        if length > best_prefix:
            best_prefix = length
            best_seeds = []
        if length == best_prefix:
            best_seeds.append(seed)

    print(f"[ORIGINAL] tested={END - START + 1}, 2-byte starts={two_prefix}, "
          f"best prefix={best_prefix}/8; first best seeds={best_seeds[:8]}")
    assert two_prefix == 49
    assert best_prefix == 2
    assert len(best_seeds) == 49
    print("[DECISION] No CPython3.13 sample-without-replacement direct table seed "
          "in the stated historical integer-second window.")


if __name__ == "__main__":
    main()
