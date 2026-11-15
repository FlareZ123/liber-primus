#!/usr/bin/env python3
"""Apply exactly the historical 2013 CicadaOS binary file offsets to original LP2.

2013 signed/participant-preserved phone messages selected DATA/560.17 offsets
617, 33461 and 77977. The first-onion signed clue XORed DATA/_560.00 at byte 0.
This test imports the source-pinned GP29 collision-skip decoder and uses those
four original byte coordinates without any inferred LP2 key address or salt.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

import numpy as np
from filelock import FileLock

from lp2_2013_binary_pad_prf_seed_gate import load_pads, reduce_bytes
from lp2_self_reliance_skip_aware_gate import (
    encode_source_native,
    encipher_keyskip,
    load_external_decoder,
    replace_prefilter_lm,
    verify_reencipher,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE_OFFSETS = (("_560.00", 0), ("560.17", 617),
                  ("560.17", 33461), ("560.17", 77977))
REDUCERS = ("mod29", "scaled29", "bits5-reject")
SIGNS = (-1, 1)
ATBASH = (0, 1)
KEY_LENGTH = 4096
BYTE_WINDOW = 8192


def candidate_keys(pads: dict[str, bytes]):
    """Use period-original byte positions; do not fit phases to LP2 ciphertext."""
    for name, byte_offset in SOURCE_OFFSETS:
        source = pads[name][byte_offset:byte_offset + BYTE_WINDOW]
        for reducer in REDUCERS:
            yield name, byte_offset, reducer, reduce_bytes(source, reducer, KEY_LENGTH)


def decode(sweep, skipdecode, cipher: np.ndarray, key: np.ndarray,
           sign: int, atbash: int, length: int, width: int):
    transformed = ((28 - cipher) % 29) if atbash else cipher
    plain = sweep.beam(transformed, key, sign, 0, length, width)
    if plain is None:
        raise AssertionError("source-pinned decoder returned no path")
    normalized = np.asarray(plain, dtype=np.int64)
    if len(normalized) != length:
        raise AssertionError("decoder output length changed")
    check = verify_reencipher(
        cipher[:length], list(map(int, plain)), key, 0, sign, atbash, sweep.MAXSKIP
    )
    if check is None:
        raise AssertionError("key-skip inverse does not re-encipher source")
    return {
        "score": float(sweep.Q.score_norm(skipdecode.idx_to_trans(plain))),
        "preview": skipdecode.idx_to_trans(plain)[:126],
        "runes": int(len(plain)),
        "key_cursor": int(check[0]),
        "skips": int(sum(check[1])),
        "reencipher_verified": True,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--external-root", required=True, type=Path)
    parser.add_argument("--pad-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    sweep, skipdecode = load_external_decoder(args.external_root)
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
    native_text = (ROOT / "resources/control/shakespeare_first300k.txt").read_text()
    replace_prefilter_lm(sweep, native_text, sweep.gp.TRANSLIT)
    pads = load_pads(args.pad_dir)

    p0 = np.asarray(corpus["pages"][0]["indices"], dtype=np.int64)
    terminal = np.asarray(
        corpus["pages"][54]["indices"] + corpus["pages"][55]["indices"],
        dtype=np.int64,
    )
    assert len(p0) == 262 and len(terminal) == 308
    controls = []
    outputs = []
    key_count = 0
    for file_name, offset, reducer, key in candidate_keys(pads):
        key_count += 1
        if reducer == "mod29":
            plant = encode_source_native(native_text[240000:244000], sweep.gp.TRANSLIT)[:240]
            cipher, skipped = encipher_keyskip(plant, key, 0, -1, 0.83)
            decoded = sweep.beam(cipher, key, -1, 0, 240, sweep.FULL_BEAM)
            exact = np.array_equal(np.asarray(decoded, dtype=np.int64), plant)
            controls.append({"source": file_name, "byte_offset": offset,
                             "plant_runes": 240, "skips": int(skipped),
                             "exact_recovery": bool(exact),
                             "rune_match_fraction": float(np.mean(
                                 np.asarray(decoded, dtype=np.int64) == plant
                             ))})

        for name, original in (("p0_full", p0), ("p54_p55", terminal)):
            for sign in SIGNS:
                for atbash in ATBASH:
                    screen = decode(
                        sweep, skipdecode, original, key, sign, atbash,
                        min(90, len(original)), int(sweep.SCREEN_BEAM)
                    )
                    row = {
                        "source_file": file_name,
                        "source_byte_offset": offset,
                        "byte_projection": reducer,
                        "target": name,
                        "sign": sign,
                        "atbash": bool(atbash),
                        "screen": screen,
                    }
                    if screen["score"] > sweep.SCREEN_THR:
                        row["full"] = decode(
                            sweep, skipdecode, original, key, sign, atbash,
                            len(original), int(sweep.FULL_BEAM)
                        )
                    outputs.append(row)

    outputs.sort(key=lambda x: x.get("full", x["screen"])["score"], reverse=True)
    report = {
        "description": "Authored 2013 CicadaOS byte-offset candidates in the 2014 LP2 collision-skip alphabet",
        "source_offsets": list(SOURCE_OFFSETS),
        "source_bytes": {
            k: {"length": len(v), "sha256": hashlib.sha256(v).hexdigest()}
            for k, v in pads.items()
        },
        "source_offset_reference": "neuroretransmit/cicada 2013/004-first-onion/README.md first-onion XOR and 2013/006-third-onion/README.md signed phone offsets",
        "original_targets": {"p0_full": 262, "p54_p55": 308},
        "candidate_operators": {
            "byte_projections": REDUCERS, "signs": SIGNS, "atbash": ATBASH,
            "key_symbols": KEY_LENGTH, "clock": "independent reset at original selected file byte positions",
            "screen_threshold": sweep.SCREEN_THR, "full_threshold": sweep.CONF_THR,
            "screen_beam": sweep.SCREEN_BEAM, "full_beam": sweep.FULL_BEAM,
        },
        "candidate_count": len(outputs),
        "positive": controls,
        "positive_exact": sum(bool(x["exact_recovery"]) for x in controls),
        "screen_survivors": sum("full" in x for x in outputs),
        "full_confirmed_english": [x for x in outputs if x.get("full", {}).get("score", -99.0) > sweep.CONF_THR],
        "top_ranked": outputs[:32],
        "no_plaintext_claim": True,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        tmp = args.output.with_suffix(args.output.suffix + ".tmp")
        tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        os.replace(tmp, args.output)
    print("AUTHORED_OFFSETS_REPORT " + json.dumps({
        "candidates": len(outputs), "positive": controls,
        "screen_survivors": report["screen_survivors"],
        "top": [{k: v for k, v in row.items() if k != "screen"}
                | {"screen_score": row["screen"]["score"],
                   "screen_preview": row["screen"]["preview"]}
                for row in outputs[:10]],
        "full_confirmed_english": report["full_confirmed_english"][:10],
        "report_path": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
