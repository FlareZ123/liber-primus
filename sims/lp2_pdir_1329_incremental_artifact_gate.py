#!/usr/bin/env python3
"""SFT: inspect completed GitHub Actions #1329 pdir shard ZIPs incrementally.

Windows 11 / Python 3.11+; only the standard library is required.
Uses the *original* archived screen scores, never reruns a cipher search.
The result is a partial-coverage audit until all 216 shards succeed.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile

ARTIFACT = re.compile(r"^pdir-sixsections-(\d{3})-(\d{1,2})\.zip$")
SCORE = re.compile(r"^# best ([0-9]+(?:\.[0-9]+)?)$")
SUMMARY = re.compile(r"^real: (\d+) vectors, best IoC ([0-9]+(?:\.[0-9]+)?)")
PARTS = tuple(f"{h}{m}{c}" for h in range(2) for m in range(3) for c in range(3))
EXPECTED = {(conv, shard) for conv in PARTS for shard in range(12)}


def scan(directory: Path) -> dict:
    """Require original shard identity, complete real TSVs and score consistency."""
    results: list[dict] = []
    seen: set[tuple[str, int]] = set()
    for path in sorted(directory.glob("pdir-sixsections-*.zip")):
        match = ARTIFACT.fullmatch(path.name)
        if match is None:
            raise ValueError(f"Unexpected artifact filename: {path.name}")
        conv, shard = match.group(1), int(match.group(2))
        pair = (conv, shard)
        if pair not in EXPECTED or pair in seen:
            raise ValueError(f"Invalid or duplicated campaign slot {pair}: {path}")
        seen.add(pair)
        with ZipFile(path) as source:
            names = source.namelist()
            summaries = [n for n in names
                         if n.endswith("/summary_real.txt") or
                         n.endswith("/summary_real_null.txt")]
            if len(summaries) != 1:
                raise ValueError(f"{path}: expected one original summary, got {summaries}")
            summary = source.read(summaries[0]).decode("utf-8")
            lines = summary.splitlines()
            if not lines or f"conv {conv}:" not in lines[0]:
                raise ValueError(f"{path}: convention mismatch")
            if "seg0.9,seg0.11,seg0.12,seg0.13,seg0.14,seg0.15" not in lines[0]:
                raise ValueError(f"{path}: wrong original source windows")
            total = SUMMARY.match(lines[1])
            if total is None:
                raise ValueError(f"{path}: missing original-model summary")
            expected_vectors = int(total.group(1))
            listed_max = float(total.group(2))
            real_files = [n for n in names if "/real/" in n and n.endswith(".tsv")]
            if len(real_files) != expected_vectors:
                raise ValueError(f"{path}: {len(real_files)} real TSVs versus {expected_vectors}")
            values = []
            top = None
            for entry in real_files:
                data = source.read(entry).decode("utf-8")
                bests = [float(m.group(1)) for line in data.splitlines()
                         if (m := SCORE.match(line))]
                if len(bests) != 1:
                    raise ValueError(f"{path}:{entry}: expected one # best")
                score = bests[0]
                values.append(score)
                if top is None or score > top["score"]:
                    top = {"score": score, "rule": Path(entry).name}
            if not values or abs(max(values) - listed_max) > 0.00001:
                raise ValueError(f"{path}: original score mismatches summary")
            results.append({
                "conv": conv, "shard": shard,
                "real_vectors": len(real_files),
                "best_original_IoC": top["score"],
                "best_rule_file": top["rule"],
                "real_threshold_hits": sum(value >= 1.4 for value in values),
                "full_581_key_matched_null": "null 581 random keystreams" in lines[0],
                "zip": path.name,
            })
    missing = sorted(EXPECTED - seen)
    return {
        "original_windows": ["seg0.9", "seg0.11", "seg0.12", "seg0.13", "seg0.14", "seg0.15"],
        "required_shards": len(EXPECTED),
        "downloaded_completed_shards": len(results),
        "pending_or_missing_slots": len(missing),
        "vectors_tested": sum(x["real_vectors"] for x in results),
        "original_first300_IoC_threshold": 1.4,
        "original_threshold_hits_so_far": sum(x["real_threshold_hits"] for x in results),
        "highest_observed_IoC": max((x["best_original_IoC"] for x in results), default=None),
        "top_completed_shards": sorted(results, key=lambda x: -x["best_original_IoC"])[:15],
        "full_matched_null_shards": sum(x["full_581_key_matched_null"] for x in results),
        "other_six_key_null_shards": sum(not x["full_581_key_matched_null"] for x in results),
        "missing_slots": [{"conv": conv, "shard": shard} for conv, shard in missing],
        "scope": "incomplete original-source screen; no whole-family negative until 216 successful jobs",
        "recovered_original_unknown_plaintext": False,
    }


def main() -> None:
    directory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    print(json.dumps(scan(directory), indent=2))


if __name__ == "__main__":
    main()
