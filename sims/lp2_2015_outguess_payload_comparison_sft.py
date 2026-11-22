#!/usr/bin/env python3
"""Compare the first-commit 2015 OutGuess outputs with exact 2015 and 2014 JPEG sources.

Run from the repository root:
  python sims/lp2_2015_outguess_payload_comparison_sft.py /path/to/Cicada3301Runes

Requires gcc/cc and libjpeg development headers. Uses the source-faithful
OutGuess extractor in sims/outguess_extract.py. All inputs are read-only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "sims"))
from outguess_extract import build_bitmap, extract  # noqa: E402

EXPECTED_COMMIT = "52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35"
EXPECTED_LENGTH = 58152
ORIGINAL_IMAGES = ROOT / "resources" / "liber-primus"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def xor_all(payloads: list[bytes]) -> bytes:
    if not payloads:
        raise ValueError("No payloads to XOR")
    lengths = {len(payload) for payload in payloads}
    if len(lengths) != 1:
        raise ValueError(f"XOR inputs have unequal lengths: {sorted(lengths)}")
    result = bytearray(payloads[0])
    for payload in payloads[1:]:
        for i, value in enumerate(payload):
            result[i] ^= value
    return bytes(result)


def common_prefix(a: bytes, b: bytes) -> int:
    i = 0
    while i < min(len(a), len(b)) and a[i] == b[i]:
        i += 1
    return i


def common_suffix(a: bytes, b: bytes) -> int:
    i = 0
    while i < min(len(a), len(b)) and a[-1 - i] == b[-1 - i]:
        i += 1
    return i


def common_envelope(payloads: list[bytes]) -> tuple[int, int]:
    if not payloads:
        return 0, 0
    prefix = min(common_prefix(payloads[0], p) for p in payloads[1:]) if len(payloads) > 1 else len(payloads[0])
    suffix = min(common_suffix(payloads[0], p) for p in payloads[1:]) if len(payloads) > 1 else len(payloads[0])
    suffix = min(suffix, len(payloads[0]) - prefix)
    return prefix, suffix


def entropy(data: bytes) -> float:
    counts = Counter(data)
    return -sum((n / len(data)) * math.log2(n / len(data)) for n in counts.values()) if data else 0.0


def printable_fraction(data: bytes) -> float:
    if not data:
        return 0.0
    return sum(32 <= b < 127 or b in (9, 10, 13) for b in data) / len(data)


def ascii_strings(data: bytes, minimum: int = 8) -> list[dict]:
    found = []
    start = None
    for i in range(len(data) + 1):
        printable = i < len(data) and 32 <= data[i] < 127
        if printable and start is None:
            start = i
        elif not printable and start is not None:
            if i - start >= minimum:
                found.append({"offset": start, "length": i - start,
                              "text": data[start:i].decode("ascii", errors="replace")[:160]})
            start = None
    return found


def markers(data: bytes) -> dict:
    signatures = {
        "pgp_raw": b"-----BEGIN PGP",
        "pgp_base64": b"LS0tLS1CRUdJTiBQR1A",
        "gzip": b"\x1f\x8b",
        "zip": b"PK\x03\x04",
        "png": b"\x89PNG\r\n\x1a\n",
        "jpeg": b"\xff\xd8\xff",
        "pdf": b"%PDF-",
        "sqlite": b"SQLite format 3",
        "elf": b"\x7fELF",
    }
    return {name: [m.start() for m in re.finditer(re.escape(sig), data)]
            for name, sig in signatures.items()}


def image_for_page(historical_root: Path, page: int) -> Path:
    matches = sorted((historical_root / "pics" / "runebook").glob(f"{page:02d}_-_.jpg"))
    if not matches:
        matches = sorted((historical_root / "pics" / "runebook").glob(f"{page:02d}_-_*.jpg"))
    if len(matches) != 1:
        raise FileNotFoundError(f"Expected one 2015 mirror image for page {page}; found {matches}")
    return matches[0]


def saved_outputs(historical_root: Path) -> dict[int, tuple[Path, bytes]]:
    root = historical_root / "outguesses" / "runebook"
    result = {}
    for path in sorted(root.glob("*.out")):
        match = re.match(r"(\d{2})_-_.*\.jpg\.out$", path.name)
        if not match:
            continue
        page = int(match.group(1))
        data = path.read_bytes()
        if len(data) == EXPECTED_LENGTH:
            if page in result:
                raise ValueError(f"Duplicate historical output for page {page}")
            result[page] = (path, data)
    return result


def run_extract(image: Path) -> tuple[bytes | None, dict]:
    try:
        bitmap, bit_count = build_bitmap(image)
        payload, meta = extract(bitmap, bit_count, "Default key")
        meta.update({"bitmap_bits": bit_count, "bitmap_bytes": len(bitmap)})
        return payload, meta
    except Exception as exc:
        return None, {"error": f"{type(exc).__name__}: {exc}"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("historical_root", type=Path)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "outguess-2015-comparison")
    args = parser.parse_args()
    historical_root = args.historical_root.resolve()
    if not (historical_root / ".git").exists():
        raise SystemExit("Historical root must be a Git checkout")
    args.out_dir.mkdir(parents=True, exist_ok=True)

    commit = __import__("subprocess").check_output(
        ["git", "-C", str(historical_root), "rev-parse", "HEAD"], text=True
    ).strip()
    if commit != EXPECTED_COMMIT:
        raise SystemExit(f"Historical checkout commit mismatch: {commit}")

    saved = saved_outputs(historical_root)
    pages = sorted(saved)
    if len(pages) != 15:
        raise SystemExit(f"Expected 15 saved 58,152-byte outputs, found {len(pages)}: {pages}")

    historical_payloads = [saved[p][1] for p in pages]
    historical_xor = xor_all(historical_payloads)
    stored_xor_path = historical_root / "data" / "xorrunes.asc"
    stored_xor = stored_xor_path.read_bytes()
    stored_xor_equal = stored_xor == historical_xor
    (args.out_dir / "historical_xorrunes.asc").write_bytes(stored_xor)

    rows = []
    original_payloads = []
    original_pages = []
    for page in pages:
        saved_path, saved_payload = saved[page]
        mirror = image_for_page(historical_root, page)
        mirror_payload, mirror_meta = run_extract(mirror)
        original_image = ORIGINAL_IMAGES / f"{page + 16:02d}.jpg"
        original_payload, original_meta = run_extract(original_image)
        if original_payload is not None and len(original_payload) == EXPECTED_LENGTH:
            original_payloads.append(original_payload)
            original_pages.append(page)
        rows.append({
            "page": page,
            "saved_path": str(saved_path.relative_to(historical_root)),
            "saved_length": len(saved_payload),
            "saved_sha256": sha256(saved_payload),
            "mirror_image": str(mirror.relative_to(historical_root)),
            "mirror_extract_matches_saved": mirror_payload == saved_payload if mirror_payload is not None else False,
            "mirror_extract_sha256": sha256(mirror_payload) if mirror_payload is not None else None,
            "mirror_extract_metadata": mirror_meta,
            "original_image": str(original_image.relative_to(ROOT)),
            "original_extract_matches_saved": original_payload == saved_payload if original_payload is not None else False,
            "original_extract_sha256": sha256(original_payload) if original_payload is not None else None,
            "original_extract_metadata": original_meta,
            "saved_vs_original_differing_bytes": (
                sum(a != b for a, b in zip(saved_payload, original_payload))
                if original_payload is not None and len(original_payload) == len(saved_payload) else None
            ),
            "saved_vs_original_common_prefix": (
                common_prefix(saved_payload, original_payload)
                if original_payload is not None and len(original_payload) == len(saved_payload) else None
            ),
            "saved_vs_original_common_suffix": (
                common_suffix(saved_payload, original_payload)
                if original_payload is not None and len(original_payload) == len(saved_payload) else None
            ),
        })

    original_xor = xor_all(original_payloads) if len(original_payloads) == len(pages) else None
    if original_xor is not None:
        (args.out_dir / "original_15page_xorrunes.asc").write_bytes(original_xor)

    hist_prefix, hist_suffix = common_envelope(historical_payloads)
    hist_summary = {
        "length": len(historical_xor),
        "sha256": sha256(historical_xor),
        "entropy_bits_per_byte": entropy(historical_xor),
        "printable_fraction": printable_fraction(historical_xor),
        "first_64_hex": historical_xor[:64].hex(),
        "first_128_ascii": historical_xor[:128].decode("ascii", errors="replace"),
        "pgp_markers": markers(historical_xor),
        "ascii_strings": ascii_strings(historical_xor),
        "common_prefix_across_saved_payloads": hist_prefix,
        "common_suffix_across_saved_payloads": hist_suffix,
    }
    original_summary = None
    if original_xor is not None:
        original_summary = {
            "length": len(original_xor),
            "sha256": sha256(original_xor),
            "entropy_bits_per_byte": entropy(original_xor),
            "printable_fraction": printable_fraction(original_xor),
            "first_64_hex": original_xor[:64].hex(),
            "pgp_markers": markers(original_xor),
            "ascii_strings": ascii_strings(original_xor),
            "historical_xor_equals_original_15page_xor": historical_xor == original_xor,
            "historical_vs_original_differing_bytes": sum(a != b for a, b in zip(historical_xor, original_xor)),
            "historical_vs_original_common_prefix": common_prefix(historical_xor, original_xor),
            "historical_vs_original_common_suffix": common_suffix(historical_xor, original_xor),
        }

    summary = {
        "historical_repository": "thomasandfriends/Cicada3301Runes",
        "historical_commit": commit,
        "expected_commit": EXPECTED_COMMIT,
        "historical_saved_payload_count": len(pages),
        "historical_pages": pages,
        "historical_xor_matches_saved_data_xorrunes_asc": stored_xor_equal,
        "stored_xorrunes_length": len(stored_xor),
        "stored_xorrunes_sha256": sha256(stored_xor),
        "recomputed_historical_xor": hist_summary,
        "original_source_reextract_count": len(original_payloads),
        "original_source_pages": original_pages,
        "original_source_xor": original_summary,
        "page_comparisons": rows,
        "decision": "Compare historical participant payload bytes against 2015 mirror and canonical 2014 source; no payload is authenticated by length or header alone."
    }
    (args.out_dir / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print("HISTORICAL_COMMIT " + commit)
    print("SAVED_OUTPUTS " + json.dumps({"count": len(pages), "pages": pages, "length_each": EXPECTED_LENGTH}))
    print("XOR_REPRODUCES_DATA_XORRUNES " + str(stored_xor_equal))
    print("HISTORICAL_XOR " + json.dumps(hist_summary, sort_keys=True))
    print("ORIGINAL_SOURCE_XOR " + json.dumps(original_summary, sort_keys=True))
    for row in rows:
        print("PAGE " + json.dumps({
            "page": row["page"],
            "mirror_matches_saved": row["mirror_extract_matches_saved"],
            "original_matches_saved": row["original_extract_matches_saved"],
            "saved_vs_original_differing_bytes": row["saved_vs_original_differing_bytes"],
            "mirror_error": row["mirror_extract_metadata"].get("error"),
            "original_error": row["original_extract_metadata"].get("error"),
        }, sort_keys=True))
    print("SUMMARY " + str(args.out_dir / "summary.json"))


if __name__ == "__main__":
    main()
