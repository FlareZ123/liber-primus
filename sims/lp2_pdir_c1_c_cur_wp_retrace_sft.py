#!/usr/bin/env python3
"""Retry-calibrated key-index retrace gate for the c=1 C_cur_wp survivor.

C_cur_wp moves forward while word position within a page increases and flips
at page resets. Under conventions 021/101, those isolated reversals make the
nominal pointer retrace many prior key indices. Positions sharing a nominal
index must preserve plaintext equality whenever retries did not desynchronize
that reuse. This script compares the untouched source's equality rate on all
nominal repeated-index pairs with 100 complete matched native-GP plants and
reports how often the nominal pairs truly shared emitted key indices.

This is key-independent and uses the exact eight #1329 windows.
"""
from __future__ import annotations

import itertools
import json
from pathlib import Path
import random
import sys

SIMS = Path(__file__).resolve().parent
if str(SIMS) not in sys.path:
    sys.path.insert(0, str(SIMS))

import lp2_pdir_c1_allcausal_native_triage_sft as triage  # noqa: E402

N = 29
KEEP = 0.19


def fixed_directions(rule, metadata: list[dict], orientation: int) -> list[int]:
    return [rule(metadata, i) * orientation for i in range(len(metadata))]


def nominal_indices(
    lengths: list[int],
    directions: list[int],
    h: int,
    m: int,
) -> list[int]:
    pointer = 0
    old: int | None = None
    indices: list[int] = []
    for length, direction in zip(lengths, directions):
        if old is not None:
            pointer += 0 if m == 0 else old if m == 1 else direction
        if h == 1 and direction < 0:
            pointer -= 1
        for _ in range(length):
            indices.append(pointer)
            pointer += direction
        old = direction
    return indices


def pair_positions(indices: list[int]) -> list[tuple[int, int]]:
    groups: dict[int, list[int]] = {}
    for position, index in enumerate(indices):
        groups.setdefault(index, []).append(position)
    pairs: list[tuple[int, int]] = []
    for positions in groups.values():
        if len(positions) >= 2:
            pairs.extend(itertools.combinations(positions, 2))
    return pairs


def equality_score(
    runes: list[int],
    pairs: list[tuple[int, int]],
    emitted_indices: list[int] | None = None,
) -> dict:
    equal = sum(runes[a] == runes[b] for a, b in pairs)
    result = {
        "pairs": len(pairs),
        "equal": equal,
        "rate": equal / len(pairs) if pairs else 0.0,
    }
    if emitted_indices is not None:
        true_reuse = sum(
            emitted_indices[a] == emitted_indices[b]
            for a, b in pairs
        )
        result["true_reuse"] = true_reuse
        result["true_reuse_fraction"] = true_reuse / len(pairs) if pairs else 0.0
    return result


