#!/usr/bin/env python3
"""Two high-frequency GP29 allograph controls on original LP2 image ink.

Requires Python 3, NumPy, OpenCV, Pillow, and the original repository source
images/corpus. Deterministic read-only SFT, no OCR, no plaintext decoding.
"""
from collections import Counter, defaultdict
from contextlib import redirect_stdout
import hashlib
import io
import json
from pathlib import Path
import runpy

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
with redirect_stdout(io.StringIO()):
    base = runpy.run_path(str(ROOT / "sims/lp2_original_rune_typography_sft.py"))
source_image, detect, predict = (base[x] for x in ("source_image", "detect", "predict"))
types, templates = base["types"], base["templates"]
corpus = base["CORPUS"]

# Source counts alone choose the identities; no encrypted plaintext or pixels
# are consulted in choosing these two most common original LP2 classes.
frequencies = Counter(k for p in corpus["pages"][:56] for k in p["indices"])
assert frequencies.most_common(2) == [(22, 492), (24, 482)]
RUNE_IDS = (22, 24)  # OE, A
# Freeze six early, independent original pages before estimating templates.
HOLDOUT = (0, 2, 4, 6, 8, 10)
TRAIN = tuple(p for p in range(56) if p not in HOLDOUT and p != 50)
assert len(TRAIN) == 49


def collect(pages):
    output = []
    for page in pages:
        im = source_image(page)
        for row in range(12):
            y0 = 673 + 188 * row
            boxes = detect(im, row, 1032 if page == 55 and row == 3 else 1810)
            if not boxes:
                continue
            labels, scores = predict(boxes, types, templates)
            for box, rune, score in zip(boxes, labels, scores):
                if int(rune) not in RUNE_IDS or float(score) < .90:
                    continue
                left, right, _ = box
                ink = im[y0 - 10:y0 + 125, left:right + 1] < 155
                ys = np.flatnonzero(ink.any(axis=1))
                if not len(ys):
                    raise AssertionError("empty glyph after source detector")
                top = y0 - 10 + int(ys[0])
                tight = ink[int(ys[0]):int(ys[-1])+1].astype(bool)
                output.append({
                    "page": page, "rune": int(rune),
                    "left": int(left), "top": top,
                    "shape": tight.shape, "mask": tight
                })
    return output


def key(sample):
    return (sample["rune"], sample["shape"],
            sample["left"] % 8, sample["top"] % 8)


cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))


def contour_envelope(mask):
    raw = mask.astype(np.uint8)
    dilate = cv2.dilate(raw, cross, iterations=2).astype(bool)
    erode = cv2.erode(raw, cross, iterations=2).astype(bool)
    return dilate & ~erode


train = collect(TRAIN)
held = collect(HOLDOUT)
assert len(train) == 636 and len(held) == 72, (len(train), len(held))
assert Counter(s["rune"] for s in train) == {22: 312, 24: 324}
assert Counter(s["rune"] for s in held) == {22: 44, 24: 28}

groups = defaultdict(list)
for sample in train:
    groups[key(sample)].append(sample)
models = {}
training_totals = defaultdict(lambda: {"groups": 0, "matched": 0,
                                        "different_pixels": 0, "far_pixels": 0})
for identifier, members in groups.items():
    if len(members) < 3:
        continue
    masks = np.stack([x["mask"] for x in members])
    majority = masks.mean(axis=0) >= .5
    edge = contour_envelope(majority)
    diff = masks != majority
    rune = identifier[0]
    models[identifier] = (majority, edge)
    training_totals[rune]["groups"] += 1
    training_totals[rune]["matched"] += len(members)
    training_totals[rune]["different_pixels"] += int(diff.sum())
    training_totals[rune]["far_pixels"] += int((diff & ~edge).sum())

hold_totals = defaultdict(lambda: {"accepted": 0, "matched": 0,
                                   "different_pixels": 0, "far_pixels": 0})
plants = {}
examples = {}
for s in held:
    rune = s["rune"]
    hold_totals[rune]["accepted"] += 1
    if key(s) not in models:
        continue
    majority, edge = models[key(s)]
    diff = s["mask"] != majority
    hold_totals[rune]["matched"] += 1
    hold_totals[rune]["different_pixels"] += int(diff.sum())
    hold_totals[rune]["far_pixels"] += int((diff & ~edge).sum())
    if rune not in examples:
        examples[rune] = {
            "page": s["page"], "left": s["left"], "top": s["top"],
            "binary_mask_sha256": hashlib.sha256(
                np.packbits(s["mask"].ravel()).tobytes()).hexdigest()
        }
        # A 4x4 interior/exterior mark is planted away from the ordinary
        # two-pixel contour; this must be detectable on withheld source ink.
        candidate = (~majority) & (~edge)
        options = [
            (y, x) for y in range(candidate.shape[0] - 3)
            for x in range(candidate.shape[1] - 3)
            if candidate[y:y+4, x:x+4].all()
        ]
        assert options
        y, x = options[len(options)//2]
        planted = s["mask"].copy()
        planted[y:y+4, x:x+4] = True
        plants[rune] = int(((planted != majority) & ~edge).sum())

assert {k:v["groups"] for k,v in training_totals.items()} == {22:39, 24:47}
assert {k:v["matched"] for k,v in training_totals.items()} == {22:146,24:206}
assert {k:v["far_pixels"] for k,v in training_totals.items()} == {22:0,24:0}
assert {k:v["matched"] for k,v in hold_totals.items()} == {22:18,24:16}
assert {k:v["far_pixels"] for k,v in hold_totals.items()} == {22:0,24:0}
assert plants[22] >= 16 and plants[24] >= 16

print(json.dumps({
    "source": "original physical p0-p55 JPEGs, fixed OE/A GP29 identities",
    "scope": "2-pixel contour-exclusion for phase-and-dimension-matched single glyphs",
    "train_pages": list(TRAIN), "heldout_pages": list(HOLDOUT),
    "train": training_totals, "heldout": hold_totals,
    "positive_4x4_dot_far_pixels": plants, "heldout_crop_hashes": examples,
    "decision": "No matched glyph changes outside the ordinary contour envelope; does not exclude one/two-pixel edge modulation, unregistered glyphs, or other channels."
}, indent=2))
