#!/usr/bin/env python3
"""Canonical GP29 source gate and shard runner for Director Issue #1329.

External specification is pinned in the accompanying manual GitHub workflow.
The screen itself uses the independent reference implementation; this script
only gates its exact original inputs, selects disjoint shards and reads scores.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import sys

CONVS = {f"{h}{m}{c}" for h in range(2) for m in range(3) for c in range(3)}


def source_gate(local: Path, ext: Path) -> list[str]:
    sys.path.insert(0, str(ext / "work"))
    import lp
    import stats

    corpus = json.loads((local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    assert [r for r, _, _ in lp.GP] == corpus["runes"]
    assert [p for _, _, p in lp.GP] == corpus["prime"]
    original = [x for page in corpus["pages"] if 0 <= page["page"] <= 55
                for x in (page.get("indices") or [])]
    external = stats.stream()
    assert len(original) == len(external) == 12956
    mismatches = [(i, x, y) for i, (x, y) in enumerate(zip(original, external)) if x != y]
    assert not mismatches, f"Original ciphertext mismatch (first 8): {mismatches[:8]}"

    # Validate each printed word boundary against the local original transcript.
    # The external nine section cuts differ from the local eight chapter cuts,
    # even though their 2,896 physical printed word intervals agree exactly.
    local_words = []
    rune_set = set(corpus["runes"])
    at, start = 0, None
    for character in (local / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8"):
        if at == 12956:
            break
        if character in rune_set:
            if start is None:
                start = at
            at += 1
        elif character not in ("/", "\\n", "\\r", "%") and start is not None:
            local_words.append((start, at))
            start = None
    if start is not None:
        local_words.append((start, at))
    assert at == 12956 and len(local_words) == 2896, (at, len(local_words))
    section_starts = {}
    offset = 0
    for section_id in stats.UNSOLVED:
        section_starts[f"seg0.{section_id}"] = offset
        offset += len(lp.runes_of(stats.SEGS[section_id]))
    assert offset == 12956
    assert sum(len(lp.word_spans(stats.SEGS[i], lp.runes_of(stats.SEGS[i])))
               for i in stats.UNSOLVED) == 2896

    d = ext / "work/kscreen/data"
    windows = {}
    name = ""
    for line in (d / "segments.txt").read_text(encoding="utf-8").splitlines():
        if line.startswith("W "):
            name = line.split()[1]
            windows[name] = [[], []]
        elif line.startswith("R "):
            windows[name][0].extend(map(int, line[2:].split()))
        elif line.startswith("L "):
            windows[name][1].extend(map(int, line[2:].split()))
    assert len(windows) == 8, sorted(windows)
    for name, (runes, lens) in windows.items():
        seg = int(name.split(".")[1])
        assert runes == lp.runes_of(stats.SEGS[seg])
        assert sum(lens) == len(runes) and len(runes) >= 100
        begin = section_starts[name]
        expected = [b - a for a, b in local_words
                    if a >= begin and b <= begin + len(runes)]
        assert lens == expected, (name, "canonical word lengths diverged", lens[:15], expected[:15])

    rules = (ext / "work/kscreen/dir_rules.txt").read_text(encoding="utf-8").splitlines()
    assert len(rules) == len(set(rules)) == 66
    with (d / "library_flat.ksb").open("rb") as f:
        header = f.read(8)
    assert header[:4] == b"KSB1"
    stream_count = struct.unpack("<I", header[4:])[0]
    assert stream_count == 581, stream_count
    print(json.dumps({
        "gate": "PASS", "unknown_cipher_runes": 12956,
        "identical_to_local_original": True,
        "cipher_sha256": hashlib.sha256(bytes(original)).hexdigest(),
        "windows": {n: len(v[0]) for n, v in windows.items()},
        "rules": len(rules), "orientations": 132,
        "conventions": len(CONVS), "flat_streams": stream_count, "original_word_intervals": len(local_words),
        "screened_window_runes": sum(len(v[0]) for v in windows.values()),
        "excluded_short_source_segments": {f"seg0.{i}": len(lp.runes_of(stats.SEGS[i]))
                                          for i in stats.UNSOLVED
                                          if len(lp.runes_of(stats.SEGS[i])) < 100},
    }, indent=2), flush=True)
    return rules


def run_campaign(local: Path, ext: Path, a: argparse.Namespace, rules: list[str]) -> None:
    assert a.conv in CONVS
    assert a.shards >= 1 and 0 <= a.shard < a.shards
    selected = [x for i, x in enumerate(rules) if i % a.shards == a.shard]
    assert selected
    work = ext / "work/kscreen"
    engine = work / "target/release" / ("kscreen.exe" if os.name == "nt" else "kscreen")
    assert engine.is_file(), engine
    env = dict(os.environ, KSCREEN_BIN=str(engine))
    cmd = [sys.executable, str(work / "pdir_pilot.py"), "--conv", a.conv,
           "--rules", ",".join(selected), "--windows", a.windows,
           "--streams", a.streams, "--null", str(a.null), "--threads", str(a.threads),
           "--tag", a.tag, "--parts", a.parts, "--pad", "300"]
    print(f"Original LP2 screen: {len(selected)} rules, {2*len(selected)} directions, "
          f"convention={a.conv}, shard={a.shard}/{a.shards}", flush=True)
    subprocess.run(cmd, check=True, cwd=local, env=env)
    base = ext / "results/kscreen/pdir" / a.tag / a.conv
    ranked = []
    for part in a.parts.split(","):
        files = sorted((base / part).glob("*.tsv"))
        assert len(files) == 2 * len(selected), (part, len(files))
        for file in files:
            lines = file.read_text(encoding="utf-8", errors="replace").splitlines()
            assert lines and f"pdir={a.conv}" in lines[0], file
            vals = [float(m.group(1)) for line in lines
                    if (m := re.match(r"# best ([0-9.]+)", line))]
            assert vals, file
            ranked.append((part, max(vals), file.name))
    print("Top 12: ", sorted(ranked, key=lambda v: -v[1])[:12], flush=True)
    candidates = [x for x in ranked if x[0] == "real" and x[1] >= 1.40]
    if candidates:
        print("Candidate above 1.40: ", candidates, flush=True)
        subprocess.run([sys.executable, str(work / "pdir_verify.py"),
                        "--conv", a.conv, "--tag", a.tag],
                       check=True, cwd=local, env=env)
    else:
        print("No original score >= 1.40 in this shard", flush=True)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("external", type=Path)
    p.add_argument("--campaign", action="store_true")
    p.add_argument("--conv", default="000")
    p.add_argument("--shard", type=int, default=0)
    p.add_argument("--shards", type=int, default=1)
    p.add_argument("--streams", default="6")
    p.add_argument("--windows", default="seg0.7,seg0.8")
    p.add_argument("--null", type=int, default=6)
    p.add_argument("--threads", type=int, default=4)
    p.add_argument("--parts", choices=("real", "null", "real,null"), default="real,null")
    p.add_argument("--tag", default="issue1329-pilot")
    a = p.parse_args()
    local = Path(__file__).resolve().parent.parent
    ext = a.external.resolve()
    rules = source_gate(local, ext)
    if a.campaign:
        run_campaign(local, ext, a, rules)


if __name__ == "__main__":
    main()
