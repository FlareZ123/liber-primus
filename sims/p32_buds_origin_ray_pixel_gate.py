#!/usr/bin/env python3
"""Source-locked pixel test of the p32 BUDS→HOME 318° ray.

Uses the exact p15/p32 geometry from p15_p32_318_direction_sft.py. It asks
whether the selected segment follows a distinctive low-contrast tree edge in
the original signed 2016 JPEG, relative to p15 bearings and alternative
four-rune word-edge pairs. The central ROI and grayscale cutoffs are fixed
analyst measurement controls, not source instructions. Scores are descriptive,
not a decryption claim.
"""
from __future__ import annotations
import hashlib, itertools, json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from p15_p32_318_direction_sft import GP, WORD_LENGTHS, P15, CW, bearing

ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "resources/historical/cicada2016-4gq25.jpg"
TRANSCRIPTION_PATH = ROOT / "resources/liber-primus/lp2-transcription.txt"
ROI = (180, 290, 420, 460)  # x0,y0,x1,y1; central low-contrast tree, away from text rows
BAND = 3
THRESHOLDS = (60, 90, 128)
MIN_PIXELS = 100


def page(n):
    pages = TRANSCRIPTION_PATH.read_text(encoding="utf-8").split("%")
    return [r for r in pages[n] if r in GP]


def geometry():
    p32 = page(32)
    assert len(p32) == 121
    grid = [p32[i * 11:(i + 1) * 11] for i in range(11)]
    weights = [[GP[r][0] for r in row] for row in grid]
    xe, ye = [0], [0]
    for v in weights[0]:
        xe.append(xe[-1] + v)
    for row in weights:
        ye.append(ye[-1] + row[0])
    assert (xe[-1], ye[-1]) == (563, 569)

    words, off = [], 0
    for ordinal, length in enumerate(WORD_LENGTHS, 1):
        runes = p32[off:off + length]
        words.append((ordinal, off, length, runes))
        off += length
    assert off == 121

    def windows(single):
        out = []
        for ordinal, start, length, runes in words:
            if length < 4:
                continue
            for kind, pos, frag in (
                ("prefix", start, runes[:4]),
                ("suffix", start + length - 4, runes[-4:]),
            ):
                row, col = divmod(pos, 11)
                if col + 4 > 11:
                    continue
                text = "".join(GP[r][1] for r in frag)
                if single and any(len(GP[r][1]) != 1 for r in frag):
                    continue
                center = ((xe[col] + xe[col + 4]) / 2, (ye[row] + ye[row + 1]) / 2)
                out.append({"word": ordinal, "kind": kind, "offset": pos,
                            "text": text, "center": center})
        return out

    one, all4 = windows(True), windows(False)
    assert len(one) == 7 and len(all4) == 24
    buds = next(x for x in all4 if x["text"] == "BUDS" and x["offset"] == 93)
    home = next(x for x in all4 if x["text"] == "HOME" and x["offset"] == 33)
    return p32, xe, ye, one, all4, buds, home


def features(gray):
    blur = np.asarray(Image.fromarray(gray.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(radius=1.5)), dtype=np.float64)
    gy, gx = np.gradient(blur)
    mag = np.hypot(gx, gy)
    h, w = gray.shape
    x0, y0, x1, y1 = ROI
    yy, xx = np.indices((h, w))
    roi = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
    return gx, gy, mag, roi, xx, yy


def score(a, b, gray, gx, gy, mag, roi, xx, yy, threshold):
    vx, vy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(vx, vy)
    if length == 0:
        return None
    dx, dy = vx / length, vy / length
    nx, ny = -dy, dx
    rx, ry = xx - a[0], yy - a[1]
    along = rx * dx + ry * dy
    across = np.abs(rx * nx + ry * ny)
    mask = (roi & (gray < threshold) & (along >= 0) &
            (along <= length) & (across <= BAND))
    n = int(mask.sum())
    if n < MIN_PIXELS:
        return {"n": n, "score": None}
    m = mag[mask]
    align = np.abs(gx[mask] * nx + gy[mask] * ny) / (m + 1e-12)
    return {
        "n": n,
        "score": float(np.mean(m * align)),  # edge energy whose normal follows the ray
        "edge_mean": float(np.mean(m)),
        "tree_pixel_fraction": float(np.mean(gray[mask] > 2)),
        "aligned_edge_fraction": float(np.mean((m > 0.5) & (align > 0.75))),
    }


def pair_rank(windows, target, args):
    gray, gx, gy, mag, roi, xx, yy, threshold = args
    rows = []
    for a, b in itertools.permutations(windows, 2):
        s = score(a["center"], b["center"], gray, gx, gy, mag, roi, xx, yy, threshold)
        if s and s["score"] is not None:
            rows.append({"from": a["text"], "from_offset": a["offset"],
                         "to": b["text"], "to_offset": b["offset"],
                         "bearing": bearing(a["center"], b["center"]), **s})
    rows.sort(key=lambda x: x["score"], reverse=True)
    t = next(x for x in rows if
             (x["from"], x["from_offset"], x["to"], x["to_offset"]) == target)
    return {"valid_pairs": len(rows), "target_rank": 1 + rows.index(t),
            "target": t, "top_five": rows[:5]}


