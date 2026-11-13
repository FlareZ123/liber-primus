#!/usr/bin/env python3
"""Predeclared, blind original-format Q92 F5 274-feature positive-control gate.

This program does not open *any* original Liber Primus JPEG until a strict
art-family-disjoint genuine-F5 256-byte calibration passes. A negative or
failed control blocks original scoring rather than labeling the originals
clean. The public 2007 JET C++ source is separately compiled in manual CI.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import random
import subprocess
import tempfile
from time import perf_counter

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from sklearn.model_selection import GroupKFold, GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from filelock import FileLock

SEED = 0x3301274
PASS = "BLIND-F5-Q92-20261113-CONTROL"
WIDTH, HEIGHT = 2400, 3600
TRAIN_FAMILIES = 24
TEST_FAMILIES = 50
HELDOUT_CLEAN_REQUIRED = TEST_FAMILIES * 2
MIN_SENSITIVITY = 0.90
MAX_FALSE_POSITIVES = 1
SOURCE_WORDS = (
    "THE WISE MAY KNOW THAT FROM TIME COMES A NEW PATH AND THE PATH "
    "HOLDS ITS SECRET UNTIL WE SEEK TO LEARN WHAT IS HIDDEN THERE "
    "THEREFORE READ EVERY MARK AND TEST YOUR UNDERSTANDING WHILE "
    "ANCIENT VOICES TEACH THE STUDENT TO SEE AND FIND HIS WAY "
    "TOWARD A CIRCLE OF THOUGHT AND A RETURN TO THE BEGINNING "
    "DO NOT FOLLOW A FALSE NAME FOR THE TRUTH IS FOUND WITHIN"
).split()
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"


def run(argv: list[str], *, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(argv, capture_output=True, text=True, timeout=timeout)
    if proc.returncode:
        raise RuntimeError(f"command failed {argv[:4]}: {proc.stderr[-700:]}")
    return proc


def write_json_locked(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", dir=path.parent,
                                         prefix=".blind274-", suffix=".tmp", delete=False) as f:
            tmp = Path(f.name)
            json.dump(value, f, sort_keys=True, indent=2)
            f.write("\n")
        os.replace(tmp, path)


def make_cover(family: int, mode: str, dest: Path) -> None:
    rng = random.Random(SEED + 2701 * family)
    canvas = Image.new("L", (WIDTH, HEIGHT), 255)
    draw = ImageDraw.Draw(canvas)
    font_size = 27 + 2 * (family % 8)
    font = ImageFont.truetype(FONT, font_size)
    body_x = 380 + (family % 7) * 16
    body_y = 230 + (family % 5) * 22
    step = font_size + 12 + (family % 4)
    max_x = 2050 - (family % 5) * 30
    line_count = min(88, (HEIGHT - body_y - 200) // step)
    # One complete artwork template per family, shared across its two
    # component modes; families and all their modes stay in the same split.
    phase = rng.randrange(len(SOURCE_WORDS))
    for line in range(line_count):
        words: list[str] = []
        x = body_x
        while True:
            word = SOURCE_WORDS[(phase + rng.randrange(len(SOURCE_WORDS))) % len(SOURCE_WORDS)]
            width = draw.textlength(word + " ", font=font)
            if x + width > max_x:
                break
            words.append(word)
            x += width
        line_text = " ".join(words)
        if line % (12 + family % 5) == 0:
            line_text = "IN THE BEGINNING " + line_text[:max(0, len(line_text)-18)]
        draw.text((body_x, body_y + line * step), line_text, fill=5 + family % 7, font=font)
    # Family-specific marginal ornament, independent of F5 embed labels.
    mx = 145 + rng.randrange(90)
    for m in range(8 + family % 9):
        y = 280 + m * (200 + family % 17)
        x = mx + int(42 * ((m + family) % 3 - 1))
        draw.arc((x, y, x + 120, y + 110), 15 * m, 195 + 15 * m, fill=8, width=3 + family % 3)
        draw.line((x+60, y+10, x+60, y+110), fill=8, width=2)
    if family % 3 == 0:
        draw.rectangle((2090, 280, 2130, 3100), outline=11, width=2)
    if family % 7 == 0:
        draw.line((body_x, 3480, max_x, 3480), fill=10, width=3)
    if mode == "RGB":
        canvas = canvas.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".jpg", dir=dest.parent, delete=False) as f:
        temp = Path(f.name)
    try:
        # Identical source Q92 luma quantization, 2400x3600 spatial dimensions,
        # 1 gray versus standard three-component 4:2:0 RGB JPEG.
        canvas.save(temp, format="JPEG", quality=92, subsampling=2)
        os.replace(temp, dest)
    finally:
        if temp.exists():
            temp.unlink()


def payload_for(family: int, mode: str, size: int) -> bytes:
    key = f"F5-BLIND274-GROUP-{family}-MODE-{mode}-SIZE-{size}".encode()
    return b"".join(hashlib.sha256(key + k.to_bytes(4, "big")).digest()
                    for k in range((size + 31) // 32))[:size]


def feature(jet: str, path: Path) -> np.ndarray:
    dest = path.with_suffix(".fea")
    run([jet, "-s", str(path), "-o", str(dest)], timeout=150)
    strings = dest.read_text().split()
    if len(strings) != 275:
        raise RuntimeError(f"Expected 274 historical features + filename, received {len(strings)} for {path}")
    vec = np.array([float(x) for x in strings[:274]], dtype=np.float64)
    if not np.isfinite(vec).all():
        raise RuntimeError(f"Nonfinite historical extractor features {path}")
    dest.unlink()
    return vec


def make_pair(family: int, mode: str, basedir: Path, f5: str, embedder: str) -> tuple[Path, Path]:
    stem = f"f{family:03d}-{mode.lower()}"
    cover = basedir / f"{stem}-cover.jpg"
    stego = basedir / f"{stem}-f5-256.jpg"
    payload = basedir / f"{stem}-payload.bin"
    extracted = basedir / f"{stem}-extract.bin"
    make_cover(family, mode, cover)
    payload.write_bytes(payload_for(family, mode, 256))
    run([embedder, "-cover", str(cover), "-payload", str(payload),
         "-password", PASS, "-k", "4", "-out", str(stego)])
    run([f5, "extract", str(stego), "-p", PASS, "-o", str(extracted)])
    if extracted.read_bytes() != payload.read_bytes():
        raise RuntimeError(f"True-F5 v1.0.0 control failed exact extraction: {family} {mode}")
    return cover, stego


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--jet", required=True)
    ap.add_argument("--f5", required=True)
    ap.add_argument("--embedder", required=True)
    ap.add_argument("--workdir", type=Path, required=True)
    ap.add_argument("--report", type=Path, required=True)
    ap.add_argument("--train-families", type=int, default=TRAIN_FAMILIES)
    ap.add_argument("--test-families", type=int, default=TEST_FAMILIES)
    ap.add_argument("--screen", action="store_true")
    ap.add_argument("--originals", type=Path)
    args = ap.parse_args()
    args.workdir.mkdir(parents=True, exist_ok=True)
    start = perf_counter()
    items = []
    for fam in range(args.train_families + args.test_families):
        for mode in ("L", "RGB"):
            cover, stego = make_pair(fam, mode, args.workdir, args.f5, args.embedder)
            items.append((fam, mode, "clean", cover))
            items.append((fam, mode, "f5", stego))
        if fam % 10 == 9:
            print(f"EXACT_F5_CONTROLS families={fam+1}, seconds={perf_counter()-start:.1f}", flush=True)
    # Historical C++ extractor only, no synthetic approximation. Features are
    # independently extracted for each verified original-format control.
    vectors: list[np.ndarray | None] = [None] * len(items)
    with ThreadPoolExecutor(max_workers=2) as executor:
        jobs = {executor.submit(feature, args.jet, item[3]): i
                for i, item in enumerate(items)}
        for done in as_completed(jobs):
            ix = jobs[done]
            vectors[ix] = done.result()
            if sum(v is not None for v in vectors) % 30 == 0:
                print(f"JET_274 {sum(v is not None for v in vectors)}/{len(vectors)}"
                      f" elapsed={perf_counter()-start:.1f}s", flush=True)
    X = np.stack(vectors)
    groups = np.array([x[0] for x in items])
    labels = np.array([int(x[2] == "f5") for x in items])
    mode = np.array([x[1] for x in items])
    train = groups < args.train_families
    test = ~train
    # One prespecified SVC family, with training-only grouped 4-fold tuning.
    # All same-family RGB/gray control variants stay on one side of each fold.
    grid = GridSearchCV(
        make_pipeline(StandardScaler(), SVC(kernel="rbf", gamma="scale", class_weight="balanced")),
        {"svc__C": [0.1, 1, 10]},
        cv=GroupKFold(n_splits=4),
        scoring="balanced_accuracy",
        n_jobs=1,
    )
    grid.fit(X[train], labels[train], groups=groups[train])
    score_train = grid.decision_function(X[train])
    # Frozen, deliberately conservative threshold: maximum training clean
    # score + 1e-9. No held-out or original labels influence the cutoff.
    threshold = float(score_train[labels[train] == 0].max() + 1e-9)
    score_test = grid.decision_function(X[test])
    ytest = labels[test]
    pred = score_test > threshold
    mtest = mode[test]
    tp = int(np.sum(pred & (ytest == 1)))
    fn = int(np.sum(~pred & (ytest == 1)))
    fp = int(np.sum(pred & (ytest == 0)))
    tn = int(np.sum(~pred & (ytest == 0)))
    by_mode = {
        m: {
            "positive_detected": int(np.sum(pred & (ytest == 1) & (mtest == m))),
            "positive_total": int(np.sum((ytest == 1) & (mtest == m))),
            "clean_false_positive": int(np.sum(pred & (ytest == 0) & (mtest == m))),
            "clean_total": int(np.sum((ytest == 0) & (mtest == m))),
        }
        for m in ("L", "RGB")
    }
    passed = (
        np.sum(ytest == 0) >= 100
        and fp <= MAX_FALSE_POSITIVES
        and all(by_mode[m]["positive_detected"] >= 0.9 * by_mode[m]["positive_total"]
                for m in by_mode)
    )
    output = {
        "method": "2007 Pevny-Fridrich historical JET 274-D merged DCT-Markov plus 1 frozen RBF SVC",
        "gate": "strict family-disjoint 256-byte genuine v1.0.0 F5; both Q92 L/RGB; >=90% per-mode TPR and <=1/100 FPR",
        "source_Q": 92, "source_pixels": [WIDTH, HEIGHT], "source_password": "synthetic control only",
        "embedding_K": 4, "true_extract_controls": len(items)//2,
        "train_families": args.train_families, "heldout_families": args.test_families,
        "nested_group_cv_best_C": grid.best_params_["svc__C"],
        "train_group_cv_balanced_accuracy": float(grid.best_score_),
        "threshold_frozen_from_training_clean_max": threshold,
        "test_tp": tp, "test_fn": fn, "test_fp": fp, "test_tn": tn,
        "by_mode": by_mode, "calibration_pass": bool(passed),
        "total_seconds": round(perf_counter() - start, 2),
        "originals_examined": False,
    }
    print("HELDOUT_CALIBRATION " + json.dumps(output, sort_keys=True), flush=True)
    # Only if all gates pass is it permissible to inspect source originals.
    if args.screen and passed:
        if args.originals is None:
            raise RuntimeError("Originals path required only after calibration pass")
        original_scores = []
        for page in range(58):
            input_image = args.originals / f"{page+17:02d}.jpg"
            v = feature(args.jet, input_image)
            original_scores.append({
                "page": page,
                "blind_score": float(grid.decision_function(v.reshape(1, -1))[0]),
            })
        output["originals_examined"] = True
        # No 58-way corrected positive/negative claims are authorized without
        # a separate clean-original-family max-score null.
        output["original_page_scores_exploratory_unadjusted"] = original_scores
        print("ORIGINAL_SCORING_EXPLORATORY_ONLY", len(original_scores), flush=True)
    elif args.screen:
        print("ORIGINAL_SCREEN_WITHHELD: failed independently heldout F5 detection gate", flush=True)
    write_json_locked(args.report, output)
    print(f"REPORT {args.report}", flush=True)


if __name__ == "__main__":
    main()
