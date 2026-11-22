"""Bounded near-quotation crib search over the 2014 LP2 original word lengths.

Search two fully source-marked p42/p43 quote windows against a frozen 53,000
Gutenberg-book 2026 snapshot, allowing at most five (34-word) or seven (47-word)
absolute GP-word-length units of discrepancy. These budgets and the five-word
exact-seed necessary condition are frozen before evaluating source text.

Without LP2_NEAR_GUTENBERG_SHARD, run source-independent positive controls.
With a shard number, scan the exact archived Gutenberg shard into an atomic
JSON result. All source artifacts and raw LP2 runes remain immutable.
"""
from __future__ import annotations

import json
import os
import re
import tempfile
import time
from array import array
from pathlib import Path
from typing import Any

from lp2_quote_gutenberg_shard_sft import (
    GP_RE, WORD_RE, TARGETS, normalize_text, gp_length,
)

REVISION = "28ed5ff2fd416ad0acff3298c5ba335d38ed601a"
REPO = "kevinnejad/Gutenberg"
# Frozen before looking at any source output.
BUDGETS = {"p42_p43_34word": 5, "p42_p43_joined47word": 7}
SEED_LENGTH = 5
MAX_RECORDED = 200


def search_one(text: str, metadata: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    """Find every source window meeting the exact predeclared error budget.

    If N source/target length positions have sum abs error <= B, then at most
    B positions differ. Their N-B equal positions split into at most B+1
    runs, so some run contains at least ceil((N-B)/(B+1)) equal lengths.
    For (N,B)=(34,5) this is 5, and for (47,7) it is 5. A five-word exact
    seed is therefore NECESSARY for each allowed near hit, independent of
    the distribution of word lengths. Searching these seeds is exhaustive.
    """
    normalized = normalize_text(text)
    initials = array("I")
    finals = array("I")
    lengths = bytearray()
    for match in WORD_RE.finditer(normalized):
        lengths.append(min(gp_length(match.group()), 255))
        initials.append(match.start())
        finals.append(match.end())
    encoded = bytes(lengths)
    results: dict[str, Any] = {}

    for label, budget in BUDGETS.items():
        target = bytes(TARGETS[label])
        n = len(target)
        assert (n - budget) // (budget + 1) >= SEED_LENGTH - 1
        counts = {"seed_hits": 0, "unique_windows_checked": 0,
                  "accepted": 0, "best_seeded_distance": None}
        matches: list[dict[str, Any]] = []
        seen: set[int] = set()
        for seed_offset in range(n - SEED_LENGTH + 1):
            seed = target[seed_offset:seed_offset + SEED_LENGTH]
            search_at = 0
            while True:
                hit = encoded.find(seed, search_at)
                if hit < 0:
                    break
                counts["seed_hits"] += 1
                candidate_start = hit - seed_offset
                search_at = hit + 1
                if candidate_start < 0 or candidate_start + n > len(encoded):
                    continue
                if candidate_start in seen:
                    continue
                seen.add(candidate_start)
                counts["unique_windows_checked"] += 1
                error = 0
                for i in range(n):
                    error += abs(encoded[candidate_start + i] - target[i])
                    if error > budget:
                        break
                if error <= budget:
                    counts["accepted"] += 1
                    if counts["best_seeded_distance"] is None or error < counts["best_seeded_distance"]:
                        counts["best_seeded_distance"] = error
                    if len(matches) < MAX_RECORDED:
                        fragment = normalized[initials[candidate_start]:
                                              finals[candidate_start + n - 1]]
                        deviations = [
                            [i, int(encoded[candidate_start + i] - target[i])]
                            for i in range(n)
                            if encoded[candidate_start + i] != target[i]
                        ]
                        matches.append({
                            "source": metadata,
                            "word_offset": candidate_start,
                            "char_offset": initials[candidate_start],
                            "GP_length_absolute_error": error,
                            "deviations": deviations,
                            "source_word_lengths": list(encoded[candidate_start:candidate_start + n]),
                            "excerpt": fragment[:1000],
                        })
        results[label] = {"budget": budget, "counts": counts, "matches": matches}
    return len(encoded), results


def selftest() -> None:
    # Mutation positions were selected independently of source corpus scores.
    edits = {
        "p42_p43_34word": {0, 6, 12, 18, 27},
        "p42_p43_joined47word": {0, 7, 14, 21, 28, 35, 42},
    }
    for label, target in TARGETS.items():
        if label not in BUDGETS:
            continue
        original = " ".join("Z" * n for n in target)
        changed = " ".join("Z" * (n + (i in edits[label])) for i, n in enumerate(target))
        for sample, expected in ((original, 0), (changed, BUDGETS[label])):
            count, result = search_one(sample, {"ID": "planted", "Title": "fixed control"})
            accepted = result[label]["matches"]
            assert count == len(target), (label, count)
            assert accepted and accepted[0]["GP_length_absolute_error"] == expected, (label, expected, result)
            assert accepted[0]["word_offset"] == 0, (label, expected)
        # At budget+1 substitutions, the result must be rejected.
        damaged = " ".join("Z" * (n + (i in edits[label] or i == 2)) for i, n in enumerate(target))
        _, bad = search_one(damaged, {})
        assert not bad[label]["matches"], (label, bad[label])
    assert all(not x["matches"] for x in search_one(
        "A tiny unrelated source cannot fill the exact pattern", {}
    )[1].values())
    assert gp_length("FOLLOWING") == 7
    assert gp_length("THE") == 2
    print("SFT PASS: 34/47 exact positives, frozen-error positives and budget+1 negatives")


def save_atomic_locked(path: Path, payload: dict[str, Any]) -> None:
    from filelock import FileLock

    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", suffix=".tmp", delete=False
        ) as out:
            tmp = Path(out.name)
            json.dump(payload, out, indent=2, ensure_ascii=False)
            out.write("\n")
        os.replace(tmp, path)


