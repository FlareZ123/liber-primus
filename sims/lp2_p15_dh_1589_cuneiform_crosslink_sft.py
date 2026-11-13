#!/usr/bin/env python3
import json, math, re
from collections import Counter
from pathlib import Path

root = Path(".")
corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text())
ink = json.loads((root / "resources/liber-primus/lp2-ink-annotations.json").read_text())
control = (root / "resources/control/shakespeare_first300k.txt").read_text()

def page(n):
    return next(p for p in corpus["pages"] if p["page"] == n)["indices"]

def mod(n):
    return n % 29

def is_prime(n):
    return n > 1 and all(n % d for d in range(2, math.isqrt(n) + 1))

p, g, a, b = 3299, 7, 6, 15
assert is_prime(p)
assert all(pow(g, (p - 1) // q, p) != 1 for q in (2, 17, 97))
A, B = pow(g, a, p), pow(g, b, p)
shared = pow(A, b, p)
assert shared == pow(B, a, p) == pow(g, a * b, p) == 1589

base29 = [shared // (29 * 29), (shared // 29) % 29, shared % 29]
assert base29 == [1, 25, 23]
phase90 = [0] + [pow(g, a * b + i, p) % 29 for i in range(3298)]
assert len(phase90) == 3299 and phase90[:10] == [0, 23, 8, 12, 25, 8, 19, 24, 7, 19]

red_start = [0] * 58
for item in ink["pages"]:
    opening = next((span for span in item.get("red_spans", []) if span["start"] == 0), None)
    if opening:
        red_start[item["page"]] = opening["length"]
assert red_start[40] == 8 and red_start[54] == 9
floral = [r for item in corpus["pages"][40:56] for r in item["indices"][red_start[item["page"]]:]]
assert len(floral) == 3299
cuneiform = page(33)[91:] + sum((page(n) for n in range(34, 40)), [])
assert len(cuneiform) == 1589 and shared == len(cuneiform)
assert 1589 == 7 * 227 and is_prime(227)

translit = corpus["translit"]
tokens = sorted(translit, key=len, reverse=True)
translation = str.maketrans({"V": "U", "K": "C", "Z": "S", "Q": "C"})

def encode_english(text):
    out = []
    for word in re.findall(r"[A-Z]+", text.upper().translate(translation)):
        while word:
            token = next((t for t in tokens if word.startswith(t)), None)
            if token is None:
                word = word[1:]
            else:
                out.append(translit.index(token))
                word = word[len(token):]
    return out

training = encode_english(control[:200000])
bigrams = Counter(zip(training, training[1:]))
trigrams = Counter(zip(training, training[1:], training[2:]))
alpha = 0.1

def score(values):
    return sum(math.log((trigrams[(values[i-2], values[i-1], values[i])] + alpha) /
                        (bigrams[(values[i-2], values[i-1])] + alpha * 29))
               for i in range(2, len(values))) / (len(values) - 2)

def ioc(values):
    counts = Counter(values)
    return sum(n * (n - 1) for n in counts.values()) / (len(values) * (len(values) - 1))

def render(values):
    return "".join(translit[i] for i in values)

p57 = page(57)
keys = {
    "shared-base29-big-endian": base29,
    "shared-base29-little-endian": list(reversed(base29)),
    "DH-phase90-full-field": phase90,
}
targets = {"floral-body-3299": floral, "cuneiform-section-1589": cuneiform}
results = []
for target_name, ciphertext in targets.items():
    raw = {"length": len(ciphertext), "ioc": ioc(ciphertext), "trigram": score(ciphertext)}
    for key_name, key in keys.items():
        for sign in (-1, 1):
            decoded = [mod(c + sign * key[i % len(key)]) for i, c in enumerate(ciphertext)]
            plant = [p57[i % len(p57)] for i in range(len(ciphertext))]
            encrypted_plant = [mod(v - sign * key[i % len(key)]) for i, v in enumerate(plant)]
            recovered = [mod(v + sign * key[i % len(key)]) for i, v in enumerate(encrypted_plant)]
            assert recovered == plant
            results.append({
                "target": target_name, "key": key_name, "sign": sign,
                "keyLength": len(key), "positiveControlRoundTrip": True,
                "ioc": ioc(decoded), "trigram": score(decoded),
                "prefix": render(decoded[:96]),
                "middle": render(decoded[len(decoded)//2:len(decoded)//2+96]),
                "suffix": render(decoded[-96:])
            })

print(json.dumps({
    "hypothesis": "transfer the signed 2013 DH example's private exponents 6 and 15 into the candidate LP1-derived group p=3299,g=7",
    "group": {"p": p, "g": g, "privateExponents": [a, b], "publicValues": [A, B],
              "sharedSecret": shared, "base29DigitsBigEndian": base29,
              "phaseExponent": a * b, "phaseStreamPrefix": phase90[:10]},
    "crossLink": {"cuneiformSectionLength": len(cuneiform), "exactEquality": shared == len(cuneiform),
                  "factorization": "1589 = 7 * 227"},
    "targets": {name: {"length": len(values), "ioc": ioc(values), "trigram": score(values)}
                for name, values in targets.items()},
    "controls": {"p57Trigram": score(p57), "shakespeareTrigram": score(training[:50000])},
    "results": results
}, ensure_ascii=False, indent=2))
