#!/usr/bin/env python3
"""Merge three disjoint, original-input #1329 pdir rescue artifacts.

The primary 216-job campaign produces one ZIP per (convention, shard).
If a long job fails before artifact upload, the manual targeted workflow reruns
exactly its original rule set in three shorter parts. This script verifies
disjoint rule identities, unchanged original windows and score summaries,
then reconstructs one complete virtual original-shard ZIP that the strict
incremental reducer can consume. Original TSV bytes remain unchanged.

Usage on Windows 11:
    python sims/lp2_pdir_1329_rescue_merge.py artifact-folder 010 3
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import statistics
import sys
from tempfile import NamedTemporaryFile
from zipfile import ZipFile, ZIP_DEFLATED


SCORE = re.compile(r"^# best ([0-9]+(?:\.[0-9]+)?)$")
HEAD = re.compile(r"^pdir .* conv ([012]{3}): windows ([^,]+(?:,[^,]+)*), streams all of the flat library, null ([0-9]+) random keystreams, pad 300$")
MEASURE = re.compile(r"^real: ([0-9]+) vectors, best IoC ([0-9]+(?:\.[0-9]+)?)")
WINDOWS = "seg0.9,seg0.11,seg0.12,seg0.13,seg0.14,seg0.15"


def require_conv(conv: str) -> None:
    if not re.fullmatch(r"[01][012][012]", conv):
        raise ValueError("Convention must be a valid h/m/c triple")


def merge(directory: Path, conv: str, shard: int) -> Path:
    require_conv(conv)
    if shard not in range(12):
        raise ValueError("Original 12-way shard must be between 0 and 11")
    expected_rules = sum(i % 12 == shard for i in range(66))
    expected_vectors = expected_rules * 2
    output = directory / f"pdir-sixsections-{conv}-{shard}.zip"
    if output.exists():
        raise FileExistsError(f"Original or already-merged artifact exists: {output}")
    provenance = []
    saved = {}
    score_maps = {"real": {}, "null": {}}
    reference_head = None

    for part in range(3):
        path = directory / f"pdir-sixsections-rescue-{conv}-{shard}-part{part}of3.zip"
        original = path.read_bytes()
        with ZipFile(path, "r") as archive:
            entries = archive.namelist()
            summaries = [n for n in entries if n.endswith("/summary_real.txt")
                         or n.endswith("/summary_real_null.txt")]
            if len(summaries) != 1:
                raise ValueError(f"{path.name}: expected exactly one summary")
            lines = archive.read(summaries[0]).decode("utf-8").splitlines()
            if len(lines) < 2:
                raise ValueError(f"{path.name}: incomplete summary")
            first = HEAD.fullmatch(lines[0])
            measure = MEASURE.match(lines[1])
            if first is None or measure is None:
                raise ValueError(f"{path.name}: invalid summary grammar")
            if first.group(1) != conv or first.group(2) != WINDOWS:
                raise ValueError(f"{path.name}: not the six pinned original windows")
            expected_null = 581 if conv in ("000", "001", "002") else 6
            if int(first.group(3)) != expected_null:
                raise ValueError(f"{path.name}: wrong original null count")
            if reference_head is None:
                reference_head = lines[0]
            elif first.group(2) != WINDOWS or first.group(3) != str(expected_null):
                raise ValueError(f"{path.name}: conflicting metadata")
            expected_per_part = sum(i % 3 == part for i in range(expected_rules)) * 2
            measured = int(measure.group(1))
            if measured != expected_per_part:
                raise ValueError(f"{path.name}: {measured} rather than {expected_per_part} original vectors")

            for domain in ("real", "null"):
                matched = [n for n in entries if f"/{domain}/" in n and n.endswith(".tsv")]
                if domain == "real" and len(matched) != measured:
                    raise ValueError(f"{path.name}: incomplete original real TSV set")
                if domain == "null" and expected_null == 581 and len(matched) != measured:
                    raise ValueError(f"{path.name}: incomplete 581-key matched null")
                for entry in matched:
                    basename = Path(entry).name
                    if basename in score_maps[domain]:
                        raise ValueError(f"Duplicate {domain} vector: {basename}")
                    content = archive.read(entry)
                    vals = [float(m.group(1)) for l in content.decode("utf-8").splitlines()
                            if (m := SCORE.match(l))]
                    if len(vals) != 1:
                        raise ValueError(f"{path.name}: invalid per-vector best {entry}")
                    score_maps[domain][basename] = vals[0]
                    target = f"pdir/issue1329-stage2-sixsections/{conv}/{domain}/{basename}"
                    saved[target] = content
            perpartmax = max(
                score_maps["real"][Path(n).name]
                for n in entries if "/real/" in n and n.endswith(".tsv")
            )
            if abs(perpartmax - float(measure.group(2))) > 0.00001:
                raise ValueError(f"{path.name}: real score differs from its original summary")
            provenance.append({
                "part": part,
                "original_filename": path.name,
                "original_sha256": hashlib.sha256(original).hexdigest(),
                "real_vectors": measured,
                "highest_original_real_IoC": perpartmax,
            })

    if len(score_maps["real"]) != expected_vectors:
        raise ValueError(f"Missing original directions: {len(score_maps['real'])} / {expected_vectors}")
    if conv in ("000", "001", "002") and len(score_maps["null"]) != expected_vectors:
        raise ValueError("Missing original full matched null vectors")
    if conv not in ("000", "001", "002") and len(score_maps["null"]) not in (0, expected_vectors):
        raise ValueError("Partially reconstructed limited null vectors")

    orientations = {}
    for base in score_maps["real"]:
        m = re.fullmatch(r"(.+)_(fwd|rev)\.tsv", base)
        if m is None:
            raise ValueError(f"Unrecognized direction: {base}")
        orientations.setdefault(m.group(1), set()).add(m.group(2))
    if len(orientations) != expected_rules or any(v != {"fwd", "rev"} for v in orientations.values()):
        raise ValueError("Missing one original word-direction orientation")

    values = sorted(score_maps["real"].values(), reverse=True)
    best = values[0]
    passing = sum(v >= 1.4 for v in values)
    summary = [
        reference_head.replace("issue1329-targeted-rescue-", "issue1329-stage2-sixsections "),
        f"real: {expected_vectors} vectors, best IoC {best:.4f} (exact 3-part union); "
        f"vectors with best >= 1.30: {sum(v >= 1.30 for v in values)}, "
        f">= 1.35: {sum(v >= 1.35 for v in values)}, >= 1.40: {passing}; "
        f"median of per-vector best {statistics.median(values):.4f}",
        "source: original three-part replay, all raw score TSVs preserved byte-for-byte",
    ]
    target_summary = f"pdir/issue1329-stage2-sixsections/{conv}/summary_real"
    target_summary += "_null.txt" if score_maps["null"] else ".txt"
    saved[target_summary] = ("\n".join(summary) + "\n").encode()
    saved["rescue_manifest.json"] = (json.dumps({
        "schema": 1, "role": "three-part original pdir shard reassembly",
        "convention": conv, "shard": shard,
        "original_directions": sorted(orientations),
        "original_real_vectors": expected_vectors,
        "best_original_real_IoC": best,
        "original_real_threshold_hits": passing,
        "components": provenance
    }, indent=2) + "\n").encode()

    lock_path = Path(str(output) + ".lock")
    fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    temporary = None
    try:
        with NamedTemporaryFile(prefix=output.stem + "-", suffix=".tmp", dir=directory,
                                delete=False) as temp:
            temporary = Path(temp.name)
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED) as merged:
            for name, data in sorted(saved.items()):
                merged.writestr(name, data)
        os.replace(temporary, output)
        temporary = None
    finally:
        os.close(fd)
        lock_path.unlink()
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return output


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Usage: python sims/lp2_pdir_1329_rescue_merge.py folder conv shard")
    output = merge(Path(sys.argv[1]), sys.argv[2], int(sys.argv[3]))
    print(f"Reconstructed exact original-shard score ZIP: {output}")


if __name__ == "__main__":
    main()
