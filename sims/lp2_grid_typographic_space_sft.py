#!/usr/bin/env python3
"""Original-LP2 32x8 numeral grid gap test against variable ASCII spaces.

Source: physical LP2 pp49-51, original scans 66.jpg,67.jpg,68.jpg.
Decisive question: do glyph-pair-corrected printed gaps support one vs two
literal space widths as a hidden bit? This script examines source JPEG pixels,
never OCRs rune identities, and validates transcription glyph counts.

Single runnable test file: python sims/lp2_grid_typographic_space_sft.py
Dependencies: numpy, Pillow. The original images and parsed tokens are inputs.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "resources" / "liber-primus"
GRID = json.loads((ART / "lp2-grid-256.json").read_text(encoding="utf-8"))
Y_CENTERS = {
    66: [1300, 1476, 1657, 1837, 2016, 2195, 2374, 2553, 2733, 2911],
    67: [679, 859, 1037, 1217, 1396, 1575, 1754, 1933, 2112, 2288, 2468, 2647, 2828],
    68: [679, 859, 1037, 1217, 1396, 1575, 1754, 1933, 2112],
}


def glyph_components(gray: np.ndarray, center_y: int) -> list[tuple[int, int]]:
    """Project dark original ink onto x, retaining printable text region."""
    strip = gray[center_y - 65 : center_y + 65, 560:1860]
    histogram = (strip < 165).sum(axis=0)
    active = histogram >= 3
    edges = np.diff(np.r_[False, active, False].astype(np.int8))
    starts = np.flatnonzero(edges > 0) + 560
    ends = np.flatnonzero(edges < 0) + 560
    return [
        (int(start), int(end))
        for start, end in zip(starts, ends)
        if end - start >= 3 and start > 590 and end < 1810
    ]


def observe() -> tuple[list[dict], int]:
    all_gaps = []
    excluded = 0
    assert [p["page"] for p in GRID["pages"]] == [49, 50, 51]
    for source, page in zip((66, 67, 68), GRID["pages"]):
        gray = np.asarray(Image.open(ART / f"{source}.jpg").convert("L"))
        assert gray.shape == (3600, 2400), f"wrong original scan shape: {source}"
        centers = Y_CENTERS[source]
        assert len(centers) == page["rows"]
        assert len(page["tokens"]) == 8 * len(centers)
        for row, y in enumerate(centers):
            tokens = page["tokens"][8*row:8*(row+1)]
            assert len(tokens) == 8 and all(len(token) == 2 for token in tokens)
            chars = "".join(tokens)
            components = glyph_components(gray, y)
            # In scan 68, first numeric row 0J touches at the font's ink
            # boundary. Leave out the complete row rather than falsely
            # invent its 0/J glyph gap or shift later glyph assignments.
            if source == 68 and row == 0:
                assert len(components) == 15, components
                excluded += 1
                continue
            assert len(components) == 16, (source, row, components)
            for j in range(15):
                left, right = components[j], components[j+1]
                gap = right[0] - left[1]
                assert gap > 0
                all_gaps.append({
                    "source": source, "row": row, "position": j,
                    "left": chars[j], "right": chars[j+1],
                    "spaced": j % 2 == 1, "pixels": gap,
                })
    assert len(all_gaps) == 31 * 15
    assert excluded == 1
    return all_gaps, excluded


def linear_model(train: list[dict]):
    """Ridge fit of gap = intercept + trailing/leading glyph ink bearings."""
    left = sorted({o["left"] for o in train})
    right = sorted({o["right"] for o in train})
    n = 1 + len(left) + len(right)
    lmap = {c: j + 1 for j, c in enumerate(left)}
    rmap = {c: j + 1 + len(left) for j, c in enumerate(right)}
    design = np.zeros((len(train), n), dtype=np.float64)
    for i, o in enumerate(train):
        design[i, 0] = 1.0
        design[i, lmap[o["left"]]] = 1.0
        design[i, rmap[o["right"]]] = 1.0
    targets = np.array([o["pixels"] for o in train], dtype=np.float64)
    penalty = np.eye(n, dtype=np.float64) * 0.05
    penalty[0, 0] = 0.0
    coefficients = np.linalg.solve(design.T @ design + penalty, design.T @ targets)

    def estimate(o: dict) -> float:
        return float(coefficients[0] + coefficients[lmap[o["left"]]] +
                     coefficients[rmap[o["right"]]])

    return estimate, set(left), set(right)


def main() -> None:
    observations, excluded = observe()
    intra = [o for o in observations if not o["spaced"]]
    inter = [o for o in observations if o["spaced"]]
    assert len(intra) == 248 and len(inter) == 217
    assert all(o["right"] in "01234" for o in inter)
    groups: dict[tuple[str, str], dict[bool, list[float]]] = {}
    for o in observations:
        pair = (o["left"], o["right"])
        groups.setdefault(pair, {False: [], True: []})[o["spaced"]].append(o["pixels"])
    matched_pairs = {
        f"{a}->{b}": round(float(np.median(v[True]) - np.median(v[False])), 3)
        for (a,b), v in groups.items() if v[True] and v[False]
    }
    # Same character pair observed WITH and WITHOUT literal printed space.
    # Eight comparisons all independently recover the same full-space width.
    assert len(matched_pairs) == 8, matched_pairs
    assert 26.5 <= min(matched_pairs.values())
    assert max(matched_pairs.values()) <= 27.5
    spacing = float(np.median(list(matched_pairs.values())))
    assert spacing == 27.0

    train = [o for o in inter if o["source"] != 68]
    blind = [o for o in inter if o["source"] == 68]
    assert len(train) == 161 and len(blind) == 56
    prediction, known_left, known_right = linear_model(train)
    heldout = [o for o in blind if o["left"] in known_left and o["right"] in known_right]
    assert len(heldout) == 54
    errors = np.array([o["pixels"] - prediction(o) for o in heldout])
    rmse = float(np.sqrt(np.mean(errors**2)))
    worst = float(np.max(np.abs(errors)))
    assert rmse < 0.85, rmse
    assert worst < 2.5, worst

    full, _, _ = linear_model(inter)
    full_errors = [o["pixels"] - full(o) for o in inter]
    max_full = max(abs(e) for e in full_errors)
    assert max_full < 2.0, max_full

    report = {
        "source": "original 2400x3600 scans 66-68.jpg; canonical printed numeric tokens",
        "rows": len(Y_CENTERS[66]) + len(Y_CENTERS[67]) + len(Y_CENTERS[68]),
        "segmented_rows": 31,
        "excluded_merged_row": "68.jpg, numeric row0, fused 0J glyphs",
        "glyph_gap_observations": len(observations),
        "within_token_gaps": len(intra), "intertoken_gaps": len(inter),
        "paired_same_characters": matched_pairs,
        "median_literal_space_width_pixels": spacing,
        "model": "one fitted intercept + arbitrary left/right printed glyph ink side bearings",
        "blind_fit_source": "66.jpg and 67.jpg",
        "blind_predict_source": "68.jpg rows 1-8",
        "blind_intertoken_total": len(blind),
        "blind_intertoken_with_both_glyphs_seen_before": len(heldout),
        "blind_error_rmse_pixels": round(rmse, 6),
        "blind_error_max_abs_pixels": round(worst, 6),
        "all_intertoken_error_max_abs_pixels": round(max_full, 6),
        "decision": "No additional one-space-width (27px) channel in the 217 measured intertoken gaps; cannot exclude other JPEG steganography or punctuation channels",
    }
    print("PASS: original p49-51 grid spacings consistent with one ordinary space")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
