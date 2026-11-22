"""Original LP2 p55 lag-three difference: any hidden GP29 substitution, lexical gate.

Read-only single-file test. Requires cmudict==1.1.3 and the canonical LP2 resources.
"""

import hashlib
import json
import random
import re
from functools import lru_cache
from pathlib import Path

import cmudict

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
GP_COMPOUNDS = ("ING", "TH", "NG", "AE", "OE", "EA", "EO", "IA", "IO")
LENGTHS = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
EXPECTED_HASH = "9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f"


def pattern(items):
    ranks = {}
    return tuple(ranks.setdefault(item, len(ranks)) for item in items)


def matches_syllabified_word(spelling, wanted, start, normalize):
    if normalize:
        spelling = (spelling.replace("QU", "CW").replace("V", "U")
                    .replace("K", "C").replace("Z", "S"))

    total = start + len(wanted)

    @lru_cache(maxsize=None)
    def visit(position, count, groups):
        if count > total or count + len(spelling) - position < total:
            return False
        if count == total:
            return position == len(spelling)
        if position == len(spelling):
            return count == total
        choices = [(spelling[position], 1)]
        choices += [(compound, len(compound)) for compound in GP_COMPOUNDS
                    if spelling.startswith(compound, position)]
        for token, consumed in choices:
            new_groups = groups
            if count >= start:
                if token in groups:
                    rank = groups.index(token)
                else:
                    rank = len(groups)
                    new_groups = groups + (token,)
                if rank != wanted[count - start]:
                    continue
            if visit(position + consumed, count + 1, new_groups):
                return True
        return False

    return visit(0, 0, ())


def recover_original():
    corpus = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
    page = next(page for page in corpus["pages"] if page["page"] == 55)
    ciphertext = page["indices"]
    assert len(ciphertext) == 76
    assert hashlib.sha256(bytes(ciphertext)).hexdigest() == EXPECTED_HASH
    alphabet = {symbol: i for i, symbol in enumerate(corpus["runes"])}
    # The source transcription omits runeless physical p50; p55 is section 54.
    transcription = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf-8")
    text = transcription.split("%")[54]
    words = []
    current = []
    for character in text:
        if character in alphabet:
            current.append(alphabet[character])
        elif character in "-.":
            if current:
                words.append(current)
                current = []
    if current:
        words.append(current)
    assert [len(word) for word in words] == LENGTHS
    assert [item for word in words for item in word] == ciphertext
    return ciphertext, corpus["translit"]


def main():
    assert cmudict.__version__ == "1.1.3"
    ciphertext, alphabet = recover_original()
    prefix = sum(LENGTHS[:7])
    assert prefix == 23 and LENGTHS[7] == 13
    original_word = ciphertext[prefix:prefix + 13]
    whole = [(ciphertext[i] - ciphertext[i - 3]) % 29
             for i in range(prefix, prefix + 13)]
    inner = [(ciphertext[i] - ciphertext[i - 3]) % 29
             for i in range(prefix + 3, prefix + 13)]
    whole_pattern = pattern(whole)
    inner_pattern = pattern(inner)
    assert whole_pattern == (0, 1, 2, 3, 4, 5, 0, 6, 7, 8, 0, 8, 9)
    assert inner_pattern == (0, 1, 2, 3, 4, 5, 6, 3, 6, 7)

    words = sorted({w.upper() for w in cmudict.words() if re.fullmatch("[A-Za-z]+", w)})
    assert len(words) == 117493
    candidates = [w for w in words if 13 <= len(w) <= 28]
    counts = {}
    for mode in ("global", "word-local"):
        wanted = whole_pattern if mode == "global" else inner_pattern
        start = 0 if mode == "global" else 3
        for folding in (False, True):
            matches = [w for w in candidates
                       if matches_syllabified_word(w, wanted, start, folding)]
            counts[(mode, folding)] = len(matches)
            assert not matches, (mode, folding, matches[:12])

    # Independent, already pinned word registers; no new downloaded vocabulary.
    control = ROOT / "resources" / "control"
    textblob = sorted({line.split()[0].upper()
                       for line in (control / "english_wordfreq_textblob.txt").read_text(encoding="utf-8").splitlines()
                       if line and not line.startswith(";") and re.fullmatch("[A-Za-z]+", line.split()[0])})
    latin26 = sorted(set(re.findall("[A-Z]+", " ".join(
        line for line in (control / "latin-vulgate-latin26-wholewords.txt").read_text(encoding="utf-8").splitlines()
        if not line.startswith("#")))))
    latin_gp = sorted({line for line in
                       (control / "latin-vulgate-gp-wholewords.txt").read_text(encoding="utf-8").splitlines()
                       if re.fullmatch("[0-9A-S]+", line)})
    assert (len(textblob), len(latin26), len(latin_gp)) == (29157, 7309, 7305)
    registers = (("TextBlob", textblob), ("Latin26", latin26))
    control_counts = {}
    for name, register in registers:
        candidates = [w for w in register if 13 <= len(w) <= 28]
        for mode in ("global", "word-local"):
            wanted = whole_pattern if mode == "global" else inner_pattern
            start = 0 if mode == "global" else 3
            matches = [w for w in candidates if
                       matches_syllabified_word(w, wanted, start, False) or
                       matches_syllabified_word(w, wanted, start, True)]
            control_counts[(name, mode)] = len(matches)
            assert not matches, (name, mode, matches[:12])
    for mode in ("global", "word-local"):
        wanted = whole_pattern if mode == "global" else inner_pattern
        start = 0 if mode == "global" else 3
        matches = [w for w in latin_gp if
                   len(w) == 13 and pattern(w[start:]) == wanted]
        control_counts[("LatinGP", mode)] = len(matches)
        assert not matches, (mode, matches[:12])

    # Actual native-English dictionary-word positive with a hidden permutation.
    plaintext = "DETERMINATION"
    assert plaintext in words and len(plaintext) == 13
    encoded_plain = [alphabet.index(letter) for letter in plaintext]
    permutation = list(range(29))
    random.Random(3301).shuffle(permutation)
    iv = [5, 11, 17]
    planted_cipher = []
    for j, p in enumerate(encoded_plain):
        prior = iv[j] if j < 3 else planted_cipher[j - 3]
        planted_cipher.append((prior + permutation[p]) % 29)
    recovered_steps = [(planted_cipher[j] - (iv[j] if j < 3 else planted_cipher[j - 3])) % 29
                       for j in range(13)]
    assert all(recovered_steps[j] == permutation[encoded_plain[j]] for j in range(13))
    assert matches_syllabified_word(plaintext, pattern(recovered_steps), 0, False)
    assert matches_syllabified_word(plaintext, pattern(recovered_steps[3:]), 3, False)

    print("Source: LP2 p55, 76 unchanged GP29 ciphertext runes; word lengths", LENGTHS)
    print("Thirteen-rune word: zero-based p55 offsets 23..35; source GP", original_word)
    print("Global lag3 differences:", whole, "pattern", whole_pattern)
    print("Word-local lag3 suffix:", inner, "pattern", inner_pattern)
    print("CMUdict 1.1.3 alphabetic words:", len(words), "length-eligible:", len(candidates))
    print("CMU matches under any bijective GP29 alphabet:", counts)
    print("Independent TextBlob/Latin registers:", control_counts)
    print("Planted 13-rune English word:", plaintext, "exact recovery: 13/13")
    print("Decision: no CMUdict-native p55 lag3 + secret substitution word under either reset.")


if __name__ == "__main__":
    main()
