#!/usr/bin/env python3
"""Blind F5 256B calibration: JPEG DCT magnitude shrinkage versus re-rendered ink.

The only JPEGs inspected before a strict heldout pass are artificial, author-
independent renderings. All positive JPEGs must roundtrip the pinned F5 v1.0.0
extractor. The original 26 unresolved LP2 carriers are NEVER read here.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import tempfile

import cv2
from filelock import FileLock
import numpy as np
from PIL import Image
from blind274_gate import make_pair

TRAIN = 24
HOLDOUT = 50
F5_THRESHOLD = 0.90
FP_LIMIT = 1


def command(args: list[str]) -> str:
    proc = subprocess.run(args, capture_output=True, text=True, check=True, timeout=180)
    return proc.stdout


def render(source: Path, path: Path, name: str) -> None:
    pixels = cv2.imread(str(source), cv2.IMREAD_UNCHANGED)
    if pixels is None:
        raise RuntimeError(f"Cannot read {source}")
    if name == "median":
        filtered = cv2.medianBlur(pixels, 3)
    elif name == "gaussian":
        filtered = cv2.GaussianBlur(pixels, (3, 3), 0.65)
    else:
        raise ValueError(name)
    if filtered.ndim == 3:
        filtered = cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(filtered)
    with tempfile.NamedTemporaryFile(suffix=".jpg", dir=path.parent, delete=False) as f:
        tmp = Path(f.name)
    try:
        image.save(tmp, "JPEG", quality=92, subsampling=2)
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def residual(extractor: str, source: Path, rendered: Path) -> np.ndarray:
    data = json.loads(command([extractor, str(source), str(rendered)]))
    plus = np.array(data["plus"], dtype=np.float64)
    minus = np.array(data["minus"], dtype=np.float64)
    total = np.array(data["total"], dtype=np.float64)
    if plus.shape != (9,) or not np.all(total > 0):
        raise RuntimeError("Incomplete quantized-DCT residual")
    # Signed shrinkage excess and reconstruction instability, frequency and
    # coefficient-amplitude stratified. No generic JPEG/JET feature vectors.
    return np.r_[(plus - minus) / np.sqrt(total),
                 (plus + minus) / np.sqrt(total)]


def features(extractor: str, original: Path, out: Path) -> np.ndarray:
    vectors = []
    for method in ("median", "gaussian"):
        reconstruction = out / f"{original.stem}-{method}.jpg"
        render(original, reconstruction, method)
        vectors.append(residual(extractor, original, reconstruction))
        reconstruction.unlink()
    return np.concatenate(vectors)


def fit_and_score(rows: list[dict], mode: str) -> tuple[dict, list[dict]]:
    train = [r for r in rows if r["mode"] == mode and r["family"] < TRAIN]
    test = [r for r in rows if r["mode"] == mode and r["family"] >= TRAIN]
    clean = np.stack([r["features"] for r in train if r["class"] == "clean"])
    f5 = np.stack([r["features"] for r in train if r["class"] == "f5"])
    assert clean.shape == (TRAIN, 36) and f5.shape == (TRAIN, 36)
    mu = clean.mean(axis=0)
    # Fixed, image-independent, shrinkage-direction normal score with
    # training-pair contrast and diagonal clean covariance calibration.
    delta = (f5 - clean).mean(axis=0)
    scale = np.var(clean, axis=0, ddof=1) + 0.25
    weights = delta / scale
    weight_norm = np.linalg.norm(weights)
    if weight_norm > 0:
        weights /= weight_norm
    threshold = float(np.max((clean - mu) @ weights) + 1e-9)
    for row in test:
        row["score"] = float((np.asarray(row["features"]) - mu) @ weights)
        row["flag"] = bool(row["score"] > threshold)
    passclean = sum(r["flag"] for r in test if r["class"] == "clean")
    passf5 = sum(r["flag"] for r in test if r["class"] == "f5")
    data = {
        "mode": mode, "train_families": TRAIN, "test_families": HOLDOUT,
        "train_delta_l2": float(np.linalg.norm(delta)),
        "threshold_max_train_clean": threshold,
        "heldout_exact_f5_detected": passf5,
        "heldout_exact_f5_total": HOLDOUT,
        "heldout_clean_false_positive": passclean,
        "heldout_clean_total": HOLDOUT,
        "frozen_weights": weights.tolist(),
    }
    return data, test


def atomic_report(path: Path, report: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", dir=path.parent,
                                         prefix=".f5shrink-", suffix=".json", delete=False) as f:
            temp = Path(f.name)
            json.dump(report, f, sort_keys=True, indent=2)
            f.write("\n")
        os.replace(temp, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--f5", required=True)
    parser.add_argument("--embedder", required=True)
    parser.add_argument("--residual", required=True)
    parser.add_argument("--workdir", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    args.workdir.mkdir(parents=True, exist_ok=True)
    rows = []
    for family in range(TRAIN + HOLDOUT):
        for mode in ("L", "RGB"):
            cover, stego = make_pair(family, mode, args.workdir, args.f5, args.embedder)
            for name, source in (("clean", cover), ("f5", stego)):
                vector = features(args.residual, source, args.workdir)
                rows.append({"family": family, "mode": mode, "class": name,
                             "features": vector.tolist()})
        if family % 10 == 9:
            print(f"EXACT_F5_FAMILIES={family + 1}/74", flush=True)
    results = []
    selected = []
    for mode in ("L", "RGB"):
        result, holdout = fit_and_score(rows, mode)
        results.append(result)
        selected.extend(holdout)
        print("F5_RESIDUAL_HELDOUT " + json.dumps({k: v for k, v in result.items()
                                                  if k != "frozen_weights"}), flush=True)
    tp = sum(d["heldout_exact_f5_detected"] for d in results)
    fp = sum(d["heldout_clean_false_positive"] for d in results)
    passed = (
        len(selected) == HOLDOUT * 2 * 2
        and fp <= FP_LIMIT
        and all(d["heldout_exact_f5_detected"] >= F5_THRESHOLD * HOLDOUT for d in results)
    )
    report = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "algorithm": "physical F5 magnitude-shrinkage DCT residual against independent median and Gaussian same-ink re-renderings; matched training delta, diagonal clean covariance",
        "training_art_families": TRAIN,
        "heldout_art_families": HOLDOUT,
        "positive_controls_exact_extract_verified": 2 * (TRAIN + HOLDOUT),
        "required_f5_sensitivity_per_mode": F5_THRESHOLD,
        "max_allowed_clean_false_positives": FP_LIMIT,
        "modes": results,
        "overall_holdout_tp": tp,
        "overall_holdout_fp": fp,
        "gate_passed": passed,
        "originals_examined": False,
        "cases": [{"family": r["family"], "mode": r["mode"], "class": r["class"],
                   "score": r["score"], "flag": r["flag"]} for r in selected],
    }
    atomic_report(args.report, report)
    if passed:
        print("CONTROL_GATE_PASSED: original scan separately requires source-authenticated payload framing")
    else:
        print("CONTROL_GATE_FAILED: 26 unknown manuscript originals strictly withheld")


if __name__ == "__main__":
    main()
