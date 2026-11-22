"""Source-frozen 2015 prime-difference register as one BASE29 BZip2 object.

Run: python sims/lp2_2015_primeD_base29_bzip2_sft.py
Python 3.10+, standard library; original corpus read only. The byte
framing is investigator-proposed, not a signed Cicada instruction.
"""
from __future__ import annotations

import bz2
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads(
    (ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
)
source = [
    v for page in corpus["pages"]
    if page["page"] in (0, 1, 2) for v in page["indices"]
]
assert len(source) == 729
assert source[:16] == [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5, 2, 11, 6]


def first_primes(n: int) -> list[int]:
    primes = []
    k = 2
    while len(primes) < n:
        if all(k % p for p in primes if p * p <= k):
            primes.append(k)
        k += 1
    return primes


primes = first_primes(730)
assert primes[:5] == [2, 3, 5, 7, 11]


def difference(cipher: list[int]) -> list[int]:
    prev = 27  # Imagined initial plaintext F shifted by prime 2.
    result = []
    for i, c in enumerate(cipher):
        shifted = (c - primes[i + 1]) % 29
        result.append((shifted - prev) % 29)
        prev = shifted
    return result


def recover(deltas: list[int]) -> list[int]:
    prev = 27
    out = []
    for i, d in enumerate(deltas):
        prev = (prev + d) % 29
        out.append((prev + primes[i + 1]) % 29)
    return out


def pack_base29(digits: list[int]) -> bytes:
    n = 0
    for d in digits:
        assert 0 <= d < 29
        n = 29 * n + d
    return n.to_bytes((n.bit_length() + 7) // 8, "big")


def unpack_base29(payload: bytes, width: int) -> list[int]:
    n = int.from_bytes(payload, "big")
    digits = [0] * width
    for i in range(width - 1, -1, -1):
        n, digits[i] = divmod(n, 29)
    assert n == 0, "payload exceeds selected BASE29 source width"
    return digits


D = difference(source)
assert recover(D) == source
assert sum(D[i] == D[i - 1] for i in range(1, len(D))) == 40
assert D[:16] == [14, 20, 8, 10, 1, 9, 6, 27, 9, 9, 15, 28, 11, 22, 3, 18]
packed = pack_base29(D)
assert len(packed) == 443
assert packed[:8] == bytes.fromhex("16701bee70c4b19d")
assert unpack_base29(packed, 729) == D

# No fitted offset, invented terminator, or alternate frame length.
valid_header = packed[:3] == b"BZh" and packed[3] in b"123456789"
try:
    bzip_plain = bz2.decompress(packed) if valid_header else None
except (OSError, EOFError):
    bzip_plain = None
assert not valid_header and bzip_plain is None

# The same whole-register BASE29 frame faithfully conveys a genuine
# checksum-validated historical BZip2 object when such an object is planted.
plant_plain = b"LIBER PRIMUS BZIP2 FRAMING KNOWN PLAINTEXT CONTROL\\n" * 3
plant_packed = bz2.compress(plant_plain, compresslevel=9)
plant_digits = unpack_base29(plant_packed, 729)
assert pack_base29(plant_digits) == plant_packed
assert bz2.decompress(pack_base29(plant_digits)) == plant_plain

print(json.dumps({
    "source": "LP2 original p0-p2, 729 GP runes",
    "original_doublets": sum(source[i] == source[i - 1]
                            for i in range(1, len(source))),
    "D_doublets": 40,
    "framing": "one 729-digit unsigned BASE29 integer, minimal big-endian bytes",
    "bytes": len(packed),
    "sha256": hashlib.sha256(packed).hexdigest(),
    "first16_hex": packed[:16].hex(),
    "valid_BZip2_header": valid_header,
    "recovered_typed_plaintext": bzip_plain is not None,
    "positive_plant_bytes": len(plant_packed),
    "positive_plant_roundtrip": True,
    "positive_BZip2_checksum": True,
    "decision": "No original typed BZip2 object; register framing lacks author instruction."
}, indent=2))
