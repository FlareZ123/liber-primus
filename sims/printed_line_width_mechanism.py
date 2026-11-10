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
    black = pixels[350:3200, 595:1810] < 140
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
        left, right = 595 + int(ink[0]), 595 + int(ink[-1])
        if left < 590 or left > 730 or right > 1809 or right - left < 250:
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



def heldout_greedy_wrap(rows, widths, right_margin):
    """Test whether the next glyph overflows independently frozen page width.

    Restrict to genuine mid-word printed-line breaks. Keep each page's actual
    set of successor runes fixed in random controls, permuting which visual
    residual gap each successor rune would need to clear.
    """
    by_page = {}
    for row in rows:
        by_page.setdefault(row["page"], []).append(row)
    groups = []
    for page_rows in by_page.values():
        pairs = []
        for previous, successor in zip(page_rows[:-1], page_rows[1:]):
            if previous["line"][-1] in INDEX:
                pairs.append((right_margin - previous["right"], widths[successor["rune"]]))
        if len(pairs) >= 2:
            groups.append(np.asarray(pairs, dtype=float))
    assert sum(len(g) for g in groups) > 45
    def gate(group):
        gap = group[:,0]
        w = group[:,1]
        return (np.count_nonzero(w > gap),
                np.maximum(gap-w, 0).sum(),
                float(np.dot(gap-gap.mean(),w-w.mean())))
    actual = np.array([gate(g) for g in groups],dtype=float).sum(axis=0)
    random = np.random.default_rng(0x39A11B)
    sample = np.zeros((20000,3),dtype=float)
    for trial in range(len(sample)):
        for group in groups:
            shuffled = group.copy()
            random.shuffle(shuffled[:,1])
            sample[trial] += gate(shuffled)
    n = sum(len(g) for g in groups)
    return {
        "source":"Genuine within-word printed wraps; page-specific next-rune multiset fixed in controls",
        "trainingFrozenRightMarginPx":right_margin,
        "pages":len(groups), "wraps":n,
        "observedOverflowFraction":float(actual[0]/n),
        "nullOverflowMean":float(sample[:,0].mean()/n),
        "overflowUpperP":float((1+np.count_nonzero(sample[:,0]>=actual[0]))/(len(sample)+1)),
        "observedMeanUnfilledPx":float(actual[1]/n),
        "nullMeanUnfilledPx":float(sample[:,1].mean()/n),
        "unfilledLowerP":float((1+np.count_nonzero(sample[:,1]<=actual[1]))/(len(sample)+1)),
        "gapWidthCovariance":float(actual[2]/n),
        "nullGapWidthMean":float(sample[:,2].mean()/n),
        "covarianceUpperP":float((1+np.count_nonzero(sample[:,2]>=actual[2]))/(len(sample)+1)),
        "caution":"The model is necessary only for naive greedy single-glyph wrapping, with no lookahead to punctuation, word breaks, kerning, or justification."
    }



def source_pixel_break_prediction(rows, model, baseline, capacity):
    """Predict actual held-out line ends with widths learned only from train JPEGs."""
    def evaluate(weights):
        by_page = {}
        for row in rows:
            by_page.setdefault(row["page"], []).append(row)
        counts = {name:0 for name in (
            "total", "exact", "withinOne", "withinTwo",
            "withinWordTotal", "withinWordExact", "withinWordWithinOne"
        )}
        error = 0
        mapping = {letter:float(weights[i+1]) for i,letter in enumerate(VARIABLES)}
        for page_rows in by_page.values():
            for previous, successor in zip(page_rows[:-1], page_rows[1:]):
                chain = previous["line"]+successor["line"]
                consumed = float(weights[0])
                actual_length = len(previous["line"])
                predicted_length = 0
                for letter in chain:
                    next_advance = mapping.get(letter,0.0)
                    if consumed+next_advance>capacity:
                        break
                    consumed += next_advance
                    predicted_length += 1
                distance = abs(predicted_length - actual_length)
                counts["total"]+=1
                counts["exact"]+=int(distance==0)
                counts["withinOne"]+=int(distance<=1)
                counts["withinTwo"]+=int(distance<=2)
                if previous["line"][-1] in INDEX:
                    counts["withinWordTotal"]+=1
                    counts["withinWordExact"]+=int(distance==0)
                    counts["withinWordWithinOne"]+=int(distance<=1)
                error+=distance
        counts["meanAbsoluteRuneBreakError"] = float(error/counts["total"])
        return counts
    return {
        "frozenCapacityPx":float(capacity),
        "pixelLearned":evaluate(model),
        "equalRuneWidth":evaluate(baseline),
        "explanation":"Whole next-line prefixes are used only to measure distance from each independently predicted boundary; all glyph advances and physical capacity are fitted on early image pixels."
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
    margin = float(np.max([r["right"] for r in train]))
    capacity = margin - float(np.median([r["left"] for r in train]))
    constant_widths = np.r_[baseline_coef[0], np.repeat(baseline_coef[1],29), baseline_coef[2:]]
    report = {
        "source":"Source-exact physical LP2 printed lines and original JPEGs; no OCR",
        "segment":"Pixel threshold 140, x=[595,1810), y=[350,3200), segment row gaps>18",
        "matchedPages":len(pages), "matchedLines":len(rows),
        "matchedPageNumbers":pages, "skippedPageExpectedLineCounts":skipped,
        "train":quality(train,coef), "test":quality(test,coef),
        "baselineConstantRuneWidthTestRMSE":base_rmse,
        "runeWidths":{r:round(float(w),3) for r,w in zip(RUNES,widths)},
        "heldoutInitialWidth":holdout_bias(rows,widths),
        "heldoutGreedyWrap":heldout_greedy_wrap(test,widths,margin),
        "independentImageBreakPrediction":source_pixel_break_prediction(test,coef,constant_widths,capacity),
        "interpretation":"A font-width model is causal evidence only if it predicts heldout source geometry and original line starts; this does not decrypt LP2"
    }
    print(json.dumps(report,indent=2,ensure_ascii=False))


if __name__ == "__main__":
    main()
