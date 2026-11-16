#!/usr/bin/env python3
"""Authentic 2013 XOR-pair operands interpreted as positional BASE29 GP29 key digits.

The source conversion rule (positional BASE29) existed in the signed 2013
Cicada arithmetic example, unlike the bytewise mod29/rejection projections.
Use precisely the historically XOR-selected initial 64167 bytes for all three
source operands; never fit a file offset or key phase to LP2 ciphertext.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path

import numpy as np
from filelock import FileLock

import lp2_2013_761_twitter_pair_skip_sft as source

ROOT = Path(__file__).resolve().parents[1]
BYTE_LENGTH = 64167
KEY_LENGTH = 4096
SOURCE_NAMES = ("761.mp3", "twitter.bin", "gematria.jpg")


def source_positional_base29_prefix(data: bytes, key_length: int) -> tuple[np.ndarray, int]:
    """Most significant GP29 digits of one unsigned big-endian source byte integer."""
    number = int.from_bytes(data, "big")
    if number == 0:
        raise ValueError("nonzero historical file required")
    digits = int((number.bit_length() - 1) / math.log2(29)) + 1
    power = 29 ** (digits - 1)
    while number < power:
        digits -= 1
        power //= 29
    while number >= 29 * power:
        digits += 1
        power *= 29
    if digits < key_length:
        raise ValueError("file too short for original-key screen")
    head = number // (29 ** (digits - key_length))
    out = np.empty(key_length, dtype=np.int64)
    for index in range(key_length - 1, -1, -1):
        head, remainder = divmod(head, 29)
        out[index] = remainder
    if head != 0:
        raise AssertionError("BASE29 extraction left unconsumed leading digits")
    return out, digits


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--external-root", required=True, type=Path)
    parser.add_argument("--pad-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    sweep, skipdecode = source.load_external_decoder_with_independent_wrong_key(
        args.external_root
    )
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
    native_text = (ROOT / "resources/control/shakespeare_first300k.txt").read_text()
    source.base.replace_prefilter_lm(sweep, native_text, sweep.gp.TRANSLIT)
    pad_bytes = source.load_pads(args.pad_dir)

    p0 = np.asarray(corpus["pages"][0]["indices"], dtype=np.int64)
    terminal = np.asarray(
        corpus["pages"][54]["indices"] + corpus["pages"][55]["indices"], dtype=np.int64
    )
    if len(p0) != 262 or len(terminal) != 308:
        raise AssertionError("canonical original physical page geometry changed")
    plant = source.base.encode_source_native(
        native_text[240000:244000], sweep.gp.TRANSLIT
    )[:240]
    if len(plant) != 240:
        raise AssertionError("source-native plant is not 240 GP29 runes")

    outputs = []
    controls = []
    origin = []
    for name in SOURCE_NAMES:
        fixed_data = pad_bytes[name][:BYTE_LENGTH]
        if len(fixed_data) != BYTE_LENGTH:
            raise AssertionError("historical source XOR operand length differs")
        key, digit_length = source_positional_base29_prefix(fixed_data, KEY_LENGTH)
        if np.any(key < 0) or np.any(key > 28):
            raise AssertionError("BASE29 key digit out of range")
        # Round-trip the 4096 leading digits to the original prefix integer.
        head = int.from_bytes(fixed_data, "big") // (
            29 ** (digit_length - KEY_LENGTH)
        )
        reencoded = 0
        for k in key:
            reencoded = reencoded * 29 + int(k)
        if reencoded != head:
            raise AssertionError("BASE29 projection failed independent integer reencoding")
        origin.append({
            "name": name, "selected_source_bytes": BYTE_LENGTH,
            "source_prefix_sha256": hashlib.sha256(fixed_data).hexdigest(),
            "positional_base29_total_digits": digit_length,
            "key_first_20": [int(x) for x in key[:20]],
        })
        cipher, skipped = source.base.encipher_keyskip(plant, key, 0, -1, 0.83)
        predicted = sweep.beam(
            cipher, key, -1, 0, 240, int(sweep.FULL_BEAM)
        )
        predicted = np.asarray(predicted, dtype=np.int64)
        if len(predicted) != 240:
            raise AssertionError("native-source inverse truncated 240-rune plant")
        check = source.verify_reencipher_dynamic(
            cipher, predicted, key, 0, -1, False, sweep.MAXSKIP
        )
        if check is None:
            raise AssertionError("source-native positive cannot re-encipher")
        controls.append({
            "source": name, "plant_runes": 240, "skipped_key_draws": int(skipped),
            "exact": bool(np.array_equal(predicted, plant)),
            "fraction": float(np.mean(predicted == plant)),
            "path_verified": True,
        })
        for page_label, original in (("p0_first90", p0), ("p54p55_first90", terminal)):
            for sign in (-1, 1):
                for atbash in (False, True):
                    result = source.base.decode(
                        sweep, skipdecode, original, key,
                        sign, int(atbash), 90, int(sweep.SCREEN_BEAM)
                    )
                    row = {
                        "source": name, "register": "positional-base29-leading",
                        "original": page_label, "sign": sign,
                        "atbash": atbash, "screen": result
                    }
                    if result["score"] > sweep.SCREEN_THR:
                        row["full"] = source.base.decode(
                            sweep, skipdecode, original, key,
                            sign, int(atbash), len(original), int(sweep.FULL_BEAM)
                        )
                    outputs.append(row)
    outputs.sort(key=lambda row: row.get("full", row["screen"])["score"], reverse=True)
    report = {
        "interpretation": (
            "Whole 64167-byte historical 2013 XOR-selected operand interpreted as "
            "one unsigned big-endian integer, emitted in positional base29; "
            "first 4096 most-significant rune digits are the GP29 key at phase zero."
        ),
        "historical_premise": (
            "Signed 2013 positional BASE29 numerical encoding and authentic "
            "2013 761.MP3[:64167] XOR twitter.bin == gematria.jpg byte operation; "
            "transfer to LP2 is a hypothesis, not an original Cicada instruction."
        ),
        "source": origin,
        "target": "unaltered original first90 p0 and first90 p54+p55",
        "model": "same pinned Campaign XVIII 0..3 legal skip beam",
        "candidate_count": len(outputs), "predeclared_stage1_cutoff": sweep.SCREEN_THR,
        "stage1_hits": sum("full" in x for x in outputs),
        "stage2_hits": sum(x.get("full", {}).get("score", -1e9) > sweep.CONF_THR for x in outputs),
        "control": controls, "top_ranked": outputs[:24],
        "no_plaintext_claim": True,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        tmp = args.output.with_suffix(args.output.suffix + ".tmp")
        tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        os.replace(tmp, args.output)
    print("POSITIONAL_BASE29_SOURCE_REPORT " + json.dumps({
        "candidate_count": report["candidate_count"],
        "control": controls,
        "stage1_hits": report["stage1_hits"], "stage2_hits": report["stage2_hits"],
        "source_prefix_and_key": origin,
        "top": [{
            "source": x["source"], "target": x["original"],
            "sign": x["sign"], "atbash": x["atbash"],
            "score": x.get("full", x["screen"])["score"],
            "preview": x.get("full", x["screen"])["preview"],
        } for x in outputs[:10]],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
