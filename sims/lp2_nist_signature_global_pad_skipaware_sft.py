#!/usr/bin/env python3
"""Bounded test of a timestamp-anchored NIST Beacon V1 pad for LP2 p0-p2.

Source anchor: the 2014-01-07T03:16:41Z OpenPGP creation time on original
Liber Primus 00.jpg selects the pulse at-or-before it (03:16:00Z). The test
uses consecutive outputValue records, byte mod 29, continuous offset zero,
and the exact keyskip1 anti-repeat decoder. The external C8 known-plaintext
control is reproduced with the same decoder before the LP2 candidate is run.

The external panelmax model is not built here because one of its training
corpora (Mabinogion) is absent from the pinned public checkout. We therefore
report beam score and held-out self-consistency, not a formal HITFN hit.
"""
from __future__ import annotations
import argparse, hashlib, importlib.util, json, random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SIGNATURE_TS = 1389064601
N_PULSES = 16
EXTERNAL_COMMIT = "fd13fe88a0bfef13f07c03c666b831e9ddae7f2d"


def load_c8(external_root: Path):
    path = external_root / "analysis/round24/C8-date-indexed-pad/run_c8.py"
    spec = importlib.util.spec_from_file_location("c8_nist_global_pad", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def chain(c8, ts, n_pulses):
    blob, metas = c8.fetch_beacon_chain(ts, n_pulses)
    start = (ts // 60) * 60
    if blob is None or len(blob) != 64*n_pulses or len(metas) != n_pulses:
        raise RuntimeError(f"incomplete NIST chain at {ts}: bytes={len(blob or b'')} metas={len(metas)}")
    for i, m in enumerate(metas):
        if m.get("unreachable") or m.get("pulse_minute") != start + 60*i:
            raise RuntimeError(f"bad NIST pulse metadata: {m}")
    return blob, c8.pad_from_beacon(blob, "mod29"), metas


def decode(c8, cipher, key, label, offset=0):
    dec = c8.HF.HitDecode(C=cipher, K=key, o=offset, sign=-1, preset="exact")
    out = dec.beam(list(cipher), list(key), offset)
    held = c8.HF._heldout_recovery(dec, out["plain_idx"])
    ptr = int(out.get("ptr_end", -1))
    return {
        "label": label,
        "score": float(out.get("score", -99)),
        "ptr_end": ptr,
        "n_skips": out.get("n_skips"),
        "n_unexplained": out.get("n_unexplained"),
        "heldout_selfconsistency": float(held),
        "used_only_real_pad": 0 <= ptr < len(key),
        "translit": out.get("translit", ""),
        "preview": out.get("translit", "")[:300],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--external-root", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    args = ap.parse_args()
    c8 = load_c8(args.external_root)

    # Reproduce the pinned C8 known-plaintext positive control without its
    # panelmax dependency; the exact keyskip1 beam must recover the plant.
    plain_en = ("THE PRIMES ARE SACRED AND THE TOTIENT FUNCTION IS SACRED ALL THINGS "
                "SHOULD BE ENCRYPTED KNOW THIS THAT THE INSTAR EMERGENCE IS AT HAND AND "
                "THE PILGRIM WHO SOLVES THE DEEP WEB SHALL FIND THE TRUTH WITHIN THE "
                "SACRED GEOMETRY OF THE CIRCUMFERENCE")
    P = c8.SK.eng_to_idx(plain_en)
    n_control_pulses = (len(P) + 40)//64 + 4
    b_ctrl, k_ctrl, m_ctrl = chain(c8, SIGNATURE_TS, n_control_pulses)
    b_wrong_ctrl, k_wrong_ctrl, _ = chain(c8, 1390117197, n_control_pulses)
    offset = 137
    Cplant, plant_skips, plant_used = c8.SK.encipher_keyskip(
        P, k_ctrl[offset:], sign=-1, supp=0.83
    )
    plant_right = decode(c8, Cplant, k_ctrl, "C8 plant: right NIST timestamp", offset)
    plant_wrong = decode(c8, Cplant, k_wrong_ctrl, "C8 plant: wrong NIST timestamp", offset)
    plant_rng = random.Random(3301)
    k_rand_plant = [plant_rng.randrange(29) for _ in range(len(k_ctrl))]
    plant_random = decode(c8, Cplant, k_rand_plant, "C8 plant: random seed 3301", offset)
    # The known-plaintext recovery is measured directly from the beam path.
    plant_dec = c8.HF.HitDecode(C=Cplant, K=k_ctrl, o=offset, sign=-1, preset="exact")
    plant_out = plant_dec.beam(list(Cplant), list(k_ctrl), offset)
    plant_recovery = float(c8.HF.DB.recovery(plant_out["plain_idx"], P))
    plant_wrong_dec = c8.HF.HitDecode(C=Cplant, K=k_wrong_ctrl, o=offset, sign=-1, preset="exact")
    plant_wrong_out = plant_wrong_dec.beam(list(Cplant), list(k_wrong_ctrl), offset)
    plant_wrong_recovery = float(c8.HF.DB.recovery(plant_wrong_out["plain_idx"], P))
    plant_ok = plant_recovery >= 0.90 and plant_wrong_recovery < 0.90

    if not plant_ok:
        report = {
            "status": "STOP_CONTROL_FAILED",
            "external_decoder_commit": EXTERNAL_COMMIT,
            "control": {
                "plain_length": len(P), "offset": offset, "skips": plant_skips,
                "used": plant_used, "right_recovery": plant_recovery,
                "wrong_recovery": plant_wrong_recovery,
                "right_decode": plant_right, "wrong_decode": plant_wrong,
                "random_decode": plant_random, "pulses": m_ctrl,
            },
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
        raise SystemExit("known-plaintext keyskip1 control failed")

    corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text())
    pages = corpus["pages"][:3]
    cipher = [int(x) for p in pages for x in p["indices"]]
    if len(cipher) != 729:
        raise RuntimeError(f"expected 729 runes on p0-p2, got {len(cipher)}")

    b_right, k_right, m_right = chain(c8, SIGNATURE_TS, N_PULSES)
    _, k_before, m_before = chain(c8, SIGNATURE_TS-60, N_PULSES)
    _, k_after, m_after = chain(c8, SIGNATURE_TS+60, N_PULSES)
    rng = random.Random(3301)
    k_random = [rng.randrange(29) for _ in range(len(k_right))]

    right = decode(c8, cipher, k_right, "LP2 p0-p2: signed timestamp", 0)
    before = decode(c8, cipher, k_before, "LP2 p0-p2: one pulse earlier", 0)
    after = decode(c8, cipher, k_after, "LP2 p0-p2: one pulse later", 0)
    random_control = decode(c8, cipher, k_random, "LP2 p0-p2: random seed 3301", 0)

    # Screening only: require a self-consistent, real-pad path and a clear
    # score margin over all controls. A formal HITFN panelmax is unavailable.
    controls = [before, after, random_control]
    margin = right["score"] - max(x["score"] for x in controls)
    candidate = (
        right["heldout_selfconsistency"] >= 0.90
        and right["used_only_real_pad"]
        and margin >= 0.50
    )
    report = {
        "status": "CANDIDATE_SCREEN_PASS" if candidate else "NO_HIT",
        "hypothesis": "One global NIST Beacon V1 pad begins at the pulse selected by the 00.jpg PGP timestamp; outputValue bytes map mod29 and feed a continuous keyskip1 stream over LP2 p0-p2.",
        "source": {
            "signature_timestamp_utc": "2014-01-07T03:16:41Z",
            "signature_timestamp_unix": SIGNATURE_TS,
            "first_pulse_utc": "2014-01-07T03:16:00Z",
            "first_pulse_unix": (SIGNATURE_TS//60)*60,
            "pulse_count": N_PULSES,
            "right_chain_sha256": hashlib.sha256(b_right).hexdigest(),
            "right_pulses": m_right,
            "before_pulses": m_before,
            "after_pulses": m_after,
            "external_repo": "Dukotah/cicada3301",
            "external_commit": EXTERNAL_COMMIT,
        },
        "positive_control": {
            "status": "PASS",
            "plain_length": len(P),
            "offset": offset,
            "encoder": "keyskip1, sign=-1, supp=0.83",
            "skips": plant_skips,
            "used": plant_used,
            "right_recovery": plant_recovery,
            "wrong_recovery": plant_wrong_recovery,
            "right_decode": plant_right,
            "wrong_decode": plant_wrong,
            "random_decode": plant_random,
            "pulses": m_ctrl,
        },
        "target": {
            "pages": [0,1,2],
            "runes": len(cipher),
            "pad_builder": "outputValue bytes modulo 29",
            "pad_symbols": len(k_right),
            "offset": 0,
            "clock": "continuous across pages",
            "decoder": "driftbeam exact preset: keyskip1, max_skip=3, max_free=0, start_slack=0, sign=-1",
            "right": right,
            "wrong_before": before,
            "wrong_after": after,
            "wrong_random": random_control,
            "score_margin_over_controls": margin,
        },
        "limitations": [
            "The PGP timestamp is attached to 00.jpg; using it as a global LP2 pad anchor is a hypothesis.",
            "This is a beam/held-out screening gate, not the full HITFN panelmax gate; the pinned external panel build requires an absent Mabinogion corpus.",
            "A NO_HIT rejects this exact NIST/mod29/continuous/keyskip1 model only.",
            "No offsets, alternative byte builders, page resets, signs, or other cipher families were searched.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": report["status"],
        "positive_control_recovery": plant_recovery,
        "wrong_control_recovery": plant_wrong_recovery,
        "right": right,
        "before": before,
        "after": after,
        "random": random_control,
        "score_margin": margin,
    }, indent=2, ensure_ascii=False))
    print(f"wrote {args.output}")
    if not candidate:
        raise SystemExit("NIST global-pad candidate did not pass screening")


if __name__ == "__main__":
    main()
