#!/usr/bin/env python3
"""Corrected p0-body screen for the original 2013 761/Twitter source streams.

The earlier pair gate used p0[0:90], which includes the 13-rune red heading.
This screen starts at the first black rune and tests only source-motivated key
symbol offsets 0 and 13. It reuses the pinned, positively gated skip decoder
and the original 2013 byte sources validated by the earlier pair SFT.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import sys
from pathlib import Path

import numpy as np
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
PAIR_PATH = ROOT / "sims/lp2_2013_761_twitter_pair_skip_sft.py"
spec = importlib.util.spec_from_file_location("lp2_2013_pair_gate", PAIR_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load the source-pinned 2013 pair gate")
pair = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pair)
base = pair.base

KEY_SYMBOL_OFFSETS = (0, 13)
SIGNS = (-1, 1)
ATBASH = (0, 1)
SCREEN_RUNES = 90


def decode(sweep, skipdecode, cipher, key, key_offset, sign, atbash, length, width):
    transformed = ((28 - cipher) % 29) if atbash else cipher
    plain = sweep.beam(transformed, key, sign, key_offset, length, width)
    if plain is None:
        raise RuntimeError("skip-aware beam returned no path")
    plain = np.asarray(plain, dtype=np.int64)
    if len(plain) != length:
        raise RuntimeError("decoder output length changed")
    check = pair.verify_reencipher_dynamic(
        cipher[:length], list(map(int, plain)), key, key_offset,
        sign, atbash, sweep.MAXSKIP
    )
    if check is None:
        raise RuntimeError("candidate does not re-encipher the original ciphertext")
    return {
        "score": float(sweep.Q.score_norm(skipdecode.idx_to_trans(plain))),
        "preview": skipdecode.idx_to_trans(plain)[:180],
        "runes": int(len(plain)),
        "key_symbol_offset": int(key_offset),
        "key_cursor": int(check[0]),
        "skips": int(sum(check[1])),
        "reencipher_verified": True,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--external-root", required=True, type=Path)
    parser.add_argument("--pad-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    sweep, skipdecode = base.load_external_decoder(args.external_root)
    corpus_path = ROOT / "resources/liber-primus/lp2-corpus.json"
    ink_path = ROOT / "resources/liber-primus/lp2-ink-annotations.json"
    corpus_bytes = corpus_path.read_bytes()
    ink_bytes = ink_path.read_bytes()
    corpus = json.loads(corpus_bytes)
    ink = json.loads(ink_bytes)

    p0 = np.asarray(corpus["pages"][0]["indices"], dtype=np.int64)
    p0_ink = next(page for page in ink["pages"] if page["page"] == 0)
    red_spans = p0_ink.get("red_spans", [])
    if len(p0) != 262 or len(red_spans) != 1:
        raise RuntimeError("unexpected original p0 structure")
    red = red_spans[0]
    if red["start"] != 0 or red["length"] != 13:
        raise RuntimeError("p0 red-heading annotation no longer selects 13 leading runes")
    if red["runes"] != "ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ":
        raise RuntimeError("p0 red-heading rune sequence changed")
    p0_body = p0[red["length"]:]
    if len(p0_body) != 249:
        raise RuntimeError("unexpected p0 black-body length")
    target = p0_body[:SCREEN_RUNES]

    native_text = (ROOT / "resources/control/shakespeare_first300k.txt").read_text()
    base.replace_prefilter_lm(sweep, native_text, sweep.gp.TRANSLIT)
    pads = pair.load_pads(args.pad_dir)

    positive_controls = []
    outputs = []
    for source_name, byte_offset, reducer, key in base.candidate_keys(pads):
        if reducer == "mod29":
            plant = np.asarray(
                base.encode_source_native(native_text[240000:244000], sweep.gp.TRANSLIT)[:240],
                dtype=np.int64
            )
            plant_cipher, skipped = base.encipher_keyskip(plant, key, 0, -1, 0.83)
            planted = sweep.beam(
                plant_cipher, key, -1, 0, 240, int(sweep.FULL_BEAM)
            )
            positive_controls.append({
                "source": source_name,
                "plant_runes": 240,
                "planted_skips": int(skipped),
                "exact_recovery": bool(
                    planted is not None and
                    np.array_equal(np.asarray(planted, dtype=np.int64), plant)
                ),
                "rune_match_fraction": (
                    float(np.mean(np.asarray(planted, dtype=np.int64) == plant))
                    if planted is not None else 0.0
                ),
            })

        for key_offset in KEY_SYMBOL_OFFSETS:
            for sign in SIGNS:
                for atbash in ATBASH:
                    screen = decode(
                        sweep, skipdecode, target, key, key_offset, sign,
                        atbash, SCREEN_RUNES, int(sweep.SCREEN_BEAM)
                    )
                    row = {
                        "source_file": source_name,
                        "source_byte_offset": int(byte_offset),
                        "byte_projection": reducer,
                        "target": "p0_black_body_first90",
                        "key_symbol_offset": int(key_offset),
                        "sign": int(sign),
                        "atbash": bool(atbash),
                        "screen": screen,
                    }
                    if screen["score"] > float(sweep.SCREEN_THR):
                        row["full_p0_body"] = decode(
                            sweep, skipdecode, p0_body, key, key_offset, sign,
                            atbash, len(p0_body), int(sweep.FULL_BEAM)
                        )
                    outputs.append(row)

    outputs.sort(key=lambda row: row["screen"]["score"], reverse=True)
    report = {
        "experiment": "corrected p0 black-body screen for 2013 761/Twitter/Gematria source keys",
        "source_artifacts": {
            name: {
                "size": len(data),
                "sha256": hashlib.sha256(data).hexdigest()
            }
            for name, data in pads.items()
        },
        "corpus_sha256": hashlib.sha256(corpus_bytes).hexdigest(),
        "ink_annotation_sha256": hashlib.sha256(ink_bytes).hexdigest(),
        "p0_source_selection": {
            "original_page_runes": int(len(p0)),
            "red_heading_start": int(red["start"]),
            "red_heading_length": int(red["length"]),
            "red_heading_runes": red["runes"],
            "first_black_rune_offset": int(red["length"]),
            "black_body_runes": int(len(p0_body)),
            "screen_runes": SCREEN_RUNES,
        },
        "candidate_operators": {
            "source_byte_offsets": [0],
            "source_files": list(pads.keys()),
            "byte_projections": list(base.REDUCERS),
            "key_symbol_offsets": list(KEY_SYMBOL_OFFSETS),
            "key_symbol_offset_rationale": "0 begins at the first black rune; 13 is the only alternative selected by the 13-rune red heading",
            "signs": list(SIGNS),
            "atbash": list(ATBASH),
            "key_prefix_symbols": int(base.KEY_LENGTH),
            "screen_beam": int(sweep.SCREEN_BEAM),
            "full_beam": int(sweep.FULL_BEAM),
            "screen_threshold": float(sweep.SCREEN_THR),
            "full_confirmation_threshold": float(sweep.CONF_THR),
            "skip_model": "pinned Campaign XVIII key-skip decoder; every proposed path independently re-enciphered",
        },
        "candidate_count": len(outputs),
        "positive_controls": positive_controls,
        "positive_controls_exact": sum(x["exact_recovery"] for x in positive_controls),
        "screen_survivors": sum(
            row["screen"]["score"] > float(sweep.SCREEN_THR) for row in outputs
        ),
        "full_p0_body_confirmed": [
            row for row in outputs
            if row.get("full_p0_body", {}).get("score", -99.0) > float(sweep.CONF_THR)
        ],
        "top_ranked": outputs[:36],
        "reclassification_of_previous_report": {
            "previous_run": "43795836572",
            "previous_p0_target": "p0[0:90], which includes the 13 leading red runes",
            "previous_p0_rows": 36,
            "previous_p0_rows_valid_as_ciphertext": 0,
            "previous_p54_p55_rows": 36,
            "previous_p54_p55_result": "valid finite negative under the prior independent-reset screen",
        },
        "scope_limits": [
            "no arbitrary byte offsets",
            "no arbitrary key symbol offsets beyond 0 and the source-selected 13",
            "no full-book continuous key clock",
            "no inferred page/chapter phase fitting",
            "no alternative cipher families",
            "English scoring is a screening instrument, not proof that all possible plaintext languages are absent",
        ],
        "no_plaintext_claim": True,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        tmp = args.output.with_suffix(args.output.suffix + ".tmp")
        tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        os.replace(tmp, args.output)

    print("P0_BODY_SCREEN " + json.dumps({
        "candidates": len(outputs),
        "positive_controls": positive_controls,
        "screen_survivors": report["screen_survivors"],
        "top": [
            {
                "source_file": row["source_file"],
                "byte_projection": row["byte_projection"],
                "key_symbol_offset": row["key_symbol_offset"],
                "sign": row["sign"],
                "atbash": row["atbash"],
                "score": row["screen"]["score"],
                "preview": row["screen"]["preview"],
                "full_p0_body": row.get("full_p0_body"),
            }
            for row in outputs[:12]
        ],
        "full_p0_body_confirmed": len(report["full_p0_body_confirmed"]),
        "report_path": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
