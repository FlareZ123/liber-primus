#!/usr/bin/env python3
"""Audit the small LP2 punctuation tokens against original JPEG pixels.

Run from the repository root:
    python3 sims/lp2_punctuation_source_audit.py

Dependencies: numpy, opencv-python-headless, scipy.
The source transcription supplies page-local rune offsets and physical line order;
original JPEGs supply the measured dot components. Manual line-center overrides
are explicit below for pages where marginalia/very short lines defeat the generic
projection detector. Four line-wrap events are deliberately assigned to the
left-edge mark on the following physical line.
"""
from __future__ import annotations
import argparse
import csv
import gzip
import itertools
import json
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
RUNES = set("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")

MANUAL_CENTERS = {
    2:  [701, 888, 1077, 1269, 1453, 1639, 1831, 2018, 2207],
    6:  [696, 917, 1079, None, 1749, 1939, 2131, 2318, 2508, 2718],
    22: [727, 913, 1077, 1284, 1485, 1710],
    27: [769, 948, 1138, 1323, 1507, 1697, 1882, 2079, 2261, 2448, 2638],
    36: [698, 889, 1078, 1265, 1461, 1693, 1919, 2110, 2303, 2493, 2702],
    37: [695, 924, 1114, 1304, 1546, 1766, 1958, 2147, 2360, 2602, 2802],
    39: [726, 886, 1079, 1266, 1454, 1692, 1889, 2079, 2290, 2454, 2636, 2855],
}
WRAP_EVENTS = {
    35: (10, 9, 0),
    64: (16, 12, 0),
    72: (19, 3, 0),
    75: (20, 7, 0),
}
SINGLE_DOT_EVENT = 91
ABSENT_EVENT = 125
EXPECTED_SPECIAL = {
    35: (10, 8, 174), 64: (16, 11, 245), 72: (19, 2, 47),
    75: (20, 6, 134), 91: (27, 7, 144), 125: (37, 4, 91),
    127: (38, 2, 28),
}


def image_path(page):
    return ROOT / "resources" / "liber-primus" / f"{page + 17:02d}.jpg"


def page_text_index(page):
    if page == 50:
        raise ValueError("p50 is the numeric table and has no runic line stream")
    return page if page < 50 else page - 1


def event_line_map(raw, events):
    text_pages = raw.split("%")
    out = []
    for event in events:
        page = int(event["page"])
        lines = [s for s in text_pages[page_text_index(page)].split("/")
                 if any(ch in RUNES for ch in s)]
        offset = int(event["local_rune_offset"])
        start = 0
        for line_no, line in enumerate(lines, 1):
            seq = [ch for ch in line if ch in RUNES]
            end = start + len(seq)
            if start <= offset <= end:
                out.append({"event": event, "page": page, "text_line": line_no,
                            "line_start": start, "line_end": end,
                            "pos": offset - start, "sequence": "".join(seq)})
                break
            start = end
        else:
            raise ValueError(f"cannot map event {event.get('index')} on p{page} offset {offset}")
    return out


def detect_centres(page, image):
    if page in MANUAL_CENTERS:
        return MANUAL_CENTERS[page]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    projection = (gray[:, 790:1770] < 160).sum(axis=1).astype(float)
    smooth = gaussian_filter1d(projection, sigma=7)
    peaks, _ = find_peaks(smooth, prominence=125, distance=137)
    return [int(y) for y in peaks if 450 < y < 3150]


