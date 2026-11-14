#!/usr/bin/env python3
"""Scan original LP2 quotation word-length fingerprints across English Gutenberg books.

All manuscript patterns and the 12-word/40-rune decision rule are frozen before
source acquisition. The script never fits a cipher, edits runes, or promotes
short same-length coincidences to authentic plaintext.
"""
from __future__ import annotations

import argparse
import json
import re
import time
from collections.abc import Iterator
from typing import Any

DATASET = "common-pile/project_gutenberg"
# Original LP2 printed shapes already source-audited in the existing quote18 SFT.
TARGETS = {
    "p40_14": (5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4),
    "p42_13": (9, 8, 3, 4, 6, 3, 10, 2, 4, 7, 6, 2, 4),
    "p42_p43_34": (4, 2, 4, 6, 6, 8, 8, 3, 5, 5, 9, 2, 2, 4, 3, 3, 2, 8, 4, 7, 4, 4, 3, 2, 5, 3, 3, 6, 3, 11, 4, 4, 8, 5),
    "p53_14": (5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3),
}
WORD = re.compile(r"[A-Za-z]+")
ING = re.compile(r"ING", re.IGNORECASE)
DIGRAPH = re.compile(r"TH|NG|EO|OE|AE|IA|EA", re.IGNORECASE)
MIN_MATCH_WORDS = 12
MIN_MATCH_RUNES = 40
SEEDS: dict[bytes, list[tuple[str, int]]] = {}
for target, pattern in TARGETS.items():
    for start in range(len(pattern) - MIN_MATCH_WORDS + 1):
        fragment = pattern[start:start + MIN_MATCH_WORDS]
        if sum(fragment) >= MIN_MATCH_RUNES:
            SEEDS.setdefault(bytes(fragment), []).append((target, start))


def gp_transformed_lengths(text: str, ing_single: bool) -> bytes:
    """Compute greedy GP rune counts with regex passes over entire source text."""
    transformed = ING.sub("X" if ing_single else "XX", text)
    transformed = DIGRAPH.sub("X", transformed)
    return bytes(min(255, m.end() - m.start()) for m in WORD.finditer(transformed))


def matches_for_convention(source: bytes, convention: str) -> Iterator[dict[str, Any]]:
    for fragment, locations in SEEDS.items():
        position = source.find(fragment)
        while position != -1:
            for target, offset in locations:
                original = TARGETS[target]
                src_start, orig_start = position, offset
                src_end, orig_end = position + len(fragment), offset + len(fragment)
                while src_start and orig_start and source[src_start - 1] == original[orig_start - 1]:
                    src_start -= 1
                    orig_start -= 1
                while src_end < len(source) and orig_end < len(original) and source[src_end] == original[orig_end]:
                    src_end += 1
                    orig_end += 1
                yield {
                    "source_start": src_start, "source_end": src_end,
                    "original": target, "original_offset": orig_start,
                    "words": src_end - src_start, "runes": sum(original[orig_start:orig_end]),
                    "complete_original": orig_start == 0 and orig_end == len(original),
                    "convention": convention,
                }
            position = source.find(fragment, position + 1)


def scan_book(text: str) -> tuple[int, list[dict[str, Any]]]:
    a = gp_transformed_lengths(text, True)
    b = gp_transformed_lengths(text, False)
    assert len(a) == len(b), "GP contraction must preserve source word count"
    hits = list(matches_for_convention(a, "ING"))
    hits.extend(matches_for_convention(b, "I+NG"))
    distinct = {}
    for item in hits:
        key = (
            item["source_start"], item["source_end"], item["original"],
            item["original_offset"], item["convention"],
        )
        distinct[key] = item
    ordered = sorted(distinct.values(), key=lambda x: (-x["words"], -x["runes"], x["source_start"]))
    if ordered:
        words = WORD.findall(text)
        assert len(words) == len(a)
        for hit in ordered:
            hit["candidate_words"] = " ".join(words[hit["source_start"]:hit["source_end"]])
    return len(a), ordered


def selftest() -> None:
    assert gp_transformed_lengths("THROUGH BRINGING THING", True) == bytes([6, 4, 2])
    assert gp_transformed_lengths("THROUGH BRINGING THING", False) == bytes([6, 6, 3])
    assert len(SEEDS) >= 25
    for name, shape in TARGETS.items():
        dummy = "XXXXXX " + " ".join("A" * length for length in shape) + " XXXXXX"
        count, hits = scan_book(dummy)
        assert count == len(shape) + 2
        assert any(
            hit["original"] == name and hit["complete_original"] and hit["source_start"] == 1
            for hit in hits
        ), name
    count, hits = scan_book("THROUGH BRINGING THING")
    assert count == 3 and hits == []
    print("PASS: planted original quote shapes recovered at exact known offsets")
    print("PASS: alternate ING rule and short nonmatch")
    print("FROZEN_SEEDS " + str(len(SEEDS)))


def run(limit: int) -> None:
    from datasets import load_dataset

    began = time.monotonic()
    books = total_words = matches = complete = largest = 0
    print(
        "SOURCE " + json.dumps({
            "dataset": DATASET, "patterns": TARGETS,
            "min_words": MIN_MATCH_WORDS, "min_runes": MIN_MATCH_RUNES,
            "native_ING_conventions": ["ING", "I+NG"],
        }), flush=True,
    )
    stream = load_dataset(DATASET, split="train", streaming=True)
    for record in stream:
        meta = record.get("metadata") or {}
        if isinstance(meta, str):
            meta = json.loads(meta)
        if meta.get("language", "en") != "en" or meta.get("license", "Public Domain") != "Public Domain":
            continue
        n_words, hits = scan_book(record.get("text") or "")
        books += 1
        total_words += n_words
        bid = str(record.get("id", ""))
        title = str(meta.get("title", ""))[:160]
        for match in hits:
            matches += 1
            complete += int(match["complete_original"])
            largest = max(largest, match["words"])
            print(
                "MATCH " + json.dumps({
                    "gutenberg_id": bid, "title": title, "source_url": meta.get("url"), **match,
                }, ensure_ascii=False), flush=True,
            )
        if books % 100 == 0:
            print(
                "PROGRESS " + json.dumps({
                    "books": books, "words": total_words, "matches": matches,
                    "complete": complete, "max_words": largest,
                    "seconds": int(time.monotonic() - began),
                }), flush=True,
            )
        if limit and books >= limit:
            break
    print(
        "FINAL " + json.dumps({
            "dataset": DATASET, "books": books, "words": total_words,
            "exact_matches_at_least_12words_40runes": matches,
            "complete_quoted_span_hits": complete,
            "longest_quoted_span_words": largest,
            "seconds": int(time.monotonic() - began),
        }), flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()
    if args.selftest:
        selftest()
    else:
        run(args.limit)


if __name__ == "__main__":
    main()
