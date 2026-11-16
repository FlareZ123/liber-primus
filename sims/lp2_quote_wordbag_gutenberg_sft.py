"""Recover potential complete source quotations even if original words were permuted.

The original LP2 has flat adjacent-word-length grammar; an historical 2014
14-column transposition demonstrates that creators used reordering at other
stages. We therefore test the *exact unordered inventory* of the source-marked
34-word quote and the adjacent 47-word quote pairing. This can yield a full
plaintext source candidate without knowing a key or secret word ordering.

Freeze both full 34/47 word-length bags before searching 53,000 Gutenberg
books, with native solved GP29 word contractions. No approximate histogram
fitting or shorter cherry-picked fragments are accepted as source hits.
"""
from __future__ import annotations

import json
import os
import tempfile
import time
from array import array
from pathlib import Path
from typing import Any

from lp2_quote_gutenberg_shard_sft import TARGETS, WORD_RE, gp_length, normalize_text

SOURCE = "kevinnejad/Gutenberg"
REVISION = "28ed5ff2fd416ad0acff3298c5ba335d38ed601a"
TARGET_LABELS = ("p42_p43_34word", "p42_p43_joined47word")
KEEP = 100


def bag_match(data: bytes, target: tuple[int, ...]) -> list[int]:
    """All start offsets with exactly identical GP-rune word-length multiset."""
    n = len(target)
    if len(data) < n:
        return []
    want = [0] * 256
    have = [0] * 256
    for b in target:
        want[b] += 1
    for b in data[:n]:
        have[b] += 1
    discrepancy = sum(abs(x-y) for x, y in zip(want,have))
    matches = [0] if discrepancy == 0 else []
    for j in range(n, len(data)):
        outgoing = data[j-n]
        old = have[outgoing] - want[outgoing]
        discrepancy += abs(old-1) - abs(old)
        have[outgoing] -= 1
        incoming = data[j]
        old = have[incoming] - want[incoming]
        discrepancy += abs(old+1) - abs(old)
        have[incoming] += 1
        if discrepancy == 0:
            matches.append(j-n+1)
    return matches


def seek(text: str, book: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    content = normalize_text(text)
    starts = array("I")
    ends = array("I")
    lengths = bytearray()
    for match in WORD_RE.finditer(content):
        starts.append(match.start())
        ends.append(match.end())
        lengths.append(min(gp_length(match.group()), 255))
    packed = bytes(lengths)
    hits: dict[str, Any] = {}
    for label in TARGET_LABELS:
        target = TARGETS[label]
        found = bag_match(packed, target)
        hits[label] = {
            "count": len(found),
            "records": [
                {
                    "book": book, "start_word_offset": i,
                    "source_GP_lengths": list(packed[i:i+len(target)]),
                    "full_source_excerpt": content[starts[i]:ends[i+len(target)-1]][:1350],
                } for i in found[:KEEP]
            ],
        }
    return len(packed), hits


def selftest() -> None:
    for label in TARGET_LABELS:
        target = TARGETS[label]
        rearranged = target[9:] + target[:9]
        text = " ".join("Z" * length for length in rearranged)
        n, outcome = seek(text, {"ID": "plant", "Title": "permuted known passage"})
        assert n == len(target)
        assert outcome[label]["count"] >= 1, label
        changed = list(rearranged)
        changed[4] += 1
        _, not_equal = seek(" ".join("Z" * k for k in changed), {})
        assert not_equal[label]["count"], (label, not_equal[label])
    print("SFT PASS: exact native-GP 34/47 bag matches from permuted source; one-word negatives", flush=True)


def locked_write(path: Path, report: dict[str, Any]) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path)+".lock"):
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=path.parent,
            prefix=path.name+".", suffix=".tmp", delete=False
        ) as f:
            tmp = Path(f.name)
            json.dump(report, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(tmp, path)


def run(shard: int) -> dict[str, Any]:
    import pyarrow.parquet as pq
    assert 0 <= shard <= 58
    uri = f"hf://datasets/{SOURCE}@{REVISION}/Gutenberg-{shard:04d}.parquet"
    began = time.monotonic()
    total = dict.fromkeys(TARGET_LABELS, 0)
    saved: dict[str, list[dict[str, Any]]] = {key: [] for key in TARGET_LABELS}
    books = 0
    words = 0
    print(f"START unordered quote shard={shard:04d}", flush=True)
    with pq.ParquetFile(uri) as pf:
        for batch in pf.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for item in batch.to_pylist():
                books += 1
                metadata = {k:item[k] for k in ("ID","Title","Author")}
                n, results = seek(item["Text"] or "", metadata)
                words += n
                for label in TARGET_LABELS:
                    total[label] += results[label]["count"]
                    slots = KEEP - len(saved[label])
                    saved[label].extend(results[label]["records"][:max(0, slots)])
                if any(results[k]["count"] for k in TARGET_LABELS):
                    print(f"MATCH book={item['ID']} title={str(item['Title'])[:65]} "
                          f"counts={ {k:results[k]['count'] for k in TARGET_LABELS} }", flush=True)
                if books % 100 == 0:
                    print(f"PROGRESS shard={shard} books={books} words={words} "
                          f"matches={total} seconds={time.monotonic()-began:.1f}", flush=True)
    out = {
        "task": "source-authored 34/47-GP-word quotation with arbitrary whole-word permutation",
        "source": SOURCE, "revision": REVISION, "shard": shard, "source_uri": uri,
        "books_read": books, "word_tokens_read": words,
        "frozen_targets": {k:TARGETS[k] for k in TARGET_LABELS},
        "exact_bag_hits": total, "first100_hits": saved,
        "elapsed_seconds": time.monotonic()-began,
        "caveat": "Unordered exact word-length hit is only a potential source crib. Word permutation and symbol cipher remain unidentified.",
    }
    dest=Path(os.environ.get("LP2_QUOTEBAG_OUTPUT",
                 f"im-results/gutenberg-quotebag-{shard:04d}.json"))
    locked_write(dest, out)
    print("FINAL " + json.dumps({"shard":shard,"books":books,"words":words,
                                 "exact_bag_hits":total,
                                 "elapsed_seconds":out["elapsed_seconds"]}),flush=True)
    return out


if __name__ == "__main__":
    selftest()
    raw = os.environ.get("LP2_QUOTEBAG_SHARD")
    if raw is not None:
        run(int(raw))
