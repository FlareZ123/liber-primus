"""Search genuinely distinct word-insertion/deletion quote variants in Gutenberg.

Target: original LP2 p42-p43 mark-delimited, 34/47 GP29 words.
Frozen limit: at most 2 unit-cost word-length edits for 34 words and 3
for 47 words, where substitutions, insertions, and deletions each cost one.
A >=9-word exact seed is mathematically required by either bound. Every
candidate in that bounded family is then tested with true edit distance.
The source is the same exact 59-shard Gutenberg revision as the earlier
exact GP-length scan, but this investigates shifted word boundaries.
"""
from __future__ import annotations

import json
import os
import tempfile
import time
from array import array
from pathlib import Path
from typing import Any

from lp2_quote_gutenberg_shard_sft import (
    WORD_RE, gp_length, normalize_text, TARGETS,
)

SOURCE = "kevinnejad/Gutenberg"
REVISION = "28ed5ff2fd416ad0acff3298c5ba335d38ed601a"
BUDGETS = {"p42_p43_34word": 2, "p42_p43_joined47word": 3}
SEED = 9
MAX_SAVED = 100


def distance(target: bytes, data: bytes, source_start: int,
             budget: int) -> tuple[int, int]:
    """Exact unit Levenshtein from target to a source prefix of size N+/-E.

    Source start is fixed. Source end is free only within the predeclared
    valid length interval [N-E,N+E]; no free leading or internal gaps.
    """
    n = len(target)
    m = min(n + budget, len(data) - source_start)
    if m < n - budget:
        return budget + 1, 0
    inf = budget + 1
    previous = [min(j, inf) for j in range(m + 1)]
    for i in range(1, n + 1):
        current = [inf] * (m + 1)
        if i <= budget:
            current[0] = i
        for j in range(max(1, i - budget), min(m, i + budget) + 1):
            current[j] = min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + (target[i - 1] != data[source_start + j - 1])
            )
        previous = current
    return min((previous[j], j) for j in
               range(n - budget, min(n + budget, m) + 1))


def source_search(text: str, metadata: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    content = normalize_text(text)
    starts = array("I")
    ends = array("I")
    stream = bytearray()
    for match in WORD_RE.finditer(content):
        starts.append(match.start())
        ends.append(match.end())
        stream.append(min(gp_length(match.group()), 255))
    data = bytes(stream)
    reports: dict[str, Any] = {}
    for label, budget in BUDGETS.items():
        target = bytes(TARGETS[label])
        n = len(target)
        assert (n - budget + budget) // (budget + 1) >= SEED
        seen: set[int] = set()
        counts = {"anchor_occurrences": 0,
                  "unique_aligned_starts": 0,
                  "accepted": 0}
        saved: list[dict[str, Any]] = []
        for offset in range(n - SEED + 1):
            anchor = target[offset:offset + SEED]
            search_from = 0
            while True:
                hit = data.find(anchor, search_from)
                if hit < 0:
                    break
                search_from = hit + 1
                counts["anchor_occurrences"] += 1
                center = hit - offset
                for shift in range(-budget, budget + 1):
                    first = center + shift
                    if first < 0 or first >= len(data) or first in seen:
                        continue
                    seen.add(first)
                    counts["unique_aligned_starts"] += 1
                    cost, length = distance(target, data, first, budget)
                    if cost > budget:
                        continue
                    counts["accepted"] += 1
                    if len(saved) < MAX_SAVED:
                        excerpt = content[starts[first]:ends[first + length - 1]]
                        saved.append({
                            "source": metadata, "word_start": first,
                            "source_word_count": length,
                            "source_GP_lengths": list(data[first:first+length]),
                            "target_GP_lengths": list(target),
                            "edit_distance": cost,
                            "excerpt": excerpt[:1300],
                        })
        reports[label] = {"budget": budget, "counts": counts, "accepted_first100": saved}
    return len(data), reports


def plant(target: tuple[int, ...]) -> str:
    return " ".join("Z" * n for n in target)


def selftest() -> None:
    for label, maxdist in BUDGETS.items():
        target = list(TARGETS[label])
        _, exact = source_search(plant(tuple(target)), {"test": label})
        assert exact[label]["counts"]["accepted"] >= 1, label
        if label == "p42_p43_34word":
            variant = target[:]
            variant.insert(13, 9)
            variant[25] += 1
        else:
            variant = target[:]
            variant.insert(13, 9)
            del variant[29]
            variant[40] += 1
        _, observed = source_search(plant(tuple(variant)), {"test": label})
        hits = observed[label]["accepted_first100"]
        assert any(hit["edit_distance"] <= maxdist for hit in hits), (label, observed)
        false_variant = target[:]
        for i in (2, 9, 17, 25)[:maxdist+1]:
            false_variant[i] += 8
        _, negative = source_search(plant(tuple(false_variant)), {"test": label})
        assert negative[label]["counts"]["accepted"] == 0, (label, negative)
    print("SFT PASS: original exact, insertion/deletion/substitution variant, budget+1 negative", flush=True)


def atomic_save(path: Path, report: dict[str, Any]) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8",
            prefix=path.name + ".", suffix=".tmp", dir=path.parent,
            delete=False) as file:
            tmp = Path(file.name)
            json.dump(report, file, indent=2, ensure_ascii=False)
            file.write("\n")
        os.replace(tmp, path)


