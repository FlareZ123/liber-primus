#!/usr/bin/env python3
"""Apply the source-motivated Euler-phi selector to every annotated red span.

Run from a repository checkout:
    python sims/lp2_red_span_phi_selector_control.py

This is a bounded specificity control: GP prime weights are summed within each
annotated red span, Euler phi is applied once, and the result is reduced mod 29.
No ciphertext, plaintext, dictionary, or 27x27 block output is consulted.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources/liber-primus/lp2-corpus.json"
INK_PATH = ROOT / "resources/liber-primus/lp2-ink-annotations.json"


def phi(n: int) -> int:
    if n < 1:
        raise ValueError("Euler phi is defined here for positive integers")
    result, remainder = n, n
    p = 2
    while p * p <= remainder:
        if remainder % p == 0:
            while remainder % p == 0:
                remainder //= p
            result -= result // p
        p += 1
    if remainder > 1:
        result -= result // remainder
    return result


def main() -> None:
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    ink = json.loads(INK_PATH.read_text(encoding="utf-8"))
    pages = {int(page["page"]): page for page in corpus["pages"]}
    prime_weights = [int(x) for x in corpus["prime"]]

    rows = []
    for page in ink["pages"]:
        page_no = int(page["page"])
        source = pages[page_no]
        indices = [int(x) for x in source["indices"]]
        for span in page.get("red_spans", []):
            start, length = int(span["start"]), int(span["length"])
            selected = indices[start:start + length]
            if len(selected) != length:
                raise AssertionError(f"p{page_no} span {start}:{length} exceeds source indices")
            total = sum(prime_weights[i] for i in selected)
            value = phi(total)
            rows.append((page_no, start, length, total, value, value % 29))

    print("page,start,length,GP-prime-sum,phi(sum),phi(sum) mod 29")
    for row in rows:
        print(",".join(map(str, row)))

    matches = [row for row in rows if row[-1] == 11]
    expected = [row for row in rows if row[0] == 0 and row[2] == 13]
    assert len(rows) == 18, f"expected 18 annotated red spans, found {len(rows)}"
    assert len(matches) == 1 and matches == expected, (matches, expected)
    assert phi(662) == 330 and phi(331) == 330

    print("\nPASS: p0's 13-rune red span is the only annotated red span with phi(sum) mod 29 = 11 (J).")
    print("φ(662)=φ(331)=330; dividing the p0 sum by two is unnecessary.")
    print("This is a specificity control for a candidate selector, not proof of intended use or a decryption.")


if __name__ == "__main__":
    main()
