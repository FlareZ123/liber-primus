#!/usr/bin/env python3
"""Bounded F5/JPEG carrier gate for the original Liber Primus image corpus.

Source-constrained candidates only:
- CABALUOIDFORM / CABALVOIDFORM: the 2013 0_wisdom p36/p55 route.
- 33011033 / 33011103: the two documented 2014 7x7/OpenPuff password candidates.
- MOBIUS: the explicit 2013 0_wisdom table keyword.

This does not search a dictionary or claim these are established F5 passwords.
It tests F5 as a distinct JPEG DCT-domain method; OutGuess and JSteg have already
been investigated separately. The F5 CLI is pinned by the companion workflow
to github.com/0verkilll/f5 v1.0.0 (MIT).
"""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
from collections import Counter
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
OUT_DIR = ROOT / "im-results" / "f5-lp2-targeted-gate"
PAYLOAD_DIR = OUT_DIR / "payloads"
CONTROL_DIR = OUT_DIR / "positive-control"
F5 = shutil.which("f5")

KEYS = [
    ("cabal_uoid_form", "CABALUOIDFORM",
     "2013 0_wisdom p36/p55 route; same phrase previously tested with OutGuess"),
    ("cabal_void_form", "CABALVOIDFORM",
     "literal English VOID spelling of the same 2013 route"),
    ("onion7_primary_33011033", "33011033",
     "primary documented 2014 7x7/OpenPuff candidate; not authenticated as F5 key"),
    ("onion7_alternative_33011103", "33011103",
     "alternative documented 2014 7x7/OpenPuff candidate; not authenticated as F5 key"),
    ("mobius", "MOBIUS",
     "explicit 2013 0_wisdom table word; weaker keyword candidate"),
]

def run(args: list[str], timeout: int = 180) -> dict[str, Any]:
    try:
        p = subprocess.run(args, capture_output=True, text=True, errors="replace",
                           timeout=timeout, check=False)
        return {"returncode": p.returncode, "stdout": p.stdout[-3000:],
                "stderr": p.stderr[-3000:]}
    except subprocess.TimeoutExpired as e:
        return {"returncode": 124,
                "stdout": str(e.stdout or "")[-1000:],
                "stderr": ("TIMEOUT after %ss; " % timeout) + str(e.stderr or "")[-1000:]}

def image_meta(path: Path) -> dict[str, Any]:
    n = int(path.stem)
    return {
        "image": path.name,
        "image_index": n,
        "release": "LP1" if n < 17 else "LP2",
        "page": n if n < 17 else n - 17,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
    }

def detect_one(path: Path) -> dict[str, Any]:
    p = run([F5, "detect", str(path), "-tier", "none", "-json"], timeout=300)
    data = None
    try:
        data = json.loads(p["stdout"])
    except Exception:
        pass
    return {**image_meta(path), "returncode": p["returncode"],
            "result": data, "raw_stdout": None if data is not None else p["stdout"],
            "stderr": p["stderr"]}

def ci_get(obj: Any, key: str) -> Any:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() == key.lower():
                return v
    return None

def nested_ci(obj: Any, *path: str) -> Any:
    cur = obj
    for part in path:
        cur = ci_get(cur, part)
        if cur is None:
            return None
    return cur

def detector_brief(row: dict[str, Any]) -> dict[str, Any]:
    d = row.get("result") or {}
    return {
        "image": row["image"],
        "release": row["release"],
        "page": row["page"],
        "returncode": row["returncode"],
        "verdict": (nested_ci(d, "overall", "verdict")
                    or nested_ci(d, "verdict")
                    or nested_ci(d, "statistical", "verdict")),
        "beta": (nested_ci(d, "statistical", "beta")
                 or nested_ci(d, "beta")),
        "beta_confidence": (nested_ci(d, "statistical", "confidence")
                            or nested_ci(d, "confidence")),
        "estimated_bytes": nested_ci(d, "statistical", "estimated_bytes"),
        "double_compressed": nested_ci(d, "statistical", "double_compressed"),
        "carrier_viable": nested_ci(d, "fingerprint", "carrier_viable"),
        "fingerprint_score": nested_ci(d, "fingerprint", "score"),
    }

