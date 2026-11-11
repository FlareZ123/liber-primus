#!/usr/bin/env python3
"""Reproduce LP2's 86 section-contiguous doublets and test Wulfic's anti-doublet generators.

Run from the repository root:
    python sims/wulfic_antidoublet_reversibility_gate.py

No third-party packages, language scoring, key search, or random sampling are used.
The source model's random.Random(seed) calls are reproduced exactly.
"""
from __future__ import annotations

import hashlib
import json
import random
from pathlib import Path
from typing import Sequence

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
MASTER_PATH = ROOT / "resources" / "transcriptions" / "liber_primus_master.txt"
N = 29


def encrypt_dodging(
    plain: Sequence[int], key: Sequence[int], *, keep: float, seed: int,
    rekey: str = "next",
) -> list[int]:
    """Literal port of Wulfic tools/lpcore/keys.py::encrypt_dodging at pinned commit.

    c = p + k (mod 29), except that a would-be doublet is re-keyed with probability
    1-keep.
    """
    if rekey not in ("next", "fresh"):
        raise ValueError(f"unknown rekey {rekey!r}")
    rng = random.Random(seed)
    out: list[int] = []
    j = 0
    for p in plain:
        c = (p + key[j]) % N
        j += 1
        if out and c == out[-1] and rng.random() >= keep:
            if rekey == "next":
                c = (p + key[j]) % N
                j += 1
            else:
                c = (p + rng.randrange(N)) % N
        out.append(c)
    return out


def key_switch_ideal(
    plain: Sequence[int], k1: Sequence[int], k2: Sequence[int]
) -> list[int]:
    """Literal port of Wulfic tools/lpcore/leak.py::key_switch_ideal."""
    out: list[int] = []
    for i, p in enumerate(plain):
        c = (p + k1[i]) % N
        if out and c == out[-1]:
            c = (p + k2[i]) % N
        out.append(c)
    return out


def key_switch_literal(
    plain: Sequence[int], k1: Sequence[int], k2: Sequence[int]
) -> list[int | None]:
    """Literal port of Wulfic's image-derived look-ahead switch, including unset outputs."""
    out: list[int | None] = [None] * len(plain)
    for i in range(len(plain)):
        if i + 1 < len(plain) and (
            (plain[i + 1] + k1[i + 1]) % N == (plain[i] + k1[i]) % N
        ):
            if (
                (plain[i + 1] + k2[i + 1]) % N
                == (plain[i] + k2[i]) % N
            ):
                continue
            out[i] = (plain[i] + k2[i]) % N
        else:
            out[i] = (plain[i] + k1[i]) % N
    return out


def original_fingerprint() -> tuple[list[dict[str, int | str]], dict]:
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    runes = corpus["runes"]
    rune_index = {r: i for i, r in enumerate(runes)}
    master_text = MASTER_PATH.read_text(encoding="utf-8")
    split_at = master_text.index("\n\n") + 2
    sections = master_text[split_at:].split("$")[7:16]
    assert len(sections) == 9

    expected_lengths = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316]
    streams = [[rune_index[ch] for ch in section if ch in rune_index]
               for section in sections]
    lengths = [len(stream) for stream in streams]
    assert lengths == expected_lengths, lengths
    assert sum(lengths) == 12956

    events: list[dict[str, int | str]] = []
    global_offset = 0
    pairs = 0
    for segment, stream in zip(range(7, 16), streams):
        for offset in range(1, len(stream)):
            pairs += 1
            if stream[offset] == stream[offset - 1]:
                events.append({
                    "segment": segment,
                    "offset": offset,
                    "global_offset": global_offset + offset,
                    "rune": runes[stream[offset]],
                    "rune_index": stream[offset],
                })
        global_offset += len(stream)
    assert (global_offset, pairs, len(events)) == (12956, 12947, 86)

    source = {
        "master_sha256": hashlib.sha256(MASTER_PATH.read_bytes()).hexdigest(),
        "corpus_sha256": hashlib.sha256(CORPUS_PATH.read_bytes()).hexdigest(),
        "section_lengths": lengths,
        "runes": global_offset,
        "section_contiguous_pairs": pairs,
        "doublets": len(events),
        "uniform_expected_doublets": pairs / N,
        "observed_survival_fraction_of_uniform": len(events) / (pairs / N),
    }
    return events, source


def main() -> None:
    events, source = original_fingerprint()

    next_a = encrypt_dodging(
        [0, 28], [0, 1, 2], keep=0.19, seed=2, rekey="next"
    )
    next_b = encrypt_dodging(
        [0, 0], [0, 1, 2], keep=0.19, seed=2, rekey="next"
    )
    assert next_a == next_b == [0, 1]

    fresh_a = encrypt_dodging(
        [0, 28], [0, 1], keep=0.19, seed=2, rekey="fresh"
    )
    fresh_b = encrypt_dodging(
        [0, 25], [0, 1], keep=0.19, seed=2, rekey="fresh"
    )
    assert fresh_a == fresh_b == [0, 26]

    ideal_a = key_switch_ideal([0, 28], [0, 1], [0, 2])
    ideal_b = key_switch_ideal([0, 0], [0, 1], [0, 2])
    assert ideal_a == ideal_b == [0, 1]

    literal_unset = key_switch_literal([0, 28], [0, 1], [0, 1])
    assert literal_unset == [None, 0]

    rng = random.Random(2)
    first_draw = rng.random()
    fresh_replacement = rng.randrange(N)
    assert first_draw == 0.9560342718892494
    assert fresh_replacement == 27

    result = {
        "source": source,
        "wulfic_source": {
            "repository": "Wulfic/Cicada3301-Liber_Primus",
            "commit": "bf89d3d13aad2b8f2c95ab195cf1b092f250775c",
            "keys_py_blob": "14beffb727141f7c5e8fe0ae49490cd8fb09f7ff",
            "leak_py_blob": "ac1cf59496fb76f48aae9f8d2abbd2f329cbcdf7",
        },
        "fixed_seed_collision_tests": {
            "seed": 2,
            "keep": 0.19,
            "first_random_draw": first_draw,
            "fresh_replacement_key": fresh_replacement,
            "next_key": {
                "plaintext_a": [0, 28],
                "plaintext_b": [0, 0],
                "same_ciphertext": next_a,
            },
            "fresh_key": {
                "plaintext_a": [0, 28],
                "plaintext_b": [0, 25],
                "same_ciphertext": fresh_a,
            },
            "ideal_two_key_switch": {
                "k1": [0, 1],
                "k2": [0, 2],
                "plaintext_a": [0, 28],
                "plaintext_b": [0, 0],
                "same_ciphertext": ideal_a,
            },
            "literal_two_key_switch_unset_output": {
                "plaintext": [0, 28],
                "k1": [0, 1],
                "k2": [0, 1],
                "output": literal_unset,
            },
        },
        "doublet_positions": events,
        "verdict": (
            "The specified forward generators are not injective; no unique inverse "
            "exists without additional source-selected side information."
        ),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
