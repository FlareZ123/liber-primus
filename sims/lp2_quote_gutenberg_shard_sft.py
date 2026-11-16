"""Source-quote word-length fingerprint scan of public Project Gutenberg Parquet.

Use without LP2_GUTENBERG_SHARD for its positive/negative SFT. Set the
environment variable to a Parquet shard 0..58 for the original-source scan.
"""
from __future__ import annotations

import json
import os
import re
import tempfile
import time
import unicodedata
from array import array
from pathlib import Path
from typing import Any

# The original word boundaries, source-attested in
# im-results/lp2-original-quote-native-wordlength-book-source-gate.md.
TARGETS: dict[str, tuple[int, ...]] = {
    "p40_14word": (5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4),
    "p53_14word": (5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3),
    "p42_13word": (9, 8, 3, 4, 6, 3, 10, 2, 4, 7, 6, 2, 4),
    "p42_p43_joined47word": (
        9, 8, 3, 4, 6, 3, 10, 2, 4, 7, 6, 2, 4, 4, 2, 4, 6, 6, 8, 8, 3, 5, 5, 9, 2, 2, 4, 3, 3, 2, 8, 4, 7, 4, 4, 3, 2, 5, 3, 3, 6, 3, 11, 4, 4, 8, 5,
    ),
    "p42_p43_34word": (
        4, 2, 4, 6, 6, 8, 8, 3, 5, 5, 9, 2, 2, 4, 3, 3, 2,
        8, 4, 7, 4, 4, 3, 2, 5, 3, 3, 6, 3, 11, 4, 4, 8, 5,
    ),
}
WORD_RE = re.compile(r"[A-Z]+")
GP_RE = re.compile(r"ING|TH|NG|EO|OE|AE|EA|IA")
PACKED = {name: bytes(lengths) for name, lengths in TARGETS.items()}


def normalize_text(text: str) -> str:
    expanded = text.replace("Æ", "AE").replace("æ", "ae").replace("Œ", "OE").replace("œ", "oe")
    decomposed = unicodedata.normalize("NFKD", expanded)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).upper()


def gp_length(word: str) -> int:
    return len(GP_RE.sub("Z", word))


def find_matches(text: str, metadata: dict[str, Any]) -> tuple[int, dict[str, int], list[dict[str, Any]]]:
    s = normalize_text(text)
    initials = array("I")
    finals = array("I")
    runelens = bytearray()
    for match in WORD_RE.finditer(s):
        runelens.append(min(gp_length(match.group(0)), 255))
        initials.append(match.start())
        finals.append(match.end())
    encoded = bytes(runelens)
    counts: dict[str, int] = {}
    records: list[dict[str, Any]] = []
    for target, signature in PACKED.items():
        count = 0
        start = 0
        while True:
            pos = encoded.find(signature, start)
            if pos < 0:
                break
            count += 1
            if len(records) < 100:
                excerpt_words = min(len(signature), 14)
                excerpt = s[initials[pos]:finals[pos + excerpt_words - 1]]
                records.append({
                    "target": target,
                    "word_offset": pos,
                    "book": metadata,
                    "excerpt_first14": excerpt[:400],
                    "char_offset": initials[pos],
                    "matched_word_lengths": list(TARGETS[target]),
                })
            start = pos + 1
        counts[target] = count
    return len(runelens), counts, records


def selftest() -> None:
    sample = "\n".join(" ".join("Z" * n for n in ns) for ns in TARGETS.values())
    n, counts, hits = find_matches(sample, {"ID": 999, "Title": "synthetic control"})
    assert all(counts[k] >= 1 for k in TARGETS), counts
    assert n == sum(len(ns) for ns in TARGETS.values())
    assert len(hits) >= 3
    assert gp_length("FOLLOWING") == 7
    assert gp_length("THE") == 2
    assert gp_length("SING") == 2
    assert gp_length("ÆTHER") == 4
    assert find_matches("A short unrelated test phrase.", {})[1] == dict.fromkeys(TARGETS, 0)
    print("SFT PASS: GP29 ING-first spelling, five exact plants and negative decoy", flush=True)


