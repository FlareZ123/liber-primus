#!/usr/bin/env python3
"""Test the p57 'divinity within' selector against Tiw/Os stanza key-index hypotheses.

For each printed ciphertext word C, compute S=sum(GP0(C)). At 0-based rune
position j, select key rune (S+j) mod len(stanza), then decrypt by +/- mod 29.
The candidate key texts are the Old English verse bodies of the Tiw and Os
stanzas in the Old English Rune Poem.
"""
from __future__ import annotations

from collections import Counter
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPTION = ROOT / "resources" / "external" / "Liber Primus 57.txt"

RUNE_TO_VALUE = {
    "ᚠ": 0, "ᚢ": 1, "ᚦ": 2, "ᚩ": 3, "ᚱ": 4, "ᚳ": 5, "ᚷ": 6,
    "ᚹ": 7, "ᚻ": 8, "ᚾ": 9, "ᛁ": 10, "ᛄ": 11, "ᛇ": 12, "ᛈ": 13,
    "ᛉ": 14, "ᛋ": 15, "ᛏ": 16, "ᛒ": 17, "ᛖ": 18, "ᛗ": 19, "ᛚ": 20,
    "ᛝ": 21, "ᛟ": 22, "ᛞ": 23, "ᚪ": 24, "ᚫ": 25, "ᚣ": 26, "ᛡ": 27,
    "ᛠ": 28,
}
GP29_NAMES = (
    "f", "u", "th", "o", "r", "c", "g", "w", "h", "n", "i", "j", "eo",
    "p", "x", "s", "t", "b", "e", "m", "l", "ng", "oe", "d", "a", "ae",
    "y", "ia", "ea",
)

# Ragweed Forge Old English Rune Poem, verse bodies (not headings).
KEY_TEXTS = {
    "Tiw": "Tir biþ tacna sum, healdeð trywa wel wiþ æþelingas; "
           "a biþ on færylde ofer nihta genipu, næfre swiceþ.",
    "Os": "Os byþ ordfruma ælere spræce, wisdomes wraþu ond witena "
          "frofur and eorla gehwam eadnys ond tohiht.",
}
SINGLE_VALUES = {
    "f": 0, "u": 1, "o": 3, "r": 4, "c": 5, "g": 6, "w": 7,
    "h": 8, "n": 9, "i": 10, "j": 11, "p": 13, "x": 14,
    "s": 15, "t": 16, "b": 17, "e": 18, "m": 19, "l": 20,
    "d": 23, "a": 24, "y": 26,
}
DIGRAPH_VALUES = {
    "th": 2, "eo": 12, "ng": 21, "oe": 22, "ae": 25, "ia": 27, "ea": 28,
}
ENGLISH_FREQ = {
    "a": 8.167, "b": 1.492, "c": 2.782, "d": 4.253, "e": 12.702,
    "f": 2.228, "g": 2.015, "h": 6.094, "i": 6.966, "j": 0.153,
    "k": 0.772, "l": 4.025, "m": 2.406, "n": 6.749, "o": 7.507,
    "p": 1.929, "q": 0.095, "r": 5.987, "s": 6.327, "t": 9.056,
    "u": 2.758, "v": 0.978, "w": 2.360, "x": 0.150, "y": 1.974,
    "z": 0.074,
}
ALLOWED = tuple(c for c in ENGLISH_FREQ if c not in {"k", "q", "v", "z"})
EXPECTED_TOTAL = sum(ENGLISH_FREQ[c] for c in ALLOWED)
EXPECTED = {c: ENGLISH_FREQ[c] / EXPECTED_TOTAL for c in ALLOWED}
COMMON_BIGRAMS = set(
    "th he in er an re on at en nd ti es or te of ed is it al ar st to "
    "nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch "
    "ll be ma si om ur".split()
)


def parse_old_english_key(text: str) -> list[int]:
    normalized = text.lower().replace("þ", "th").replace("ð", "th").replace("æ", "ae")
    result: list[int] = []
    i = 0
    while i < len(normalized):
        if not normalized[i].isalpha():
            i += 1
            continue
        pair = normalized[i : i + 2]
        if pair in DIGRAPH_VALUES:
            result.append(DIGRAPH_VALUES[pair])
            i += 2
        elif normalized[i] in SINGLE_VALUES:
            result.append(SINGLE_VALUES[normalized[i]])
            i += 1
        else:
            raise ValueError(f"Unmapped Old English character at {normalized[i:]!r}")
    return result


def extract_word_groups(text: str) -> tuple[list[list[int]], int]:
    page_re = re.compile(r"^%(\d{2})\s*\n(.*?)(?=^%\d{2}\s*$|\Z)", re.M | re.S)
    pages = {int(m.group(1)): m.group(2) for m in page_re.finditer(text)}
    missing = sorted(set(range(56)) - set(pages))
    if missing:
        raise ValueError(f"Missing transcription pages: {missing}")
    groups: list[list[int]] = []
    rune_count = 0
    for page_no in range(56):
        for segment in pages[page_no].split("᛫"):
            values = [RUNE_TO_VALUE[ch] for ch in segment if ch in RUNE_TO_VALUE]
            if values:
                groups.append(values)
                rune_count += len(values)
    return groups, rune_count


def render(values: list[int]) -> str:
    return "".join(GP29_NAMES[value] for value in values)


def decrypt(groups: list[list[int]], key: list[int], sign: int) -> list[list[int]]:
    output = []
    for group in groups:
        word_gp0 = sum(group)
        output.append([
            (value + sign * key[(word_gp0 + position) % len(key)]) % 29
            for position, value in enumerate(group)
        ])
    return output


def metrics(groups: list[list[int]]) -> dict[str, float | int]:
    text = "".join(render(group) for group in groups)
    counts = Counter(ch for ch in text if ch in ALLOWED)
    n = sum(counts.values())
    chi_square = 0.0
    for ch in ALLOWED:
        expected = n * EXPECTED[ch]
        chi_square += (counts[ch] - expected) ** 2 / expected
    equal_pairs = sum(count * (count - 1) for count in counts.values())
    ioc = equal_pairs / (n * (n - 1)) if n > 1 else 0.0
    pairs = list(zip(text, text[1:]))
    bigram_rate = (
        sum(a + b in COMMON_BIGRAMS for a, b in pairs) / len(pairs) if pairs else 0.0
    )
    return {
        "letters": n,
        "chi_square_per_letter": chi_square / n if n else 0.0,
        "index_of_coincidence": ioc,
        "common_bigram_rate": bigram_rate,
    }


def main() -> None:
    text = TRANSCRIPTION.read_text(encoding="utf-8")
    groups, rune_count = extract_word_groups(text)
    baseline = metrics(groups)
    output = {
        "pages_tested": "00-55",
        "word_groups": len(groups),
        "runes": rune_count,
        "word_index_rule": "key_index=(sum(GP0(ciphertext_word))+0_based_rune_position) mod stanza_length",
        "decryption_directions": {"subtract_key": "P=(C-K) mod 29", "add_key": "P=(C+K) mod 29"},
        "baseline": baseline,
        "keys": {},
    }
    for name, key_text in KEY_TEXTS.items():
        key = parse_old_english_key(key_text)
        output["keys"][name] = {
            "key_length": len(key),
            "key_values": key,
            "subtract_metrics": metrics(decrypt(groups, key, -1)),
            "add_metrics": metrics(decrypt(groups, key, 1)),
            "subtract_first_40_groups": [
                render(group) for group in decrypt(groups, key, -1)[:40]
            ],
            "add_first_40_groups": [
                render(group) for group in decrypt(groups, key, 1)[:40]
            ],
        }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