def main():
    raw = IMAGE_PATH.read_bytes()
    image = Image.open(IMAGE_PATH).convert("L")
    gray = np.asarray(image, dtype=np.float64)
    assert gray.shape == (569, 563), gray.shape
    p32, xe, ye, one, all4, buds, home = geometry()
    b, h = buds["center"], home["center"]
    origin = (0.0, 0.0)
    target_bearing, origin_bearing = bearing(b, h), bearing(b, origin)
    assert abs(target_bearing - 317.698813) < 0.01
    assert abs(origin_bearing - 317.949316) < 0.01

    clockwise = [P15[r][c] for r, c in CW]
    angles = [v % 360 for v in clockwise]
    assert clockwise[10] == 2838 and angles[10] == 318

    gx, gy, mag, roi, xx, yy = features(gray)
    rv = gray[roi]
    intensity = {
        "min": float(rv.min()), "p50": float(np.quantile(rv, .50)),
        "p90": float(np.quantile(rv, .90)), "p99": float(np.quantile(rv, .99)),
        "fraction_gt_2": float(np.mean(rv > 2)),
        "fraction_gt_20": float(np.mean(rv > 20)),
        "fraction_gt_100": float(np.mean(rv > 100)),
    }

    results = {}
    target_key = ("BUDS", 93, "HOME", 33)
    for threshold in THRESHOLDS:
        args = (gray, gx, gy, mag, roi, xx, yy, threshold)
        target = score(b, h, *args)
        to_origin = score(b, origin, *args)
        assert target and target["score"] is not None
        assert to_origin and to_origin["score"] is not None
        single = pair_rank(one, target_key, args)
        digraph = pair_rank(all4, target_key, args)

        length = math.hypot(h[0] - b[0], h[1] - b[1])
        p15_rows = []
        for step, angle in enumerate(angles, 1):
            rad = math.radians(angle)
            end = (b[0] + length * math.sin(rad), b[1] - length * math.cos(rad))
            s = score(b, end, *args)
            if s and s["score"] is not None:
                p15_rows.append({"step": step, "angle": angle, **s})
        p15_rows.sort(key=lambda x: x["score"], reverse=True)
        p15_rank = 1 + next(i for i, x in enumerate(p15_rows) if x["step"] == 11)

        degree_rows = []
        for angle in range(360):
            rad = math.radians(angle)
            end = (b[0] + length * math.sin(rad), b[1] - length * math.cos(rad))
            s = score(b, end, *args)
            if s and s["score"] is not None:
                degree_rows.append({"angle": angle, **s})
        degree_rows.sort(key=lambda x: x["score"], reverse=True)
        exact_rank = 1 + sum(x["score"] > target["score"] for x in degree_rows)

        corners = {
            "top_left": (0.0, 0.0), "top_right": (563.0, 0.0),
            "bottom_left": (0.0, 569.0), "bottom_right": (563.0, 569.0),
        }
        results[str(threshold)] = {
            "BUDS_to_HOME": target, "BUDS_to_origin": to_origin,
            "single_letter_pair_rank": single,
            "all_digraph_pair_rank": digraph,
            "p15_valid_count": len(p15_rows), "p15_step11_rank": p15_rank,
            "p15_top_five": p15_rows[:5],
            "integer_degree_rank_of_exact_target": exact_rank,
            "integer_degree_valid_count": len(degree_rows),
            "integer_degree_top_five": degree_rows[:5],
            "corner_scores": {k: score(b, v, *args) for k, v in corners.items()},
        }

    # Positive control: a faint synthetic line on BUDS→HOME must be detected
    # as the best of the 16 p15 directions by the same statistic.
    synthetic = Image.new("L", (563, 569), 0)
    ImageDraw.Draw(synthetic).line(
        (tuple(map(round, b)), tuple(map(round, h))), fill=36, width=3
    )
    sg = np.asarray(synthetic.filter(ImageFilter.GaussianBlur(radius=1.5)),
                    dtype=np.float64)
    sgy, sgx = np.gradient(sg)
    smag = np.hypot(sgx, sgy)
    syn = []
    for step, angle in enumerate(angles, 1):
        rad = math.radians(angle)
        end = (b[0] + length * math.sin(rad), b[1] - length * math.cos(rad))
        s = score(b, end, sg, sgx, sgy, smag, roi, xx, yy, 128)
        if s and s["score"] is not None:
            syn.append({"step": step, "angle": angle, **s})
    syn.sort(key=lambda x: x["score"], reverse=True)
    assert syn and syn[0]["step"] == 11, syn[:5]

    print(json.dumps({
        "image": str(IMAGE_PATH.relative_to(ROOT)),
        "image_sha256": hashlib.sha256(raw).hexdigest(),
        "dimensions": [563, 569], "roi_xyxy": list(ROI),
        "band_half_width_px": BAND, "thresholds": list(THRESHOLDS),
        "roi_grayscale": intensity,
        "p32": {"runes": len(p32), "x_edges": xe, "y_edges": ye,
                "single_letter_windows": len(one), "all_4rune_windows": len(all4),
                "BUDS": {"offset": buds["offset"], "center": b},
                "HOME": {"offset": home["offset"], "center": h},
                "BUDS_HOME_bearing": target_bearing,
                "BUDS_origin_bearing": origin_bearing},
        "p15": {"clockwise_values": clockwise, "bearings": angles},
        "threshold_results": results,
        "synthetic_positive_control": {"step11_rank": 1,
                                       "top_five": syn[:5]},
        "limit": "Image alignment can support only navigation geometry, not plaintext or a cipher key."
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
