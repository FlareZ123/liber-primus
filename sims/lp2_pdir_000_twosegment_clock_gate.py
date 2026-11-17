#!/usr/bin/env python3
"""Original LP2 #1329: same-key two-window source-test and no-restart clock bound.

Input is 12 unmodified GitHub Actions pdir-stage1-000-0..11.zip artifacts from
original run 44006868510. No threshold tuning or key fitting.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path
import re
import zipfile


def read_rows(z: zipfile.ZipFile, filename: str) -> list[dict]:
    lines = z.read(filename).decode("utf-8", errors="replace").split("\n")
    assert "ioc\titem\toffset\tmult\tmodel\twindow\tn" in lines
    header_index = lines.index("ioc\titem\toffset\tmult\tmodel\twindow\tn")
    parsed = []
    for line in lines[header_index + 1:]:
        fields = line.split("\t")
        if len(fields) == 7 and re.fullmatch(r"1\.\d+", fields[0]):
            parsed.append({
                "ioc": float(fields[0]), "item": fields[1],
                "offset": int(fields[2]), "mult": fields[3],
                "model": fields[4], "window": fields[5]
            })
    assert len(parsed) == 50, (filename, len(parsed))
    return parsed


def dual_hits(rows: list[dict]) -> list[dict]:
    grouped = defaultdict(dict)
    for row in rows:
        key = (row["item"], row["mult"], row["model"])
        prev = grouped[key].get(row["window"])
        if prev is None or row["ioc"] > prev["ioc"]:
            grouped[key][row["window"]] = row
    result = []
    for key, windows in grouped.items():
        if "seg0.7" not in windows or "seg0.8" not in windows:
            continue
        a, b = windows["seg0.7"], windows["seg0.8"]
        result.append({
            "key": key, "score": min(a["ioc"], b["ioc"]),
            "offsets": (a["offset"], b["offset"]),
            "difference": b["offset"] - a["offset"]
        })
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--artifacts", type=Path, required=True)
    args = p.parse_args()
    rows = {"real": {}, "null": {}}
    for shard in range(12):
        name = args.artifacts / f"pdir-stage1-000-{shard}.zip"
        with zipfile.ZipFile(name) as z:
            for item in z.namelist():
                path = Path(item)
                if path.suffix != ".tsv":
                    continue
                assert len(path.parts) >= 5 and path.parts[2] == "000"
                role = path.parts[3]
                assert role in rows and path.name not in rows[role]
                rows[role][path.name] = read_rows(z, item)
    assert all(len(v) == 132 for v in rows.values()), {
        k: len(v) for k, v in rows.items()
    }

    # Convention 000: no pre-step, no inter-word movement.
    # Every rune consumes 1, 2 or at most 3 signed key positions.
    # Original seg0.7 contains precisely 729 runes; seg0.8 follows it.
    max_unbroken_pointer_displacement = 3 * 729
    for role in ("real", "null"):
        candidates = []
        for vector, hits in rows[role].items():
            for result in dual_hits(hits):
                candidates.append({"vector": vector, **result})
        possible = [r for r in candidates
                    if abs(r["difference"]) <= max_unbroken_pointer_displacement]
        print(role, "registered TSVs", len(rows[role]),
              "two-window top50 same-key triples", len(candidates),
              "unbroken-clock-compatible", len(possible))
        print("all top five", sorted(candidates, key=lambda x: -x["score"])[:5])
        print("top compatible", sorted(possible, key=lambda x: -x["score"])[:5])
        if role == "real":
            assert len(candidates) == 22 and len(possible) == 3
            target = next(r for r in candidates
                          if r["key"] == ("3301 * p_n", "28", "0"))
            assert target["vector"] == "A_prev_f_fwd.tsv"
            assert target["offsets"] == (10754, 15360)
            assert target["score"] == 1.3197
            assert target["difference"] == 4606
            assert abs(target["difference"]) > max_unbroken_pointer_displacement
        else:
            assert len(candidates) == 19 and len(possible) == 3
    print("SOURCE-FIXED DECISION: paired 3301*prime offsets cannot be one"
          " continuous pdir000 clock; independently reset starts remain untested.")


if __name__ == "__main__":
    main()
