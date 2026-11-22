"""Exact whole-LP2 word-length quotation search across fixed Gutenberg shards.

The original 2,896 printed LP2 word boundaries are the search pattern. A
suffix automaton finds the longest exact GP29 word-length match for every
book, independent of any guessed plaintext or key. No decrypted text is
asserted from a length-only match. Windows Python 3.12, read-only inputs.
"""
from __future__ import annotations

import argparse
from collections import Counter
from hashlib import sha256
import heapq
import json
from pathlib import Path
import re
import tempfile
import os
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
DATASET = "kevinnejad/Gutenberg"
REVISION = "28ed5ff2fd416ad0acff3298c5ba335d38ed601a"
WORD = re.compile(r"[A-Z]+")
GP = re.compile(r"ING|TH|NG|EO|OE|AE|EA|IA")

def source_word_lengths() -> bytes:
    corpus = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
    raw = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf-8")
    valid = set(corpus["runes"])
    words = [
        "".join(ch for ch in token if ch in valid)
        for token in re.split(r"[-.]", re.sub(r"[/\n%&$§]", "", raw))
    ]
    words = [w for w in words if w][:2896]
    original = "".join(
        corpus["runes"][i] for p in corpus["pages"] if p["page"] <= 55
        for i in p["indices"]
    )
    assert len(words) == 2896 and sum(map(len, words)) == 12956
    assert "".join(words) == original
    return bytes(len(w) for w in words)

def normalize(text: str) -> str:
    expanded = text.replace("Æ", "AE").replace("æ", "ae").replace("Œ", "OE").replace("œ", "oe")
    normalized = unicodedata.normalize("NFKD", expanded)
    return "".join(c for c in normalized if not unicodedata.combining(c)).upper()

def gp_lengths(text: str) -> bytes:
    source = normalize(text)
    return bytes(min(255, len(GP.sub("Z", m.group(0)))) for m in WORD.finditer(source))

class WordLengthSAM:
    """Deterministic suffix automaton on source-observed length symbols."""

    def __init__(self, data: bytes) -> None:
        self.pattern = data
        self.states = [{"next": {}, "link": -1, "length": 0, "last": -1}]
        tail = 0
        for pos, symbol in enumerate(data):
            cur = len(self.states)
            self.states.append({"next": {}, "link": 0, "length": self.states[tail]["length"] + 1, "last": pos})
            p = tail
            while p != -1 and symbol not in self.states[p]["next"]:
                self.states[p]["next"][symbol] = cur
                p = self.states[p]["link"]
            if p != -1:
                q = self.states[p]["next"][symbol]
                if self.states[p]["length"] + 1 == self.states[q]["length"]:
                    self.states[cur]["link"] = q
                else:
                    clone = len(self.states)
                    self.states.append({
                        "next": self.states[q]["next"].copy(),
                        "link": self.states[q]["link"],
                        "length": self.states[p]["length"] + 1,
                        "last": self.states[q]["last"],
                    })
                    while p != -1 and self.states[p]["next"].get(symbol) == q:
                        self.states[p]["next"][symbol] = clone
                        p = self.states[p]["link"]
                    self.states[q]["link"] = clone
                    self.states[cur]["link"] = clone
            tail = cur

    def longest(self, data: bytes) -> dict[str, int]:
        states = self.states
        state = length = 0
        best = {"words": 0, "manuscript_word": 0, "book_word": 0}
        for i, symbol in enumerate(data):
            while state and symbol not in states[state]["next"]:
                state = states[state]["link"]
                length = states[state]["length"]
            nxt = states[state]["next"].get(symbol)
            if nxt is None:
                state = length = 0
                continue
            state = nxt
            length += 1
            if length > best["words"]:
                best = {
                    "words": length,
                    "manuscript_word": states[state]["last"] - length + 1,
                    "book_word": i - length + 1,
                }
        return best

