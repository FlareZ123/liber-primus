#!/usr/bin/env python3
"""Fixed p57/2013-761 source-motivated byte-offset gate under the pinned R40-B3 instrument.

This is a small, preregistered test of four exact offsets, not a general offset sweep.
The original MP3 is used whole (including ID3); offsets are zero-based byte positions.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import random
import sys

import numpy as np

OFFSETS = (761, 1031, 1229, 1259)
BUILDERS = ("mod29", "prime_to_idx", "hi_nibble", "lo_nibble", "byte_scaled")
DIRECTIONS = ("fwd", "rev")
SIGNS = (-1, 1)
RELATIONS = ("keyskip1", "keyskip2")
SOURCE_BYTES = 4_010_732
SOURCE_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"
EXTERNAL_COMMIT = "f63501d8f2d835b80c30230eb89a1110fb9197d2"
AUDIO_COMMIT = "f2267b0c2f1e1d2662806b90b9c3a2953b3a7023"


def load_instrument(external_lp: pathlib.Path):
    b3_dir = external_lp / "analysis" / "round40" / "B3-english-era-grids"
    if not (b3_dir / "engine.py").is_file():
        raise FileNotFoundError(b3_dir / "engine.py")
    sys.path.insert(0, str(b3_dir))
    import engine as E  # noqa: E402
    import pads as P  # noqa: E402
    return E, P, b3_dir


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--external-root", required=True, help="Pinned external liber-primus directory")
    ap.add_argument("--audio", required=True, help="Pinned original 761.MP3")
    ap.add_argument("--output", required=True, help="JSON report path")
    args = ap.parse_args()

    external_lp = pathlib.Path(args.external_root).resolve()
    audio_path = pathlib.Path(args.audio).resolve()
    output_path = pathlib.Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    audio = audio_path.read_bytes()
    audio_sha = hashlib.sha256(audio).hexdigest()
    if len(audio) != SOURCE_BYTES or audio_sha != SOURCE_SHA256:
        raise RuntimeError(
            "Original 761.MP3 pin mismatch: bytes=%d sha256=%s" % (len(audio), audio_sha)
        )

    E, P, b3_dir = load_instrument(external_lp)
    if len(E.PAN.registers) != 12:
        raise RuntimeError("Expected the pinned 12-register panel")
    if len(E.U) < 240:
        raise RuntimeError("LP2 unknown stream is shorter than the 240-rune gate")

    # Replace R40-B3's sampled offset set with exactly the four frozen offsets.
    # The same PadGrid builders, byte windows, direction handling and engine remain intact.
    def exact_offset_set(n_off, cap, ladder, extra):
        return np.asarray(
            sorted({int(x) for x in extra if 0 <= int(x) < n_off}),
            dtype=np.int64,
        )

    P.offset_set = exact_offset_set
    grid = P.PadGrid(
        "COSPAD-761-PARABLE-EXACT",
        {"761.mp3": str(audio_path)},
        list(BUILDERS),
        cap=1,
        ladder=[],
        extra_by_pad={"761.mp3": list(OFFSETS)},
    )
    planned, per_cell = grid.planned()
    expected = len(BUILDERS) * len(DIRECTIONS) * len(OFFSETS)
    if planned != expected or planned != 40:
        raise RuntimeError("Exact offset grid mismatch: planned=%d expected=%d" % (planned, expected))

    metas = []
    for pad, builder, direction in grid.cells:
        n_off = grid.symlen(pad, builder, direction) - P.NEEDROOM
        for offset in OFFSETS:
            if offset >= n_off:
                raise RuntimeError("Offset outside usable byte range: %d" % offset)
            metas.append({"pad": pad, "b": builder, "dir": direction, "off": offset})
    if len(metas) != 40:
        raise RuntimeError("Expected 40 exact key streams, got %d" % len(metas))

    # Reuse the exact R40-B3 source-positive encoders for two sanity plants per offset:
    # one keyskip1 and one keyskip2. These are controls, not candidate plaintext.
    controls = []
    rng = random.Random(0x76110311229)
    reg = "EN_MODERN"
    plain_source = np.asarray(E.TEST[reg], dtype=np.int64)
    for offset in OFFSETS:
        meta = {"pad": "761.mp3", "b": "mod29", "dir": "fwd", "off": offset}
        key_full = grid.keyfull(meta)
        for rel, sign in (("keyskip1", -1), ("keyskip2", 1)):
            key = key_full if sign == -1 else [(-int(k)) % 29 for k in key_full]
            encoder = E.C1.enc_exact if rel == "keyskip1" else E.C1.enc_pair
            plant = None
            for _ in range(800):
                start = rng.randrange(0, len(plain_source) - 300)
                plain = plain_source[start:start + 240].tolist()
                enc_seed = rng.randrange(1, 10**9)
                candidate = list(encoder(plain, key, seed=enc_seed)[:240])
                if len(candidate) == 240 and not any(
                    candidate[i] == candidate[i + 1] for i in range(39)
                ):
                    plant = (plain, candidate, enc_seed)
                    break
            if plant is None:
                raise RuntimeError("Could not construct source-positive control at offset %d" % offset)
            plain, cipher, enc_seed = plant
            K28 = np.asarray(key_full[:28], dtype=np.int8).reshape(28, 1)
            masks = E.screen_cols(K28, np.asarray(cipher[:24], dtype=np.int32), atbs=(0,))
            screen_pass = bool(masks[(0, sign)][0])
            d120, a120 = E.v3dec(cipher[:120], key, rel)
            d240, a240 = E.v3dec(cipher[:240], key, rel)
            recovery = float(E.B2.recovery(d240["plain_idx"], plain))
            b120 = float(E.bar(E.N_DECL, 120, rel))
            b240 = float(E.bar(E.N_DECL, 240, rel))
            passed = (
                screen_pass
                and float(a120["pmax"]) >= b120
                and float(a240["pmax"]) >= b240
                and recovery >= 0.90
            )
            controls.append({
                "offset": offset,
                "builder": "mod29",
                "direction": "fwd",
                "relation": rel,
                "sign": sign,
                "register": reg,
                "encoder_seed": enc_seed,
                "screen_pass": screen_pass,
                "pmax120": float(a120["pmax"]),
                "pmax240": float(a240["pmax"]),
                "recovery240": recovery,
                "bar120_N1e6": b120,
                "bar240_N1e6": b240,
                "pass": passed,
            })
    if len(controls) != 8 or not all(x["pass"] for x in controls):
        raise RuntimeError("Source-positive exact-offset controls failed; real-cipher result is inconclusive")

    C24 = np.asarray(E.U[:24], dtype=np.int32)
    C120 = list(E.U[:120])
    C240 = list(E.U[:240])
    n_per_relation = len(metas) * len(SIGNS)
    bars = {
        rel: {
            "L120_N80": float(E.bar(n_per_relation, 120, rel)),
            "L240_N80": float(E.bar(n_per_relation, 240, rel)),
            "L120_N1e6": float(E.bar(E.N_DECL, 120, rel)),
            "L240_N1e6": float(E.bar(E.N_DECL, 240, rel)),
        }
        for rel in RELATIONS
    }

    rows = []
    for meta in metas:
        key_full = grid.keyfull(meta)
        K28 = np.asarray(key_full[:28], dtype=np.int8).reshape(28, 1)
        masks = E.screen_cols(K28, C24, atbs=(0,))
        for sign in SIGNS:
            screen_pass = bool(masks[(0, sign)][0])
            key = key_full if sign == -1 else [(-int(k)) % 29 for k in key_full]
            for rel in RELATIONS:
                d120, a120 = E.v3dec(C120, key, rel)
                d240, a240 = E.v3dec(C240, key, rel)
                p120 = float(a120["pmax"])
                p240 = float(a240["pmax"])
                row = {
                    "offset_zero_based": int(meta["off"]),
                    "builder": meta["b"],
                    "direction": meta["dir"],
                    "sign": sign,
                    "relation": rel,
                    "prefilter_pass": screen_pass,
                    "pmax120": p120,
                    "register120": E.PAN.registers[int(a120["preg"])],
                    "degenerate120": bool(a120.get("degenerate", False)),
                    "pmax240": p240,
                    "register240": E.PAN.registers[int(a240["preg"])],
                    "degenerate240": bool(a240.get("degenerate", False)),
                    "bar120_N80": bars[rel]["L120_N80"],
                    "bar240_N80": bars[rel]["L240_N80"],
                    "bar120_N1e6": bars[rel]["L120_N1e6"],
                    "bar240_N1e6": bars[rel]["L240_N1e6"],
                    "clears_actualN_both": (
                        p120 >= bars[rel]["L120_N80"]
                        and p240 >= bars[rel]["L240_N80"]
                    ),
                    "clears_N1e6_both": (
                        p120 >= bars[rel]["L120_N1e6"]
                        and p240 >= bars[rel]["L240_N1e6"]
                    ),
                    "screen_false_negative_at_N1e6": (
                        p120 >= bars[rel]["L120_N1e6"] and not screen_pass
                    ),
                }
                rows.append(row)

    rows.sort(key=lambda x: (x["relation"], -x["pmax120"], -x["pmax240"]))
    best = {}
    for rel in RELATIONS:
        rel_rows = [x for x in rows if x["relation"] == rel]
        best[rel] = {
            "n_decoded": len(rel_rows),
            "best_L120": max(rel_rows, key=lambda x: x["pmax120"]),
            "best_L240": max(rel_rows, key=lambda x: x["pmax240"]),
            "screen_passes": sum(1 for x in rel_rows if x["prefilter_pass"]),
            "actualN_both_passes": sum(1 for x in rel_rows if x["clears_actualN_both"]),
            "N1e6_both_passes": sum(1 for x in rel_rows if x["clears_N1e6_both"]),
            "screen_false_negatives": sum(
                1 for x in rel_rows if x["screen_false_negative_at_N1e6"]
            ),
        }

    report = {
        "status": "completed",
        "classification": "source-motivated exact-offset hypothesis; not an authenticated key",
        "selector": {
            "offsets_zero_based_full_file": list(OFFSETS),
            "interpretation": (
                "761 is the original 2013 audio filename/title GP-prime sum; "
                "1031, 1229 and 1259 are the three reported GP-prime sums of the solved p57 parable clauses"
            ),
            "offset_convention": "zero-based byte positions in the complete MP3, including ID3",
            "one_based_variants": "not tested; not added to avoid post-hoc expansion",
        },
        "source": {
            "url": "https://github.com/rtkd/iddqd/blob/" + AUDIO_COMMIT + "/2013/02/761.MP3",
            "commit": AUDIO_COMMIT,
            "bytes": len(audio),
            "sha256": audio_sha,
        },
        "instrument": {
            "repository": "Dukotah/cicada3301",
            "commit": EXTERNAL_COMMIT,
            "engine": "R40-B3 engine.py + pads.py; R37-I2 frozen pf_v4_12 and beam_v3",
            "panel_registers": list(E.PAN.registers),
            "panel_sha256": E.P12_SHA,
            "null_model": "round36/B1-orbit-12reg/null12.json POT bars",
            "target": "original LP2 unknown stream U[:120] and U[:240] (p0 head), no page reset",
        },
        "family": {
            "builders": list(BUILDERS),
            "directions": list(DIRECTIONS),
            "signs": list(SIGNS),
            "relations": list(RELATIONS),
            "atbash": "not tested; R40-B3 COSPAD uses atb=0",
            "exact_key_streams": len(metas),
            "candidate_decodes_per_relation": n_per_relation,
            "planned_offset_cells": planned,
            "per_cell": per_cell,
        },
        "positive_controls": {
            "count": len(controls),
            "all_pass": all(x["pass"] for x in controls),
            "controls": controls,
        },
        "thresholds": bars,
        "best_by_relation": best,
        "flagged_N1e6": [x for x in rows if x["clears_N1e6_both"]],
        "near_miss_L120_N1e6": [
            x for x in rows
            if x["pmax120"] >= bars[x["relation"]]["L120_N1e6"]
            and x["pmax240"] < bars[x["relation"]]["L240_N1e6"]
        ],
        "top20_by_L120": sorted(rows, key=lambda x: -x["pmax120"])[:20],
        "all_rows": rows,
    }
    output_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(output_path),
        "source_sha256": audio_sha,
        "offsets": list(OFFSETS),
        "controls_passed": len(controls),
        "best_by_relation": {
            rel: {
                "pmax120": best[rel]["best_L120"]["pmax120"],
                "register120": best[rel]["best_L120"]["register120"],
                "meta": {
                    "offset": best[rel]["best_L120"]["offset_zero_based"],
                    "builder": best[rel]["best_L120"]["builder"],
                    "direction": best[rel]["best_L120"]["direction"],
                    "sign": best[rel]["best_L120"]["sign"],
                },
                "pmax240": best[rel]["best_L240"]["pmax240"],
                "N1e6_both_passes": best[rel]["N1e6_both_passes"],
                "screen_passes": best[rel]["screen_passes"],
            }
            for rel in RELATIONS
        },
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
