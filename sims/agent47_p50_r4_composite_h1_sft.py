#!/usr/bin/env python3
"""Full-original p50-table + historical keyword test under R4 mid-word H1.

Frozen key:
  k[j] = (p50_row_major_byte[j mod 256] mod 29
          + GP29(keyword)[j mod L]) mod 29
The two source-visible keywords are DIVINITY (DIUINITY) and
FIRFUMFERENFE. Both clocks start at zero and run globally over all 12,956
unknown runes. Page/line wraps are transparent; the 2,896 original word
boundaries are retained. No offset, permutation, page reset, or alternate
radix is confirmatory.

The pinned external engine uses kind=3, q=.81, nu=.42, hold/spend and both
signs. Its null/repair likelihood is an approximation to the full R4 model:
T(c-6) repair values are subsumed by uniform-other repair, checked nulls are
treated as invisible, and plaintext-F transparency is not modeled. Synthetic
plants validate this approximate decoder only.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path

import numpy as np
import lp2_r4_composite_h1_sft as base

ROOT = Path(__file__).resolve().parents[1]
EXT = Path(os.environ["PNOTISDEV_ROOT"]).resolve()
COMMIT = os.environ.get("PNOTISDEV_COMMIT", "15200c67abee106913ba01ff504c5b6e88d16cc7")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def slim(rec: dict) -> dict:
    return {k: rec[k] for k in (
        "sign", "channel", "offset0_S_guard", "offset0_logL",
        "offset0_logU", "offset0_logW", "best_offset_diagnostic_only",
        "best_score_diagnostic_only",
    )}


def main() -> None:
    cipher, starts, source_meta = base.parse_source()
    lengths = base.word_lengths(starts)
    corpus_path = ROOT / "resources/liber-primus/lp2-corpus.json"
    grid_path = ROOT / "resources/liber-primus/lp2-grid-256.json"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    grid = json.loads(grid_path.read_text(encoding="utf-8"))
    table_bytes = [int(v) for page in grid["pages"] for v in page["bytes"]]
    if len(table_bytes) != 256 or len(cipher) != 12956 or sum(starts) != 2896:
        raise RuntimeError("Original source dimensions changed; refusing to score")

    single = {token: i for i, token in enumerate(corpus["translit"]) if len(token) == 1}
    words = {
        "DIVINITY": [single[ch] for ch in "DIUINITY"],
        "FIRFUMFERENFE": [single[ch] for ch in "FIRFUMFERENFE"],
    }

    model_path = EXT / "work/chanscreen/model.npz"
    with np.load(model_path) as z:
        pi = np.asarray(z["pi"], dtype=np.float64)
        lm = np.asarray(z["L"], dtype=np.float64)
    if pi.shape != (29,) or lm.shape != (29, 29):
        raise RuntimeError("Pinned external language-model shape changed")

    results, controls = [], []
    for name, word in words.items():
        key = [
            (table_bytes[j % 256] % 29 + word[j % len(word)]) % 29
            for j in range(len(cipher) + 1)
        ]
        rotated_word = word[1:] + word[:1]
        rotated = [
            (table_bytes[j % 256] % 29 + rotated_word[j % len(rotated_word)]) % 29
            for j in range(len(cipher) + 1)
        ]
        original = [
            slim(base.score(cipher, starts, key, pi, lm, sign, mode))
            for sign in (1, -1)
            for mode in ("hold", "spend")
        ]

        # Full-length positive using the same word lengths and exact engine
        # kind-3 generation model; rotated keyword is its matched wrong-key.
        plant_mode = "hold" if name == "DIVINITY" else "spend"
        seed = 0x47D1A17 + (1 if name == "DIVINITY" else 2)
        planted, planted_starts = base.plant_matching_model(
            lengths, key, pi, lm, plant_mode, seed
        )
        positive = slim(base.score(planted, planted_starts, key, pi, lm, 1, plant_mode))
        wrong = slim(base.score(planted, planted_starts, rotated, pi, lm, 1, plant_mode))
        pscore, wscore = positive["offset0_S_guard"], wrong["offset0_S_guard"]

        results.append({
            "keyword": name,
            "gp_spelling": "DIUINITY" if name == "DIVINITY" else name,
            "keyword_values": word,
            "key_formula": "(p50_row_major_byte[j mod 256] mod 29 + keyword[j mod L]) mod 29",
            "period": math.lcm(256, len(word)),
            "key_sha256": hashlib.sha256(bytes(key)).hexdigest(),
            "rotated_key_sha256": hashlib.sha256(bytes(rotated)).hexdigest(),
            "original_global_clock_offset0": original,
        })
        controls.append({
            "keyword": name,
            "plant_mode": plant_mode,
            "seed": seed,
            "planted_cipher_sha256": hashlib.sha256(bytes(planted)).hexdigest(),
            "true_key_positive": positive,
            "one_symbol_rotated_keyword_null": wrong,
            "positive_discriminates": (
                pscore is not None and wscore is not None and pscore > wscore
            ),
        })

    output = {
        "experiment": "p50 row-major byte stream + historical keyword under R4 mid-word H1",
        "external_reference": "pnotisdev/cicada3301",
        "external_commit": COMMIT,
        "external_model_sha256": digest(model_path),
        "external_engine": "work/chanscreen/v2/engine_mid.py + backward_mid.rs",
        "source": source_meta,
        "p50_table": {
            "bytes": len(table_bytes),
            "sha256": digest(grid_path),
            "mapping": "row-major byte order, each byte reduced modulo 29",
        },
        "decoder": {
            "alphabet": 29,
            "q_collision_repair": 0.81,
            "nu_midword_null": 0.42,
            "kind": 3,
            "channels": ["hold", "spend"],
            "signs": [1, -1],
            "global_clock": "zero at first unknown LP2 rune; no page resets",
            "word_count": len(lengths),
            "literal_F_skip": False,
            "limits": [
                "T(c-6) repair values are scored as uniform-other repairs.",
                "R4 checked nulls are approximated as nulls invisible to anti-repeat and LM state.",
                "nu=.42 is the engine's frozen value; separate R4 fitting reported about .448.",
                "No plaintext-F transparent skip is modeled.",
            ],
        },
        "results": results,
        "positive_controls": controls,
        "interpretation": (
            "Only original offset zero under the source-fixed key is confirmatory. "
            "Best offsets and synthetic plants are diagnostics, not evidence of historical encryption."
        ),
    }
    out = ROOT / "im-results/lp2-p50-r4-composite-h1-sft.json"
    out.write_text(json.dumps(output, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "experiment": output["experiment"],
        "source": output["source"],
        "p50_table": output["p50_table"],
        "decoder": output["decoder"],
        "results": results,
        "positive_controls": controls,
        "output": str(out.relative_to(ROOT)),
    }, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
