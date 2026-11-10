#!/usr/bin/env python3
"""Measure actual Liber Primus printed glyph widths and test the line-start bias.

This uses source-exact transcription for character identity and original JPEG
pixel geometry for measured line lengths. It performs no OCR. Pages rather
than lines are split into train/test sets before fitting rune advance widths.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
MASTER = (ROOT / "resources/transcriptions/liber_primus_master.txt").read_text(encoding="utf-8").split("%")
RUNES = CORPUS["runes"]
INDEX = {r: i for i, r in enumerate(RUNES)}
OTHER = ["-", ".", "&", "$", "§", " "]
VARIABLES = RUNES + OTHER


def source_page(p: int) -> tuple[list[str], list[int]]:
    page = next(x for x in CORPUS["pages"] if x["page"] == p)
    lines = [s.strip() for s in MASTER[p + 16].split("/") if any(c in INDEX for c in s)]
    indices = [INDEX[c] for line in lines for c in line if c in INDEX]
    assert indices == page["indices"], f"source mismatch at page {p}"
    return lines, indices


def line_bounds(page: int, expected: int) -> list[tuple[int, int]] | None:
    """Segment full horizontal text bands from original image, no glyph recognition."""
    with Image.open(ROOT / f"resources/liber-primus/{page + 17:02d}.jpg") as image:
        pixels = np.asarray(image.convert("L"))
    black = pixels[350:3200, 550:1800] < 140
    y = np.flatnonzero(black.sum(axis=1) > 35)
    if y.size == 0:
        return None
    parts = np.split(y, np.flatnonzero(np.diff(y) > 18) + 1)
    bands = [part for part in parts if part.size > 28]
    if len(bands) != expected:
        return None
    bounds = []
    for band in bands:
        lo, hi = max(0, int(band[0]) - 4), min(black.shape[0], int(band[-1]) + 5)
        columns = black[lo:hi].sum(axis=0)
        ink = np.flatnonzero(columns > 2)
        if not ink.size:
            return None
        left, right = 550 + int(ink[0]), 550 + int(ink[-1])
        if left < 585 or left > 720 or right > 1790 or right - left < 250:
            return None
        bounds.append((left, right))
    return bounds


def feature(line: str) -> np.ndarray:
    counts = Counter(line)
    return np.array([counts.get(r, 0) for r in VARIABLES], dtype=float)


def build():
    rows = []
    skipped = {}
    pages = []
    for p in range(56):
        lines, ciphertext = source_page(p)
        if not ciphertext:
            continue
        bounds = line_bounds(p, len(lines))
        if bounds is None:
            skipped[p] = len(lines)
            continue
        pages.append(p)
        for line, (left, right) in zip(lines, bounds):
            rows.append({
                "page": p, "line": line, "width": right - left, "left": left,
                "right": right, "rune": INDEX[next(c for c in line if c in INDEX)],
                "features": feature(line),
            })
    assert len(rows) > 250, f"Only {len(rows)} visually matched lines"
    return rows, pages, skipped


def fit(train):
    x = np.stack([r["features"] for r in train])
    y = np.array([r["width"] for r in train], dtype=float)
    # L2 penalize glyph widths toward a common advance size; use centered
    # features so that repeated separators cannot absorb all explanatory power.
    x = np.c_[np.ones(len(x)), x]
    baseline = np.r_[0.0, np.repeat(40.0, len(VARIABLES))]
    penalty = np.diag(np.r_[0.0, np.repeat(1.0, len(VARIABLES))])
    coef = np.linalg.solve(x.T @ x + penalty, x.T @ y + penalty @ baseline)
    return coef


def quality(rows, coef):
    x = np.c_[np.ones(len(rows)), np.stack([r["features"] for r in rows])]
    y = np.array([r["width"] for r in rows])
    predicted = x @ coef
    rmse = float(np.sqrt(np.mean((y - predicted) ** 2)))
    reference = float(np.sqrt(np.mean((y - y.mean()) ** 2)))
    r2 = 1 - rmse**2/reference**2 if reference else None
    return {"n":len(rows), "rmse":rmse, "r2":r2, "meanWidth":float(y.mean()),
            "meanAbsoluteError":float(np.mean(np.abs(y-predicted)))}


def holdout_bias(rows, widths):
    holdout_pages = sorted({r["page"] for r in rows if r["page"] > 27})
    observed = np.zeros(29, dtype=float)
    expected = np.zeros(29, dtype=float)
    pages = []
    for p in holdout_pages:
        _, stream = source_page(p)
        starts = [r["rune"] for r in rows if r["page"] == p]
        obs = np.bincount(starts, minlength=29)
        exp = np.bincount(stream, minlength=29)*len(starts)/len(stream)
        observed += obs
        expected += exp
        pages.append((stream, len(starts), obs, exp))
    effects = (observed-expected)/np.sqrt(expected)
    obs_stat = float(np.dot(widths-widths.mean(), observed-expected))
    rng = np.random.default_rng(0x39B1A5)
    vals = []
    # The previous first-rune test has stronger page/position-preserving cyclic
    # controls. With the fitted weights frozen, here use simple exact marginals
    # to test the independently held-out rune identity/width relationship.
    for _ in range(20000):
        score = 0.0
        for stream, n, _, exp in pages:
            hist = np.bincount(rng.choice(stream,n,replace=False),minlength=29)
            score += float(np.dot(widths-widths.mean(), hist-exp))
        vals.append(score)
    values = np.array(vals)
    return {
        "pages":len(pages), "lines":int(observed.sum()),
        "weightedExcessPx":obs_stat, "nullMean":float(values.mean()),
        "nullSD":float(values.std()),
        "upperTail":float((1+np.count_nonzero(values>=obs_stat))/(len(values)+1)),
        "enriched":[{"rune":RUNES[i], "observed":int(observed[i]),
                     "expected":round(float(expected[i]),3),
                     "fittedAdvance":round(float(widths[i]),2),
                     "z":round(float(effects[i]),2)}
                    for i in np.argsort(-effects)[:6]],
        "depleted":[{"rune":RUNES[i], "observed":int(observed[i]),
                     "expected":round(float(expected[i]),3),
                     "fittedAdvance":round(float(widths[i]),2),
                     "z":round(float(effects[i]),2)}
                    for i in np.argsort(effects)[:6]],
    }


def main():
    rows, pages, skipped = build()
    train = [r for r in rows if r["page"] <= 27]
    test = [r for r in rows if r["page"] > 27]
    assert len(train)>100 and len(test)>100
    coef = fit(train)
    widths = coef[1:30]
    # Competing source-agnostic model: constant rune advance, independent
    # punctuation widths; same penalty and training pages.
    baseline_x = np.array([[1.,sum(r["features"][:29]),*r["features"][29:]]
                            for r in train])
    baseline_y = np.array([r["width"] for r in train])
    baseline_coef = np.linalg.lstsq(baseline_x, baseline_y, rcond=None)[0]
    tx = np.array([[1.,sum(r["features"][:29]),*r["features"][29:]]
                   for r in test])
    true = np.array([r["width"] for r in test])
    base_rmse = float(np.sqrt(np.mean((true-tx@baseline_coef)**2)))
    report = {
        "source":"Source-exact physical LP2 printed lines and original JPEGs; no OCR",
        "segment":"Pixel threshold 140, x=[550,1800), y=[350,3200), segment row gaps>18",
        "matchedPages":len(pages), "matchedLines":len(rows),
        "matchedPageNumbers":pages, "skippedPageExpectedLineCounts":skipped,
        "train":quality(train,coef), "test":quality(test,coef),
        "baselineConstantRuneWidthTestRMSE":base_rmse,
        "runeWidths":{r:round(float(w),3) for r,w in zip(RUNES,widths)},
        "heldoutInitialWidth":holdout_bias(rows,widths),
        "interpretation":"A font-width model is causal evidence only if it predicts heldout source geometry and original line starts; this does not decrypt LP2"
    }
    print(json.dumps(report,indent=2,ensure_ascii=False))


if __name__ == "__main__":
    main()
