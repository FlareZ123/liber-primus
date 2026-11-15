"""Independently image-read original GP29 on 58 source pages, one-file SFT.

Uses the locked two-page raster template and held-out source geometry from
lp2_original_rune_typography_sft.py. Reads original JPEG bytes. Writes nothing.
The baseline module's 6,352-gap, held-out source check must pass first.
"""
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import runpy

import numpy as np

baseline = Path(__file__).with_name("lp2_original_rune_typography_sft.py")
with redirect_stdout(io.StringIO()):
    model = runpy.run_path(str(baseline))

detect = model["detect"]
predict = model["predict"]
source_image = model["source_image"]
classes = model["types"]
templates = model["templates"]
corpus = model["CORPUS"]

exact = []
partial = []
same_length_disagreements = []
page_details = []
for page in range(58):
    original = source_image(page)
    output = []
    line_counts = []
    for row in range(15):
        boxes = detect(original, row, xmax=1810)
        if len(boxes) < 5:
            continue
        runes, confidence = predict(boxes, classes, templates)
        if np.mean(confidence > 0.88) <= 0.80:
            continue
        output.extend(runes.tolist())
        line_counts.append([row, len(boxes)])

    expected = corpus["pages"][page]["indices"]
    if len(output) == len(expected) and output == expected:
        exact.append(page)
    elif len(output) == len(expected):
        same_length_disagreements.append(page)
    else:
        partial.append(page)
    page_details.append({
        "page": page,
        "source_runes": len(expected),
        "image_runes": len(output),
        "read_line_counts": line_counts,
    })

assert same_length_disagreements == [], same_length_disagreements
assert exact == [2, 9, 12, 13, 14, 19, 26, 28, 29, 31, 32, 34,
                 46, 47, 49, 50, 52, 55], exact
assert len(partial) == 40, len(partial)
assert len(corpus["pages"][50]["indices"]) == 0

print(json.dumps({
    "scope": "Original 58 LP2 JPEGs, no ciphertext transformation",
    "original_train_pages": [32, 55],
    "image_only_complete_rune_pages": [p for p in exact if p != 50],
    "exact_complete_rune_page_count": len(exact) - 1,
    "original_numeric_only_blank_control": 50,
    "same_length_original_image_vs_source_mismatches": same_length_disagreements,
    "partial_pages": partial,
    "coverage_by_original_page": page_details,
    "boundary": "Large drop caps, graphics, shifted line registers and right-edge "+
                "mergers leave partial pages; no claim of recovered unknown plaintext.",
}, indent=2))
