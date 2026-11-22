#!/usr/bin/env python3
"""Strict result reduction for Issue #1329's 216 original LP2 direction shards.

Requires both completed full two-window stage-1 matrix runs, as separately
downloaded by the manual reduction workflow. Missing shards are an error.
Does not call any plaintext-looking pattern a decipherment.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import json
import os
from pathlib import Path
import re
import statistics
from tempfile import NamedTemporaryFile
from filelock import FileLock

SIX = ("000", "100", "020", "120", "010", "110")
REMAINING = ("001", "002", "011", "012", "021", "022", "101", "102", "111", "112", "121", "122")
MATCHED_NULL = {"000", "001", "002"}
THRESHOLD = 1.4
SHARDS = 12
EXPECTED_REAL_VECTORS = 132


def score_file(file: Path, convention: str) -> float:
    lines = file.read_text(encoding="utf-8", errors="replace").splitlines()
    if not lines or f"pdir={convention}" not in lines[0]:
        raise ValueError(f"Missing actual pdir engine option in {file}")
    vals = [float(m.group(1)) for line in lines
            if (m := re.match(r"# best ([0-9]+(?:\.[0-9]+)?)", line))]
    if not vals:
        raise ValueError(f"Missing score in {file}")
    return max(vals)


def per_convention(root: Path, name: str, conv: str) -> dict:
    results = defaultdict(list)
    seen = defaultdict(set)
    for shard in range(SHARDS):
        folder = root / f"{name}-{conv}-{shard}"
        if not folder.is_dir():
            raise FileNotFoundError(f"Incomplete result: missing artifact {folder}")
        tsvs = list(folder.rglob("*.tsv"))
        if not tsvs:
            raise ValueError(f"Artifact lacks original screen results: {folder}")
        for file in tsvs:
            role = next((r for r in ("real", "null") if r in file.parts), None)
            if role is None:
                continue
            if file.name in seen[role]:
                raise ValueError(f"Duplicated rule-orientation vector {conv} {role} {file.name}")
            seen[role].add(file.name)
            results[role].append((score_file(file, conv), file.name,
                                  str(file.relative_to(root)).replace("\\", "/")))
    if len(results["real"]) != EXPECTED_REAL_VECTORS:
        raise ValueError(f"{conv}: {len(results['real'])} original vectors, expected 132")
    nnull = EXPECTED_REAL_VECTORS if conv in MATCHED_NULL else 0
    if len(results["null"]) != nnull:
        raise ValueError(f"{conv}: {len(results['null'])} null vectors, expected {nnull}")

    def stats(items: list[tuple[float, str, str]]) -> dict:
        if not items:
            return {"vectors": 0}
        ranked = sorted(items, reverse=True)
        scores = [v[0] for v in ranked]
        return {
            "vectors": len(items), "best_ioc": ranked[0][0],
            "best_vector": ranked[0][1],
            "median_vector_max_ioc": round(statistics.median(scores), 6),
            "candidates_at_least_1_40": sum(v >= THRESHOLD for v in scores),
            "count_at_least_1_30": sum(v >= 1.30 for v in scores),
            "top_10": [
                {"ioc": v, "vector": name, "file": file}
                for v, name, file in ranked[:10]
            ],
        }

    return {
        "convention": conv, "original": stats(results["real"]),
        "matched_random": stats(results["null"]),
        "candidate_files": [
            {"ioc": v, "vector": name, "file": file}
            for v, name, file in sorted(results["real"], reverse=True)
            if v >= THRESHOLD
        ]
    }


def atomic_locked(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                prefix=path.name + ".tmp.", delete=False) as f:
            f.write(content)
            temp_name = f.name
        os.replace(temp_name, path)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--six", type=Path, required=True)
    p.add_argument("--remaining", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    a = p.parse_args()
    table = (
        [per_convention(a.six, "pdir-stage1", conv) for conv in SIX]
        + [per_convention(a.remaining, "pdir-stage1-remaining", conv)
           for conv in REMAINING]
    )
    candidates = [
        {"convention": row["convention"], **candidate}
        for row in table for candidate in row["candidate_files"]
    ]
    original_counts = sum(row["original"]["vectors"] for row in table)
    null_counts = sum(row["matched_random"]["vectors"] for row in table)
    assert len(table) == 18 and original_counts == 2376 and null_counts == 396
    out = {
        "task": "Director Issue #1329",
        "status": "complete original two-window stage1, preliminary candidate screen",
        "ciphertext": "LP2 physical pages 0–55, 12956 runes; source-exact segments 0.7 and 0.8",
        "external_engine_commit": "15200c67abee106913ba01ff504c5b6e88d16cc7",
        "original_run_id_six": 44006868510,
        "original_run_id_remaining": 44007390480,
        "original_vector_count": original_counts,
        "matched_random_vector_count": null_counts,
        "key_streams_per_vector": 581,
        "full_18_convention_coverage": True,
        "heldout_verified_plaintext": False,
        "candidate_threshold_ioc": THRESHOLD,
        "candidate_count": len(candidates),
        "candidates": candidates,
        "per_convention": table,
        "limitation": "Only two of eight >=100-rune LP2 segments; fixed library, fixed model and 300-rune preliminary scores. A score above threshold is not a decryption.",
    }
    atomic_locked(a.out / "lp2-pdir-original-stage1.json", json.dumps(out, indent=2) + "\n")
    lines = [
        "# Original LP2 pointer-direction 18-convention, 581-key stage1",
        "",
        "Original source: 12,956 unknown GP29 runes. This test covers the first "
        "300 runes of each of segments 0.7 and 0.8, **not** the entire book. "
        "Both incoming matrix runs must be fully completed; missing or "
        "duplicate shard results cause an error.",
        "",
        f"Source-exact original screen: **{original_counts}** rule/orientation/convention vectors "
        f"with 581 key streams each. Matched random controls: **{null_counts}** vectors.",
        "",
        "| Pointer convention | Best original IoC | Best original vector | "
        "Original hits >=1.40 | Matched random best |",
        "|---|---:|---|---:|---:|",
    ]
    for row in table:
        real = row["original"]
        null = row["matched_random"]
        null_str = f'{null["best_ioc"]:.4f}' if null["vectors"] else "not screened"
        lines.append(
            f'| {row["convention"]} | {real["best_ioc"]:.4f} | '
            f'{real["best_vector"]} | {real["candidates_at_least_1_40"]} | '
            f"{null_str} |"
        )
    lines += [
        "",
        f"**Original threshold candidates: {len(candidates)}.**",
        "",
        "Each candidate requires independent full-window original forward verification, "
        "20 same-key random-offset controls, coherent text and a separate original "
        "section before it can be considered actual plaintext.",
        "",
        "Original execution: [six conventions](https://github.com/FlareZ123/liber-primus/actions/runs/44006868510), "
        "[other twelve](https://github.com/FlareZ123/liber-primus/actions/runs/44007390480). "
        "Pinned external specification: pnotisdev/cicada3301 at commit 15200c67. "
        "The 2016 message does not independently identify a key, convention or model.",
        "",
    ]
    atomic_locked(a.out / "lp2-pdir-original-stage1.md", "\n".join(lines))
    print(json.dumps({
        "status": "COMPLETE", "original_vectors": original_counts,
        "matched_null_vectors": null_counts, "candidate_count": len(candidates),
        "top_original": sorted([
            (r["original"]["best_ioc"], r["convention"], r["original"]["best_vector"])
            for r in table], reverse=True)[:8],
    }, indent=2))


if __name__ == "__main__":
    main()
