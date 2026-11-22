#!/usr/bin/env python3
"""Test one source-selected NIST Beacon V1 global-pad hypothesis on LP2 p0-p2.

The single anchor is the PGP signature creation time 2014-01-07T03:16:41Z
(Unix 1389064601) attached to the original Liber Primus 00.jpg. The pulse at
or immediately before that time is 03:16:00Z (1389064560). We concatenate
16 consecutive 512-bit outputValues, map bytes mod 29, and decode the first
729 LP2 runes continuously with the exact keyskip1 anti-repeat channel.

This is a bounded hypothesis test, not a claim that the timestamp is the
LP2 pad start. Adjacent-pulse and deterministic-random controls are included.
The external C8 positive control must pass before the LP2 candidate is scored.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SIGNATURE_TS = 1389064601
PULSE_START = 1389064560
N_PULSES = 16
EXTERNAL_COMMIT = "fd13fe88a0bfef13f07c03c666b831e9ddae7f2d"


def load_c8(external_root: Path):
    c8_path = external_root / "analysis/round24/C8-date-indexed-pad/run_c8.py"
    if not c8_path.is_file():
        raise FileNotFoundError(c8_path)
    spec = importlib.util.spec_from_file_location("c8_nist_global_pad", c8_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot import pinned external C8 pipeline")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def pulse_chain(c8, ts: int, n_pulses: int):
    blob, metas = c8.fetch_beacon_chain(ts, n_pulses)
    expected_start = (ts // 60) * 60
    if blob is None or len(metas) != n_pulses or len(blob) != 64 * n_pulses:
        raise RuntimeError(
            f"incomplete NIST chain ts={ts}: bytes={0 if blob is None else len(blob)} "
            f"metas={len(metas)} expected_pulses={n_pulses}"
        )
    for i, meta in enumerate(metas):
        expected = expected_start + 60 * i
        if meta.get("unreachable") or meta.get("pulse_minute") != expected:
            raise RuntimeError(f"bad pulse metadata at {i}: {meta}")
        if meta.get("record_ts") not in (None, expected):
            raise RuntimeError(f"unexpected NIST record timestamp at {i}: {meta}")
    key = c8.pad_from_beacon(blob, "mod29")
    if len(key) != 64 * n_pulses:
        raise RuntimeError(f"mod29 builder returned {len(key)} symbols, expected {64*n_pulses}")
    return blob, key, metas


def verdict_row(c8, cipher, key, label: str):
    dec = c8.HF.HitDecode(
        C=cipher, K=key, o=0, sign=-1, preset="exact",
        n_round_adjudicated=1_000_000, alpha=0.01,
    )
    verdict = c8.HF.evaluate(dec)
    decoded = dec._decoded or {}
    ptr_end = int(decoded.get("ptr_end", -1))
    return {
        "label": label,
        "verdict": vars(verdict),
        "decode": {
            "score": decoded.get("score"),
            "ptr_end": ptr_end,
            "n_skips": decoded.get("n_skips"),
            "n_unexplained": decoded.get("n_unexplained"),
            "nchars": decoded.get("nchars"),
            "key_symbols": len(key),
            "used_only_real_beacon_bytes": 0 <= ptr_end < len(key),
            "translit": decoded.get("translit", ""),
            "preview": decoded.get("translit", "")[:240],
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--external-root", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    args = ap.parse_args()

    c8 = load_c8(args.external_root)
    print("== C8 source/decoder positive control ==")
    control = c8.positive_control()
    print(json.dumps(control, indent=2))
    if control.get("status") != "PASS":
        report = {
            "status": "STOP_CONTROL_FAILED",
            "external_decoder_commit": EXTERNAL_COMMIT,
            "positive_control": control,
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        raise SystemExit("C8 positive control failed; target not tested")

    corpus_path = ROOT / "resources/liber-primus/lp2-corpus.json"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    pages = corpus["pages"][:3]
    if [int(p["page"]) for p in pages] != [0, 1, 2]:
        raise RuntimeError("corpus page ordering changed")
    cipher = [int(x) for p in pages for x in p["indices"]]
    if len(cipher) != 729:
        raise RuntimeError(f"p0-p2 length changed: {len(cipher)} != 729")

    print("== source-selected timestamp chain ==")
    right_blob, right_key, right_meta = pulse_chain(c8, SIGNATURE_TS, N_PULSES)
    before_blob, before_key, before_meta = pulse_chain(c8, SIGNATURE_TS - 60, N_PULSES)
    after_blob, after_key, after_meta = pulse_chain(c8, SIGNATURE_TS + 60, N_PULSES)

    rng = random.Random(3301)
    random_key = [rng.randrange(29) for _ in range(len(right_key))]

    right = verdict_row(c8, cipher, right_key, "right: signed 00.jpg timestamp")
    before = verdict_row(c8, cipher, before_key, "wrong: one pulse earlier")
    after = verdict_row(c8, cipher, after_key, "wrong: one pulse later")
    random_control = verdict_row(c8, cipher, random_key, "wrong: deterministic random seed 3301")

    right_hit = bool(right["verdict"]["hit"])
    controls_fail = not any(
        bool(row["verdict"]["hit"]) for row in (before, after, random_control)
    )
    right_uses_real = bool(right["decode"]["used_only_real_beacon_bytes"])
    passed = right_hit and controls_fail and right_uses_real

    report = {
        "status": "PASS" if passed else "NO_HIT",
        "hypothesis": (
            "The PGP creation timestamp of the original Liber Primus 00.jpg selects "
            "a continuous NIST Beacon V1 pad for LP2 p0-p2; consecutive outputValues "
            "are concatenated, bytes map mod29, and the exact keyskip1 anti-repeat "
            "decoder recovers the runes continuously from key offset zero."
        ),
        "source": {
            "signature_artifact": "2014 Liber Primus 00.jpg PGP signature",
            "signature_timestamp_unix": SIGNATURE_TS,
            "signature_timestamp_utc": "2014-01-07T03:16:41Z",
            "first_pulse_unix": PULSE_START,
            "first_pulse_utc": "2014-01-07T03:16:00Z",
            "pulse_count": N_PULSES,
            "right_chain_sha256": hashlib.sha256(right_blob).hexdigest(),
            "right_pulses": right_meta,
            "before_pulses": before_meta,
            "after_pulses": after_meta,
            "external_decoder_repository": "Dukotah/cicada3301",
            "external_decoder_commit": EXTERNAL_COMMIT,
        },
        "target": {
            "pages": [0, 1, 2],
            "rune_count": len(cipher),
            "cipher_ioc": (
                sum(cipher.count(x) * (cipher.count(x) - 1) for x in set(cipher))
                / (len(cipher) * (len(cipher) - 1))
            ),
            "pad_builder": "NIST outputValue bytes modulo 29",
            "pad_symbols": len(right_key),
            "key_offset": 0,
            "clock": "continuous across p0-p2; no page reset",
            "decoder": {
                "preset": "exact",
                "mode": "keyskip1",
                "max_skip": 3,
                "max_free": 0,
                "lam": 0.0,
                "start_slack": 0,
                "beam_width": 400,
                "sign": -1,
                "n_round_adjudicated": 1_000_000,
                "alpha": 0.01,
            },
        },
        "positive_control": control,
        "candidate": right,
        "wrong_date_one_pulse_earlier": before,
        "wrong_date_one_pulse_later": after,
        "wrong_source_seed3301": random_control,
        "decision_rule": (
            "PASS only if the right timestamp is a HIT, all three controls are not HIT, "
            "and the winning path consumes only fetched beacon symbols. Otherwise NO_HIT."
        ),
        "limitations": [
            "The timestamp is attached to 00.jpg; its use as a global LP2 pad anchor is a hypothesis.",
            "This tests only the joint NIST/mod29/continuous/keyskip1 model on p0-p2.",
            "A NO_HIT rejects this exact model, not every possible use of the timestamp or beacon.",
            "No alternate byte builders, offsets, signs, clocks, or cipher families are searched.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("== target verdict ==")
    print(json.dumps({
        "status": report["status"],
        "right": right["verdict"],
        "before": before["verdict"],
        "after": after["verdict"],
        "random": random_control["verdict"],
        "right_decode": right["decode"],
    }, indent=2, ensure_ascii=False))
    print(f"wrote {args.output}")
    if not passed:
        raise SystemExit("source-selected NIST global-pad model did not pass")


if __name__ == "__main__":
    main()