def payload_stats(data: bytes) -> dict[str, Any]:
    magic_table = [
        (b"PK\x03\x04", "zip"), (b"\x89PNG\r\n\x1a\n", "png"),
        (b"%PDF", "pdf"), (b"\x1f\x8b", "gzip"),
        (b"7z\xbc\xaf\x27\x1c", "7z"), (b"Rar!\x1a\x07", "rar"),
        (b"\x7fELF", "elf"), (b"SQLite format 3", "sqlite"),
        (b"GIF8", "gif"), (b"\xff\xd8\xff", "jpeg"),
        (b"-----BEGIN", "armored-text"),
    ]
    magic = next((name for prefix, name in magic_table if data.startswith(prefix)), None)
    printable = (sum(1 for b in data if b in (9, 10, 13) or 32 <= b < 127) / len(data)) if data else 0.0
    counts = Counter(data)
    entropy = (-sum((n / len(data)) * math.log2(n / len(data))
                    for n in counts.values()) if data else 0.0)
    preview = (data[:180].decode("utf-8", "replace")
               if printable >= 0.75 else data[:96].hex())
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "magic": magic, "printable_ratio": round(printable, 4),
            "entropy_bits_per_byte": round(entropy, 4), "preview": preview}

def positive_control(images: list[Path]) -> dict[str, Any]:
    cover = next((p for p in images if p.stem == "17"), None)
    if cover is None:
        raise RuntimeError("missing LP2 page-0 cover 17.jpg")
    CONTROL_DIR.mkdir(parents=True, exist_ok=True)
    payload_path = CONTROL_DIR / "known-message.bin"
    stego_path = CONTROL_DIR / "known-message-stego.jpg"
    extracted_path = CONTROL_DIR / "known-message-extracted.bin"
    password = "F5-POSITIVE-CONTROL-20261111"
    payload = b"LP2-F5-POSITIVE-CONTROL-v1\x00" + bytes((i * 73 + 19) % 256 for i in range(4096))
    payload_path.write_bytes(payload)

    # embed-x re-encodes a real cover through the selected non-f5.jar encoder.
    # If that path is unavailable in a pinned release, fall back to embed-jar.
    attempts = []
    for mode, command in [
        ("embed-x-libjpeg", [F5, "embed-x", str(cover), "-p", password,
                             "-in", str(payload_path), "-encoder", "libjpeg",
                             "-o", str(stego_path)]),
        ("embed-jar", [F5, "embed-jar", str(cover), "-p", password,
                       "-in", str(payload_path), "-o", str(stego_path)]),
    ]:
        if stego_path.exists():
            stego_path.unlink()
        result = run(command, timeout=300)
        attempts.append({"mode": mode, **result,
                         "output_exists": stego_path.exists()})
        if result["returncode"] == 0 and stego_path.exists():
            break
    else:
        raise RuntimeError("F5 positive-control embedding failed: " +
                           json.dumps(attempts, sort_keys=True))

    extracted = run([F5, "extract", str(stego_path), "-p", password,
                     "-o", str(extracted_path)], timeout=300)
    if extracted["returncode"] != 0 or not extracted_path.exists():
        raise RuntimeError("F5 positive-control extraction failed: " +
                           json.dumps(extracted, sort_keys=True))
    got = extracted_path.read_bytes()
    if got != payload:
        raise RuntimeError("F5 positive-control round-trip mismatch")
    return {
        "cover": image_meta(cover),
        "mode": attempts[-1]["mode"],
        "embed_attempts": attempts,
        "extract": extracted,
        "round_trip_exact": True,
        "payload": payload_stats(payload),
        "stego_sha256": hashlib.sha256(stego_path.read_bytes()).hexdigest(),
        "detector_on_stego": detect_one(stego_path),
    }

