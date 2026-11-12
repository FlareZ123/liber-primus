#!/usr/bin/env python3
"""Source-fixed p15 -> 2013 DATA/560.13 test under Dukotah R40-B3.

The p15 nine-rune red heading, interpreted as a GP29 integer divided by
3301, fixes byte offset 8,952,964 and file stem 560. The 16 primes in p15's
4x4 spiral define a separately labelled secondary family of base+prime
starts. No offset, phase, builder, direction, sign or clock is optimized
against LP2 ciphertext.

Imports the decoder, frozen prefilter, panel and positive-control machinery
unchanged from MIT-licensed Dukotah/cicada3301 at commit
f63501d8f2d835b80c30230eb89a1110fb9197d2 (R40-B3). Tests both the complete
unknown stream from p0 and the p15-body-to-p22 section. Each window is a
continuous clock with no page or word resets. First 120/240 runes are tested
under the original R40-B3 L120 screen/L240 gate.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib
import json
import sys
import time
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_BYTES = 118_818_811
EXPECTED_SHA256 = "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
PRIMES = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(8 << 20), b""):
            h.update(block)
    return h.hexdigest()


def historical_xor_control(path: Path) -> dict[str, Any]:
    """Authentic 2013 DATA/560.13 known-plaintext and exact re-encryption control."""
    ciphertext = bytes.fromhex("28c07e1b102d4d5c4c1a376e064477e1416fcc94928765")
    expected = b"gbyh7znm6c7ezsmr.onion\n"
    with path.open("rb") as f:
        f.seek(12_821)
        pad = f.read(len(ciphertext))
    assert len(pad) == len(ciphertext)
    recovered = bytes(c ^ p for c, p in zip(ciphertext, pad))
    assert recovered == expected, recovered
    reencryption = bytes(p ^ c for p, c in zip(recovered, pad))
    assert reencryption == ciphertext
    return {
        "offset": 12_821,
        "ciphertext_hex": ciphertext.hex(),
        "plaintext_ascii": recovered.decode("ascii"),
        "exact_reencryption": reencryption == ciphertext,
    }


def corpus_inputs() -> tuple[dict[str, Any], list[int], list[int], int, int]:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    pages = {int(p["page"]): [int(x) for x in p["indices"]] for p in corpus["pages"]}
    heading = pages[15][:9]
    assert heading == [0, 1, 20, 19, 24, 28, 26, 22, 24], heading
    number = 0
    for x in heading:
        number = number * 29 + x
    quotient, remainder = divmod(number, 3301)
    assert (number, quotient, remainder) == (29_553_734_724, 8_952_964, 560)
    section11 = pages[15][9:] + [x for p in range(16, 23) for x in pages[p]]
    whole = [x for p in range(56) for x in pages[p]]
    assert len(section11) == 1_894, len(section11)
    assert len(whole) == 12_956, len(whole)
    return corpus, whole, section11, quotient, remainder


def import_r40(dukotah_root: Path):
    b3 = dukotah_root / "liber-primus/analysis/round40/B3-english-era-grids"
    assert b3.is_dir(), b3
    sys.path.insert(0, str(b3))
    engine = importlib.import_module("engine")
    pads = importlib.import_module("pads")
    return engine, pads


def make_exact_grid(P, pad_path: Path, offsets: list[int], windows: list[tuple[str, list[int]]]):
    class ExactGrid(P.PadGrid):
        def __init__(self):
            super().__init__("COSPAD", {"560.13": str(pad_path)}, P.BYTEWISE,
                             cap=1, ladder=[], extra_by_pad={})
            self.fixed_offsets = list(offsets)
            self.windows = windows

        def batches(self):
            for pad, builder, direction in self.cells:
                arr = self.arr(pad, builder, direction)
                n_off = len(arr) - P.NEEDROOM
                valid = [o for o in self.fixed_offsets if 0 <= o < n_off]
                assert len(valid) == len(self.fixed_offsets), (builder, direction, len(valid))
                offs = np.asarray(valid, dtype=np.int64)
                ar = np.arange(28, dtype=np.int64)
                k28 = np.ascontiguousarray(arr[offs[:, None] + ar[None, :]].T)
                metas = [{"pad": pad, "b": builder, "dir": direction, "off": int(o)} for o in valid]
                yield {"K28": k28, "metas": metas,
                       "Cs": [(name, text[:240]) for name, text in self.windows],
                       "group": f"COSPAD|560.13|{builder}|{direction}"}
                del arr

    return ExactGrid()


def plain_text(corpus: dict[str, Any], d: dict[str, Any]) -> str:
    table = corpus["translit"]
    values = [int(x) for x in d.get("plain_idx", [])]
    if isinstance(table, dict):
        return "".join(str(table.get(str(x), table.get(x, "?"))) for x in values)
    return "".join(str(table[x]) for x in values)


def reg_name(E, a: dict[str, Any]) -> str:
    try:
        return str(E.PAN.registers[int(a["preg"])])
    except Exception:
        return str(a.get("preg"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pad", required=True, type=Path)
    ap.add_argument("--dukotah-root", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    args = ap.parse_args()
    t0 = time.time()

    assert args.pad.is_file(), args.pad
    assert args.pad.stat().st_size == EXPECTED_BYTES, args.pad.stat().st_size
    pad_hash = file_sha256(args.pad)
    assert pad_hash == EXPECTED_SHA256, pad_hash
    historical_control = historical_xor_control(args.pad)

    corpus, whole, section11, offset, remainder = corpus_inputs()
    offsets = [offset] + [offset + p for p in PRIMES]
    assert len(offsets) == 17 and len(set(offsets)) == 17
    windows = [("whole-book-global", whole), ("p15-section11-local", section11)]

    E, P = import_r40(args.dukotah_root.resolve())
    grid = make_exact_grid(P, args.pad.resolve(), offsets, windows)
    args.out.mkdir(parents=True, exist_ok=True)

    # Same natural-rate positive controls and 512 random decoys used by R40-B3.
    control = E.control(grid, npl=10, ndecoy=512, seed=3301, regs=E.CTRL_REGS)
    control_ok = all(control["register_licensed"].values()) and all(control["gate_cells_ge3"].values())
    (args.out / "control.json").write_text(json.dumps(control, indent=2) + "\n", encoding="utf-8")
    if not control_ok:
        (args.out / "summary.json").write_text(json.dumps({
            "status": "INCONCLUSIVE_CONTROL_FAILURE", "pad_sha256": pad_hash,
            "register_licensed": control.get("register_licensed"),
            "gate_cells_ge3": control.get("gate_cells_ge3"),
        }, indent=2) + "\n", encoding="utf-8")
        return 2

    bars = {rel: {"L120": float(E.bar(E.N_DECL, 120, rel)),
                  "L240": float(E.bar(E.N_DECL, 240, rel))} for rel in E.RELS}
    totals = {name: {"tested_variants": 0, "screen_survivors": 0, "beam_decodes": 0}
              for name, _ in windows}
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for batch in grid.batches():
        k28, metas = batch["K28"], batch["metas"]
        for window_name, cfull in batch["Cs"]:
            masks = E.screen_cols(k28, cfull[:E.M], grid.atbs)
            for (atbash, sign), mask in masks.items():
                totals[window_name]["tested_variants"] += int(mask.size)
                survivors = np.nonzero(mask)[0]
                totals[window_name]["screen_survivors"] += int(len(survivors))
                for j in survivors:
                    meta = metas[int(j)]
                    key1200 = grid.keyfull(meta)
                    c120, k120 = E.apply_variant(cfull[:120], key1200, atbash, sign)
                    c240, k240 = E.apply_variant(cfull[:240], key1200, atbash, sign)
                    for rel in E.RELS:
                        try:
                            d120, a120 = E.v3dec(c120, k120, rel)
                            d240, a240 = E.v3dec(c240, k240, rel)
                        except Exception as exc:
                            errors.append({"window": window_name, "meta": grid.meta_str(meta),
                                           "relation": rel, "error": repr(exc)})
                            continue
                        totals[window_name]["beam_decodes"] += 2
                        delta = int(meta["off"]) - offset
                        pass120 = float(a120["pmax"]) >= bars[rel]["L120"]
                        pass240 = float(a240["pmax"]) >= bars[rel]["L240"]
                        row = {
                            "window": window_name,
                            "clock": "continuous within selected window; no page/word resets",
                            "start": "p0 first rune" if window_name == "whole-book-global" else "p15 first body rune after 9-rune red heading",
                            "offset_class": "exact-p15-quotient" if delta == 0 else "p15-spiral-prime-relative",
                            "offset": int(meta["off"]), "offset_delta": delta,
                            "builder": meta["b"], "direction": meta["dir"],
                            "key_sign": int(sign), "atbash": int(atbash), "relation": rel,
                            "pmax120": float(a120["pmax"]), "register120": reg_name(E, a120),
                            "pmax240": float(a240["pmax"]), "register240": reg_name(E, a240),
                            "bar120_N1e6": bars[rel]["L120"], "bar240_N1e6": bars[rel]["L240"],
                            "pass120": pass120, "pass240": pass240, "pass_both": pass120 and pass240,
                            "plaintext120": plain_text(corpus, d120),
                            "plaintext240": plain_text(corpus, d240),
                        }
                        rows.append(row)


    rows.sort(key=lambda r: (r["window"], r["offset_class"], -r["pmax240"]))
    summary = {
        "status": "COMPLETE" if not errors else "DECODE_ERRORS",
        "source": {
            "pad": "2013 CicadaOS DATA/560.13", "pad_bytes": args.pad.stat().st_size,
            "pad_sha256": pad_hash, "p15_heading_gp29_integer": 29_553_734_724,
            "divisor": 3301, "quotient_offset": offset, "remainder_file_stem": remainder,
            "p15_spiral_primes": PRIMES, "tested_offsets": offsets,
        },
        "method": {
            "external_repository": "Dukotah/cicada3301",
            "external_commit": "f63501d8f2d835b80c30230eb89a1110fb9197d2",
            "external_license": "MIT", "instrument": "R40-B3 engine/pads imported unchanged",
            "builders": list(P.BYTEWISE), "directions": ["fwd", "rev"],
            "key_signs": [-1, 1], "atbash": "none", "skip_relations": list(E.RELS),
            "screen": "frozen pf_v4_12, panel-R36 12-register prefilter, first 24 ciphertext runes",
            "decode": "beam_v3 panel_max, tau=0, lambda_u=4, beam_w=400; L120/L240",
            "withheld_check": "first 120 runes are the selection window; L240 is the continuation gate, including the next 120 runes",
            "round_trip_controls": "engine.control: 10 planted texts per control register/relation, 512 decoys per plant, seed 3301; requires register_licensed and gate_cells_ge3",
            "register_panel": "panel-R36, 12 registers",
            "bars_N": int(E.N_DECL),
            "clock": "two predeclared continuous windows; no page/word reset or phase search",
            "offset_search": "none; exact p15 quotient plus 16 p15 spiral-prime relative starts only",
        },
        "positive_control_ok": control_ok,
        "authentic_2013_xor_positive_control": historical_control,
        "control_register_licensed": control.get("register_licensed"),
        "control_gate_cells_ge3": control.get("gate_cells_ge3"),
        "control_decoy_fpr": control.get("decoy_fpr"),
        "bars": bars, "totals": totals,
        "decoded_rows": len(rows), "pass_both_rows": sum(r["pass_both"] for r in rows),
        "errors": errors, "elapsed_seconds": round(time.time() - t0, 2),
    }
    (args.out / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    (args.out / "survivors.json").write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
