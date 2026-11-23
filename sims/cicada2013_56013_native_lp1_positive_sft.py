"""Blind original-author GP-language positive for complete 2013 ISO key screens.

Uses genuine plaintext rune scans from already-solved first-release LP1 pages
10–13; independent Gibran text supplies the scorer. Every original model
must rank its planted key offset first on an unrelated 1MB random tape.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

import cicada2013_56013_full_literal_pad_scan_sft as direct
import cicada2013_56013_full_rank28_sft as rank28


def main() -> None:
    corpus = json.loads((direct.ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    runes = corpus["runes"]
    mapping = {r: i for i, r in enumerate(runes)}
    source = (direct.ROOT / "resources/transcriptions/lp1_wulfic_canonical.txt").read_text(encoding="utf-8")
    start = source.index("ᚦᛖ-ᛚᚩᛋᛋ")
    end = source.index("\n$\n%\n", start)
    original_native = np.asarray([mapping[r] for r in source[start:end] if r in mapping], dtype=np.uint8)
    if len(original_native) != 755:
        raise AssertionError(f"Original solved-LP1 independently parsed rune count: {len(original_native)}")
    true_plaintext = original_native[:direct.CHAPTER]
    reference = direct.gp_text((direct.ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8"),
                               corpus["translit"])
    weight = direct.weights(reference)
    rng = np.random.default_rng(33012013)
    tape = rng.integers(0, 256, size=1_000_000, dtype=np.uint8)
    start_key = 330_103
    key = tape[start_key:start_key + direct.CHAPTER]
    results = {}
    for mode in ("raw29", "difference29", "delta_rank28", "excluded_rank28"):
        if mode == "raw29":
            cipher = ((true_plaintext.astype(np.int16) + (key % 29)) % 29).astype(np.uint8)
            observed = cipher
            restored = direct.direct_plain(observed, key)
            scan = direct.screen(tape, observed, weight, top=10)
        elif mode == "difference29":
            increments = ((true_plaintext.astype(np.int16) + (key % 29)) % 29).astype(np.uint8)
            cipher = (np.cumsum(increments, dtype=np.int64) % 29).astype(np.uint8)
            observed = direct.source_stream(cipher, mode)
            restored = direct.direct_plain(observed, key)
            scan = direct.screen(tape, observed, weight, top=10)
        else:
            rank28.mode_global = mode
            cipher = rank28.ciphertext_from_rank(true_plaintext, key, mode)
            restored = rank28.plaintext_from_rank(cipher, key, mode)
            scan = rank28.screen(tape, cipher, weight)
        if not np.array_equal(restored, true_plaintext):
            raise AssertionError(f"Original solved-LP1 plaintext inverse not exact: {mode}")
        rank = scan["top_offsets"].index(start_key) + 1 if start_key in scan["top_offsets"] else None
        if rank != 1:
            raise AssertionError(f"Original solved-LP1 key not ranked #1 on {mode}: top10 {scan['top_offsets'][:10]}")
        results[mode] = {"authentic_solved_lp1_plaintext_runes": len(true_plaintext),
                         "train_control_disjoint": True,
                         "actual_original_lp1_source": "LP1 original pp10–13, exact 755 original runes, first729 planted",
                         "planted_offset": start_key, "detected_rank": rank,
                         "first128_score": scan["top_scores"][0],
                         "whole729_score": direct.llr(true_plaintext, weight),
                         "whole729_ioc": direct.ioc(true_plaintext),
                         "exact_recovered": True}
        print("REAL_SOLVED_LP1_GP_LANGUAGE_SOURCE_POSITIVE", mode, json.dumps(results[mode]), flush=True)
    print("REAL_SOLVED_LP1_POSITIVES_PASSED", json.dumps(results), flush=True)


if __name__ == "__main__":
    main()
