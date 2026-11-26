#!/usr/bin/env python3
"""Reproduce the p55 coprime-interior GP29 key candidate.

Source-directed reading:
  * LP1 physical p5: "THE TOTIENT FUNCTION IS SACRED"
  * LP2 p57: "shed our own circumferences; find the divinity within"
  * LP2 p55: 16 complete words begin on the page
For each p55 word of rune length n, remove its first and last runes, then
select interior positions whose one-based index is coprime to n. This yields
29 runes, matching the GP29 alphabet. Serialize each GP29 index as one digit
from the effective 2013 BASE29 alphabet 0123456789ABCDEFGHIJKLMNOPQRS.

The parser preserves words across page markers and attributes each word to
the page where its first rune appears. The candidate is not plaintext or an
authenticated key. A direct same-page Vigenere receiver is tested below;
OpenPuff remains a gated, untested receiver hypothesis.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPTION = ROOT / "resources" / "lp2-transcription.txt"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
PAGE_START_INDEX = 54  # LP2 p55; original archive image 72.jpg
BASE29 = "0123456789ABCDEFGHIJKLMNOPQRS"
EXPECTED_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]


def parse_words_by_start_page(raw: str, rune_set: set[str]) -> list[list[str]]:
    """Parse words by their first-rune page; page markers do not end words."""
    by_start_page: list[list[str]] = [[] for _ in range(raw.count("%") + 1)]
    current: list[str] = []
    start_page = 0
    page = 0

    def finish() -> None:
        nonlocal current
        if current:
            by_start_page[start_page].append("".join(current))
            current = []

    for ch in raw:
        if ch in rune_set:
            if not current:
                start_page = page
            current.append(ch)
        elif ch == "%":
            # A page break can split a word. Preserve its original start page.
            page += 1
        elif ch == "/" or ch.isspace():
            # Line wraps do not end a printed word.
            continue
        else:
            finish()
    finish()
    return by_start_page


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

    words_by_page = parse_words_by_start_page(raw, rune_set)
    words = words_by_page[PAGE_START_INDEX]
    if PAGE_START_INDEX == 0 or not words_by_page[PAGE_START_INDEX - 1]:
        raise SystemExit("missing preceding-page carry word")
    incoming_carry = words_by_page[PAGE_START_INDEX - 1][-1]
    target_segment = raw.split("%")[PAGE_START_INDEX]
    first_target_rune = next((ch for ch in target_segment if ch in rune_set), None)
    if len(incoming_carry) != 11 or incoming_carry[-1] != first_target_rune:
        raise SystemExit("p54-to-p55 11-rune carry boundary mismatch")
    lengths = [len(word) for word in words]
    if lengths != EXPECTED_LENGTHS:
        raise SystemExit(
            f"p55 source-word boundary mismatch: expected {EXPECTED_LENGTHS}, got {lengths}"
        )

    selected: list[str] = []
    selected_indices: list[int] = []
    excluded_indices: list[int] = []
    selected_positions: list[list[int]] = []
    per_word_counts: list[int] = []
    for word in words:
        n = len(word)
        positions_for_word: list[int] = []
        # One-based positions 2..n-1 are the strict interior.
        for position in range(2, n):
            rune = word[position - 1]
            if math.gcd(position, n) == 1:
                selected.append(rune)
                selected_indices.append(gp_index[rune])
                positions_for_word.append(position)
            else:
                excluded_indices.append(gp_index[rune])
        selected_positions.append(positions_for_word)
        per_word_counts.append(len(positions_for_word))

    totients = [
        sum(1 for i in range(1, n + 1) if math.gcd(i, n) == 1)
        for n in lengths
    ]
    strict_interior_count = sum(n - 2 for n in lengths)
    selected_count_from_totient = sum(phi - 1 for phi in totients)
    if per_word_counts != [phi - 1 for phi in totients]:
        raise SystemExit("coprime-position counts do not equal phi(n)-1")
    if strict_interior_count != 43 or sum(totients) != 45 or selected_count_from_totient != 29:
        raise SystemExit(
            "p55 count identity mismatch: expected interior=43, sum(phi)=45, sum(phi-1)=29"
        )
    if len(selected) != selected_count_from_totient:
        raise SystemExit(
            f"coprime-interior count mismatch: expected {selected_count_from_totient}, got {len(selected)}"
        )

    if len(BASE29) != 29:
        raise SystemExit("base29 alphabet must contain exactly 29 symbols")
    # One BASE29 digit per GP29 symbol; this is not a single large-integer conversion.
    password = "".join(BASE29[i] for i in selected_indices)

    # Test the simplest source-familiar Vigenere consumer on p55 itself:
    # subtract the repeated GP29 key and leave literal F runes transparent.
    page55 = next((page for page in corpus["pages"] if page["page"] == 55), None)
    if page55 is None or len(page55["indices"]) != 76:
        raise SystemExit("original LP2 p55 corpus page mismatch")
    direct_decoded: list[int] = []
    direct_key_cursor = 0
    for cipher_index in page55["indices"]:
        if cipher_index == 0:
            direct_decoded.append(0)
            continue
        direct_decoded.append(
            (cipher_index - selected_indices[direct_key_cursor % len(selected_indices)]) % 29
        )
        direct_key_cursor += 1
    direct_counts: dict[int, int] = {}
    for value in direct_decoded:
        direct_counts[value] = direct_counts.get(value, 0) + 1
    direct_ioc = (
        sum(count * (count - 1) for count in direct_counts.values())
        / (len(direct_decoded) * (len(direct_decoded) - 1))
    )
    direct_plaintext = "".join(translit[value] for value in direct_decoded)

    # Source-partition receiver: use the selected 29 interior runes as a key
    # for the 33 exterior runes (incoming carry suffix + each word's endpoints).
    exterior_runes = [incoming_carry[-1]]
    for word in words:
        exterior_runes.extend((word[0], word[-1]))
    exterior_indices = [gp_index[rune] for rune in exterior_runes]
    if len(exterior_indices) != 33:
        raise SystemExit("p55 exterior register must contain exactly 33 runes")

    def decode_exterior(sign: int) -> tuple[list[int], int]:
        decoded: list[int] = []
        key_cursor = 0
        for cipher_index in exterior_indices:
            if cipher_index == 0:
                decoded.append(0)
                continue
            decoded.append(
                (cipher_index + sign * selected_indices[key_cursor % len(selected_indices)]) % 29
            )
            key_cursor += 1
        return decoded, key_cursor

    def index_of_coincidence(values: list[int]) -> float:
        frequencies: dict[int, int] = {}
        for value in values:
            frequencies[value] = frequencies.get(value, 0) + 1
        return (
            sum(count * (count - 1) for count in frequencies.values())
            / (len(values) * (len(values) - 1))
        )

    exterior_minus, exterior_minus_cursor = decode_exterior(-1)
    exterior_plus, exterior_plus_cursor = decode_exterior(1)
    exterior_vigenere = {
        "ciphertext_gp29_indices": exterior_indices,
        "minus": {
            "plaintext": "".join(translit[value] for value in exterior_minus),
            "key_symbols_consumed": exterior_minus_cursor,
            "ioc": index_of_coincidence(exterior_minus),
        },
        "plus": {
            "plaintext": "".join(translit[value] for value in exterior_plus),
            "key_symbols_consumed": exterior_plus_cursor,
            "ioc": index_of_coincidence(exterior_plus),
        },
    }
    if args.expect is not None and password != args.expect:
        raise SystemExit(
            f"derived password mismatch: expected {args.expect}, got {password}"
        )

    result = {
        "lp2_page": 55,
        "archive_image": "72.jpg",
        "incoming_carry_word_length": len(incoming_carry),
        "word_count": len(words),
        "word_lengths": lengths,
        "strict_interior_count": strict_interior_count,
        "sum_phi_word_lengths": sum(totients),
        "sum_phi_minus_one": selected_count_from_totient,
        "unselected_interior_count": strict_interior_count - len(selected),
        "per_word_totients": totients,
        "per_word_coprime_interior_counts": per_word_counts,
        "selected_positions_one_based": selected_positions,
        "selected_runes": selected,
        "selected_gp29_indices": selected_indices,
        "selected_transliteration": [translit[i] for i in selected_indices],
        "selected_count": len(selected),
        "excluded_interior_count": len(excluded_indices),
        "excluded_interior_gp29_indices": excluded_indices,
        "base29_alphabet": BASE29,
        "candidate_password": password,
        "direct_p55_vigenere_subtract_f_transparent": {
            "plaintext": direct_plaintext,
            "key_symbols_consumed": direct_key_cursor,
            "ioc": direct_ioc,
        },
        "interior_key_to_33_exterior_vigenere": exterior_vigenere,
        "status": "candidate password derivation only; direct Vigenere rejected; OpenPuff receiver unverified",
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
