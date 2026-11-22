#!/usr/bin/env python3
"""Reconcile all 78 disjoint C-screen artifacts from the exact keyskip1 S2 sweep.

The frozen Round42 cursors and the already-covered [4140000000,2**32) tail
define exactly which gaps to fill. Reject any missing/incomplete/overlapping
artifact. Preserve every panel-R36 near-miss and top candidate for stage-B.

Usage: python3 aggregate_mt_exact.py artifacts-dir result.json
"""
import fcntl
import json
import os
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
OUT = Path(sys.argv[2])
CLAIM_BAR = 7.6341931878728095
NEAR_BAR = CLAIM_BAR - 0.1
EXPECTED = [
    (371757563, 715827882),
    (1090732453, 1431655764),
    (1806229583, 2147483646),
    (2519684857, 2863311528),
    (3231257507, 3579139410),
    (3953451853, 4140000000),
]

files = sorted(ROOT.glob("mt-exact-remainder-*/sweep-run/STATUS.json"))
assert len(files) == 78, f"expected all 78 complete artifacts; got {len(files)}"
rows = []
high = []
top = []
total_candidates = 0
for path in files:
    state = json.loads(path.read_text(encoding="utf-8"))
    start, end = state["from"], state["to"]
    agg = state["aggregate"]
    assert agg["seeds_done"] == end - start, (path, agg)
    assert agg["lane_words_covered"] == end - start, (path, agg)
    assert agg["lane_coverage_fraction"] == 1.0, (path, agg)
    assert all(worker["done"] and worker["cursor"] == worker["band_end"]
               for worker in state["workers"]), path
    candidates_path = path.with_name("candidates.jsonl")
    candidates = [json.loads(line) for line in candidates_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert len(candidates) == agg["n_candidates"], (path, len(candidates), agg["n_candidates"])
    assert all(start <= int(item["seed"]) < end for item in candidates), path
    observed_hits = [dict(seed=int(item["seed"]), pmax=item["pmax"],
                          source=path.parent.parent.name)
                     for item in candidates if item["pmax"] >= CLAIM_BAR]
    assert len(observed_hits) == agg["n_claim_bar_hits"], (path, observed_hits)
    top.extend(dict(seed=int(item["seed"]), pmax=item["pmax"], source=path.parent.parent.name)
               for item in candidates)
    high.extend(dict(seed=int(item["seed"]), pmax=item["pmax"], source=path.parent.parent.name)
                for item in candidates if item["pmax"] >= NEAR_BAR)
    total_candidates += len(candidates)
    rows.append({
        "start": start, "end": end,
        "seeds": agg["seeds_done"], "candidates": len(candidates),
        "best_seed": agg["best_word"], "best_pmax": agg["best_pmax"],
        "claim_hits": len(observed_hits), "artifact": path.parent.parent.name,
    })

rows.sort(key=lambda item: item["start"])
for begin, finish in EXPECTED:
    interval_rows = [r for r in rows if begin <= r["start"] < finish]
    at = begin
    for r in interval_rows:
        assert r["start"] == at and r["end"] <= finish, (begin, finish, at, r)
        at = r["end"]
    assert at == finish, (begin, finish, at)
assert len({r["start"] for r in rows}) == 78
assert sum(r["seeds"] for r in rows) == 1904304414

high.sort(key=lambda item: item["pmax"], reverse=True)
top.sort(key=lambda item: item["pmax"], reverse=True)
cutoffs = [5.0, 5.5, 6.0, 6.5, 7.0, 7.25, 7.5, 7.5341931878728095, CLAIM_BAR]
score_tail_counts = {str(t): sum(item["pmax"] >= t for item in top) for t in cutoffs}
report = {
    "upstream": "Dukotah/cicada3301@f63501d8f2d835b80c30230eb89a1110fb9197d2",
    "instrument": "Py2.7 MT32 random29 exact keyskip1, sign -1, offset 0, panel-R36 L120 beam64",
    "claim_bar_legacy9register": CLAIM_BAR,
    "near_bar_legacy9register": NEAR_BAR,
    "artifacts": len(rows),
    "new_complete_seeds": sum(r["seeds"] for r in rows),
    "screen_candidates": total_candidates,
    "claim_hits": sum(item["pmax"] >= CLAIM_BAR for item in high),
    "near_misses": high,
    "top_candidates": top[:128],
    "score_tail_counts": score_tail_counts,
    "best": top[:1],
    "shards": rows,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
with open(str(OUT) + ".lock", "w", encoding="utf-8") as lock:
    fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
    temp = OUT.with_name(OUT.name + ".tmp")
    with open(temp, "w", encoding="utf-8") as target:
        json.dump(report, target, indent=2)
        target.write("\n")
        target.flush()
        os.fsync(target.fileno())
    os.replace(temp, OUT)
    fcntl.flock(lock.fileno(), fcntl.LOCK_UN)
print("AGGREGATE " + json.dumps({
    "shards": len(rows), "new_complete_seeds": report["new_complete_seeds"],
    "screen_candidates": total_candidates, "claim_hits": report["claim_hits"],
    "near_misses": high[:100], "top_candidates": top[:16],
    "score_tail_counts": score_tail_counts, "best_pmax": top[0]["pmax"],
}, separators=(",", ":")))
