#!/usr/bin/env python3
"""Reproduce the p32/p47 low-digit word-map observation.

Run from any directory:
    python3 sims/lp2_lowdigit_road_page_map.py

Inputs are repository resources only. This is an exploratory structural test,
not a decryption or proof that the inferred word aggregation is intended.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESOURCE = ROOT / "resources" / "liber-primus"


def split_page_sections(text: str) -> list[str]:
    sections: list[str] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.strip() == "%":
            sections.append("\n".join(current))
            current = []
        else:
            current.append(line)
    sections.append("\n".join(current))
    return sections


def page_words(section: str, rune_to_index: dict[str, int]) -> list[list[int]]:
    # Slash is a line-wrap, not a word boundary in this transcription.
    # Hyphen and period are word boundaries; & and $ are transcription markers.
    normalized = section.replace("/", "").replace("&", "").replace("$", "")
    normalized = normalized.replace(".", "-")
    normalized = re.sub(r"\s+", "", normalized)
    words: list[list[int]] = []
    for token in normalized.split("-"):
        if not token:
            continue
        runes = [rune_to_index[ch] for ch in token if ch in rune_to_index]
        if runes:
            words.append(runes)
    return words


def terminal_cycle(start: int, low_digit: list[int]) -> tuple[int, ...] | None:
    if not 0 <= start < len(low_digit):
        return None
    path: list[int] = []
    seen: dict[int, int] = {}
    value = start
    while value not in seen:
        seen[value] = len(path)
        path.append(value)
        value = low_digit[value]
    return tuple(path[seen[value]:])


def main() -> None:
    corpus = json.loads((RESOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
    grid = json.loads((RESOURCE / "lp2-grid-256.json").read_text(encoding="utf-8"))
    transcription = (RESOURCE / "lp2-transcription.txt").read_text(encoding="utf-8")

    runes = corpus["runes"]
    translit = corpus["translit"]
    prime = corpus["prime"]
    rune_to_index = {rune: i for i, rune in enumerate(runes)}
    page_by_number = {page["page"]: page for page in corpus["pages"]}
    sections = split_page_sections(transcription)

    raw_bytes = grid["bytes"]
    if len(raw_bytes) != 256:
        raise ValueError(f"Expected 256 p50 bytes, got {len(raw_bytes)}")
    low_digit = [value % 60 for value in raw_bytes]

    # The source-selected two-cycle is ROAD/PATHS=54 <-> FOUND=36.
    road_cycle = frozenset((54, 36))

    def enters_road_cycle(gp0: int) -> bool:
        cycle = terminal_cycle(gp0, low_digit)
        return cycle is not None and frozenset(cycle) == road_cycle

    rows: list[dict] = []
    detailed: dict[int, list[dict]] = {}
    for page_number in range(56):
        page = page_by_number.get(page_number)
        if page is None or not page.get("indices"):
            continue
        if page_number >= len(sections):
            raise ValueError(f"Missing transcription section for page {page_number}")

        words = page_words(sections[page_number], rune_to_index)
        selected: list[dict] = []
        for word_index, word in enumerate(words):
            gp0 = sum(word)
            if enters_road_cycle(gp0):
                selected.append(
                    {
                        "word_index": word_index,
                        "translit": "".join(translit[i] for i in word),
                        "rune_length": len(word),
                        "gp0": gp0,
                        "gp_prime_sum": sum(prime[i] for i in word),
                    }
                )

        row = {
            "page": page_number,
            "word_count": len(words),
            "selected_count": len(selected),
            "selected_rune_length": sum(x["rune_length"] for x in selected),
            "selected_gp0_sum": sum(x["gp0"] for x in selected),
            "selected_gp_prime_sum": sum(x["gp_prime_sum"] for x in selected),
        }
        rows.append(row)
        detailed[page_number] = selected

    # Count basins of every functional-graph cycle over all 256 table states.
    basins: dict[tuple[int, ...], int] = {}
    for start in range(256):
        cycle = terminal_cycle(start, low_digit)
        assert cycle is not None
        canonical = tuple(sorted(cycle))
        basins[canonical] = basins.get(canonical, 0) + 1

    dual_square_matches = []
    for row in rows:
        prime_sum = row["selected_gp_prime_sum"]
        root = math.isqrt(prime_sum)
        if root <= 55 and root * root == prime_sum and row["selected_gp0_sum"] == 13 * root:
            dual_square_matches.append({"page": row["page"], "m": root})

    p32 = next(row for row in rows if row["page"] == 32)
    p47 = next(row for row in rows if row["page"] == 47)
    assert (
        p32["selected_count"],
        p32["selected_rune_length"],
        p32["selected_gp0_sum"],
        p32["selected_gp_prime_sum"],
    ) == (6, 42, 611, 2209)
    assert (
        p47["selected_count"],
        p47["selected_rune_length"],
        p47["selected_gp0_sum"],
        p47["selected_gp_prime_sum"],
    ) == (8, 32, 534, 2013)
    assert dual_square_matches == [{"page": 32, "m": 47}]

    output = {
        "definition": "T(x) = p50_base60_byte[x] mod 60; select a word iff its GP0 orbit terminates in cycle {54,36}",
        "cycle_basins": [
            {"cycle": list(cycle), "basin_size": size}
            for cycle, size in sorted(basins.items(), key=lambda item: (-item[1], item[0]))
        ],
        "p32_selected_words": detailed[32],
        "p47_selected_words": detailed[47],
        "dual_square_matches": dual_square_matches,
        "page_summaries": rows,
        "caveat": "Word segmentation and aggregation are inferred; this is not plaintext or a validated cipher.",
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
