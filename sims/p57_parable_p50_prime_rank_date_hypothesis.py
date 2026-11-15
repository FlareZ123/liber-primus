#!/usr/bin/env python3
"""Reproduce a provisional LP2 p57 -> p50 historical date-pointer hypothesis.

This is not a decoder and does not establish LP2 plaintext or key. It makes
the prime-rank indexing ambiguity explicit.
"""
import json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
GRID = json.loads((ROOT / "resources/liber-primus/base60-grid.json").read_text())
TRANSLIT = CORPUS["translit"]
PRIMES = CORPUS["prime"]
TOKEN_INDEX = {token: i for i, token in enumerate(TRANSLIT)}
SENTENCES = [
    "LIKE THE INSTAR TUNNELING TO THE SURFACE",
    "WE MUST SHED OUR OWN CIRCUMFERENCES",
    "FIND THE DIVINITY WITHIN AND EMERGE",
]

def tokenize_gp(text):
    # Historical GP orthography: C for K, U for V; NG represents ING here.
    text = re.sub(r"ING", "NG", text.upper().replace("K", "C").replace("V", "U"))
    text = re.sub(r"[^A-Z]", "", text)
    tokens = sorted(TRANSLIT, key=len, reverse=True)
    out, pos = [], 0
    while pos < len(text):
        token = next((t for t in tokens if text.startswith(t, pos)), None)
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
    # Inclusive pi(n): the one-based rank of prime n.
    return sum(is_prime(k) for k in range(2, n+1))

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
assert sums == [1259, 1031, 1229], sums
assert product == 1595277641, product
assert all(is_prime(n) for n in sums)
ranks = [prime_rank(n) for n in sums]
assert ranks == [205, 173, 201], ranks

tokens = [t for row in GRID["rows"] for t in row]
values = [v for row in GRID["byte_rows"] for v in row]
assert len(tokens) == len(values) == 256

# Hypothesis A: pi(p) is used as a zero-based byte offset (skip pi(p) bytes).
offset_tokens = [tokens[i] for i in ranks]
offset_values = [values[i] for i in ranks]
rev_values = list(reversed(offset_values))
rev_gp_indices = [v % 29 for v in rev_values]
rev_gp = "".join(TRANSLIT[i] for i in rev_gp_indices)

# Control B: ordinary zero-based index of the nth prime is pi(p)-1.
rank_indices = [r-1 for r in ranks]
rank_tokens = [tokens[i] for i in rank_indices]
rank_values = [values[i] for i in rank_indices]
rank_gp = "".join(TRANSLIT[v % 29] for v in rank_values)

print(json.dumps({
    "sentence_prime_sums": sums,
    "product": product,
    "inclusive_prime_ranks": ranks,
    "offset_hypothesis": {
        "tokens": offset_tokens, "values": offset_values,
        "reverse_values": rev_values,
        "reverse_ascii": bytes(rev_values).decode("ascii"),
        "reverse_gp29_indices": rev_gp_indices,
        "reverse_gp29": rev_gp,
    },
    "ordinary_nth_item_control": {
        "indices": rank_indices, "tokens": rank_tokens,
        "values": rank_values, "gp29_forward": rank_gp,
    },
    "phi_29": phi(29),
    "weekday_of_2015_07_28": date(2015, 7, 28).strftime("%A"),
    "classification": "provisional date-pointer hypothesis; no LP2 plaintext/key",
}, indent=2))
