#!/usr/bin/env python3
"""Full LP2 original printed-word-length source quotation search.

Search historical English public-domain books for exact long quotations
without fitting cipher keys. Matching lengths are potential cribs, not
authenticated plaintext. Native page and chapter boundaries are fixed.
"""
from __future__ import annotations

import argparse
import json
import re
import time
from collections import defaultdict
from pathlib import Path

DATASET = "common-pile/project_gutenberg"
ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPT = ROOT / "resources" / "liber-primus" / "lp2-transcription.txt"
GP_RUNES = re.compile(r"[\u16a0-\u16ff]+")
WORD = re.compile(r"[A-Za-z]+")
DIGRAPH = re.compile(r"TH|NG|EO|OE|AE|IA|EA", re.IGNORECASE)
ING = re.compile(r"ING", re.IGNORECASE)
CHAPTER_RUNES = (729, 1145, 1738, 1894, 1021, 1433, 1680, 3008, 308)
CHAPTER_WORDS = (158, 255, 385, 435, 224, 326, 378, 669, 66)
WINDOW = 12
MIN_WORDS = 16
MIN_RUNES = 65
BASE = 257
MASK = (1 << 64) - 1
POWER = pow(BASE, WINDOW, 1 << 64)
P57_TEXT = ("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN "
            "CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE")
P57_RUNE_LENGTHS = (7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6)


def word_lengths(text: str, ing_one: bool) -> bytes:
    folded = ING.sub("X" if ing_one else "XX", text)
    folded = DIGRAPH.sub("X", folded)
    return bytes(min(255, m.end() - m.start()) for m in WORD.finditer(folded))


def source_chapters(path: Path) -> list[bytes]:
    original = path.read_text(encoding="utf-8")
    blocks = original.split("$")
    assert len(blocks) == 10, len(blocks)
    chapters = [GP_RUNES.findall(re.sub(r"[\s/%]", "", c)) for c in blocks[:8]]
    assert sum(map(len, chapters)) == 2896
    assert sum(map(len, chapters[-1])) == 3316
    cumulative, split_index = 0, None
    for i, word in enumerate(chapters[-1]):
        if cumulative == 3008:
            split_index = i
            break
        cumulative += len(word)
    assert split_index is not None, "p54 chapter boundary must be a word boundary"
    chapters = chapters[:-1] + [chapters[-1][:split_index], chapters[-1][split_index:]]
    assert tuple(sum(map(len, c)) for c in chapters) == CHAPTER_RUNES
    assert tuple(map(len, chapters)) == CHAPTER_WORDS
    return [bytes(map(len, c)) for c in chapters]


def rolling_positions(a: bytes):
    if len(a) < WINDOW:
        return
    h = 0
    for x in a[:WINDOW]:
        h = ((h * BASE) + x) & MASK
    yield 0, h
    for i in range(WINDOW, len(a)):
        h = ((h * BASE) + a[i] - a[i - WINDOW] * POWER) & MASK
        yield i - WINDOW + 1, h


def index_chapters(chapters: list[bytes]):
    positions = defaultdict(list)
    for chapter, a in enumerate(chapters):
        for index, h in rolling_positions(a):
            positions[h].append((chapter, index))
    return positions


def scan_text(a: bytes, chapters: list[bytes], index: dict):
    """Return maximal 16-word/65-rune-or-longer exact length matches."""
    hits = {}
    for pos, h in rolling_positions(a):
        for chapter, tpos in index.get(h, ()):
            target = chapters[chapter]
            if a[pos:pos + WINDOW] != target[tpos:tpos + WINDOW]:
                continue
            i, j = pos, tpos
            while i and j and a[i - 1] == target[j - 1]:
                i -= 1
                j -= 1
            e, f = pos + WINDOW, tpos + WINDOW
            while e < len(a) and f < len(target) and a[e] == target[f]:
                e += 1
                f += 1
            if e - i >= MIN_WORDS and sum(a[i:e]) >= MIN_RUNES:
                hits[(chapter, j, i, e)] = {
                    "chapter": chapter, "original_word_offset": j,
                    "source_word_offset": i, "word_count": e - i,
                    "rune_count": sum(a[i:e]),
                    "complete_chapter": j == 0 and f == len(target),
                }
    return list(hits.values())


