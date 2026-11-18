#!/usr/bin/env python3
"""Exact, key-phase-free GP29 long-word test of the registered 581-key pdir library.

This is a necessary-condition gate for the NO-HIDDEN-SKIPS subfamily: independently
grant every printed word an arbitrary start in every source key, either pointer
direction, and either affine shift sign. The 66 word-number rules and all 18
pointer conventions restrict these choices further. The test does NOT exclude
models with hidden rejected key attempts, lost word boundaries, or unknown
plaintext outside the registered native-GP English lexicon.

Run with Python 3.12 after the pinned external kscreen/export.py has generated
work/kscreen/data/library_flat.ksb. Read-only, no key or ciphertext mutation.
"""
from __future__ import annotations

from collections import defaultdict
from hashlib import sha256
import json
from pathlib import Path
import re
import struct
import sys

ROOT = Path(__file__).resolve().parent.parent
N = 29
MIN_LENGTH = 10
HASH_RUNES = 8


def read_library(path: Path) -> list[tuple[str, bytes]]:
    data = path.read_bytes()
    assert data[:4] == b"KSB1", "Expected source-native KSB1 stream library"
    n = struct.unpack_from("<I", data, 4)[0]
    pos = 8
    result = []
    for _ in range(n):
        length = struct.unpack_from("<H", data, pos)[0]
        pos += 2
        name = data[pos:pos + length].decode("utf-8")
        pos += length
        count = struct.unpack_from("<I", data, pos)[0]
        pos += 4
        key = data[pos:pos + count]
        pos += count
        assert len(key) == count and all(x < N for x in key), name
        result.append((name, key))
    assert pos == len(data) and n == 581, (pos, len(data), n)
    return result


def original_words(corpus: dict) -> tuple[list[bytes], list[int]]:
    char_to_rank = {r: i for i, r in enumerate(corpus["runes"])}
    text = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text("utf-8")
    words, pending, allrunes = [], bytearray(), []
    for char in text:
        if len(allrunes) >= 12956:
            break
        if char in char_to_rank:
            index = char_to_rank[char]
            allrunes.append(index)
            pending.append(index)
        elif char not in ("/", "%") and not char.isspace() and pending:
            words.append(bytes(pending))
            pending.clear()
    if pending:
        words.append(bytes(pending))
    required = [x for pg in corpus["pages"] if pg["page"] <= 55 for x in pg["indices"]]
    assert allrunes == required and len(allrunes) == 12956, "Original rune gate"
    assert len(words) == 2896, ("Complete printed-word gate", len(words))
    return words, allrunes


def gp_encode(word: str, tokens: list[str]) -> bytes:
    text = word.upper().replace("QU", "CW").replace("V", "U")
    text = re.sub("[KQ]", "C", text).replace("Z", "S")
    order = sorted(enumerate(tokens), key=lambda v: -len(v[1]))
    result = bytearray()
    i = 0
    while i < len(text):
        if text.startswith("ING", i):
            result.append(21)
            i += 3
            continue
        if text.startswith("IO", i):
            result.append(27)
            i += 2
            continue
        found = next(((index, token) for index, token in order
                      if text.startswith(token, i)), None)
        if found is None:
            return b""
        index, token = found
        result.append(index)
        i += len(token)
    return bytes(result)


def lexicon(corpus: dict) -> dict[int, list[tuple[str, bytes]]]:
    lookup = defaultdict(dict)
    raw = (ROOT / "resources/control/english_wordfreq_textblob.txt").read_text("utf-8")
    for line in raw.splitlines():
        if line.startswith(";"):
            continue
        item = line.split()
        if not item or not item[0].isascii() or not item[0].isalpha():
            continue
        encoded = gp_encode(item[0], corpus["translit"])
        if len(encoded) >= MIN_LENGTH:
            lookup[len(encoded)].setdefault(encoded, item[0].upper())
    for word in ("CIRCUMFERENCES", "BEHAVIORS", "ENCRYPTED",
                 "ILLUSIONS", "INHABITING", "PRIMALITY"):
        encoded = gp_encode(word, corpus["translit"])
        if len(encoded) >= MIN_LENGTH:
            lookup[len(encoded)].setdefault(encoded, word)
    return {n: [(word, pattern) for pattern, word in by_word.items()]
            for n, by_word in lookup.items()}


def prefix_code(pattern: bytes) -> int:
    return int.from_bytes(pattern[:HASH_RUNES], "little")


