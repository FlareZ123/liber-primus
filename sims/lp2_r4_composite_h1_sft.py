#!/usr/bin/env python3
"""One source-fixed R4/H1 test: phi(prime) + DIVINITY, modulo 29.

This is a deliberately narrow original-input test, not a key search.  The only
source-selected clock is global rune order starting at the first unknown LP2
rune; the keyword starts at D.  The pnotisdev mid-word engine is pinned by the
manual workflow and supplies the independently developed R4 null/repair
likelihood model.  Synthetic positive and random-key controls validate the
adapter; they are not evidence about the historical cipher.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import sys

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
EXT = Path(os.environ["PNOTISDEV_ROOT"]).resolve()
sys.path.insert(0, str(EXT / "work" / "chanscreen" / "v2"))
import engine_mid  # noqa: E402

Q = 29
Q_REPAIR = 0.81
NU_NULL = 0.42
T300 = 29.80
WINDOW = 300
EXTERNAL_COMMIT = os.environ.get("PNOTISDEV_COMMIT", "15200c67abee106913ba01ff504c5b6e88d16cc7")


def first_primes(n: int) -> list[int]:
    """Small deterministic sieve; the stream starts at prime 2."""
    limit = max(32, int(n * (math.log(max(n, 3)) + math.log(math.log(max(n, 3))))) + 32)
    while True:
        sieve = bytearray(b"\x01") * (limit + 1)
        sieve[0:2] = b"\x00\x00"
        for p in range(2, math.isqrt(limit) + 1):
            if sieve[p]:
                start = p * p
                sieve[start : limit + 1 : p] = b"\x00" * (((limit - start) // p) + 1)
        out = [i for i, flag in enumerate(sieve) if flag]
        if len(out) >= n:
            return out[:n]
        limit *= 2


def parse_source() -> tuple[list[int], list[int], dict]:
    corpus_path = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
    transcription_path = ROOT / "resources" / "liber-primus" / "lp2-transcription.txt"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    rune_index = {r: i for i, r in enumerate(corpus["runes"])}
    expected = [
        value
        for page in corpus["pages"]
        if int(page["page"]) <= 55
        for value in page["indices"]
    ]
    text = transcription_path.read_text(encoding="utf-8")
    cipher: list[int] = []
    word_start: list[int] = []
    new_word = True
    for ch in text:
        if ch in rune_index:
            cipher.append(rune_index[ch])
            word_start.append(1 if new_word else 0)
            new_word = False
        elif ch in "-.&$":
            # The repository's transcription convention: hyphen, clause,
            # paragraph and segment separators start a new word.  Line/page
            # wraps are transparent.
            new_word = True
        elif ch in "/%\\r\\n\\t ":
            continue
        # Digits and editorial characters are not Gematria Primus runes.
        if len(cipher) >= len(expected):
            break
    if cipher[: len(expected)] != expected:
        raise RuntimeError(
            "Transcription rune order does not match lp2-corpus.json pages 0-55; "
            "refusing to run on misaligned input."
        )
    cipher = cipher[: len(expected)]
    word_start = word_start[: len(expected)]
    if not cipher:
        raise RuntimeError("No LP2 runes parsed")
    word_start[0] = 1
    meta = {
        "corpus": str(corpus_path.relative_to(ROOT)),
        "transcription": str(transcription_path.relative_to(ROOT)),
        "unknown_pages": 56,
        "unknown_runes": len(expected),
        "page_rune_counts": [
            {"page": int(p["page"]), "runes": int(p["runic_count"])}
            for p in corpus["pages"]
            if int(p["page"]) <= 55
        ],
    }
    return cipher, word_start, meta


def word_lengths(starts: list[int]) -> list[int]:
    positions = [i for i, v in enumerate(starts) if v]
    if not positions or positions[0] != 0:
        raise RuntimeError("Word-start vector must begin at rune 0")
    ends = positions[1:] + [len(starts)]
    return [b - a for a, b in zip(positions, ends)]


def log_common(cipher: list[int], q: float = Q_REPAIR) -> float:
    n = len(cipher)
    if not n:
        return 0.0
    repeats = sum(cipher[i] == cipher[i - 1] for i in range(1, n))
    if q == 1.0 and repeats:
        return -math.inf
    score = -n * math.log(Q) + (n - 1 - repeats) * math.log1p(q / (Q - 1))
    if repeats:
        score += repeats * math.log1p(-q)
    return score


def score(cipher: list[int], starts: list[int], key: list[int], pi, lm, sign: int, mode: str) -> dict:
    out = engine_mid.all_offsets_mid(
        cipher, key, sign, Q_REPAIR, mode, pi, lm,
        kind=3, nu=NU_NULL, wstart=starts,
    )
    lw = log_common(cipher)
    with np.errstate(invalid="ignore"):
        s_lu = out[:, 0] - out[:, 1]
        s_lw = out[:, 0] - lw
        guard = np.minimum(s_lu, s_lw)
    guard[~np.isfinite(guard)] = -np.inf
    best = int(np.argmax(guard))
    return {
        "sign": sign,
        "channel": mode,
        "offset0": float(guard[0]),
        "offset0_logL": float(out[0, 0]),
        "offset0_logU": float(out[0, 1]),
        "offset0_logW": float(lw),
        "best_offset_diagnostic_only": best,
        "best_score_diagnostic_only": float(guard[best]),
        "threshold_T300": T300,
        "offset0_exceeds_T300": bool(guard[0] >= T300),
    }


def markov_plain(n: int, pi, lm, rng: np.random.Generator) -> list[int]:
    out: list[int] = []
    state = int(rng.choice(Q, p=pi))
    for _ in range(n):
        out.append(state)
        state = int(rng.choice(Q, p=lm[state]))
    return out


def plant_matching_model(
    cipher_word_lengths: list[int],
    key: list[int],
    pi,
    lm,
    mode: str,
    seed: int,
) -> tuple[list[int], list[int]]:
    """Plant the engine's kind-3 model exactly: keyless invisible nulls and
    random-other anti-repeat repairs.  This is a decoder/control test only."""
    rng = np.random.default_rng(seed)
    plans = []
    real_total = 0
    for lc in cipher_word_lengths:
        has_null = bool(lc >= 3 and rng.random() < NU_NULL)
        lp = lc - 1 if has_null else lc
        slot = int(rng.integers(1, lp)) if has_null else None
        plans.append((lp, slot))
        real_total += lp
    plain = markov_plain(real_total, pi, lm, rng)
    out: list[int] = []
    starts: list[int] = []
    j = 0
    last_real = None
    cursor = 0
    for lp, slot in plans:
        word = plain[cursor : cursor + lp]
        cursor += lp
        for t, p in enumerate(word):
            x = (int(p) + key[j]) % Q
            if last_real is not None and x == last_real and rng.random() < Q_REPAIR:
                z = int(rng.integers(Q - 1))
                x = z + (1 if z >= last_real else 0)
                if mode == "spend":
                    j += 1
            else:
                j += 1
            out.append(x)
            starts.append(1 if t == 0 else 0)
            last_real = x
            if slot is not None and t + 1 == slot:
                # Model null: uniform, keyless, and invisible to the
                # anti-repeat and plaintext language-model states.
                out.append(int(rng.integers(Q)))
                starts.append(0)
    if len(out) != sum(cipher_word_lengths):
        raise RuntimeError("Synthetic plant did not preserve the requested ciphertext length")
    starts[0] = 1
    return out, starts


def main() -> None:
    source, source_starts, source_meta = parse_source()
    c = source[:WINDOW]
    ws = source_starts[:WINDOW]
    ws[0] = 1
    lengths = word_lengths(ws)

    model_path = EXT / "work" / "chanscreen" / "model.npz"
    with np.load(model_path) as z:
        pi = np.asarray(z["pi"], dtype=np.float64)
        lm = np.asarray(z["L"], dtype=np.float64)
    if pi.shape != (Q,) or lm.shape != (Q, Q):
        raise RuntimeError(f"Unexpected language-model shapes: pi={pi.shape}, L={lm.shape}")
    if not np.isclose(pi.sum(), 1.0, atol=1e-12) or not np.allclose(lm.sum(axis=1), 1.0, atol=1e-12):
        raise RuntimeError("Language model is not normalized")

    # Source-fixed key: phi(p_j)=p_j-1, j starts with prime 2; DIVINITY
    # uses the GP alias V=U, so its rune spelling is DIUINITY.
    translit = json.loads(
        (ROOT / "resources" / "liber-primus" / "lp2-corpus.json").read_text(encoding="utf-8")
    )["translit"]
    single = {letter: i for i, letter in enumerate(translit) if len(letter) == 1}
    keyword = [single[ch] for ch in "DIUINITY"]
    nkey = WINDOW + 200
    ps = first_primes(nkey)
    phi = [(p - 1) % Q for p in ps]
    key = [(phi[j] + keyword[j % len(keyword)]) % Q for j in range(nkey)]

    source_results = []
    for sign in (1, -1):
        for mode in ("hold", "spend"):
            source_results.append(score(c, ws, key, pi, lm, sign, mode))

    # Positive control: same composite key, same word lengths, exact kind-3
    # null/repair model, and plaintext sampled from the same frozen language
    # model.  The random-key control uses the identical planted ciphertext.
    positive_results = []
    null_results = []
    for mode, seed in (("hold", 3301201), ("spend", 3301202)):
        planted, planted_starts = plant_matching_model(lengths, key, pi, lm, mode, seed)
        positive = score(planted, planted_starts, key, pi, lm, 1, mode)
        positive["mode"] = mode
        positive_results.append(positive)
        rng = np.random.default_rng(seed + 1000)
        wrong_key = [int(x) for x in rng.integers(0, Q, size=nkey)]
        null = score(planted, planted_starts, wrong_key, pi, lm, 1, mode)
        null["mode"] = mode
        null_results.append(null)

    input_digest = hashlib.sha256(bytes(c) + bytes(ws)).hexdigest()
    key_digest = hashlib.sha256(bytes(key)).hexdigest()
    output = {
        "experiment": "source-fixed R4/H1 composite key",
        "external_reference": "pnotisdev/cicada3301",
        "external_commit": EXTERNAL_COMMIT,
        "external_model": "work/chanscreen/model.npz",
        "source": source_meta,
        "window": {
            "runes": WINDOW,
            "word_count": len(lengths),
            "word_lengths": lengths,
            "input_sha256_cipher_then_wordstart": input_digest,
        },
        "key": {
            "formula": "(prime_j - 1 + GP(DIUINITY[j mod 8])) mod 29",
            "prime_start": 2,
            "keyword": "DIVINITY",
            "gp_spelling": "DIUINITY",
            "gp_values": keyword,
            "clock": "one continuous key clock from first unknown LP2 rune; offset 0",
            "sha256_first_key_values": key_digest,
            "key_values_generated": nkey,
        },
        "model": {
            "Q": Q,
            "anti_repeat_repair_q": Q_REPAIR,
            "word_null_probability_nu": NU_NULL,
            "null_model": "one uniform keyless null at an interior position of a word; invisible to anti-repeat and language model",
            "collision_channels": ["hold", "spend"],
            "signs_tested": [1, -1],
            "literal_F_skip": False,
            "threshold_T300": T300,
        },
        "source_results": source_results,
        "positive_controls": positive_results,
        "random_key_controls": null_results,
        "interpretation": (
            "Only offset 0 with the source-fixed key is confirmatory. Best offsets are diagnostics, "
            "not permission to select an unmotivated phase. A synthetic positive control validates "
            "the decoder under its stated model; it does not establish historical encryption."
        ),
    }
    out_path = ROOT / "im-results" / "lp2-r4-composite-h1-sft.json"
    out_path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "experiment": output["experiment"],
        "window": output["window"],
        "key": output["key"],
        "source_results": source_results,
        "positive_controls": positive_results,
        "random_key_controls": null_results,
        "output": str(out_path.relative_to(ROOT)),
    }, indent=2))


if __name__ == "__main__":
    main()