def selftest(chapters: list[bytes]):
    assert word_lengths(P57_TEXT, True) == bytes(P57_RUNE_LENGTHS)
    assert len(chapters) == 9 and sum(map(len, chapters)) == 2896
    assert sum(map(sum, chapters)) == 12956
    index = index_chapters(chapters)
    for chapter, t in enumerate(chapters):
        pos = max(0, len(t) // 2 - 20)
        snippet = t[pos:pos + 30]
        found = scan_text(b"\x21\x22" + snippet + b"\x20\x20", chapters, index)
        assert any(h["chapter"] == chapter and h["word_count"] >= 30 for h in found), chapter
    print("PASS canonical original source 12,956 runes/2,896 words/nine frozen chapters", flush=True)
    print("PASS solved p57 20/20 native GP29 length control", flush=True)
    print("PASS nine planted 30-word original-source match positives", flush=True)
    print("TARGETS " + json.dumps({"runes": CHAPTER_RUNES,
                                  "words": list(map(len, chapters)),
                                  "window": WINDOW, "min_words": MIN_WORDS,
                                  "min_runes": MIN_RUNES}), flush=True)


def run(chapters: list[bytes], limit: int) -> None:
    from datasets import load_dataset

    index = index_chapters(chapters)
    began = time.monotonic()
    nbooks = nwords = nhits = max_words = 0
    print("SOURCE " + json.dumps({"dataset": DATASET,
                                  "target_words": sum(map(len, chapters)),
                                  "min_words": MIN_WORDS, "min_runes": MIN_RUNES,
                                  "conventions": ["ING1", "ING2"]}), flush=True)
    stream = load_dataset(DATASET, split="train", streaming=True)
    for record in stream:
        meta = record.get("metadata") or {}
        if isinstance(meta, str):
            meta = json.loads(meta)
        if meta.get("language", "en") != "en" or meta.get("license", "Public Domain") != "Public Domain":
            continue
        source = record.get("text") or ""
        a = word_lengths(source, True)
        b = word_lengths(source, False)
        assert len(a) == len(b)
        nbooks += 1
        nwords += len(a)
        matched = []
        for seq, mode in ((a, "ING1"), (b, "ING2")):
            for hit in scan_text(seq, chapters, index):
                hit["convention"] = mode
                matched.append(hit)
        if matched:
            words = WORD.findall(source)
            for h in matched:
                h["candidate_plaintext"] = " ".join(
                    words[h["source_word_offset"]:
                          h["source_word_offset"] + h["word_count"]])
                h["book_id"] = record.get("id")
                h["title"] = meta.get("title")
                h["url"] = meta.get("url")
                max_words = max(max_words, h["word_count"])
                nhits += 1
                print("MATCH " + json.dumps(h, ensure_ascii=False), flush=True)
        if nbooks % 100 == 0:
            print("PROGRESS " + json.dumps({
                "books": nbooks, "source_words": nwords,
                "matches": nhits, "longest_match_words": max_words,
                "elapsed_sec": int(time.monotonic() - began)}), flush=True)
        if limit and nbooks >= limit:
            break
    print("FINAL " + json.dumps({
        "books": nbooks, "source_words": nwords,
        "matches": nhits, "longest_match_words": max_words,
        "elapsed_sec": int(time.monotonic() - began)}), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    chapters = source_chapters(TRANSCRIPT)
    selftest(chapters)
    if not args.selftest:
        run(chapters, args.limit)


if __name__ == "__main__":
    main()