def build_key_index(keys: list[tuple[str, bytes]]) -> set[int]:
    prefixes: set[int] = set()
    for _, key in keys:
        # The registered complete key is literal; no synthetic extension or
        # inferred reset. Eight adjacent GP29 symbols must occur in this key.
        prefixes.update(prefix_code(key[j:j + HASH_RUNES])
                        for j in range(len(key) - HASH_RUNES + 1))
    return prefixes


def complete_hits(pattern: bytes, keys: list[tuple[str, bytes]]) -> list[tuple[str, int]]:
    found = []
    for name, key in keys:
        position = key.find(pattern)
        if position >= 0:
            found.append((name, position))
    return found


def decode_candidates(cipher: bytes, dictionary: list[tuple[str, bytes]],
                      prefixes: set[int], keys: list[tuple[str, bytes]]) -> dict:
    eligible = 0
    matches = []
    for word, plain in dictionary:
        minus = bytes((c - p) % N for c, p in zip(cipher, plain))
        for sign, required in ((1, minus), (28, bytes((-x) % N for x in minus))):
            for direction, needle in ((1, required), (-1, required[::-1])):
                if prefix_code(needle) not in prefixes:
                    continue
                eligible += 1
                for key_name, key_offset in complete_hits(needle, keys):
                    matches.append({
                        "word": word, "sign": sign, "direction": direction,
                        "source_key": key_name, "forward_key_start": key_offset,
                    })
    return {"prefix_survivors": eligible, "complete_matches": matches}


def main() -> None:
    assert len(sys.argv) == 2, "Usage: python sims/lp2_pdir_581_longword_freephase_sft.py <library_flat.ksb>"
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text("utf-8"))
    keys = read_library(Path(sys.argv[1]))
    words, allrunes = original_words(corpus)
    dictionary = lexicon(corpus)
    prefixes = build_key_index(keys)

    observed = defaultdict(lambda: {"words": 0, "with_matches": 0, "hits": 0,
                                     "prefix_survivors": 0})
    discoveries = []
    for word_index, cipher in enumerate(words):
        if len(cipher) < MIN_LENGTH:
            continue
        x = decode_candidates(cipher, dictionary.get(len(cipher), []), prefixes, keys)
        stat = observed[len(cipher)]
        stat["words"] += 1
        stat["with_matches"] += bool(x["complete_matches"])
        stat["hits"] += len(x["complete_matches"])
        stat["prefix_survivors"] += x["prefix_survivors"]
        for hit in x["complete_matches"]:
            discoveries.append({"original_word_index": word_index, **hit})
    assert sum(stat["words"] for stat in observed.values()) == 109, observed

    # Actual registered historical key and source-native solved-p57 spelling.
    control = gp_encode("CIRCUMFERENCES", corpus["translit"])
    assert len(control) >= MIN_LENGTH
    key_name, key = next((name, k) for name, k in keys if len(k) > 500)
    planted = bytes((x + key[100 + i]) % N for i, x in enumerate(control))
    positive = decode_candidates(planted, dictionary[len(control)], prefixes, keys)
    assert any(h["word"] == "CIRCUMFERENCES" and h["sign"] == 1
               and h["direction"] == 1 and h["source_key"] == key_name
               and h["forward_key_start"] == 100
               for h in positive["complete_matches"]), "Source-native positive plant failed"

    print(json.dumps({
        "gate": "PASS",
        "source_runes": len(allrunes),
        "source_sha256_rune_indices": sha256(bytes(allrunes)).hexdigest(),
        "source_complete_words": len(words),
        "registered_historical_keys": len(keys),
        "keystream_values": sum(len(k) for _, k in keys),
        "indexed_eight_key_registers": len(prefixes),
        "native_dictionary_by_rune_length": {n: len(v) for n, v in sorted(dictionary.items())},
        "model": "Every independent word start, both shifts, both pointer directions, zero hidden skipped attempts",
        "original_at_least_ten_rune_words": dict(sorted(observed.items())),
        "original_exact_preimages": discoveries[:100],
        "original_exact_preimage_count": len(discoveries),
        "planted_known_p57_gp_word": "CIRCUMFERENCES",
        "planted_positive_exact_key": key_name,
        "planted_positive_exact_matches": len(positive["complete_matches"]),
        "scope": "No-skip necessary condition only; hidden rejections or non-English register not excluded",
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
