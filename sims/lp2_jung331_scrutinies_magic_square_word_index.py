#!/usr/bin/env python3
"""Frozen book-cipher test: 5x5 magic-square values as word indices in Jung.

The 2014 onion index has title=133 and div id=331. Title 133 plausibly points
to the Red Book folio whose facing text mentions old runes and magical sayings.
The reversed id 331 may point to the Scrutinies section in the facsimile
pagination; the Reader's Edition supplies the same text with different page
numbers. This tests the 25 square values as 1-based word positions from the
first body sentence of Scrutinies. LP2's parable says the path spirals inward,
and Jung describes the center as the goal, so clockwise inward spiral order
is the sole candidate readout. Row-major is printed only as a control.
"""
from __future__ import annotations
import hashlib
import re
import urllib.request
import fitz

PDF_URL = "https://logoilibrary.com/wp-content/uploads/2023/11/The-Red-Book-Jung.pdf"
ANCHOR = "I resist. I cannot accept this hollow nothing that I am."
MATRIX = [
    [434, 1311, 312, 278, 966],
    [204, 812, 934, 280, 1071],
    [626, 620, 809, 620, 626],
    [1071, 280, 934, 812, 204],
    [966, 278, 312, 1311, 434],
]
WORD_RE = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)*", re.UNICODE)

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "LiberPrimusResearch/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()

def spiral_inward(matrix):
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    out = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out

def main() -> None:
    pdf = download(PDF_URL)
    print("source_url:", PDF_URL)
    print("pdf_bytes:", len(pdf))
    print("pdf_sha256:", hashlib.sha256(pdf).hexdigest())
    doc = fitz.open(stream=pdf, filetype="pdf")
    page_texts = [page.get_text("text") for page in doc]
    full = "\n".join(page_texts)
    match = re.search(r"I\s+resist\.\s+I\s+cannot\s+accept\s+this\s+hollow\s+nothing\s+that\s+I\s+am\.", full, re.IGNORECASE)
    if not match:
        raise SystemExit("Scrutinies body anchor not found; do not substitute a different section.")
    anchor_offset = match.start()
    page_no = 0
    consumed = 0
    for i, value in enumerate(page_texts):
        if consumed + len(value) >= anchor_offset:
            page_no = i + 1
            break
        consumed += len(value) + 1
    words = WORD_RE.findall(full[match.start():])
    max_index = max(max(row) for row in MATRIX)
    print("pdf_pages:", len(doc))
    print("reader_edition_anchor_page_1based:", page_no)
    print("anchor_text:", ANCHOR)
    print("section_word_count_to_end_of_volume:", len(words))
    print("matrix_row_sums:", [sum(row) for row in MATRIX])
    print("matrix_col_sums:", [sum(MATRIX[r][c] for r in range(5)) for c in range(5)])
    print("max_word_index:", max_index)
    if len(words) < max_index:
        raise SystemExit(f"Scrutinies text has only {len(words)} tokens; max index {max_index} is out of range.")
    row_major_indices = [n for row in MATRIX for n in row]
    spiral_indices = spiral_inward(MATRIX)
    row_major = [words[n - 1] for n in row_major_indices]
    spiral = [words[n - 1] for n in spiral_indices]
    print("row_major_control:", " ".join(row_major))
    print("spiral_inward_indices:", spiral_indices)
    print("spiral_inward_candidate:", " ".join(spiral))

if __name__ == "__main__":
    main()
