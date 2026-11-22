#!/usr/bin/env python3
"""Single-file original-source test: p50/G quotient as one strict BASE29 bzip2 member.

Read-only Python 3.12 standard library. The only candidate serialization is
high-first base29 positional digits -> minimal big-endian unsigned bytes.
This is an exploratory historical operation, not an authenticated LP2 decoder.
"""
from __future__ import annotations

import bz2
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRID = ROOT / "resources" / "liber-primus" / "lp2-grid-256.json"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
INK = ROOT / "resources" / "liber-primus" / "lp2-ink-annotations.json"
P = 29


def mod(x: int) -> int:
    return x % P


def poly_multiply(a: list[int], b: list[int]) -> list[int]:
    out = [0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            out[i + j] = mod(out[i + j] + x * y)
    return out


def divide_high(a: list[int], b: list[int]) -> tuple[list[int], list[int]]:
    work = a.copy()
    quotient = [0] * (len(a) - len(b) + 1)
    inv = pow(b[0], -1, P)
    for i in range(len(quotient)):
        v = mod(work[i] * inv)
        quotient[i] = v
        for j, bj in enumerate(b):
            work[i + j] = mod(work[i + j] - v * bj)
    return quotient, work[-len(b) + 1:]


def pack_base29(digits: list[int]) -> bytes:
    value = 0
    for d in digits:
        assert 0 <= d < 29
        value = 29 * value + d
    return value.to_bytes(max(1, (value.bit_length() + 7) // 8), "big")


def unpack_base29(data: bytes, slots: int) -> list[int]:
    value = int.from_bytes(data, "big")
    digits = [0] * slots
    for i in range(slots - 1, -1, -1):
        value, digits[i] = divmod(value, 29)
    assert value == 0, "byte payload exceeds declared digit capacity"
    return digits


def strict_bzip2(data: bytes) -> bytes:
    assert data[:3] == b"BZh", "no bzip2 member at byte offset zero"
    assert data[3] in b"123456789", "invalid bzip2 compression-level byte"
    decoder = bz2.BZ2Decompressor()
    plain = decoder.decompress(data)
    assert decoder.eof and not decoder.unused_data, "not exactly one complete bzip2 member"
    return plain


def main() -> None:
    grid = json.loads(GRID.read_text(encoding="utf-8"))
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    ink = json.loads(INK.read_text(encoding="utf-8"))

    assert grid["byte_count"] == 256
    tokens = [s for page in grid["pages"] for s in page["tokens"]]
    assert len(tokens) == len(grid["bytes"]) == 256
    alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
    assert len(alphabet) == 60
    original = [60 * alphabet.index(s[0]) + alphabet.index(s[1]) for s in tokens]
    assert all(len(s) == 2 for s in tokens)
    assert original == grid["bytes"] and all(0 <= b <= 255 for b in original)
    assert hashlib.sha256(bytes(original)).hexdigest() == (
        "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
    )

    p39 = next(page for page in corpus["pages"] if page["page"] == 39)
    p57 = next(page for page in corpus["pages"] if page["page"] == 57)
    ink39 = next(page for page in ink["pages"] if page["page"] == 39)
    assert ink39["red_spans"][0]["start"] == 119
    assert ink39["red_spans"][0]["length"] == 3
    assert p39["indices"][119:122] == [27, 5, 15]
    divisor = list(reversed(p39["indices"][119:122]))  # G high-first
    assert divisor == [15, 5, 27]
    residues = [byte % 29 for byte in original]
    quotient, remainder = divide_high(residues, divisor)
    assert len(quotient) == 254 and quotient[0] == 0 and remainder == [0, 0]
    assert poly_multiply(quotient, divisor) == residues
    assert quotient[:15] == [0, 27, 6, 14, 20, 11, 19, 17, 3, 14, 10, 23, 14, 18, 10]

    packet = pack_base29(quotient)
    assert len(packet) == 154 and packet[:4].hex() == "1f843d1d"
    assert unpack_base29(packet, 254) == quotient
    assert not packet.startswith(b"BZh")
    try:
        original_text = strict_bzip2(packet)
    except (AssertionError, OSError, EOFError):
        original_text = None
    assert original_text is None

    # Source-native positive: the genuine clear p57 runes, first 65 symbols.
    p57_symbols = p57["indices"][:65]
    assert len(p57_symbols) == 65
    clear = "".join(corpus["translit"][index] for index in p57_symbols).encode("ascii")
    planted_packet = bz2.compress(clear, compresslevel=9)
    assert planted_packet.startswith(b"BZh9") and len(planted_packet) <= 154
    plant_q = unpack_base29(planted_packet, 254)
    assert plant_q[0] == 0
    plant_coeffs = poly_multiply(plant_q, divisor)
    recovered_q, recovered_r = divide_high(plant_coeffs, divisor)
    assert recovered_r == [0, 0] and recovered_q == plant_q
    assert pack_base29(recovered_q) == planted_packet
    assert strict_bzip2(pack_base29(recovered_q)) == clear

    print(json.dumps({
        "source": "original GP29 p39 red triad + original p50 printed 256 cells",
        "divisor_high_first": divisor,
        "quotient_slots": len(quotient),
        "quotient_head": quotient[:20],
        "quotient_last": quotient[-12:],
        "remainder": remainder,
        "original_packet_len": len(packet),
        "original_packet_sha256": hashlib.sha256(packet).hexdigest(),
        "original_packet_prefix_hex": packet[:32].hex(),
        "original_packet_suffix_hex": packet[-16:].hex(),
        "original_bzip2_header": False,
        "original_complete_typed_message": False,
        "plant_clear_runes": len(p57_symbols),
        "plant_clear_bytes": len(clear),
        "plant_packet_bytes": len(planted_packet),
        "plant_bzip2_complete_and_exact": True,
        "original_ciphertext_plaintext_recovered": False,
        "classification": "One historically motivated fixed byte-serialization negative"
    }, indent=2))
    print("PASS: original polynomial, one fixed 154-byte object, strict bzip2 rejection, true compressed-message plant.")


if __name__ == "__main__":
    main()
