#!/usr/bin/env python3
"""Exact original LP2 word-length obstruction for a one/two-symbol phonemic edge marker.

The candidate is deliberately narrow: each nonempty phoneme-class word has
one literal 'I' voice marker on one circumference, or one on both, followed
by any length-preserving bijection, even a distinct secret key for each word.
The authentic LP2 word boundaries are not changed.
"""
from __future__ import annotations

import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
transcript = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf8")
rune_lookup = {r: i for i, r in enumerate(source["runes"])}
words = []
current = []
page = 0
for ch in transcript:
    if ch == "%":
        page += 1
        continue
    if page >= 55:
        break
    if ch in rune_lookup:
        current.append(rune_lookup[ch])
    elif ch in "-.$&§" and current:
        words.append(tuple(current))
        current = []
if current:
    words.append(tuple(current))
assert len(words) == 2896
assert sum(len(w) for w in words) == 12956
counts = collections.Counter(map(len, words))
assert counts[1] == 83 and counts[2] == 448
assert min(counts) == 1
assert 83 + 448 == 531

# Any nonempty source sound word with one added edge token has length >=2.
# With a token at both edges, minimum length is >=3. No secret
# length-preserving bijection, even one per word or per rune, can alter this.
# The variable-state family is excluded ONLY when it preserves rune count.
single_edge_impossible = sum(n for length, n in counts.items() if length < 2)
both_edges_impossible = sum(n for length, n in counts.items() if length < 3)
assert single_edge_impossible == 83
assert both_edges_impossible == 531
print(json.dumps({
    "source": "LP2 p0–p55 canonical original runes, printed words joined over 32 page carries",
    "words": len(words),
    "runes": sum(map(len, words)),
    "word_lengths": dict(sorted(counts.items())),
    "source_one_rune_words": counts[1],
    "source_two_rune_words": counts[2],
    "conditional_model": "one or two mandatory phonemic 'I'/AY edge markers, one nonempty phone-word per printed GP29 word, unchanged word lengths",
    "failed_original_words_if_one_edge": single_edge_impossible,
    "failed_original_words_if_both_edges": both_edges_impossible,
    "proof": "min encoded length = 1+number of mandatory marker runes; any length-preserving secret state is irrelevant",
    "decision": "uniform obligatory word-edge marker impossible on original LP2; optional markers/resegmentation remain outside this exact model"
}, indent=2))
