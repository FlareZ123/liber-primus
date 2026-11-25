#!/usr/bin/env python3
"""Pinned OutGuess 0.2.1 extraction audit for the original Cicada page JPEGs.

LP2 archive indices 17..72 are pages 0..55; 73..74 are solved controls.
LP1 indices 0..16 are positive controls for the historical extractor.
The seven candidate keys are restricted to the three pages previously reported
as default-key capacity false positives (LP2 pages 0, 4, and 26).
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import math
import pathlib
import subprocess
import tempfile
from typing import Any

OUTGUESS_COMMIT = "26fe8df0d693cf229d33f5bccd2757b344dfdbf3"
CANDIDATE_KEYS = [
    "3301",
    "33011033",
    "circumference",
    "firfumferenfe",
    "welcome",
    "instar",
    "pilgrim",
]
CANDIDATE_ARCHIVE_INDICES = [17, 21, 43]  # LP2 pages 0, 4, 26


def entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = collections.Counter(data)
    n = len(data)
    return -sum((c / n) * math.log2(c / n) for c in counts.values())


def summarize_output(data: bytes) -> dict[str, Any]:
    n = len(data)
    printable = sum(1 for b in data if b in (9, 10, 13) or 32 <= b <= 126)
    prefix = lambda k: hashlib.sha256(data[:k]).hexdigest() if n >= k else None
    return {
        "length": n,
        "sha256": hashlib.sha256(data).hexdigest() if data else None,
        "entropy_bits_per_byte": round(entropy(data), 6),
        "printable_ascii_fraction": round(printable / n, 6) if n else 0.0,
        "pgp_signed_message": b"-----BEGIN PGP SIGNED MESSAGE-----" in data,
        "pgp_signature": b"-----BEGIN PGP SIGNATURE-----" in data,
        "gzip_magic": data.startswith(b"\x1f\x8b"),
        "bzip2_magic": data.startswith(b"BZh"),
        "zip_magic": data.startswith(b"PK\x03\x04"),
        "prefix_1417_sha256": prefix(1417),
        "prefix_2004_sha256": prefix(2004),
        "first_64_hex": data[:64].hex(),
    }


def run_case(binary: pathlib.Path, image: pathlib.Path, label: str,
             key: str | None = None, timeout: int = 120) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="lp2-outguess-") as td:
        out_path = pathlib.Path(td) / "extracted.bin"
        command = [str(binary), "-r"]
        if key is not None:
            command.extend(["-k", key])
        command.extend([str(image), str(out_path)])
        try:
            proc = subprocess.run(
                command, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                timeout=timeout, check=False,
            )
            data = out_path.read_bytes() if out_path.exists() else b""
            return {
                "label": label,
                "key": key,
                "command": command,
                "returncode": proc.returncode,
                "timeout": False,
                "stdout": proc.stdout.decode("utf-8", "replace")[-3000:],
                "stderr": proc.stderr.decode("utf-8", "replace")[-3000:],
                **summarize_output(data),
            }
        except subprocess.TimeoutExpired as exc:
            return {
                "label": label,
                "key": key,
                "command": command,
                "returncode": None,
                "timeout": True,
                "stdout": (exc.stdout or b"").decode("utf-8", "replace")[-3000:],
                "stderr": (exc.stderr or b"").decode("utf-8", "replace")[-3000:],
                **summarize_output(b""),
            }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--binary", required=True, type=pathlib.Path)
    ap.add_argument("--root", default=pathlib.Path("resources/liber-primus"),
                    type=pathlib.Path)
    ap.add_argument("--control", type=pathlib.Path)
    ap.add_argument("--output", required=True, type=pathlib.Path)
    args = ap.parse_args()

    binary = args.binary.resolve()
    root = args.root.resolve()
    if not binary.is_file():
        raise SystemExit(f"OutGuess executable not found: {binary}")
    if not root.is_dir():
        raise SystemExit(f"Image directory not found: {root}")

    all_runs: list[dict[str, Any]] = []
    input_hashes: dict[str, str] = {}
    for archive_index in range(75):
        image = root / f"{archive_index:02d}.jpg"
        if not image.is_file():
            raise SystemExit(f"Missing original image: {image}")
        input_hashes[image.name] = hashlib.sha256(image.read_bytes()).hexdigest()
        if archive_index <= 16:
            group = "LP1-positive-control"
            lp2_page = None
        elif archive_index <= 72:
            group = "LP2-unknown"
            lp2_page = archive_index - 17
        elif archive_index <= 74:
            group = "LP2-solved-control"
            lp2_page = archive_index - 17
        result = run_case(binary, image, f"{group}:{image.name}")
        result.update({
            "archive_index": archive_index,
            "lp2_page": lp2_page,
            "group": group,
            "image_sha256": input_hashes[image.name],
            "run_type": "default-key",
        })
        all_runs.append(result)

    candidate_runs: list[dict[str, Any]] = []
    for archive_index in CANDIDATE_ARCHIVE_INDICES:
        image = root / f"{archive_index:02d}.jpg"
        for key in CANDIDATE_KEYS:
            result = run_case(binary, image, f"LP2-p{archive_index - 17:02d}:{image.name}", key)
            result.update({
                "archive_index": archive_index,
                "lp2_page": archive_index - 17,
                "group": "LP2-unknown",
                "image_sha256": input_hashes[image.name],
                "run_type": "candidate-key",
            })
            candidate_runs.append(result)

    control_run = None
    if args.control:
        control = args.control.resolve()
        if not control.is_file():
            raise SystemExit(f"Control JPEG not found: {control}")
        control_run = run_case(binary, control, "synthetic-Ghostscript-control")
        control_run.update({
            "group": "synthetic-control",
            "run_type": "default-key",
            "image_sha256": hashlib.sha256(control.read_bytes()).hexdigest(),
        })

    lp1 = [r for r in all_runs if r["group"] == "LP1-positive-control"]
    lp2 = [r for r in all_runs if r["group"] == "LP2-unknown"]
    solved = [r for r in all_runs if r["group"] == "LP2-solved-control"]

    def nonempty(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [r for r in rows if r["length"] > 0]

    def compact(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [{
            "label": r["label"], "archive_index": r.get("archive_index"),
            "lp2_page": r.get("lp2_page"), "key": r.get("key"),
            "returncode": r["returncode"], "timeout": r["timeout"],
            "length": r["length"], "entropy_bits_per_byte": r["entropy_bits_per_byte"],
            "printable_ascii_fraction": r["printable_ascii_fraction"],
            "pgp_signed_message": r["pgp_signed_message"],
            "sha256": r["sha256"], "prefix_1417_sha256": r["prefix_1417_sha256"],
            "stderr_tail": r["stderr"][-800:], "stdout_tail": r["stdout"][-800:],
        } for r in rows]

    prefix_groups: dict[str, list[str]] = {}
    for r in nonempty(lp2):
        digest = r["prefix_1417_sha256"]
        if digest:
            prefix_groups.setdefault(digest, []).append(r["label"])
    if control_run and control_run["prefix_1417_sha256"]:
        prefix_groups.setdefault(control_run["prefix_1417_sha256"], []).append(control_run["label"])

    summary = {
        "outguess_commit": OUTGUESS_COMMIT,
        "image_index_mapping": "archive 17..72 = LP2 p0..p55; 73..74 = solved p56..p57",
        "lp1_positive_control_count": len(lp1),
        "lp1_nonempty_count": len(nonempty(lp1)),
        "lp1_pgp_signed_count": sum(r["pgp_signed_message"] for r in lp1),
        "lp1_crash_or_timeout_count": sum(r["timeout"] or (r["returncode"] is not None and r["returncode"] < 0) for r in lp1),
        "lp2_unknown_count": len(lp2),
        "lp2_default_nonempty_count": len(nonempty(lp2)),
        "lp2_default_pgp_signed_count": sum(r["pgp_signed_message"] for r in lp2),
        "lp2_default_capacity_58152_count": sum(r["length"] == 58152 for r in lp2),
        "lp2_default_crash_or_timeout_count": sum(r["timeout"] or (r["returncode"] is not None and r["returncode"] < 0) for r in lp2),
        "lp2_default_crashes": compact([r for r in lp2 if r["timeout"] or (r["returncode"] is not None and r["returncode"] < 0)]),
        "lp2_default_capacity_rejected_count": sum(("Insufficient remaining iterator capacity" in r["stderr"]) or ("Extracted datalen is too long" in r["stderr"]) for r in lp2),
        "lp2_default_capacity_rejections": compact([r for r in lp2 if ("Insufficient remaining iterator capacity" in r["stderr"]) or ("Extracted datalen is too long" in r["stderr"])]),
        "lp2_default_empty": compact([r for r in lp2 if r["length"] == 0 and not (r["timeout"] or (r["returncode"] is not None and r["returncode"] < 0))]),
        "lp1_pgp_pages": [r["archive_index"] for r in lp1 if r["pgp_signed_message"]],
        "lp2_default_nonempty": compact(nonempty(lp2)),
        "lp2_default_1417_prefix_groups": prefix_groups,
        "lp2_solved_controls": compact(solved),
        "candidate_key_run_count": len(candidate_runs),
        "candidate_key_nonempty_count": len(nonempty(candidate_runs)),
        "candidate_key_pgp_signed_count": sum(r["pgp_signed_message"] for r in candidate_runs),
        "candidate_key_nonempty": compact(nonempty(candidate_runs)),
        "synthetic_control": compact([control_run]) if control_run else None,
    }

    report = {
        "summary": summary,
        "input_sha256": input_hashes,
        "default_runs": all_runs,
        "candidate_runs": candidate_runs,
        "control_run": control_run,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
