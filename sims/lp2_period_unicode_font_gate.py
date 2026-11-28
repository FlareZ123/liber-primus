#!/usr/bin/env python3
"""Gate period Unicode rune fonts against solved LP2 page 57 glyphs.

Uses 18 labelled rune classes from the final three solved lines.  Each glyph is
cropped from the original 2400x3600 JPEG and compared with the same Unicode
codepoint rendered by each candidate font.  Both sides are stretched to a
common 96x96 box, deliberately discarding aspect/advance metrics.
"""
import argparse, glob, io, json
from collections import defaultdict
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageFont

BOX = 96
LINES = [
    (1285, 1464, 885, "ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ"),
    (1537, 1652, 885, "ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ"),
    (1725, 1840, 590, "ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ."),
]
EXPECTED = [17, 18, 23]


def is_rune(c):
    return "\u16a0" <= c <= "\u16ff"


def crop(a):
    ys, xs = np.where(a > 0)
    if not len(ys):
        return None
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def to_box(a, n=BOX):
    im = Image.fromarray((a * 255).astype(np.uint8)).resize(
        (n, n), Image.Resampling.BILINEAR)
    return (np.asarray(im) > 127).astype(np.uint8)


def iou_dist(a, b):
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return 1.0 if union == 0 else 1.0 - float(inter) / float(union)


def components(ink, y0, y1, x0, x1=1900):
    sub = ink[y0:y1, x0:x1]
    xs = np.where(sub.sum(axis=0) > 0)[0] + x0
    if not len(xs):
        return []
    spans = []
    start = prev = int(xs[0])
    for xx in xs[1:]:
        x = int(xx)
        if x > prev + 1:
            spans.append((start, prev))
            start = x
        prev = x
    spans.append((start, prev))

    out = []
    for left, right in spans:
        region = sub[:, left - x0:right - x0 + 1]
        ys, _ = np.where(region)
        if len(ys) and ys.max() - ys.min() + 1 >= 100:
            out.append((left, right, int(ys.min()) + y0, int(ys.max()) + y0))
    return out


def observed(path):
    rgb = np.asarray(Image.open(path).convert("RGB"))
    assert rgb.shape[:2] == (3600, 2400), rgb.shape
    ink = np.min(rgb, axis=2) < 100
    occurrences = defaultdict(list)
    counts = []
    for y0, y1, x0, text in LINES:
        runes = [c for c in text if is_rune(c)]
        comps = components(ink, y0, y1, x0)
        counts.append(len(comps))
        assert len(comps) == len(runes), (len(comps), len(runes))
        for c, (left, right, top, bottom) in zip(runes, comps):
            occurrences[c].append(
                ink[top:bottom + 1, left:right + 1].astype(np.uint8))
    assert counts == EXPECTED, counts

    medoids = {}
    for c, glyphs in occurrences.items():
        boxed = [to_box(g) for g in glyphs]
        totals = [
            sum(iou_dist(boxed[i], boxed[j]) for j in range(len(boxed)))
            for i in range(len(boxed))
        ]
        medoids[c] = glyphs[int(np.argmin(totals))]
    assert len(medoids) == 18, len(medoids)
    return medoids, occurrences


def render_font(path, runes, size=300):
    tt = TTFont(path, lazy=True)
    cmap = {}
    for table in tt["cmap"].tables:
        if table.isUnicode():
            cmap.update(table.cmap)
    missing = [c for c in runes if ord(c) not in cmap]
    tt.close()
    if missing:
        return None, missing

    font = ImageFont.truetype(path, size)
    out = {}
    for c in runes:
        mask = font.getmask(c, mode="L")
        w, h = mask.size
        a = np.asarray(mask, dtype=np.uint8).reshape(h, w)
        g = crop((a > 127).astype(np.uint8))
        if g is None:
            return None, [c]
        out[c] = g
    return out, []


def degrade(g, target_h=114):
    im = Image.fromarray(((1 - g) * 255).astype(np.uint8))
    scale = target_h / g.shape[0]
    im = im.resize((max(1, int(round(g.shape[1] * scale))), target_h),
                   Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    im.convert("L").save(buf, "JPEG", quality=92)
    buf.seek(0)
    return crop((np.asarray(Image.open(buf).convert("L")) < 128).astype(np.uint8))


def repeat_noise(occ):
    vals = []
    for glyphs in occ.values():
        boxed = [to_box(g) for g in glyphs]
        vals.extend(iou_dist(boxed[i], boxed[j])
                    for i in range(len(boxed))
                    for j in range(i + 1, len(boxed)))
    return {
        "pairs": len(vals),
        "mean": round(float(np.mean(vals)), 6),
        "median": round(float(np.median(vals)), 6),
        "p95": round(float(np.percentile(vals, 95)), 6),
        "max": round(float(np.max(vals)), 6),
    }


def expand_font_args(args):
    out = []
    for item in args:
        hits = glob.glob(item)
        out.extend(hits if hits else [item])
    return sorted(dict.fromkeys(out))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", default="resources/liber-primus/74.jpg")
    ap.add_argument("--font", action="append", required=True,
                    help="font path or glob; repeatable")
    ap.add_argument("--output", default="-")
    args = ap.parse_args()

    medoids, occ = observed(args.image)
    obs = {c: to_box(g) for c, g in medoids.items()}
    results = []
    for path in expand_font_args(args.font):
        rendered, missing = render_font(path, sorted(obs))
        if rendered is None:
            results.append({"font": Path(path).name,
                            "path": path,
                            "status": "missing-runes",
                            "missing": missing})
            continue

        per = {c: iou_dist(obs[c], to_box(rendered[c])) for c in obs}
        controls = [iou_dist(to_box(g), to_box(degrade(g)))
                    for g in rendered.values()]
        results.append({
            "font": Path(path).name,
            "path": path,
            "status": "scored",
            "mean_iou_distance": round(float(np.mean(list(per.values()))), 6),
            "median_iou_distance": round(float(np.median(list(per.values()))), 6),
            "max_iou_distance": round(float(np.max(list(per.values()))), 6),
            "per_rune": {c: round(float(d), 6) for c, d in sorted(per.items())},
            "render_jpeg_control": {
                "mean": round(float(np.mean(controls)), 6),
                "p95": round(float(np.percentile(controls, 95)), 6),
                "max": round(float(np.max(controls)), 6),
            },
        })

    scored = sorted((r for r in results if r["status"] == "scored"),
                    key=lambda r: r["mean_iou_distance"])
    payload = {
        "test": "period Unicode direct-rune font gate",
        "observed_classes": len(obs),
        "segmentation_line_counts": EXPECTED,
        "lp2_repeat_noise": repeat_noise(occ),
        "ranking": scored,
        "unscored": [r for r in results if r["status"] != "scored"],
    }
    data = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if args.output == "-":
        print(data, end="")
    else:
        Path(args.output).write_text(data, encoding="utf-8")


if __name__ == "__main__":
    main()