def plant_section(
    native_words: list[list[int]],
    directions: list[int],
    prev0: int,
    seed: int,
    h: int,
    m: int,
    model: str,
) -> tuple[list[int], list[int]]:
    key_rng = random.Random(seed)
    retry_rng = random.Random(seed ^ 0x9E3779B97F4A7C15)
    key: dict[int, int] = {}

    def key_at(index: int) -> int:
        if index not in key:
            key[index] = key_rng.randrange(N)
        return key[index]

    pointer = 0
    old: int | None = None
    previous_cipher = prev0
    cipher: list[int] = []
    emitted_indices: list[int] = []

    for plain_word, direction in zip(native_words, directions):
        if old is not None:
            pointer += 0 if m == 0 else old if m == 1 else direction
        if h == 1 and direction < 0:
            pointer -= 1

        for rune_index, plain in enumerate(plain_word):
            comparator = (
                previous_cipher
                if direction > 0
                else None
                if rune_index == 0
                else previous_cipher
            )

            key_index = pointer
            output = (plain + key_at(key_index)) % N
            pointer += direction

            if model == "skip":
                tries = 0
                while (
                    comparator is not None
                    and output == comparator
                    and retry_rng.random() >= KEEP
                    and tries < 5
                ):
                    key_index = pointer
                    output = (plain + key_at(key_index)) % N
                    pointer += direction
                    tries += 1
            else:
                assert model == "coin"
                if comparator is not None and output == comparator:
                    pointer += direction
                    if retry_rng.random() >= KEEP:
                        key_index = pointer
                        output = (plain + key_at(key_index)) % N
                        pointer += direction

            cipher.append(output)
            emitted_indices.append(key_index)
            previous_cipher = output
        old = direction

    return cipher, emitted_indices


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(
            "usage: lp2_pdir_c1_c_cur_wp_retrace_sft.py EXTERNAL"
        )

    local = SIMS.parent
    external = Path(sys.argv[1]).resolve()
    work = external / "work/kscreen"
    if str(work) not in sys.path:
        sys.path.insert(0, str(work))

    import signrules  # type: ignore

    tabs = signrules.section_tables()
    assert len(tabs) == 8
    assert sum(len(runes) for _head, runes, _lens, _spans, _words in tabs) == 12947

    rule = signrules.build_rules()["C_cur_wp"]
    corpus = json.loads(
        (local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    gibran_words = triage.encode_english(
        (local / "resources/control/gibran_prophet_58585.txt").read_text(
            encoding="utf-8"
        ),
        corpus,
    )
    by_length: dict[int, list[list[int]]] = {}
    for word in gibran_words:
        by_length.setdefault(len(word), []).append(word)

    native_trials = [
        triage.matched_native_sections(tabs, by_length, trial)
        for trial in range(100)
    ]

    results = []
    for orientation in (1, -1):
        orientation_name = "forward" if orientation == 1 else "reversed"
        section_geometry = []
        source_pairs = 0
        source_equal = 0

        for head, runes, _lens, spans, metadata in tabs:
            lengths = [end - start for start, end in spans]
            directions = fixed_directions(rule, metadata, orientation)
            section_geometry.append((int(head.split()[2]), lengths, directions))

        for conv, h, m in (("021", 0, 2), ("101", 1, 0)):
            pairs_by_section = []
            source_pairs = 0
            source_equal = 0
            for tab, (_prev0, lengths, directions) in zip(tabs, section_geometry):
                runes = tab[1]
                nominal = nominal_indices(lengths, directions, h, m)
                assert len(nominal) == len(runes)
                pairs = pair_positions(nominal)
                pairs_by_section.append(pairs)
                scored = equality_score(runes, pairs)
                source_pairs += scored["pairs"]
                source_equal += scored["equal"]

            source_rate = source_equal / source_pairs if source_pairs else 0.0

            for model in ("skip", "coin"):
                rates = []
                true_reuse_fractions = []
                pair_counts = []
                for trial, native_sections in enumerate(native_trials):
                    total_pairs = 0
                    total_equal = 0
                    total_true_reuse = 0
                    for section_index, native_words in enumerate(native_sections):
                        prev0, _lengths, directions = section_geometry[section_index]
                        cipher, emitted = plant_section(
                            native_words,
                            directions,
                            prev0,
                            0xCC3301
                            + orientation * 0x1000000
                            + (0 if conv == "021" else 0x200000)
                            + (0 if model == "skip" else 0x400000)
                            + trial * 271
                            + section_index * 100003,
                            h,
                            m,
                            model,
                        )
                        scored = equality_score(
                            cipher,
                            pairs_by_section[section_index],
                            emitted,
                        )
                        total_pairs += scored["pairs"]
                        total_equal += scored["equal"]
                        total_true_reuse += scored["true_reuse"]

                    assert total_pairs == source_pairs
                    rates.append(total_equal / total_pairs)
                    true_reuse_fractions.append(total_true_reuse / total_pairs)
                    pair_counts.append(total_pairs)

                rates.sort()
                true_reuse_fractions.sort()
                results.append(
                    {
                        "orientation": orientation_name,
                        "convention": conv,
                        "model": model,
                        "nominal_repeated_index_pairs": source_pairs,
                        "original_equal_pairs": source_equal,
                        "original_equal_rate": source_rate,
                        "control_rate_min": rates[0],
                        "control_rate_median": rates[49],
                        "control_rate_max": rates[-1],
                        "controls_at_or_below_original": sum(
                            rate <= source_rate for rate in rates
                        ),
                        "control_true_reuse_fraction_min": true_reuse_fractions[0],
                        "control_true_reuse_fraction_median": true_reuse_fractions[49],
                        "control_true_reuse_fraction_max": true_reuse_fractions[-1],
                    }
                )

    print(
        json.dumps(
            {
                "rule": "C_cur_wp",
                "screened_source_runes": 12947,
                "results": results,
                "scope": (
                    "Nominal repeated-pointer-index equality gate with full "
                    "retry-aware native plants; no candidate key is used."
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
