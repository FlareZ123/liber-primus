"""Exact-offset screen of the 1955 RAND Million Random Digits as a GP29 pad.

Use a pinned digit source from RANDCorporation/milliondigits under its MIT license.
Scan every aligned source offset for a source-prescribed stream family:
two- or three-decimal adjacent/disjoint groups and the printed five-digit groups,
either modulo-29 or scaled-29 reduction, forward/backward source readout,
and both additive signs. The original LP2 source intervals are the eight
section-opening pages, fixed independently of scoring; no unknown text is fitted.
A true heldout English-GP plaintext plant must be recovered as rank one.

This direct, no-keyskip family deliberately does not claim exhaustive coverage of
all possible RAND digit usage. It is an explicit reproducible source-key gate.
"""

from __future__ import annotations

import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
from numba import njit, prange

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
SRC_TEXT = (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf-8")
GP = CORPUS["translit"]
GP_CODES = {symbol: index for index, symbol in enumerate(GP)}
GP_TOKENS = sorted(GP_CODES, key=len, reverse=True)
SOURCE_COMMIT = "09739b344efb3ed20602f34023232c67f20f212a"
DIGIT_BLOB_SHA1 = "cb72b2b37aa240bf05b0ebe1c981e0c510c1e5e0"
SECTION_STARTS = (0, 3, 8, 16, 23, 27, 33, 40)
PREFIX_RUNES = 90
TOP_K = 12
PLANT_OFFSET = 12345


def encode(text: str) -> np.ndarray:
    text = text.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Z", "S")
    result = []
    at = 0
    while at < len(text):
        if not ("A" <= text[at] <= "Z"):
            at += 1
            continue
        for token in GP_TOKENS:
            if text.startswith(token, at):
                result.append(GP_CODES[token])
                at += len(token)
                break
        else:
            raise ValueError("Unencodable source letter: " + text[at])
    return np.asarray(result, dtype=np.uint8)


def read_rand_digits(source: Path) -> tuple[np.ndarray, dict]:
    data = source.read_bytes()
    lines = data.decode("ascii").splitlines()
    assert len(lines) == 20000, f"RAND expected 20,000 source rows, got {len(lines)}"
    rows = []
    for i, line in enumerate(lines):
        assert int(line[:5]) == i + 1, (i, line[:10])
        section = "".join(ch for ch in line[8:] if "0" <= ch <= "9")
        assert len(section) == 50, (i, len(section), line[:15])
        rows.append(section)
    digits_str = "".join(rows)
    assert len(digits_str) == 1000000
    digit_array = np.frombuffer(digits_str.encode("ascii"), dtype=np.uint8) - 48
    hist = np.bincount(digit_array, minlength=10)
    return digit_array, {
        "sourceCommit": SOURCE_COMMIT,
        "gitBlobSHA1": DIGIT_BLOB_SHA1,
        "sourceRawSHA256": hashlib.sha256(data).hexdigest(),
        "digitSequenceSHA256": hashlib.sha256(digits_str.encode("ascii")).hexdigest(),
        "rows": len(lines),
        "digits": len(digit_array),
        "digitCounts": hist.tolist(),
    }


def source_streams(digits: np.ndarray):
    for group_size in (2, 3, 5):
        x = np.zeros(len(digits) - group_size + 1, dtype=np.int64)
        for digit_offset in range(group_size):
            x += digits[digit_offset:digit_offset + len(x)].astype(np.int64) * 10 ** (group_size - digit_offset - 1)
        # The printed quintuplets may only be consumed as full five-digit groups.
        for stride in ((1, group_size) if group_size in (2, 3) else (5,)):
            for reduction in ("mod", "scale"):
                key = (x % 29 if reduction == "mod"
                       else x * 29 // 10 ** group_size).astype(np.uint8)
                yield (group_size, stride, reduction, key)


@njit(parallel=True)
def prefix_scan(cipher: np.ndarray, key: np.ndarray,
                stride: int, table: np.ndarray) -> np.ndarray:
    usable = len(key) - stride * (len(cipher) - 1)
    result = np.empty(usable, dtype=np.float32)
    # Score array remains external, enabling exact global order-statistics.
    for offset in prange(usable):
        score = np.float32(0)
        for i in range(len(cipher)):
            score += table[int(cipher[i]) * 29 + int(key[offset + stride * i])]
        result[offset] = score
    return result


@njit
def score_full(cipher: np.ndarray, key: np.ndarray,
               stride: int, offset: int, table: np.ndarray,
               first: int, last: int) -> float:
    score = 0.0
    for i in range(first, last):
        score += float(table[int(cipher[i]) * 29 + int(key[offset + stride * i])])
    return score / (last - first)


def select_candidates(cipher: np.ndarray, key: np.ndarray,
                      stride: int, lut: np.ndarray):
    scores = prefix_scan(cipher[:PREFIX_RUNES], key, stride, lut)
    # All full-page candidates must fit the source, including stride.
    full_count = len(key) - stride * (len(cipher) - 1)
    scores = scores[:full_count]
    top = np.argpartition(scores, -TOP_K)[-TOP_K:]
    top = sorted((int(i) for i in top), key=lambda i: -float(scores[i]))
    candidates = []
    for offset in top:
        mid = min(180, len(cipher))
        candidates.append({
            "sourceIndex": offset,
            "trainPerRune": float(scores[offset] / PREFIX_RUNES),
            "holdoutPerRune": score_full(cipher, key, stride, offset, lut, PREFIX_RUNES, mid),
            "wholePagePerRune": score_full(cipher, key, stride, offset, lut, 0, len(cipher)),
        })
    return candidates


def construct_plant(plain: np.ndarray, key: np.ndarray,
                    stride: int, offset: int, sign: int, rewrite: bool):
    rng = np.random.default_rng(0x19553301)
    result = []
    replaced = 0
    previous = -1
    for i, symbol in enumerate(plain):
        emit = (int(symbol) - sign * int(key[offset + i * stride])) % 29
        if rewrite and i and emit == previous and rng.random() < .81:
            if i >= 6:
                emit = (24 - 2 * result[i - 6]) % 29
            else:
                emit = (previous + 1 + int(rng.integers(28))) % 29
            replaced += 1
        result.append(emit)
        previous = emit
    return np.asarray(result, dtype=np.uint8), replaced


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python sims/rand1955_running_key.py <RAND digits.txt>")
    rand, source = read_rand_digits(Path(sys.argv[1]))
    word_frequencies = np.bincount(encode(SRC_TEXT[:240000]), minlength=29).astype(float)
    probabilities = (word_frequencies + 1) / (word_frequencies.sum() + 29)
    logp = np.log(probabilities)
    pages = {int(p["page"]): np.asarray(p["indices"], dtype=np.uint8)
             for p in CORPUS["pages"] if p["indices"]}
    assert len(pages) >= 55
    assert all(len(pages[p]) >= 180 for p in SECTION_STARTS)
    english_heldout = encode(SRC_TEXT[240000:])
    assert len(english_heldout) >= len(pages[0])
    plain = english_heldout[:len(pages[0])]
    original = {p: [] for p in SECTION_STARTS}
    controls = []
    scan_count = 0
    for group_size, stride, reduction, key in source_streams(rand):
        for reversed_source in (False, True):
            key_direction = key[::-1].copy() if reversed_source else key
            for sign in (-1, 1):
                table = np.asarray(
                    [float(logp[(c + sign * k) % 29]) for c in range(29) for k in range(29)],
                    dtype=np.float32)
                model = {"groupDigits": group_size, "digitStep": stride,
                         "reduction": reduction, "reverseSource": reversed_source,
                         "decodeSign": sign}
                print("MODEL", json.dumps(model), flush=True)
                for page_index in SECTION_STARTS:
                    cipher = pages[page_index]
                    hits = select_candidates(cipher, key_direction, stride, table)
                    best = max(hits, key=lambda v: v["wholePagePerRune"])
                    original[page_index].append({**model, **best,
                        "topByTrain": hits[0]["sourceIndex"],
                        "allTopHoldouts": [round(x["holdoutPerRune"], 5) for x in hits]})
                    scan_count += 1
                # Synthetic positive with hidden source at a known heldout index,
                # only test two independent distinct mode choices.
                if (group_size, stride, reduction, reversed_source, sign) in (
                    (2, 2, "scale", True, +1),
                    (5, 5, "mod", False, -1),
                ):
                    fake, repairs = construct_plant(plain, key_direction,
                        stride, PLANT_OFFSET, sign, rewrite=True)
                    hits = select_candidates(fake, key_direction, stride, table)
                    top = hits[0]
                    true_pos = score_full(fake, key_direction, stride, PLANT_OFFSET, table,
                                          0, len(fake))
                    rank = 1 + sum(h["trainPerRune"] > score_full(fake, key_direction,
                                stride, PLANT_OFFSET, table, 0, PREFIX_RUNES)
                                for h in hits)
                    assert top["sourceIndex"] == PLANT_OFFSET, (model, hits, PLANT_OFFSET)
                    assert true_pos == top["wholePagePerRune"]
                    controls.append({**model, "plantedSourceOffset": PLANT_OFFSET,
                        "topRecoveredOffset": top["sourceIndex"], "repairs": repairs,
                        "trueFullPageScore": true_pos,
                        "trueHoldoutPerRune": top["holdoutPerRune"],
                        "trainRank": rank})
                    print("PLANT_RECOVERED", json.dumps(controls[-1]), flush=True)
    assert scan_count == 8 * 40, scan_count
    assert len(controls) == 2
    bests = {str(p): sorted(values,key=lambda x:x["wholePagePerRune"],reverse=True)[:4]
             for p, values in original.items()}
    # Ranking of each model's selected candidates on a frozen independent
    # rune interval, rather than claiming a candidate from a high prefix alone.
    by_holdout = {str(p): sorted(values,key=lambda x:x["holdoutPerRune"],reverse=True)[:4]
                  for p,values in original.items()}
    output = {
        "objective": "Actual LP2 plaintext from the 1955 printed RAND random-digit table as a directly aligned additive GP29 running key",
        "scope": "Eight physical LP2 section-opening pages; all source offsets for each of 40 digit stream layouts; prefix 90-rune search with top 12 followed by complete-page and independent 90-rune holdout scores",
        "data": source,
        "gpSourceSHA256": hashlib.sha256(SRC_TEXT.encode()).hexdigest(),
        "cipherSHA256": hashlib.sha256((ROOT/"resources/lp2-transcription.txt").read_bytes()).hexdigest(),
        "samplePages": SECTION_STARTS,
        "trainRunes": PREFIX_RUNES,
        "sourceModels": scan_count,
        "scoredPrefixes": "Each mode examines every integer offset in its legal source range",
        "knownKeyControls": controls,
        "sourceReference": {"EnglishGPTrainSource": "first 240000 Shakespeare characters",
                            "EnglishGPHeldoutSource": "last 60000 Shakespeare characters",
                            "meanHeldoutEnglishGpLogLikelihood": float(np.dot(
                               np.bincount(english_heldout, minlength=29)/len(english_heldout),
                               logp)),
                            "uniformGpLogLikelihood": float(logp.mean())},
        "bestPerPageFull": bests,
        "bestPerPageHeldout": by_holdout,
        "status": "No actual plaintext unless a candidate has been independently re-encrypted and has sustained source-language evidence."
    }
    print("RESULT_JSON_BEGIN", flush=True)
    print(json.dumps(output, indent=2), flush=True)
    print("RESULT_JSON_END", flush=True)


if __name__ == "__main__":
    main()
