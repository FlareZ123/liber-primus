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

# The p55 13-dot mark is the three-column projection of the p57 23-dot mask.
# Its 13 prime weights sum to exactly 512. The ten-dot complement sums to 508;
# complete it with the four empty stencil corners as zero bits to obtain a
# second 512-bit half. Test both half orders and all independent run polarities.
retained_positions = [1, 3, 4, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21]
complement_positions = [0, 2, 5, 7, 10, 12, 15, 17, 20, 22]
retained_weights = [weights[i] for i in retained_positions]
complement_weights = [weights[i] for i in complement_positions]
assert retained_weights == [89, 61, 2, 31, 3, 13, 23, 89, 107, 17, 41, 5, 31]
assert complement_weights == [17, 97, 47, 71, 43, 79, 31, 47, 5, 71]
assert sum(retained_weights) == 512
assert sum(complement_weights) == 508

def split_block(first_retained: int, first_complement: int, order: str) -> bytes:
    retained_runs = [
        str((first_retained + i) % 2) * n
        for i, n in enumerate(retained_weights)
    ]
    complement_runs = [
        str((first_complement + i) % 2) * n
        for i, n in enumerate(complement_weights)
    ]
    retained_bits = "".join(retained_runs)
    complement_bits = (
        "0" + "".join(complement_runs[:2]) + "0"
        + "".join(complement_runs[2:8]) + "0"
        + "".join(complement_runs[8:]) + "0"
    )
    assert len(retained_bits) == len(complement_bits) == 512
    bits = retained_bits + complement_bits if order == "13_then_10" else complement_bits + retained_bits
    assert len(bits) == 1024
    return int(bits, 2).to_bytes(128, "big")

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

split_results = []
expected_split_prefixes = [
    "65d8605028c3c512", "4961ec4d985c85b4",
    "263893279d86621e", "37c28eb0547645ab",
    "5cc9f4ba21e485d2", "101d3d27ab4b734f",
    "511f247fb99552c1", "09c5db99b566bdaf",
]
for first_retained in (0, 1):
    for first_complement in (0, 1):
        for order in ("13_then_10", "10_then_13"):
            block = split_block(first_retained, first_complement, order)
            digest = compress_one(block)
            assert digest != target
            split_results.append({
                "first_retained_bit": first_retained,
                "first_complement_bit": first_complement,
                "order": order,
                "bit_length": 1024,
                "block_prefix": block[:16].hex(),
                "raw_sha512_compression": digest,
                "matches_target": digest == target,
            })
assert [x["raw_sha512_compression"][:16] for x in split_results] == expected_split_prefixes

print(json.dumps({
    "source_runes": [corpus["translit"][i] for i in indices],
    "prime_weights": weights,
    "prime_sum": sum(weights),
    "corner_bits": "0000",
    "target": target,
    "compression_validation": "OpenSSL SHA512_Transform matches hashlib SHA512('abc')",
    "results": results,
    "split_13_10_1024": split_results,
    "decision": (
        "Both source-fixed 1024-bit full-stencil blocks and all eight source-derived "
        "13/10 split blocks miss the published target under one standard-IV SHA-512 "
        "compression. No plaintext or key."
    ),
}, indent=2))