def small_dot_components(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    mask = (gray[y0:y1, x0:x1] < 130).astype(np.uint8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    dots = []
    for i in range(1, count):
        x, y, w, h, area = map(int, stats[i])
        if not (6 <= w <= 14 and 6 <= h <= 14 and 35 <= area <= 180):
            continue
        if area / (w * h) < 0.55 or not 0.65 <= w / h <= 1.5:
            continue
        xx, yy = x + x0, y + y0
        b, g, r = image[yy:yy+h, xx:xx+w].reshape(-1, 3).mean(axis=0)
        color = "red" if r > 1.25 * g and r > 1.25 * b else "black"
        dots.append({"x": xx, "y": yy, "w": w, "h": h, "area": area,
                     "cx": float(xx + w / 2), "cy": float(yy + h / 2),
                     "color": color})
    return dots


def group_dots(dots, max_distance=25.0):
    groups, seen = [], set()
    for i in range(len(dots)):
        if i in seen:
            continue
        stack, group = [i], []
        seen.add(i)
        while stack:
            k = stack.pop()
            group.append(dots[k])
            for j, other in enumerate(dots):
                if j in seen:
                    continue
                dx, dy = dots[k]["cx"] - other["cx"], dots[k]["cy"] - other["cy"]
                if (dx * dx + dy * dy) ** 0.5 <= max_distance:
                    seen.add(j)
                    stack.append(j)
        groups.append(group)
    return groups


def diamond_score(dots):
    points = np.array([[d["cx"], d["cy"]] for d in dots], dtype=float)
    cx, cy = points.mean(axis=0)
    sx = (points[:, 0].max() - points[:, 0].min()) / 2
    sy = (points[:, 1].max() - points[:, 1].min()) / 2
    if sx == 0 or sy == 0:
        return float("inf")
    normalized = np.column_stack(((points[:, 0] - cx) / sx, (points[:, 1] - cy) / sy))
    ideal = np.array([[0, -1], [1, 0], [0, 1], [-1, 0]], dtype=float)
    return min(float(np.mean(np.sum((normalized - ideal[list(p)]) ** 2, axis=1)))
               for p in itertools.permutations(range(4)))


def candidate_clusters(dots, centre):
    if centre is None:
        return []
    in_line = [d for d in dots if centre - 60 <= d["cy"] <= centre + 65]
    out = []
    for group in group_dots(in_line):
        if len(group) not in (3, 4):
            continue
        xs, ys = [d["cx"] for d in group], [d["cy"] for d in group]
        out.append({
            "n": len(group), "x": float(np.mean(xs)), "y": float(np.mean(ys)),
            "bbox": [min(d["x"] for d in group), min(d["y"] for d in group),
                     max(d["x"] + d["w"] for d in group), max(d["y"] + d["h"] for d in group)],
            "colors": sorted({d["color"] for d in group}),
            "shape_score": diamond_score(group) if len(group) == 4 else "",
            "dots": sorted([(d["cx"], d["cy"], d["color"]) for d in group]),
        })
    return sorted(out, key=lambda c: c["x"])


def find_single_dot(dots, centre):
    possible = [d for d in dots if centre - 60 <= d["cy"] <= centre + 65]
    target = min(possible, key=lambda d: (d["cx"] - 1780.5) ** 2 + (d["cy"] - 1915.0) ** 2)
    if abs(target["cx"] - 1780.5) > 6 or abs(target["cy"] - 1915.0) > 8:
        raise ValueError("p27 single-dot manual control no longer matches source JPEG")
    return {"n": 1, "x": target["cx"], "y": target["cy"],
            "bbox": [target["x"], target["y"], target["x"] + target["w"], target["y"] + target["h"]],
            "colors": [target["color"]], "dots": [(target["cx"], target["cy"], target["color"])]}


def morphology(symbol, candidate):
    if candidate is None:
        return "absent", 0, "none", "high"
    n, color = candidate["n"], "+".join(candidate["colors"])
    if n == 4:
        return "four-dot diamond", 4, color, "low"
    if n == 3 and symbol == "⁚":
        return "three-dot comma form", 3, color, "low"
    if n == 3 and symbol == "⁘":
        return "three-dot comma-form (transcribed stop)", 3, color, "medium"
    if n == 1:
        return "single-dot ambiguous", 1, color, "high"
    return f"{n}-dot cluster", n, color, "high"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="im-results/lp2-punctuation-source-audit.csv.gz")
    args = parser.parse_args()
    inventory_path = ROOT / "resources" / "liber-primus" / "lp2-punctuation-identity.json"
    transcription_path = ROOT / "resources" / "lp2-transcription.txt"
    inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
    raw = transcription_path.read_text(encoding="utf-8")
    all_events = inventory["events"]
    if len(all_events) != 180 or sum(e["symbol"] == "⁜" for e in all_events) != 31:
        raise AssertionError("unexpected 180-event/31-large-marker inventory")
    editorial = [e for e in all_events if e["symbol"] == "⁘" and e["page"] == 15 and e["local_rune_offset"] == 9]
    if len(editorial) != 4:
        raise AssertionError(f"expected four known p15 editorial row terminators, got {len(editorial)}")
    events = [e for e in all_events if e["symbol"] in ("⁘", "⁚") and e not in editorial]
    if len(events) != 145 or sum(e["symbol"] == "⁘" for e in events) != 141 or sum(e["symbol"] == "⁚" for e in events) != 4:
        raise AssertionError("unexpected small-punctuation inventory")
    mapped = event_line_map(raw, events)
    for m in mapped:
        idx = int(m["event"]["index"])
        if idx in EXPECTED_SPECIAL:
            observed = (m["page"], m["text_line"], int(m["event"]["local_rune_offset"]))
            if observed != EXPECTED_SPECIAL[idx]:
                raise AssertionError(f"manual exception {idx} moved: {observed}")
    pages = sorted({m["page"] for m in mapped})
    centres, dots = {}, {}
    for page in pages:
        image = cv2.imread(str(image_path(page)))
        if image is None:
            raise FileNotFoundError(image_path(page))
        centres[page] = detect_centres(page, image)
        dots[page] = small_dot_components(image)
    candidates = {}
    for page in pages:
        max_line = max(m["text_line"] for m in mapped if m["page"] == page) + 1
        for line_no in range(1, min(max_line, len(centres[page])) + 1):
            candidates[(page, line_no)] = candidate_clusters(dots[page], centres[page][line_no - 1])
    by_line = defaultdict(list)
    for m in mapped:
        by_line[(m["page"], m["text_line"])].append(m)
    rows = []
    for m in mapped:
        event = m["event"]
        idx, page, line_no = int(event["index"]), m["page"], m["text_line"]
        symbol, offset, pos = event["symbol"], int(event["local_rune_offset"]), m["pos"]
        physical_line, candidate, status, note = line_no, None, "printed_cluster", ""
        if idx in WRAP_EVENTS:
            wp, wl, which = WRAP_EVENTS[idx]
            candidate = candidates[(wp, wl)][which]
            if candidate["x"] >= 700:
                raise AssertionError(f"wrap event {idx} is not at the following line left edge")
            physical_line, status = wl, "printed_on_next_line"
            note = "Mark is at the left edge of the following physical line; transcription offset remains after the preceding line."
        elif idx == SINGLE_DOT_EVENT:
            candidate = find_single_dot(dots[page], centres[page][line_no - 1])
            status = "single_dot_position_ambiguous"
            note = "Only one detached square is visible near the line end; no diamond cluster. The transcription places the stop before the final rune, while source placement is not unambiguously aligned to that offset."
        elif idx == ABSENT_EVENT:
            status = "no_source_glyph_found"
            note = "No corresponding detached punctuation glyph is visible after the final rune or at the following line left edge; full-line crop visually checked."
        else:
            line_candidates = candidates[(page, line_no)]
            if page == 10 and line_no == 9:
                line_candidates = line_candidates[1:]
            line_events = sorted(by_line[(page, line_no)], key=lambda x: x["pos"])
            rank = [x["event"]["index"] for x in line_events].index(idx)
            if rank >= len(line_candidates):
                raise AssertionError(f"no candidate for event {idx} on p{page} line{line_no}")
            candidate = line_candidates[rank]
        morph, count, color, uncertainty = morphology(symbol, candidate)
        line_centre = centres[page][physical_line - 1]
        rows.append({
            "event_index": idx, "lp2_page": page, "source_jpeg": image_path(page).name,
            "transcription_line": line_no, "physical_line": physical_line,
            "line_center_y": "" if line_centre is None else line_centre,
            "local_rune_offset": offset, "position_in_line": pos, "symbol": symbol,
            "morphology": morph, "dot_count": count, "color": color,
            "centroid_x": "" if candidate is None else round(candidate["x"], 1),
            "centroid_y": "" if candidate is None else round(candidate["y"], 1),
            "bbox": "" if candidate is None else ",".join(map(str, candidate["bbox"])),
            "diamond_shape_score": "" if candidate is None or candidate["n"] != 4 else round(candidate["shape_score"], 8),
            "dot_centers": "" if candidate is None else ";".join(f"{x:.1f},{y:.1f},{c}" for x, y, c in candidate["dots"]),
            "status": status, "uncertainty": uncertainty, "note": note,
        })
    rows.sort(key=lambda r: r["event_index"])
    summary = Counter((r["symbol"], r["morphology"]) for r in rows)
    expected = {
        ("⁘", "four-dot diamond"): 138,
        ("⁘", "three-dot comma-form (transcribed stop)"): 1,
        ("⁘", "single-dot ambiguous"): 1,
        ("⁘", "absent"): 1,
        ("⁚", "three-dot comma form"): 4,
    }
    if dict(summary) != expected:
        raise AssertionError(f"source morphology counts changed: {dict(summary)}")
    if len({r["event_index"] for r in rows}) != 145:
        raise AssertionError("event indices were duplicated or collapsed")
    red_diamonds = [r for r in rows if r["morphology"] == "four-dot diamond" and r["color"] == "red"]
    if len(red_diamonds) != 1:
        raise AssertionError(f"expected one red diamond stop, got {len(red_diamonds)}")
    if sum(r["status"] == "printed_on_next_line" for r in rows) != 4:
        raise AssertionError("expected four line-wrap placements")
    diamond_scores = [float(r["diamond_shape_score"]) for r in rows if r["dot_count"] == 4]
    if len(diamond_scores) != 138 or max(diamond_scores) >= 0.01:
        raise AssertionError("four-dot components no longer form the source diamond morphology")
    out = ROOT / args.output
    out.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(out, "wt", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {out.relative_to(ROOT)} ({len(rows)} rows)")
    for (symbol, morph), count in sorted(summary.items()):
        print(f"{symbol} {morph}: {count}")
    print("excluded p15 editorial row terminators:", len(editorial))
    print("31 large ⁜ records remain the separate existing image-annotation cross-match")


if __name__ == "__main__":
    main()
