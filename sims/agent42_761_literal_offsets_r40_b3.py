#!/usr/bin/env python3
"""Exact four-offset R40-B3 test for the original 761.MP3.

This deliberately overrides only the offset selector. The R40-B3 pad builders,
12-register screen, signs, keyskip1/keyskip2 decoder, and thresholds are imported
unchanged from the pinned Dukotah/cicada3301 revision.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

AUDIO_BYTES = 4_010_732
AUDIO_GIT_BLOB_SHA1 = "7e2bd299fbc7b96283219cf15e2904641daf631f"
AUDIO_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"
OFFSETS = (761, 1031, 1229, 1259)  # zero-based byte offsets into the complete MP3
BUILDERS = ("mod29", "prime_to_idx", "hi_nibble", "lo_nibble", "byte_scaled")


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def jsonable(value):
    if isinstance(value, dict):
        return {str(k): jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [jsonable(v) for v in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    return value


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dukotah-root", required=True, type=Path)
    ap.add_argument("--mp3", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    args = ap.parse_args()

    audio = args.mp3.read_bytes()
    source = {
        "url": "https://github.com/krisyotam/cicada3301/blob/b4ed6ec95d67c88d8f6f1a34b5f4d36c4c80d37c/puzzles/2013/cicada-os/AUDIO/761.MP3",
        "bytes": len(audio),
        "git_blob_sha1": git_blob_sha1(audio),
        "sha256": hashlib.sha256(audio).hexdigest(),
    }
    assert source["bytes"] == AUDIO_BYTES, source
    assert source["git_blob_sha1"] == AUDIO_GIT_BLOB_SHA1, source
    assert source["sha256"] == AUDIO_SHA256, source

    b3dir = args.dukotah_root / "liber-primus/analysis/round40/B3-english-era-grids"
    assert b3dir.is_dir(), b3dir
    sys.path.insert(0, str(b3dir))
    import pads as P  # noqa: E402
    import engine as E  # noqa: E402

    # The original offset_set also adds 0..7 and a sampled ladder. Replace it
    # with the four literal source-derived byte offsets, and nothing else.
    P.offset_set = lambda n_off, cap, ladder, extra: np.array(
        [o for o in OFFSETS if 0 <= o < n_off], dtype=np.int64
    )

    args.out.mkdir(parents=True, exist_ok=True)
    G = P.PadGrid(
        "761_LITERAL_FOUR",
        {"761.mp3": str(args.mp3)},
        list(BUILDERS),
        cap=len(OFFSETS),
        ladder=[],
        extra_by_pad={},
    )
    planned, per_cell = G.planned()
    assert len(G.cells) == 10, G.cells
    assert planned == 40, (planned, per_cell)
    assert all(v[0] == 4 for v in per_cell.values()), per_cell

    # Exact 12-register prefilter scores, before thresholding, for each
    # reduction × direction × literal offset × sign × keyskip relation.
    C24 = np.asarray(E.U[: E.M], dtype=np.int32)
    score_rows = []
    survivor_map = {}
    batches = 0
    for bt in G.batches():
        batches += 1
        K28 = bt["K28"]
        metas = bt["metas"]
        masks = E.screen_cols(K28, C24, atbs=G.atbs)
        for sign in (-1, 1):
            Ke = K28 if sign == -1 else ((-K28.astype(np.int16)) % 29).astype(np.int8)
            by_a = {}
            for a in (1, 2):
                R = E.pf.dp_regs(
                    C24,
                    Ke[: E.M + a * E.K_SK],
                    E.K_SK,
                    a,
                    E.PEN[a],
                    ms=(E.M,),
                    chunk=E.SCREEN_CHUNK,
                )
                vals = np.asarray(E.pf.lse_from_regs(R[E.M], E.M), dtype=float).reshape(-1)
                assert len(vals) == len(metas), (vals.shape, len(metas))
                by_a[a] = vals

            expected_union = (
                (by_a[1] > float(E.THR["a1"]))
                | (by_a[2] > float(E.THR["a2"]))
            )
            assert np.array_equal(expected_union, masks[(0, sign)]), (
                "independent score reconstruction disagrees with engine screen",
                bt["group"],
                sign,
            )

            for j, meta in enumerate(metas):
                key = (meta["pad"], meta["b"], meta["dir"], int(meta["off"]), sign)
                survivor_map[key] = {
                    "meta": dict(meta),
                    "sign": sign,
                    "union_pass": bool(expected_union[j]),
                }
                for a, relation in ((1, "keyskip1"), (2, "keyskip2")):
                    threshold = float(E.THR["a%d" % a])
                    score_rows.append(
                        {
                            **meta,
                            "sign": sign,
                            "relation": relation,
                            "screen_score": float(by_a[a][j]),
                            "threshold": threshold,
                            "pass": bool(by_a[a][j] > threshold),
                            "union_pass": bool(expected_union[j]),
                        }
                    )

    assert batches == 10, batches
    expected_survivors = sum(x["union_pass"] for x in survivor_map.values())

    # Run the unchanged R40-B3 screen + L=120 decode path over exactly these
    # candidates. Redirect only its output files into the requested artifact dir.
    E.F = lambda name: str(args.out / name)
    store = E.Store(
        "761_literal_offsets",
        key_space={
            "source": "original 761.MP3",
            "offset_convention": "zero-based byte offsets into complete MP3",
            "offsets": list(OFFSETS),
            "builders": list(BUILDERS),
            "directions": ["fwd", "rev"],
            "signs": [-1, 1],
            "relations": list(E.RELS),
            "panel_registers": list(E.PAN.registers),
            "atbs": list(G.atbs),
        },
    )
    E.run_grid(G, store)
    store.close()
    summary_path = args.out / "summary_761_literal_offsets.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    assert summary["complete"] is True, summary
    assert summary["screened"] == 80, summary
    assert summary["survivors"] == expected_survivors, (summary["survivors"], expected_survivors)

    # If any candidate passes the frozen 12-register screen, apply the
    # pre-existing L=120/L=240 panel_max planted bars to both decoder relations.
    bars = {
        rel: {
            "L120": float(E.bar(E.N_DECL, 120, rel)),
            "L240": float(E.bar(E.N_DECL, 240, rel)),
        }
        for rel in E.RELS
    }
    control_data = json.loads(
        (b3dir / "control_COSPAD.json").read_text(encoding="utf-8")
    )
    for rel in E.RELS:
        for length in ("L120", "L240"):
            assert abs(
                float(control_data["bars_declared_N1e6"][rel][length]) - bars[rel][length]
            ) < 1e-12
    assert all(control_data["register_licensed"].values()), control_data["register_licensed"]
    assert all(control_data["gate_cells_ge3"].values()), control_data["gate_cells_ge3"]
    decoder_rows = []
    for item in survivor_map.values():
        if not item["union_pass"]:
            continue
        meta = item["meta"]
        sign = item["sign"]
        Kfull = G.keyfull(meta)
        C120, K120 = E.apply_variant(E.U[:120], Kfull, 0, sign)
        C240, K240 = E.apply_variant(E.U[:240], Kfull, 0, sign)
        for rel in E.RELS:
            _, a120 = E.v3dec(C120, K120, rel)
            _, a240 = E.v3dec(C240, K240, rel)
            p120 = float(a120["pmax"])
            p240 = float(a240["pmax"])
            decoder_rows.append(
                {
                    **meta,
                    "sign": sign,
                    "relation": rel,
                    "pmax120": p120,
                    "pmax240": p240,
                    "register120": E.PAN.registers[a120["preg"]],
                    "register240": E.PAN.registers[a240["preg"]],
                    "bar120": bars[rel]["L120"],
                    "bar240": bars[rel]["L240"],
                    "pass120": p120 >= bars[rel]["L120"],
                    "pass240": p240 >= bars[rel]["L240"],
                    "pass_both": p120 >= bars[rel]["L120"] and p240 >= bars[rel]["L240"],
                }
            )

    grouped = defaultdict(list)
    for row in score_rows:
        grouped[(row["b"], row["dir"], row["sign"], row["relation"])].append(row)
    maxima = []
    for (builder, direction, sign, relation), rows in sorted(grouped.items()):
        best = max(rows, key=lambda r: r["screen_score"])
        maxima.append(
            {
                "builder": builder,
                "direction": direction,
                "sign": sign,
                "relation": relation,
                "max_screen_score": best["screen_score"],
                "offset": best["off"],
                "threshold": best["threshold"],
                "passes": best["pass"],
            }
        )

    # Record the exact p0 head and the unchanged frozen panel/thresholds.
    target = {
        "ciphertext_source": "Dukotah/cicada3301 round37/I2-pfv4-12reg/sweep.py U",
        "U_length": len(E.U),
        "U_head24": [int(x) for x in E.U[:24]],
        "U_head120_sha256": hashlib.sha256(bytes(int(x) for x in E.U[:120])).hexdigest(),
        "panel_registers": list(E.PAN.registers),
        "M": int(E.M),
        "K_SK": int(E.K_SK),
        "prefilter_thresholds": jsonable(E.THR),
        "decoder_bars_N_DECL_1e6": bars,
    }
    result = {
        "source": source,
        "external_repo": {
            "repository": "Dukotah/cicada3301",
            "commit": "4aba4c5d43ec48c4b2e913bb7dc080ba7b6dd2e9",
            "pipeline": "liber-primus/analysis/round40/B3-english-era-grids",
        },
        "search": {
            "offsets_zero_based": list(OFFSETS),
            "builders": list(BUILDERS),
            "directions": ["fwd", "rev"],
            "signs": [-1, 1],
            "relations": list(E.RELS),
            "atbs": list(G.atbs),
            "cells": len(G.cells),
            "offsets_per_cell": 4,
            "planned_candidates": planned,
            "screened_sign_candidates": int(summary["screened"]),
            "prefilter_survivors": int(summary["survivors"]),
            "batches": batches,
        },
        "target": target,
        "existing_control_COSPAD": {
            "date": control_data["date"],
            "grid": control_data["grid"],
            "plants_per_register_rel": control_data["plants_per_register_rel"],
            "pooled_by_register_skip": control_data["pooled_by_register_skip"],
            "per_rel": control_data["per_rel"],
            "gate_cells_ge3": control_data["gate_cells_ge3"],
            "register_licensed": control_data["register_licensed"],
            "decoy_fpr": control_data["decoy_fpr"],
            "bars_declared_N1e6": control_data["bars_declared_N1e6"],
        },
        "maxima_by_builder_direction_sign_relation": maxima,
        "score_rows": score_rows,
        "decoder_rows_for_prefilter_survivors": decoder_rows,
        "r40_b3_run_grid_summary": summary,
        "decision": {
            "survivors": int(summary["survivors"]),
            "decoder_passes": sum(bool(x["pass_both"]) for x in decoder_rows),
            "note": "Only the four literal offsets were tested; no sampled ladder, dense scan, or +/-1 offset variants were added.",
        },
    }
    (args.out / "results.json").write_text(json.dumps(jsonable(result), indent=2), encoding="utf-8")
    (args.out / "screen_maxima.json").write_text(json.dumps(jsonable(maxima), indent=2), encoding="utf-8")
    print(json.dumps(result["search"], indent=2))
    print("PREFILTER THRESHOLDS:", json.dumps(jsonable(E.THR), sort_keys=True))
    print("DECODER BARS:", json.dumps(bars, sort_keys=True))
    print("MAXIMA:", json.dumps(maxima, indent=2))
    print("SURVIVORS:", json.dumps(decoder_rows, indent=2))
    print("SUMMARY:", json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
