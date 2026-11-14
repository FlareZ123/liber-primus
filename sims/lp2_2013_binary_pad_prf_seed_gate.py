#!/usr/bin/env python3
"""Test 2013 CicadaOS binary artifacts as deterministic PRF seeds for LP2.

This is deliberately distinct from the already-negative direct byte->GP29 pad
sweep: the historical binary file is treated as a key/seed to a small,
predeclared family of standard stream generators, then decoded with the
source-calibrated collision-skip transducer.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import random
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve()
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent))

from lp2_self_reliance_skip_aware_gate import (  # noqa: E402
    encode_source_native,
    encipher_keyskip,
    load_external_decoder,
    replace_prefilter_lm,
    verify_reencipher,
)

PINNED_INPUTS = {
    "_560.00": {
        "size": 3_992_970,
        "git_blob": "81371f4440d850a059f91289179ca34afb8fcb3e",
        "sha256": "a24051a87f0eb25ca21accbd3158fdf7b4911243e5ee1b9778b81182f0d36573",
    },
    "560.17": {
        "size": 1_183_811,
        "git_blob": "49df8e57f8e6052eb2d5c2b483282461e53ef5ff",
    },
}
PAD_REPO_COMMIT = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
PAD_REPO_PATH = "2013/002-3301/3301-contents/data"


def git_blob_sha(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def load_pads(pad_dir: Path) -> dict[str, bytes]:
    pads: dict[str, bytes] = {}
    for name, expected in PINNED_INPUTS.items():
        data = (pad_dir / name).read_bytes()
        if len(data) != expected["size"]:
            raise RuntimeError(f"{name}: size {len(data)} != {expected['size']}")
        actual_blob = git_blob_sha(data)
        if actual_blob != expected["git_blob"]:
            raise RuntimeError(f"{name}: Git blob SHA mismatch {actual_blob}")
        digest = hashlib.sha256(data).hexdigest()
        if expected.get("sha256") and digest != expected["sha256"]:
            raise RuntimeError(f"{name}: SHA256 mismatch {digest}")
        pads[name] = data
        print(json.dumps({
            "input": name,
            "size": len(data),
            "git_blob_sha": actual_blob,
            "sha256": digest,
            "source_commit": PAD_REPO_COMMIT,
            "source_path": f"{PAD_REPO_PATH}/{name}",
        }))
    return pads


def expand_hash_counter(seed: bytes, n: int, hash_name: str) -> bytes:
    constructor = hashlib.sha256 if hash_name == "sha256" else hashlib.sha512
    base = constructor()
    base.update(seed)
    out = bytearray()
    counter = 0
    while len(out) < n:
        h = base.copy()
        h.update(counter.to_bytes(8, "big"))
        out.extend(h.digest())
        counter += 1
    return bytes(out[:n])


def expand_hmac_counter(seed: bytes, n: int, hash_name: str) -> bytes:
    digest = hashlib.sha256 if hash_name == "sha256" else hashlib.sha512
    base = hmac.new(seed, digestmod=digest)
    out = bytearray()
    counter = 0
    while len(out) < n:
        h = base.copy()
        h.update(counter.to_bytes(8, "big"))
        out.extend(h.digest())
        counter += 1
    return bytes(out[:n])


def expand_mt19937(seed: bytes, n: int) -> bytes:
    return random.Random(seed).randbytes(n)


def expand_aes_ctr(seed: bytes, n: int) -> bytes:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    key = hashlib.sha256(seed).digest()
    enc = Cipher(algorithms.AES(key), modes.CTR(b"\0" * 16)).encryptor()
    return enc.update(b"\0" * n) + enc.finalize()


def expand_chacha20(seed: bytes, n: int) -> bytes:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms
    key = hashlib.sha256(seed).digest()
    enc = Cipher(algorithms.ChaCha20(key, b"\0" * 16), mode=None).encryptor()
    return enc.update(b"\0" * n)


def expand_rc4(seed: bytes, n: int) -> bytes:
    key = hashlib.sha256(seed).digest()
    state = list(range(256))
    j = 0
    for i in range(256):
        j = (j + state[i] + key[i % len(key)]) & 0xFF
        state[i], state[j] = state[j], state[i]
    out = bytearray()
    i = j = 0
    for _ in range(n):
        i = (i + 1) & 0xFF
        j = (j + state[i]) & 0xFF
        state[i], state[j] = state[j], state[i]
        out.append(state[(state[i] + state[j]) & 0xFF])
    return bytes(out)


def stream_specs(raw: bytes) -> list[tuple[str, bytes, str]]:
    sha256 = hashlib.sha256(raw).digest()
    sha512 = hashlib.sha512(raw).digest()
    return [
        ("raw/hmac-sha256", raw, "hmac256"),
        ("raw/hmac-sha512", raw, "hmac512"),
        ("raw/shake256", raw, "shake256"),
        ("raw/python-mt19937", raw, "mt19937"),
        ("sha256/sha256-counter", sha256, "sha256-counter"),
        ("sha256/hmac-sha256", sha256, "hmac256"),
        ("sha256/aes-256-ctr", raw, "aes256-ctr"),
        ("sha256/chacha20", raw, "chacha20"),
        ("sha256/rc4", raw, "rc4"),
        ("sha512/sha512-counter", sha512, "sha512-counter"),
        ("sha512/hmac-sha512", sha512, "hmac512"),
        ("sha512/shake256", sha512, "shake256"),
    ]


def expand(seed: bytes, generator: str, n: int) -> bytes:
    if generator == "sha256-counter":
        return expand_hash_counter(seed, n, "sha256")
    if generator == "sha512-counter":
        return expand_hash_counter(seed, n, "sha512")
    if generator == "hmac256":
        return expand_hmac_counter(seed, n, "sha256")
    if generator == "hmac512":
        return expand_hmac_counter(seed, n, "sha512")
    if generator == "shake256":
        return hashlib.shake_256(seed).digest(n)
    if generator == "mt19937":
        return expand_mt19937(seed, n)
    if generator == "aes256-ctr":
        return expand_aes_ctr(seed, n)
    if generator == "chacha20":
        return expand_chacha20(seed, n)
    if generator == "rc4":
        return expand_rc4(seed, n)
    raise ValueError(generator)


def reduce_bytes(data: bytes, mode: str, count: int) -> np.ndarray:
    if mode == "mod29":
        return np.fromiter((b % 29 for b in data[:count]), dtype=np.int64, count=count)
    if mode == "scaled29":
        return np.fromiter((b * 29 // 256 for b in data[:count]), dtype=np.int64, count=count)
    if mode == "bits5-reject":
        out: list[int] = []
        acc = 0
        bits = 0
        for b in data:
            acc = (acc << 8) | b
            bits += 8
            while bits >= 5 and len(out) < count:
                bits -= 5
                value = (acc >> bits) & 31
                acc &= (1 << bits) - 1 if bits else 0
                if value < 29:
                    out.append(value)
            if len(out) >= count:
                break
        if len(out) < count:
            raise RuntimeError(f"not enough accepted 5-bit values: {len(out)} < {count}")
        return np.asarray(out, dtype=np.int64)
    raise ValueError(mode)


def score_plain(sweep, skipdecode, plain) -> tuple[float, str]:
    text = skipdecode.idx_to_trans(plain)
    return float(sweep.Q.score_norm(text)), text


def decode_one(sweep, skipdecode, cipher: np.ndarray, key: np.ndarray,
               sign: int, atbash: int, offset: int, beam_width: int):
    transformed = ((28 - cipher) % 29) if atbash else cipher
    plain = sweep.beam(transformed, key, offset, sign, beam_width)
    if plain is None:
        return None
    score, text = score_plain(sweep, skipdecode, plain)
    verified = verify_reencipher(
        cipher, list(map(int, plain)), key, offset, sign, atbash, sweep.MAXSKIP
    )
    if verified is None:
        return None
    end_ptr, skips = verified
    return {
        "score": score,
        "text": text,
        "end_ptr": int(end_ptr),
        "skip_count": int(sum(skips)),
    }


def load_unknown_pages() -> list[tuple[int, np.ndarray]]:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
    pages = []
    for physical_id, page in enumerate(corpus["pages"][:56]):
        values = page.get("indices", [])
        if values:
            pages.append((physical_id, np.asarray(values, dtype=np.int64)))
    total = sum(len(cipher) for _, cipher in pages)
    if len(pages) != 55 or total != 12_956:
        raise RuntimeError(f"unexpected LP2 corpus: {len(pages)} rune pages, {total} runes")
    return pages


def positive_control(sweep, skipdecode, translit) -> dict:
    source = (
        "TO BE OR NOT TO BE THAT IS THE QUESTION WHETHER TIS NOBLER IN THE MIND "
        "TO SUFFER THE SLINGS AND ARROWS OF OUTRAGEOUS FORTUNE OR TO TAKE ARMS "
        "AGAINST A SEA OF TROUBLES"
    )
    plain = encode_source_native(source * 3, translit)[:240]
    key = np.asarray([(i * 7 + 11) % 29 for i in range(8000)], dtype=np.int64)
    cipher, planted_skips = encipher_keyskip(plain, key, 3, 1, 0.83)
    decoded = sweep.beam(cipher, key, 3, 1, sweep.FULL_BEAM)
    exact = np.array_equal(np.asarray(decoded, dtype=np.int64), plain)
    verified = verify_reencipher(cipher, list(map(int, decoded)), key, 3, 1, 0, sweep.MAXSKIP)
    if not exact or verified is None:
        raise RuntimeError("synthetic planted-key positive control failed")
    return {
        "exact_plaintext_recovery": True,
        "planted_skip_count": int(planted_skips),
        "reencipher_end_ptr": int(verified[0]),
        "text_preview": skipdecode.idx_to_trans(decoded)[:100],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--external-root", type=Path, required=True)
    parser.add_argument("--pad-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    sweep, skipdecode = load_external_decoder(args.external_root)
    shakespeare = (ROOT / "resources/control/shakespeare_first300k.txt").read_text()
    replace_prefilter_lm(sweep, shakespeare, skipdecode.TRANSLIT)
    pages = load_unknown_pages()
    page_map = dict(pages)
    pads = load_pads(args.pad_dir)

    positive = positive_control(sweep, skipdecode, skipdecode.TRANSLIT)
    print("POSITIVE_CONTROL " + json.dumps(positive))

    key_symbols = 70_000
    raw_bytes = 70_000
    candidates = []
    for pad_name, pad in pads.items():
        for seed_name, seed, generator in stream_specs(pad):
            byte_stream = expand(seed, generator, raw_bytes)
            for reducer in ("mod29", "scaled29", "bits5-reject"):
                forward = reduce_bytes(byte_stream, reducer, key_symbols)
                for orientation, base_key in (
                    ("forward", forward),
                    ("reverse", forward[::-1].copy()),
                ):
                    for sign in (-1, 1):
                        for atbash in (0, 1):
                            candidates.append({
                                "name": f"{pad_name}:{seed_name}:{reducer}:{orientation}",
                                "key": base_key,
                                "sign": sign,
                                "atbash": atbash,
                            })

    first_cipher = page_map[0]
    screen_len = min(int(sweep.SCREEN_LEN), len(first_cipher))
    screened = []
    for candidate in candidates:
        result = decode_one(
            sweep, skipdecode, first_cipher[:screen_len], candidate["key"],
            candidate["sign"], candidate["atbash"], 0, int(sweep.SCREEN_BEAM)
        )
        if result is None:
            continue
        screened.append({
            **{k: v for k, v in candidate.items() if k != "key"},
            "key": candidate["key"],
            "screen_score": result["score"],
            "screen_preview": result["text"][:100],
        })
    screened.sort(key=lambda x: x["screen_score"], reverse=True)
    top = screened[:20]

    holdout_ids = [0, 1, 8, 15, 23, 27, 33, 40, 54, 55]
    reset_results = []
    for candidate in top:
        scores = {}
        previews = {}
        for page_id in holdout_ids:
            cipher = page_map.get(page_id)
            if cipher is None:
                continue
            result = decode_one(
                sweep, skipdecode, cipher, candidate["key"],
                candidate["sign"], candidate["atbash"], 0, int(sweep.FULL_BEAM)
            )
            if result is not None:
                scores[str(page_id)] = result["score"]
                previews[str(page_id)] = result["text"][:80]
        reset_results.append({
            "name": candidate["name"],
            "sign": candidate["sign"],
            "atbash": candidate["atbash"],
            "screen_score": candidate["screen_score"],
            "holdout_scores": scores,
            "holdout_mean": (sum(scores.values()) / len(scores)) if scores else None,
            "holdout_previews": previews,
        })

    global_results = []
    for candidate in top[:8]:
        cursor = 0
        page_scores = {}
        page_previews = {}
        total_skips = 0
        decoded_pages = 0
        for page_id, cipher in pages:
            result = decode_one(
                sweep, skipdecode, cipher, candidate["key"],
                candidate["sign"], candidate["atbash"], cursor, int(sweep.FULL_BEAM)
            )
            if result is None:
                break
            cursor = result["end_ptr"]
            total_skips += result["skip_count"]
            decoded_pages += 1
            if page_id in holdout_ids:
                page_scores[str(page_id)] = result["score"]
                page_previews[str(page_id)] = result["text"][:80]
        global_results.append({
            "name": candidate["name"],
            "sign": candidate["sign"],
            "atbash": candidate["atbash"],
            "screen_score": candidate["screen_score"],
            "decoded_pages_before_failure": decoded_pages,
            "final_key_cursor": cursor,
            "total_skips": total_skips,
            "holdout_scores": page_scores,
            "holdout_mean": (sum(page_scores.values()) / len(page_scores)) if page_scores else None,
            "holdout_previews": page_previews,
        })

    report = {
        "hypothesis": "The 2013 CicadaOS pads may have been used as PRF/KDF inputs rather than as literal byte-to-GP29 pads.",
        "distinction_from_prior": "The full raw _560.00 direct-pad sweep and raw 560.17 pad sweep are prior negative results; this run tests only deterministic PRF/stream expansion from those binary artifacts.",
        "source": {
            "repository": "https://github.com/neuroretransmit/cicada",
            "commit": PAD_REPO_COMMIT,
            "path": PAD_REPO_PATH,
            "inputs": {
                name: {
                    "size": len(data),
                    "git_blob_sha": git_blob_sha(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                } for name, data in pads.items()
            },
        },
        "decoder": {
            "repository": "https://github.com/Dukotah/cicada3301",
            "commit": "f63501d8f2d835b80c30230eb89a1110fb9197d2",
            "model": "collision-skip additive GP29, pinned campaign18_skip beam",
            "max_skip": int(sweep.MAXSKIP),
            "screen_beam": int(sweep.SCREEN_BEAM),
            "full_beam": int(sweep.FULL_BEAM),
            "confidence_threshold": float(getattr(sweep, "CONF_THR", float("nan"))),
        },
        "scope": {
            "seed_materials": ["raw file bytes", "SHA256(file)", "SHA512(file)"],
            "generators": ["SHA256-counter", "HMAC-SHA256-counter", "SHA512-counter",
                           "HMAC-SHA512-counter", "SHAKE256", "Python MT19937",
                           "AES-256-CTR", "ChaCha20", "RC4"],
            "reductions": ["byte mod 29", "floor(byte*29/256)", "MSB-first 5-bit rejection of 29..31"],
            "directions": ["forward", "reverse"],
            "key_signs": [-1, 1],
            "alphabet_reflections": [False, True],
            "page_clocks": ["page-reset holdouts", "continuous sequential clock"],
            "offsets": "fixed at zero; no arbitrary offset or salt search",
            "candidate_count": len(candidates),
            "screened_count": len(screened),
        },
        "positive_control": positive,
        "top_screen": [
            {k: v for k, v in item.items() if k != "key"} for item in top
        ],
        "page_reset_holdouts": reset_results,
        "continuous_clock": global_results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print("REPORT " + json.dumps({
        "candidate_count": len(candidates),
        "screened_count": len(screened),
        "top_screen": report["top_screen"][:10],
        "best_page_reset": sorted(
            reset_results,
            key=lambda x: x["holdout_mean"] if x["holdout_mean"] is not None else -999,
            reverse=True
        )[:5],
        "best_continuous": sorted(
            global_results,
            key=lambda x: x["holdout_mean"] if x["holdout_mean"] is not None else -999,
            reverse=True
        )[:5],
        "output": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
