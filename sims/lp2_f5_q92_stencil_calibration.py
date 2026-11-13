#!/usr/bin/env python3
"""Q92 original-format F5 carrier calibration with leave-one-out peer stencils.

The actual originals are examined by the detector ONLY if six independent
page-group matched positive controls, clean proxies and extraction pass.
All F5-positive payloads are synthetically generated, never real LP2 content.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

GROUPS = {
    "p4-7": (4, 5, 6, 7),
    "p9-13-odd": (9, 11, 13),
    "p10-14-even": (10, 12, 14),
    "p34-39": (34, 35, 36, 37, 38, 39),
    "p40-55-color": (40, 49, 53, 54, 55),
    "p41-52-gray": (41, 42, 43, 44, 45, 46, 47, 48, 52),
}
CONTROL_PAGES = (6, 13, 14, 36, 45, 54)
PAYLOAD_BYTES = (256, 1024, 4096)
PASSWORD = "LP2-Q92-F5-EXACT-STENCIL-CONTROL-20261113"


def command(args: list[str], timeout: int = 240) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, capture_output=True, text=True, timeout=timeout, check=False)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def payload_of(size: int) -> bytes:
    return b"".join(
        hashlib.sha256(
            b"LP2-Q92-STENCIL-F5-SOURCE-20261113" + i.to_bytes(4, "big")
        ).digest()
        for i in range((size + 31) // 32)
    )[:size]


def stencil(exe: str, sources: Path, page: int, stego: Path | None = None) -> dict[str, object]:
    args = [exe, str(sources), str(page)]
    if stego is not None:
        args.append(str(stego))
    proc = command(args, timeout=90)
    if proc.returncode:
        raise RuntimeError(f"stencil failed {args}: {proc.stderr[-1200:]}")
    fields = proc.stdout.strip().split(",")
    if len(fields) != 8 or int(fields[0]) != page:
        raise ValueError(f"bad stencil output {proc.stdout!r}")
    m = list(map(int, fields[2:]))
    row: dict[str, object] = dict(zip(
        ("template_blocks", "template_nonzero_ac", "f5_decrements",
         "increases", "other_changes", "dc_changes"), m))
    row.update({
        "physical_page": page, "group": fields[1],
        "scorable": fields[1] != "UNSCORABLE",
        "f5_signature": m[2] >= 12 and m[3] == 0 and m[4] == 0 and m[5] == 0,
    })
    return row


def write_json_atomic(path: Path, obj: dict[str, object]) -> None:
    from filelock import FileLock
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            "w", dir=path.parent, encoding="utf-8",
            prefix=".f5q92-", suffix=".tmp", delete=False
        ) as out:
            temp = Path(out.name)
            json.dump(obj, out, sort_keys=True, indent=2)
            out.write("\n")
        os.replace(temp, path)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", type=Path, default=Path("resources/liber-primus"))
    ap.add_argument("--exe", default="./f5_stencil_detector")
    ap.add_argument("--f5", default="f5")
    ap.add_argument("--output", type=Path,
                    default=Path("im-results/f5-q92-shared-stencil-calibration/summary.json"))
    ap.add_argument("--apply-originals-after-calibration", action="store_true")
    a = ap.parse_args()
    version = command([a.f5, "version"], timeout=30)
    if version.returncode:
        raise RuntimeError(f"F5 binary unavailable: {version.stderr}")
    result: dict[str, object] = {
        "timestamp_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "method": "two-other-page leave-one-out exact Q92 luma-DCT template; >=12 sign-preserving magnitude-one AC decrements; zero increases, other changes, or DC changes in shared original stencil blocks; x/y outside 512..1888/512..3200",
        "version": version.stdout.strip() or version.stderr.strip(),
        "groups": GROUPS,
        "control_pages": CONTROL_PAGES,
        "payload_lengths": PAYLOAD_BYTES,
        "originals_requested": a.apply_originals_after_calibration,
        "source_images": [],
        "matched_original_proxy_controls": [],
        "positive_controls": [],
    }
    work = a.output.parent / "plant"
    work.mkdir(parents=True, exist_ok=True)
    for page in CONTROL_PAGES:
        cover = a.sources / f"{page + 17}.jpg"
        if not cover.exists():
            raise FileNotFoundError(cover)
        result["source_images"].append({
            "physical_page": page, "scan": cover.name, "sha256": sha256(cover.read_bytes())
        })
        for size in PAYLOAD_BYTES:
            payload = payload_of(size)
            payload_file = work / f"payload_{size}.bin"
            payload_file.write_bytes(payload)  # disposable short single-writer control fixture
            stego = work / f"p{page}_payload{size}.jpg"
            extracted = work / f"p{page}_payload{size}.out"
            if extracted.exists():
                extracted.unlink()
            embed = command([
                a.f5, "embed", str(cover), "-p", PASSWORD,
                "-in", str(payload_file), "-o", str(stego)
            ])
            if embed.returncode or not stego.exists():
                raise RuntimeError(f"F5 embed failed p{page}/{size}: {embed.stderr[-1500:]}")
            extr = command([
                a.f5, "extract", str(stego), "-p", PASSWORD, "-o", str(extracted)
            ])
            if extr.returncode or not extracted.exists() or extracted.read_bytes() != payload:
                raise RuntimeError(f"F5 extraction failed p{page}/{size}: {extr.stderr[-1500:]}")
            row = stencil(a.exe, a.sources, page, stego)
            row.update({
                "payload_bytes": size, "sha256_stego": sha256(stego.read_bytes()),
                "sha256_payload": sha256(payload), "extracted_exactly": True,
            })
            result["positive_controls"].append(row)
            print("POS", page, size, "dec", row["f5_decrements"],
                  "inc", row["increases"], "other", row["other_changes"],
                  "dc", row["dc_changes"], "flag", row["f5_signature"], flush=True)
    proxy = [
        stencil(a.exe, a.sources, page)
        for group in GROUPS.values() for page in group
    ]
    result["matched_original_proxy_controls"] = proxy
    for row in proxy:
        print("COVER", row["physical_page"], row["group"],
              "AC", row["template_nonzero_ac"],
              "dec", row["f5_decrements"], "other", row["other_changes"], flush=True)
    positive = result["positive_controls"]
    by_size = {
        str(size): {
            "detected": sum(bool(p["f5_signature"])
                            for p in positive if p["payload_bytes"] == size),
            "total": len(CONTROL_PAGES),
        }
        for size in PAYLOAD_BYTES
    }
    fpr_count = sum(bool(row["f5_signature"]) for row in proxy)
    eligible = (
        fpr_count == 0
        and by_size["1024"]["detected"] == 6
        and by_size["4096"]["detected"] == 6
        and by_size["256"]["detected"] >= 5
    )
    result["calibration"] = {
        "true_positive_by_size": by_size,
        "false_positives": fpr_count,
        "total_proxy_covers": len(proxy),
        "passed": eligible,
    }
    print("CALIBRATION", json.dumps(result["calibration"], sort_keys=True), flush=True)
    if eligible and a.apply_originals_after_calibration:
        screen = [stencil(a.exe, a.sources, page) for page in range(58)]
        result["original_screen"] = screen
        result["original_screen_summary"] = {
            "scorable": sum(bool(r["scorable"]) for r in screen),
            "unscorable": [r["physical_page"] for r in screen if not r["scorable"]],
            "flags": [r["physical_page"] for r in screen if r["f5_signature"]],
        }
        print("ORIGINAL_SCREEN", json.dumps(result["original_screen_summary"],
                                            sort_keys=True), flush=True)
    elif a.apply_originals_after_calibration:
        print("ORIGINAL_SCREEN_WITHHELD: failed calibration", flush=True)
    write_json_atomic(a.output, result)
    print("SUMMARY", a.output.as_posix(), flush=True)


if __name__ == "__main__":
    main()
