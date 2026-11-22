#!/usr/bin/env python3
"""Reproduce provisional LP2 p57 -> p50 selectors.

This is not a decoder and establishes no LP2 plaintext/key. It exposes
prime-rank offset semantics, title-derived direction, layout controls,
and the p55 totient sample.
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
TITLE_WORDS = ["THE", "INSTAR", "EMERGENCE"]
TITLE_BASENAME_SUM = 761

def tokenize_gp(text):
    text = re.sub(r"ING", "NG", text.upper().replace("K", "C").replace("V", "U"))
    text = re.sub(r"[^A-Z]", "", text)
    vocab = sorted(TRANSLIT, key=len, reverse=True)
    out, pos = [], 0
    while pos < len(text):
        token = next((t for t in vocab if text.startswith(t, pos)), None)
        if token is None: raise ValueError(f"Unmapped GP text at {pos}: {text[pos:]}")
        out.append(TOKEN_INDEX[token]); pos += len(token)
    return out

def is_prime(n):
    if n < 2: return False
    d = 2
    while d*d <= n:
        if n % d == 0: return False
        d += 1
    return True

def prime_rank(n):
    return sum(is_prime(k) for k in range(2, n+1))  # inclusive pi(n)

def phi(n):
    result, x, p = n, n, 2
    while p*p <= x:
        if x % p == 0:
            while x % p == 0: x //= p
            result -= result // p
        p += 1
    if x > 1: result -= result // x
    return result

sentence_sums = [sum(PRIMES[i] for i in tokenize_gp(s)) for s in SENTENCES]
assert sentence_sums == [1259,1031,1229]
assert sentence_sums[0]*sentence_sums[1]*sentence_sums[2] == 1595277641
title_word_sums = [sum(PRIMES[i] for i in tokenize_gp(w)) for w in TITLE_WORDS]
assert title_word_sums == [72,280,409] and sum(title_word_sums) == TITLE_BASENAME_SUM
sentence_ranks = [prime_rank(n) for n in sentence_sums]
title_rank = prime_rank(TITLE_BASENAME_SUM)
title_word_ranks = [prime_rank(n) for n in title_word_sums]
assert sentence_ranks == [205,173,201] and title_rank == 135
assert title_word_ranks == [20,59,80]

byte_rows, token_rows = GRID["byte_rows"], GRID["rows"]
row_major = [v for row in byte_rows for v in row]
row_major_tokens = [v for row in token_rows for v in row]
col_major = [byte_rows[r][c] for c in range(8) for r in range(32)]
col_major_tokens = [token_rows[r][c] for c in range(8) for r in range(32)]
row_serp = [v for i,row in enumerate(byte_rows) for v in (row if i%2==0 else reversed(row))]
row_serp_tokens = [v for i,row in enumerate(token_rows) for v in (row if i%2==0 else reversed(row))]
col_serp, col_serp_tokens = [], []
for c in range(8):
    vals = [byte_rows[r][c] for r in range(32)]
    toks = [token_rows[r][c] for r in range(32)]
    if c%2: vals.reverse(); toks.reverse()
    col_serp.extend(vals); col_serp_tokens.extend(toks)

def extract(name, values, tokens, offsets):
    picked = [values[i] for i in offsets]
    rev = list(reversed(picked))
    return {
        "layout": name, "offsets": offsets,
        "tokens": [tokens[i] for i in offsets], "values": picked,
        "reverse_latin1": bytes(rev).decode("latin-1"),
        "reverse_gp29": "".join(TRANSLIT[v%29] for v in rev),
    }

offsets = sentence_ranks + [title_rank]

# The only source-attested competing radix model in this audit drops the
# unused lowercase f from the 60-character alphabet (see
# sims/base60_base59_source_ambiguity.cjs). Decode only the four fixed,
# source-selected offsets; do not search alternate alphabets or offsets.
digits60 = GRID["alphabet"]
digits59 = digits60.replace("f", "")
def decode_token(token, alphabet):
    value = 0
    for char in token:
        digit = alphabet.find(char)
        if digit < 0:
            raise ValueError(f"Token {token!r} is not valid in radix alphabet")
        value = value * len(alphabet) + digit
    return value

base59_values = [None] * 256
for offset in offsets:
    base59_values[offset] = decode_token(row_major_tokens[offset], digits59)
base59_drop_f_control = extract(
    "row-major-base59-drop-f", base59_values, row_major_tokens, offsets
)
assert base59_drop_f_control["values"] == [75,115,73,168]
assert base59_drop_f_control["reverse_latin1"] == "¨IsK"
assert base59_drop_f_control["reverse_gp29"] == "DSEAB"

base60_selected = extract("row-major-base60", row_major, row_major_tokens, offsets)
assert base60_selected["values"] == [76,117,74,171]
assert base60_selected["reverse_latin1"] == "«JuL"
assert base60_selected["reverse_gp29"] == "YTUE"

selected_values = [row_major[i] for i in offsets]
phi_values = [phi(v) for v in selected_values[:3]]
title_word_values = [row_major[i] for i in title_word_ranks]
p55 = next(p["indices"] for p in CORPUS["pages"] if p["page"] == 55)
p55_payload = [v for i,v in enumerate(p55) if i != 0 and v != 0]
assert len(p55) == 76 and len(p55_payload) == 72
p55_first, p55_second = p55_payload[:36], p55_payload[36:]
p55_mobius = p55_first + list(reversed(p55_second))
p55_sample = [p55_payload[n-1] for n in phi_values]
p55_mobius_sample = [p55_mobius[n-1] for n in phi_values]
rank_indices = [r-1 for r in offsets]

print(json.dumps({
    "sentence_sums": sentence_sums, "sentence_prime_ranks": sentence_ranks,
    "title_words": TITLE_WORDS, "title_word_sums": title_word_sums,
    "title_word_prime_ranks": title_word_ranks,
    "title_basename_sum": TITLE_BASENAME_SUM, "title_prime_rank": title_rank,
    "row_major_offset_extraction": extract("row-major", row_major, row_major_tokens, offsets),
    "base59_drop_f_control": base59_drop_f_control,
    "column_major_control": extract("column-major", col_major, col_major_tokens, offsets),
    "row_serpentine_control": extract("row-serpentine", row_serp, row_serp_tokens, offsets),
    "column_serpentine_control": extract("column-serpentine", col_serp, col_serp_tokens, offsets),
    "title_word_rank_control": {
        "tokens": [row_major_tokens[i] for i in title_word_ranks],
        "values": title_word_values,
        "reverse_latin1": bytes(reversed(title_word_values)).decode("latin-1"),
        "reverse_gp29": "".join(TRANSLIT[v%29] for v in reversed(title_word_values)),
    },
    "ordinary_nth_item_control": {
        "indices": rank_indices, "tokens": [row_major_tokens[i] for i in rank_indices],
        "values": [row_major[i] for i in rank_indices],
    },
    "phi_of_sentence_selected_bytes": phi_values,
    "p55_cipher_consuming_length": len(p55_payload),
    "p55_row_major_sample": "".join(TRANSLIT[v] for v in p55_sample),
    "p55_2x36_mobius_sample": "".join(TRANSLIT[v] for v in p55_mobius_sample),
    "phi_29": phi(29), "weekday_of_2015_07_28": date(2015,7,28).strftime("%A"),
    "classification": "provisional source-linked selectors; no LP2 plaintext/key",
}, indent=2))
