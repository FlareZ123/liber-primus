#!/usr/bin/env python3
"""Extend frozen original-LP2 word-gap and baseline census to every unsampled page.

Run from repository root (Python, numpy, scipy, Pillow):
    python sims/lp2_fullpage_micro_layout_extension_sft.py

The fixed glyph/marker classifier is imported unchanged from the prior
word_spacing_baseline_channel.py SFT. Pages 0-2,16-21,40-48 were already
adjudicated and are deliberately NOT remeasured here. All other unknown
physical pages and both solved source controls are measured.
"""
from __future__ import annotations

import json
import statistics
from collections import Counter
from pathlib import Path

from PIL import Image
from word_spacing_baseline_channel import detect, qstats

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "resources" / "liber-primus"
NEW = list(range(3, 16)) + list(range(22, 40)) + list(range(49, 56))
CONTROLS = [56, 57]


def analyze_page(page: int) -> tuple[dict, list[dict], list[dict]]:
    rows = detect(ORIGINAL / f"{page + 17:02d}.jpg")
    mode = Image.open(ORIGINAL / f"{page + 17:02d}.jpg").mode
    all_glyphs, dots, plain_gaps, pitches = [], [], [], []
    anchor_rows = []
    for line_index, line in enumerate(rows):
        glyphs, marks = line["glyphs"], line["marks"]
        # Restrict to ordinary text rows, not illustrations / all-numeral rows.
        if len(glyphs) < (5 if page in CONTROLS else 10):
            continue
        all_glyphs.extend(glyphs)
        if marks:
            anchor_rows.append((line_index, float(statistics.median(m["cy"] for m in marks))))
        for left, right in zip(glyphs, glyphs[1:]):
            gap = right["x0"] - left["x1"]
            marks_inside = [mark for mark in marks if
                            mark["x0"] >= left["x1"] and mark["x1"] <= right["x0"]]
            if not marks_inside:
                if 0 <= gap <= 30:
                    plain_gaps.append(gap)
            elif len(marks_inside) == 1:
                mark = marks_inside[0]
                left_clearance = mark["x0"] - left["x1"]
                right_clearance = right["x0"] - mark["x1"]
                offset = mark["cx"] - (left["x1"] + right["x0"]) / 2
                if gap <= 30 and left_clearance <= 15 and right_clearance <= 15 and abs(offset) <= 5:
                    dots.append({
                        "page": page, "line": line_index, "x": mark["cx"],
                        "gap": gap, "width": mark["w"], "offset": offset,
                        "left_clearance": left_clearance, "right_clearance": right_clearance
                    })
    for (a_line, a_y), (b_line, b_y) in zip(anchor_rows, anchor_rows[1:]):
        if b_line == a_line + 1:
            pitches.append({"page": page, "from": a_line, "to": b_line, "pitch": round(b_y - a_y, 1)})
    return {
        "page": page, "image": f"{page + 17:02d}.jpg", "mode": mode,
        "candidate_rows": len(rows), "ordinary_text_rows": sum(
            len(line["glyphs"]) >= (5 if page in CONTROLS else 10) for line in rows
        ), "detected_glyphs": len(all_glyphs), "dot_gaps": len(dots),
        "plain_gaps": len(plain_gaps), "line_pitches": len(pitches),
        "glyph_width_median": sorted(g["w"] for g in all_glyphs)[len(all_glyphs)//2] if all_glyphs else None,
        "glyph_height_median": sorted(g["h"] for g in all_glyphs)[len(all_glyphs)//2] if all_glyphs else None,
    }, dots, pitches


def main() -> None:
    assert len(NEW) == 38
    rows, dots, pitches = [], [], []
    for page in NEW + CONTROLS:
        row, page_dots, page_pitches = analyze_page(page)
        rows.append(row)
        dots.extend(page_dots)
        pitches.extend(page_pitches)

    # Original-source exact count gates from the unchanged prior detector.
    assert sum(row["ordinary_text_rows"] for row in rows) == 389
    assert len(dots) == 1623
    assert len(pitches) == 340
    assert Counter(mark["width"] for mark in dots) == {9: 1056, 10: 567}
    expected = {188.0: 195, 189.0: 68, 188.5: 56, 224.0: 13,
                244.0: 3, 243.5: 2, 487.5: 1, 675.5: 1, 550.0: 1}
    assert Counter(row["pitch"] for row in pitches) == expected

    # P57's fifth ordinary-looking component row is a figure/graphic intrusion,
    # illustrated in the original scan; it cannot be evidence of a line cipher.
    exceptions = [row for row in pitches if row["pitch"] not in (188.0, 188.5, 189.0)]
    extra_gap = [mark for mark in dots if abs(mark["offset"]) > 3.0]
    out = {
        "status": "source-original 38 previously unmeasured unknown pages plus solved p56/p57",
        "input": "resources/liber-primus original images",
        "detector": "unchanged sims/word_spacing_baseline_channel.py",
        "scope": {"previously_measured": [0, 1, 2, *range(16, 22), *range(40, 49)],
                  "new_unknown": NEW, "solved_controls": CONTROLS},
        "per_page": rows,
        "summary": {
            "ordinary_text_rows": sum(row["ordinary_text_rows"] for row in rows),
            "marker_events": len(dots),
            "dot_width_counts": dict(Counter(mark["width"] for mark in dots)),
            "dot_offset_px": qstats([mark["offset"] for mark in dots]),
            "dot_gap_px": qstats([mark["gap"] for mark in dots]),
            "all_line_pitches": len(pitches),
            "line_pitch_counts": {str(k): v for k, v in sorted(Counter(row["pitch"] for row in pitches).items())},
            "nonordinary_pitch_events": exceptions,
            "offset_outliers_beyond_3px": extra_gap
        },
        "classification": "source-image geometry; no independent binary/rune key or candidate plaintext"
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
