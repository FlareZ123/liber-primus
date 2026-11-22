"""Original marked LP2 quotes searched against *literal Latin* word lengths.

Distinct from the completed 59-shard historical GP29-contracted Gutenberg scan.
A one-Latin-letter-per-rune plaintext register could preserve ordinary Latin
word counts inside the unknown ciphertext. It is not proven: solved p57 uses GP
contractions, but original LP2's length histogram fits literal Latin better.
Original p40/p53 source-marked quote starts share the 5,7,2,3,4 Latin length
of the 2016 signed sentence THEIR MEANING IS THE ROAD; its GP29 lengths differ.
The signed phrase is only a hypothesis cue; this search requires complete
34/47-word or complete 13/14-word literal-source signatures.
"""
from __future__ import annotations

import json
import os
import tempfile
import time
from array import array
from pathlib import Path
from typing import Any

from lp2_quote_gutenberg_shard_sft import WORD_RE, TARGETS, normalize_text

REVISION = "28ed5ff2fd416ad0acff3298c5ba335d38ed601a"
SOURCE = "kevinnejad/Gutenberg"
PATTERNS = {name: bytes(nums) for name, nums in TARGETS.items()}
SAVED_LIMIT = 100


def seek_original_source(text: str, source: dict[str, Any]) -> tuple[int, dict[str, int], list[dict[str, Any]]]:
    clean = normalize_text(text)
    beginnings = array("I")
    endings = array("I")
    word_bytes = bytearray()
    for match in WORD_RE.finditer(clean):
        word_bytes.append(min(len(match.group()), 255))
        beginnings.append(match.start())
        endings.append(match.end())
    encoded = bytes(word_bytes)
    counts = dict.fromkeys(PATTERNS, 0)
    found: list[dict[str, Any]] = []
    for label, pattern in PATTERNS.items():
        offset = 0
        while True:
            pos = encoded.find(pattern, offset)
            if pos < 0:
                break
            counts[label] += 1
            if len(found) < SAVED_LIMIT:
                fragment = clean[beginnings[pos]:endings[pos + len(pattern) - 1]]
                found.append({
                    "target": label, "source": source,
                    "source_word_start": pos, "source_char_start": beginnings[pos],
                    "complete_match_word_count": len(pattern),
                    "source_excerpt": fragment[:1100]
                })
            offset = pos + 1
    return len(word_bytes), counts, found


def selftest() -> None:
    parts = [" ".join("Z" * n for n in target) for target in TARGETS.values()]
    total, counts, hits = seek_original_source("\n".join(parts), {"ID": "planted"})
    assert total == sum(len(x) for x in TARGETS.values())
    assert all(n >= 1 for n in counts.values()), counts
    assert len(hits) >= len(PATTERNS)
    # Independent signed-2016 clause has this exact *raw-Latin* first-five shape.
    phrase = "THEIR MEANING IS THE ROAD"
    assert [len(s) for s in phrase.split()] == list(TARGETS["p40_14word"][:5])
    assert [len(s) for s in phrase.split()] == list(TARGETS["p53_14word"][:5])
    assert not any(seek_original_source("THEIR MEANING IS THE ROAD", {})[1].values())
    assert all(x == 0 for x in seek_original_source(
        "An unrelated short decoy paragraph", {}
    )[1].values())
    print("SFT PASS: five full Latin-original quote plants, independent 2016 five-word source and decoy", flush=True)


def atomic_write(path: Path, report: dict[str, Any]) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", suffix=".tmp", delete=False
        ) as f:
            tmp = Path(f.name)
            json.dump(report, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(tmp, path)


def run(shard: int) -> dict[str, Any]:
    import pyarrow.parquet as pq
    assert 0 <= shard <= 58
    uri = f"hf://datasets/{SOURCE}@{REVISION}/Gutenberg-{shard:04d}.parquet"
    started = time.monotonic()
    counts = dict.fromkeys(PATTERNS, 0)
    matches: list[dict[str, Any]] = []
    books = 0
    words = 0
    print(f"START Latin source quote shard={shard:04d}", flush=True)
    with pq.ParquetFile(uri) as pf:
        for batch in pf.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for item in batch.to_pylist():
                books += 1
                metadata = {k: item[k] for k in ("ID", "Title", "Author")}
                n, local_counts, local_matches = seek_original_source(item["Text"] or "", metadata)
                words += n
                for key in PATTERNS:
                    counts[key] += local_counts[key]
                take = SAVED_LIMIT - len(matches)
                matches.extend(local_matches[:max(0, take)])
                if local_matches:
                    print(f"HIT shard={shard} book={item['ID']} title={str(item['Title'])[:64]} "
                          f"matching={local_counts}", flush=True)
                if books % 100 == 0:
                    print(f"PROGRESS shard={shard} books={books} words={words} matches={counts} "
                          f"seconds={time.monotonic()-started:.1f}", flush=True)
    report = {
        "task": "full LP2 original marked quotations exact literal-Latin source-length crib",
        "source": SOURCE, "revision": REVISION, "shard": shard,
        "source_uri": uri, "books_read": books, "source_words_read": words,
        "orthography": "one source Latin A-Z letter = one ciphertext rune slot, not GP digraph contraction",
        "original_quote_targets": TARGETS,
        "exact_match_counts": counts, "first100_matches": matches,
        "elapsed_seconds": time.monotonic() - started,
        "scope": "Complete 13/14/34/47-word source text only; five-word coincidence is explicitly insufficient.",
    }
    dest = Path(os.environ.get("LP2_LATIN_QUOTE_OUTPUT",
                   f"im-results/gutenberg-latin-quote-{shard:04d}.json"))
    atomic_write(dest, report)
    print("FINAL " + json.dumps({
        "shard": shard, "books": books, "words": words,
        "exact_counts": counts,
        "elapsed_seconds": report["elapsed_seconds"]
    }), flush=True)
    return report


if __name__ == "__main__":
    selftest()
    v = os.environ.get("LP2_LATIN_QUOTE_SHARD")
    if v is not None:
        run(int(v))
