#!/usr/bin/env python3
"""Screen original 2013 761.MP3/Twitter/Gematria bytes as GP29 key material.

This reuses the pinned Campaign XVIII skip-aware decoder and the existing
source-native positive controls. Only original byte offset zero is used.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import sys
from pathlib import Path

from filelock import FileLock

SOURCES = {
    "761.mp3": {
        "size": 4010732,
        "sha256": "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460",
    },
    "twitter.bin": {
        "size": 64167,
        "sha256": "defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776",
    },
    "gematria.jpg": {
        "size": 64167,
        "sha256": "d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d",
    },
}
SOURCE_OFFSETS = (("761.mp3", 0), ("twitter.bin", 0), ("gematria.jpg", 0))

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
BASE_PATH = Path(__file__).resolve().parent / "lp2_2013_cicadaos_authored_offset_skip_sft.py"
spec = importlib.util.spec_from_file_location("authored_skip_gate", BASE_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load shared authored-offset skip-aware gate")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

# Keep the established source-native decoder, projections, signs, Atbash,
# beam widths, thresholds, and positive-control implementation unchanged.
base.SOURCE_OFFSETS = SOURCE_OFFSETS
base.BYTE_WINDOW = 8192
base.KEY_LENGTH = 4096


def load_pads(pad_dir: Path) -> dict[str, bytes]:
    pads: dict[str, bytes] = {}
    for name, expected in SOURCES.items():
        data = (pad_dir / name).read_bytes()
        if len(data) != expected["size"]:
            raise RuntimeError(f"{name}: size {len(data)} != {expected['size']}")
        digest = hashlib.sha256(data).hexdigest()
        if digest != expected["sha256"]:
            raise RuntimeError(f"{name}: SHA256 mismatch {digest}")
        pads[name] = data
        print(json.dumps({
            "source": name,
            "size": len(data),
            "sha256": digest,
            "role": {
                "761.mp3": "original 2013 audio operand; ID3 prefix retained",
                "twitter.bin": "original 2013 offset-reassembled Twitter byte stream",
                "gematria.jpg": "original 2013 JPEG output of twitter.bin XOR 761.mp3",
            }[name],
        }))

    expected_jpeg = bytes(a ^ b for a, b in zip(pads["761.mp3"], pads["twitter.bin"]))
    if expected_jpeg != pads["gematria.jpg"]:
        raise RuntimeError("gematria.jpg is not the source-defined offset-zero XOR product")
    return pads


base.load_pads = load_pads


def main() -> None:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--output", required=True, type=Path)
    args, _ = parser.parse_known_args()

    # base.main() parses the same CLI and performs the 72 bounded source models.
    base.main()

    report = json.loads(args.output.read_text(encoding="utf-8"))
    report["description"] = (
        "Source-pinned 2013 761.MP3, twitter.bin, and XOR-derived gematria.jpg "
        "screened as GP29 keys under the Campaign XVIII skip-aware decoder"
    )
    report["source_offset_reference"] = (
        "neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3 "
        "2013/003-twitter/README.md and xor.py; "
        "rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023 2013/02/761.MP3"
    )
    report["source_artifact_roles"] = {
        "761.mp3": (
            "Original 4,010,732-byte 2013 audio source. The historical Twitter XOR "
            "uses byte offset zero, including the 206-byte ID3 tag."
        ),
        "twitter.bin": (
            "Original 64,167-byte stream reconstructed from 988 offset-addressed "
            "2013 Twitter records."
        ),
        "gematria.jpg": (
            "Original 64,167-byte JPEG equal to twitter.bin XOR the first "
            "64,167 bytes of 761.mp3; the historical output contains the Gematria "
            "Primus reference table."
        ),
    }
    report["candidate_operators"]["clock"] = (
        "source byte offset 0 only; p0 and p54-p55 are independent reset screens, "
        "not a claim that the historical key resets there; no inferred phase"
    )
    report["scope"] = {
        "screen": "first 90 original runes of p0 and p54-p55",
        "key_prefix_symbols": 4096,
        "byte_window": 8192,
        "projections": ["mod29", "scaled29", "bits5-reject"],
        "signs": [-1, 1],
        "atbash": [False, True],
        "source_offsets": [0],
        "not_tested": [
            "full-book continuous key clock",
            "arbitrary byte offsets",
            "page/chapter phase fitting",
            "other cipher families",
        ],
        "decision_rule": (
            "Only promote a source candidate if it clears the existing skip-aware "
            "screen threshold and then passes a full original-page decode plus "
            "held-out source-native control."
        ),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        tmp = args.output.with_suffix(args.output.suffix + ".tmp")
        tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        os.replace(tmp, args.output)
    print("PAIR_SOURCE_METADATA " + json.dumps({
        "candidate_count": report["candidate_count"],
        "positive_exact": report["positive_exact"],
        "screen_survivors": report["screen_survivors"],
        "top_ranked": [
            {
                "source_file": x["source_file"],
                "byte_projection": x["byte_projection"],
                "target": x["target"],
                "sign": x["sign"],
                "atbash": x["atbash"],
                "score": x["screen"]["score"],
                "preview": x["screen"]["preview"],
            }
            for x in report["top_ranked"][:12]
        ],
        "full_confirmed_english": len(report["full_confirmed_english"]),
        "report_path": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