def extract_one(task: tuple[Path, str, str]) -> dict[str, Any]:
    image, key_id, password = task
    out = PAYLOAD_DIR / (image.stem + "_" + key_id + ".bin")
    if out.exists():
        out.unlink()
    p = run([F5, "extract", str(image), "-p", password, "-o", str(out)], timeout=240)
    data = out.read_bytes() if out.exists() else b""
    success = p["returncode"] == 0 and len(data) > 0
    row = {**image_meta(image), "key_id": key_id,
           "returncode": p["returncode"], "output_exists": out.exists(),
           "nonempty_payload": success, "stdout": p["stdout"], "stderr": p["stderr"]}
    if success:
        row["payload"] = payload_stats(data)
        row["payload_file"] = str(out.relative_to(ROOT))
    elif out.exists():
        out.unlink()
    return row

def main() -> None:
    if not F5:
        raise SystemExit("f5 executable not found; install github.com/0verkilll/f5/cmd/f5@v1.0.0")
    if not IMAGE_DIR.exists():
        raise SystemExit("missing image directory: " + str(IMAGE_DIR))
    images = sorted(IMAGE_DIR.glob("*.jpg"), key=lambda p: int(p.stem))
    if len(images) != 75:
        raise SystemExit(f"expected 75 original JPEGs, found {len(images)}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)
    version = run([F5, "version"], timeout=30)
    go_version = run(["go", "version"], timeout=30)

    control = positive_control(images)

    # Detector pass includes LP1 pages as controls and all 58 LP2 pages.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        detections = list(pool.map(detect_one, images))
    with (OUT_DIR / "detection.jsonl").open("w", encoding="utf-8") as f:
        for row in detections:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    # Password extraction is restricted to LP2 pages 0..57 (image files 17..74).
    lp2_images = [p for p in images if int(p.stem) >= 17]
    tasks = [(image, key_id, password)
             for image in lp2_images for key_id, password, _ in KEYS]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        extractions = list(pool.map(extract_one, tasks))
    with (OUT_DIR / "extractions.jsonl").open("w", encoding="utf-8") as f:
        for row in extractions:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    briefs = [detector_brief(d) for d in detections]
    verdict_counts = Counter(str(r["verdict"]) for r in briefs)
    successful = [r for r in extractions if r["nonempty_payload"]]
    beta_ranked = sorted(
        [r for r in briefs if isinstance(r["beta"], (int, float))],
        key=lambda r: r["beta"], reverse=True
    )
    summary = {
        "schema": "liber-primus-f5-targeted-gate-v1",
        "created_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "tool": {
            "module": "github.com/0verkilll/f5",
            "pinned_version": "v1.0.0",
            "license": "MIT",
            "binary_version": version,
            "go_version": go_version,
            "detector_mode": "f5 detect -tier none -json (statistical/structural; no neural tier)",
        },
        "corpus": {
            "image_count": len(images),
            "lp1_control_images": sum(int(p.stem) < 17 for p in images),
            "lp2_target_images": len(lp2_images),
            "lp2_file_range": ["17.jpg", "74.jpg"],
            "input_sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in images},
        },
        "source_candidate_keys": [
            {"key_id": key_id, "source_basis": note}
            for key_id, _, note in KEYS
        ],
        "positive_control": control,
        "detector": {
            "verdict_counts": dict(verdict_counts),
            "stego_detected": [r for r in briefs if str(r["verdict"]).lower() == "stego_detected"],
            "top_beta": beta_ranked[:12],
            "rows": briefs,
            "raw_jsonl": "detection.jsonl",
        },
        "extraction": {
            "attempts": len(extractions),
            "nonempty_returncode_zero": len(successful),
            "successes": successful,
            "raw_jsonl": "extractions.jsonl",
        },
    }
    (OUT_DIR / "summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(json.dumps({
        "positive_control_exact": control["round_trip_exact"],
        "images_detected": len(summary["detector"]["stego_detected"]),
        "detector_verdict_counts": dict(verdict_counts),
        "extraction_attempts": len(extractions),
        "nonempty_extractions": len(successful),
        "successful_payloads": [
            {"image": r["image"], "key_id": r["key_id"], **r.get("payload", {})}
            for r in successful
        ],
        "top_beta": beta_ranked[:8],
        "output_dir": str(OUT_DIR.relative_to(ROOT)),
    }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
