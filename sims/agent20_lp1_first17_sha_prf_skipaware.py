#!/usr/bin/env python3
"""Bounded LP1-first17 -> LP2 derived-key test using hash-counter PRFs.

The only seed material is the recovered first17 LP1 GP-prime stream, with
and without the 39 source-printed decimal tokens. Expand each seed using
SHA-256/SHA-512 counter mode or HMAC-SHA-256/HMAC-SHA-512 counter mode,
reduce bytes modulo 29, and test a continuous collision-key-skip GP29 stream.
No arbitrary salt, offset, reversal, Atbash, page reset, or seed dictionary.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "sims"))

import lp2_2013_binary_pad_prf_seed_gate as prf
from lp2_self_reliance_skip_aware_gate import (
    encipher_keyskip,
    encode_source_native,
    verify_reencipher,
)

GP_PRIMES = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
    53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109,
]
RECIPE_KEYS = {
    1: [23, 10, 1, 10, 9, 10, 16, 26],  # DIVINITY
    3: [3],
    5: [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18],  # FIRFUMFERENFE
}
F_PATCH = {
    "0.1.0.1.9.1", "0.1.0.1.13.2", "0.1.0.1.16.2",
    "0.1.0.1.17.0", "0.1.0.1.18.2", "0.1.0.1.19.1",
    "0.1.0.1.20.0", "0.1.0.1.21.0", "0.1.0.1.22.0",
    "0.1.0.1.23.0", "0.1.0.1.24.0", "0.1.0.1.25.0",
    "0.1.0.1.26.0",
}
GENERATORS = ("sha256-counter", "sha512-counter", "hmac256", "hmac512")
SEED_NAMES = ("lp1-gp-prime-runes-mod29", "lp1-gp-prime-runes-plus-39-numbers-mod29")


def parse_level(text: str, delimiters: list[str], coordinate: str = ""):
    if not delimiters:
        out = []
        for i, char in enumerate(text):
            key = f"{coordinate}.{i}".lstrip(".")
            if key in F_PATCH:
                if char != RUNES[0]:
                    raise RuntimeError(f"transparent-F patch mismatch at {key}: {char!r}")
                out.append("F")
            else:
                out.append(char)
        return out
    delimiter = delimiters[0]
    return [
        parse_level(chunk, delimiters[1:], f"{coordinate}.{i}")
        for i, chunk in enumerate(text.split(delimiter))
        if chunk
    ]


def flatten(node):
    if isinstance(node, list):
        for child in node:
            yield from flatten(child)
    else:
        yield node


def build_lp1_seeds() -> tuple[dict[str, bytes], dict]:
    global RUNES
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    RUNES = corpus["runes"]
    if len(RUNES) != 29 or len(GP_PRIMES) != 29:
        raise RuntimeError("unexpected GP29 alphabet or prime map")

    raw = (ROOT / "resources/transcriptions/lp1_wulfic_canonical.txt").read_text(encoding="utf-8")
    normal = re.sub(r"[\r\n/%]", "", raw)
    parsed = parse_level(normal, ["§", "$", "&", ".", "-"], "")
    if not parsed or len(parsed[0]) < 7:
        raise RuntimeError("LP1 source did not parse into seven expected sections")
    sections = parsed[0][:7]

    decoded_sections = []
    for section_id, section in enumerate(sections):
        values = []
        key_position = 0
        for char in flatten(section):
            if char == "F":
                values.append(0)
                continue
            if char not in RUNES:
                # Printed decimal material is handled separately below.
                continue
            value = RUNES.index(char)
            recipe = RECIPE_KEYS.get(section_id)
            if recipe:
                value = (value - recipe[key_position % len(recipe)]) % 29
                key_position += 1
            if section_id in (0, 3):
                value = 28 - value
            values.append(value)
        decoded_sections.append(values)
    expected_lengths = [184, 515, 157, 778, 755, 319, 89]
    if [len(section) for section in decoded_sections] != expected_lengths:
        raise RuntimeError(f"LP1 decoded section lengths {[len(x) for x in decoded_sections]} != {expected_lengths}")

    rune_indices = [value for section in decoded_sections for value in section]
    prime_runes = [GP_PRIMES[index] % 29 for index in rune_indices]
    if len(prime_runes) != 2797:
        raise RuntimeError(f"LP1 rune stream length {len(prime_runes)} != 2797")

    source_sections = [part for part in raw.split("$") if part][:7]
    if len(source_sections) != 7:
        raise RuntimeError(f"LP1 original token sections {len(source_sections)} != 7")
    prime_mixed = []
    number_count = 0
    for section_id, source_section in enumerate(source_sections):
        rune_position = 0
        tokens = re.findall(r"[\u16a0-\u16ff]|\d+", source_section, flags=re.IGNORECASE)
        for token in tokens:
            if token in RUNES:
                index = decoded_sections[section_id][rune_position]
                rune_position += 1
                prime_mixed.append(GP_PRIMES[index] % 29)
            else:
                if not token.isdigit():
                    raise RuntimeError(f"unexpected numeric token {token!r}")
                prime_mixed.append(int(token) % 29)
                number_count += 1
        if rune_position != len(decoded_sections[section_id]):
            raise RuntimeError(
                f"section {section_id} token rune count {rune_position} != decoded {len(decoded_sections[section_id])}"
            )
    if number_count != 39 or len(prime_mixed) != 2836:
        raise RuntimeError(f"LP1 mixed stream mismatch: {number_count} numbers, {len(prime_mixed)} values")

    seeds = {
        SEED_NAMES[0]: bytes(prime_runes),
        SEED_NAMES[1]: bytes(prime_mixed),
    }
    meta = {
        "source": "resources/transcriptions/lp1_wulfic_canonical.txt",
        "rune_count": len(rune_indices),
        "printed_decimal_count": number_count,
        "mixed_count": len(prime_mixed),
        "gp_prime_values": GP_PRIMES,
        "seeds": {
            name: {
                "length": len(seed),
                "sha256": hashlib.sha256(seed).hexdigest(),
                "git_blob_sha": hashlib.sha1(b"blob " + str(len(seed)).encode() + b"\0" + seed).hexdigest(),
            }
            for name, seed in seeds.items()
        },
    }
    return seeds, meta


def derived_positive_controls(sweep, skipdecode) -> dict:
    source = (
        "TO BE OR NOT TO BE THAT IS THE QUESTION WHETHER TIS NOBLER IN THE MIND "
        "TO SUFFER THE SLINGS AND ARROWS OF OUTRAGEOUS FORTUNE OR TO TAKE ARMS "
        "AGAINST A SEA OF TROUBLES"
    )
    plain = encode_source_native(source * 3, sweep.gp.TRANSLIT)[:240]
    controls = {}
    for generator in GENERATORS:
        key_bytes = prf.expand(b"CICADA3301", generator, 8000)
        key = prf.reduce_bytes(key_bytes, "mod29", 8000)
        cipher, planted_skips = encipher_keyskip(plain, key, 3, 1, 0.83)
        decoded = sweep.beam(cipher, key, 1, 3, len(cipher), int(sweep.FULL_BEAM))
        exact = decoded is not None and np.array_equal(np.asarray(decoded, dtype=np.int64), plain)
        verified = (
            verify_reencipher(cipher, list(map(int, decoded)), key, 3, 1, 0, sweep.MAXSKIP)
            if decoded is not None else None
        )
        if not exact or verified is None:
            raise RuntimeError(f"derived-key positive control failed for {generator}")
        controls[generator] = {
            "exact_plaintext_recovery": True,
            "planted_skips": int(planted_skips),
            "verified_end_cursor": int(verified[0]),
            "preview": skipdecode.idx_to_trans(decoded)[:90],
        }
    return controls


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--external-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    sweep, skipdecode = prf.load_external_decoder(args.external_root)
    shakespeare = (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf-8")
    prf.replace_prefilter_lm(sweep, shakespeare, sweep.gp.TRANSLIT)

    seeds, seed_meta = build_lp1_seeds()
    pages = prf.load_unknown_pages()
    page_map = dict(pages)
    all_cipher = np.concatenate([cipher for _, cipher in pages])
    page_slices = {}
    offset = 0
    for page_id, cipher in pages:
        page_slices[page_id] = (offset, offset + len(cipher))
        offset += len(cipher)
    if len(all_cipher) != 12956:
        raise RuntimeError(f"unknown LP2 stream length {len(all_cipher)} != 12956")

    generic_positive = prf.positive_control(sweep, skipdecode, sweep.gp.TRANSLIT)
    derived_positive = derived_positive_controls(sweep, skipdecode)
    print("GENERIC_POSITIVE_CONTROL " + json.dumps(generic_positive))
    print("DERIVED_PRF_POSITIVE_CONTROLS " + json.dumps(derived_positive))

    key_symbols = 70_000
    candidates = []
    for seed_name, seed in seeds.items():
        for generator in GENERATORS:
            byte_stream = prf.expand(seed, generator, key_symbols)
            key = prf.reduce_bytes(byte_stream, "mod29", key_symbols)
            for sign in (-1, 1):
                candidates.append({
                    "name": f"{seed_name}:{generator}:mod29",
                    "seed_name": seed_name,
                    "generator": generator,
                    "sign": sign,
                    "key": key,
                })

    first_cipher = page_map[0]
    screen_len = min(int(sweep.SCREEN_LEN), len(first_cipher))
    screened = []
    for candidate in candidates:
        result = prf.decode_one(
            sweep, skipdecode, first_cipher[:screen_len], candidate["key"],
            candidate["sign"], 0, 0, int(sweep.SCREEN_BEAM)
        )
        if result is not None:
            screened.append({
                **{k: v for k, v in candidate.items() if k != "key"},
                "key": candidate["key"],
                "screen_score": result["score"],
                "screen_preview": result["text"][:100],
                "screen_end_ptr": result["end_ptr"],
                "screen_skips": result["skip_count"],
            })
    screened.sort(key=lambda x: x["screen_score"], reverse=True)
    top = screened[:4]

    global_results = []
    for candidate in top:
        transformed = all_cipher
        plain = sweep.beam(
            transformed, candidate["key"], candidate["sign"], 0,
            len(transformed), int(sweep.FULL_BEAM)
        )
        if plain is None:
            global_results.append({
                "name": candidate["name"], "seed_name": candidate["seed_name"],
                "generator": candidate["generator"], "sign": candidate["sign"],
                "screen_score": candidate["screen_score"], "full_stream_decoded": False,
            })
            continue
        verified = verify_reencipher(
            all_cipher, list(map(int, plain)), candidate["key"], 0,
            candidate["sign"], 0, sweep.MAXSKIP
        )
        full_score, full_text = prf.score_plain(sweep, skipdecode, plain)
        page_scores = {}
        page_previews = {}
        for page_id, (start, end) in page_slices.items():
            page_score, page_text = prf.score_plain(sweep, skipdecode, plain[start:end])
            page_scores[str(page_id)] = page_score
            page_previews[str(page_id)] = page_text[:80]
        global_results.append({
            "name": candidate["name"], "seed_name": candidate["seed_name"],
            "generator": candidate["generator"], "sign": candidate["sign"],
            "screen_score": candidate["screen_score"],
            "full_stream_decoded": True,
            "full_stream_score": full_score,
            "full_stream_reencipher_verified": verified is not None,
            "end_key_cursor": int(verified[0]) if verified is not None else None,
            "total_skips": int(sum(verified[1])) if verified is not None else None,
            "page_scores": page_scores,
            "page_previews": page_previews,
            "full_text_preview": full_text[:360],
        })

    report = {
        "hypothesis": "The recovered LP1 first17 prime-value stream may be a high-entropy key material source; a standard SHA/HMAC counter PRF may expand it into a collision-skip GP29 keystream for the subsequent LP2 unknown pages.",
        "status": "bounded participant-hypothesis test; not an author-authenticated instruction",
        "seed_material": seed_meta,
        "decoder": {
            "repository": "https://github.com/Dukotah/cicada3301",
            "commit": "f63501d8f2d835b80c30230eb89a1110fb9197d2",
            "model": "collision-key-skip additive GP29, pinned Campaign XVIII beam",
            "max_skip": int(sweep.MAXSKIP),
            "screen_beam": int(sweep.SCREEN_BEAM),
            "full_beam": int(sweep.FULL_BEAM),
        },
        "scope": {
            "cipher_pages": [page_id for page_id, _ in pages],
            "cipher_symbols": len(all_cipher),
            "seed_serializations": list(seeds.keys()),
            "generators": list(GENERATORS),
            "byte_reduction": "byte mod 29",
            "directions": [-1, 1],
            "atbash": False,
            "offset": 0,
            "page_clock": "one concatenated continuous stream; key cursor and collision state cross page boundaries",
            "candidate_count": len(candidates),
            "screened_count": len(screened),
            "full_stream_candidates": len(top),
            "excluded": ["arbitrary salt/offset search", "seed dictionary beyond the source-derived LP1 key", "reverse stream", "Atbash", "page resets"],
        },
        "generic_positive_control": generic_positive,
        "derived_prf_positive_controls": derived_positive,
        "top_screen": [
            {k: v for k, v in item.items() if k != "key"} for item in screened[:16]
        ],
        "continuous_clock": global_results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("REPORT " + json.dumps({
        "seed_meta": seed_meta,
        "candidate_count": len(candidates),
        "screened_count": len(screened),
        "top_screen": report["top_screen"][:8],
        "continuous_clock": global_results,
        "output": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
