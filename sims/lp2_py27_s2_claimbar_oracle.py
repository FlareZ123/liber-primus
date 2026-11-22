#!/usr/bin/env python3
"""Independent original-input adjudication for the single R36/S2 32-bit MT crosser.

Requires checkout of Dukotah/cicada3301 at frozen commit
9087dc36b5aa64c1786428e32180261ab9420c29 under upstream/.
The native source decoder, GP29 stream, and panel coefficients are reused.
No second seed search is performed.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import sys
import time

import numpy as np

UPSTREAM_SHA = "9087dc36b5aa64c1786428e32180261ab9420c29"
PANEL_SHA = "e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928"
SEED = 1288211095
SCREEN_PMAX = 7.839010536552472
CLAIM_BAR = 7.6341931878728095
WORKSPACE = Path.cwd()
ROOT = WORKSPACE / "upstream" / "liber-primus"
ENGINE = ROOT / "analysis" / "round36" / "P1-panel-r36" / "engine_inputs_copy"
sys.path.insert(0, str(ROOT / "analysis" / "round25" / "compute-tail"))

import runner  # type: ignore  # noqa: E402

TRANS = runner.AD.TRANSLIT


def atomic_json(output: Path, data: dict) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    lock = output.with_suffix(output.suffix + ".lock")
    with open(lock, "x", encoding="utf-8"):
        temp = output.with_suffix(output.suffix + "." + str(os.getpid()) + ".tmp")
        try:
            with open(temp, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
                f.flush()
                os.fsync(f.fileno())
            os.replace(temp, output)
        finally:
            temp.unlink(missing_ok=True)
    lock.unlink()


def panel_input() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    raw = (ENGINE / "panel_lm.f32").read_bytes()
    got_sha = hashlib.sha256(raw).hexdigest()
    assert got_sha == PANEL_SHA, (got_sha, PANEL_SHA)
    lm = np.frombuffer(raw, dtype="<f4").reshape(12, 29 ** 3)
    lines = (ENGINE / "engine.dat").read_text(encoding="utf-8").splitlines()
    params = {line.split(" ", 1)[0]: line.split(" ", 1)[1] for line in lines if line.startswith(("MU ", "SD ", "NREG ", "PANEL_SHA256 ", "CSCREEN "))}
    assert params["NREG"] == "12"
    assert params["PANEL_SHA256"] == PANEL_SHA
    assert params["CSCREEN"] == "120"
    mu = np.array([float(n) for n in params["MU"].split()], dtype=np.float64)
    sd = np.array([float(n) for n in params["SD"].split()], dtype=np.float64)
    assert mu.shape == (12,) and sd.shape == (12,)
    return lm, mu, sd


def stats120(x: np.ndarray, lm: np.ndarray, mu: np.ndarray, sd: np.ndarray) -> dict:
    assert len(x) == 120
    idx = (x[:-2] * (29 * 29) + x[1:-1] * 29 + x[2:]).astype(np.int64)
    mean = lm[:, idx].mean(axis=1, dtype=np.float64)
    z = (mean - mu) / sd
    best = int(np.argmax(z))
    return {"pmax": float(z[best]), "best_register": best, "register_z": [round(float(k), 6) for k in z]}


def index_of_coincidence(x: np.ndarray) -> float:
    n = len(x)
    counts = np.bincount(x, minlength=29)
    return float(29 * np.sum(counts * (counts - 1)) / (n * (n - 1)))


def text(x: np.ndarray) -> str:
    return "".join(TRANS[int(i)] for i in x)


def original_decode(length: int, width: int) -> tuple[dict, np.ndarray]:
    ciphertext = list(runner.U[:length])
    key = runner.word_stream(SEED, length * 6 + 64)
    t0 = time.monotonic()
    d = runner.DB.beam_decode(ciphertext, key, sign=-1, o=0, beam_w=width, **runner.DB.PRESETS["exact"])
    x = np.asarray(d["plain_idx"], dtype=np.int64)
    assert len(x) == length and np.all((0 <= x) & (x < 29))
    info = {
        "length": length, "beam_width": width, "ptr_end": d["ptr_end"],
        "n_skips": d["n_skips"], "nchars": d["nchars"],
        "beam_score": float(d["score"]), "elapsed_s": round(time.monotonic() - t0, 3),
        "ioc_times_29": index_of_coincidence(x), "decoded_gp": text(x),
        "rune_idx": x.tolist()
    }
    return info, x


def main() -> None:
    # Reuse the original library and original rune stream without modifying glyphs or boundaries.
    lm, mu, sd = panel_input()
    output = {
        "candidate_seed": SEED, "upstream_commit": UPSTREAM_SHA,
        "panel_sha256": PANEL_SHA, "source_sweep_run": 43612834637,
        "source_merge_run": 43616793647,
        "screen_pmax": SCREEN_PMAX, "claim_bar": CLAIM_BAR,
        "relation": "random29 -> keyskip1/exact, offset0, sign -1",
        "cipher_runes_total": len(runner.U), "lengths": {},
    }
    for length, width in ((120, 64), (240, 400), (729, 400)):
        info, decoded = original_decode(length, width)
        info["windows_120"] = [{
            "start": start,
            **stats120(decoded[start:start + 120], lm, mu, sd),
            "gp_sample": text(decoded[start:start + 120])[:140]
        } for start in range(0, length - 119, 120)]
        if length == 120:
            diff = abs(info["windows_120"][0]["pmax"] - SCREEN_PMAX)
            info["pmax_absolute_parity_error"] = diff
            assert diff < 0.015, "C/R36 vs Python exact original-input parity mismatch: " + str(diff)
        output["lengths"][str(length)] = info
        atomic_json(WORKSPACE / "oracle-output" / "oracle.json", output)
        print(json.dumps({"length": length, "elapsed_s": info["elapsed_s"],
                          "ioc_times_29": info["ioc_times_29"],
                          "windows_120": info["windows_120"],
                          "gp_first_240": info["decoded_gp"][:240],
                          "pmax_parity_error": info.get("pmax_absolute_parity_error")}, ensure_ascii=False), flush=True)
    first = np.asarray(output["lengths"]["120"]["rune_idx"], dtype=np.int64)
    full = np.asarray(output["lengths"]["729"]["rune_idx"], dtype=np.int64)
    output["full_vs_screen_first120_agreement"] = float(np.mean(first == full[:120]))
    # Adjacent, unseen material is evaluated under the frozen 120-rune calibration.
    source = output["lengths"]["729"]["windows_120"]
    output["heldout_five_window_pmax"] = [w["pmax"] for w in source[1:]]
    output["heldout_five_mean_pmax"] = float(np.mean(output["heldout_five_window_pmax"]))
    output["heldout_five_best_registers"] = [w["best_register"] for w in source[1:]]
    atomic_json(WORKSPACE / "oracle-output" / "oracle.json", output)
    print("FINAL "+json.dumps({
        "first120_score": source[0]["pmax"],
        "five_heldout_mean_pmax": output["heldout_five_mean_pmax"],
        "five_heldout_max_pmax": max(output["heldout_five_window_pmax"]),
        "five_heldout_registers": output["heldout_five_best_registers"],
        "full_vs_screen_first120_agreement": output["full_vs_screen_first120_agreement"],
        "source": "independent R36-original panel, original runner and original unsolved LP2 rune stream",
    }), flush=True)


if __name__ == "__main__":
    main()
