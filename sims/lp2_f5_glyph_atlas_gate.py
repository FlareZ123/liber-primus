#!/usr/bin/env python3
"""Original LP2 JPEG rune-glyph DCT decrement atlas, with genuine F5 calibration.

A repeated 8x8 luminance coefficient block from ten original text-only LP2
pages serves as an independently occurring font reference. The exact mutation
target is a one-unit *magnitude decrease* of a nonzero AC coefficient. Original
scores are descriptive unless all genuine 256-byte F5 heldout implants extract
and pass the predeclared source glyph sensitivity gate.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

import numpy as np
from filelock import FileLock

REFERENCE_PAGES = (16, 17, 18, 19, 20, 21, 28, 29, 30, 31)
UNSCORED_PAGES = (0, 1, 2, 3, 8, *range(15, 34), 56, 57)
assert len(UNSCORED_PAGES) == 26
BLOCK_ROWS, BLOCK_COLS = 288, 206
PAYLOAD_BYTES = 256
F5_K = 4
CONTROL_PASSWORD = "LP2-GLYPH-DCT-F5-HELDOUT-CONTROL-20261113"
MIN_GENUINE_F5_NEIGHBORS = 12
GRAYSCALE_ORIGINALS = frozenset((16, 17, 18, 19, 20, 21, 24, 25, 28, 29, 30, 31))


def read_coefficients(reader: str, jpeg: Path) -> np.ndarray:
    raw = subprocess.run([reader, str(jpeg)], check=True, capture_output=True).stdout
    expected = BLOCK_ROWS * BLOCK_COLS * 64 * 2
    if len(raw) != expected:
        raise ValueError(f"{jpeg}: DCT reader returned {len(raw)} bytes, expected {expected}")
    return np.frombuffer(raw, dtype="<i2").reshape(BLOCK_ROWS * BLOCK_COLS, 64)


def ink_items(coefficient_array: np.ndarray) -> tuple[Counter[bytes], list[tuple[int, bytes]]]:
    positions = np.flatnonzero(np.any(coefficient_array[:, 1:] != 0, axis=1))
    entries = [(int(i), coefficient_array[i].tobytes()) for i in positions]
    return Counter(motif for _, motif in entries), entries


def make_decrement_neighbors(reference: Counter[bytes]) -> set[bytes]:
    neighbors: set[bytes] = set()
    for motif, count in reference.items():
        if count < 3:
            continue
        vector = np.frombuffer(motif, dtype="<i2").copy()
        for k in range(1, 64):
            old = int(vector[k])
            if old == 0:
                continue
            vector[k] = old - (1 if old > 0 else -1)
            neighbors.add(vector.tobytes())
            vector[k] = old
    return neighbors


def score(
    entries: list[tuple[int, bytes]],
    reference: Counter[bytes],
    neighbors: set[bytes],
) -> dict:
    candidates = [
        {"x": 400 + 8 * (i % BLOCK_COLS), "y": 600 + 8 * (i // BLOCK_COLS)}
        for i, motif in entries if motif not in reference and motif in neighbors
    ]
    return {
        "ink_blocks": len(entries),
        "one_decrement_novel": len(candidates),
        "candidate_coordinates": candidates,
        "exact_reference_matches": sum(
            1 for _, motif in entries if motif in reference
        ),
    }


def payload_for(page: int) -> bytes:
    seed = f"GLYPH-ATLAS-F5-POSITIVE-PAGE-{page}".encode("ascii")
    return b"".join(
        hashlib.sha256(seed + i.to_bytes(4, "big")).digest()
        for i in range((PAYLOAD_BYTES + 31) // 32)
    )[:PAYLOAD_BYTES]


def run_f5_control(
    page: int,
    source: Path,
    reader: str,
    embedder: str,
    f5: str,
    apply_gray: str,
    reference: Counter[bytes],
    neighbors: set[bytes],
    workdir: Path,
) -> dict:
    carrier = source / f"{page + 17:02d}.jpg"
    prefix = workdir / f"p{page:02d}"
    payload = prefix.with_suffix(".bin")
    embedded = workdir / f"p{page:02d}-f5.jpg"
    recovered = workdir / f"p{page:02d}-recovered.bin"
    expected = payload_for(page)
    payload.write_bytes(expected)
    embed_args = [
        embedder, "-cover", str(carrier), "-payload", str(payload),
        "-password", CONTROL_PASSWORD, "-k", str(F5_K),
        "-pad-trailing-zeros", "-out", str(embedded),
    ]
    if page in GRAYSCALE_ORIGINALS:
        raw_coefficients = workdir / f"p{page:02d}-f5.int16"
        embed_args.extend(["-out-coefficients", str(raw_coefficients)])
    subprocess.run(embed_args, check=True, capture_output=True)
    if page in GRAYSCALE_ORIGINALS:
        subprocess.run(
            [apply_gray, str(carrier), str(raw_coefficients), str(embedded)],
            check=True, capture_output=True,
        )
    subprocess.run([
        f5, "extract", str(embedded), "-p", CONTROL_PASSWORD,
        "-o", str(recovered),
    ], check=True, capture_output=True)
    if recovered.read_bytes() != expected:
        raise AssertionError(f"genuine F5 extraction mismatch on original-format p{page}")
    source_y = read_coefficients(reader, carrier).astype(np.int32)
    control_y = read_coefficients(reader, embedded).astype(np.int32)
    modified = source_y != control_y
    expected_steps = source_y - np.sign(source_y)
    if np.any(modified[:, 0]) or not np.array_equal(
        control_y[modified], expected_steps[modified]
    ):
        raise AssertionError(f"non-F5 coefficient mutation in authentic p{page} control")
    _, entries = ink_items(control_y.astype("<i2"))
    result = score(entries, reference, neighbors)
    result["modified_luminance_coefficients"] = int(np.count_nonzero(modified))
    result.update({"page": page, "payload_bytes": PAYLOAD_BYTES, "f5_k": F5_K,
                   "extracted_exactly": True,
                   "input_sha256": hashlib.sha256(carrier.read_bytes()).hexdigest(),
                   "payload_sha256": hashlib.sha256(expected).hexdigest()})
    return result


def write_report(path: Path, report: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=".lp2-glyph-", suffix=".tmp", delete=False
        ) as f:
            tmp = Path(f.name)
            json.dump(report, f, sort_keys=True, indent=2)
            f.write("\n")
        os.replace(tmp, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sources", type=Path, required=True)
    parser.add_argument("--reader", required=True)
    parser.add_argument("--embedder")
    parser.add_argument("--f5")
    parser.add_argument("--apply-grayscale")
    parser.add_argument("--original-only", action="store_true")
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    if not args.original_only and (not args.embedder or not args.f5 or not args.apply_grayscale):
        parser.error("genuine F5 calibration requires --embedder, --f5 and --apply-grayscale")

    sources = args.sources
    reference = {}
    for page in REFERENCE_PAGES:
        coeff = read_coefficients(args.reader, sources / f"{page + 17:02d}.jpg")
        reference[page], _ = ink_items(coeff)
    full_atlas = Counter()
    for data in reference.values():
        full_atlas.update(data)
    full_neighbors = make_decrement_neighbors(full_atlas)
    independent_atlases = {}
    for page in REFERENCE_PAGES:
        independent = full_atlas - reference[page]
        independent_atlases[page] = (independent, make_decrement_neighbors(independent))

    report = {
        "method": "original quantized Y DCT one-AC-magnitude-decrement glyph-neighbor",
        "reference_original_pages": list(REFERENCE_PAGES),
        "tested_already_unscored_pages": list(UNSCORED_PAGES),
        "reference_crop_xyxy": [400, 600, 2048, 2904],
        "reference_ink_blocks": sum(full_atlas.values()),
        "reference_unique_blocks": len(full_atlas),
        "original_source_screened": False,
        "genuine_f5_calibration_pass": False,
        "positive_controls": [],
        "source_originals": [],
    }
    if not args.original_only:
        with tempfile.TemporaryDirectory(prefix="lp2-f5-glyph-") as temp:
            for page in UNSCORED_PAGES:
                atlas, nearby = independent_atlases.get(
                    page, (full_atlas, full_neighbors)
                )
                try:
                    result = run_f5_control(
                        page, sources, args.reader, args.embedder, args.f5,
                        args.apply_grayscale, atlas, nearby, Path(temp)
                    )
                except (subprocess.CalledProcessError, ValueError, AssertionError) as e:
                    diagnostics = e.stderr.decode(errors="replace")[-1500:] if isinstance(e, subprocess.CalledProcessError) and e.stderr else ""
                    report["control_error"] = f"page {page}: {e}; stderr={diagnostics}"
                    print(f"CONTROL_FAILED p{page}: {e}; stderr={diagnostics}", flush=True)
                    break
                report["positive_controls"].append(result)
                print(
                    f"GENUINE_F5_EXACT p{page} "
                    f"neighbor={result['one_decrement_novel']}",
                    flush=True,
                )
        passed = (
            len(report["positive_controls"]) == len(UNSCORED_PAGES)
            and all(
                item["one_decrement_novel"] >= MIN_GENUINE_F5_NEIGHBORS
                for item in report["positive_controls"]
            )
        )
        report["genuine_f5_calibration_pass"] = passed
        if not passed:
            print("ORIGINAL_SCREEN_WITHHELD: failed genuine-F5 control gate", flush=True)
            write_report(args.report, report)
            return

    for page in range(58):
        atlas, nearby = independent_atlases.get(page, (full_atlas, full_neighbors))
        coeff = read_coefficients(args.reader, sources / f"{page + 17:02d}.jpg")
        _, entries = ink_items(coeff)
        count = score(entries, atlas, nearby)
        report["source_originals"].append({"page": page, **count})
        print(
            f"ORIGINAL_SOURCE p{page} "
            f"neighbor={count['one_decrement_novel']} ink={count['ink_blocks']}",
            flush=True,
        )
    report["original_source_screened"] = True
    if args.original_only:
        report["interpretation"] = "source-only exploratory census; genuine F5 not calibrated"
    else:
        report["interpretation"] = (
            "genuine F5 positive controls passed; exact one-decrement glyph "
            "reference excludes only sufficiently sensitive whole-image "
            "luma-affecting F5 on repeated source glyphs"
        )
    write_report(args.report, report)


if __name__ == "__main__":
    main()
