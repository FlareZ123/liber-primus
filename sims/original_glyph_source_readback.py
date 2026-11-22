#!/usr/bin/env python3
"""Independent image readback of LP2 rune glyphs, trained on physical page 43.

Run: python sims/original_glyph_source_readback.py
Dependencies: numpy, Pillow. Uses original source JPEGs and canonical transcript.
This reads PRINTED GLYPHS rather than decrypting ciphertext. Training labels are
p43 only; all other pages are source-original heldout comparisons.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"
RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
CORPUS = json.loads((IMAGES / "lp2-corpus.json").read_text(encoding="utf8"))
TRANSCRIPT = (ROOT / "resources" / "lp2-transcription.txt").read_text(
    encoding="utf8").split("%")
assert len(RUNES) == 29
assert len(CORPUS["pages"]) == 58


def source_lines(page: int) -> list[list[int]]:
    """The transcription omits physical p50's runeless numerical grid."""
    if page == 50:
        return []
    source_page = page if page < 50 else page - 1
    parts = TRANSCRIPT[source_page].split("/")
    lines = [
        [RUNES.index(c) for c in part if c in RUNES]
        for part in parts
    ]
    return [line for line in lines if line]


def glyphs(page: int) -> list[list[np.ndarray]]:
    """Segment the regular printed text area without reading rune identities."""
    with Image.open(IMAGES / f"{page+17:02d}.jpg") as image:
        pixels = np.asarray(image.convert("L"))
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    black = pixels[y0:y1, x0:x1] < 110
    ys = np.flatnonzero(black.sum(axis=1) >= 18)
    bands = np.split(ys, np.flatnonzero(np.diff(ys) > 20) + 1)
    result = []
    for band in bands:
        if band.size <= 40 or int(band[-1] - band[0]) < 40:
            continue
        ink = black[int(band[0]):int(band[-1]) + 1]
        xs = np.flatnonzero(ink.sum(axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
        row = []
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            area = np.argwhere(ink[:, left:right])
            if len(area) < 100 or np.ptp(area[:, 0]) < 32:
                continue
            start = left + x0
            if 595 <= start <= 1800 and np.ptp(area[:, 0]) + 1 >= 70:
                crop = ink[:, left:right]
                rows, columns = np.where(crop)
                row.append(crop[rows.min():rows.max()+1,
                                columns.min():columns.max()+1])
        if row:
            result.append(row)
    return result


def feature(glyph: np.ndarray) -> np.ndarray:
    """Fixed-size ink feature, retaining the letter's native width."""
    canvas = np.zeros((100, 100), dtype=np.uint8)
    h, w = glyph.shape
    canvas[:min(h, 100), :min(w, 100)] = (
        glyph[:100, :100].astype(np.uint8) * 255)
    reduced = Image.fromarray(canvas).resize(
        (50, 50), resample=Image.Resampling.BOX)
    return np.asarray(reduced, dtype=np.float32).ravel() / 255


def train() -> tuple[np.ndarray, np.ndarray]:
    """Page-43 reference needs no OCR and is fully checked against source."""
    observed = glyphs(43)
    source = source_lines(43)
    assert [len(line) for line in observed] == [len(line) for line in source]
    vectors, labels = [], []
    for glyph_row, rune_row in zip(observed, source):
        for glyph, letter in zip(glyph_row, rune_row):
            vectors.append(feature(glyph))
            labels.append(letter)
    x, y = np.stack(vectors), np.asarray(labels, dtype=int)
    assert len(y) == 274 and len(np.unique(y)) == 29

    # Leave-one-out exact rune labels: hidden glyph is never its own template.
    norms = (x*x).sum(axis=1)
    distances = norms[:, None] + norms[None, :] - 2*(x @ x.T)
    np.fill_diagonal(distances, np.inf)
    predicted = y[np.argmin(distances, axis=1)]
    assert np.array_equal(predicted, y), "Training self-check drifted"
    return x, y


def readback(page: int, x: np.ndarray, y: np.ndarray) -> dict:
    """Compare an image-only output against the source at its physical page."""
    rows = glyphs(page)
    source = CORPUS["pages"][page]["indices"]
    expected = source_lines(page)
    xnorm = (x*x).sum(axis=1)
    predicted = []
    for row in rows:
        v = np.stack([feature(glyph) for glyph in row])
        distances = (v*v).sum(axis=1)[:, None] + xnorm[None, :] - 2*(v @ x.T)
        predicted.extend(y[np.argmin(distances, axis=1)].tolist())
    exact = predicted == source
    # A length mismatch may mean clipping, artwork, or an extra spurious blob.
    # It is not automatically a transcript correction.
    return {
        "page": page,
        "expected_runes": len(source),
        "observed_glyphs": len(predicted),
        "expected_lines": [len(line) for line in expected],
        "observed_lines": [len(line) for line in rows],
        "exact_original_readback": exact,
        "first_difference": next((
            i for i, (a, b) in enumerate(zip(predicted, source)) if a != b
        ), None),
    }


def main() -> None:
    x, y = train()
    records = [readback(page, x, y) for page in range(56) if page != 50]
    matching = [r for r in records if r["exact_original_readback"]]
    heldout = [r for r in matching if r["page"] != 43]
    assert len(heldout) >= 15
    assert sum(r["expected_runes"] for r in heldout) >= 4044
    print(json.dumps({
        "method": "native JPEG connected-ink template readback",
        "training_page": 43,
        "training_loo_correct": 274,
        "heldout_fully_exact_pages": [r["page"] for r in heldout],
        "heldout_fully_exact_runes": sum(r["expected_runes"] for r in heldout),
        "all_page_results": records,
        "claim": "Source transcription confirmation only; no cryptanalytic key or plaintext",
    }, indent=2))


if __name__ == "__main__":
    main()
