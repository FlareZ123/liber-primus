#!/usr/bin/env python3
"""Bounded source-known LP2 inner180 -> p55 Python-MT recovery gate (Python 3.11+).

Read-only single-file test. The seed is always a historical UTC integer second.
Original corpus, source table and genuine solved text are never modified.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import random

ROOT = Path(__file__).resolve().parents[1]
START = int(datetime(2014, 4, 25, tzinfo=timezone.utc).timestamp())
END = int(datetime(2014, 5, 9, 23, 59, 59, tzinfo=timezone.utc).timestamp())
PLAIN56 = (
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
    "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
)
TABLE_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"


def decode_gp(text: str, alphabet: list[str]) -> list[int]:
    ordered = sorted(enumerate(alphabet), key=lambda t: -len(t[1]))
    out: list[int] = []
    for word in text.upper().split():
        while word:
            matched = next(((index, token) for index, token in ordered if word.startswith(token)), None)
            assert matched is not None, f"untranslatable solved word fragment: {word}"
            index, token = matched
            out.append(index)
            word = word[len(token):]
    return out


def load_original() -> tuple[list[int], dict[tuple[str, str], list[int]], list[int], list[int]]:
    grid = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json").read_text(encoding="utf-8"))
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    byte_values: list[int] = grid["bytes"]
    assert len(byte_values) == 256
    assert sha256(bytes(byte_values)).hexdigest() == TABLE_SHA256

    known_plain56 = decode_gp(PLAIN56, corpus["translit"])
    known_cipher56 = corpus["pages"][56]["indices"]
    clear57 = corpus["pages"][57]["indices"]
    assert [len(corpus["pages"][55]["indices"]), len(known_plain56), len(known_cipher56), len(clear57)] == [76, 85, 85, 95]
    assert known_plain56[56] == 0  # The genuine p56 transparent-F interruption.

    # A printed 32x8 rectangle has a 76-cell perimeter and a row-major 30x6 core.
    inner = [8 * row + col for row in range(1, 31) for col in range(1, 7)]
    ring = (
        [col for col in range(8)]
        + [8 * row + 7 for row in range(1, 32)]
        + [8 * 31 + col for col in range(6, -1, -1)]
        + [8 * row for row in range(30, 0, -1)]
    )
    assert len(inner) == 180 and len(ring) == 76
    assert len(set(inner + ring)) == 256

    def required_key(cipher: int, plain: int, operation: str) -> int:
        if operation == "xor":
            return cipher ^ plain
        if operation == "subtract":
            return (cipher - plain) % 256
        return (plain - cipher) % 256

    keys: dict[tuple[str, str], list[int]] = {}
    for register, p56 in (("solved", known_plain56), ("printed", known_cipher56)):
        known = p56 + clear57
        assert len(known) == 180
        for operation in ("xor", "subtract", "add"):
            keys[(register, operation)] = [
                required_key(byte_values[pos], plain, operation)
                for pos, plain in zip(inner, known)
            ]
    return inner, keys, ring, known_plain56 + clear57


def get_draw(method: str):
    if method == "getrandbits":
        return lambda generator: generator.getrandbits(8)
    if method == "randrange":
        return lambda generator: generator.randrange(256)
    assert method == "float"
    return lambda generator: int(generator.random() * 256)


def main() -> None:
    inner, required, ring, known = load_original()
    assert inner[:6] == [9, 10, 11, 12, 13, 14]
    assert END - START + 1 == 1_296_000

    # Independent positive: encode all 256 genuine GP plaintext runes using
    # one secret historical seed, then ask the same blind scan to recover it.
    secret_seed = START + 3301
    source_plain55 = known[-95:-19]  # exactly 76 authentic source-p57 runes
    assert len(source_plain55) == 76
    real_stream = random.Random(secret_seed)
    source_pad = [real_stream.getrandbits(8) for _ in range(256)]
    planted = [0] * 256
    for pos, plain in zip(inner, known):
        planted[pos] = plain ^ source_pad[pos]
    for pos, plain in zip(ring, source_plain55):
        planted[pos] = plain ^ source_pad[pos]
    assert len(planted) == 256
    planted_required = [planted[pos] ^ plain for pos, plain in zip(inner, known)]
    assert planted_required == [source_pad[pos] for pos in inner]

    tally: dict[tuple[str, str, str], Counter[int]] = {}
    positive_winners: list[int] = []
    for method in ("getrandbits", "randrange", "float"):
        draw = get_draw(method)
        method_targets = dict(required)
        if method == "getrandbits":
            method_targets[("planted", "xor")] = planted_required
        target_prefix = {key: key_stream[:2] for key, key_stream in method_targets.items()}
        stats: dict[tuple[str, str], Counter[int]] = {key: Counter() for key in method_targets}
        for seed in range(START, END + 1):
            generator = random.Random(seed)
            for _ in range(9):
                draw(generator)
            first, second = draw(generator), draw(generator)
            for label, prefix in target_prefix.items():
                if [first, second] != prefix:
                    continue
                checkpoint = generator.getstate()
                prefix_matches = 2
                for index in range(2, 6):
                    if draw(generator) != method_targets[label][index]:
                        break
                    prefix_matches += 1
                generator.setstate(checkpoint)
                stats[label][prefix_matches] += 1

                if prefix_matches >= 4:
                    # Test all 180 independent source-known symbols, including
                    # actual printed byte positions rather than a fitted clock.
                    full = random.Random(seed)
                    all_pad = [draw(full) for _ in range(256)]
                    complete = all(
                        all_pad[pos] == key for pos, key in zip(inner, method_targets[label])
                    )
                    if label == ("planted", "xor") and complete:
                        positive_winners.append(seed)
                        restored = [planted[pos] ^ all_pad[pos] for pos in ring]
                        assert restored == source_plain55
                    elif label != ("planted", "xor") and complete:
                        raise AssertionError(f"An authentic original-key match requires follow-up: {method} {label} {seed}")
        for label, by_score in stats.items():
            tally[(method, *label)] = by_score
            print(f"{method:11s} {label[0]:7s} {label[1]:8s} "
                  f"two={by_score[2]} three={by_score[3]} fourPlus={sum(n for k, n in by_score.items() if k >= 4)}")

    assert positive_winners == [secret_seed], positive_winners
    expected = {
        ("getrandbits", "solved", "xor"): (14, 1),
        ("getrandbits", "solved", "subtract"): (19, 0),
        ("getrandbits", "solved", "add"): (16, 0),
        ("getrandbits", "printed", "xor"): (23, 0),
        ("getrandbits", "printed", "subtract"): (18, 0),
        ("getrandbits", "printed", "add"): (21, 0),
        ("randrange", "solved", "xor"): (21, 1),
        ("randrange", "solved", "subtract"): (22, 0),
        ("randrange", "solved", "add"): (22, 0),
        ("randrange", "printed", "xor"): (22, 0),
        ("randrange", "printed", "subtract"): (16, 0),
        ("randrange", "printed", "add"): (25, 0),
        ("float", "solved", "xor"): (16, 0),
        ("float", "solved", "subtract"): (14, 0),
        ("float", "solved", "add"): (14, 0),
        ("float", "printed", "xor"): (19, 0),
        ("float", "printed", "subtract"): (20, 0),
        ("float", "printed", "add"): (31, 1),
    }
    for label, (two, three) in expected.items():
        observed = tally[label]
        assert (observed[2], observed[3], sum(count for score, count in observed.items() if score >= 4)) == (two, three, 0), (label, observed)
    print(f"PASS: 18 original inverse variants, 1,296,000 seed-seconds per extraction, zero four-byte survivors.")
    print(f"PASS: independent planted seed {secret_seed} recovered; all 180 known + 76 hidden GP runes exactly restored.")


if __name__ == "__main__":
    main()
