"""Scan original LP2 against the recovered 58,152-byte OutGuess streams.

Reversible finite hypothesis: C = P +/- K mod29, K reduced from byte stream.
All stream starts, signs, byte reducers, directions and LP2 rune pages.
NumPy and Numba required; source streams come from the existing OutGuess job.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import time
from pathlib import Path

import numpy as np
from numba import njit

ROOT = Path(__file__).resolve().parents[1]
ALPHABET = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
RUNE_ID = {r: i for i, r in enumerate(ALPHABET)}
ASCII_RUNES = ("F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
               "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
               "A", "AE", "Y", "IA", "EA")
RUNES = {r: i for i, r in enumerate(ASCII_RUNES)}
DIGRAPHS = {"TH", "EO", "OE", "AE", "IA", "EA", "NG"}


def gp_encode(text: str) -> np.ndarray:
    text = re.sub(r"[^A-Z]", "", text.upper().replace("QU", "CW")
                  .replace("V", "U").replace("K", "C").replace("Z", "S"))
    output = []
    i = 0
    while i < len(text):
        two = text[i:i + 2]
        if two in DIGRAPHS:
            output.append(RUNES[two])
            i += 2
        else:
            output.append(RUNES[text[i]])
            i += 1
    return np.array(output, dtype=np.uint8)


def lp2_pages() -> list[np.ndarray]:
    text = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
    records = text.split("%")
    assert len(records) >= 57
    pages = [np.array([RUNE_ID[r] for r in item if r in RUNE_ID], dtype=np.uint8)
             for item in records[:55]]
    assert len(pages) == 55 and sum(map(len, pages)) == 12956
    return pages


def original_streams() -> list[tuple[str, np.ndarray]]:
    folder = ROOT / "outguess-results"
    streams = sorted((p.name, np.frombuffer(p.read_bytes(), dtype=np.uint8))
                     for p in folder.glob("*.payload")
                     if p.stem.isdigit() and 17 <= int(p.stem) <= 74)
    assert len(streams) == 16, len(streams)
    assert all(len(data) == 58152 for _, data in streams)
    return streams


@njit(cache=True)
def score_offsets(cipher: np.ndarray, key: np.ndarray, table: np.ndarray):
    scores = np.full(2, -1e99, dtype=np.float64)
    offsets = np.zeros(2, dtype=np.int64)
    for offset in range(len(key) - len(cipher) + 1):
        s0 = 0.0
        s1 = 0.0
        for i in range(len(cipher)):
            x = cipher[i]
            k = key[offset + i]
            s0 += table[0, x, k]
            s1 += table[1, x, k]
        if s0 > scores[0]:
            scores[0] = s0
            offsets[0] = offset
        if s1 > scores[1]:
            scores[1] = s1
            offsets[1] = offset
    return scores / len(cipher), offsets


def candidate_keys(streams):
    keys = []
    for name, data in streams:
        for reducer in ("mod29", "scaled29"):
            nums = (data % 29 if reducer == "mod29" else
                    (data.astype(np.uint16) * 29 // 256).astype(np.uint8))
            keys.append((name, reducer, "forward", nums))
            keys.append((name, reducer, "reverse", nums[::-1].copy()))
    return keys


def score_table(weights):
    table = np.empty((2, 29, 29), dtype=np.float64)
    for x in range(29):
        for k in range(29):
            table[0, x, k] = weights[(x - k) % 29]
            table[1, x, k] = weights[(x + k) % 29]
    return table


def all_settings(cipher, keys, table):
    ranked = []
    for source, reducer, direction, pad in keys:
        scores, offsets = score_offsets(cipher, pad, table)
        for sign in range(2):
            ranked.append((float(scores[sign]), source, reducer,
                           direction, "minus" if sign == 0 else "plus", int(offsets[sign])))
    return sorted(ranked, reverse=True)


def main():
    pages = lp2_pages()
    streams = original_streams()
    keys = candidate_keys(streams)
    source_file = ROOT / "resources/control/shakespeare_first300k.txt"
    source = source_file.read_text(encoding="utf-8")
    pivot = int(len(source) * .75)
    train = gp_encode(source[:pivot])
    heldout = gp_encode(source[pivot:])
    weights = np.log((np.bincount(train, minlength=29) + 2) / (len(train) + 58))
    table = score_table(weights)
    assert keys[0][:3] == ("17.payload", "mod29", "forward")

    report = {
        "source_sha256": hashlib.sha256((ROOT / "resources/lp2-transcription.txt").read_bytes()).hexdigest(),
        "language_sha256": hashlib.sha256(source_file.read_bytes()).hexdigest(),
        "payload_sha256": {name: hashlib.sha256(x.tobytes()).hexdigest() for name, x in streams},
        "model": "direct C=P+/-K modulo29; two byte reductions; both directions; every offset",
        "total_pages": len(pages),
        "total_runes": sum(map(len, pages)),
        "source_streams": len(streams),
        "settings_per_page_before_offsets": len(keys) * 2,
        "pages": []
    }

    # Unfitted language-source positive: actual OutGuess bytes and hidden start.
    plain = heldout[200:462]
    assert len(plain) == 262
    start = 12345
    encrypted = (plain.astype(np.uint16) +
                 keys[0][3][start:start + 262].astype(np.uint16)) % 29
    positive = all_settings(encrypted.astype(np.uint8), keys, table)
    assert positive[0][1:] == ("17.payload", "mod29", "forward", "minus", start)
    report["control"] = {
        "planted_key_rank": 1, "true": positive[0],
        "runner_up": positive[1], "plaintext_runes": 262
    }

    begin = time.perf_counter()
    limit = int(os.environ.get("OUTGUESS_MAX_PAGES", "55"))
    for page_id, cipher in enumerate(pages[:limit]):
        ranked = all_settings(cipher, keys, table)
        report["pages"].append({
            "record_index": page_id, "runes": len(cipher),
            "best": ranked[0], "runner_up": ranked[1]
        })
        print("DIRECTPAD_PAGE " + json.dumps(report["pages"][-1]), flush=True)

    # Family-wise null reselects the maximum across all sources, offsets and modes.
    reps = int(os.environ.get("OUTGUESS_NULL_REPLICATES", "64"))
    rng = np.random.default_rng(0x40d17c91)
    random_maxima = [all_settings(rng.permutation(pages[0]), keys, table)[0][0]
                     for _ in range(reps)]
    actual = report["pages"][0]["best"][0]
    exceed = sum(x >= actual for x in random_maxima)
    report["page0_null"] = {
        "seed": 0x40d17c91, "replicates": reps,
        "source_preserved": "exact page0 rune multiset; order shuffled",
        "family_max_score": actual, "null_max_scores": random_maxima,
        "null_max_mean": float(np.mean(random_maxima)),
        "null_max_high": float(max(random_maxima)),
        "null_ge_actual": exceed, "add_one_p": (1 + exceed) / (reps + 1)
    }
    report["elapsed_seconds"] = round(time.perf_counter() - begin, 3)

    # Single-writer workflow step; atomic final result for the existing artifact uploader.
    target = ROOT / "outguess-results/directpad-summary.json"
    temporary = target.with_suffix(".json.incomplete")
    temporary.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, target)
    print("OUTGUESS_DIRECTPAD_COMPLETE " + json.dumps({
        "num_pages": len(report["pages"]), "planted": report["control"],
        "null": report["page0_null"], "elapsed": report["elapsed_seconds"]
    }), flush=True)


if __name__ == "__main__":
    main()
