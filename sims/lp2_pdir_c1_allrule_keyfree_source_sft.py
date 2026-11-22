#!/usr/bin/env python3
"""Source-only exact c=1 key-cancellation census across all external pdir rules.

Uses the pinned external signrules/dirrules section tables, so rule state and
section resets exactly match Director Issue #1329. For each kept direction rule
and both orientations, score every forward->backward turn under the c=1
adjacent emitted-key equality required by conventions 021 and 101.

The skip model is exact on all such turns. For the coin model, the subset whose
preceding forward final ciphertext differs from its previous-emitted comparator
is exact, because the only coin state that can leave the post-rune pointer two
steps beyond the emitted key requires a kept visible collision.

This script does not search any secret key and does not claim plaintext.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import re
import sys

N = 29


def encode_english(text: str, corpus: dict) -> list[list[int]]:
    spell = {s: i for i, s in enumerate(corpus["translit"])}
    digraphs = sorted((s for s in spell if len(s) > 1), key=len, reverse=True)
    out: list[list[int]] = []
    for raw in re.findall(r"[A-Za-z]+", text):
        word = (
            raw.upper()
            .replace("QU", "CW")
            .replace("K", "C")
            .replace("V", "U")
            .replace("Z", "S")
        )
        encoded: list[int] = []
        i = 0
        while i < len(word):
            d = next((token for token in digraphs if word.startswith(token, i)), None)
            if d is not None:
                encoded.append(spell[d])
                i += len(d)
            elif word[i] in spell:
                encoded.append(spell[word[i]])
                i += 1
            else:
                i += 1
        if encoded:
            out.append(encoded)
    return out


def native_weights(local: Path) -> list[float]:
    corpus = json.loads(
        (local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
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


def score_rule(tabs, fn, orientation: int, weights: list[float]) -> dict:
    skip_hist = [0] * N
    coin_hist = [0] * N
    skip_sites = 0
    coin_sites = 0

    for _head, runes, _lens, spans, words in tabs:
        directions = [fn(words, w) * orientation for w in range(len(words))]
        for i in range(1, len(spans)):
            if directions[i - 1] != 1 or directions[i] != -1:
                continue

            previous_end = spans[i - 1][1] - 1
            current_start = spans[i][0]
            residue = (runes[current_start] - runes[previous_end]) % N
            skip_hist[residue] += 1
            skip_sites += 1

            comparator_index = previous_end - 1
            if comparator_index >= 0 and runes[previous_end] != runes[comparator_index]:
                coin_hist[residue] += 1
                coin_sites += 1

    return {
        "skip_sites": skip_sites,
        "skip_llr": sum(count * weights[i] for i, count in enumerate(skip_hist)),
        "coin_safe_sites": coin_sites,
        "coin_safe_llr": sum(count * weights[i] for i, count in enumerate(coin_hist)),
        "skip_hist": skip_hist,
        "coin_safe_hist": coin_hist,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: lp2_pdir_c1_allrule_keyfree_source_sft.py EXTERNAL")
    local = Path(__file__).resolve().parent.parent
    external = Path(sys.argv[1]).resolve()
    work = external / "work/kscreen"
    sys.path.insert(0, str(work))

    import signrules  # type: ignore
    import dirrules  # type: ignore

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
    assert len(names) == 66, len(names)
    rules = {name: (base[name] if name in base else extras[name]) for name in names}

    weights = native_weights(local)
    rows = []
    for name in names:
        for orientation in (1, -1):
            result = score_rule(tabs, rules[name], orientation, weights)
            rows.append(
                {
                    "rule": name,
                    "orientation": "forward" if orientation == 1 else "reversed",
                    **result,
                    "skip_llr_per_site": (
                        result["skip_llr"] / result["skip_sites"]
                        if result["skip_sites"]
                        else None
                    ),
                    "coin_safe_llr_per_site": (
                        result["coin_safe_llr"] / result["coin_safe_sites"]
                        if result["coin_safe_sites"]
                        else None
                    ),
                }
            )

    a = next(
        row
        for row in rows
        if row["rule"] == "A_prev_G" and row["orientation"] == "forward"
    )
    assert a["skip_sites"] > 700
    assert a["coin_safe_sites"] > 690

    ranked_skip = sorted(rows, key=lambda row: row["skip_llr"], reverse=True)
    ranked_coin = sorted(rows, key=lambda row: row["coin_safe_llr"], reverse=True)
    summary = {
        "screened_source_runes": 12947,
        "section_windows": [head for head, *_rest in tabs],
        "kept_rules": len(names),
        "direction_vectors": len(rows),
        "a_prev_G_section_exact": a,
        "skip": {
            "vectors_positive_llr": sum(row["skip_llr"] > 0 for row in rows),
            "vectors_negative_llr": sum(row["skip_llr"] < 0 for row in rows),
            "top15": ranked_skip[:15],
            "bottom15": ranked_skip[-15:],
        },
        "coin_safe": {
            "vectors_positive_llr": sum(row["coin_safe_llr"] > 0 for row in rows),
            "vectors_negative_llr": sum(row["coin_safe_llr"] < 0 for row in rows),
            "top15": ranked_coin[:15],
            "bottom15": ranked_coin[-15:],
        },
        "scope": (
            "Source-only native-vs-flat boundary evidence for exact c=1 "
            "key-cancellation sites; positive LLR is a survivor signal, not plaintext."
        ),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
