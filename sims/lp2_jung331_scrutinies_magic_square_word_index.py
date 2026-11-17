#!/usr/bin/env python3
"""One frozen book-cipher test: LP2/2014 5x5 magic-square values as 1-based
word positions in Jung's Liber Tertius: Scrutinies (TOC page 331).

The 2014 onion index has title=133 and div id=331. Jung's Red Book page 133
is the folio with old-rune/magical-sayings imagery; the TOC places Scrutinies
at p.331 (the body begins on printed p.334). The LP2 5x5 magic square supplies
25 numbers. This tests only the natural row-major, 1-based word-index reading
from the first sentence of Scrutinies. It is not a general search.
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

def main() -> None:
    pdf = download(PDF_URL)
    print("source_url:", PDF_URL)
    print("pdf_bytes:", len(pdf))
    print("pdf_sha256:", hashlib.sha256(pdf).hexdigest())
    doc = fitz.open(stream=pdf, filetype="pdf")
    page_texts = [page.get_text("text") for page in doc]
    full = "\n".join(page_texts)
    # The phrase is the first body text after the Scrutinies heading; allow
    # PDF line-wrap whitespace while keeping this source-defined anchor exact.
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
    section = full[match.start():]
    words = WORD_RE.findall(section)
    max_index = max(max(row) for row in MATRIX)
    print("pdf_pages:", len(doc))
    print("anchor_page_1based:", page_no)
    print("anchor_text:", ANCHOR)
    print("section_word_count:", len(words))
    print("matrix_row_sums:", [sum(row) for row in MATRIX])
    print("matrix_col_sums:", [sum(MATRIX[r][c] for r in range(5)) for c in range(5)])
    print("max_word_index:", max_index)
    if len(words) < max_index:
        raise SystemExit(f"Scrutinies section has only {len(words)} tokens; max index {max_index} is out of range.")
    selected = [[words[n - 1] for n in row] for row in MATRIX]
    print("selected_words_row_major:")
    for row in selected:
        print(" | ".join(row))
    print("selected_sequence:", " ".join(word for row in selected for word in row))

if __name__ == "__main__":
    main()