def save_json_atomic_locked(path: Path, obj: dict[str, Any]) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent,
                                         prefix=path.name + ".", suffix=".tmp",
                                         delete=False) as fp:
            tmp = Path(fp.name)
            json.dump(obj, fp, ensure_ascii=False, indent=2)
            fp.write("\n")
        os.replace(tmp, path)


def run_shard(shard: int) -> dict[str, Any]:
    import pyarrow.parquet as pq
    from huggingface_hub import HfApi

    repo = "kevinnejad/Gutenberg"
    info = HfApi().repo_info(repo_id=repo, repo_type="dataset")
    revision = info.sha
    all_shards = sorted(s.rfilename for s in info.siblings
                        if re.fullmatch(r"Gutenberg-\d{4}\.parquet", s.rfilename))
    print(f"SOURCE MANIFEST shard_files={len(all_shards)} first={all_shards[0] if all_shards else None} "
          f"last={all_shards[-1] if all_shards else None}", flush=True)
    uri = f"hf://datasets/{repo}@{revision}/Gutenberg-{shard:04d}.parquet"
    print(f"SOURCE START shard={shard:04d} repository={repo} revision={revision} uri={uri}", flush=True)
    began = time.monotonic()
    counts = dict.fromkeys(TARGETS, 0)
    matches: list[dict[str, Any]] = []
    books = 0
    words = 0
    books_with_text = 0
    with pq.ParquetFile(uri) as pf:
        print(f"Parquet row groups={pf.num_row_groups} schema={pf.schema_arrow}", flush=True)
        for batch in pf.iter_batches(batch_size=8, columns=["ID", "Title", "Author", "Text"]):
            for item in batch.to_pylist():
                books += 1
                metadata = {k: item[k] for k in ("ID", "Title", "Author")}
                source_text = item["Text"] or ""
                if not source_text:
                    continue
                books_with_text += 1
                nn, cc, recs = find_matches(source_text, metadata)
                words += nn
                for k, count in cc.items():
                    counts[k] += count
                if recs:
                    print(f"SOURCE MATCH book={item['ID']} title={str(item['Title'])[:50]} hits={cc}", flush=True)
                    matches.extend(recs[:max(0, 1000 - len(matches))])
                if books % 100 == 0:
                    print(f"PROGRESS shard={shard:04d} books={books} words={words} "
                          f"hits={counts} seconds={time.monotonic()-began:.1f}", flush=True)
    report = {
        "task": "LP2 original marked-quote GP29 word-length source crib",
        "source": repo, "revision": revision, "shard": shard, "uri": uri,
        "gp_normalization": "NFKD uppercase A-Z, Æ->AE, Œ->OE; greedy ING,TH,NG,EO,OE,AE,EA,IA to one rune",
        "notes": "An exact quotation signature yields candidate source text, not historical plaintext. Dataset may include other languages.",
        "books_read": books, "books_with_text": books_with_text,
        "word_tokens_read": words, "exact_counts": counts,
        "matches_first1000": matches,
        "elapsed_seconds": time.monotonic() - began,
        "sft_pass": True,
    }
    out = Path(os.environ.get("LP2_GUTENBERG_OUTPUT",
                              f"im-results/gutenberg-quote-shard-{shard:04d}.json"))
    save_json_atomic_locked(out, report)
    print("FINAL " + json.dumps({k: report[k] for k in
          ("shard", "books_read", "word_tokens_read", "exact_counts", "elapsed_seconds")}), flush=True)
    return report


if __name__ == "__main__":
    selftest()
    raw = os.environ.get("LP2_GUTENBERG_SHARD")
    if raw is not None:
        run_shard(int(raw))
