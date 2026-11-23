#!/usr/bin/env python3
"""Reproduce the p55 coprime-interior GP29 key candidate.

Source-directed reading:
  * p57: "shed our own circumferences; find the divinity within"
  * p7: the totient function is sacred
  * p55: 16 complete words begin on the page
For each p55 word of rune length n, remove its first and last runes, then
select interior positions whose one-based index is coprime to n. This yields
29 runes, matching the GP29 alphabet. Serialize each GP29 index with the
2013 source's base-29 alphabet 0123456789ABCDEFGHIJKLMNOPQRS.

This script derives a candidate password only. It does not establish that
OpenPuff is the intended receiver or that the candidate decrypts anything.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPTION = ROOT / "resources" / "lp2-transcription.txt"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
PAGE_START_INDEX = 54  # transcription segment 54 is physical LP2 page 55
BASE29 = "0123456789ABCDEFGHIJKLMNOPQRS"
EXPECTED_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]


def parse_words_starting_on_page(raw: str, rune_set: set[str], page_index: int) -> list[str]:
    segments = raw.split("%")[: page_index + 1]
    by_start_page: list[list[str]] = [[] for _ in segments]
    current: list[str] = []
    start_page = 0
    page = 0

    def finish() -> None:
        nonlocal current
        if current:
            by_start_page[start_page].append("".join(current))
            current = []

    for ch in "%".join(segments):
        if ch in rune_set:
            if not current:
                start_page = page
            current.append(ch)
        elif ch == "%":
            page += 1
        elif ch == "/" or ch.isspace():
            # Line wraps do not end a printed word.
            continue
        else:
            finish()
    finish()
    return by_start_page[page_index]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--expect", help="Fail unless the derived password matches this value.")
    args = parser.parse_args()

    raw = TRANSCRIPTION.read_text(encoding="utf-8")
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    runes = corpus["runes"]
    translit = corpus["translit"]
    rune_set = set(runes)
    gp_index = {rune: i for i, rune in enumerate(runes)}

    words = parse_words_starting_on_page(raw, rune_set, PAGE_START_INDEX)
    lengths = [len(word) for word in words]
    if lengths != EXPECTED_LENGTHS:
        raise SystemExit(
            f"p55 source-word boundary mismatch: expected {EXPECTED_LENGTHS}, got {lengths}"
        )

    selected: list[str] = []
    selected_indices: list[int] = []
    selected_positions: list[list[int]] = []
    per_word_counts: list[int] = []
    for word in words:
        n = len(word)
        positions_for_word: list[int] = []
        # One-based positions 2..n-1 are the strict interior.
        for position in range(2, n):
            if math.gcd(position, n) == 1:
                rune = word[position - 1]
                selected.append(rune)
                selected_indices.append(gp_index[rune])
                positions_for_word.append(position)
        selected_positions.append(positions_for_word)
        per_word_counts.append(len(positions_for_word))

    if len(selected) != 29 or sum(per_word_counts) != 29:
        raise SystemExit(
            f"coprime-interior count mismatch: expected 29, got {len(selected)}"
        )

    password = "".join(BASE29[i] for i in selected_indices)
    if len(BASE29) != 29:
        raise SystemExit("base29 alphabet must contain exactly 29 symbols")
    if args.expect is not None and password != args.expect:
        raise SystemExit(
            f"derived password mismatch: expected {args.expect}, got {password}"
        )

    result = {
        "physical_page": 55,
        "word_count": len(words),
        "word_lengths": lengths,
        "per_word_coprime_interior_counts": per_word_counts,
        "selected_positions_one_based": selected_positions,
        "selected_runes": selected,
        "selected_gp29_indices": selected_indices,
        "selected_transliteration": [translit[i] for i in selected_indices],
        "selected_count": len(selected),
        "base29_alphabet": BASE29,
        "candidate_password": password,
        "status": "candidate key derivation only; receiver unverified",
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
