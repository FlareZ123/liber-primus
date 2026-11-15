#!/usr/bin/env python3
"""Reproduce a provisional LP2 p57 -> p50 historical date-pointer hypothesis.

This is not a decoder and does not establish LP2 plaintext or key. It makes
the prime-rank indexing ambiguity and two full-grid serpentine controls explicit.
"""
import json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
GRID = json.loads((ROOT / "resources/liber-primus/base60-grid.json").read_text())
TRANSLIT, PRIMES = CORPUS["translit"], CORPUS["prime"]
TOKEN_INDEX = {t: i for i, t in enumerate(TRANSLIT)}
SENTENCES = [
    "LIKE THE INSTAR TUNNELING TO THE SURFACE",
    "WE MUST SHED OUR OWN CIRCUMFERENCES",
    "FIND THE DIVINITY WITHIN AND EMERGE",
]

def tokenize_gp(text):
    text = re.sub(r"ING", "NG", text.upper().replace("K", "C").replace("V", "U"))
    text = re.sub(r"[^A-Z]", "", text)
    vocab = sorted(TRANSLIT, key=len, reverse=True)
    out, pos = [], 0
    while pos < len(text):
        token = next((t for t in vocab if text.startswith(t, pos)), None)
        if token is None:
            raise ValueError(f"Unmapped GP text at {pos}: {text[pos:]}")
        out.append(TOKEN_INDEX[token])
        pos += len(token)
    return out

def is_prime(n):
    if n < 2: return False
    d = 2
    while d*d <= n:
        if n % d == 0: return False
        d += 1
    return True

def prime_rank(n):
    return sum(is_prime(k) for k in range(2, n+1))  # inclusive pi(n), one-based rank

def phi(n):
    result, x, p = n, n, 2
    while p*p <= x:
        if x % p == 0:
            while x % p == 0: x //= p
            result -= result // p
        p += 1
    if x > 1: result -= result // x
    return result

sums = [sum(PRIMES[i] for i in tokenize_gp(s)) for s in SENTENCES]
product = sums[0] * sums[1] * sums[2]
assert sums == [1259, 1031, 1229] and product == 1595277641
assert all(is_prime(n) for n in sums)
ranks = [prime_rank(n) for n in sums]
assert ranks == [205, 173, 201]

byte_rows, token_rows = GRID["byte_rows"], GRID["rows"]
assert len(byte_rows) == len(token_rows) == 32
assert all(len(r) == 8 for r in byte_rows + token_rows)

row_major = [v for row in byte_rows for v in row]
row_major_tokens = [v for row in token_rows for v in row]
row_serp = [v for i, row in enumerate(byte_rows) for v in (row if i % 2 == 0 else reversed(row))]
row_serp_tokens = [v for i, row in enumerate(token_rows) for v in (row if i % 2 == 0 else reversed(row))]
col_serp, col_serp_tokens = [], []
for c in range(8):
    vals = [byte_rows[r][c] for r in range(32)]
    toks = [token_rows[r][c] for r in range(32)]
    if c % 2:
        vals.reverse()
        toks.reverse()
    col_serp.extend(vals)
    col_serp_tokens.extend(toks)

def extract(name, values, tokens):
    picked = [values[i] for i in ranks]  # hypothesis: pi(p) is a zero-based byte offset
    picked_tokens = [tokens[i] for i in ranks]
    rev = list(reversed(picked))
    return {
        "layout": name, "offset_tokens": picked_tokens, "offset_values": picked,
        "reverse_ascii": bytes(rev).decode("ascii", errors="replace"),
        "reverse_gp29_indices": [v % 29 for v in rev],
        "reverse_gp29": "".join(TRANSLIT[v % 29] for v in rev),
    }

rank_indices = [r-1 for r in ranks]  # ordinary zero-based index of nth prime
rank_values = [row_major[i] for i in rank_indices]
rank_tokens = [row_major_tokens[i] for i in rank_indices]
print(json.dumps({
    "sentence_prime_sums": sums, "product": product, "inclusive_prime_ranks": ranks,
    "row_major_offset_hypothesis": extract("row-major", row_major, row_major_tokens),
    "row_serpentine_control": extract("row-serpentine", row_serp, row_serp_tokens),
    "column_serpentine_control": extract("column-serpentine", col_serp, col_serp_tokens),
    "ordinary_nth_item_control": {
        "indices": rank_indices, "tokens": rank_tokens, "values": rank_values,
        "gp29_forward": "".join(TRANSLIT[v % 29] for v in rank_values),
    },
    "phi_29": phi(29),
    "weekday_of_2015_07_28": date(2015, 7, 28).strftime("%A"),
    "classification": "provisional date-pointer hypothesis; no LP2 plaintext/key",
}, indent=2))
