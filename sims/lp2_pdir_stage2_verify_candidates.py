#!/usr/bin/env python3
"""Exact whole-window re-decode of the frozen six-section #1329 screen hits.

Consume only the registered original Stage2 reducer and its exact matching
original TSV artifacts. The independent historical pdir Rust engine performs
whole-window inversion with 20 same-keystream random-offset controls. No
search hyperparameters, rules, keys or offsets are selected here.
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

from lp2_pdir_stage1_reduce import (
    REMAINING,
    SIX,
    THRESHOLD,
    atomic_locked,
    score_file,
)

PIN = "15200c67abee106913ba01ff504c5b6e88d16cc7"
RUN_ID = 44075903575
WINDOWS = "seg0.9,seg0.11,seg0.12,seg0.13,seg0.14,seg0.15"
CONVENTIONS = set(SIX) | set(REMAINING)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--artifacts", type=Path, required=True)
    parser.add_argument("--external", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    assert manifest["external_engine_commit"] == PIN
    assert manifest["six_section_run"] == RUN_ID
    assert manifest["original_vectors"] == 2376
    assert manifest["matched_random_vectors"] == 396
    assert manifest["streams_per_vector"] == 581
    assert manifest["candidate_threshold_300runes"] == THRESHOLD
    candidates = manifest["screen_candidates"]
    assert len(candidates) == manifest["screen_candidate_count"] > 0

    external = args.external.resolve()
    work = external / "work" / "kscreen"
    executable = work / "target" / "release" / (
        "kscreen.exe" if os.name == "nt" else "kscreen"
    )
    assert executable.is_file()
    assert (work / "pdir_verify.py").is_file()
    assert (work / "pdir_pilot.py").is_file()
    sys.path.insert(0, str(work))
    import pdir_pilot

    tag = "issue1329-sixsection-autoverify"
    copied: dict[tuple[str, str], dict] = {}
    rules: set[str] = set()
    for candidate in candidates:
        conv = candidate["convention"]
        assert conv in CONVENTIONS
        rel = Path(candidate["file"])
        artifact = rel.parts[0]
        assert re.fullmatch(r"pdir-sixsections-[0-2]{3}-(?:[0-9]|1[01])", artifact)
        assert artifact.startswith("pdir-sixsections-" + conv + "-")
        assert rel.suffix == ".tsv" and "real" in rel.parts
        assert not rel.is_absolute() and ".." not in rel.parts
        assert rel.name == candidate["vector"]
        source = args.artifacts / rel
        assert source.is_file(), ("Missing exact screen candidate", source)
        assert abs(score_file(source, conv) - float(candidate["ioc"])) < 1e-8

        stem = rel.stem
        rule, orientation = stem.rsplit("_", 1)
        assert orientation in {"fwd", "rev"}
        key = (conv, rel.name)
        assert key not in copied, ("Duplicated candidate", key)
        rules.add(rule)

        target = external / "results" / "kscreen" / "pdir" / tag / conv / "real" / rel.name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        copied[key] = {
            "relative_source": rel.as_posix(),
            "source": source,
            "target": target,
            "rule": rule,
        }

    # Exact source windows are recreated from pinned original-run data.
    # The reference's Stage2 TSV header retains the original relative window
    # file, but the subprocess verifier needs an absolute path on Windows.
    paths = {}
    for rule in sorted(rules):
        generated = pdir_pilot.window_file(rule, WINDOWS)
        path = (work / generated).resolve()
        assert path.is_file()
        paths[rule] = path

    for (conv, _), item in sorted(copied.items()):
        target = item["target"]
        raw = target.read_text(encoding="utf-8")
        old = "windows=data/dirs_" + WINDOWS.replace(",", "_") + "/" + item["rule"] + ".txt"
        assert raw.splitlines()[0].count(old) == 1, ("Unexpected source TSV", target)
        absolute = paths[item["rule"]].as_posix()
        assert not any(ch.isspace() for ch in absolute)
        atomic_locked(target, raw.replace(old, "windows=" + absolute, 1))
        assert abs(score_file(target, conv) - score_file(item["source"], conv)) < 1e-8

    reports = []
    for conv in sorted({key[0] for key in copied}):
        env = dict(os.environ, KSCREEN_BIN=str(executable.resolve()))
        subprocess.run(
            [sys.executable, str(work / "pdir_verify.py"), "--conv", conv, "--tag", tag],
            cwd=external, env=env, check=True,
        )
        base = external / "results" / "kscreen" / "pdir" / tag / conv
        summary = (base / "verify_summary.txt").read_text(encoding="utf-8")
        assert "verify failed" not in summary, ("Reference verifier failed", conv, summary)
        for (c, filename), item in sorted(copied.items()):
            if c != conv:
                continue
            report_path = base / "verify" / (Path(filename).stem + ".txt")
            report = report_path.read_text(encoding="utf-8")
            match = re.search(r"(\d+) of (\d+) re-decoded hits keep IoC >= 1\.4", report)
            assert match and int(match.group(2)) > 0, (
                "Missing full-window original decode", item["relative_source"], report,
            )
            assert "verify failed" not in report
            reports.append({
                "convention": conv,
                "original_tsv": item["relative_source"],
                "original_first300_ioc": score_file(item["source"], conv),
                "full_window_survivors": int(match.group(1)),
                "registered_candidate_count": int(match.group(2)),
                "complete_readout": report,
            })

    assert len(reports) == len(candidates)
    total = sum(item["full_window_survivors"] for item in reports)
    result = {
        "task": "Director Issue #1329 frozen original six-section verifier",
        "six_section_run": RUN_ID,
        "original_engine_commit": PIN,
        "original_screen_vectors": 2376,
        "matched_random_vectors": 396,
        "original_candidate_tsv_count": len(reports),
        "whole_window_survivors": total,
        "plaintext_status": (
            "Statistical candidates only; require coherent untouched original "
            "GP29 text, forward reconstruction and independent holdout"
            if total else
            "All source-registered first300 candidates reject on complete "
            "original windows with same-keystream offset controls"
        ),
        "reports": reports,
    }
    args.out.mkdir(parents=True, exist_ok=True)
    atomic_locked(
        args.out / "lp2-pdir-original-sixsection-whole-window.json",
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
    )
    lines = [
        "# Frozen original LP2 six-section pdir verification",
        "",
        f"Source-only first-300 threshold-hitting vectors: **{len(reports)}**.",
        f"Survivors above 1.40 full-window IoC and 20-offset null max +0.15: **{total}**.",
        "",
        "Every candidate below is decoded by the fixed historical reference engine; "
        "complete readouts and null controls are in the JSON. A high score is not plaintext.",
        "",
    ]
    for report in reports:
        lines.append(
            f"- `{report['convention']}/{Path(report['original_tsv']).name}`: "
            f"{report['original_first300_ioc']:.4f} first300; "
            f"{report['full_window_survivors']}/{report['registered_candidate_count']} "
            "full-window survivors."
        )
    atomic_locked(
        args.out / "lp2-pdir-original-sixsection-whole-window.md",
        "\n".join(lines) + "\n",
    )
    print(json.dumps({
        "source_vectors_verified": len(reports),
        "whole_window_survivors": total,
    }, indent=2), flush=True)


if __name__ == "__main__":
    main()
