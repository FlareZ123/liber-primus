"""Blind full-ordinal authentic p56 totient transfer onto original LP2 p55.

The p55 76-rune ciphertext is immediately adjacent to the authentically solved
p56 85-rune prime-totient ciphertext. Exhaust all 2,000,000 historical key starts
and exactly optimize latent literal-F pauses, using the previously pinned model.
Select with the first 58 original symbols and evaluate 18 untouched symbols.
A genuinely encrypted 76-rune source-native p57 positive is evaluated identically.
No page55 crib, decoded phrase, or unknown-page key is used in selection.
"""
import json
import math

import numpy as np

from rand1955_running_key import CORPUS, SRC_TEXT, encode
from prime_totient_long_offset_inversion import (
    EXAMPLE_TRUE, primes_to, solved_p56_regression,
)
from prime_totient_F_interrupt_viterbi import (
    N, KMAX, recover, value, traceback,
)


TRAIN = 58
WORD_LENGTHS = (1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3)
PLANTED_START = 123456
PLANTED_SKIP = 43


def page(page_number):
    return np.asarray(next(p["indices"] for p in CORPUS["pages"]
                           if p["page"] == page_number), dtype=np.uint8)


def flatten(indices):
    """Standard GP chart, without inventing Latin single-character offsets."""
    labels = CORPUS["translit"]
    return "".join(labels[int(x)] for x in indices)


def segmented(indices):
    out = []
    k = 0
    for n in WORD_LENGTHS:
        out.append(flatten(indices[k:k+n]))
        k += n
    assert k == len(indices) == 76
    return " ".join(out)


def ioc(values):
    hist = np.bincount(np.asarray(values, dtype=np.uint8), minlength=29)
    n = len(values)
    return float(hist @ (hist - 1)) / (n * (n-1))


def source_plant(plain, key, sign, source_start):
    plain = plain.copy()
    plain[PLANTED_SKIP] = 0
    enc = np.empty(len(plain), dtype=np.uint8)
    used = 0
    for i, v in enumerate(plain):
        if i == PLANTED_SKIP:
            enc[i] = 0
        else:
            enc[i] = (int(v) - sign * int(key[source_start+used])) % 29
            used += 1
    return plain, enc


def analyze(name, cipher, key, logp, sign):
    hits = recover(cipher, key, sign, logp, TRAIN)
    rows = []
    for h in hits:
        offset = h["sourceOffset"]
        decoded, skipped = traceback(cipher, key, sign, logp, offset)
        assert math.isclose(
            value(cipher, key, sign, logp, offset, len(cipher))/len(cipher),
            h["full"], rel_tol=0, abs_tol=2e-6,
        )
        rows.append({
            "primeStart":offset,
            "trainingLogPerRune":h["train"],
            "heldoutLogPerRune":h["holdout"],
            "fullLogPerRune":h["full"],
            "skippedLiteralFOffsets":skipped,
            "plainGPsymbols":decoded,
            "plainTranslit":flatten(decoded),
            "printWordShape":segmented(decoded),
            "plainIoC":ioc(decoded),
        })
    return {"source":name, "sign":sign, "trainRunes":TRAIN,
            "heldoutRunes":len(cipher)-TRAIN, "topPrefixCandidates":rows}


def main():
    original = page(55)
    assert len(original) == 76
    assert sum(WORD_LENGTHS) == 76
    assert len(page(56)) == 85 and len(page(57)) == 95
    primes = primes_to(N+500)
    solved = solved_p56_regression(primes)
    key = ((primes-1) % 29).astype(np.uint8)
    counts = np.bincount(encode(SRC_TEXT[:240000]), minlength=29)
    logp = np.log((counts+1)/(counts.sum()+29))
    p56 = page(56)
    known_p56, skips = traceback(p56, key, -1, logp, 0)
    assert known_p56 == encode(EXAMPLE_TRUE).tolist()
    assert skips == [56]
    print("CONTROL_P56", json.dumps({
        "solved":solved, "sourceStart":0, "literalF":skips,
        "fullLogPerRune":value(p56,key,-1,logp,0,85)/85,
    }), flush=True)

    source_plain, source_cipher = source_plant(page(57)[:76], key, -1, PLANTED_START)
    planted = analyze("AUTHENTIC_SOURCE_P57_ENCIPHERED",source_cipher,key,logp,-1)
    assert planted["topPrefixCandidates"][0]["primeStart"] == PLANTED_START, (
        "Native-GP plant not blind-rank1; report model power honestly", planted
    )
    assert planted["topPrefixCandidates"][0]["plainGPsymbols"] == source_plain.tolist(), (
        "Native-GP plant plaintext not fully recovered", planted
    )
    assert planted["topPrefixCandidates"][0]["skippedLiteralFOffsets"] == [PLANTED_SKIP], planted
    print("CONTROL_BLIND_PLANT",json.dumps({
        "sourceStart":PLANTED_START,
        "foundTop":planted["topPrefixCandidates"][0],
        "plantGP":flatten(source_plain),
    }),flush=True)

    original_results=[]
    for sign in (-1,1):
        result = analyze("ORIGINAL_UNSOLVED_LP2_P55",original,key,logp,sign)
        original_results.append(result)
        print("ORIGINAL_RESULT",json.dumps(result,ensure_ascii=False),flush=True)
    print("RESULT_SUMMARY",json.dumps({
        "source":"original p55 76 GP29 rune indices, page56 key and F bypass",
        "startsExaminedPerSign":N,"signs":[-1,1],"maxLiteralFPauses":KMAX,
        "trainingRunes":TRAIN,"heldoutRunes":18,
        "originalCipherIoC":ioc(original),
        "positiveNativeP57Recovered":True,
        "knownP56DecodedExactly":True,
        "top": [{"sign":r["sign"],"bestTrain":r["topPrefixCandidates"][0],
                 "bestHeldout":max(r["topPrefixCandidates"],key=lambda h:h["heldoutLogPerRune"]),
                 "bestFull":max(r["topPrefixCandidates"],key=lambda h:h["fullLogPerRune"])}
                for r in original_results],
        "scope":"Only direct GP29 additive key at starts <2m, two signs, <=9 F pauses; none of the print words are supplied as cribs.",
    },ensure_ascii=False),flush=True)


if __name__ == "__main__":
    main()
