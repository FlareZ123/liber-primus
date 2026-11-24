#!/usr/bin/env python3
"""Bounded test: the original 256-byte p49-p51 table as a PRF seed for LP2.

The table is source-transcribed and image-checked, but interpreting its
base-60 values as bytes is conditional. This test fixes that one serialization,
six conventional deterministic stream expansions, byte mod 29, both additive
signs, phase zero, and one continuous LP2 clock. It is not an author-authenticated
instruction and does not search arbitrary salts, offsets, encodings, or seeds.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
from pathlib import Path

import numpy as np

import lp2_2013_binary_pad_prf_seed_gate as prf

ROOT = Path(__file__).resolve().parents[1]
GRID_PATH = ROOT / "resources/liber-primus/lp2-grid-256.json"
EXPECTED_GRID_BLOB_SHA = "2550eae357442912220e05dc51147523a61dd75a"
EXPECTED_SEED_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
GENERATORS = (
    "sha256-counter4",
    "sha512-counter4",
    "hmac256-counter4",
    "hmac512-counter4",
    "aes256-ctr",
    "rc4",
)


def git_blob_sha(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def load_grid_seed() -> tuple[bytes, dict]:
    raw = GRID_PATH.read_bytes()
    grid_blob_sha = git_blob_sha(raw)
    if grid_blob_sha != EXPECTED_GRID_BLOB_SHA:
        raise RuntimeError(
            f"p50 grid source blob changed: {grid_blob_sha} != {EXPECTED_GRID_BLOB_SHA}"
        )
    grid = json.loads(raw)
    if grid.get("alphabet") != "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx":
        raise RuntimeError("unexpected p49-p51 source alphabet")
    if grid.get("byte_rule") != "value = 60*digit(first) + digit(second)":
        raise RuntimeError("unexpected p49-p51 byte rule")
    pages = grid.get("pages", [])
    if [p.get("page") for p in pages] != [49, 50, 51]:
        raise RuntimeError("p49-p51 page order changed")
    if [p.get("rows") for p in pages] != [10, 13, 9] or any(p.get("cols") != 8 for p in pages):
        raise RuntimeError("p49-p51 grid geometry changed")
    alphabet = grid["alphabet"]
    tokens = [token for page in pages for token in page["tokens"]]
    numeric = [60 * alphabet.index(token[0]) + alphabet.index(token[1]) for token in tokens]
    declared = [value for page in pages for value in page["bytes"]]
    if len(tokens) != 256 or numeric != declared:
        raise RuntimeError("p49-p51 tokens do not reproduce the declared 256 bytes")
    seed = bytes(declared)
    seed_sha = hashlib.sha256(seed).hexdigest()
    if len(seed) != 256 or seed_sha != EXPECTED_SEED_SHA256:
        raise RuntimeError(f"p49-p51 seed identity mismatch: {len(seed)} bytes, {seed_sha}")
    meta = {
        "source": "resources/liber-primus/lp2-grid-256.json",
        "source_blob_sha": grid_blob_sha,
        "source_note": grid.get("source_notes"),
        "pages": [49, 50, 51],
        "rows": [10, 13, 9],
        "columns": 8,
        "token_count": len(tokens),
        "byte_rule": grid["byte_rule"],
        "alphabet": alphabet,
        "seed_length": len(seed),
        "seed_sha256": seed_sha,
        "seed_git_blob_sha": git_blob_sha(seed),
    }
    return seed, meta


def expand_counter(seed: bytes, n: int, digest_name: str) -> bytes:
    digest = hashlib.sha256 if digest_name == "sha256" else hashlib.sha512
    out = bytearray()
    counter = 0
    while len(out) < n:
        out.extend(digest(seed + counter.to_bytes(4, "big")).digest())
        counter += 1
    return bytes(out[:n])


def expand_hmac_counter(seed: bytes, n: int, digest_name: str) -> bytes:
    digest = hashlib.sha256 if digest_name == "sha256" else hashlib.sha512
    out = bytearray()
    counter = 0
    while len(out) < n:
        out.extend(hmac.new(seed, counter.to_bytes(4, "big"), digest).digest())
        counter += 1
    return bytes(out[:n])


def expand_seed(seed: bytes, generator: str, n: int) -> bytes:
    if generator == "sha256-counter4":
        return expand_counter(seed, n, "sha256")
    if generator == "sha512-counter4":
        return expand_counter(seed, n, "sha512")
    if generator == "hmac256-counter4":
        return expand_hmac_counter(seed, n, "sha256")
    if generator == "hmac512-counter4":
        return expand_hmac_counter(seed, n, "sha512")
    if generator in ("aes256-ctr", "rc4"):
        return prf.expand(seed, generator, n)
    raise ValueError(generator)


def positive_controls(sweep, skipdecode) -> dict:
    source = (
        "TO BE OR NOT TO BE THAT IS THE QUESTION WHETHER TIS NOBLER IN THE MIND "
        "TO SUFFER THE SLINGS AND ARROWS OF OUTRAGEOUS FORTUNE OR TO TAKE ARMS "
        "AGAINST A SEA OF TROUBLES"
    )
    plain = np.asarray(
        prf.encode_source_native(source * 3, sweep.gp.TRANSLIT)[:240],
        dtype=np.int64,
    )
    controls = {}
    for generator in GENERATORS:
        key_bytes = expand_seed(b"CICADA3301", generator, 8000)
        key = prf.reduce_bytes(key_bytes, "mod29", 8000)
        cipher, planted_skips = prf.encipher_keyskip(plain, key, 3, 1, 0.83)
        decoded = sweep.beam(cipher, key, 1, 3, len(cipher), int(sweep.FULL_BEAM))
        exact = decoded is not None and np.array_equal(np.asarray(decoded, dtype=np.int64), plain)
        verified = (
            prf.verify_reencipher(
                cipher, list(map(int, decoded)), key, 3, 1, 0, sweep.MAXSKIP
            )
            if decoded is not None else None
        )
        if not exact or verified is None:
            raise RuntimeError(f"PRF generator positive control failed: {generator}")
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

    seed, seed_meta = load_grid_seed()
    pages = prf.load_unknown_pages()
    if len(pages) != 55 or sum(len(cipher) for _, cipher in pages) != 12_956:
        raise RuntimeError("unknown LP2 source corpus contract changed")

    controls = positive_controls(sweep, skipdecode)
    print("POSITIVE_CONTROLS " + json.dumps(controls))

    key_symbols = 70_000
    candidates = []
    for generator in GENERATORS:
        stream = expand_seed(seed, generator, key_symbols)
        key = prf.reduce_bytes(stream, "mod29", key_symbols)
        for sign in (-1, 1):
            candidates.append({
                "name": f"p49-51-grid256:{generator}:mod29",
                "generator": generator,
                "sign": sign,
                "key": key,
            })

    page_map = dict(pages)
    first_cipher = page_map[0]
    screen_len = min(int(sweep.SCREEN_LEN), len(first_cipher))
    screened = []
    for candidate in candidates:
        result = prf.decode_one(
            sweep, skipdecode, first_cipher[:screen_len], candidate["key"],
            candidate["sign"], 0, 0, int(sweep.SCREEN_BEAM)
        )
        screened.append({
            "name": candidate["name"],
            "generator": candidate["generator"],
            "sign": candidate["sign"],
            "screen_verified": result is not None,
            "screen_score": result["score"] if result is not None else None,
            "screen_preview": result["text"][:100] if result is not None else None,
            "screen_end_ptr": result["end_ptr"] if result is not None else None,
            "screen_skips": result["skip_count"] if result is not None else None,
        })

    all_cipher = np.concatenate([cipher for _, cipher in pages])
    page_slices = {}
    cursor = 0
    for page_id, cipher in pages:
        page_slices[page_id] = (cursor, cursor + len(cipher))
        cursor += len(cipher)

    continuous = []
    for candidate in candidates:
        plain = sweep.beam(
            all_cipher, candidate["key"], candidate["sign"], 0,
            len(all_cipher), int(sweep.FULL_BEAM)
        )
        if plain is None:
            continuous.append({
                "name": candidate["name"],
                "generator": candidate["generator"],
                "sign": candidate["sign"],
                "full_stream_decoded": False,
                "full_stream_reencipher_verified": False,
            })
            continue
        verified = prf.verify_reencipher(
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
        continuous.append({
            "name": candidate["name"],
            "generator": candidate["generator"],
            "sign": candidate["sign"],
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
        "hypothesis": "The exact 256-byte row-major p49-p51 table may be a seed for a standard deterministic PRF/stream generator whose mod29 output is the LP2 collision-key-skip keystream.",
        "status": "bounded participant-hypothesis test; byte serialization is conditional and no author-authenticated seed instruction is known",
        "seed_material": seed_meta,
        "decoder": {
            "repository": "https://github.com/Dukotah/cicada3301",
            "commit": "f63501d8f2d835b80c30230eb89a1110fb9197d2",
            "model": "Campaign XVIII collision-key-skip additive GP29 beam",
            "max_skip": int(sweep.MAXSKIP),
            "screen_beam": int(sweep.SCREEN_BEAM),
            "full_beam": int(sweep.FULL_BEAM),
        },
        "scope": {
            "cipher_pages": [page_id for page_id, _ in pages],
            "cipher_symbols": len(all_cipher),
            "seed_serializations": ["canonical base60 row-major 256-byte stream"],
            "generators": list(GENERATORS),
            "byte_reduction": "byte mod 29",
            "directions": [-1, 1],
            "atbash": False,
            "offset": 0,
            "page_clock": "one concatenated continuous stream; key cursor and collision state cross page boundaries",
            "candidate_count": len(candidates),
            "full_stream_candidates": len(candidates),
            "all_candidates_full_decoded": True,
            "excluded": [
                "base59 reinterpretation",
                "other token orderings or transpositions",
                "arbitrary salts, offsets, or phases",
                "reverse stream",
                "Atbash",
                "page resets",
                "seed dictionary beyond the exact p49-p51 table",
            ],
        },
        "positive_controls": controls,
        "screen": screened,
        "continuous_clock": continuous,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("REPORT " + json.dumps({
        "seed_meta": seed_meta,
        "candidate_count": len(candidates),
        "screen_verified": sum(1 for x in screened if x["screen_verified"]),
        "screen_top": sorted(
            [x for x in screened if x["screen_score"] is not None],
            key=lambda x: x["screen_score"], reverse=True
        )[:6],
        "continuous_clock": [
            {k: v for k, v in x.items() if k not in ("page_scores", "page_previews", "full_text_preview")}
            for x in continuous
        ],
        "output": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
