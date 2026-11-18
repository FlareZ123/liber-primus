#!/usr/bin/env python3
"""Low-cost native-GP triage for every causal external c=1 direction vector.

For conventions 021 and 101, every forward-to-backward turn under comparator
c=1 gives an exact key-cancellation relation. This script uses the pinned
external rule functions themselves to forward-plant native GP ciphertext for
all causal kept direction rules and both orientations. The three explicitly
acausal current-ciphertext-G rules are excluded because an encryptor cannot
choose their direction before creating the current ciphertext word.

Eight complete original-word-length-matched plants are used per vector and
mechanic as a triage screen. Any survivor requires deeper calibration before
being treated as evidence. A vector below all eight controls is a strong
candidate for cheap retirement under the native-GP register.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import random
import re
import statistics
import sys

N = 29
KEEP = 0.19
TRIALS = 8
POSITIONAL = ("n", "w", "wp", "ws")


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
    source_metadata: list[dict],
    prev0: int,
    primes: list[int],
    seed: int,
    h: int,
    m: int,
    model: str,
    rule,
    orientation: int,
    weights: list[float],
) -> tuple[int, float]:
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
    words: list[dict] = []
    hist = [0] * N
    sites = 0

    for word_index, plain_word in enumerate(native_words):
        positional = {name: source_metadata[word_index][name] for name in POSITIONAL}
        words.append(positional)
        direction = rule(words, word_index) * orientation

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

        words[word_index].update(
            {
                "G": sum(primes[rune] for rune in cipher_word),
                "R": sum(cipher_word),
                "f": cipher_word[0],
                "l": cipher_word[-1],
                "pf": primes[cipher_word[0]],
                "pl": primes[cipher_word[-1]],
            }
        )

        if previous_direction == 1 and direction == -1:
            coin_safe = prior_final is not None and prior_final != prior_comparator
            if model == "skip" or coin_safe:
                assert previous_last_key is not None
                assert emitted_key_indices[0] == previous_last_key
                residue = (cipher_word[0] - prior_final) % N
                hist[residue] += 1
                sites += 1

        cipher_words.append(cipher_word)
        previous_direction = direction
        previous_last_key = emitted_key_indices[-1]

    return sites, sum(count * weights[i] for i, count in enumerate(hist))


def plant_score(
    native_sections: list[list[list[int]]],
    tabs,
    primes: list[int],
    weights: list[float],
    seed: int,
    h: int,
    m: int,
    model: str,
    rule,
    orientation: int,
) -> tuple[int, float]:
    total_sites = 0
    total_llr = 0.0
    for section_index, native_words in enumerate(native_sections):
        head, _runes, _lens, _spans, metadata = tabs[section_index]
        sites, llr = plant_section(
            native_words,
            metadata,
            int(head.split()[2]),
            primes,
            seed + section_index * 1000003,
            h,
            m,
            model,
            rule,
            orientation,
            weights,
        )
        total_sites += sites
        total_llr += llr
    return total_sites, total_llr


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(
            "usage: lp2_pdir_c1_allcausal_native_triage_sft.py EXTERNAL"
        )
    local = Path(__file__).resolve().parent.parent
    external = Path(sys.argv[1]).resolve()
    work = external / "work/kscreen"
    sys.path.insert(0, str(work))

    import dirrules  # type: ignore
    import signrules  # type: ignore

    tabs = signrules.section_tables()
    assert len(tabs) == 8
    assert sum(len(runes) for _head, runes, _lens, _spans, _words in tabs) == 12947

    base = signrules.build_rules()
    extras = dirrules.extra_rules()
    names = [
        line.strip()
        for line in (work / "dir_rules.txt").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    acausal = set(dirrules.EXTRA_ACAUSAL)
    causal_names = [name for name in names if name not in acausal]
    assert len(names) == 66
    assert len(causal_names) == 63
    rules = {
        name: base[name] if name in base else extras[name]
        for name in causal_names
    }

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
    native_trials = [
        matched_native_sections(tabs, by_length, trial)
        for trial in range(TRIALS)
    ]

    originals = {}
    for name in causal_names:
        for orientation in (1, -1):
            originals[(name, orientation, "skip")] = source_score(
                tabs, rules[name], orientation, weights, coin_safe=False
            )
            originals[(name, orientation, "coin")] = source_score(
                tabs, rules[name], orientation, weights, coin_safe=True
            )

    mechanics = [
        ("021", 0, 2, "skip"),
        ("021", 0, 2, "coin"),
        ("101", 1, 0, "skip"),
        ("101", 1, 0, "coin"),
    ]
    summaries = []

    for mechanic_index, (conv, h, m, model) in enumerate(mechanics):
        records = []
        for rule_index, name in enumerate(causal_names):
            rule = rules[name]
            for orientation in (1, -1):
                scores = []
                site_counts = []
                for trial, native_sections in enumerate(native_trials):
                    sites, llr = plant_score(
                        native_sections,
                        tabs,
                        primes,
                        weights,
                        0xC13301
                        + mechanic_index * 0x1000000
                        + rule_index * 0x10000
                        + (0 if orientation == 1 else 0x8000)
                        + trial * 271,
                        h,
                        m,
                        model,
                        rule,
                        orientation,
                    )
                    scores.append(llr)
                    site_counts.append(sites)

                original = originals[(name, orientation, model)]
                sorted_scores = sorted(scores)
                count_at_or_below = sum(score <= original["llr"] for score in scores)
                records.append(
                    {
                        "rule": name,
                        "orientation": "forward" if orientation == 1 else "reversed",
                        "original_sites": original["sites"],
                        "original_llr": original["llr"],
                        "control_site_min": min(site_counts),
                        "control_site_max": max(site_counts),
                        "control_llr_min": sorted_scores[0],
                        "control_llr_median": statistics.median(sorted_scores),
                        "control_llr_max": sorted_scores[-1],
                        "controls_at_or_below_original": count_at_or_below,
                        "margin_above_control_min": original["llr"] - sorted_scores[0],
                    }
                )

        survivors = [
            record for record in records
            if record["controls_at_or_below_original"] > 0
        ]
        survivors.sort(
            key=lambda record: (
                -record["controls_at_or_below_original"],
                -record["margin_above_control_min"],
            )
        )
        summaries.append(
            {
                "convention": conv,
                "model": model,
                "causal_vectors": len(records),
                "below_all_eight_controls": len(records) - len(survivors),
                "triage_survivors": len(survivors),
                "survivors": survivors,
            }
        )

    print(
        json.dumps(
            {
                "screened_source_runes": 12947,
                "causal_rules": len(causal_names),
                "causal_vectors": len(causal_names) * 2,
                "excluded_acausal_rules": sorted(acausal),
                "plants_per_vector_mechanic": TRIALS,
                "summaries": summaries,
                "scope": (
                    "Eight-plant triage only. Survivors require deeper calibration; "
                    "below-all-control vectors are native-GP retirement candidates."
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
