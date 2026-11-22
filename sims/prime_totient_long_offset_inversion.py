"""Authentic page56 prime-totient key, with unknown-million-prime starts on LP2.

The 85 original page56 runes are exactly recovered by phi(p_i)=p_i-1
and the known source-literal-F exception. Apply this independently proved
key to every original unsolved page >=180 runes, allowing a completely free
initial prime-index start up to 2,000,000 and either sign/direction.

The initial fixed-key direct source hypotheses are tested here. A literal-F
unknown-skip Viterbi extension is a different hypothesis and is not tested.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np

from rand1955_running_key import (
    CORPUS, GP, PREFIX_RUNES, ROOT, SRC_TEXT,
    construct_plant, encode, score_full, select_candidates,
)

START_SEARCH = 2000000
SEED_POS = 123456
EXAMPLE_TRUE = (
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
    "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
)


def primes_to(n: int) -> np.ndarray:
    # The two-millionth ordinary prime is 32,452,843.
    boundary = 35_000_000
    mask = np.ones(boundary + 1, dtype=np.bool_)
    mask[:2] = False
    for p in range(2, math.isqrt(boundary) + 1):
        if mask[p]:
            mask[p * p::p] = False
    result = np.flatnonzero(mask)
    assert len(result) >= n, len(result)
    return result[:n]


def solved_p56_regression(primes: np.ndarray) -> dict:
    ciphertext = np.asarray(next(p["indices"] for p in CORPUS["pages"] if p["page"] == 56), dtype=np.uint8)
    plaintext = encode(EXAMPLE_TRUE)
    assert len(ciphertext) == len(plaintext) == 85
    literal_f = 56
    decoded = []
    source_index = 0
    for i, c in enumerate(ciphertext):
        if i == literal_f:
            assert int(c) == 0
            decoded.append(0)
        else:
            decoded.append((int(c) - (int(primes[source_index]) - 1)) % 29)
            source_index += 1
    assert decoded == plaintext.tolist(), "Authentic LP2 page 56 solution not reproduced"
    return {
        "source": "Original LP2 physical page56 85 runes (AN END)",
        "matchedOriginalRunePositions": 85,
        "knownLiteralFAtRuneOffset": literal_f,
        "consumedPrimeCount": source_index,
        "primeStartIndex": 0,
        "key": "one-based p_(i+1)-1, mapped mod29; minus sign",
    }


def main() -> None:
    primes = primes_to(START_SEARCH + 500)
    actual_regression = solved_p56_regression(primes)
    key = np.asarray((primes - 1) % 29, dtype=np.uint8)
    pages = {
        int(p["page"]): np.asarray(p["indices"], dtype=np.uint8)
        for p in CORPUS["pages"]
        if 0 <= p["page"] <= 55 and len(p["indices"]) >= 180
    }
    assert len(pages) == 47
    histogram = np.bincount(encode(SRC_TEXT[:240000]), minlength=29).astype(float)
    probabilities = (histogram + 1) / (histogram.sum() + 29)
    logp = np.log(probabilities)
    heldout_source = encode(SRC_TEXT[240000:])
    controlled_plaintext = heldout_source[:len(pages[0])]

    original = {p: [] for p in pages}
    control = []
    for reverse in (False, True):
        source = key[::-1].copy() if reverse else key
        for sign in (-1, +1):
            lut = np.asarray([float(logp[(c + sign * k) % 29])
                            for c in range(29) for k in range(29)], dtype=np.float32)
            for page in sorted(pages):
                ciphertext = pages[page]
                hits = select_candidates(ciphertext, source, 1, lut)
                top = sorted(hits, key=lambda hit: -hit["wholePagePerRune"])[0]
                original[page].append({
                    "sourceDirection": "reverse" if reverse else "forward",
                    "decodeSign": sign,
                    **top,
                    "topPrefixSourceOffset": hits[0]["sourceIndex"],
                })
            if (reverse, sign) in ((False, -1), (True, +1)):
                fake, repairs = construct_plant(controlled_plaintext,
                    source, 1, SEED_POS, sign, rewrite=True)
                hits = select_candidates(fake, source, 1, lut)
                assert hits[0]["sourceIndex"] == SEED_POS, (reverse, sign, hits)
                assert len(hits) == 12
                control.append({
                    "sourceDirection": "reverse" if reverse else "forward",
                    "decodeSign": sign, "trueSourcePrimeIndex": SEED_POS,
                    "recoveredRank": 1, "trueIndexRecovered": hits[0]["sourceIndex"],
                    "collisionRepairs": repairs,
                    "trueWholePageSourceScore": score_full(fake, source, 1,
                        SEED_POS, lut, 0, len(fake)),
                    "trueIndependentHoldoutSourceScore": score_full(fake, source, 1,
                        SEED_POS, lut, PREFIX_RUNES, PREFIX_RUNES * 2),
                })
                print("PLANT_RECOVERED", json.dumps(control[-1]), flush=True)
            print("MODEL_COMPLETED", json.dumps({
                "direction": "reverse" if reverse else "forward",
                "decodeSign": sign,
                "pages": len(pages),
                "sourcePrimeStarts": START_SEARCH,
            }), flush=True)

    bypage = {
        str(page): {
            "fullTop": sorted(rows, key=lambda v: -v["wholePagePerRune"])[:2],
            "heldoutTop": sorted(rows, key=lambda v: -v["holdoutPerRune"])[:2],
        }
        for page, rows in sorted(original.items())
    }
    fullglobal = sorted(
        [{**row, "originalPage": page}
         for page, rows in original.items() for row in rows],
        key=lambda row: -row["wholePagePerRune"])
    holdglobal = sorted(
        [{**row, "originalPage": page}
         for page, rows in original.items() for row in rows],
        key=lambda row: -row["holdoutPerRune"])

    output = {
        "hypothesis": "Original proven page56 phi-prime key extended with arbitrary start index among two million primes, both source readout directions and both additive signs.",
        "boundary": "No unknown F-mask, key skips or nonlinear alphabet; GP-English source register only, original non-rune punctuation removed.",
        "source": {
            "primesEnumerated": len(primes), "lastPrime": int(primes[-1]),
            "sourceSHA256": hashlib.sha256(primes.tobytes()).hexdigest(),
            "startOffsetsTestedPerModel": START_SEARCH,
        },
        "authenticSolvedPageRegression": actual_regression,
        "gpEnglishTraining": "First 240k Shakespeare source characters, the last 60k heldout",
        "sourceMatchedPlants": control,
        "originalRunePagesChecked": len(pages),
        "physicalPages": sorted(pages),
        "totalOriginalRunesChecked": int(sum(len(p) for p in pages.values())),
        "modelSourcePageCombinations": 4 * len(pages),
        "originalBestFull": fullglobal[:10],
        "originalBestHoldout": holdglobal[:10],
        "originalByPage": bypage,
        "interpretation": "No unknown LP2 text recovered unless an original candidate decodes a complete natural text and exactly reencrpyts the source."
    }
    print("RESULT_JSON_BEGIN", flush=True)
    print(json.dumps(output, indent=2), flush=True)
    print("RESULT_JSON_END", flush=True)


if __name__ == "__main__":
    main()
