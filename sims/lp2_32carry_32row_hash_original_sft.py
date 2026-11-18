#!/usr/bin/env python3
"""Original-input SFT: 32 LP2 page-carry words versus 32 eight-byte table rows.

Test whether a table row is the first/last 64 bits of a common unsalted
cryptographic digest of its source ciphertext word or an English plaintext word.
The latter uses the repository's pinned TextBlob word list. A real match would
be a strong word-level crib, not proof that the full manuscript is decrypted.
This experiment does not try arbitrary salts, hash offsets, or word anagrams.
Windows-compatible; Python 3.11+, standard library only.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
GRID = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json").read_text(encoding="utf-8"))
TRANSCRIPT = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
LEXICON = ROOT / "resources/control/english_wordfreq_textblob.txt"
RUNES = CORPUS["runes"]
TRANSLIT = CORPUS["translit"]
PRIMES = CORPUS["prime"]
RUNE_MAP = {r: i for i, r in enumerate(RUNES)}
TOKENS = sorted(enumerate(TRANSLIT), key=lambda pair: -len(pair[1]))
ALGORITHMS = ("md5", "sha1", "sha224", "sha256", "sha384", "sha512",
              "sha3_256", "sha3_512", "blake2b", "blake2s")
TABLE = GRID["bytes"]
assert len(TABLE) == 256
ROWS = [bytes(TABLE[i:i+8]) for i in range(0, 256, 8)]
assert len(ROWS) == 32


def source_carry_words() -> list[str]:
    """Parse genuine words, retaining runes across line and page breaks."""
    pages = TRANSCRIPT.split("%")[:55]
    assert len(pages) == 55
    words: list[tuple[str, int, int]] = []
    word = ""
    first = last = page = 0
    for ch in "%".join(pages):
        if ch in RUNE_MAP:
            if not word:
                first = page
            word += ch
            last = page
        elif ch == "%":
            page += 1
        elif ch == "/" or ch.isspace():
            continue
        elif word:
            words.append((word, first, last))
            word = ""
    if word:
        words.append((word, first, last))
    assert len(words) == 2896
    assert sum(len(w) for w, _, _ in words) == 12956
    carried = [word for word, a, b in words if a != b]
    assert len(carried) == 32
    return carried


def english_to_gp(word: str) -> list[int] | None:
    """Conventional GP transliteration for dictionary-word candidates."""
    src = (word.upper().replace("QU", "CW").replace("Q", "C")
           .replace("K", "C").replace("V", "U").replace("Z", "S")
           .replace("ING", "NG").replace("IO", "IA"))
    result: list[int] = []
    i = 0
    while i < len(src):
        for index, token in TOKENS:
            if src.startswith(token, i):
                result.append(index)
                i += len(token)
                break
        else:
            return None
    return result


def forms(word: str, original_runes: bool) -> dict[str, bytes]:
    if original_runes:
        indices = [RUNE_MAP[r] for r in word]
        transliterated = "".join(TRANSLIT[i] for i in indices)
        forms_dict = {
            "runes-utf8": word.encode("utf-8"),
            "translit-upper": transliterated.encode("ascii"),
            "translit-lower": transliterated.lower().encode("ascii"),
            "gp-indices": bytes(indices),
            "gp-primes": bytes(PRIMES[i] for i in indices),
            "decimal-indices": ",".join(map(str, indices)).encode("ascii"),
            "prime-sum": str(sum(PRIMES[i] for i in indices)).encode("ascii"),
        }
    else:
        indices = english_to_gp(word)
        if indices is None:
            return {}
        transliterated = "".join(TRANSLIT[i] for i in indices)
        glyphs = "".join(RUNES[i] for i in indices)
        forms_dict = {
            "word-upper": word.upper().encode("ascii"),
            "word-lower": word.lower().encode("ascii"),
            "gp-upper": transliterated.encode("ascii"),
            "gp-lower": transliterated.lower().encode("ascii"),
            "runes-utf8": glyphs.encode("utf-8"),
            "gp-indices": bytes(indices),
            "gp-primes": bytes(PRIMES[i] for i in indices),
        }
    return forms_dict


def fragments(payload: bytes):
    for algorithm in ALGORITHMS:
        digest = hashlib.new(algorithm, payload).digest()
        yield algorithm, "first8", digest[:8]
        yield algorithm, "last8", digest[-8:]


def evaluate() -> dict:
    carried = source_carry_words()
    original_hits: list[dict] = []
    for row, word in enumerate(carried):
        for fmt, payload in forms(word, original_runes=True).items():
            for algorithm, cut, fragment in fragments(payload):
                for orientation, idx in (("normal", row), ("row-reverse", 31-row)):
                    for byte_order, target in (("as-printed", ROWS[idx]), ("byte-reverse", ROWS[idx][::-1])):
                        if fragment == target:
                            original_hits.append(dict(row=row, word=word, fmt=fmt,
                                                      algorithm=algorithm, cut=cut,
                                                      orientation=orientation, byte_order=byte_order))

    # Any-row dictionary inversion is stronger than assuming alignment, but
    # a collision anywhere among 32 independent 64-bit rows remains tiny.
    targets: dict[bytes, list[tuple[int, str]]] = {}
    for i, row in enumerate(ROWS):
        targets.setdefault(row, []).append((i, "as-printed"))
        targets.setdefault(row[::-1], []).append((i, "byte-reverse"))

    lengths = {len(x) for x in carried}
    dictionary_words = 0
    candidate_encodings = 0
    plaintext_hits: list[dict] = []
    text = LEXICON.read_text(encoding="utf-8")
    for line in text.splitlines():
        if line.startswith(";;;"):
            continue
        fields = line.split()
        if not fields or re.fullmatch("[a-zA-Z]{2,22}", fields[0]) is None:
            continue
        word = fields[0].lower()
        gp = english_to_gp(word)
        if gp is None or len(gp) not in lengths:
            continue
        dictionary_words += 1
        for fmt, payload in forms(word, original_runes=False).items():
            candidate_encodings += 1
            for algorithm, cut, fragment in fragments(payload):
                for row, byte_order in targets.get(fragment, ()):
                    plaintext_hits.append(dict(row=row, word=word, fmt=fmt,
                                               algorithm=algorithm, cut=cut,
                                               byte_order=byte_order,
                                               word_rune_length=len(gp),
                                               matching_cipher_rune_length=len(carried[row])))

    # A non-ciphertext false positive control: a real SHA512 truncated hash
    # of an independently chosen English word must be found by the same
    # lexicon and encoding route.
    assert "pilgrim " in text
    assert english_to_gp("PILGRIM") is not None
    plant = hashlib.sha512(b"PILGRIM").digest()[:8]
    assert any(fragment == plant and algorithm == "sha512" and cut == "first8"
               for _, payload in forms("pilgrim", original_runes=False).items()
               for algorithm, cut, fragment in fragments(payload))
    assert len(plaintext_hits) == 0, "Actual dictionary preimage found; inspect immediately"
    assert len(original_hits) == 0, "Actual ciphertext preimage found; inspect immediately"
    return {
        "source": "LP2 55 rune-bearing original pages + 32x8 base60 grid",
        "carried_words": len(carried), "grid_rows": len(ROWS),
        "hash_algorithms": len(ALGORITHMS),
        "direct_word_formats": 7, "direct_matches": original_hits,
        "dictionary_candidates": dictionary_words,
        "dictionary_encodings": candidate_encodings,
        "dictionary_hashes": candidate_encodings * len(ALGORITHMS),
        "dictionary_matches": plaintext_hits,
        "positive_control": "SHA512(PILGRIM)[:8] matched source encoding",
        "conclusion": "No 64-bit leading/trailing standard unsalted digest in the tested carrier/English formats. No plaintext recovered.",
    }


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2))
