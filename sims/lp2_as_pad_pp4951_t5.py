#!/usr/bin/env python3
"""Complete the F-01 T5 gap: LP2 as running key against the image-verified pp49-51 payload.

The external F-01 preregistration fixes the model, key variants, sign choices,
offset 0, beam width 400, max_skip 3, and score bar -5.5. This runner adds the
previously skipped T5 target (canon_256.bin) and uses a joint max-null across
all eight key/sign configurations.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import random
import sys
import time
from pathlib import Path

EXPECTED_LP2_HASH = "023312066df471005264b9cbe7997cb77d2a9a6a2dc9b3316d22674023af1585"
BEAM_W, MAX_SKIP, OFFSET = 400, 3, 0
SCORE_BAR, NULL_N, NULL_SEED = -5.5, 200, 3301

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dukotah-root", required=True, type=Path)
    ap.add_argument("--out", default=Path("lp2-as-pad-pp49-51-t5.json"), type=Path)
    args = ap.parse_args()
    root = args.dukotah_root.resolve()
    lp = root / "liber-primus"
    f01_dir = lp / "analysis" / "round16" / "F-01"
    if not (f01_dir / "sweep.py").is_file():
        raise SystemExit(f"Missing pinned F-01 implementation: {f01_dir}")
    sys.path.insert(0, str(f01_dir))
    import sweep  # noqa: E402 -- pinned external implementation
    sk = sweep.sk

    t0 = time.time()
    lp2 = sweep.load_lp2()
    lp2_hash = hashlib.sha256(",".join(str(x) for x in lp2).encode()).hexdigest()
    if len(lp2) != 12956 or lp2_hash != EXPECTED_LP2_HASH:
        raise SystemExit(f"LP2 corpus mismatch: n={len(lp2)} sha256={lp2_hash}")

    print("=== F-01 T5 positive control ===", flush=True)
    pc_pass, pc_data = sweep.positive_control(lp2, beam_w=BEAM_W, max_skip=MAX_SKIP)
    if not pc_pass:
        out = {"verdict": "INCONCLUSIVE: positive control failed",
               "positive_control_passed": False, "positive_control": pc_data,
               "lp2_length": len(lp2), "lp2_stream_sha256": lp2_hash}
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
        print("Positive control failed; no T5 inference.", flush=True)
        return 2

    pp = lp / "analysis" / "pp49_51"
    payload_path = pp / "canon_256.bin"
    raw = payload_path.read_bytes()
    if len(raw) != 256:
        raise SystemExit(f"Expected 256-byte canonical payload, got {len(raw)}")
    hex_path = pp / "canon_256.hex"
    if hex_path.exists() and bytes.fromhex(hex_path.read_text(encoding="utf-8").strip()) != raw:
        raise SystemExit("canon_256.hex disagrees with canon_256.bin")

    # Match the external F-01 loader: payload bytes are reduced modulo GP29.
    ciphertext = [b % 29 for b in raw]
    payload_hash = hashlib.sha256(raw).hexdigest()
    key_variants = {
        "lp2_fwd": lp2,
        "lp2_rev": list(reversed(lp2)),
        "lp2_atbash": sweep.atbash(lp2),
        "lp2_neg": sweep.neg_mod(lp2),
    }

    print(f"LP2: {len(lp2)} runes; T5: {len(ciphertext)} values mod 29", flush=True)
    print(f"T5 SHA256: {payload_hash}", flush=True)
    rows, extended = [], {}
    for key_name, key in key_variants.items():
        k_ext = key + [0] * max(0, len(ciphertext) * (MAX_SKIP + 2) - len(key) + 128)
        extended[key_name] = k_ext
        for sign in (-1, +1):
            bd = sk.beam_decode(ciphertext, k_ext, sign=sign, o=OFFSET,
                                beam_w=BEAM_W, max_skip=MAX_SKIP)
            row = {"key_variant": key_name, "sign": sign,
                   "score": float(bd["score"]), "translit": bd["translit"],
                   "head": bd["translit"][:100]}
            rows.append(row)
            print(f"REAL {key_name:12s} sign={sign:+d} score={row['score']:.4f} "
                  f"{row['head'][:72]}", flush=True)

    rows.sort(key=lambda r: r["score"], reverse=True)
    best = rows[0]
    null_maxima, null_mean, p_value = [], None, None
    # Only spend null compute if the real candidate reaches the preregistered
    # neighbourhood of the -5.5 acceptance bar.
    if best["score"] >= -6.0:
        print(f"=== Joint max-null: {NULL_N} shuffles × 8 configurations ===", flush=True)
        rng = random.Random(NULL_SEED)
        for i in range(NULL_N):
            shuffled = list(ciphertext)
            rng.shuffle(shuffled)
            best_null = -math.inf
            for k_ext in extended.values():
                for sign in (-1, +1):
                    bd = sk.beam_decode(shuffled, k_ext, sign=sign, o=OFFSET,
                                        beam_w=BEAM_W, max_skip=MAX_SKIP)
                    best_null = max(best_null, float(bd["score"]))
            null_maxima.append(best_null)
            if (i + 1) % 10 == 0:
                print(f"  null {i + 1}/{NULL_N}: running max={max(null_maxima):.4f}", flush=True)
        null_mean = sum(null_maxima) / len(null_maxima)
        p_value = (1 + sum(x >= best["score"] for x in null_maxima)) / (len(null_maxima) + 1)

    null_max = max(null_maxima) if null_maxima else None
    hit = (best["score"] >= SCORE_BAR and null_max is not None
           and best["score"] >= null_max + 0.5)
    if best["score"] < SCORE_BAR:
        verdict = "NEGATIVE: best real score below preregistered -5.5 bar"
    elif null_max is None:
        verdict = "INCONCLUSIVE: candidate reached null gate but null was not run"
    elif hit:
        verdict = "HIT CANDIDATE: independently inspect plaintext before any claim"
    else:
        verdict = "NEGATIVE: best candidate does not clear joint max-null"

    out = {
        "verdict": verdict,
        "positive_control_passed": pc_pass,
        "positive_control": pc_data,
        "external_repository": "Dukotah/cicada3301",
        "external_commit": "9087dc36b5aa64c1786428e32180261ab9420c29",
        "f01_source": "liber-primus/analysis/round16/F-01/sweep.py",
        "target": "liber-primus/analysis/pp49_51/canon_256.bin",
        "target_length_bytes": len(raw),
        "target_sha256": payload_hash,
        "target_mapping": "byte % 29",
        "lp2_length": len(lp2),
        "lp2_stream_sha256": lp2_hash,
        "key_variants": list(key_variants),
        "signs": [-1, 1],
        "offset": OFFSET,
        "beam_width": BEAM_W,
        "max_skip": MAX_SKIP,
        "score_bar": SCORE_BAR,
        "real_results": rows,
        "best_real": best,
        "joint_null_n": len(null_maxima),
        "joint_null_seed": NULL_SEED,
        "joint_null_mean_of_maxima": null_mean,
        "joint_null_max": null_max,
        "familywise_empirical_p": p_value,
        "hit": hit,
        "elapsed_seconds": time.time() - t0,
        "notes": [
            "Uses the image-adjudicated canonical 256-byte payload; decimal-preferred fork is superseded.",
            "The joint null shuffles the target and takes the maximum over all eight key/sign configurations per shuffle.",
            "Only offset 0 is tested, matching the external F-01 preregistration."
        ],
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"\nVERDICT: {verdict}", flush=True)
    print(f"Best: {best['key_variant']} sign={best['sign']:+d} score={best['score']:.4f}", flush=True)
    if null_max is not None:
        print(f"Joint null max={null_max:.4f}; empirical p={p_value:.5f}", flush=True)
    print(f"Results: {args.out}", flush=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