def selftest() -> tuple[WordLengthSAM, bytes]:
    original = source_word_lengths()
    assert len(original) == 2896
    assert gp_lengths("THROUGH BRINGING THING") == bytes([6, 4, 2])
    sam = WordLengthSAM(original)
    assert sam.longest(original)["words"] == 2896
    planted = bytes([254]) * 9 + original[487:514] + bytes([255]) * 5
    best = sam.longest(planted)
    assert best == {"words": 27, "manuscript_word": 487, "book_word": 9}, best
    assert sam.longest(bytes([254]) * 100)["words"] == 0
    print("PASS: original 2896-word/12956-rune source and blind 27-word exact positive")
    return sam, original

def save_atomic_locked(path: Path, value: dict) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", prefix=path.name + ".",
            suffix=".tmp", dir=path.parent, delete=False
        ) as stream:
            temp = Path(stream.name)
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
        os.replace(temp, path)

def search_shard(shard: int, sam: WordLengthSAM, original: bytes) -> dict:
    import pyarrow.parquet as pq

    uri = f"hf://datasets/{DATASET}@{REVISION}/Gutenberg-{shard:04d}.parquet"
    scanned = 0
    word_total = 0
    max_words = 0
    threshold_counts = Counter()
    ranked: list[tuple[int, int, dict]] = []
    with pq.ParquetFile(uri) as parquet:
        for batch in parquet.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for record in batch.to_pylist():
                scanned += 1
                text = record.get("Text") or ""
                if not text:
                    continue
                encoded = gp_lengths(text)
                word_total += len(encoded)
                best = sam.longest(encoded)
                size = best["words"]
                max_words = max(max_words, size)
                for threshold in (12, 15, 18, 22):
                    if size >= threshold:
                        threshold_counts[threshold] += 1
                if size >= 12:
                    first = best["manuscript_word"]
                    excerpt = ""
                    if size >= 17:
                        clear_words = WORD.findall(normalize(text))
                        excerpt = " ".join(clear_words[best["book_word"]:best["book_word"] + min(40, size)])
                    item = {
                        "gutenberg_id": record.get("ID"),
                        "title": str(record.get("Title") or "")[:150],
                        "author": str(record.get("Author") or "")[:100],
                        **best,
                        "manuscript_gp_rune_offset": sum(original[:first]),
                        "matched_native_gp_runes": sum(original[first:first + size]),
                        "candidate_source_words": excerpt,
                    }
                    candidate = (size, scanned, item)
                    if len(ranked) < 20:
                        heapq.heappush(ranked, candidate)
                    elif candidate[:2] > ranked[0][:2]:
                        heapq.heapreplace(ranked, candidate)
            if scanned % 100 == 0:
                print(f"PROGRESS shard={shard} books={scanned} words={word_total} "
                      f"max={max_words} >=18={threshold_counts[18]}", flush=True)
    output = {
        "decision": "exact whole-original-LP2 word-length source match, candidate only",
        "source": DATASET,
        "revision": REVISION,
        "shard": shard,
        "books": scanned,
        "source_words_scanned": word_total,
        "target_words": 2896,
        "target_runes": 12956,
        "target_length_sha256": sha256(original).hexdigest(),
        "normalization": "NFKD A-Z, greedy ING TH NG EO OE AE EA IA => one GP29 rune",
        "max_match_words": max_words,
        "books_at_least_words": dict(threshold_counts),
        "strongest": [item for _, _, item in sorted(ranked, reverse=True)],
        "caveat": "A length match is not authenticated plaintext without an original-cipher inverse and independent holdout.",
    }
    print("FINAL " + json.dumps({
        "shard": shard, "books": scanned, "words": word_total,
        "max_match_words": max_words, "books_at_least_words": dict(threshold_counts),
        "top3": output["strongest"][:3],
    }), flush=True)
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--shard", type=int)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    program, target = selftest()
    if args.shard is not None:
        if not 0 <= args.shard <= 58:
            parser.error("shard must be 0..58")
        result = search_shard(args.shard, program, target)
        if args.output:
            save_atomic_locked(args.output, result)
