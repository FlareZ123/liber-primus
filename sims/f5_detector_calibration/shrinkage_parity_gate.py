#!/usr/bin/env python3
"""Source-format F5 Q92 raw-coefficient shrinkage/parity-spectrum gate.

This is deliberately disjoint from the 2007 JET 274D DCT/Markov classifier:
only ten exact absolute-value histogram bins in three natural-DCT frequency
bands are used. No source LP2 image is opened until a strict genuine-F5 gate
passes, and the training/heldout art-family splits are frozen in advance.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from time import perf_counter

import numpy as np
from scipy.stats import norm
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from blind274_gate import (
    make_cover, payload_for, write_json_locked, WIDTH, HEIGHT, PASS,
)

TRAIN_FAMILIES = 24
HELDOUT_FAMILIES = 50
PAYLOAD_BYTES = 256
FAMILYWISE_ALPHA = 0.01
TOTAL_PAGE_COMPARISONS = 58
SOURCE_BAND_CUTS = (3, 7, 14)
K = 4


def command(argv: list[str], timeout: int = 180) -> str:
    done = subprocess.run(argv, check=False, capture_output=True, text=True, timeout=timeout)
    if done.returncode:
        raise RuntimeError(f"command {argv[:4]} failed: {done.stderr[-1000:]}")
    return done.stdout


def native_histogram(executable: str, jpeg: Path, mode: str) -> np.ndarray:
    lines = command([executable, str(jpeg)], timeout=90).splitlines()
    expected_components = 1 if mode == "L" else 3
    if len(lines) != expected_components * 3:
        raise ValueError(f"bad histogram row count for {jpeg}: {len(lines)}")
    rows = np.array([[int(x) for x in line.split(",")] for line in lines], dtype=np.float64)
    if rows.shape != (expected_components * 3, 13):
        raise ValueError(f"bad exact JPEG coefficient histogram: {rows.shape}")
    features: list[float] = []
    for component in range(expected_components):
        for band in range(3):
            row = rows[3 * component + band]
            if int(row[0]) != component or int(row[1]) != band:
                raise ValueError("JPEG component-band index mismatch")
            total = row[2]
            h = row[3:]
            if int(np.sum(h)) != total or total <= 0:
                raise ValueError("incomplete JPEG frequency-band coefficient census")
            occupied = np.sum(h[1:])
            finite_occupied = np.sum(h[1:9])
            features.extend((
                float(np.log((h[1] + 0.5) / (h[2] + 0.5))),
                float(np.log((h[2] + 0.5) / (h[3] + 0.5))),
                float(np.log((h[3] + 0.5) / (h[4] + 0.5))),
                float((np.sum(h[[1, 3, 5, 7]]) - np.sum(h[[2, 4, 6, 8]]))
                      / (finite_occupied + 1)),
                float(occupied / total),
                float(h[1] / (occupied + 1)),
            ))
    vec = np.asarray(features, dtype=np.float64)
    if not np.isfinite(vec).all():
        raise ValueError("nonfinite coefficient spectrum")
    return vec


def pair(family: int, mode: str, work: Path, f5: str, embedder: str) -> tuple[Path, Path, str]:
    stem = f"f{family:03d}-{mode.lower()}"
    clean = work / f"{stem}-clean.jpg"
    stego = work / f"{stem}-f5.jpg"
    payfile = work / f"{stem}-payload.bin"
    extracted = work / f"{stem}-extracted.bin"
    make_cover(family, mode, clean)
    payload = payload_for(family, mode, PAYLOAD_BYTES)
    payfile.write_bytes(payload)  # disposable local control fixture
    command([
        embedder, "-cover", str(clean), "-payload", str(payfile),
        "-password", PASS, "-k", str(K), "-out", str(stego),
    ], timeout=300)
    command([f5, "extract", str(stego), "-p", PASS, "-o", str(extracted)], timeout=300)
    recovered = extracted.read_bytes()
    if recovered != payload:
        raise RuntimeError(f"F5 true-extraction failed family={family} mode={mode}")
    digest = hashlib.sha256(payload).hexdigest()
    return clean, stego, digest


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--hist", required=True)
    ap.add_argument("--f5", required=True)
    ap.add_argument("--embedder", required=True)
    ap.add_argument("--workdir", type=Path, required=True)
    ap.add_argument("--report", type=Path, required=True)
    ap.add_argument("--screen", action="store_true")
    ap.add_argument("--originals", type=Path)
    args = ap.parse_args()
    args.workdir.mkdir(parents=True, exist_ok=True)
    start = perf_counter()
    corpus: dict[str, dict[str, list]] = {
        m: {"family": [], "label": [], "feature": [], "sha256": []}
        for m in ("L", "RGB")
    }
    for family in range(TRAIN_FAMILIES + HELDOUT_FAMILIES):
        for mode in ("L", "RGB"):
            cover, stego, digest = pair(family, mode, args.workdir, args.f5, args.embedder)
            for label, path in ((0, cover), (1, stego)):
                corpus[mode]["family"].append(family)
                corpus[mode]["label"].append(label)
                corpus[mode]["feature"].append(native_histogram(args.hist, path, mode))
                corpus[mode]["sha256"].append(digest)
        if family % 10 == 9:
            print(f"EXACT_F5_PAIRS families={family + 1} elapsed={perf_counter()-start:.1f}", flush=True)

    output = {
        "method": "Exact libjpeg AC magnitude spectrum, frequency-band parity and occupancy, L2 logistic regression; no JET 274D features",
        "training": "24 artwork families, two JPEG modes; labels strictly paired within family",
        "test": "50 disjoint artwork families; genuine extractor-verified 256-byte F5 v1.0.0 K4",
        "threshold": "per-mode maximum of training clean scores and mean + normal_0.01/58_quantile * sample SD; frozen without heldout labels",
        "familywise_alpha_nominal": FAMILYWISE_ALPHA,
        "familywise_page_count": TOTAL_PAGE_COMPARISONS,
        "familywise_tail_model": "normal score tail approximation only, subject to heldout coverage checks",
        "source_pixels": [WIDTH, HEIGHT], "jpeg_quality": 92, "jpeg_subsampling": "4:2:0 RGB",
        "source_images_examined": False, "f5_extractions_verified": 2 * (TRAIN_FAMILIES + HELDOUT_FAMILIES),
        "f5_payload_length": PAYLOAD_BYTES, "matrix_k": K, "frequency_bands": SOURCE_BAND_CUTS,
        "mode_results": {},
    }
    total_fp = 0
    calibrated = True
    model = {}
    for mode in ("L", "RGB"):
        z = corpus[mode]
        X = np.stack(z["feature"])
        y = np.asarray(z["label"], dtype=int)
        families = np.asarray(z["family"], dtype=int)
        fit = families < TRAIN_FAMILIES
        test = ~fit
        estimator = make_pipeline(
            StandardScaler(), LogisticRegression(C=0.1, max_iter=1000, random_state=0)
        )
        estimator.fit(X[fit], y[fit])
        score_train = estimator.decision_function(X[fit])
        clean_train = score_train[y[fit] == 0]
        sample_mean = float(clean_train.mean())
        sample_sd = float(clean_train.std(ddof=1))
        ztail = float(norm.ppf(1 - FAMILYWISE_ALPHA / TOTAL_PAGE_COMPARISONS))
        threshold = max(
            float(clean_train.max() + 1e-9),
            sample_mean + ztail * sample_sd,
        )
        score_test = estimator.decision_function(X[test])
        ytest = y[test]
        flagged = score_test > threshold
        tp = int(np.sum(flagged & (ytest == 1)))
        fp = int(np.sum(flagged & (ytest == 0)))
        total_fp += fp
        if tp < 45:
            calibrated = False
        output["mode_results"][mode] = {
            "training_clean_mean": sample_mean,
            "training_clean_sd": sample_sd,
            "58_way_gaussian_z": ztail,
            "frozen_threshold": threshold,
            "heldout_true_positive": tp,
            "heldout_false_negative": int(np.sum(~flagged & (ytest == 1))),
            "heldout_false_positive": fp,
            "heldout_true_negative": int(np.sum(~flagged & (ytest == 0))),
            "heldout_clean_score_range": [float(score_test[ytest == 0].min()), float(score_test[ytest == 0].max())],
            "heldout_f5_score_range": [float(score_test[ytest == 1].min()), float(score_test[ytest == 1].max())],
            "heldout_scores_by_family": [
                {"family": int(f), "truth_f5": bool(v), "score": float(s)}
                for f, v, s in zip(families[test], ytest, score_test)
            ],
        }
        model[mode] = (estimator, threshold)
    calibrated &= total_fp <= 1
    output["all_mode_clean_false_positives"] = total_fp
    output["control_gate_passed"] = bool(calibrated)
    output["seconds"] = round(perf_counter() - start, 2)
    print("F5_HELDOUT_GATE " + json.dumps({
        "passed": calibrated,
        "false_positives": total_fp,
        "sensitivities": {
            m: output["mode_results"][m]["heldout_true_positive"]
            for m in ("L", "RGB")
        },
    }, sort_keys=True), flush=True)
    if args.screen and calibrated:
        if args.originals is None:
            raise ValueError("Original image directory required only after successful calibration")
        known_scorable = set((4, 5, 6, 7, 9, 11, 13, 10, 12, 14,
                              34, 35, 36, 37, 38, 39, *range(40, 56)))
        original_scores = []
        for physical in range(58):
            if physical in known_scorable:
                continue
            path = args.originals / f"{physical+17:02d}.jpg"
            from PIL import Image
            with Image.open(path) as im:
                mode = "L" if im.mode == "L" else "RGB"
            x = native_histogram(args.hist, path, mode)
            estimator, threshold = model[mode]
            score = float(estimator.decision_function(x.reshape(1, -1))[0])
            original_scores.append({
                "physical": physical, "mode": mode, "score": score,
                "frozen_threshold": threshold, "flag": score > threshold,
            })
        output["source_images_examined"] = True
        output["original_26_scores"] = original_scores
        print("ORIGINAL_26_SCORED flags=" + str(sum(x["flag"] for x in original_scores)), flush=True)
    elif args.screen:
        print("ORIGINALS_WITHHELD: independent genuine-F5 calibration failed", flush=True)
    write_json_locked(args.report, output)
    print("REPORT " + str(args.report), flush=True)


if __name__ == "__main__":
    main()
