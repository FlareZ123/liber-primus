"""Original LP2 256-byte grid against complete 2014-second-seeded Python MT output.

Run from the repository root with Python 3.11 or newer. Read-only, standard
library SFT. This is a finite hypothesis, not an author-authenticated key.
"""
from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha256
from json import loads, dumps
from pathlib import Path
from random import Random

SOURCE = Path("resources/liber-primus/lp2-grid-256.json")
SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
START = int(datetime(2014, 4, 25, tzinfo=timezone.utc).timestamp())
END = int(datetime(2014, 5, 10, tzinfo=timezone.utc).timestamp())


def draw(rng: Random, method: str) -> int:
    if method == "bits8":
        return rng.getrandbits(8)
    if method == "randrange256":
        return rng.randrange(256)
    if method == "float256":
        return int(rng.random() * 256)
    raise ValueError(method)


def produce(seed: int, method: str, size: int) -> bytes:
    rng = Random(seed)
    return bytes(draw(rng, method) for _ in range(size))


def scan(targets: dict[str, bytes], method: str, start: int, stop: int):
    """Search every integer second, including exact 8-byte and full-256 matches."""
    two = {name: 0 for name in targets}
    eight = {name: [] for name in targets}
    full = {name: [] for name in targets}
    for seed in range(start, stop):
        rng = Random(seed)
        first = draw(rng, method)
        second = draw(rng, method)
        eligible = [name for name, target in targets.items()
                    if first == target[0] and second == target[1]]
        if not eligible:
            continue
        suffix = bytes(draw(rng, method) for _ in range(6))
        for name in eligible:
            two[name] += 1
            if suffix == targets[name][2:8]:
                eight[name].append(seed)
                if produce(seed, method, 256) == targets[name]:
                    full[name].append(seed)
    return two, eight, full


def run() -> None:
    obj = loads(SOURCE.read_text(encoding="utf-8"))
    rows = [page["bytes"][8*j:8*(j+1)]
            for page in obj["pages"] for j in range(page["rows"])]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    original = bytes(x for row in rows for x in row)
    assert len(original) == 256 and sha256(original).hexdigest() == SHA256
    targets = {"row-major": original,
               "column-major": bytes(rows[r][c] for c in range(8) for r in range(32))}
    assert targets["row-major"][:8] == bytes([203, 231, 167, 186, 97, 237, 126, 183])
    assert targets["column-major"][:8] == bytes([203, 92, 121, 109, 115, 80, 253, 254])

    for method in ("bits8", "randrange256", "float256"):
        planted = produce(START, method, 256)
        planted_two, planted_eight, planted_full = scan({"plant": planted}, method, START, START+1)
        assert planted_two == {"plant": 1}
        assert planted_eight == {"plant": [START]}
        assert planted_full == {"plant": [START]}

        two, eight, full = scan(targets, method, START, END)
        for layout in targets:
            assert not eight[layout] and not full[layout]
            print(dumps({"source": "original-256", "method": method, "layout": layout,
                         "clock_seconds_exhausted": END-START,
                         "two_byte_matches": two[layout],
                         "eight_byte_matches": eight[layout],
                         "full_matches": full[layout]}))
    print("PASS: source SHA256, three 256-byte plants, and six complete timestamp gates")


if __name__ == "__main__":
    run()
