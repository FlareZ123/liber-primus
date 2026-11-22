#!/usr/bin/env python3
"""Reproduce LP2's doublet fingerprint, test Wulfic's generators, and gate skip/rewrite identifiability.

Run from the repository root:
    python sims/wulfic_antidoublet_reversibility_gate.py

No third-party packages, language scoring, key search, or random sampling are used.
The source model's random.Random(seed) calls are reproduced exactly. The model gate
also computes a fixed page-heldout comparison and the exact output-kernel identity.
"""
from __future__ import annotations

import hashlib
import json
import math
import random
from pathlib import Path
from typing import Sequence

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
MASTER_PATH = ROOT / "resources" / "transcriptions" / "liber_primus_master.txt"
ANNOTATIONS_PATH = ROOT / "resources" / "liber-primus" / "lp2-ink-annotations.json"
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



def _pair_summary(pairs: Sequence[dict]) -> dict:
    equal = sum(pair["a"] == pair["b"] for pair in pairs)
    return {
        "pairs": len(pairs),
        "equal": equal,
        "rate": equal / len(pairs) if pairs else None,
    }


def model_identifiability_gate() -> dict:
    """Reproduce full boundaries and test the exact M1 key-skip/M2 output-rewrite kernel."""
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    rune_index = {r: i for i, r in enumerate(corpus["runes"])}
    master_text = MASTER_PATH.read_text(encoding="utf-8")
    annotations = json.loads(ANNOTATIONS_PATH.read_text(encoding="utf-8"))
    split_at = master_text.index("\n\n") + 2
    sections = master_text[split_at:].split("$")[7:16]
    assert len(sections) == 9

    page_runes: dict[int, list[int]] = {}
    page_globals: dict[int, list[int]] = {}
    positions: list[dict[str, int]] = []
    transitions: list[dict] = []
    section_starts: list[int] = []
    page = line = word = global_offset = 0
    previous = None

    for section_index, section in enumerate(sections):
        if section_index:
            section_starts.append(global_offset)
            word += 1  # The $ segment marker is also a word delimiter.
        for character in section:
            if character in rune_index:
                physical_page = page - 1  # The selected master slice begins with a leading %.
                value = rune_index[character]
                page_runes.setdefault(physical_page, []).append(value)
                page_globals.setdefault(physical_page, []).append(global_offset)
                current = {
                    "value": value,
                    "page": physical_page,
                    "line": line,
                    "word": word,
                    "section": section_index,
                    "global": global_offset,
                }
                positions.append({
                    "page": physical_page,
                    "offset": len(page_runes[physical_page]) - 1,
                    "global": global_offset,
                })
                if previous is not None:
                    transitions.append({
                        "a": previous["value"],
                        "b": value,
                        "prev_page": previous["page"],
                        "page": physical_page,
                        "line_break": previous["line"] != line,
                        "page_break": previous["page"] != physical_page,
                        "section_break": previous["section"] != section_index,
                        "word_break": previous["word"] != word,
                        "global": global_offset,
                    })
                previous = current
                global_offset += 1
            elif character == "%":
                page += 1
                line += 1
            elif character == "/":
                line += 1
            elif character in "-.&§":
                word += 1
            elif character.isspace():
                pass
            else:
                word += 1

    assert global_offset == 12956
    assert len(transitions) == 12955
    assert len(page_runes) == 55
    assert sorted(page_runes) == list(range(50)) + list(range(51, 56))
    assert sum(map(len, page_runes.values())) == 12956

    def select(predicate):
        return [pair for pair in transitions if predicate(pair)]

    inventory = {
        "all": _pair_summary(transitions),
        "within_page": _pair_summary(select(lambda x: not x["page_break"])),
        "page_join": _pair_summary(select(lambda x: x["page_break"])),
        "within_section": _pair_summary(select(lambda x: not x["section_break"])),
        "segment_join": _pair_summary(select(lambda x: x["section_break"])),
        "within_line": _pair_summary(select(lambda x: not x["line_break"])),
        "line_join": _pair_summary(select(lambda x: x["line_break"])),
        "within_word": _pair_summary(select(lambda x: not x["word_break"])),
        "interword": _pair_summary(select(lambda x: x["word_break"])),
        "page_and_segment": _pair_summary(select(
            lambda x: x["page_break"] and x["section_break"])),
        "segment_inside_page": _pair_summary(select(
            lambda x: x["section_break"] and not x["page_break"])),
    }
    assert (inventory["within_page"]["pairs"], inventory["within_page"]["equal"]) == (12901, 86)
    assert (inventory["page_join"]["pairs"], inventory["page_join"]["equal"]) == (54, 0)
    assert (inventory["within_section"]["pairs"], inventory["within_section"]["equal"]) == (12947, 86)
    assert (inventory["segment_join"]["pairs"], inventory["segment_join"]["equal"]) == (8, 0)
    assert (inventory["within_line"]["pairs"], inventory["within_line"]["equal"]) == (12362, 82)
    assert (inventory["line_join"]["pairs"], inventory["line_join"]["equal"]) == (593, 4)
    assert (inventory["within_word"]["pairs"], inventory["within_word"]["equal"]) == (10060, 63)
    assert (inventory["interword"]["pairs"], inventory["interword"]["equal"]) == (2895, 23)

    # Original-image 13-dot annotations are after the stated page-local rune offset.
    mark_records = 0
    marked_global_edges: set[int] = set()
    for page_record in annotations["pages"]:
        physical_page = page_record["page"]
        if physical_page > 55:
            continue
        page_positions = page_globals.get(physical_page, [])
        rune_count = len(page_positions)
        for offset, dot_count, _colour in page_record.get("large_punctuation", []):
            if dot_count != 13:
                continue
            mark_records += 1
            edge = None
            if 0 < offset < rune_count:
                edge = page_positions[offset]
            elif offset == 0 and rune_count and physical_page > 0:
                edge = page_positions[0]
            elif offset == rune_count and physical_page < 55:
                next_pages = [p for p in sorted(page_globals) if p > physical_page]
                if next_pages:
                    edge = page_globals[next_pages[0]][0]
            if edge is not None:
                marked_global_edges.add(edge)

    transition_by_global = {pair["global"]: pair for pair in transitions}
    marked_pairs = [transition_by_global[g] for g in sorted(marked_global_edges)]
    assert mark_records == 28
    assert len(marked_global_edges) == 25
    assert len(marked_pairs) == 25
    assert sum(pair["a"] == pair["b"] for pair in marked_pairs) == 0
    assert set(section_starts).issubset(marked_global_edges)

    # The split is fixed by physical page number. Page 50 is the numerical-only page.
    # This is a retrospective fixed-split check, not a blind pre-registration.
    train = select(lambda x: not x["page_break"] and 0 <= x["prev_page"] <= 26)
    holdout = select(lambda x: not x["page_break"] and 27 <= x["prev_page"] <= 55)
    assert (len(train), sum(x["a"] == x["b"] for x in train)) == (6500, 40)
    assert (len(holdout), sum(x["a"] == x["b"] for x in holdout)) == (6401, 46)
    r = sum(x["a"] == x["b"] for x in train) / len(train)
    q = 1.0 / N
    suppression = (q - r) / (q * (1.0 - r))
    p_lag2 = r * r + (1.0 - r) ** 2 / (N - 1)
    eigenvalue = r - (1.0 - r) / (N - 1)
    p_lag3 = 1.0 / N + (N - 1.0) / N * eigenvalue ** 3

    heldout_pages = [
        (p, values) for p, values in sorted(page_runes.items())
        if 27 <= p <= 55
    ]

    def lag_prediction(lag: int, expected_rate: float) -> dict:
        pairs = equal = 0
        for _page, values in heldout_pages:
            for i in range(lag, len(values)):
                pairs += 1
                equal += values[i] == values[i - lag]
        z = ((equal - pairs * expected_rate) /
             math.sqrt(pairs * expected_rate * (1.0 - expected_rate)))
        return {
            "pairs": pairs,
            "equal": equal,
            "rate": equal / pairs,
            "predicted_rate": expected_rate,
            "z": z,
        }

    repeats = sum(x["a"] == x["b"] for x in holdout)
    expected_repeats = len(holdout) * r
    repeat_z = ((repeats - expected_repeats) /
                math.sqrt(len(holdout) * r * (1.0 - r)))

    adjacent_repeat_pairs = 0
    adjacent_repeat_opportunities = 0
    for _page, values in heldout_pages:
        flags = [values[i] == values[i - 1] for i in range(1, len(values))]
        adjacent_repeat_opportunities += max(0, len(flags) - 1)
        adjacent_repeat_pairs += sum(flags[i] and flags[i - 1]
                                     for i in range(1, len(flags)))
    expected_adjacent_repeat_pairs = adjacent_repeat_opportunities * r * r

    delta_counts = [0] * N
    for pair in holdout:
        if pair["a"] != pair["b"]:
            delta_counts[(pair["b"] - pair["a"]) % N] += 1
    delta_expected = sum(delta_counts[1:]) / (N - 1)
    delta_chi2 = sum(
        (delta_counts[d] - delta_expected) ** 2 / delta_expected
        for d in range(1, N)
    )
    delta_sd = math.sqrt(delta_expected * (1.0 - 1.0 / (N - 1)))
    max_abs_delta_z = max(
        abs(delta_counts[d] - delta_expected) / delta_sd
        for d in range(1, N)
    )

    matrix = [[0] * N for _ in range(N)]
    row_counts = [0] * N
    for pair in holdout:
        matrix[pair["a"]][pair["b"]] += 1
        row_counts[pair["a"]] += 1
    matrix_chi2 = 0.0
    for a in range(N):
        for b in range(N):
            expected = row_counts[a] * (
                r if a == b else (1.0 - r) / (N - 1)
            )
            if expected:
                matrix_chi2 += (matrix[a][b] - expected) ** 2 / expected

    boundary_counts = {}
    for name in ("line_break", "page_break", "section_break", "word_break"):
        pairs = select(
            lambda x: x[name] and 27 <= x["prev_page"] <= 55
        )
        boundary_counts[name] = _pair_summary(pairs)

    log_likelihood = (
        repeats * math.log(r) +
        (len(holdout) - repeats) * math.log((1.0 - r) / (N - 1))
    )

    return {
        "source_hashes": {
            "master_sha256": hashlib.sha256(MASTER_PATH.read_bytes()).hexdigest(),
            "corpus_sha256": hashlib.sha256(CORPUS_PATH.read_bytes()).hexdigest(),
            "annotations_sha256": hashlib.sha256(ANNOTATIONS_PATH.read_bytes()).hexdigest(),
        },
        "page_lengths": {str(p): len(values) for p, values in sorted(page_runes.items())},
        "inventory": inventory,
        "original_13_dot_marks": {
            "annotation_records": mark_records,
            "unique_transitions_bracketed": len(marked_global_edges),
            "equal_pairs_at_marked_transitions": 0,
            "marked_transition_edges": [
                {
                    "from": positions[g - 1],
                    "to": positions[g],
                    "equal": transition_by_global[g]["a"] == transition_by_global[g]["b"],
                }
                for g in sorted(marked_global_edges)
            ],
            "master_segment_boundaries": [
                {
                    "global_offset": g,
                    "from": positions[g - 1],
                    "to": positions[g],
                }
                for g in section_starts
            ],
            "all_master_segment_boundaries_are_13_dot_marked": True,
        },
        "heldout_design": {
            "training_physical_pages": "0-26",
            "heldout_physical_pages": "27-55 (page 50 has no runes)",
            "training": _pair_summary(train),
            "heldout": _pair_summary(holdout),
            "fitted_repeat_rate": r,
            "fitted_suppression_probability": suppression,
            "status": "retrospective fixed-split check; not a blind pre-registration",
        },
        "kernel_predictions": {
            "repeat_probability": r,
            "each_nonrepeat_probability": (1.0 - r) / (N - 1),
            "lag2_equal_probability": p_lag2,
            "lag3_equal_probability": p_lag3,
            "adjacent_repeat_indicator_pair_probability": r * r,
            "nonzero_delta_probability_conditional_on_nonrepeat": 1.0 / (N - 1),
        },
        "heldout": {
            "doublet_z": repeat_z,
            "lag2": lag_prediction(2, p_lag2),
            "lag3": lag_prediction(3, p_lag3),
            "adjacent_repeat_indicator_pairs": {
                "observed": adjacent_repeat_pairs,
                "opportunities": adjacent_repeat_opportunities,
                "expected": expected_adjacent_repeat_pairs,
            },
            "delta_counts_1_to_28": delta_counts[1:],
            "delta_chi2_df27": delta_chi2,
            "max_abs_delta_z": max_abs_delta_z,
            "symbol_conditioned_transition_chi2_df812": matrix_chi2,
            "boundary_counts": boundary_counts,
            "log_likelihood": log_likelihood,
            "M1_vs_M2_log_likelihood_ratio": 0.0,
        },
        "model_identity": {
            "models": "M1 ciphertext key-skip/rejection vs M2 ciphertext output-rewrite",
            "q": q,
            "fitted_suppression_probability": suppression,
            "shared_repeat_rate": "r(s) = q*(1-s)/(1-q*s)",
            "shared_transition_kernel": (
                "P(C_i=C_(i-1))=r; P(C_i=x!=C_(i-1))=(1-r)/28"
            ),
            "ciphertext_likelihood_ratio_for_every_sequence": 1.0,
            "reason": (
                "Both mechanisms retry independent uniform GP29 candidates on a collision. "
                "M1 consumes another key symbol; M2 draws another output symbol. Addition "
                "of a fixed plaintext rune is a permutation of GP29, so their emitted-symbol "
                "kernels and every ciphertext-only statistic are identical."
            ),
        },
    }


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
        "model_identifiability_gate": model_identifiability_gate(),
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
