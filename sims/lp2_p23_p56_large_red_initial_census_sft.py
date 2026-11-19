#!/usr/bin/env python3
"""Agent8: source-only census of large red LP2 initials and text-line alignment.

Run from repository root:
    python sims/lp2_p23_p56_large_red_initial_census_sft.py

No p35 ciphertext, FOUND feedback, or downstream p33/p35 result is loaded.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RESOURCE = ROOT / "resources" / "liber-primus"
corpus = json.loads((RESOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
transcription = (RESOURCE / "lp2-transcription.txt").read_text(encoding="utf-8").replace("\r", "")
sections = transcription.split("%")
runes = corpus["runes"]
translit = corpus["translit"]
rune_index = {r: i for i, r in enumerate(runes)}
assert len(sections) == 57
assert len(corpus["pages"]) == 58


def section_index(page: int) -> int:
    if page == 50:
        raise ValueError("p50 is a grid page, not an LP2 text page")
    return page if page <= 49 else page - 1


def rune_lines(page: int) -> list[list[int]]:
    section = sections[section_index(page)]
    lines = []
    for raw in section.split("/"):
        values = [rune_index[ch] for ch in raw if ch in rune_index]
        if values:
            lines.append(values)
    return lines


def recover_rows(gray: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Same fixed CC line recovery used by lp2_round9_cc_line_recovery_sft.py."""
    ink = np.ascontiguousarray((gray[:, 580:1800] < 128).astype(np.uint8))
    _, _, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    bins: dict[int, list[tuple[int, int, int]]] = {}
    for x, y, w, h, area in stats[1:]:
        if 102 <= h <= 125 and 6 <= w <= 135 and area >= 300:
            x0 = int(x) + 580
            key = round(int(y) / 7) * 7
            bins.setdefault(key, []).append((x0, int(y), x0 + int(w)))
    groups: list[list[int]] = []
    for key in sorted(bins):
        if groups and key - groups[-1][-1] <= 21:
            groups[-1].append(key)
        else:
            groups.append([key])
    rows = []
    for group in groups:
        witnesses = [c for key in group for c in bins[key]]
        if len(witnesses) >= 2:
            rows.append((
                round(float(np.median([c[1] for c in witnesses]))),
                len(witnesses),
                min(c[0] for c in witnesses),
                max(c[2] for c in witnesses),
            ))
    return rows


def prime_at(index: int) -> int:
    found = []
    n = 2
    while len(found) <= index:
        if all(n % p for p in found if p * p <= n):
            found.append(n)
        n += 1
    return found[index]


def line_components(gray: np.ndarray, y_top: int) -> list[tuple[int, int, int, int, int, np.ndarray]]:
    crop = np.ascontiguousarray((gray[y_top - 8:y_top + 125, 580:1820] < 128).astype(np.uint8))
    n, _, stats, _ = cv2.connectedComponentsWithStats(crop, connectivity=8)
    found = []
    for x, y, w, h, area in stats[1:]:
        if 102 <= h <= 125 and 6 <= w <= 135 and area >= 300:
            found.append((int(x) + 580, int(y) + y_top - 8, int(w), int(h), int(area), crop[y:y + h, x:x + w]))
    return sorted(found, key=lambda item: item[0])


