#!/usr/bin/env python3
"""Bounded Streebog-512 preimage gate for p55-derived candidate byte strings.

Uses the canonical LP2 corpus and libgcrypt's STRIBOG512 implementation.
RFC 6986 M1/M2 display-order controls are asserted before candidate testing.
No network access or probing occurs.
"""
from __future__ import annotations

import ctypes
import ctypes.util
import json
from pathlib import Path

TARGET_HEX = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a842"
    "5893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
BASE29_TEXT = "0123456789ABCDEFGHIJKLMNOPQRS"
EXPECTED_P55_ASCII = (
    "LPJA7FHEJFC6N2P0ROH5174HS0EAJ15D8LKCJFNRD0H8C5CISIA6E6FIFC22IF2M5SAJ5ENB1HIA"
)
UDP_HEADER = bytes.fromhex("0000011900540000")

RFC6986_CONTROLS = [
    {
        "name": "M1",
        "input_hex": (
            "323130393837363534333231303938373635343332313039383736353433323130"
            "393837363534333231303938373635343332313039383736353433323130"
        ),
        "expected_display_hex": (
            "486f64c1917879417fef082b3381a4e211c324f074654c38823a7b76f830ad00"
            "fa1fbae42b1285c0352f227524bc9ab16254288dd6863dccd5b9f54a1ad0541b"
        ),
    },
    {
        "name": "M2",
        "input_hex": (
            "fbe2e5f0eee3c820fbeafaebef20fffbf0e1e0f0f520e0ed20e8ece0ebe5f0f2f1"
            "20fff0eeec20f120faf2fee5e2202ce8f6f3ede220e8e6eee1e8f0f2d1202ce8f0f2e5e220e5d1"
        ),
        "expected_display_hex": (
            "28fbc9bada033b1460642bdcddb90c3fb3e56c497ccd0f62b8a2ad4935e85f03"
            "7613966de4ee00531ae60f3b5a47f8dae06915d5f2f194996fcabf2622e6881e"
        ),
    },
]


def load_gcrypt():
    library_name = ctypes.util.find_library("gcrypt")
    if not library_name:
        raise SystemExit("libgcrypt was not found; install libgcrypt runtime and retry")
    lib = ctypes.CDLL(library_name)
    lib.gcry_check_version.argtypes = [ctypes.c_char_p]
    lib.gcry_check_version.restype = ctypes.c_char_p
    lib.gcry_md_map_name.argtypes = [ctypes.c_char_p]
    lib.gcry_md_map_name.restype = ctypes.c_int
    lib.gcry_md_get_algo_dlen.argtypes = [ctypes.c_int]
    lib.gcry_md_get_algo_dlen.restype = ctypes.c_uint
    lib.gcry_md_hash_buffer.argtypes = [
        ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t
    ]
    lib.gcry_md_hash_buffer.restype = None

    version = lib.gcry_check_version(None)
    if not version:
        raise RuntimeError("gcry_check_version failed")
    algo = lib.gcry_md_map_name(b"STRIBOG512")
    if algo <= 0 or lib.gcry_md_get_algo_dlen(algo) != 64:
        raise RuntimeError("libgcrypt STRIBOG512 is unavailable or not 64 bytes")
    return lib, version.decode("ascii"), algo


def digest512(lib, algo, data: bytes) -> bytes:
    output = (ctypes.c_ubyte * 64)()
    input_buffer = ctypes.create_string_buffer(data)
    lib.gcry_md_hash_buffer(algo, ctypes.byref(output), input_buffer, len(data))
    return bytes(output)


def base29_integer_bytes(symbols: list[int]) -> bytes:
    value = 0
    for digit in symbols:
        value = value * 29 + digit
    return value.to_bytes(max(1, (value.bit_length() + 7) // 8), "big")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text())
    page55 = next(page for page in corpus["pages"] if page["page"] == 55)
    symbols = page55["indices"]
    if len(symbols) != 76:
        raise AssertionError(f"expected 76 p55 runes, got {len(symbols)}")
    ascii_full = "".join(BASE29_TEXT[index] for index in symbols).encode("ascii")
    if ascii_full.decode("ascii") != EXPECTED_P55_ASCII:
        raise AssertionError("p55 BASE29 ASCII transcription changed")
    ascii_body = ascii_full[1:]
    raw_full = bytes(symbols)
    raw_body = bytes(symbols[1:])

    candidates = {
        "base29_ascii_full76": ascii_full,
        "base29_ascii_body75": ascii_body,
        "raw_rune_indices_full76": raw_full,
        "raw_rune_indices_body75": raw_body,
        "base29_integer_full76_minimal_be": base29_integer_bytes(symbols),
        "base29_integer_body75_minimal_be": base29_integer_bytes(symbols[1:]),
        "illustrative_udp_segment_ascii84": UDP_HEADER + ascii_full,
        "illustrative_udp_segment_raw_indices84": UDP_HEADER + raw_full,
    }
    expected_lengths = [76, 75, 76, 75, 47, 46, 84, 84]
    if [len(value) for value in candidates.values()] != expected_lengths:
        raise AssertionError("candidate serialization length changed")

    lib, version, algo = load_gcrypt()
    controls = []
    for control in RFC6986_CONTROLS:
        # RFC 6986 displays message bytes and digest bytes in the opposite order
        # from this library API; reverse both only for the published test vector.
        message = bytes.fromhex(control["input_hex"])[::-1]
        actual_display = digest512(lib, algo, message)[::-1].hex()
        passed = actual_display == control["expected_display_hex"]
        controls.append({"name": control["name"], "passed": passed})
        if not passed:
            raise AssertionError(f"RFC 6986 {control['name']} control failed")

    results = {}
    for name, data in candidates.items():
        digest = digest512(lib, algo, data)
        normal = digest.hex()
        reversed_display = digest[::-1].hex()
        normal_match = normal == TARGET_HEX
        reversed_match = reversed_display == TARGET_HEX
        if normal_match or reversed_match:
            raise AssertionError(f"{name} unexpectedly matches the p56 target")
        results[name] = {
            "bytes": len(data),
            "sha256_input_fingerprint": __import__("hashlib").sha256(data).hexdigest(),
            "stribog512_api_hex": normal,
            "stribog512_reversed_display_hex": reversed_display,
            "matches_target_either_display": False,
        }

    print(json.dumps({
        "library": "libgcrypt",
        "version": version,
        "algorithm": "STRIBOG512",
        "algorithm_id": algo,
        "digest_bytes": 64,
        "rfc6986_controls": controls,
        "candidate_results": results,
        "decision": "No p55-derived candidate matches in either digest display order.",
    }, indent=2))


if __name__ == "__main__":
    main()