def run_shard(shard: int) -> dict[str, Any]:
    import pyarrow.parquet as pq

    if not 0 <= shard <= 58:
        raise ValueError("Source shard must be 0..58")
    uri = f"hf://datasets/{REPO}@{REVISION}/Gutenberg-{shard:04d}.parquet"
    started = time.monotonic()
    counters = {k: {"accepted": 0, "unique_windows_checked": 0,
                    "seed_hits": 0} for k in BUDGETS}
    kept = {k: [] for k in BUDGETS}
    books = 0
    words = 0
    print(f"START nearcrib shard={shard} repo={REPO} revision={REVISION}", flush=True)
    with pq.ParquetFile(uri) as pf:
        for batch in pf.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for item in batch.to_pylist():
                books += 1
                metadata = {k: item[k] for k in ("ID", "Title", "Author")}
                count, one = search_one(item["Text"] or "", metadata)
                words += count
                for label in BUDGETS:
                    cur = one[label]
                    for c in counters[label]:
                        counters[label][c] += cur["counts"][c]
                    if cur["matches"]:
                        can_take = MAX_RECORDED - len(kept[label])
                        kept[label].extend(cur["matches"][:max(0, can_take)])
                        print(f"HIT {label} book={item['ID']} title={str(item['Title'])[:60]} "
                              f"n={cur['counts']['accepted']}", flush=True)
                if books % 100 == 0:
                    print(f"PROGRESS shard={shard} books={books} words={words} "
                          f"accepted={ {k: v['accepted'] for k,v in counters.items()} } "
                          f"seconds={time.monotonic()-started:.1f}", flush=True)
    report = {
        "task": "original LP2 34/47-word quotation L1-near-match crib screen",
        "source": REPO, "revision": REVISION, "shard": shard,
        "source_uri": uri, "books_read": books, "word_tokens_read": words,
        "frozen_absolute_distance_budgets": BUDGETS,
        "frozen_exact_seed_length": SEED_LENGTH,
        "target_word_lengths": {k: TARGETS[k] for k in BUDGETS},
        "complete_near_hit_counts": counters,
        "first200_hits": kept,
        "elapsed_seconds": time.monotonic() - started,
        "interpretation": "Near matches are source cribs only; authentic plaintext requires a cipher inverse.",
    }
    out = Path(os.environ.get(
        "LP2_NEAR_GUTENBERG_OUTPUT",
        f"im-results/gutenberg-nearcrib-{shard:04d}.json"
    ))
    save_atomic_locked(out, report)
    print("FINAL " + json.dumps({
        "shard": shard, "books": books, "words": words,
        "accepted": {k: c["accepted"] for k, c in counters.items()},
        "elapsed_seconds": report["elapsed_seconds"]}), flush=True)
    return report


if __name__ == "__main__":
    selftest()
    raw = os.environ.get("LP2_NEAR_GUTENBERG_SHARD")
    if raw is not None:
        run_shard(int(raw))
