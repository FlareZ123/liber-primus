"""Lexical gate for the 325 full-length affine φ(prime) original-cipher survivors.

Reads the log from lp2_p56_phi_affine50k_ftransparent_firstfour_sft.cpp.
Uses exactly the repository original p0..p3 indices and printed word boundaries.
Each survivor's *every* plaintext-F bypass is optimized by exact Viterbi DP.
The criterion maximizes dictionary word hits, then spelling-log-frequency score.
TextBlob provides a fixed native-English spelling reference (~29k GP words).
No guesses about unknown plaintext, no injected text or model-generated prose.

This is a research reproduction utility; it does not assert any LP2 decryption.
"""
from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from pathlib import Path
import textblob

ROOT = Path(__file__).resolve().parent.parent
GP = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
CIPHER = [x for page in GP["pages"][:4] for x in page["indices"]]
RUNES = set(GP["runes"])
SOURCE = "".join((ROOT / "resources/liber-primus/lp2-transcription.txt")
                 .read_text(encoding="utf-8").split("%")[:4])
SYMBOLS = sorted(((s, i) for i, s in enumerate(GP["translit"])),
                 key=lambda item: -len(item[0]))


def rune_encode(word: str) -> tuple[int, ...]:
    word = (word.upper().replace("QU", "CW").replace("V", "U")
            .replace("K", "C").replace("Z", "S").replace("Q", "C"))
    out = []
    i = 0
    while i < len(word):
        symbol, index = next((t for t in SYMBOLS if word.startswith(t[0], i)))
        out.append(index)
        i += len(symbol)
    return tuple(out)


def source_boundaries() -> list[int]:
    boundaries = []
    runes = 0
    for char in SOURCE:
        if char in RUNES:
            runes += 1
        elif char in "-.$&" and runes > 0 and (
            not boundaries or boundaries[-1] != runes
        ):
            boundaries.append(runes)
    if boundaries[-1] != runes:
        boundaries.append(runes)
    assert runes == len(CIPHER) == 946
    assert len(boundaries) == 202
    assert boundaries[-1] == 946
    return boundaries


def first_prime_totients(count: int) -> list[int]:
    sieve = bytearray(1_000_000)
    keys = []
    for prime in range(2, len(sieve)):
        if sieve[prime]:
            continue
        keys.append((prime - 1) % 29)
        if len(keys) == count:
            break
        if prime * prime < len(sieve):
            sieve[prime * prime::prime] = b"\x01" * len(sieve[prime * prime::prime])
    assert len(keys) == count
    return keys


def textblob_dictionary() -> Counter[tuple[int, ...]]:
    lexicon = Path(textblob.__file__).resolve().parent / "en" / "en-spelling.txt"
    result: Counter[tuple[int, ...]] = Counter()
    for line in lexicon.read_text(encoding="utf-8").splitlines():
        fields = line.split()
        if len(fields) == 2 and fields[0].isalpha() and fields[1].isdigit():
            result[rune_encode(fields[0])] += int(fields[1])
    assert len(result) == 29062
    return result


def candidate_paths(
    cipher: list[int],
    ends: list[int],
    key: list[int],
    dictionary: Counter[tuple[int, ...]],
    multiplier: int,
    additive: int,
    phase: int,
) -> tuple[float, int, int, tuple[tuple[int, ...], ...]]:
    # Each state is the exact number of literal F bypasses, sufficient to
    # determine every future key pointer. Keep the best lexical path at each
    # state, retaining all legal histories where they can change future score.
    states: dict[int, tuple[float, int, tuple[tuple[int, ...], ...]]] = {
        0: (0.0, 0, ())
    }
    begin = 0
    for end in ends:
        next_states = {}
        for skipped, (score, hits, prior) in states.items():
            paths = [(skipped, ())]
            for i in range(begin, end):
                next_paths = []
                for bypasses, decoded_word in paths:
                    key_at = (additive + multiplier * key[phase + i - bypasses]) % 29
                    plain = (cipher[i] - key_at) % 29
                    if plain != 0:
                        next_paths.append((bypasses, decoded_word + (plain,)))
                    if cipher[i] == 0:
                        next_paths.append((bypasses + 1, decoded_word + (0,)))
                paths = next_paths
            for bypasses, decoded_word in paths:
                n = dictionary.get(decoded_word, 0)
                wordscore = math.log1p(n) if n else -8.0
                row = (score + wordscore, hits + (1 if n else 0),
                       prior + (decoded_word,))
                if bypasses not in next_states or (row[1], row[0]) > (
                    next_states[bypasses][1], next_states[bypasses][0]
                ):
                    next_states[bypasses] = row
        assert next_states, ("C++ legal positive unexpectedly impossible", multiplier,
                             additive, phase, begin)
        states = next_states
        begin = end
    best_bypasses, (score, hits, words) = max(
        states.items(), key=lambda item: (item[1][1], item[1][0])
    )
    assert len(words) == len(ends) == 202
    assert sum(map(len, words)) == len(cipher) == 946
    return score, hits, best_bypasses, words


def main(log_path: Path) -> None:
    original = CIPHER
    boundaries = source_boundaries()
    key = first_prime_totients(50_000 + len(original))
    dictionary = textblob_dictionary()
    known_plain = (
        "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
        "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
    )
    known_words = [rune_encode(w) for w in known_plain.split()]
    assert len(known_words) == 25
    assert sum(word in dictionary for word in known_words) == 24
    source_cipher = GP["pages"][56]["indices"]
    source_clear = [r for word in known_words for r in word]
    j = 0
    actual = []
    for plain in source_clear:
        if plain == 0:
            actual.append(0)
        else:
            actual.append((plain + key[j]) % 29)
            j += 1
    assert j == 84 and actual == source_cipher

    text = log_path.read_text(encoding="utf-8")
    assert "PASS p56=85/85 source=946 nmodels=40600000" in text
    candidates = [tuple(map(int, m.groups())) for m in re.finditer(
        r"CANDIDATE m=(\d+) b=(\d+) phase=(\d+)", text
    )]
    assert len(candidates) == 325
    results = []
    for multiplier, additive, phase in candidates:
        score, hits, bypasses, words = candidate_paths(
            original, boundaries, key, dictionary, multiplier, additive, phase
        )
        results.append((score, hits, multiplier, additive, phase, bypasses, words))
    results.sort(key=lambda row: (row[1], row[0]), reverse=True)
    assert max(row[1] for row in results) == 23
    assert results[0][2:5] == (5, 5, 2464)
    print(json.dumps({
        "source": "resources/liber-primus/lp2-corpus.json",
        "runes": 946, "words": 202, "candidateAffineModels": 40_600_000,
        "fullMathematicallyLegalInverses": len(results),
        "nativeSolvedP56DictionaryHits": "24/25",
        "bestOriginalDictionaryHits": f"{results[0][1]}/202",
        "best10": [{
            "multiplier": row[2], "additive": row[3], "primeStartOrdinal": row[4],
            "score": round(row[0], 3), "nativeDictionaryHits": row[1],
            "plaintextFirst24Words": " ".join(
                "".join(GP["translit"][i] for i in w) for w in row[6][:24]
            )
        } for row in results[:10]],
        "decision": "No intelligible original plaintext or source-selected key recovered."
    }, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("scan_log", type=Path, help="stdout from the companion C++ scan")
    args = parser.parse_args()
    main(args.scan_log)