def normalize_mask(mask: np.ndarray, height: int = 128, width: int = 128) -> np.ndarray:
    mask = np.asarray(mask, dtype=np.uint8)
    h, w = mask.shape
    scale = min(height / h, width / w)
    nh = max(1, int(round(h * scale)))
    nw = max(1, int(round(w * scale)))
    resized = cv2.resize(mask, (nw, nh), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((height, width), dtype=np.uint8)
    y0 = (height - nh) // 2
    x0 = (width - nw) // 2
    canvas[y0:y0 + nh, x0:x0 + nw] = resized
    return canvas > 0.5


def shape_similarity(left: np.ndarray, right: np.ndarray) -> dict:
    a = normalize_mask(left)
    b = normalize_mask(right)
    intersection = int(np.logical_and(a, b).sum())
    union = int(np.logical_or(a, b).sum())
    cosine = float((a.astype(float).ravel() @ b.astype(float).ravel()) /
                   (np.linalg.norm(a) * np.linalg.norm(b)))
    return {"iou": intersection / union, "cosine": cosine}


glyphs = []
for page in range(58):
    if page == 50:
        continue
    scan = page + 17
    image_path = RESOURCE / f"{scan}.jpg"
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    rows = recover_rows(gray)
    lines = rune_lines(page)

    b, g, r = cv2.split(image)
    # Fixed red-ink predicate; intentionally broad enough to include antialiasing.
    red = ((r > 70) & (r > g * 1.35) & (r > b * 1.35)).astype(np.uint8)
    n, _, stats, _ = cv2.connectedComponentsWithStats(red, connectivity=8)
    for component in range(1, n):
        x, y, w, h, area = [int(v) for v in stats[component]]
        # Fixed family census threshold. All retained components are visually
        # large initial-like red marks, not ordinary red text glyphs.
        if h < 120 or w < 35 or area < 1000:
            continue
        if not rows:
            nearest = None
            row_index = None
            dy = None
            small_count = None
            line_len = None
            first_index = None
            first_rune = None
            missing = None
        else:
            row_index = min(range(len(rows)), key=lambda i: abs(rows[i][0] - y))
            row_y, small_count, _, _ = rows[row_index]
            dy = y - row_y
            line = lines[row_index] if row_index < len(lines) else []
            line_len = len(line)
            first_index = line[0] if line else None
            first_rune = translit[first_index] if first_index is not None else None
            missing = line_len - small_count if line else None
            nearest = row_y
        glyphs.append({
            "page": page,
            "scan": scan,
            "bbox": [x, y, w, h],
            "area": area,
            "row_index": row_index,
            "row_y": nearest,
            "dy": dy,
            "small_components": small_count,
            "line_runes": line_len,
            "missing_components": missing,
            "first_rune_index": first_index if missing == 1 and abs(dy or 0) <= 10 else None,
            "first_rune_translit": first_rune if missing == 1 and abs(dy or 0) <= 10 else None,
            "alignment": "one_missing_first_rune" if missing == 1 and abs(dy or 0) <= 10 else "ambiguous",
        })

glyphs.sort(key=lambda x: (x["page"], x["bbox"][1]))
assert len(glyphs) == 15, f"expected 15 large red components, got {len(glyphs)}"

by_page = {}
for glyph in glyphs:
    by_page.setdefault(glyph["page"], []).append(glyph)

# p7 is the third five-dot stencil page, but has no comparable large red initial.
assert by_page.get(7, []) == []

# The first illustrated rune on p23 is U/index 1.
p23 = by_page[23]
assert len(p23) == 1
assert p23[0]["bbox"] == [601, 1155, 230, 498]
assert p23[0]["row_index"] == 0
assert p23[0]["line_runes"] == 20 and p23[0]["small_components"] == 19
assert p23[0]["first_rune_index"] == 1
assert p23[0]["first_rune_translit"] == "U"

# The first illustrated rune on p56 is AE/index 25, not O/index 3.
p56 = by_page[56]
assert len(p56) == 1
assert p56[0]["bbox"] == [601, 668, 150, 498]
assert p56[0]["row_index"] == 0
assert p56[0]["line_runes"] == 20 and p56[0]["small_components"] == 19
assert p56[0]["first_rune_index"] == 25
assert p56[0]["first_rune_translit"] == "AE"

# O/index 3 is the first rune of p56's second line; that line has a full
# complement of ordinary-sized components and has no enlarged red component.
p56_lines = rune_lines(56)
p56_rows = recover_rows(cv2.cvtColor(cv2.imread(str(RESOURCE / "73.jpg")), cv2.COLOR_BGR2GRAY))
assert len(p56_lines) >= 2 and p56_lines[1][0] == 3
assert len(p56_rows) >= 2 and p56_rows[1][1] == len(p56_lines[1]) == 19
assert all(abs(item["bbox"][1] - p56_rows[1][0]) > 10 for item in p56)

# The large glyphs are page-initials; their page coordinates do not follow
# the p23->p56 180-degree dot-stencil transform.
p23_box = p23[0]["bbox"]
p56_box = p56[0]["bbox"]
rotated_p23_box = [
    2400 - (p23_box[0] + p23_box[2]),
    3600 - (p23_box[1] + p23_box[3]),
    p23_box[2],
    p23_box[3],
]
assert rotated_p23_box[0] > 1500 and p56_box[0] == 601

# Pairwise +2 in the zero-based rune-index ring among the unambiguous
# large-red initials. This familywise census is not a selector for p23/p56.
mapped = [g for g in glyphs if g["first_rune_index"] is not None]
plus2_pairs = []
for i, left in enumerate(mapped):
    for right in mapped[i + 1:]:
        if (right["first_rune_index"] - left["first_rune_index"]) % 29 == 2:
            plus2_pairs.append({
                "left_page": left["page"],
                "left_index": left["first_rune_index"],
                "right_page": right["page"],
                "right_index": right["first_rune_index"],
            })
assert (23, 1, 56, 25) not in [
    (p["left_page"], p["left_index"], p["right_page"], p["right_index"])
    for p in plus2_pairs
]

u_prime = prime_at(1)
ae_prime = prime_at(25)
o_prime = prime_at(3)
assert (u_prime, ae_prime, o_prime) == (3, 101, 7)

# Compare the enlarged initials with ordinary-sized same-page glyphs, using
# only the original scans. Shape masks are centered and fit to a 128x128 canvas.
p23_image = cv2.imread(str(RESOURCE / "40.jpg"), cv2.IMREAD_GRAYSCALE)
p56_image = cv2.imread(str(RESOURCE / "73.jpg"), cv2.IMREAD_GRAYSCALE)
p23_rows = recover_rows(p23_image)
p56_rows = recover_rows(p56_image)
p23_u_small = line_components(p23_image, p23_rows[9][0])[0][5].astype(bool)
p23_o_small = line_components(p23_image, p23_rows[8][0])[0][5].astype(bool)
p56_row0 = line_components(p56_image, p56_rows[0][0])
p56_ae_small = [p56_row0[10][5].astype(bool), p56_row0[17][5].astype(bool)]
p56_o_small = [p56_row0[7][5].astype(bool), p56_row0[9][5].astype(bool)]
p23_large_mask = p23_image[1155:1155 + 498, 601:601 + 230] < 128
p56_large_mask = p56_image[668:668 + 498, 601:601 + 150] < 128
p23_shape = {
    "large_vs_small_U": shape_similarity(p23_large_mask, p23_u_small),
    "large_vs_small_O": shape_similarity(p23_large_mask, p23_o_small),
}
p56_shape = {
    "large_vs_small_AE": [shape_similarity(p56_large_mask, item) for item in p56_ae_small],
    "large_vs_small_O": [shape_similarity(p56_large_mask, item) for item in p56_o_small],
}
assert p23_shape["large_vs_small_U"]["iou"] > 0.90
assert p23_shape["large_vs_small_U"]["cosine"] > 0.94
assert p23_shape["large_vs_small_O"]["iou"] < 0.83
assert all(item["iou"] > 0.84 and item["cosine"] > 0.91 for item in p56_shape["large_vs_small_AE"])
assert all(item["iou"] < 0.79 and item["cosine"] < 0.89 for item in p56_shape["large_vs_small_O"])

print(json.dumps({
    "method": {
        "red_mask": "R>70 and R>1.35*G and R>1.35*B",
        "large_component_filter": "height>=120, width>=35, area>=1000",
        "text_component_filter": "gray<128; h=102..125, w=6..135, area>=300",
        "line_grouping": "7px y bins; merge gaps <=21px",
        "source_pages": "LP2 p0..p57 mapped to original scans17..74; p50 skipped",
    },
    "census_count": len(glyphs),
    "glyphs": glyphs,
    "p7_control": {"large_red_components": 0, "five_dot_stencil_page": True},
    "p23_p56_adjudication": {
        "p23": {"large_glyph": "U", "index": 1, "line_runes": 20, "small_components": 19},
        "p56": {"large_glyph": "AE", "index": 25, "line_runes": 20, "small_components": 19},
        "p56_second_line": {"first_rune": "O", "index": 3, "line_runes": 19, "small_components": 19, "large_glyph": False},
        "index_delta_mod29": (25 - 1) % 29,
        "prime_values": {"U": u_prime, "O": o_prime, "AE": ae_prime},
        "prime_delta_U_to_AE": ae_prime - u_prime,
        "rotated_p23_bbox": rotated_p23_box,
        "p56_large_glyph_bbox": p56_box,
        "shape_similarity": {"p23": p23_shape, "p56": p56_shape},
    },
    "other_unambiguous_large_glyph_plus2_pairs": plus2_pairs,
    "conclusion": "The stencil half-turn remains a real page-image relation, but the large p23/p56 initials are U/index1 and AE/index25. O/index3 is an ordinary-sized first rune on p56 line 2, not the enlarged p56 glyph. The claimed U->O +2 bridge is rejected.",
}, ensure_ascii=False, indent=2))
