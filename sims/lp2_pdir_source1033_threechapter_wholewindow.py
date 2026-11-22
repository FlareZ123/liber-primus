#!/usr/bin/env python3
"""Source-registered three-chapter 1033 historical-key full original decoder.

Use only the existing completed original #1329 six-section TSVs. A separately
frozen cross-rule selector identified 'sha256-ctr reject :1033' with repeated
top50 first300 scores in three source chapters. Decode the original complete
chapters with the pinned independent Rust engine and 20 same-key wrong offsets.
No reranking, new cipher search, or key expansion is permitted.

Windows 11 / Python 3.12; artifacts and the output report are preserved.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from filelock import FileLock

from lp2_pdir_crossrule_historical_key_sft import aggregate
from lp2_pdir_sixsection_key_recurrence_sft import load_rows

SOURCE_RUN = 44075903575
PIN = "15200c67abee106913ba01ff504c5b6e88d16cc7"
KEY = "sha256-ctr reject :1033"
CONVENTION = "000"
WINDOWS = "seg0.9,seg0.11,seg0.12,seg0.13,seg0.14,seg0.15"
TARGETS = {"seg0.13": 1.3637, "seg0.15": 1.3553, "seg0.11": 1.3475}
TAG = "issue1329-source1033-threechapters"


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", suffix=".tmp", delete=False
        ) as f:
            temp_path = Path(f.name)
            f.write(content)
        os.replace(temp_path, path)


def exact_best(root: Path) -> list[dict]:
    """Pick the highest ORIGINAL first300 score for each preselected chapter."""
    aggregate(root, CONVENTION)  # independently gate all original/581-matched-null files
    selected = {}
    for shard in range(12):
        folder = root / f"pdir-sixsections-{CONVENTION}-{shard}"
        for source in folder.rglob("real/*.tsv"):
            for row in load_rows(source):
                if row["item"] != KEY or row["window"] not in TARGETS:
                    continue
                prior = selected.get(row["window"])
                if prior is None or row["ioc"] > prior["record"]["ioc"]:
                    selected[row["window"]] = {
                        "source": source,
                        "record": row,
                    }
    if set(selected) != set(TARGETS):
        raise ValueError(f"Missing source-registered historical stream windows: {list(selected)}")
    for section, score in TARGETS.items():
        if abs(selected[section]["record"]["ioc"] - score) > 0.00001:
            raise ValueError(f"Frozen score changed for {section}: {selected[section]['record']}")
    return [dict(section=section, **selected[section]) for section in TARGETS]


def verify(raw: Path, external: Path, out: Path) -> dict:
    sys.path.insert(0, str(external / "work/kscreen"))
    import pdir_pilot

    engine = external / "work/kscreen/target/release" / (
        "kscreen.exe" if os.name == "nt" else "kscreen"
    )
    verifier = external / "work/kscreen/pdir_verify.py"
    assert engine.is_file() and verifier.is_file(), (engine, verifier)
    base = external / "results/kscreen/pdir" / TAG / CONVENTION / "real"
    candidates = []
    for selected in exact_best(raw):
        section, source, hit = selected["section"], selected["source"], selected["record"]
        stem = source.stem
        rule, orient = stem.rsplit("_", 1)
        if orient not in {"fwd", "rev"}:
            raise ValueError(f"Unknown original pointer orientation {stem}")
        created = pdir_pilot.window_file(rule, WINDOWS)
        window_file = (external / "work/kscreen" / created).resolve()
        if not window_file.is_file():
            raise ValueError(f"Missing original decoded source windows: {window_file}")
        text = source.read_text(encoding="utf-8")
        header = "ioc\titem\toffset\tmult\tmodel\twindow\tn"
        lines = text.split("\n")
        at = lines.index(header)
        original_line = next(
            line for line in lines[at+1:]
            if not line.startswith("#") and line.strip()
            and line.split("\t") == [
                str(hit["ioc"]), hit["item"], str(hit["offset"]),
                hit["mult"], hit["model"], hit["window"], str(hit["n"])
            ]
        )
        old_path = (
            "windows=data/dirs_" + WINDOWS.replace(",", "_") +
            "/" + rule + ".txt"
        )
        reference = "\n".join(lines[:at + 1] + [original_line, ""]) + "\n"
        if reference.count(old_path) != 1:
            raise ValueError(f"Wrong exact original source path in {source}")
        reference = reference.replace(old_path, "windows=" + window_file.as_posix(), 1)
        # All other original metadata, including directional model, is untouched.
        output = base / f"{section.replace('.', '_')}_{stem}.tsv"
        atomic_write(output, reference)
        candidates.append({
            "section": section, "original_source": source.as_posix(),
            "original_tsv_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "candidate_file": output.name,
            "rule": rule, "orientation": orient, "first300_ioc": hit["ioc"],
            "source_stream": hit["item"], "offset": hit["offset"],
            "mult": hit["mult"], "model": hit["model"],
            "runes_screened": hit["n"],
        })

    env = dict(os.environ, KSCREEN_BIN=str(engine.resolve()))
    subprocess.run(
        [sys.executable, str(verifier), "--conv", CONVENTION, "--tag", TAG],
        cwd=external, env=env, check=True,
    )
    result_files = external / "results/kscreen/pdir" / TAG / CONVENTION / "verify"
    for item in candidates:
        report_file = result_files / (Path(item["candidate_file"]).stem + ".txt")
        source = report_file.read_text(encoding="utf-8")
        if "verify failed" in source or "1 re-decoded hits" not in source:
            raise ValueError(f"Missing full-source model decode for {item['section']}: {source[:500]}")
        match = re.search(r"-> ([0-9.]+) over (\d+) runes", source)
        controls = re.search(r"20 random offsets: mean ([0-9.]+), max ([0-9.]+)", source)
        decoded = re.search(r"decoded\s*:\s*(.+)", source)
        if match is None or controls is None or decoded is None:
            raise ValueError(f"Incomplete original null-calibrated output: {source[:700]}")
        item["full_window_ioc"] = float(match.group(1))
        item["full_window_runes"] = int(match.group(2))
        item["wrong_offset_mean"] = float(controls.group(1))
        item["wrong_offset_max"] = float(controls.group(2))
        item["first160_GP_translit"] = decoded.group(1)
        item["full_original_report"] = source
        item["whole_window_solved_gate"] = (
            item["full_window_ioc"] >= 1.4
            and item["full_window_ioc"] >= item["wrong_offset_max"] + 0.15
        )
    result = {
        "task": "Original LP2 historical 1033 stream, three source-registered chapters",
        "screen_run": SOURCE_RUN, "external_commit": PIN,
        "historical_stream": KEY, "convention": CONVENTION,
        "targets": TARGETS,
        "candidate_count": len(candidates),
        "whole_window_IoC_and_offset_gate_survivors": sum(
            item["whole_window_solved_gate"] for item in candidates
        ),
        "scope": "Narrow frozen cross-rule familywise three-section original key lead; not an authenticated key by itself",
        "candidates": candidates,
    }
    out.mkdir(parents=True, exist_ok=True)
    atomic_write(
        out / "lp2-pdir-source1033-threechapter-wholewindow.json",
        json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps({
        "historical_stream": KEY,
        "candidate_count": len(candidates),
        "full_window_survivors": result["whole_window_IoC_and_offset_gate_survivors"],
        "original_sections": [{
            k: it[k] for k in ("section", "rule", "orientation",
                              "first300_ioc", "full_window_ioc",
                              "wrong_offset_max", "first160_GP_translit")
        } for it in candidates],
    }, ensure_ascii=False, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=Path, required=True)
    parser.add_argument("--external", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    verify(args.raw, args.external.resolve(), args.out)
