#!/usr/bin/env python3
import json, math, re
from collections import Counter
from pathlib import Path

root = Path(".")
corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text())
control_text = (root / "resources/control/shakespeare_first300k.txt").read_text()

def page(n):
    match = next(p for p in corpus["pages"] if p["page"] == n)
    return match["indices"]

def mod(n):
    return n % 29

def is_prime(n):
    return n > 1 and all(n % d for d in range(2, math.isqrt(n) + 1))

primes = [n for n in range(2, 3302) if is_prime(n)]
assert len(primes) == 464 and primes[173] == 1033 and primes[463] == 3301
selected = [p for p in primes if 1033 < p <= 3301]
assert len(selected) == 290 and selected[0] == 1039 and selected[-1] == 3301
prime_key = [mod(p) for p in selected]
phi_key = [mod(p - 1) for p in selected]

page_lengths = [len(page(n)) for n in range(33, 40)]
blocks = [len(page(33)) - 91, len(page(34)),
          len(page(35)) + len(page(36)) + len(page(37)),
          len(page(38)), len(page(39))]
offsets, cursor = [], 0
for length in blocks[:4]:
    cursor += length
    offsets.append(cursor)
assert page_lengths == [214, 261, 271, 238, 228, 228, 240]
assert blocks == [123, 261, 737, 228, 240]
assert offsets == [123, 384, 1121, 1349]
section = page(33)[91:] + sum((page(n) for n in range(34, 40)), [])
assert len(section) == 1589 and len(section) == 5 * 290 + 139
p57 = page(57)

translit = corpus["translit"]
tokens = sorted(translit, key=len, reverse=True)
translation = str.maketrans({"V": "U", "K": "C", "Z": "S", "Q": "C"})

def encode_english(text):
    text = text.upper().translate(translation)
    out = []
    for word in re.findall(r"[A-Z]+", text):
        while word:
            token = next((t for t in tokens if word.startswith(t)), None)
            if token is None:
                word = word[1:]
            else:
                out.append(translit.index(token))
                word = word[len(token):]
    return out

training = encode_english(control_text[:200000])
bigrams = Counter(zip(training, training[1:]))
trigrams = Counter(zip(training, training[1:], training[2:]))
alpha = 0.1

def trigram_score(symbols):
    return sum(math.log((trigrams[(symbols[i-2], symbols[i-1], symbols[i])] + alpha) /
                        (bigrams[(symbols[i-2], symbols[i-1])] + alpha * 29))
               for i in range(2, len(symbols))) / (len(symbols) - 2)

def ioc(symbols):
    counts = Counter(symbols)
    return sum(n * (n - 1) for n in counts.values()) / (len(symbols) * (len(symbols) - 1))

def render(symbols):
    return "".join(translit[i] for i in symbols)

def inverse(a):
    return pow(a, -1, 29)

variants = [
    ("prime-add-minus", lambda c, i: mod(c - prime_key[i % 290]), lambda p, i: mod(p + prime_key[i % 290])),
    ("prime-add-plus", lambda c, i: mod(c + prime_key[i % 290]), lambda p, i: mod(p - prime_key[i % 290])),
    ("totient-add-minus", lambda c, i: mod(c - phi_key[i % 290]), lambda p, i: mod(p + phi_key[i % 290])),
    ("totient-add-plus", lambda c, i: mod(c + phi_key[i % 290]), lambda p, i: mod(p - phi_key[i % 290])),
    ("prime-multiplicative-inverse", lambda c, i: mod(c * inverse(prime_key[i % 290])), lambda p, i: mod(p * prime_key[i % 290])),
    ("prime-totient-affine-inverse", lambda c, i: mod((c - phi_key[i % 290]) * inverse(prime_key[i % 290])),
     lambda p, i: mod(p * prime_key[i % 290] + phi_key[i % 290])),
]

plant = [p57[i % len(p57)] for i in range(len(section))]
candidates = []
for name, decode, encode in variants:
    encrypted = [encode(p, i) for i, p in enumerate(plant)]
    recovered = [decode(c, i) for i, c in enumerate(encrypted)]
    assert recovered == plant, name + " positive-control roundtrip"
    decoded = [decode(c, i) for i, c in enumerate(section)]
    candidates.append({
        "name": name, "roundTrip": True, "ioc": ioc(decoded), "trigram": trigram_score(decoded),
        "prefix": render(decoded[:96]), "middle": render(decoded[746:842]), "suffix": render(decoded[-96:])
    })

result = {
    "selection": {
        "primeCountThrough3301": len(primes), "prime1033Ordinal": 174, "prime3301Ordinal": 464,
        "selectedPrimeCount": len(selected), "selectedPrimeEndpoints": [selected[0], selected[-1]],
        "periodFactorization": "290 = 10 * 29",
        "zeroPrimeMultipliers": sum(x == 0 for x in prime_key),
        "zeroTotientMultipliers": sum(x == 0 for x in phi_key)
    },
    "target": {
        "pageLengths33to39": page_lengths, "blockLengths": blocks, "motifOffsets": offsets,
        "start": "physical LP2 p33, zero-based rune offset 91",
        "end": "physical LP2 p39, after final rune",
        "runeCount": len(section), "periodRemainder": len(section) % 290
    },
    "controls": {
        "trainingRunes": len(training), "shakespeareScore": trigram_score(training[:50000]),
        "solvedP57Score": trigram_score(p57),
        "rawSection": {"ioc": ioc(section), "trigram": trigram_score(section)}
    },
    "candidates": candidates
}
print(json.dumps(result, ensure_ascii=False, indent=2))
