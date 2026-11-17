#!/usr/bin/env python3
"""Re-decode only original LP2 direction hits frozen by the complete #1329 reducer.

Source selection is manifest-driven and immutable. No new word/clock rule,
key, offset, or first-300-rune candidate is chosen here. Requires the
independent original pdir Rust engine and exactly the original 216 shards.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from tempfile import NamedTemporaryFile

from filelock import FileLock
from lp2_pdir_stage1_reduce import score_file

PIN = "15200c67abee106913ba01ff504c5b6e88d16cc7"
SIX = {"000", "100", "020", "120", "010", "110"}
REMAINING = {"001", "002", "011", "012", "021", "022",
             "101", "102", "111", "112", "121", "122"}


def locked_write(path: Path, data: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with NamedTemporaryFile("w", dir=path.parent, prefix=path.name + ".tmp.",
                                encoding="utf-8", delete=False) as file:
            file.write(data)
            temp = Path(file.name)
        os.replace(temp, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--six", type=Path, required=True)
    parser.add_argument("--remaining", type=Path, required=True)
    parser.add_argument("--external", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    record = json.loads(args.manifest.read_text(encoding="utf-8"))
    assert record["external_engine_commit"] == PIN
    assert record["original_run_id_six"] == 44006868510
    assert record["original_run_id_remaining"] == 44007390480
    assert record["full_18_convention_coverage"] is True
    assert record["original_vector_count"] == 2376
    assert record["matched_random_vector_count"] == 396
    assert record["candidate_threshold_ioc"] == 1.4
    candidates = record["candidates"]
    assert len(candidates) == record["candidate_count"] > 0

    work = args.external / "work" / "kscreen"
    assert (work / "pdir_verify.py").is_file()
    assert (work / "verify.py").is_file()
    executable = work / "target" / "release" / ("kscreen.exe" if os.name == "nt" else "kscreen")
    assert executable.is_file()
    tag = "issue1329-autoverify"
    assembled = {}
    for entry in candidates:
        conv = entry["convention"]
        root = args.six if conv in SIX else args.remaining
        assert conv in SIX | REMAINING
        rel = Path(entry["file"])
        assert "real" in rel.parts and rel.suffix == ".tsv" and ".." not in rel.parts
        assert rel.parts[0].startswith("pdir-stage1-")
        source = root / rel
        assert source.is_file(), ("Missing exact original candidate TSV", source)
        assert abs(score_file(source, conv) - float(entry["ioc"])) < 1e-8
        assert rel.name == entry["vector"]
        target = args.external / "results" / "kscreen" / "pdir" / tag / conv / "real" / rel.name
        target.parent.mkdir(parents=True, exist_ok=True)
        assert (conv, rel.name) not in assembled, ("Duplicate source vector", conv, rel.name)
        shutil.copyfile(source, target)
        assembled[(conv, rel.name)] = str(rel).replace("\\", "/")

    reports = []
    for conv in sorted({c for c, _ in assembled}):
        env = dict(os.environ, KSCREEN_BIN=str(executable.resolve()))
        subprocess.run([sys.executable, str(work / "pdir_verify.py"),
                        "--conv", conv, "--tag", tag],
                       cwd=args.external, env=env, check=True)
        base = args.external / "results" / "kscreen" / "pdir" / tag / conv
        summary = (base / "verify_summary.txt").read_text(encoding="utf-8")
        assert "verify failed" not in summary
        for (c, filename), source in sorted(assembled.items()):
            if c != conv:
                continue
            report = (base / "verify" / (Path(filename).stem + ".txt")).read_text(encoding="utf-8")
            m = re.search(r"(\d+) of (\d+) re-decoded hits keep IoC >= 1\.4", report)
            assert m and int(m.group(2)) > 0, ("Missing full-window reading", source)
            assert "verify failed" not in report
            reports.append({
                "convention": conv,
                "original_tsv": source,
                "original_first300_ioc": score_file(base / "real" / filename, conv),
                "full_window_survivors": int(m.group(1)),
                "registered_candidate_count": int(m.group(2)),
                "complete_readout": report,
            })

    total = sum(r["full_window_survivors"] for r in reports)
    out = {
        "source": "Original #1329 18-convention stage1 reducer, pinned independent original",
        "original_run_ids": [44006868510, 44007390480],
        "source_engine_commit": PIN,
        "source_tsv_count": len(reports),
        "full_window_survivor_count": total,
        "claim": ("CANDIDATE ONLY; requires coherent original GP29 plaintext, exact inverse, "
                  "and untouched chapter test" if total else "No source-registered stage1 "
                  "IoC>=1.40 near-hit survives entire registered original section and controls"),
        "reports": reports,
    }
    args.out.mkdir(parents=True, exist_ok=True)
    locked_write(args.out / "lp2-pdir-original-whole-window-verified.json",
                 json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    lines = [
        "# Frozen original LP2 pdir candidate full-window inverse",
        "",
        f"Exact original threshold-hitting source vectors: **{len(reports)}**.",
        f"Whole-window candidate readings above 1.40 and their own 20-offset-control "
        f"max +0.15: **{total}**.",
        "",
        "A surviving statistical candidate is NOT an authentic decrypt. Read the complete "
        "attached original key, offset, sign, GP29 stream, plaintext and random-offset controls, "
        "then demand >=150 coherent runes and an independent original-section prediction.",
        "",
    ]
    for r in reports:
        lines.append(f"- `{r['convention']}/{Path(r['original_tsv']).name}`: "
                     f"{r['original_first300_ioc']:.4f} first300; "
                     f"{r['full_window_survivors']}/{r['registered_candidate_count']} "
                     f"whole-window candidates.")
    locked_write(args.out / "lp2-pdir-original-whole-window-verified.md", "\n".join(lines) + "\n")
    print(json.dumps({"original_vectors_checked": len(reports),
                      "whole_window_survivors": total}, indent=2), flush=True)


if __name__ == "__main__":
    main()
