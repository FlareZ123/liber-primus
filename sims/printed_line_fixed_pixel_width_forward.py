"""Few-parameter LP2 line-wrap prediction from ORIGINAL source glyph ink widths.

Physical rune ink-width medians are measured using the original manuscript
JPEG first-rune columns (see printed_line_glyph_ink_width.py), independent of
the numerical line-wrap inverse. Across all source images the 29 measured ink
widths are held fixed. On early or late page print breaks, infer only:
  - shared extra per-rune advance h in [0,24]
  - separator and fullstop advance s in [0,42]
  - single fixed line capacity W (exact 1D convex fit)
Then independently test the other physical pages' printed cuts. This is a
source-layout reconstruction, never a decipherment.
"""
from collections import defaultdict
import json

import numpy as np

from printed_line_glyph_ink_width import ROOT, native_observations, GP, INDEX


def source_widths():
    observations, skipped = native_observations()
    buckets = defaultdict(list)
    for subset in observations.values():
        for _, rune, ink in subset:
            buckets[rune].append(ink)
    assert len(buckets) == 29
    return np.array([np.median(buckets[i]) for i in range(29)]), skipped


def source_rows(ink):
    pages = (ROOT / "resources/lp2-transcription.txt").read_text(
        encoding="utf-8"
    ).split("%")[:55]
    rows = []
    rune_count = 0
    for ordinal, text in enumerate(pages):
        physical = ordinal if ordinal < 50 else ordinal + 1
        lines = []
        for line in text.split("/"):
            tokens = []
            for glyph in line.strip():
                if glyph in INDEX:
                    tokens.append(INDEX[glyph])
                elif glyph == "-":
                    tokens.append(29)
                elif glyph == ".":
                    tokens.append(30)
            if tokens:
                rune_count += sum(x < 29 for x in tokens)
                lines.append(tokens)
        for i in range(len(lines)-1):
            current, upcoming = lines[i:i+2]
            if sum(x < 29 for x in current) < 18 or sum(
                x < 29 for x in upcoming
            ) < 18:
                continue
            runes = [x for x in current if x < 29]
            rows.append({
                "page": physical, "source_ink": sum(ink[x] for x in runes),
                "rune_count": len(runes),
                "sep_count": len(current) - len(runes),
                "next": upcoming[0],
                "current": current, "upcoming": upcoming
            })
    assert rune_count == 12956
    assert len(rows) == 501
    return rows


def fit(train, pixel_width):
    base = np.array([x["source_ink"] for x in train])
    n = np.array([x["rune_count"] for x in train])
    p = np.array([x["sep_count"] for x in train])
    nextid = np.array([x["next"] for x in train])
    best = None
    for h in np.arange(0, 24.1, 0.5):
        for s in np.arange(0, 42.1, 1):
            lower = base + n * h + p * s
            upper = lower + np.where(
                nextid < 29, pixel_width[np.minimum(nextid,28)] + h, s
            )
            lo = float(lower.min())
            hi = float(upper.max())
            for _ in range(25):
                mid = (lo+hi)*.5
                derivative = np.maximum(0,mid-upper).sum() - np.maximum(
                    0, lower-mid
                ).sum()
                if derivative > 0:
                    hi = mid
                else:
                    lo = mid
            W = (lo+hi)*.5
            squared = np.square(
                np.maximum(0, np.maximum(lower-W,W-upper))
            ).mean()
            if best is None or squared < best["trainingSquaredViolation"]:
                best = {
                    "perRuneExtra": float(h), "separatorWidth": float(s),
                    "lineCapacity": float(W),
                    "trainingSquaredViolation": float(squared)
                }
    return best


def score(rows, model, pixel_width):
    h = model["perRuneExtra"]
    s = model["separatorWidth"]
    W = model["lineCapacity"]
    exact = within1 = within2 = 0
    violation = distance = 0.0
    for item in rows:
        width = item["source_ink"] + h * item["rune_count"] + (
            s * item["sep_count"]
        )
        next_width = (
            pixel_width[item["next"]]+h if item["next"]<29 else s
        )
        e = max(0, width-W, W-width-next_width)
        violation += e
        exact += e < 1e-8
        ordered = item["current"] + item["upcoming"]
        running = 0.0
        used = 0
        for token in ordered:
            advance = pixel_width[token]+h if token<29 else s
            if running+advance > W:
                break
            running += advance
            used += 1
        delta = abs(used-len(item["current"]))
        distance += delta
        within1 += delta <= 1
        within2 += delta <= 2
    return {
        "count": len(rows),
        "exact": exact / len(rows),
        "withinOne": within1 / len(rows),
        "withinTwo": within2 / len(rows),
        "meanAbsoluteRuneCutError": distance / len(rows),
        "meanHingeViolationInSourceInkPixels": violation / len(rows)
    }


def main():
    pixels, excluded = source_widths()
    rows = source_rows(pixels)
    early = [x for x in rows if x["page"]<26]
    late = [x for x in rows if x["page"]>=26]
    assert len(early)==245 and len(late)==256
    left = fit(early, pixels)
    right = fit(late, pixels)
    return {
        "source": "Original LP2 JPEG first-glyph ink widths, fixed before fitting at most three scalar line-wrap parameters",
        "observationCounts": { "early": len(early), "late": len(late)},
        "sourceMeasuredGlyphInkWidths": {
            GP[i]: float(value) for i,value in enumerate(pixels)
        },
        "earlyParameters": left,
        "lateParameters": right,
        "earlyToLateHeldout": score(late,left,pixels),
        "lateToEarlyHeldout": score(early,right,pixels),
        "limits": "29 ink widths pooled from original JPEGs; line-cut choices excluded from ink-width fitting but raw source pages overlap. Dark-component ink width differs from font advance. No cipher keys or plaintext."
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