def run(shard: int) -> dict[str, Any]:
    import pyarrow.parquet as pq

    assert 0 <= shard <= 58
    uri = f"hf://datasets/{SOURCE}@{REVISION}/Gutenberg-{shard:04d}.parquet"
    t0 = time.monotonic()
    counters = {k: {"anchor_occurrences": 0,
                    "unique_aligned_starts": 0,
                    "accepted": 0} for k in BUDGETS}
    saved: dict[str, list[dict[str, Any]]] = {k: [] for k in BUDGETS}
    books = 0
    words = 0
    print(f"START edit quote shard={shard:04d}", flush=True)
    with pq.ParquetFile(uri) as pf:
        for batch in pf.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for item in batch.to_pylist():
                books += 1
                info = {k: item[k] for k in ("ID", "Title", "Author")}
                nn, data = source_search(item["Text"] or "", info)
                words += nn
                for label in BUDGETS:
                    for key in counters[label]:
                        counters[label][key] += data[label]["counts"][key]
                    take = MAX_SAVED - len(saved[label])
                    saved[label].extend(data[label]["accepted_first100"][:max(0, take)])
                if books % 100 == 0:
                    print(f"PROGRESS shard={shard} books={books} words={words} "
                          f"accepted={ {k:v['accepted'] for k,v in counters.items()} } "
                          f"seconds={time.monotonic()-t0:.1f}", flush=True)
    report = {
        "task": "p42/43 original quote GP29 source edit-distance crib",
        "source": SOURCE, "revision": REVISION, "shard": shard,
        "source_uri": uri, "books_read": books, "word_tokens_read": words,
        "frozen_levenshtein_edits": BUDGETS,
        "source_wordlength_seed": SEED,
        "target_lengths": {k: TARGETS[k] for k in BUDGETS},
        "counts": counters, "first100_hits": saved,
        "elapsed_seconds": time.monotonic() - t0,
        "interpretation": "Source-quote hypothesis only; no LP2 cipher inferred.",
    }
    output = Path(os.environ.get("LP2_EDITQUOTE_OUTPUT",
                      f"im-results/gutenberg-quote-edits-{shard:04d}.json"))
    atomic_save(output, report)
    print("FINAL " + json.dumps({"shard": shard, "books": books, "words": words,
                                  "accepted": {k:v["accepted"] for k,v in counters.items()},
                                  "elapsed_seconds": report["elapsed_seconds"]}), flush=True)
    return report


if __name__ == "__main__":
    selftest()
    v = os.environ.get("LP2_EDITQUOTE_SHARD")
    if v is not None:
        run(int(v))
