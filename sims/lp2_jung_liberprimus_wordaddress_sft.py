"""Direct GP29 printed-word numeral to Jung Liber Primus lexical address.

Historical source hypotheses are explicit and independent:
- GP29 is a genuine Cicada numeral alphabet.
- The 2016 signed clue treats the book's words and numbers as a map.
- Jung's Liber Primus is a possible but unauthenticated same-title donor.
The proposed consumer reads one first letter of a donor word per complete
encrypted LP2 word. No offset, alphabet permutation or plaintext crib is fit.
Windows Python 3.12; manually dispatched; no original PDF redistributed.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
from math import log
from pathlib import Path
from random import Random
from urllib.request import Request, urlopen
import json
import re
import unicodedata

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PDF_URL = "https://logoilibrary.com/wp-content/uploads/2023/11/The-Red-Book-Jung.pdf"
PDF_SHA = "5cbb32a6a6033399c8692ac9aaeb148e02a1a0734f4d7a31a90453fbc6073359"
# Original 29-character rune order and ordinal-prime weights.
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
TRANSCRIPTION = ROOT / "resources" / "liber-primus" / "lp2-transcription.txt"
ANCHORS = ("LIBER", "PRIMUS", "DIVINITY", "CIRCUMFERENCE",
           "INSTAR", "TUNNEL", "PARABLE", "EMERGE", "ENLIGHTENMENT")


def original_words() -> tuple[list[tuple[int, ...]], dict]:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    rune_to_index = {glyph: i for i, glyph in enumerate(corpus["runes"])}
    source = "%".join(TRANSCRIPTION.read_text(encoding="utf-8").split("%")[:55])
    words: list[tuple[int, ...]] = []
    current: list[int] = []
    all_symbols = 0
    for symbol in source:
        if symbol in rune_to_index:
            current.append(rune_to_index[symbol])
            all_symbols += 1
        elif symbol in "/%\r\n \t":
            continue
        elif current:
            words.append(tuple(current))
            current = []
    if current:
        words.append(tuple(current))
    assert len(words) == 2896, len(words)
    assert all_symbols == 12956, all_symbols
    assert [x for w in words for x in w] == [
        x for p in corpus["pages"] if 0 <= p["page"] <= 55
        for x in p["indices"]
    ], "word parser must preserve every native original rune"
    return words, corpus


def download_source() -> tuple[bytes, list[str], str]:
    req = Request(PDF_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=100) as response:
        data = response.read(50_000_000)
    digest = sha256(data).hexdigest()
    assert digest == PDF_SHA, f"donor PDF changed; hash={digest}"
    with pymupdf.open(stream=data, filetype="pdf") as pdf:
        assert len(pdf) == 545, len(pdf)
        raw = "\n".join(page.get_text("text") for page in pdf)
    raw = unicodedata.normalize("NFKD", raw)
    donor = re.findall(r"[A-Za-z]+", raw)
    assert len(donor) == 228597, len(donor)
    return data, donor, raw


def address(w: tuple[int, ...], radix: int, primes: list[int], modulus: int) -> int:
    if radix == 29:
        acc = 0
        for d in w:
            acc = (29 * acc + d) % modulus
        return acc
    if radix == 0:  # Source-authentic GP prime-weight summation.
        return sum(primes[d] for d in w) % modulus
    raise ValueError(radix)


def source_readout(words: list[tuple[int, ...]], donor: list[str],
                   primes: list[int], radix: int) -> str:
    n = len(donor)
    return "".join(donor[address(w, radix, primes, n)][0].upper() for w in words)


def trigram_model(text: str) -> dict[str, float]:
    data = "".join(re.findall(r"[A-Z]", text.upper()))
    counts = Counter(data[i:i + 3] for i in range(len(data) - 2))
    denominator = sum(counts.values()) + 0.1 * 26 ** 3
    default = log(0.1 / denominator)
    return {key: log((value + 0.1) / denominator) - default
            for key, value in counts.items()}


def score(text: str, model: dict[str, float]) -> float:
    # The omitted default log-probability is a common constant for all rows.
    return sum(model.get(text[i:i + 3], 0)
               for i in range(len(text) - 2)) / max(1, len(text) - 2)


def encode_address(position: int, width: int) -> tuple[int, ...]:
    digits = [0] * width
    for j in range(width - 1, -1, -1):
        position, digits[j] = divmod(position, 29)
    assert position == 0
    return tuple(digits)


def plant(donor: list[str], words: list[tuple[int, ...]], primes: list[int]) -> None:
    target = "LIBERPRIMUSISOURMAP"
    indices = {c: next(i for i, w in enumerate(donor) if w[0].upper() == c)
               for c in set(target)}
    eligible = [i for i, w in enumerate(words) if len(w) >= 5][:len(target)]
    original = words[:]
    for at, char in zip(eligible, target):
        original[at] = encode_address(indices[char], len(original[at]))
    rebuilt = source_readout(original, donor, primes, 29)
    assert "".join(rebuilt[i] for i in eligible) == target
    assert sum(len(w) for w in original) == 12956
    assert address((0, 1), 29, primes, len(donor)) == 1
    assert address((0, 1), 0, primes, len(donor)) == 5
    print("PLANTED 19-character donor-word-address exact recovery PASS")


def main() -> None:
    words, corpus = original_words()
    pdf, donor, raw = download_source()
    primes = corpus["prime"]
    assert len(primes) == 29
    plant(donor, words, primes)
    model = trigram_model(raw)
    rng = Random(0x3301A349)
    reports = []
    for radix, name in ((29, "whole-word-base29"), (0, "word-prime-sum")):
        actual = source_readout(words, donor, primes, radix)
        actual_score = score(actual, model)
        shuffled_scores = []
        for _ in range(200):
            shuffled = list(actual)
            rng.shuffle(shuffled)
            shuffled_scores.append(score("".join(shuffled), model))
        named_hits = [{"phrase": token, "positions": [
            j for j in range(len(actual) - len(token) + 1)
            if actual.startswith(token, j)
        ]} for token in ANCHORS if token in actual]
        p_tail = (1 + sum(x >= actual_score for x in shuffled_scores)) / 201
        reports.append({
            "consumer": name,
            "letters": len(actual),
            "first_140": actual[:140],
            "trigram_gain_per_letter": round(actual_score, 6),
            "shuffle_null_range": [round(min(shuffled_scores), 6),
                                   round(max(shuffled_scores), 6)],
            "empirical_upper_tail": round(p_tail, 6),
            "predeclared_source_clue_phrase_hits": named_hits,
        })
    print("ORIGINAL", json.dumps({
        "source_pdf_sha256": sha256(pdf).hexdigest(),
        "source_words": len(donor),
        "original_GP29_runes": 12956,
        "original_complete_words": len(words),
        "source_offset_selection": "none; complete extracted reader's-edition text",
        "reading_rule": "zero-based LP2 word numeral modulo donor word count; donor first letter",
        "hypothesis_warning": "same book title alone does not authenticate Jung or the address rule",
        "readouts": reports,
    }, separators=(",", ":")))


if __name__ == "__main__":
    main()
