#!/usr/bin/env python3
"""Image-only GP29 readback for external rune-page scans.

The classifier is trained only on the verified physical LP2 page 43 source
transcription, using the same connected-ink feature as
original_glyph_source_readback.py. It does not decrypt ciphertext. The
fixed text-area crop assumes a 2400x3600 LP-style page; output distances
must be inspected before treating predicted symbols as a transcription.

Usage:
  python sims/known_gp29_image_readback.py path/to/image.jpg [rotation_degrees]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

import original_glyph_source_readback as reference

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabc"
RUNES = reference.RUNES


def glyphs_image(path: Path, rotation: int = 0) -> list[list[np.ndarray]]:
    with Image.open(path) as source:
        image = source.convert("L")
        if rotation:
            image = image.rotate(rotation, expand=True)
        pixels = np.asarray(image)
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    if pixels.shape[1] < x1 or pixels.shape[0] < y1:
        raise ValueError(f"image too small for LP-style crop: {pixels.shape}")
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


def classify(rows: list[list[np.ndarray]], templates: np.ndarray,
             labels: np.ndarray) -> dict:
    xnorm = (templates * templates).sum(axis=1)
    out_rows = []
    all_distances = []
    for row in rows:
        v = np.stack([reference.feature(glyph) for glyph in row])
        distances = ((v*v).sum(axis=1)[:, None] + xnorm[None, :]
                     - 2*(v @ templates.T))
        predictions = []
        for vector in distances:
            order = np.argsort(vector)
            best = int(order[0])
            best_label = int(labels[best])
            other = next((int(i) for i in order[1:]
                          if int(labels[int(i)]) != best_label), int(order[1]))
            predictions.append({
                "index": best_label,
                "letter": ALPHABET[best_label],
                "rune": RUNES[best_label],
                "nearest_distance": round(float(vector[best]), 3),
                "other_class_distance": round(float(vector[other]), 3),
                "class_margin": round(float(vector[other] - vector[best]), 3),
            })
            all_distances.append(float(vector[best]))
        out_rows.append({
            "count": len(predictions),
            "letters": "".join(x["letter"] for x in predictions),
            "runes": "".join(x["rune"] for x in predictions),
            "glyphs": predictions,
        })
    return {
        "row_count": len(out_rows),
        "row_lengths": [x["count"] for x in out_rows],
        "predicted_letters": "/".join(x["letters"] for x in out_rows),
        "predicted_runes": "/".join(x["runes"] for x in out_rows),
        "nearest_distance_summary": {
            "count": len(all_distances),
            "mean": round(float(np.mean(all_distances)), 3) if all_distances else None,
            "median": round(float(np.median(all_distances)), 3) if all_distances else None,
            "p90": round(float(np.percentile(all_distances, 90)), 3) if all_distances else None,
        },
        "rows": out_rows,
    }


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    rotation = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    templates, labels = reference.train()
    rows = glyphs_image(path, rotation)
    result = classify(rows, templates, labels)
    result.update({
        "image": str(path),
        "rotation_degrees": rotation,
        "training_page": 43,
        "training_glyphs": int(len(labels)),
        "claim": "Image-only GP29 glyph classification; not plaintext decryption",
    })
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
