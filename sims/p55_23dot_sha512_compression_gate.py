#!/usr/bin/env python3
"""Test the source-derived p55 23-dot / 1024-bit block as one raw SHA-512 compression.

Run from the repository root:
    python sims/p55_23dot_sha512_compression_gate.py

Uses OpenSSL's SHA512_Transform and validates it against SHA512("abc").
No external Python packages are required.
"""
from __future__ import annotations

import ctypes
import ctypes.util
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
raw = (ROOT / "resources/lp2-transcription.txt").read_text()
runes = set(corpus["runes"])

# Match the repository's LP2 word parser: '%' advances the rune-bearing page
# clock but does not terminate a word; slash/whitespace are layout only.
page = 0
word: list[str] = []
word_start: int | None = None
words: list[tuple[int, list[str]]] = []

def finish() -> None:
    global word, word_start
    if word:
        assert word_start is not None
        words.append((word_start, word))
        word = []
        word_start = None

source = "%".join(raw.split("%")[:55])
for ch in source:
    if ch in runes:
        if not word:
            word_start = page
        word.append(ch)
    elif ch == "%":
        page += 1
    elif ch == "/" or ch.isspace():
        continue
    else:
        finish()
finish()

# Physical p55 is rune-bearing page ordinal 54 (physical p50 has no runic page).
p55_words = [w for start_page, w in words if start_page == 54]
assert [len(w) for w in p55_words] == [
    4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3
]
twice_peeled = [r for w in p55_words for r in w[2:-2]]
assert len(twice_peeled) == 23
indices = [corpus["runes"].index(r) for r in twice_peeled]
weights = [corpus["prime"][i] for i in indices]
assert weights == [
    17, 89, 97, 61, 2, 47, 31, 71, 3, 13, 43, 23,
    79, 89, 107, 31, 17, 47, 41, 5, 5, 31, 71
]
assert sum(weights) == 1020

# p57's original 9x5 stencil is:
# .###.
# #...#
# .###.
# #...#
# .###.
# #...#
# .###.
# #...#
# .###.
# The four empty corners are inserted as literal zero bits at the source-fixed
# row-major boundaries: before run 0, after run 2, before run 20, after run 22.
def candidate_block(first_bit: int) -> bytes:
    runs = [str((first_bit + i) % 2) * n for i, n in enumerate(weights)]
    bits = (
        "0" + "".join(runs[:3]) + "0"
        + "".join(runs[3:20]) + "0"
        + "".join(runs[20:]) + "0"
    )
    assert len(bits) == 1024
    return int(bits, 2).to_bytes(128, "big")

class BufferUnion(ctypes.Union):
    _fields_ = [
        ("d", ctypes.c_uint64 * 16),
        ("p", ctypes.c_ubyte * 128),
    ]

class SHA512Context(ctypes.Structure):
    _fields_ = [
        ("h", ctypes.c_uint64 * 8),
        ("Nl", ctypes.c_uint64),
        ("Nh", ctypes.c_uint64),
        ("u", BufferUnion),
        ("num", ctypes.c_uint),
        ("md_len", ctypes.c_uint),
    ]

IV = [
    0x6A09E667F3BCC908, 0xBB67AE8584CAA73B,
    0x3C6EF372FE94F82B, 0xA54FF53A5F1D36F1,
    0x510E527FADE682D1, 0x9B05688C2B3E6C1F,
    0x1F83D9ABFB41BD6B, 0x5BE0CD19137E2179,
]
libcrypto_name = ctypes.util.find_library("crypto")
if not libcrypto_name:
    raise RuntimeError("OpenSSL libcrypto with SHA512_Transform is required")
libcrypto = ctypes.CDLL(libcrypto_name)
transform = libcrypto.SHA512_Transform
transform.argtypes = [
    ctypes.POINTER(SHA512Context), ctypes.POINTER(ctypes.c_ubyte)
]
transform.restype = None

def compress_one(block: bytes) -> str:
    assert len(block) == 128
    ctx = SHA512Context()
    for i, value in enumerate(IV):
        ctx.h[i] = value
    ctx.Nl = ctx.Nh = 0
    ctx.num = 0
    ctx.md_len = 64
    data = (ctypes.c_ubyte * 128).from_buffer_copy(block)
    transform(ctypes.byref(ctx), data)
    return b"".join(int(ctx.h[i]).to_bytes(8, "big") for i in range(8)).hex()

# Correctness control: one compression of SHA-512's correctly padded "abc".
abc_block = (
    b"abc" + b"\x80" + b"\x00" * 108 + (24).to_bytes(16, "big")
)
assert compress_one(abc_block) == hashlib.sha512(b"abc").hexdigest()

target = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
assert len(target) == 128
results = []
for first_bit in (0, 1):
    block = candidate_block(first_bit)
    digest = compress_one(block)
    assert digest != target
    results.append({
        "first_bit": first_bit,
        "bit_length": 1024,
        "block_prefix": block[:16].hex(),
        "raw_sha512_compression": digest,
        "matches_target": digest == target,
    })

assert results[0]["raw_sha512_compression"].startswith("c00730a1542ed248")
assert results[1]["raw_sha512_compression"].startswith("178967665f4c7784")
print(json.dumps({
    "source_runes": [corpus["translit"][i] for i in indices],
    "prime_weights": weights,
    "prime_sum": sum(weights),
    "corner_bits": "0000",
    "target": target,
    "compression_validation": "OpenSSL SHA512_Transform matches hashlib SHA512('abc')",
    "results": results,
    "decision": (
        "Both source-fixed 1024-bit corner-completed blocks miss the published "
        "target under one standard-IV SHA-512 compression. No plaintext or key."
    ),
}, indent=2))
