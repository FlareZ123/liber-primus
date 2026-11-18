#!/usr/bin/env python3
"""Calibrate the three positive c=1 source-census direction vectors exactly.

The key-free all-rule census on the eight #1329 windows found only:
  * B7_prev_G, reversed orientation, with hundreds of exact sites;
  * C_cur_wp, forward/reversed, with 48 exact sites each.

This script forward-plants native GP words under those exact selectors and the
external c=1 pointer mechanics for conventions 021 and 101, under both retry
models. It is a decision gate for the surviving source signals, not a key
search.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import random
import re
import sys

N = 29
KEEP = 0.19


def encode_english(text: str, corpus: dict) -> list[list[int]]:
    spell = {s: i for i, s in enumerate(corpus["translit"])}
    digraphs = sorted((s for s in spell if len(s) > 1), key=len, reverse=True)
    words: list[list[int]] = []
    for raw in re.findall(r"[A-Za-z]+", text):
        word = (
            raw.upper()
            .replace("QU", "CW")
            .replace("K", "C")
            .replace("V", "U")
            .replace("Z", "S")
        )
        out: list[int] = []
        i = 0
        while i < len(word):
            token = next((s for s in digraphs if word.startswith(s, i)), None)
            if token is not None:
                out.append(spell[token])
                i += len(token)
            elif word[i] in spell:
                out.append(spell[word[i]])
                i += 1
            else:
                i += 1
        if out:
            words.append(out)
    return words


def native_weights(local: Path, corpus: dict) -> list[float]:
    words = encode_english(
        (local / "resources/control/shakespeare_first300k.txt").read_text(
            encoding="utf-8"
        ),
        corpus,
    )
    assert len(words) == 55407
    counts = [1] * N
    for previous, current in zip(words, words[1:]):
        counts[(current[0] - previous[-1]) % N] += 1
    total = sum(counts)
    return [math.log(N * count / total) for count in counts]


def gp_sum(word: list[int], primes: list[int]) -> int:
    return sum(primes[rune] for rune in word)


def selector_direction(
    selector: str,
    orientation: int,
    word_index: int,
    cipher_words: list[list[int]],
    primes: list[int],
    metadata: list[dict],
) -> int:
    if word_index == 0:
        base = 1
    elif selector == "B7_prev_G":
        base = 1 if gp_sum(cipher_words[-1], primes) % 7 <= 3 else -1
    elif selector == "C_cur_wp":
        base = 1 if metadata[word_index]["wp"] > metadata[word_index - 1]["wp"] else -1
    else:
        raise ValueError(selector)
    return base * orientation


def source_score(
    tabs,
    rule,
    orientation: int,
    weights: list[float],
    coin_safe: bool,
) -> dict:
    hist = [0] * N
    sites = 0
    for head, runes, _lens, spans, words in tabs:
        prev0 = int(head.split()[2])
        directions = [rule(words, w) * orientation for w in range(len(words))]
        for i in range(1, len(spans)):
            if directions[i - 1] != 1 or directions[i] != -1:
                continue
            prev_start, prev_end_exclusive = spans[i - 1]
            previous_final_index = prev_end_exclusive - 1
            if coin_safe:
                comparator = (
                    runes[previous_final_index - 1]
                    if previous_final_index > prev_start
                    else runes[spans[i - 2][1] - 1]
                    if i >= 2
                    else prev0
                )
                if runes[previous_final_index] == comparator:
                    continue
            current_first_index = spans[i][0]
            residue = (runes[current_first_index] - runes[previous_final_index]) % N
            hist[residue] += 1
            sites += 1
    return {
        "sites": sites,
        "llr": sum(count * weights[i] for i, count in enumerate(hist)),
    }


def matched_native_sections(
    tabs,
    by_length: dict[int, list[list[int]]],
    trial: int,
) -> list[list[list[int]]]:
    used: dict[int, int] = {}
    sections: list[list[list[int]]] = []
    for _head, _runes, _lens, spans, _words in tabs:
        section: list[list[int]] = []
        for start, end in spans:
            length = end - start
            choices = by_length[length]
            ordinal = used.get(length, 0)
            used[length] = ordinal + 1
            section.append(choices[(ordinal * 67 + trial * 131) % len(choices)])
        sections.append(section)
    return sections


def plant_section(
    native_words: list[list[int]],
    metadata: list[dict],
    prev0: int,
    primes: list[int],
    seed: int,
    h: int,
    m: int,
    model: str,
    selector: str,
    orientation: int,
) -> tuple[list[list[int]], list[int], int]:
    key_rng = random.Random(seed)
    retry_rng = random.Random(seed ^ 0x9E3779B97F4A7C15)
    key: dict[int, int] = {}

    def key_at(index: int) -> int:
        if index not in key:
            key[index] = key_rng.randrange(N)
        return key[index]

    pointer = 0
    previous_cipher = prev0
    previous_direction: int | None = None
    previous_last_key: int | None = None
    cipher_words: list[list[int]] = []
    directions: list[int] = []
    exact_reuses = 0

    for word_index, plain_word in enumerate(native_words):
        direction = selector_direction(
            selector,
            orientation,
            word_index,
            cipher_words,
            primes,
            metadata,
        )
        directions.append(direction)

        prior_final = cipher_words[-1][-1] if cipher_words else None
        prior_comparator = None
        if cipher_words:
            prior_word = cipher_words[-1]
            prior_comparator = (
                prior_word[-2]
                if len(prior_word) >= 2
                else cipher_words[-2][-1]
                if len(cipher_words) >= 2
                else prev0
            )

        if previous_direction is not None:
            pointer += 0 if m == 0 else previous_direction if m == 1 else direction
        if h == 1 and direction < 0:
            pointer -= 1

        cipher_word: list[int] = []
        emitted_key_indices: list[int] = []
        for rune_index, plain in enumerate(plain_word):
            comparator = (
                previous_cipher
                if direction > 0
                else None
                if rune_index == 0
                else previous_cipher
            )

            key_index = pointer
            cipher = (plain + key_at(key_index)) % N
            pointer += direction

            if model == "skip":
                attempts = 0
                while (
                    comparator is not None
                    and cipher == comparator
                    and retry_rng.random() >= KEEP
                    and attempts < 5
                ):
                    key_index = pointer
                    cipher = (plain + key_at(key_index)) % N
                    pointer += direction
                    attempts += 1
            else:
                assert model == "coin"
                if comparator is not None and cipher == comparator:
                    pointer += direction
                    if retry_rng.random() >= KEEP:
                        key_index = pointer
                        cipher = (plain + key_at(key_index)) % N
                        pointer += direction

            cipher_word.append(cipher)
            emitted_key_indices.append(key_index)
            previous_cipher = cipher

        if previous_direction == 1 and direction == -1:
            coin_safe = prior_final is not None and prior_final != prior_comparator
            if model == "skip" or coin_safe:
                assert previous_last_key is not None
                assert emitted_key_indices[0] == previous_last_key
                exact_reuses += 1

        cipher_words.append(cipher_word)
        previous_direction = direction
        previous_last_key = emitted_key_indices[-1]

    return cipher_words, directions, exact_reuses


def plant_score(
    sections: list[list[list[int]]],
    tabs,
    primes: list[int],
    weights: list[float],
    seed: int,
    h: int,
    m: int,
    model: str,
    selector: str,
    orientation: int,
) -> dict:
    hist = [0] * N
    sites = 0
    exact = 0

    for section_index, native_words in enumerate(sections):
        head, _runes, _lens, _spans, metadata = tabs[section_index]
        prev0 = int(head.split()[2])
        cipher_words, directions, reused = plant_section(
            native_words,
            metadata,
            prev0,
            primes,
            seed + section_index * 1000003,
            h,
            m,
            model,
            selector,
            orientation,
        )
        exact += reused

        for i in range(1, len(cipher_words)):
            if directions[i - 1] != 1 or directions[i] != -1:
                continue
            previous_word = cipher_words[i - 1]
            comparator = (
                previous_word[-2]
                if len(previous_word) >= 2
                else cipher_words[i - 2][-1]
                if i >= 2
                else prev0
            )
            if model == "coin" and previous_word[-1] == comparator:
                continue
            residue = (cipher_words[i][0] - previous_word[-1]) % N
            hist[residue] += 1
            sites += 1

    assert sum(hist) == sites
    assert exact == sites
    return {
        "sites": sites,
        "llr": sum(count * weights[i] for i, count in enumerate(hist)),
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(
            "usage: lp2_pdir_c1_sectionexact_survivor_controls_sft.py EXTERNAL"
        )
    local = Path(__file__).resolve().parent.parent
    external = Path(sys.argv[1]).resolve()
    work = external / "work/kscreen"
    sys.path.insert(0, str(work))

    import signrules  # type: ignore

    tabs = signrules.section_tables()
    assert len(tabs) == 8
    assert sum(len(runes) for _head, runes, _lens, _spans, _words in tabs) == 12947

    base = signrules.build_rules()
    corpus = json.loads(
        (local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    primes = corpus["prime"]
    weights = native_weights(local, corpus)

    gibran_words = encode_english(
        (local / "resources/control/gibran_prophet_58585.txt").read_text(
            encoding="utf-8"
        ),
        corpus,
    )
    assert len(gibran_words) == 15733
    by_length: dict[int, list[list[int]]] = {}
    for word in gibran_words:
        by_length.setdefault(len(word), []).append(word)

    targets = [
        ("B7_prev_G", -1),
        ("C_cur_wp", 1),
        ("C_cur_wp", -1),
    ]
    output = []

    for target_index, (selector, orientation) in enumerate(targets):
        rule = base[selector]
        original = {
            "skip": source_score(tabs, rule, orientation, weights, coin_safe=False),
            "coin": source_score(tabs, rule, orientation, weights, coin_safe=True),
        }
        results = []
        for conv_name, h, m in (("021", 0, 2), ("101", 1, 0)):
            for model in ("skip", "coin"):
                scores = []
                site_counts = []
                for trial in range(100):
                    sections = matched_native_sections(tabs, by_length, trial)
                    scored = plant_score(
                        sections,
                        tabs,
                        primes,
                        weights,
                        0xB73301
                        + target_index * 0x100000
                        + trial * 271
                        + h * 100003
                        + m * 70001,
                        h,
                        m,
                        model,
                        selector,
                        orientation,
                    )
                    scores.append(scored["llr"])
                    site_counts.append(scored["sites"])
                scores.sort()
                real = original[model]
                results.append(
                    {
                        "convention": conv_name,
                        "model": model,
                        "original_sites": real["sites"],
                        "original_llr": real["llr"],
                        "plant_site_min": min(site_counts),
                        "plant_site_max": max(site_counts),
                        "plant_llr_min": scores[0],
                        "plant_llr_median": scores[49],
                        "plant_llr_max": scores[-1],
                        "plants_at_or_below_original": sum(
                            score <= real["llr"] for score in scores
                        ),
                    }
                )
        output.append(
            {
                "rule": selector,
                "orientation": "forward" if orientation == 1 else "reversed",
                "results": results,
            }
        )

    print(
        json.dumps(
            {
                "screened_source_runes": 12947,
                "targets": output,
                "scope": (
                    "Exact c=1 calibration for every positive vector from the "
                    "section-exact source census; native-GP register only."
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
