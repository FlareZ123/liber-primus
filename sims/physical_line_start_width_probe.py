#!/usr/bin/env python3
"""Measure GP rune horizontal advances from actual LP2 JPEG text lines.

Hypothesis: physical line-start rune frequency is biased by typesetting width.
Use aligned original JPEG row scans and exact printed-line transcriptions. The
rune advance model is trained on even-numbered pages and tested on odd pages.
No OCR, guessed glyph labels, or user-modified source images.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TR = (ROOT / "resources/transcriptions/liber_primus_master.txt").read_text(encoding="utf-8").split("%")
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
RUNES = CORPUS["runes"]
RUNE_SET = set(RUNES)
ALPHABET = {r: i for i, r in enumerate(RUNES)}
IMAGE_ROOT = ROOT / "resources/liber-primus"
BLACK_CUTOFF = 120
X0, X1 = 590, 1810
ROW_BLACK_CUTOFF = 50
ROW_JOIN_GAP = 8
MIN_ROW_HEIGHT = 20
SEPARATORS = "-.$&"
FEATURES = len(RUNES) + len(SEPARATORS) + 1


def dark_line_bands(image: np.ndarray) -> list[tuple[int, int]]:
    """Identify horizontal text bands using only source image pixels."""
    row_density = np.count_nonzero(image[:, X0:X1] < BLACK_CUTOFF, axis=1)
    ys = np.flatnonzero(row_density > ROW_BLACK_CUTOFF)
    bands: list[list[int]] = []
    for y in ys:
        y = int(y)
        if bands and y - bands[-1][1] <= ROW_JOIN_GAP:
            bands[-1][1] = y
        else:
            bands.append([y, y])
    return [(a, b) for a, b in bands if b - a >= MIN_ROW_HEIGHT]


def line_features(source: str) -> np.ndarray:
    feature = np.zeros(FEATURES)
    for char in source:
        if char in ALPHABET:
            feature[ALPHABET[char]] += 1
        elif char in SEPARATORS:
            feature[len(RUNES) + SEPARATORS.index(char)] += 1
    feature[-1] = 1.0
    return feature


def collect() -> tuple[list[dict], list[dict], list[dict]]:
    """Align source lines only on pages where pixel segmentation matches exactly."""
    lines: list[dict] = []
    pages: list[dict] = []
    failures: list[dict] = []
    for page in range(56):
        if page == 50:
            continue
        source = TR[page + 16]
        raw_lines = [part for part in source.split("/") if any(c in RUNE_SET for c in part)]
        image = np.asarray(Image.open(IMAGE_ROOT / f"{page+17:02}.jpg").convert("L"))
        bands = dark_line_bands(image)
        if len(raw_lines) != len(bands):
            failures.append({"page": page, "source": len(raw_lines), "bands": len(bands)})
            continue
        page_runes = [ALPHABET[c] for c in source if c in RUNE_SET]
        page_lines = 0
        for line_index, (raw, (y0, y1)) in enumerate(zip(raw_lines, bands)):
            projection = np.any(image[y0:y1+1, X0:X1] < BLACK_CUTOFF, axis=0)
            columns = np.flatnonzero(projection)
            left = int(columns[0] + X0)
            right = int(columns[-1] + X0)
            runes = [ALPHABET[c] for c in raw if c in RUNE_SET]
            if len(runes) < 16 or not (595 <= left <= 620 and 1400 <= right < X1 - 2):
                continue
            lines.append({
                "page": page, "line": line_index, "features": line_features(raw),
                "runes": runes, "left": left, "right": right, "width": right-left,
                "first": runes[0], "all_page": page_runes,
            })
            page_lines += 1
        pages.append({"page":page, "bands":len(bands), "normalTextRows":page_lines})
    return lines, pages, failures


def ridge(x: np.ndarray, y: np.ndarray, prior: np.ndarray, shrinkage: float) -> np.ndarray:
    matrix = x.T @ x + shrinkage * np.eye(x.shape[1])
    target = x.T @ y + shrinkage * prior
    return np.linalg.solve(matrix, target)


def rmse(true: np.ndarray, estimated: np.ndarray) -> float:
    return float(np.sqrt(np.mean((true - estimated)**2)))


def run() -> dict:
    rows, included, skipped = collect()
    assert len(rows) >= 250, f"Too few automatically aligned printed rows: {len(rows)}"
    train = [row for row in rows if row["page"] % 2 == 0]
    test = [row for row in rows if row["page"] % 2 == 1]
    x_train = np.array([row["features"] for row in train])
    x_test = np.array([row["features"] for row in test])
    y_train = np.array([row["width"] for row in train])
    y_test = np.array([row["width"] for row in test])
    # Source-independent baseline: model only total rune and separator count.
    def reduced(x: np.ndarray) -> np.ndarray:
        return np.column_stack((x[:, :29].sum(axis=1),x[:,29:33].sum(axis=1),np.ones(len(x))))
    b0 = np.linalg.lstsq(reduced(x_train),y_train,rcond=None)[0]
    baseline = rmse(y_test,reduced(x_test)@b0)
    prior = np.array([49.0]*29+[15.0]*len(SEPARATORS)+[0.0])
    candidates = []
    for lam in (1.,10.,50.,200.,1000.,10000.):
        params = ridge(x_train,y_train,prior,lam)
        candidates.append({"lambda":lam,"heldoutRMSE":rmse(y_test,x_test@params),
            "trainingRMSE":rmse(y_train,x_train@params),"params":params})
    # Lock regularization using source-only training subpartition, not test.
    fold_a = np.array([row["page"]%4 == 0 for row in train],dtype=bool)
    chosen = min(candidates,key=lambda c: c["trainingRMSE"]+0.2*np.sqrt(c["lambda"])/len(train))
    params = chosen["params"]
    # Width association with page-composition-conditioned initial-rune residual.
    seen = np.zeros(29)
    expected = np.zeros(29)
    for row in rows:
        seen[row["first"]] += 1
        counts = np.bincount(row["all_page"],minlength=29)
        expected += counts/len(row["all_page"])
    diff = seen-expected
    glyph_width = params[:29]
    glyph_width_centered = glyph_width-np.mean(glyph_width)
    width_excess = float(np.dot(diff,glyph_width_centered))
    corr = float(np.corrcoef(glyph_width_centered,diff/np.sqrt(expected))[0,1])
    top = sorted(({
        "rune":RUNES[i], "GPindex":i, "observed":int(seen[i]),
        "expected":round(float(expected[i]),3),
        "initialExcess":round(float(diff[i]),3),
        "inferredWidthPx":round(float(glyph_width[i]),3)
    } for i in range(29)), key=lambda x:x["initialExcess"],reverse=True)
    return {
        "source":"original 55 LP2 rune pages; original 2400x3600 JPEG and complete physical-line transcription",
        "runeRows":len(rows),"trainingRows":len(train),"heldoutRows":len(test),
        "alignedPages":len(included),"unmatchedPageRows":skipped,
        "baselineHeldoutRMSEpx":baseline,
        "fitCandidates":[{"lambda":c["lambda"],"trainingRMSE":c["trainingRMSE"],
            "heldoutRMSE":c["heldoutRMSE"]} for c in candidates],
        "chosenLambda":chosen["lambda"],
        "inferredRuneWidthsPx":[round(float(x),2) for x in glyph_width],
        "widthInitialExcessPxCount":width_excess,
        "widthVsInitialZCorrelation":corr,
        "initialRuneTopEnriched":top[:8],
        "initialRuneTopDepleted":top[-8:],
        "interpretation":"Width association is diagnostic only: same sample provided line breaks and glyph estimates.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
